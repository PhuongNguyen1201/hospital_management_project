"use client";
export const description =
  "An orders dashboard with a sidebar navigation. The sidebar has icon navigation. The content area has a breadcrumb and search in the header. The main area has a list of recent orders with a filter and export button. The main area also has a detailed view of a single order with order details, shipping information, billing information, customer information, and payment information."
import React, { useState, useTransition } from 'react'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Combobox } from '@/components/combobox'
import { MedicalRecord, PatientCurrently, PatientPaymentInfo, ServiceInfo, UserInfoType } from '@/types';
import { useRouter } from 'next/navigation'
import createColumns from '@/components/column-custom';
import { DataTable } from '@/components/data-table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ChevronLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { CreateUserSchema, PatientSchema } from '@/schema';
import * as z from "zod"
import { zodResolver } from '@hookform/resolvers/zod';
import { createUser } from '@/actions/cartegory/user/create';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { Textarea } from '@/components/ui/textarea';

// user tức nhân viên có thể là bác sĩ xét nghiệm đăng nhập vào hệ thống thì sẽ lấy ra được room Id -> sau đó lấy được các bệnh nhân được phân vào room id
// lấy các thông tin về phòng
// lấy các thông tin về dịch vụ

const patientData = {
    id: 1,
    name: "Nguyễn Văn A",
    birthday: "1990-01-01",
    gender: "Nam",
    phone: "0123456789",
    address: "Số 1, Đường A, Quận B, Thành phố C",
    cccdNumber: "123456789012",
    healthInsuranceCode: "9876543210",
    guardianPhone: "0987654321",
    admissionDate: "2024-10-01",
    dischargeDate: null, // null nếu bệnh nhân chưa xuất viện
    createdAt: "2024-10-01",
    updatedAt: "2024-10-26",
  };
  const patientExaminations = [
    {
      id: 1,
      reason: "Khó thở",
      doctor: "Bác sĩ Nguyễn Văn A",
      diagnosis: "Viêm phổi",
      conclusion: "Cần điều trị kháng sinh",
      admissionDate: "2024-10-20",
      dischargeDate: "2024-10-25",
      followUpDate: "2024-11-01",
      inpatientTreatment: true,
      followUpStatus: "Đã hẹn tái khám",
    },
    {
      id: 2,
      reason: "Khó thở",
      doctor: "Bác sĩ Nguyễn Văn A",
      diagnosis: "Viêm phổi",
      conclusion: "Cần điều trị kháng sinh",
      admissionDate: "2024-10-20",
      dischargeDate: "2024-10-25",
      followUpDate: "2024-11-01",
      inpatientTreatment: true,
      followUpStatus: "Đã hẹn tái khám",
    },
    {
      id: 3,
      reason: "Khó thở",
      doctor: "Bác sĩ Nguyễn Văn A",
      diagnosis: "Viêm phổi",
      conclusion: "Cần điều trị kháng sinh",
      admissionDate: "2024-10-20",
      dischargeDate: "2024-10-25",
      followUpDate: "2024-11-01",
      inpatientTreatment: true,
      followUpStatus: "Đã hẹn tái khám",
    },
    {
      id: 4,
      reason: "Đau bụng",
      doctor: "Bác sĩ Trần Thị B",
      diagnosis: "Viêm ruột thừa",
      conclusion: "Cần phẫu thuật",
      admissionDate: "2024-10-26",
      dischargeDate: "",
      followUpDate: "2024-11-05",
      inpatientTreatment: false,
      followUpStatus: "Chưa tái khám",
    },
  ];

