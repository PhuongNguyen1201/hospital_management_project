"use server";

import axios from "axios";

export const delete_position = async (id: bigint) => {
  if (!id) {
    return { error: "ID không hợp lệ." }; // Kiểm tra id đầu vào
  }

  try {
    // Gọi API để xóa khoa dựa trên id
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/positions/${id}`);

    // Kiểm tra phản hồi từ server
    if (response.status === 200) {
      return { success: "Vị trí đã được xóa thành công." };
    } else {
      return { error: "Không thể xóa vị trí, vui lòng thử lại." };
    }

  } catch (error: any) {
    // Xử lý lỗi API (kết nối thất bại, lỗi server)
    if (error.response && error.response.status === 404) {
      return { error: "Vị trí không tồn tại hoặc đã bị xóa." };
    } else if (error.response && error.response.status === 500) {
      return { error: "Lỗi máy chủ, vui lòng thử lại sau." };
    } else {
      return { error: "Có lỗi xảy ra khi kết nối với API." };
    }
  }
};
