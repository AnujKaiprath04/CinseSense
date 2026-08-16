import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { fetchDemoUsers, createNewUser } from '../api/client';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  isLoggedIn: boolean;
  selectUser: (userId: number) => void;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  addUser: (username: string, email: string) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = () => {
    return fetchDemoUsers().then((data) => {
      setUsers(data);
      const savedId = localStorage.getItem('cinesense_user_id');
      const savedAuth = localStorage.getItem('cinesense_is_logged_in');

      if (savedId && savedAuth === 'true') {
        const found = data.find((u) => u.id === Number(savedId));
        if (found) {
          setCurrentUser(found);
          setIsLoggedIn(true);
          return data;
        }
      }

      // Default state: not logged in until explicit authentication
      if (data.length > 0) {
        setCurrentUser(data[0]);
      }
      setIsLoggedIn(false);
      return data;
    });
  };

  useEffect(() => {
    loadUsers().catch(console.error).finally(() => setIsLoading(false));
  }, []);

  const selectUser = (userId: number) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      setIsLoggedIn(true);
      localStorage.setItem('cinesense_user_id', String(userId));
      localStorage.setItem('cinesense_is_logged_in', 'true');
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('cinesense_is_logged_in');
  };

  const addUser = async (username: string, email: string): Promise<User> => {
    const newUser = await createNewUser(username, email);
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsLoggedIn(true);
    localStorage.setItem('cinesense_user_id', String(newUser.id));
    localStorage.setItem('cinesense_is_logged_in', 'true');
    return newUser;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        isLoggedIn,
        selectUser,
        setUsers,
        addUser,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
