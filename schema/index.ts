import { description } from "@/app/custom/page";
import * as z from "zod";

  

  
// zod dùng để validate
export const LoginSchema=z.object({
    email:z.string().email({
        message:"Email is require",
        
    }),
    password:z.string().min(1,{
        message:"Password is require",
    })
})

export const RegisterSchema=z.object({
    email:z.string().email({
        message:"Email is require",
        
    }),
    password:z.string().min(6,{
        message:"Minimum 6 character require",
    }),
    name:z.string().min(1,{
        message:"name is require",
    })
})

export const CreateDepartmentSchema = z.object({
    name: z.string().min(1, {
        message: "Yêu cầu điền",
    }),
    description: z.string().min(1, {
        message: "Yêu cầu điền",
    }),
});



export const CreateUserSchema = z.object({
    name: z.string().min(1, {
        message: "Yêu cầu điền",
    }),
    cccd: z.string().min(1, {
        message: "Yêu cầu điền",
    }),
    gender:  z.number().min(0, "Bạn phải chọn giới tính"),
    email: z.string().min(1, {
        message: "Yêu cầu điền",
    }).email("Email không hợp lệ"),
    password: z.string().min(1, {
        message: "Yêu cầu điền",
    }),
    certificate: z.string().optional(), // Trường này có thể có hoặc không
    phone: z.string().min(1, {
        message: "Yêu cầu điền số điện thoại",
    }), // Thêm validate cho Số điện thoại
    address: z.string().min(1, {
        message: "Yêu cầu điền địa chỉ",
    }), // Thêm validate cho Địa chỉ
    department_id: z.bigint().min(BigInt(1), {
        message: "Yêu cầu chọn khoa",
    }), // Thêm validate cho Khoa
    position_id: z.bigint().min(BigInt(1), {
        message: "Yêu cầu chọn chức danh",
    }), // Thêm validate cho Chức danh
});
export const UpdateUserSchema = z.object({
    name: z.string().min(1, {
        message: "Yêu cầu điền",
    }),
    cccd: z.string().min(1, {
        message: "Yêu cầu điền",
    }),
    gender:  z.number().min(0, "Bạn phải chọn giới tính"),
    email: z.string().min(1, {
        message: "Yêu cầu điền",
    }).email("Email không hợp lệ"),
    certificate: z.string().optional(), // Trường này có thể có hoặc không
    phone: z.string().min(1, {
        message: "Yêu cầu điền số điện thoại",
    }), // Thêm validate cho Số điện thoại
    address: z.string().min(1, {
        message: "Yêu cầu điền địa chỉ",
    }), // Thêm validate cho Địa chỉ
    department_id: z.bigint().min(BigInt(1), {
        message: "Yêu cầu chọn khoa",
    }), // Thêm validate cho Khoa
    position_id: z.bigint().min(BigInt(1), {
        message: "Yêu cầu chọn chức danh",
    }), // Thêm validate cho Chức danh
});

export const UpdateUserSelfSchema = z.object({
  name: z.string().min(1, {
      message: "Yêu cầu điền",
  }),
  cccd: z.string().min(1, {
      message: "Yêu cầu điền",
  }),
  gender:  z.number().min(0, "Bạn phải chọn giới tính"),
  email: z.string().min(1, {
      message: "Yêu cầu điền",
  }).email("Email không hợp lệ"),
  certificate: z.string().optional(), // Trường này có thể có hoặc không
  phone: z.string().min(1, {
      message: "Yêu cầu điền số điện thoại",
  }), // Thêm validate cho Số điện thoại
  address: z.string().min(1, {
      message: "Yêu cầu điền địa chỉ",
  }), // Thêm validate cho Địa chỉ
});
export const ResetPasswordSchema = z.object({
  email: z.string().min(1, {
      message: "Yêu cầu điền",
  }).email("Email không hợp lệ"),
  old_password:z.string().min(6, {
    message: "Mật khẩu tối thiểu 6 kí tự",
}),
  new_password:z.string().min(6, {
    message: "Mật khẩu tối thiểu 6 kí tự",
}),
  repeat_new_password:z.string().min(6, {
    message: "Mật khẩu tối thiểu 6 kí tự",
}),

});
export const RoomCatalogueSchema = z.object({
    keyword: z.string().min(1), // keyword không được bỏ trống
    name: z.string().min(1), // tên không được bỏ trống
    description: z.string().optional(), // description là tùy chọn
  });

  export const RoomSchema = z.object({
    code: z.string().min(1, { message: "Mã phòng là bắt buộc." }), // Mã phòng (unique)
    room_catalogue_id: z.bigint().min(BigInt(1), {
      message: "Yêu cầu chọn nhóm phòng",
  }), // Tham chiếu đến bảng room_catalogues
    department_id: z.bigint().min(BigInt(1), {
      message: "Yêu cầu chọn khoa",
  }), // Thêm validate cho Khoa
  });

  export const BedSchema = z.object({
    code: z.string().min(1, "Mã giường là bắt buộc"), // Mã giường (unique)
    room_id: z.bigint().min(BigInt(1), {
      message: "Yêu cầu chọn nhóm phòng",
  }), 
    price: z.number().min(0, "Giá giường không được âm"), // Giá giường
   
  });

  export const PermissionSchema = z.object({
    name: z.string()
      .min(1, { message: "Tên quyền không được để trống" }), // Tên quyền là chuỗi và không được để trống
    keyword: z.string()
      .min(1, { message: "Keyword không được để trống" }), // Keyword là chuỗi và không được để trống

  });

  export const ServiceCatalogueSchema = z.object({
    name: z.string()
      .min(1, { message: "Tên nhóm dịch vụ không được để trống" }), // Tên nhóm dịch vụ là chuỗi và không được để trống
    description: z.string().optional(), // Mô tả là chuỗi và có thể là tùy chọn
  });



