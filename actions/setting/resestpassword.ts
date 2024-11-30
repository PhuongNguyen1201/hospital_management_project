"use server";

import * as z from "zod";
import axios from "axios";
import { ResetPasswordSchema } from "@/schema";

// Hàm reset mật khẩu
export const reset_password = async (values: z.infer<typeof ResetPasswordSchema>) => {
  // 1. Kiểm tra tính hợp lệ của dữ liệu đầu vào từ form
  const validateFields = ResetPasswordSchema.safeParse(values);
  if (!validateFields.success) {
    console.error("Validation error:", validateFields.error);
    return { error: "Dữ liệu nhập không hợp lệ." }; // Trả về lỗi nếu validation thất bại
  }

  // 2. Kiểm tra xem mật khẩu mới và mật khẩu nhập lại có khớp không
  if (values.new_password !== values.repeat_new_password) {
    return { error: "Mật khẩu mới và mật khẩu nhập lại không khớp." }; // Nếu không khớp, trả về lỗi
  }

  try {
    // 3. Lấy thông tin người dùng từ API qua email
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/users`;
    const response = await axios.get(endpoint, {
      params: { keyword: values.email },
    });

    if (response.status !== 200 || !response.data) {
      return { error: "Không thể tìm thấy người dùng hoặc dữ liệu không hợp lệ." };
    }

    const user = response?.data?.data?.data?.[0];
    console.log(user.password)
    // 4. Kiểm tra mật khẩu cũ (nếu có) và thay đổi mật khẩu mới
    if (user) {
      // Kiểm tra mật khẩu cũ nếu cần thiết
      if (values.old_password && values.old_password !== user.password) {
        return { error: "Mật khẩu cũ không đúng." };
      }
      const endpointReset = `${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.id}`;
      // Tạo payload để cập nhật mật khẩu
      const payload = {
        name: user.name,
        cccd: user.cccd,
        email: user.email,
        address: user.address,
        password: values.new_password, // Cập nhật mật khẩu mới
      };

      // 5. Gửi yêu cầu PATCH để cập nhật mật khẩu
      const responseCreate = await axios.patch(endpointReset, payload, { timeout: 5000 });

      if (responseCreate.status === 200) {
        return { success: "Cập nhật mật khẩu thành công!" }; // Thành công
      } else {
        console.error("Error during user password update:", responseCreate.data);
        return { error: "Có lỗi khi cập nhật mật khẩu, vui lòng thử lại." }; // Lỗi khi cập nhật
      }
    }
  } catch (error: any) {
    // 6. Xử lý lỗi chi tiết
    if (error.code === 'ECONNABORTED') {
      return { error: "Yêu cầu bị timeout, vui lòng thử lại." }; // Lỗi timeout
    }

    if (error.response) {
      console.error("API response error:", error.response.data);

      if (error.response.status === 409) {
        return { error: "Email đã tồn tại, vui lòng chọn email khác." }; // Xung đột email
      } else if (error.response.status === 500) {
        return { error: "Lỗi từ phía server, vui lòng thử lại sau." }; // Lỗi từ server
      }
    } else {
      console.error("Unexpected error:", error);
    }

    return { error: "Có lỗi xảy ra khi kết nối với API." }; // Lỗi kết nối API
  }
};
