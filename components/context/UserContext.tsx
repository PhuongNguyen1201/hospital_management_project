"use client"
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { UserInfoType } from '@/types';

interface UserContextType {
  currentUser: UserInfoType | null;
  setCurrentUser: (user: UserInfoType | null) => void;  // Để hàm setCurrentUser cập nhật user
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children, currentUser }: { children: ReactNode, currentUser: UserInfoType | null }) => {
  const [user, setUser] = useState<UserInfoType | null>(currentUser); // Lưu trữ currentUser trong state

  // Hàm này sẽ cập nhật currentUser khi cần thiết
  const setCurrentUser = (user: UserInfoType | null) => {
    setUser(user); // Cập nhật state user
  };

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser); // Cập nhật giá trị khi currentUser thay đổi
    }
  }, [currentUser]);

  return (
    <UserContext.Provider value={{ currentUser: user, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
