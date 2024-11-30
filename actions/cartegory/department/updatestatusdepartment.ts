"use server";

import axios from "axios";

// Hàm cập nhật trạng thái phòng ban
export const update_status_department = async (id: BigInt | string, newStatus: number) => {
  try {
    // 1. Lấy thông tin phòng ban hiện tại để lấy dữ liệu cần thiết
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/departments/${id}`;
    const response = await axios.get(endpoint, { timeout: 5000 });

    if (response.status !== 200 || !response.data) {
      return { error: "Không thể tìm thấy phòng ban hoặc dữ liệu không hợp lệ." };
    }

    const departmentData = response.data.data;
    // Kiểm tra nếu trạng thái phòng ban đã giống với trạng thái mới
    if (departmentData.status === newStatus) {
      return { error: "Trạng thái đã được cập nhật, không cần thay đổi." };
    }

    // 2. Cập nhật trạng thái phòng ban
    const updateEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/departments/${id}`;
    const payload = {
      name: departmentData.name,  // Gửi trường name hiện tại để đáp ứng validation
      status: newStatus           // Cập nhật trường status mới
    };
    
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
        return { error: "Phòng ban không tồn tại." }; // Lỗi không tìm thấy
      } else if (error.response.status === 422) {
        // Xử lý lỗi 422 Unprocessable Content - Validation lỗi
        const validationErrors = error.response.data?.errors;
        const errorMessages = validationErrors
          ? Object.values(validationErrors).flat().join("; ")
          : "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại dữ liệu.";
        
        return { error: errorMessages }; // Trả về lỗi chi tiết từ backend
      } else if (error.response.status === 500) {
        return { error: "Lỗi server, vui lòng thử lại sau." }; // Lỗi server
      }
    }

    console.error("API error:", error); // Log lỗi API để debug
    return { error: "Có lỗi xảy ra khi kết nối với API." }; // Lỗi chung
  }
};
