import CustomHeader from '@/components/layout/CustomHeader';
import CustomSidebar from '@/components/layout/CustomSidebar';
import { UserType } from '@/types';
import { redirect } from 'next/navigation'; // Server-side redirection
import React from 'react';

interface CustomLayoutProps {
 // currentUser: UserType; // Prop for passing user data
  children: React.ReactNode;
}

const CustomLayout = ({  children }: CustomLayoutProps) => {
  return (
       <div className="flex min-h-screen w-full flex-col bg-muted/40">
          <CustomSidebar />
          <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
            <CustomHeader />
            {children}
          </div>
     </div>
  );
};

export default CustomLayout;
