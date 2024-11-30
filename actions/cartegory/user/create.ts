"use server";

import * as z from "zod";
import axios from "axios";
import { CreateUserSchema } from "@/schema";

export const create_user = async (values: z.infer<typeof CreateUserSchema>,selectedRooms:Number[]) => {
  // 1. Validate input from form
  const validateFields = CreateUserSchema.safeParse(values);
  if (!validateFields.success) {
    console.error("Validation error:", validateFields.error); // Log validation errors
    return { error: "Dữ liệu nhập không hợp lệ." }; // Return error if validation fails
  }

  const { email, password, department_id, position_id, ...otherFields } = validateFields.data;

  try {
    
    // 2. Create new user with the provided details
    const createEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/users/create`;
    
    const payload = { 
      ...otherFields, 
      email, 
      password, 
      department_id: Number(department_id), // Convert BigInt to Number
      position_id: Number(position_id),      // Convert BigInt to Number
      room_ids: selectedRooms,                      // Example room IDs
    };

    console.log("Payload to create user:", payload); // Log the payload to check its structure

    const responseCreate = await axios.post(createEndpoint, payload, { timeout: 5000 });

    if (responseCreate.status === 200) { // Check for the correct status code (201 for created)
      return { success: "Tạo người dùng mới thành công!" }; // Success
    } else {
      console.error("Error during user creation:", responseCreate.data); // Log any errors from response
      return { error: "Có lỗi khi tạo người dùng, vui lòng thử lại." }; // Error during creation
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
