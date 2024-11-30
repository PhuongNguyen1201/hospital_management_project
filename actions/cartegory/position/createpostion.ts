"use server";

import * as z from "zod";
import axios from "axios";
import { CreateDepartmentSchema } from "@/schema";
import { PositionType } from "@/types";

export  const create_position = async (values: z.infer<typeof CreateDepartmentSchema>) => {
  // 1. Validate input từ form
  const validateFields = CreateDepartmentSchema.safeParse(values);
  if (!validateFields.success) {
    return { error: "Dữ liệu nhập không hợp lệ." }; // Trả về lỗi khi validation không thành công
  }

  const { name } = validateFields.data;

  try {
    // 2. Kiểm tra xem khoa có tồn tại với tên tương tự
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/positions`;
    const response = await axios.get(endpoint, {
      params: {
        keyword: name, // Truy vấn theo tên khoa
      },
      timeout: 5000, // Thêm thời gian timeout để đảm bảo yêu cầu không bị treo
    });

    const existingpositions = response.data.data;
    if (existingpositions.data.length > 0) {
      return { error: "Tên vị trí đã tồn tại, vui lòng chọn tên khác." }; // Trả về lỗi nếu tên khoa đã tồn tại
    }

    // 3. Tạo khoa mới
    const createEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/positions/create`;
    const responseCreate = await axios.post(createEndpoint, values, {
      timeout: 5000, // Thêm timeout cho việc tạo khoa
    });

    if (responseCreate.status === 200) {
      return { success: "Tạo vị trí mới thành công!" }; // Thành công
    } else {
      return { error: "Có lỗi khi tạo vị trí mới, vui lòng thử lại." }; // Lỗi khi tạo
    }

  } catch (error: any) {
    // 4. Xử lý lỗi chi tiết
    if (error.code === 'ECONNABORTED') {
      return { error: "Yêu cầu bị timeout, vui lòng thử lại." }; // Lỗi timeout
    }

    if (error.response) {
      if (error.response.status === 409) {
        return { error: "Tên vị trí đã tồn tại, vui lòng thử tên khác." }; // Lỗi tên khoa đã tồn tại
      } else if (error.response.status === 500) {
        return { error: "Lỗi từ phía server, vui lòng thử lại sau." }; // Lỗi server
      }
    }

    console.error("API error:", error); // Log lỗi API để debug
    return { error: "Có lỗi xảy ra khi kết nối với API." }; // Lỗi chung
  }
};