const numberOptions = [
  { value: 10, label: "10 bản ghi" },
  { value: 20, label: "20 bản ghi" },
  { value: 40, label: "40 bản ghi" },
]
const departments = [
  { value: 1, label: "Khoa ngoại" },
  { value: 2, label: "Khoa nội" },
  { value: 3, label: "Khoa thần kinh" },
]
export type PatientService={
  id:bigint;
  patientName: string;
  gender: number;
  birthday_date: number;
  phone: string;
  service_name:string;
  service_id:bigint;
}
const patientServiceData: PatientService[] = [
  {
    id:BigInt(1),
    patientName: "Nguyễn Văn A",
    gender: 1,
    birthday_date: 20,
    phone: "0987654321",
    service_name:"Xét nghiệm máu",
    service_id:BigInt(1),
  },
  {
    id:BigInt(2),
    patientName: "Trần Thị B",
    gender: 0,
    birthday_date: 20,
    phone: "0987654321",
    service_name:"Xét nghiệm máu",
    service_id:BigInt(2),
    
  },
  {
    id:BigInt(3),
    patientName: "Lê Văn C",
    gender: 1,
    birthday_date: 20,
    phone: "0901234567",
    service_name:"Xét nghiệm máu",
    service_id:BigInt(3),
  },
  {
    id:BigInt(4),
    patientName: "Hoàng Thị D",
    gender: 0,
    birthday_date: 20,
    phone: "0934567890",
    service_name:"Xét nghiệm máu",
    service_id:BigInt(4),
  },
  {
    id:BigInt(5),
    patientName: "Phạm Văn E",
    gender: 1,
    birthday_date: 20,
    phone: "0967890123",
    service_name:"Xét nghiệm máu",
    service_id:BigInt(5),
  },
  // Thêm 5 bộ dữ liệu nữa
];

