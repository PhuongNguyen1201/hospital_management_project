import { promises as fs } from 'fs';
import path from 'path';
import { UserType } from "@/types/index";

// Đường dẫn tới file JSON lưu dữ liệu user
const filePath = path.join(process.cwd(), 'lib', 'Data', 'user', 'user.json');

// Hàm lấy danh sách user từ file JSON
export async function getUserList(): Promise<UserType[]> {
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

// Hàm thêm user vào file JSON
export async function addUser(user: UserType): Promise<void> {
  const userList = await getUserList();
  userList.push(user);
  await fs.writeFile(filePath, JSON.stringify(userList, null, 2));
}

export async function getUserByEmail(email: string): Promise<UserType | undefined> {
  const userList = await getUserList();
  // Tìm kiếm user có email khớp
  return userList.find(user => user.email === email);
}
