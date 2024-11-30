export interface LinkBaseRoleType {
  role: string;
  links: Array<{
    path: string;
    name: string;
    subLinks?: Array<{
      path: string;
      name: string;
    }>;
  }>;
}


  export type UserInfoType = {
    id: bigint;
    name: string;
    email: string;
    address?: string;
    phone?: string;
    cccd: string;
    certificate?: string;
    gender: number; // 1 - male, 2 - female, 3 - other
    status: number; // 0 - inactive, 1 - active
    position_id: bigint;
    position_name: string;
    department_id: bigint;
    department_name: string;
    room_ids:number[];
    room_codes: string[]; // Thay đổi từ room_ids sang room_codes
  };
  
  
  export type WardType = {
    id: string; // ID Phường/Xã
    name: string; // Tên Phường/Xã
    district_id: string; // Mã Quận/Huyện tham chiếu
  };
  
  export type DistrictType = {
    id: string; // ID Quận/Huyện
    name: string; // Tên Quận/Huyện
    province_id: string; // Mã Thành phố/Tỉnh tham chiếu
  };
  
  export type ProvinceType = {
    id: string; // ID Thành phố/Tỉnh
    name: string; // Tên Thành phố/Tỉnh
  };
  
  export type PositionType = {
    id: bigint; // ID tự tăng, khóa chính
    name: string; // Tên chức danh
    description?: string; // Mô tả (optional)
    status?: number; // 1-đang hoạt động, 0-bị dừng hoạt động
  };
  export type DepartmentType = {
    id: bigint; // hoặc bigint
    name: string; 
    description?: string; 
    status?: number; 
  };
  

  export type RoomCatalogueType = {
    id: bigint; // ID tự tăng, khóa chính
    keyword: string; // Keyword (e.g., "NOITRU")
    name: string; // Tên danh mục phòng
    description?: string; // Mô tả (optional)
    status: number; // 1-đang hoạt động, 0-bị dừng hoạt động
  };
  export type RoomType = {
    id: bigint; // ID tự tăng, khóa chính
    code: string; // Mã phòng (unique)
    description:string;
    status: number; // Trạng thái hoạt động (1-đang hoạt động, 0-bị dừng)
    room_catalogue_id: bigint; // Tham chiếu đến bảng room_catalogues
    department_id: bigint; // Tham chiếu đến bảng departments
    beds_count: number; // Trạng thái giường (0 - chưa đầy, 1 - đầy)
    status_bed:number;
    department_name:string;
    room_catalogue_code: string; // liên
  };

  export type UserRoomType = {
    user_id: bigint; // Tham chiếu đến bảng users
    room_id: bigint; // Tham chiếu đến bảng rooms
  };

  export type BedType = {
    id: bigint; // ID tự tăng, khóa chính
    code: string; // Mã giường (unique)
    status: number; // Trạng thái (0-chưa có người nằm, 1-đã có người nằm)
    room_id: bigint; // Tham chiếu đến bảng rooms
    room_code:string;
    patient_id?: bigint; // Tham chiếu đến bảng patients (optional)
    patient_name:string;
    room_catalogue_id:bigint;
    department_id:bigint;
    room_catalogue_name:string;
    department_name:string;
    price: number; // Giá giường

  };

  export type PermissionType = {
    id: bigint; // ID tự tăng, khóa chính
    name: string; // Tên quyền
    keyword: string; // Từ khóa quyền
  };

  export type PositionPermissionType = {
    position_id: bigint; // Tham chiếu đến bảng positions
    permission_id: bigint; // Tham chiếu đến bảng permissions
  };

  export type DataRow = {
    id: string; // Thêm trường id nếu cần
    [key: string]: any; // Cho phép các trường khác với kiểu dữ liệu không xác định
  }
  // Loại phòng (phòng khám tai-mũi họng, phòng nội trú, phòng xét nghiệm,..)
  export type RoomCatalogue = {
  id: bigint;
  keyword: string; // ví dụ phòng nội trú thì keyword là 'NOITRU'
  name: string;
  description?: string;
  status: number; // 1 - đang hoạt động, 0 - bị dừng hoạt động
};



    // Giường bệnh
export type Bed = {
  id: bigint;
  code: string; // mã giường, ví dụ 'B01', 'B02'
  status: 0 | 1; // 0 - chưa có người nằm, 1 - đã có người nằm
  room_id: bigint; // liên kết tới Room
  patient_id?: bigint; // liên kết tới Patient, có thể là undefined nếu chưa có người nằm
  price: number; // giá giường, mặc định là 200000
  created_at: Date;
  updated_at: Date;
};

// Định nghĩa cho nhóm dịch vụ
export type ServiceCatalogue = {
  id: bigint;                      // ID của nhóm dịch vụ
  name: string;                   // Tên nhóm dịch vụ
  description?: string;           // Mô tả về nhóm dịch vụ (tuỳ chọn)
  status: number;                  // Trạng thái: 0 (dừng hoạt động) hoặc 1 (đang hoạt động)             // Thời gian cập nhật
};