export const ServiceSchema = z.object({
    name: z.string().min(1, "Tên dịch vụ là bắt buộc"),
    description: z.string().optional(),
    price: z.number().min(0, "Giá dịch vụ phải lớn hơn hoặc bằng 0").refine(val => !isNaN(val), {
      message: "Giá trị không hợp lệ",
    }),
    
    service_catalogue_id: z.bigint().min(BigInt(1), {
      message: "Yêu cầu chọn nhóm dịch vụ",
  }), // Tham chiếu đến bảng room_catalogues
    detail: z.string().optional(),
    health_insurance_applied: z.number().optional(),
    health_insurance_value: z.number().optional(),
    room_catalogue_id:  z.bigint().min(BigInt(1), {
      message: "Yêu cầu chọn nhóm phòng",
  }), // Tham chiếu đến bảng room_catalogues
  
  });

  export const MedicationCatalogueSchema = z.object({
    name: z.string().min(1, 'Tên nhóm dược là bắt buộc'), // Tên nhóm dược
    description: z.string().optional(), // Mô tả nhóm dược
    parent_id:z.number().min(0, 'Vui lòng chọn danh mục cha'), // Tên nhóm dược
  });


export const MedicationSchema = z.object({
  name: z.string().min(1,"Tên dược phẩm không được để trống"),
  medication_catalogue_id: z.bigint().min(BigInt(1), "ID nhóm dược phẩm không hợp lệ"),
  price: z.number().min(0, "Giá thuốc không được âm"),
  measure: z.string().min(1,"Đơn vị không được để trống"),
  measure_count: z.number().min(1, "Số lượng phải lớn hơn 0"),
  description: z.string().optional(),
});

export const PatientSchema = z.object({
  name: z
    .string()
    .min(1, "Tên bệnh nhân là bắt buộc") // Thay thế nonempty bằng min(1)
    .max(250, "Tên bệnh nhân không được vượt quá 250 ký tự"),
    birthday: z
    .number({
      required_error: "Ngày sinh là bắt buộc.",
      invalid_type_error: "Ngày sinh phải là một số hợp lệ.",
    })
    .min(new Date("1900-01-01").getTime(), "Ngày sinh không thể trước năm 1900.") // Ngày sinh không quá xa
    .max(new Date().getTime(), "Ngày sinh không thể ở tương lai.") // Ngày sinh không thể vượt quá ngày hiện tại
    .refine(
      (val) => !isNaN(new Date(val).getTime()),
      "Ngày sinh không hợp lệ."
    ),  
  address: z
    .string()
    .min(1, "Địa chỉ là bắt buộc") // Thay thế nonempty bằng min(1)
    .max(255, "Địa chỉ không được vượt quá 255 ký tự"),
  phone: z
    .string()
    .min(1, "Số điện thoại là bắt buộc") // Thay thế nonempty bằng min(1)
    .max(20, "Số điện thoại không được vượt quá 20 ký tự"),
  cccd_number: z
    .string()
    .min(1, "Số căn cước công dân là bắt buộc") // Thay thế nonempty bằng min(1)
    .max(20, "Số căn cước công dân không được vượt quá 20 ký tự"),
  health_insurance_code: z
    .string()
    .max(25, "Mã bảo hiểm y tế không được vượt quá 25 ký tự")
    .optional(),
  guardian_phone: z
    .string()
    .max(20, "Số điện thoại người giám hộ không được vượt quá 20 ký tự")
    .optional(),
  gender: z
    .number()
    .min(0, "Bạn phải chọn giới tính") // Bắt buộc
  });


