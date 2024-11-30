"use server";

import axios from "axios";

export const update_status_bed = async (id: bigint | string, newStatus: number) => {
  try {
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/beds/${id}`;
    const response = await axios.get(endpoint, { timeout: 5000 });

    if (response.status !== 200 || !response.data) {
      return { error: "Không thể tìm thấy giường hoặc dữ liệu không hợp lệ." };
    }

    const roomData = response.data.data;
    if (roomData.status === newStatus) {
      return { error: "Trạng thái đã được cập nhật, không cần thay đổi." };
    }

    const updateEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/beds/${id}`;
    const payload = {
      code:roomData.code, // Giữ lại thông tin hiện tại
      status:newStatus,
    };
    
    const updateResponse = await axios.patch(updateEndpoint, payload, { timeout: 5000 });

    if (updateResponse.status === 200) {
      return { success: "Cập nhật trạng thái thành công!" };
    } else {
      return { error: "Đã có lỗi khi cập nhật trạng thái, vui lòng thử lại." };
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
    console.error("API error:", error);
    return { error: "Có lỗi xảy ra khi kết nối với API." };
  }
};
