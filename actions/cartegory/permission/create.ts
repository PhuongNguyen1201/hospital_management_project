"use server";

import * as z from "zod";
import axios from "axios";
import {  PermissionSchema } from "@/schema";


export  const create_permission = async (values: z.infer<typeof PermissionSchema>) => {
  // 1. Validate input từ form
  const validateFields = PermissionSchema.safeParse(values);
  if (!validateFields.success) {
    return { error: "Dữ liệu nhập không hợp lệ." }; // Trả về lỗi khi validation không thành công
  }


  try {

    // 3. Tạo quyền mới
    const createEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/permissions/create`;
    const responseCreate = await axios.post(createEndpoint, values, {
      timeout: 5000, // Thêm timeout cho việc tạo quyền
    });

    if (responseCreate.status === 200) {
      return { success: "Tạo quyền mới thành công!" }; // Thành công
    } else {
      return { error: "Có lỗi khi tạo mới quyền, vui lòng thử lại." }; // Lỗi khi tạo
    }

  } catch (error: any) {
    // 4. Xử lý lỗi chi tiết
    if (error.code === 'ECONNABORTED') {
      return { error: "Yêu cầu bị timeout, vui lòng thử lại." }; // Lỗi timeout
    }

    if (error.response) {
      if (error.response.status === 409) {
        return { error: "Tên quyền đã tồn tại, vui lòng thử tên khác." }; // Lỗi tên quyền đã tồn tại
      } else if (error.response.status === 500) {
        return { error: "Lỗi từ phía server, vui lòng thử lại sau." }; // Lỗi server
      }
    }

    console.error("API error:", error); // Log lỗi API để debug
    return { error: "Có lỗi xảy ra khi kết nối với API." }; // Lỗi chung
  }
};
