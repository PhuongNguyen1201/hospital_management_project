import 'server-only'

// file này để viết logic kiểm tra xác thực nếu chưa xác thực thì cho vào đăng nhập nếu xác thực rồi thì 
 
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/session'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { getUserByEmail } from './Data/user/user'
import axios from 'axios'
import { UserInfoType } from '@/types'
export type UserInfo = {
  id: bigint;
  name: string;
  email: string;
  password:string;
  address?: string;
  phone?: string;
  cccd: string;
  certificate?: string;
  gender: number; // 1 - male, 2 - female, 3 - other
  status: number; // 0 - inactive, 1 - active
  position_id: bigint;
  position_name: string;
  department_id: bigint;
  department_name: string;
  room_ids:number[];
  room_codes: string[]; // Thay đổi từ room_ids sang room_codes
};
 
export const verifySession = cache(async () => {
  const cookie = cookies().get('session')?.value
  const session = await decrypt(cookie)
 
  if (!session?.email) {
    redirect('/auth/login')
  }
 
  return { isAuth: true, email: session.email }
})

export async function getUser(): Promise<UserInfoType | any> {
  const session = await verifySession()
    if (!session) return null
    const endpoint = process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/users`
    : null;
    if (!endpoint) {
      return { error: "API URL is not configured!" };
    }
    const response = await axios.get(endpoint, {
      params: { keyword: session.email },
    });
      const user = mapUserToUserInfoType(response);
      return user
  }

// Hàm ánh xạ dữ liệu trả về từ API vào UserInfoType
export const mapUserToUserInfoType = (response: any): UserInfoType | null => {
  // Kiểm tra dữ liệu trả về
  const userData = response?.data?.data?.data?.[0];
  if (!userData) return null;

  // Trích xuất thông tin user
  const userInfoType: UserInfoType = {
    id: BigInt(userData.id),
    name: userData.name,
    email: userData.email,
    address: userData.address || "",
    phone: userData.phone || "",
    cccd: userData.cccd,
    certificate: userData.certificate || "",
    gender: userData.gender,
    status: userData.status,
    position_id: BigInt(userData.position?.id || userData.position_id),
    position_name: userData.position?.name || "",
    department_id: BigInt(userData.department?.id || userData.department_id),
    department_name: userData.department?.name || "",
    room_ids: userData.rooms.map((room: any) => room.id),
    room_codes: userData.rooms.map((room: any) => room.code),
  };

  return userInfoType;
};
export const mapUserToUserInfo = (response: any): UserInfo | null => {
  // Kiểm tra dữ liệu trả về
  const userData = response?.data?.data?.data?.[0];
  if (!userData) return null;

  // Trích xuất thông tin user
  const userInfo: UserInfo = {
    id: BigInt(userData.id),
    name: userData.name,
    email: userData.email,
    password:userData.password,
    address: userData.address || "",
    phone: userData.phone || "",
    cccd: userData.cccd,
    certificate: userData.certificate || "",
    gender: userData.gender,
    status: userData.status,
    position_id: BigInt(userData.position?.id || userData.position_id),
    position_name: userData.position?.name || "",
    department_id: BigInt(userData.department?.id || userData.department_id),
    department_name: userData.department?.name || "",
    room_ids: userData.rooms.map((room: any) => room.id),
    room_codes: userData.rooms.map((room: any) => room.code),
  };

  return userInfo;
};