// Định nghĩa cho dịch vụ


export type MedicationCatalogue ={
  id: bigint;
  name: string;
  description?: string ;
  status: number;
  level: number;
  parent_id: number ;
  // _lft: number;
  // _rgt: number;
  // created_at: string;
  // updated_at: string;
  // deleted_at: string | null;
}

export type MedicationType = {
  id: bigint;                         // Khóa chính
  name: string;                       // Tên dược phẩm
  medication_catalogue_id: number;      // Khóa ngoại tham chiếu đến nhóm dược
  status:number;
  price: number;                      // Giá của dược phẩm
  measure: string;                    // Đơn vị đo lường (ví dụ: viên, túi, ...)
  measure_count: number;               // Số lượng tính theo đơn vị
  description?: string;               // Mô tả dược phẩm
  medication_catalogue_name:string;
};
// Định nghĩa cho dịch vụ
export type ServiceType = {
  id: bigint;                      // ID của dịch vụ
  name: string;                   // Tên dịch vụ
  description?: string;           // Mô tả về dịch vụ (tuỳ chọn)
  price: number;                  // Phí dịch vụ
  status: number;                  // Trạng thái: 0 (dừng hoạt động) hoặc 1 (đang hoạt động)
  detail?: string;                // Thông tin chi tiết về dịch vụ (tuỳ chọn)
  health_insurance_applied?: number; // Có áp dụng giảm phí cho bệnh nhân có bảo hiểm y tế không (tuỳ chọn, mặc định là 0)
  health_insurance_value?: number;  // Giá trị giảm phí bảo hiểm y tế (%), mặc định là 0%
  service_catalogue_id: bigint;     // ID nhóm dịch vụ mà dịch vụ thuộc về
  //service_catalogue_name: bigint;     // ID nhóm dịch vụ mà dịch vụ thuộc về
  room_catalogue_id: bigint;        // ID nhóm phòng mà dịch vụ thuộc về                // Thời gian cập nhật
  //room_catalogue_name: bigint;     // ID nhóm dịch vụ mà dịch vụ thuộc về
};
export type Patient = {
  id: bigint;
  name: string;
  birthday?: string;
  address?: string;
  phone?: string;
  cccd_number: string;
  health_insurance_code?: string;
  guardian_phone?: string;
  gender: number; // 1 - nam, 2 - nữ, 3 - giới tính khác
};
export type MedicalRecord = {
  id:bigint;
  patient_id:bigint;
  user_id:bigint;
  room_id:bigint;
  visit_date?:string|undefined;
  diagnosis?:string|undefined;
  notes?:string|undefined;
  apointment_date?:string|undefined;
  is_inpatient:string|undefined;
  inpatient_detail:string|undefined;
  status:number|undefined;
  patient_name:string;
  service_ids: BigInt[];
  service_names:String[];
};
export type MedicalRecordRecordService = {
  id:bigint;
  patient_id:bigint;
  patient_name:string;
  user_id:bigint;
  room_id:bigint;
  patient_birthday:string;
  visit_date?:string|undefined;
  patient_phone:string;
  diagnosis?:string|undefined;
  notes?:string|undefined;
  apointment_date?:string|undefined;
  is_inpatient:string|undefined;
  inpatient_detail:string|undefined;
  status:number|undefined;
};
export type MedicalRecordRecordServicePivot = {
  id:bigint;
  patient_id:bigint;
  patient_name:string;
  patient_gender:number;
  patient_birthday:string;
  patient_phone:string;
  patient_address:string;
  patient_cccd_number:string;
  user_id:bigint;
  room_id:bigint;
  visit_date?:string|undefined;
  diagnosis?:string|undefined;
  notes?:string|undefined;
  apointment_date?:string|undefined;
  is_inpatient:string|undefined;
  inpatient_detail:string|undefined;
  status:number|undefined;
  services:ServicePivot[];
};
export type ServicePivot={
  id: bigint;
  name:string;
  detail:string;
  description:string;
  pivot:PivotOfService;
}
export type PivotOfService={
  id:bigint;
  resultDetail:string;
}
export type MedicalRecordRecordServiceDetail = {
  id:bigint;
  patient_id:bigint;
  patient_name:string;
  patient_gender:number;
  patient_birthday:string;
  patient_phone:string;
  patient_address:string;
  patient_cccd_number:string;
  user_id:bigint;
  room_id:bigint;
  visit_date?:string|undefined;
  diagnosis?:string|undefined;
  notes?:string|undefined;
  apointment_date?:string|undefined;
  is_inpatient:string|undefined;
  inpatient_detail:string|undefined;
  status:number|undefined;
  services:ServiceDetailPatientResul[];
};
export type ServiceDetailPatientResul={
  id:bigint;
  name: string;
  description:string;
  health_insurance_applied:number;
  health_insurance_value:string;
  assigning_doctor_id:bigint;
  assigning_doctor_name:string;
  // examining_doctor_id:bigint;
  // examining_doctor:string;
  pivot_id:bigint;
  result_detail:string;
}