const PaymentPage = () => {
  const router = useRouter(); 
  const [error,setError]=useState<string|undefined>("");
  const [isPending,startTransition]=useTransition();
  const [status, setStatus] = useState<number|null>(null); // Trạng thái không chọn gì
  const [keyword, setKeyword] = useState('');
  const [limit, setLimit] = useState(20); // Mặc định không hiển thị bản ghi nào
  const [totalRecords, setTotalRecords] = useState(1);
  const [pageIndex, setPageIndex] = useState(1);
  const [deleteItem, setDeleteItem] = useState<UserInfoType | null>(null);
  const [item, setItem] = useState<PatientService | null>(null);
  

  const handleSelectRecords = (value: number | null) => {
    console.log("Selected value:", value)
  }
  const handleSelecLimit = (value: number | null) => {
    console.log("Selected value:", value)
    if (value) {
      setLimit(value);
      setPageIndex(1); // Reset về trang 1 khi thay đổi limit
    }
  }
  const handleSelectStatus = (value: number | null) => {
      setStatus(value);
      setPageIndex(1); // Reset về trang 1 khi thay đổi limit
  }

  // Cấu hình cho cột nút

//   const column = patientServiceData.length > 0 
//   ? createColumns(patientServiceData,
//     undefined, // onView
//     undefined, // onEdit
//     undefined, // onDelete
//     columnHeaderMap, // Cấu hình tiêu đề cột
//     undefined, // actionButtonsConfig
//     undefined, // switchConfig
//     buttonColumnConfig, // Cấu hình cho cột nút) 
//   ): [];
const currentDate = new Date();
const currentExaminationIndex = patientExaminations.findIndex((examination) => {
    const admissionDate = new Date(examination.admissionDate);
    const dischargeDate = examination.dischargeDate ? new Date(examination.dischargeDate) : null;
    return admissionDate < currentDate && (!dischargeDate || dischargeDate > currentDate);
  });
  const handleNavigate = (examinationId:any) => {
    router.push(`/main/medical_records/${examinationId}`); // Điều hướng đến trang chi tiết lần khám
};
  return (
        <main className="flex w-full flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 col bg-muted/40">
        <div className="w-full items-center">
          <h1 className="text-lg font-semibold md:text-xl">Hồ sơ bệnh án</h1>
        
        </div>
        <div
          className="flex flex-col flex-1 rounded-lg px-5 border border-dashed shadow-sm" x-chunk="dashboard-02-chunk-1"
        >
          <Card className='mb-5 mt-5'>
              <CardHeader className='pb-4 '>
                <CardTitle>Thông tin chi tiết của bệnh nhân</CardTitle>
                <CardDescription>
                  Chi tiết các thông tin cá nhân của bệnh nhân
                </CardDescription>
              </CardHeader >
              <CardContent className="space-y-2 border ">
                <div className='grid grid-cols-3 gap-4'>
                <div className="mb-4 mt-4">
                    <h2 className="text-xl font-semibold">Thông tin cá nhân</h2>
                    <p><strong>Tên:</strong> {patientData.name}</p>
                    <p><strong>Ngày sinh:</strong> {patientData.birthday}</p>
                    <p><strong>Giới tính:</strong> {patientData.gender}</p>
                    <p><strong>Điện thoại:</strong> {patientData.phone}</p>
                    <p><strong>Địa chỉ:</strong> {patientData.address}</p>
                    <p><strong>Số CCCD:</strong> {patientData.cccdNumber}</p>
                    <p><strong>Mã thẻ BHYT:</strong> {patientData.healthInsuranceCode}</p>
                    <p><strong>Điện thoại người giám hộ:</strong> {patientData.guardianPhone}</p>
                    </div>
                    
                    <div className="mb-4 mt-4">
                    <h2 className="text-xl font-semibold">Thông tin nhập viện</h2>
                    <p><strong>Ngày nhập viện:</strong> {patientData.admissionDate}</p>
                    <p><strong>Ngày xuất viện:</strong> {patientData.dischargeDate || "Chưa xuất viện"}</p>
                    </div>
                    
                    <div className="mb-4 mt-4">
                    <h2 className="text-xl font-semibold">Thông tin quản lý</h2>
                    <p><strong>Ngày tạo:</strong> {patientData.createdAt}</p>
                    <p><strong>Ngày cập nhật:</strong> {patientData.updatedAt}</p>
                    </div>
                </div>

                   {/*Thông tin đợt khám  */}
                   <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Thông Tin Khám Bệnh</h2>
      <div className='grid grid-cols-2 gap-4'>
        {patientExaminations.map((examination, index) => {
          // Kiểm tra xem đây có phải là đợt khám hiện tại không
          const isCurrent = index === currentExaminationIndex;

          return (
            <div key={examination.id} className={`border rounded-lg mb-4 ${isCurrent ? 'bg-yellow-100' : 'bg-white'}`}>
              <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => handleNavigate(examination.id)}>
                <span className={`inline-block rounded-3 px-2 py-1 text-sm font-semibold ${isCurrent ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
                  Lần khám: {index + 1} {isCurrent && '(Hiện tại)'}
                </span>
                {/* Mũi tên điều khiển */}
                <span >
                  ➔
                </span>
              </div>

              {/* Chi tiết đợt khám */}
            <div className='grid grid-cols-2 gap-4'>
            <div className="grid grid-cols-1 gap-4 p-4 border-t border-r border-gray-200">
                  <div>
                    <strong>Lý do khám:</strong> {examination.reason}
                  </div>
                  <div>
                    <strong>Bác sĩ khám:</strong> {examination.doctor}
                  </div>
                  <div>
                    <strong>Ngày vào khám:</strong> {examination.admissionDate}
                  </div>
                  <div>
                    <strong>Ngày ra:</strong> {examination.dischargeDate || 'Chưa ra viện'}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 p-4 border-t border-gray-200">
                  <div>
                    <strong>Chuẩn đoán:</strong> {examination.diagnosis}
                  </div>
                  <div>
                    <strong>Kết luận:</strong> {examination.conclusion}
                  </div>

                  <div>
                    <strong>Điều trị nội trú:</strong> {examination.inpatientTreatment ? "Có" : "Không"}
                  </div>
                  <div>
                    <strong>Ngày tái khám:</strong> {examination.followUpDate}
                  </div>
                  
                  <div>
                    <strong>Tình trạng tái khám:</strong> {examination.followUpStatus}
                  </div>
                </div>
            </div>
              

            </div>
          );
        })}
      </div>
    </div>
              </CardContent> 

            </Card >
          </div>
      </main>
  );
};

export default PaymentPage;