export const MedicalRecordSchema = z.object({
  name: z
  .string()
  .min(1, "Tên bệnh nhân là bắt buộc") // Thay thế nonempty bằng min(1)
  .max(250, "Tên bệnh nhân không được vượt quá 250 ký tự"),
birthday: z
  .number()
  .min(0, "Ngày sinh không hợp lệ") // Bắt buộc, kiểm tra giá trị tối thiểu
  .refine(val => !isNaN(new Date(val).getTime()), "Ngày sinh không hợp lệ"), // Kiểm tra giá trị hợp lệ
address: z
  .string()
  .min(1, "Địa chỉ là bắt buộc") // Thay thế nonempty bằng min(1)
  .max(255, "Địa chỉ không được vượt quá 255 ký tự"),
phone: z
  .string()
  .min(1, "Số điện thoại là bắt buộc") // Thay thế nonempty bằng min(1)
  .max(20, "Số điện thoại không được vượt quá 20 ký tự"),
cccd_number: z
  .string()
  .min(1, "Số căn cước công dân là bắt buộc") // Thay thế nonempty bằng min(1)
  .max(20, "Số căn cước công dân không được vượt quá 20 ký tự"),
health_insurance_code: z
  .string()
  .max(25, "Mã bảo hiểm y tế không được vượt quá 25 ký tự")
  .optional(),
guardian_phone: z
  .string()
  .max(20, "Số điện thoại người giám hộ không được vượt quá 20 ký tự")
  .optional(),
gender: z
  .number()
  .min(0, "Bạn phải chọn giới tính"), // Bắt buộc,
  room_id: z.bigint().min(BigInt(1), "ID phòng khám là bắt buộc"), // Ràng buộc ID phòng khám
});
export const DailyHealthSchema = z.object({
  temperature: z.number().default(37), // Nhiệt độ mặc định
  blood_pressure: z.string().max(10, "Huyết áp không được vượt quá 10 ký tự").nonempty("Huyết áp không được để trống"),
  heart_rate: z.number().int().positive("Nhịp tim phải là số nguyên dương").nonnegative("Nhịp tim không hợp lệ"),
  blood_sugar: z.number().optional(), // Đường huyết, có thể có hoặc không
  diagnosis: z.string().optional(),   // Chuẩn đoán, có thể có hoặc không
  note: z.string().optional(),        // Ghi chú thêm, có thể có hoặc không
});

export const PatientServiceSchema= z.object({
  service_catalogue_id:  z.bigint().min(BigInt(1), {
    message: "Yêu cầu chọn nhóm dịch vụ",
}), // Tham chiếu đến bảng r
  service_id:  z.bigint().min(BigInt(1), {
    message: "Yêu cầu chọn dịch vụ",
}), // Tham chiếu đến bảng r
  room_id:  z.bigint().min(BigInt(1), {
    message: "Yêu cầu chọn nhóm phòng",
}), // Tham chiếu đến bảng r
});
export const MedicalRecordUpdateDiagnose=z.object({
  diagnosis:  z.string().min(1, {
    message: "Yêu cầu nhập chuẩn đoán cho bệnh nhân",
}), // Tham chiếu đến bảng r
  notes:  z.string().min(1, {
      message: "Vui lòng nhập ghi chú cho bệnh nhân",
  }), // Tham chiếu đến bảng r
  apointment_date: z
    .number({
      required_error: "Ngày tái khám là bắt buộc.",
      invalid_type_error: "Ngày tái khám phải là một số hợp lệ.",
    })
    .min(new Date().getTime(), "Ngày tái khám phải từ ngày hôm nay trở đi.")
    .refine(
      (val) => !isNaN(new Date(val).getTime()),
      "Ngày tái khám không hợp lệ."
    ),
});
export const CreateMedication=z.object({
  name: z.string().min(1,"Tên dược phẩm không được để trống"),
  dosage: z.number().min(1, "Liều lượng vui lòng nhập số"),
  measure: z.string().min(1,"Đơn vị không được để trống"),
  description: z.string().min(1,"Vui lòng nhập mô tả"),
});