export type MedicationDetail ={
  id:bigint;
  name:string;
  dosage:number;
  measure:string;
  description:string;
}
export type MedicalRecordHistoryDetail={
  id:bigint;
  user_id:bigint;
  user_name:string;
  room_id:bigint;
  visit_date:string;
  diagnosis:string;
  notes:string;
  apointment_date:string;
  is_inpatient:number;
  inpatient_detail:string;
  services:ServiceDetailPatientResul[];
  medications:MedicationDetail[];
}
// đối với việc tiếp nhận: có 2 trường hợp
// TH1: đến khám mới-> thêm thông tin( thông tin cá nhân, tình trạng sức khỏe( kiểm tra sơ bộ chỉ số cơ thể) chỉ định xong rồi sẽ thêm 1 hồ sơ bệnh nhân-> hiển thị bệnh nhân với tình trạng đang khám)-> xem hồ sơ thì thấy các dịch vũ được chỉ định và trạng thái thanh toán, trạng thái xét nghiệm, sau đó đưa ra kết quả
// TH2: đến tái khám-> (xem hồ sơ-> click vào xem hồ sơ-> điền các chỉ số, kiểm tra sơ bộ-> cập nhật phát là chuyển sang đang khám, sau đó bác sĩ có thể chỉ định dịch vụ như bên kia)
export type PatientCurrently = {
  id: bigint; // ID của bản ghi bệnh án
  //patient_id: bigint; // ID của bệnh nhân
  patient_name:string;
  //user_id: bigint; //Bác sĩ thăm khám
  gender: number; // ID của bác sĩ
  visit_date: string; // Ngày khám (định dạng datetime)
  // diagnosis: string; // Chuẩn đoán
  // notes: string; // Ghi chú của bác sĩ
  // inpatient_detail?: string | null; // Thông tin chi tiết về điều trị nội trú (optional)
  // examination_status:number|null;// thêm trường trạng thái khám? đã khám, chưa khám đang khám.
};

export type DailyHealth = {
  id: bigint;
  treament_session_id: bigint; // Tham chiếu đến treament_sessions.id
  check_date?: Date|null; // Thời gian kiểm tra
  temperature?: number|null; // Nhiệt độ cơ thể, default là 37
  blood_pressure?: string|null; // Huyết áp (vd: 120/80)
  heart_rate?: number|null; // Nhịp tim (số nhịp mỗi phút)
  blood_sugar?: number|null; // Đường huyết (mmol/L)
  note?: string|null; // Các triệu chứng hoặc ghi chú bổ sung
};
export type PatientPaymentInfo = {
  id:bigint;
  patientName: string;            // Tên bệnh nhân
  cccd: string;                  // Số CCCD (Căn cước công dân)
  gender: number;                // Giới tính (1: Nam, 2: Nữ, 3: Khác)
  birthday_date: Date;                // Ngày sinh
  phone: string;                 // Số điện thoại
  admission_date: Date;           // Ngày vào viện
  discharge_date?: Date;          // Ngày ra viện (có thể không có)
  advanceAmount: number;         // Số tiền tạm ứng
  amountDue: number;             // Số tiền cần thanh toán
  paymentStatus: number;         // Trạng thái thanh toán (0: Chưa thanh toán, 1: Đã thanh toán)       // Xác nhận thanh toán
};

export type PatientServiceInfo = {
  id:bigint;
  serviceName?: string;             // Tên dịch vụ
  department?: string;              // Khoa
  room?: string;                    // Phòng
  referringDoctor?: string;         // Bác sĩ chỉ định
  servicePrice?: number;            // Giá dịch vụ
  insuranceApplicable?: number;     // Áp dụng bảo hiểm (0: Không áp dụng, 1: Có áp dụng)
  insuranceCoveragePercentage?: number; // Phần trăm áp dụng bảo hiểm
  amountDue?: number;               // Tiền cần trả
  paymentStatus?: number; 
  examination_status?:number;          // Trạng thái thanh toán (0: Chưa thanh toán, 1: Đã thanh toán)        // Xác nhận thanh toán
};
export type ServiceDetailField = {
  [key: string]: 'string' | 'number'|'float'; // Bạn có thể thêm kiểu khác nếu cần
};

export type ServiceDetail = {
  id: number;
  name: string;
  detail: string; // Dữ liệu dạng JSON
};

// Kiểu cho accumulator
export type SchemaAccumulator = {
  [key: string]: any; // Bạn có thể cụ thể hóa hơn tùy theo yêu cầu
};
export type ServiceResultDetail={
  id:bigint;
  service_id:bigint;
  service_name :string;
  doctor_name:string;
  description :string;
  department:string;
  room:string;
  result_details:string;
}
export type TreatmentSession={
  id: bigint,
  department: string,
  room: string,
  bed: string,
  treatingDoctor: string,
  start_date: Date,
  end_date: Date,
  reasonForTreatment: string,
  treatmentStatus: string,
  notes: string,
}

