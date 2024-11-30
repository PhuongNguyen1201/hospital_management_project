// app/main/layout.tsx
import { getUser } from '@/lib/dal';
import { getLinkByRole } from '@/lib/Data/link/link';
import {  LinkBaseRoleType, UserInfoType } from '@/types';
import AdminSidebar from '@/components/layout/AdminSidebar';
import AdminHeader from '@/components/layout/AdminHeader';
import ClientLayout from '@/components/ClientLayout'; // Client layout component
import { UserProvider } from '@/components/context/UserContext'; // Import UserContext

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = async ({ children }: AdminLayoutProps) => {
  // Lấy dữ liệu từ server
  const currentUser: UserInfoType|any = await getUser(); // Lấy user từ server
  let links: LinkBaseRoleType | null | undefined = null;

  if (currentUser) {
    links = await getLinkByRole(currentUser?.position_name); // Lấy links theo role
  }

  return (
    <UserProvider currentUser={currentUser ?? null}> {/* Truyền currentUser hoặc null vào UserProvider */}
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <AdminSidebar links={links} />
        <div className="flex flex-col w-full overflow-x-hidden">
          <AdminHeader links={links} />
          <ClientLayout>{children}</ClientLayout> {/* Pass children into ClientLayout */}
        </div>
      </div>
    </UserProvider>
  );
};

export default AdminLayout;
