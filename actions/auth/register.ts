"use server";

import * as z from 'zod';
import bcrypt from 'bcrypt';
import { RegisterSchema } from "@/schema";
import { addUser, getUserList } from "@/lib/Data/user/user";
import { UserType } from "@/types/index";
import { createSession } from '@/lib/session';


export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validateFields = RegisterSchema.safeParse(values);
  if (!validateFields.success) {
    return { error: "Invalid Fields!" };
  }

  const { email, password, name } = validateFields.data;

  // Lấy danh sách user từ file JSON
  const userList = await getUserList();
  const existingUser = userList.some((user:UserType) => user.email === email);

  if (existingUser) {
    return { error: "Email already exists!" };
  }

  // Hash mật khẩu
  const hashedPassword = await bcrypt.hash(password, 10);// 10 là số vòng lặp của thuật toán

  // Tạo người dùng mới và lưu vào file JSON
  const newUser: UserType = { email, password: hashedPassword, name, role: "admin" };
  await addUser(newUser);
 // 4. Create user session
  await createSession(newUser.email,newUser.role)
 // 5. Redirect user
  return { success: "User created!" };
};
