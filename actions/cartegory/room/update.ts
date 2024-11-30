"use server";

import * as z from "zod";
import axios from "axios";
import { RoomSchema } from "@/schema";

export const update_room = async (id: bigint, values: z.infer<typeof RoomSchema>) => {
  const validateFields = RoomSchema.safeParse(values);
  if (!validateFields.success) {
    return { error: "Dữ liệu nhập không hợp lệ." }; // Kiểm tra validation đầu vào
  }
  const valuesConvert={
    ...values,
    department_id: Number(values.department_id),
    room_catalogue_id: Number(values.room_catalogue_id),
  }

  try {
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/rooms/${id}`;
    const response = await axios.patch(endpoint, valuesConvert, { timeout: 5000 });

    if (response.status === 200) {
      return { success: "Cập nhật thông tin phòng thành công!" };
    } else {
      return { error: "Không thể cập nhật thông tin, vui lòng thử lại." };
    }

  } catch (error: any) {
    if (error.response && error.response.data) {
      const serverError = error.response.data;

      if (serverError.errors) {
        const errorMessages = Object.values(serverError.errors).flat().join("; ");
        return { error: errorMessages };
      }

      if (serverError.message) {
        return { error: serverError.message };
      }
    }

    if (error.code === 'ECONNABORTED') {
      return { error: "Yêu cầu bị timeout, vui lòng thử lại." };
    }

    if (error.response && error.response.status === 404) {
      return { error: "Phòng không tồn tại." };
    } else if (error.response && error.response.status === 500) {
      return { error: "Lỗi từ phía server, vui lòng thử lại sau." };
    }

    console.error("API error:", error);
    return { error: "Có lỗi xảy ra khi kết nối với API." };
  }
};
