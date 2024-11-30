"use server";

import axios from "axios";

// Hàm cập nhật trạng thái phòng ban
export const update_status_position = async (id: BigInt | string, newStatus: number) => {
  try {
    // 1. Lấy thông tin phòng ban hiện tại để kiểm tra
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/positions/${id}`;
    const response = await axios.get(endpoint, { timeout: 5000 });

    if (response.status !== 200 || !response.data) {
      return { error: "Không thể tìm thấy phòng ban hoặc dữ liệu không hợp lệ." };
    }

    const postitionData = response.data.data;
    // Kiểm tra nếu trạng thái phòng ban đã giống với trạng thái mới
    if (postitionData.status === newStatus) {
      return { error: "Trạng thái đã được cập nhật, không cần thay đổi." };
    }
    // 2. Cập nhật trạng thái phòng ban
    const updateEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/positions/${id}`;
    const payload = {
      name: postitionData.name,  // Gửi trường name hiện tại để đáp ứng validation
      status: newStatus           // Cập nhật trường status mới
    };
    console.log(payload)
    const updateResponse = await axios.patch(updateEndpoint, payload, { timeout: 5000 });
 
    if (updateResponse.status === 200) {
      return { success: "Cập nhật trạng thái thành công!" };
    } else {
      return { error: "Đã có lỗi khi cập nhật trạng thái, vui lòng thử lại." };
    }

  } catch (error: any) {
    // 3. Xử lý lỗi chi tiết
    if (error.code === 'ECONNABORTED') {
      return { error: "Yêu cầu bị timeout, vui lòng thử lại." }; // Lỗi timeout
    }

    if (error.response) {
      if (error.response.status === 404) {
        return { error: "Vị trí không tồn tại." }; // Lỗi không tìm thấy
      } else if (error.response.status === 500) {
        return { error: "Lỗi server, vui lòng thử lại sau." }; // Lỗi server
      }
    }

    console.error("API error:", error); // Log lỗi API để debug
    return { error: "Có lỗi xảy ra khi kết nối với API." }; // Lỗi chung
  }
};
