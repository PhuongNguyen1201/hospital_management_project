// app/components/ClientLayout.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useUser } from '@/components/context/UserContext'; // Import useUser hook
import Spinner from '@/components/Spinner'; // Import spinner component
import { usePathname } from 'next/navigation';

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useUser(); // Access user from context
  const [loading, setLoading] = useState(true);
  const pathname = usePathname(); // Dùng hook này để lấy đường dẫn hiện tại

  useEffect(() => {
    if (currentUser) {
      setLoading(false); // Đã có thông tin người dùng, tắt loading
    }
  }, [currentUser]);
    // Lắng nghe sự kiện điều hướng
// Khi đường dẫn thay đổi, set loading = true để hiển thị spinner
useEffect(() => {
  setLoading(true); // Khi pathname thay đổi, bật spinner
  const timer = setTimeout(() => {
    setLoading(false); // Sau một khoảng thời gian, tắt spinner
  }, 500); // Giả sử trang cần 500ms để tải xong, bạn có thể điều chỉnh thời gian này tùy ý

  return () => clearTimeout(timer); // Dọn dẹp khi unmount
}, [pathname]); // Mỗi khi pathname thay đổi, gọi lại useEffect

  if (loading) {
    return <Spinner />; // Hiển thị spinner trong khi đang tải
  }

  return <>{children}</>; // Render các component con khi đã tải xong
};

export default ClientLayout;
