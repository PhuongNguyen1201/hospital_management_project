"use server";

import * as z from "zod";
import axios from "axios";
import { CreateDepartmentSchema } from "@/schema";
import { error } from "console";

// Hàm cập nhật thông tin vị trí
export const update_position = async (
  id: bigint, 
  values: z.infer<typeof CreateDepartmentSchema>
) => {
  // 1. Validate dữ liệu từ form
  const validateFields = CreateDepartmentSchema.safeParse(values);
  if (!validateFields.success) {
    return { error: "Dữ liệu nhập không hợp lệ." }; // Trả về lỗi nếu validation không thành công
  }

  const { name, description } = validateFields.data;

  try {
    // 2. Kiểm tra xem vị trí có tồn tại dựa vào tên
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/positions`;
    const response = await axios.get(endpoint, {
      params: {
        keyword: name,
        exclude_id: id, // Loại trừ khoa đang được chỉnh sửa
      },
      timeout: 5000, // Thêm thời gian timeout để ngăn chặn lỗi treo yêu cầu
    });

    const existingpositions = response.data.data;
    if (existingpositions.length > 0) {
      return { error: "Tên vị trí đã tồn tại, vui lòng chọn tên khác." };
    }

    // 3. Kiểm tra nếu không có thay đổi trong dữ liệu
    const existingPositionResponse = await axios.get(`${endpoint}/${id}`);
    const existingPosition = existingPositionResponse.data.data;

    if (
      existingPosition.name === name && 
      existingPosition.description === description
    ) {
      return { error: "Dữ liệu không thay đổi, không cần cập nhật." }; // Không cần cập nhật nếu không có thay đổi
    }

    // 4. Gửi yêu cầu cập nhật vị trí
    const updateEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/positions/${id}`;
    const responseUpdate = await axios.patch(updateEndpoint, values, {
      timeout: 5000,
    });

    if (responseUpdate.status === 200) {
      return { success: "Cập nhật thông tin vị trí thành công!" };
    } else {
      return { error: "Không thể cập nhật thông tin, vui lòng thử lại." };
    }

  } catch (error: any) {
    // 5. Xử lý lỗi chi tiết hơn
    if (error.code === 'ECONNABORTED') {
      return { error: "Yêu cầu bị timeout, vui lòng thử lại sau." }; // Lỗi timeout
    }

    if (error.response) {
      if (error.response.status === 404) {
        return { error: "vị trí không tồn tại." }; // Lỗi vị trí không tìm thấy
      } else if (error.response.status === 500) {
        return { error: "Lỗi server, vui lòng thử lại sau." }; // Lỗi từ phía server
      }
    }

    console.error("API error:", error);
    return { error: "Có lỗi xảy ra khi kết nối với API." }; // Lỗi chung không xác định
  }
};
