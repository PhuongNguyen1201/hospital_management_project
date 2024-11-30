"use server";

import * as z from "zod";
import axios from "axios";
import { PermissionSchema } from "@/schema";
import { error } from "console";

// Hàm cập nhật thông tin quyền
export const update_permission = async (
  id: bigint, 
  values: z.infer<typeof PermissionSchema>
) => {
  // 1. Validate dữ liệu từ form
  const validateFields = PermissionSchema.safeParse(values);
  if (!validateFields.success) {
    return { error: "Dữ liệu nhập không hợp lệ." }; // Trả về lỗi nếu validation không thành công
  }

  try {


    const convertValue={
      name:values.name,
      keyword:values.keyword,
    }
    // 4. Gửi yêu cầu cập nhật quyền
    const updateEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/permissions/${id}`;
    const responseUpdate = await axios.patch(updateEndpoint, convertValue, {
      timeout: 5000,
    });

    if (responseUpdate.status === 200) {
      return { success: "Cập nhật thông tin quyền thành công!" };
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
        return { error: "quyền không tồn tại." }; // Lỗi quyền không tìm thấy
      } else if (error.response.status === 500) {
        return { error: "Lỗi server, vui lòng thử lại sau." }; // Lỗi từ phía server
      }
    }

    console.error("API error:", error);
    return { error: "Có lỗi xảy ra khi kết nối với API." }; // Lỗi chung không xác định
  }
};
