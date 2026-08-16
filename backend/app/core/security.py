import hashlib
import os
import secrets
import time
import base64
import json
import hmac
import re
from typing import Dict, Tuple, Optional

# Secret key for HMAC SHA-256 JWT signing
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "cinesense_production_secret_key_9837429182374981")
TOKEN_EXPIRE_SECONDS = 86400 * 7  # 7 days

def hash_password(password: str) -> str:
    """Hash password using PBKDF2 HMAC SHA-256 with random 16-byte salt."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return f"{salt}${key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against stored salt$hash string using constant-time comparison."""
    if not hashed_password or '$' not in hashed_password:
        return False
    try:
        salt, stored_hash = hashed_password.split('$', 1)
        key = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        )
        return secrets.compare_digest(key.hex(), stored_hash)
    except Exception:
        return False

# Base64URL encoding/decoding helper for standard JWTs
def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

def _b64url_decode(data_str: str) -> bytes:
    padding = '=' * (4 - (len(data_str) % 4))
    return base64.urlsafe_b64decode(data_str + padding)

def create_jwt_token(user_id: int, username: str) -> str:
    """Create a signed JWT token with user payload and expiration timestamp."""
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "user_id": user_id,
        "sub": username,
        "exp": int(time.time()) + TOKEN_EXPIRE_SECONDS,
        "iat": int(time.time())
    }

    header_b64 = _b64url_encode(json.dumps(header).encode('utf-8'))
    payload_b64 = _b64url_encode(json.dumps(payload).encode('utf-8'))
    signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')

    signature = hmac.new(SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
    sig_b64 = _b64url_encode(signature)

    return f"{header_b64}.{payload_b64}.{sig_b64}"

def verify_jwt_token(token: str) -> Optional[Dict]:
    """Verify signature and expiration of JWT token."""
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None

        header_b64, payload_b64, sig_b64 = parts
        signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')

        expected_sig = hmac.new(SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
        provided_sig = _b64url_decode(sig_b64)

        if not secrets.compare_digest(expected_sig, provided_sig):
            return None

        payload = json.loads(_b64url_decode(payload_b64).decode('utf-8'))
        if payload.get("exp", 0) < time.time():
            return None

        return payload
    except Exception:
        return None

def sanitize_input(input_str: str) -> str:
    """Sanitize input string against XSS and HTML injection."""
    if not input_str:
        return ""
    # Strip HTML tags
    clean = re.sub(r'<[^>]*>', '', str(input_str))
    # Replace dangerous characters
    clean = clean.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;').replace("'", '&#x27;')
    return clean.strip()

class RateLimiter:
    """In-memory sliding window rate limiter for brute-force attack prevention."""

    def __init__(self, max_requests: int = 60, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, list] = {}

    def is_allowed(self, client_ip: str) -> Tuple[bool, int]:
        now = time.time()
        window_start = now - self.window_seconds

        if client_ip not in self.requests:
            self.requests[client_ip] = []

        # Filter out expired requests
        self.requests[client_ip] = [t for t in self.requests[client_ip] if t > window_start]

        if len(self.requests[client_ip]) >= self.max_requests:
            retry_after = int(self.window_seconds - (now - self.requests[client_ip][0]))
            return False, max(1, retry_after)

        self.requests[client_ip].append(now)
        return True, 0

rate_limiter = RateLimiter(max_requests=100, window_seconds=60)
