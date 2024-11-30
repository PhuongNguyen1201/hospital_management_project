"use server";

import axios from "axios";

export const delete_medication= async (id: bigint) => {
  if (!id) {
    return { error: "ID không hợp lệ." }; // Kiểm tra id đầu vào
  }

  try {
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/medications/${id}`);

    if (response.status === 200) {
      return { success: "Dược đã được xóa thành công." };
    } else {
      return { error: "Không thể xóa phòng, vui lòng thử lại." };
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

    console.error("API error:", error);
    return { error: "Có lỗi xảy ra khi kết nối với API." };
  }
};
