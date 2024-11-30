import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';
import { cookies } from 'next/headers';

// Danh sách các route công khai không cần đăng nhập
const publicRoutes = ['/auth/login', '/auth/signup'];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Lấy session từ cookie và giải mã
  const cookie = cookies().get('session')?.value;
  const session = cookie ? await decrypt(cookie) : null;

  // Xử lý nếu người dùng chưa đăng nhập
  if (!session?.email) {
    // Nếu không đăng nhập và truy cập route cần bảo vệ, chuyển hướng đến login
    if (!publicRoutes.includes(path)) {
      return NextResponse.redirect(new URL('/auth/login', req.nextUrl));
    }
  } else {
    // Nếu đã đăng nhập và truy cập route không bắt đầu bằng /main, chuyển hướng đến /main
    if (!path.startsWith('/main')) {
      return NextResponse.redirect(new URL('/main', req.nextUrl));
    }
  }

  // Cho phép request tiếp tục nếu không vi phạm điều kiện trên
  return NextResponse.next();
}

// Chỉ áp dụng middleware cho các route cụ thể
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|svg|gif|webp)$).*)'],
};
