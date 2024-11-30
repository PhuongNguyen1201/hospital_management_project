"use server";
import * as z from "zod";
import axios from "axios";
import { MedicalRecordSchema } from "@/schema";
import { Patient } from "@/types";

export const create_patient = async (
  values: z.infer<typeof MedicalRecordSchema>
) => {
  // 1. Validate input from form
  const validateFields = MedicalRecordSchema.safeParse(values);

  if (!validateFields.success) {
    const errors = validateFields.error.issues.map((issue) => ({
      field: issue.path.join("."), // Tên trường bị lỗi
      message: issue.message, // Thông báo lỗi
    }));

    console.error("Validation errors:", errors); // Log tất cả lỗi

    return {
      error: "Dữ liệu nhập không hợp lệ.",
      details: errors, // Trả về thông tin lỗi chi tiết
    };
  }

  // Hàm chuyển đổi ngày từ định dạng "DD/MM/YYYY" thành "YYYY-MM-DD"
  const convertTimestampToDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Thêm '0' nếu tháng < 10
    const day = String(date.getDate()).padStart(2, '0'); // Thêm '0' nếu ngày < 10
    return `${year}-${month}-${day}`;
  };

  // Giả sử `values.birthday` là timestamp
  const formattedDate = convertTimestampToDate(values.birthday);

  const convertValue = {
    name: values.name,
    birthday: formattedDate,
    address: values.address,
    phone: values.phone,
    cccd_number: values.cccd_number,
    health_insurance_code: values.health_insurance_code,
    guardian_phone: values.guardian_phone,
    gender: values.gender,
  };
  try {
    let idPatient: bigint;

    // 2. Kiểm tra xem bệnh nhân đã tồn tại với số CCCD này chưa
    const checkPatientEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/patients`;
    const checkPatientResponse = await axios.get(checkPatientEndpoint, {
      params: { limit:1000 }, // Truyền tham số cccd_number vào yêu cầu GET
    });
    
    const patients = checkPatientResponse.data.data.data; // Lấy danh sách bệnh nhân từ response
    if (Array.isArray(patients)) {
      // Thay `cccd_number` bằng giá trị CCCD bạn muốn tìm
      const patient = patients.find((item) => item.cccd_number.toString() === values.cccd_number); // Tìm bệnh nhân có cccd_number phù hợp
      if (patient) {
        idPatient = patient.id; // Lấy ID của bệnh nhân đầu tiên
      } 
    else {
        // Nếu bệnh nhân chưa tồn tại, tạo bệnh nhân mới
        const createPatientEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/patients/create`;
        const response = await axios.post(createPatientEndpoint, convertValue, { timeout: 5000 });
        idPatient = response.data.data.id;

      }
    } else {
      throw new Error("Dữ liệu bệnh nhân không hợp lệ");
    }

    console.log("Patient ID:", idPatient);
    const getRoomEndpoint=`${process.env.NEXT_PUBLIC_API_URL}/api/rooms/${values.room_id}`
    const getRoom = await axios.get(getRoomEndpoint);
    const user_id=getRoom.data.data.users[0].id;
    console.log("user_id",user_id);
    // 3. Tạo hồ sơ bệnh án cho bệnh nhân sau khi tạo bệnh nhân thành công
    const createMedicalRecordEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/medicalRecords/create`;
    const medicalRecordData = {
      patient_id: Number(idPatient), // Patient ID from the response
      user_id: Number(user_id), // The doctor ID
      room_id: Number(values.room_id), // The room ID
    };

    // Đợi tạo hồ sơ bệnh án trước khi trả kết quả
    const medicalRecordResponse = await axios.post(createMedicalRecordEndpoint, medicalRecordData, { timeout: 5000 });

    // Kiểm tra status và thông điệp trả về
    if (medicalRecordResponse.status === 200 || medicalRecordResponse.data.message === "created") {
      return {
        success: true,
        message: "Bệnh nhân và hồ sơ bệnh án đã được tạo thành công.",
        data: medicalRecordResponse.data.data,
      };
    } else {
      //console.error("Lỗi khi tạo hồ sơ bệnh án:", medicalRecordResponse.data);
      return { error: "Lỗi khi tạo hồ sơ bệnh án." };
    }

  } catch (error: any) {
    console.error("API error:", error.response ? error.response.data : error);
    return { error: "Đã xảy ra lỗi khi tạo bệnh nhân và hồ sơ bệnh án." };
   }
};
