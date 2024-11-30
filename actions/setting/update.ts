"use server";

import * as z from "zod";
import axios from "axios";
import {  UpdateUserSelfSchema } from "@/schema";

export const update_user = async (id:bigint|undefined,values: z.infer<typeof UpdateUserSelfSchema>) => {
  // 1. Validate input from form
  const validateFields = UpdateUserSelfSchema.safeParse(values);
  if (!validateFields.success) {
    console.error("Validation error:", validateFields.error); // Log validation errors
    return { error: "Dữ liệu nhập không hợp lệ." }; // Return error if validation fails
  }


  try {
    // 2. Create new user with the provided details
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`;
    const response = await axios.get(endpoint, { timeout: 5000 });

    if (response.status !== 200 || !response.data) {
      return { error: "Không thể tìm thấy người dùng hoặc dữ liệu không hợp lệ." };
    }

    const user = response.data.data;
    console.log(user.password)
    const payload = { 
      name:values.name,
      cccd:values.cccd,
      email:values.email,
      phone:values.phone,
      certificate:values.certificate,
      address: values.address,
      gender:values.gender,
      password:user.password,
    };

    

    const responseCreate = await axios.patch(endpoint, payload, { timeout: 5000 });

    if (responseCreate.status === 200) { // Check for the correct status code (201 for created)
      return { success: "Chỉnh sửa thông tin người dùng thành công!" }; // Success
    } else {
      console.error("Error during user creation:", responseCreate.data); // Log any errors from response
      return { error: "Có lỗi khi chỉnh sửa người dùng, vui lòng thử lại." }; // Error during creation
    }

  } catch (error: any) {
    // 3. Handle detailed errors
    if (error.code === 'ECONNABORTED') {
      return { error: "Yêu cầu bị timeout, vui lòng thử lại." }; // Timeout error
    }

    if (error.response) {
      console.error("API response error:", error.response.data); // Log API response error

      if (error.response.status === 409) {
        return { error: "Email đã tồn tại, vui lòng chọn email khác." }; // Email conflict error
      } else if (error.response.status === 500) {
        return { error: "Lỗi từ phía server, vui lòng thử lại sau." }; // Server error
      }
    } else {
      console.error("Unexpected error:", error); // Log unexpected error
    }

    return { error: "Có lỗi xảy ra khi kết nối với API." }; // General error
  }
};
