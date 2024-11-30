"use server";

import * as z from "zod";
import bcrypt from "bcrypt";
import { LoginSchema } from "@/schema";
import { createSession } from "@/lib/session";
import axios from "axios";
import { mapUserToUserInfo } from "@/lib/dal";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  // Validate đầu vào
  const validateFields = LoginSchema.safeParse(values);
  if (!validateFields.success) {
    return { error: "Invalid Fields!" };
  }

  const { email, password } = validateFields.data;
  const endpoint = process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/users`
    : null;

  if (!endpoint) {
    return { error: "API URL is not configured!" };
  }

  try {
    // Gửi yêu cầu đến API để lấy thông tin user
    const response = await axios.get(endpoint, {
      params: { keyword: email },
    });

    // Kiểm tra dữ liệu từ API
    const user = mapUserToUserInfo(response);
    if (!user) {
      return { error: "User not found!" };
    }

    if (!user) {
      return { error: "User not found!" };
    }
    // Kiểm tra mật khẩu với bcrypt
    //const isPasswordValid = await bcrypt.compare(password, user.password);
    // if (isPasswordValid) {
    if (password===user.password) {
      // Tạo session cho user
      await createSession(user.email, user.position_name, user.room_ids);
      // Trả về kết quả thành công
      return { success: "Login successful!" };
    } else {
      return { error: "Invalid email or password!" };
    }
  } catch (error) {
    // Xử lý lỗi API hoặc logic
    console.error("Login error:", error);
    return { error: "An error occurred during login. Please try again later!" };
  }
};
