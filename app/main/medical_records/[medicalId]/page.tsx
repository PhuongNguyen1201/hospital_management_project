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
import { DailyHealth, MedicalRecord, PatientCurrently, PatientMedicationUse, PatientPaymentInfo, PatientServiceInfo, ServiceInfo, ServiceResultDetail, TreatmentSession, UserInfoType } from '@/types';
import { useRouter,useParams } from 'next/navigation'
import createColumns from '@/components/column-custom';
import { DataTable } from '@/components/data-table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ChevronLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { createServiceSchema, CreateUserSchema, PatientSchema } from '@/schema';
import * as z from "zod"
import { zodResolver } from '@hookform/resolvers/zod';
import { createUser } from '@/actions/cartegory/user/create';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// user tức nhân viên có thể là bác sĩ xét nghiệm đăng nhập vào hệ thống thì sẽ lấy ra được room Id -> sau đó lấy được các bệnh nhân được phân vào room id
// lấy các thông tin về phòng
// lấy các thông tin về dịch vụ
const billsData = [
    {
        id: 1,
        total_price: 5000000,
        patient_id: 1,
        status:"Đã thanh toán",
        created_at: "2024-10-10T10:00:00Z",
        updated_at: "2024-10-10T10:00:00Z",
    },
    {
        id: 2,
        total_price: 3000000,
        patient_id: 1,
        status:"Đã thanh toán",
        created_at: "2024-10-15T11:30:00Z",
        updated_at: "2024-10-15T11:30:00Z",
    },
    {
        id: 3,
        total_price: 4500000,
        patient_id: 2,
        status:"Đã thanh toán",
        created_at: "2024-10-12T09:00:00Z",
        updated_at: "2024-10-12T09:00:00Z",
    },
    {
        id: 4,
        total_price: 7000000,
        patient_id: 3,
        status:"Đã thanh toán",
        created_at: "2024-10-14T14:00:00Z",
        updated_at: "2024-10-14T14:00:00Z",
    },
    {
        id: 5,
        total_price: 2500000,
        patient_id: 4,
        status:"Đã thanh toán",
        created_at: "2024-10-20T08:15:00Z",
        updated_at: "2024-10-20T08:15:00Z",
    },
    {
        id: 6,
        total_price: 8000000,
        patient_id: 5,
        status:"Đã thanh toán",
        created_at: "2024-10-21T10:45:00Z",
        updated_at: "2024-10-21T10:45:00Z",
    },
];
const billDetailsData = [
    {
        id: 1,
        bill_id: 1,
        model_id: 101,
        model_name: "Dịch vụ khám bệnh",
        price: 2000000,
        health_insurance_applied: 1,
        health_insurance_value: 20,
    },
    {
        id: 2,
        bill_id: 1,
        model_id: 102,
        model_name: "Xét nghiệm máu",
        price: 1500000,
        health_insurance_applied: 1,
        health_insurance_value: 15,
    },
    {
        id: 3,
        bill_id: 2,
        model_id: 103,
        model_name: "Khám chuyên khoa",
        price: 3000000,
        health_insurance_applied: 0,
        health_insurance_value: 0,
    },
    {
        id: 4,
        bill_id: 3,
        model_id: 104,
        model_name: "Siêu âm",
        price: 2500000,
        health_insurance_applied: 1,
        health_insurance_value: 10,
    },
    {
        id: 5,
        bill_id: 3,
        model_id: 105,
        model_name: "Dịch vụ xét nghiệm nước tiểu",
        price: 2000000,
        health_insurance_applied: 1,
        health_insurance_value: 15,
    },
    {
        id: 6,
        bill_id: 4,
        model_id: 106,
        model_name: "Thăm khám định kỳ",
        price: 1500000,
        health_insurance_applied: 1,
        health_insurance_value: 25,
    },
    {
        id: 7,
        bill_id: 4,
        model_id: 107,
        model_name: "Dịch vụ điều trị vật lý trị liệu",
        price: 5500000,
        health_insurance_applied: 0,
        health_insurance_value: 0,
    },
    {
        id: 8,
        bill_id: 5,
        model_id: 108,
        model_name: "Khám lần đầu",
        price: 2500000,
        health_insurance_applied: 1,
        health_insurance_value: 5,
    },
    {
        id: 9,
        bill_id: 6,
        model_id: 109,
        model_name: "Dịch vụ xét nghiệm di truyền",
        price: 7000000,
        health_insurance_applied: 1,
        health_insurance_value: 30,
    },
    {
        id: 10,
        bill_id: 6,
        model_id: 110,
        model_name: "Khám tổng quát",
        price: 1000000,
        health_insurance_applied: 1,
        health_insurance_value: 10,
    },
];

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
const serviceResultDetails: ServiceResultDetail[] = [
  {
    id: BigInt(1),
    service_id:BigInt(1),
    service_name: "Xét nghiệm máu",
    doctor_name: "Nguyễn Văn A",
    description: "Xét nghiệm máu tổng quát nhằm đánh giá các chỉ số cơ bản trong máu của bệnh nhân.",
    department: "Khoa Xét nghiệm",
    room: "Phòng 302",
    result_details: JSON.stringify({
      hemoglobin: "13.5 g/dL",
      leukocytes: "8000 cells/µL",
      platelets: "250000 cells/µL",
      conclusion: "Các chỉ số đều nằm trong khoảng tham chiếu bình thường. Bệnh nhân không có dấu hiệu thiếu máu hoặc nhiễm trùng."
    })
  },
  {
    id: BigInt(2),
    service_id:BigInt(2),
    service_name: "Xét nghiệm nước tiểu",
    doctor_name: "Lê Thị B",
    description: "Xét nghiệm nước tiểu để kiểm tra các chỉ số như glucose, protein và pH.",
    department: "Khoa Xét nghiệm",
    room: "Phòng 303",
    result_details: JSON.stringify({
      glucose: "15 mg/dL",
      protein: "20 mg/dL",
      pH: "6.5",
      conclusion: "Kết quả xét nghiệm nước tiểu bình thường, không phát hiện protein hoặc glucose bất thường."
    })
  },
  {
    id: BigInt(3),
    service_id:BigInt(3),
    service_name: "Xét nghiệm phân",
    doctor_name: "Trần Văn C",
    description: "Kiểm tra phân để phát hiện máu hoặc các bất thường khác.",
    department: "Khoa Xét nghiệm",
    room: "Phòng 304",
    result_details: JSON.stringify({
      color: "Nâu",
      consistency: "Bình thường",
      blood: "Không phát hiện",
      conclusion: "Không phát hiện máu trong mẫu phân. Mẫu phân có màu sắc và độ đặc bình thường."
    })
  },
  {
    id: BigInt(4),
    service_id:BigInt(4),
    service_name: "Siêu âm ổ bụng",
    doctor_name: "Phạm Thị D",
    description: "Siêu âm kiểm tra các cơ quan trong ổ bụng.",
    department: "Khoa Chẩn đoán hình ảnh",
    room: "Phòng 401",
    result_details: JSON.stringify({
      liver: "Gan bình thường",
      gallbladder: "Không có sỏi",
      kidneys: "Thận không có dấu hiệu bất thường",
      conclusion: "Siêu âm ổ bụng bình thường, không phát hiện bất thường."
    })
  }
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
const columnServiceHeaderMap: { [key: string]: string } = {
    serviceName: "Dịch vụ",
    department: "khoa",
    room: "Phòng",
    referringDoctor: "Bác sĩ chỉ định",
    servicePrice: "Giá dịch vụ",
    insuranceApplicable:"Áp dụng bảo hiểm",
    insuranceCoveragePercentage:"Phần trăm",
    amount_due:"Giá tiền thanh toán",
    paymentStatus:"Trạng thái thanh toán",
    examination_status:"Trạng thái khám dịch vụ"
  // Add more mappings as needed
};
const columnMedicalRecordMedicationHeaderMap: { [key: string]: string } = {
    medicationName:"Tên thuốc",
    dosage:"Đơn vị",
    frequency:"Liều lượng",
    duration:"Số ngày dùng",
    notes:"Ghi chú",
  // Add more mappings as needed
};
const columnInpatientHeaderMap: { [key: string]: string } = {
    department:"Khoa điều trị",
    room:"Phòng",
    bed:"Giường",
    treatingDoctor:"Bác sĩ điều trị",
    start_date:"ngày vào",
    end_date:"ngày ra",
    reasonForTreatment:"Tình trạng bệnh",
    treatmentStatus: "Tình trạng điều trị",
    notes: "Ghi chú",
  // Add more mappings as needed
};
const columnPaymentHeaderMap: { [key: string]: string } = {
    billId: "ID Hóa Đơn",
    totalPrice: "Tổng Tiền",
    status: "Trạng Thái",
    createdAt: "Ngày Tạo",
    modelName: "Tên Đối Tượng",
    price: "Giá",
    healthInsuranceApplied: "Bảo Hiểm Y Tế",
    healthInsuranceValue: "Giá Trị Bảo Hiểm",
};
const columnMedicaionUseHeaderMap: { [key: string]: string } = {
  catalogue_name:"Tên nhóm dược",
  medication_name:"Tên thuốc",
  dosage:"Đơn vị",
  measure:"Liều lượng",
  description:"Ghi chú",
  create_date:"Ngày dùng",
  price: "Đơn giá",
  insurance_applicable:"Áp dụng bảo hiểm",
  insurance_coverage_percentage: "Tỉ lệ áp dụng bảo hiểm",
  total_price:"Thành tiền",
  amount_due:"Tiền cần thanh toán"
// Add more mappings as needed
};
const columnDailyHealthHeaderMap: { [key: string]: string } = {
  check_date: "Ngày kiểm tra", // Thời gian kiểm tra
  temperature: "Nhiệt độ", // Nhiệt độ cơ thể, default là 37
  blood_pressure: "Huyết áp", // Huyết áp (vd: 120/80)
  heart_rate: "Nhịp tim", // Nhịp tim (số nhịp mỗi phút)
  blood_sugar: "Đường huyết", // Đường huyết (mmol/L)
  note: "Ghi chú", // Các triệu chứng hoặc ghi chú bổ sung
// Add more mappings as needed
};

const inpatientTreatmentData:TreatmentSession[] = [
    {
        id: BigInt(1),
        department: "Nội khoa",
        room: "Phòng 101",
        bed: "Giường 1",
        treatingDoctor: "Bác sĩ Nguyễn Văn A",
        start_date: new Date("2024-10-05"),
        end_date: new Date("2024-10-12"),
        reasonForTreatment: "Viêm phổi nặng",
        treatmentStatus: "Đang điều trị",
        notes: "Bệnh nhân cần theo dõi thường xuyên.",
    },
    {
        id: BigInt(2),
        department: "Ngoại khoa",
        room: "Phòng 202",
        bed: "Giường 2",
        treatingDoctor: "Bác sĩ Trần Thị B",
        start_date: new Date("2024-10-10"),
        end_date: new Date("2024-10-15"),
        reasonForTreatment: "Phẫu thuật ruột thừa",
        treatmentStatus: "Đã xuất viện",
        notes: "Bệnh nhân đã hồi phục tốt.",
    },
    {
        id: BigInt(3),
        department: "Nhi khoa",
        room: "Phòng 305",
        bed: "Giường 3",
        treatingDoctor: "Bác sĩ Lê Văn C",
        start_date: new Date("2024-10-01"),
        end_date: new Date("2024-10-08"),
        reasonForTreatment: "Sốt virus",
        treatmentStatus: "Đang điều trị",
        notes: "Bệnh nhân cần được theo dõi triệu chứng.",
    },
    // Thêm dữ liệu mẫu khác nếu cần
];
const patientServiceData: PatientServiceInfo[] = [
    {
        id: BigInt(1),
      serviceName: "Xét nghiệm máu",
      department: "Huyết học",
      room: "101",
      referringDoctor: "Bác sĩ Nguyễn Văn K",
      insuranceApplicable: 1,
      insuranceCoveragePercentage: 80,
    },
    {
        id: BigInt(2),
      serviceName: "Chụp X-quang",
      department: "Chẩn đoán hình ảnh",
      room: "202",
      referringDoctor: "Bác sĩ Trần Thị M",
      insuranceApplicable: 0,
      insuranceCoveragePercentage: 0,
      
    },
    {
        id: BigInt(3),
      serviceName: "Khám tổng quát",
      department: "Nội tổng hợp",
      room: "305",
      referringDoctor: "Bác sĩ Lê Văn N",
      insuranceApplicable: 1,
      insuranceCoveragePercentage: 50,
      
    },
    {
        id: BigInt(4),
      serviceName: "Soi dạ dày",
      department: "Tiêu hóa",
      room: "405",
      referringDoctor: "Bác sĩ Phạm Thị P",
      insuranceApplicable: 1,
      insuranceCoveragePercentage: 70,
      
    },
    {
        id: BigInt(5),
      serviceName: "Phẫu thuật ruột thừa",
      department: "Ngoại khoa",
      room: "501",
      referringDoctor: "Bác sĩ Lê Văn Q",
      insuranceApplicable: 0,
      insuranceCoveragePercentage: 0,
      
    },
    // Thêm 5 bộ dữ liệu nữa
  ];
  const medicationsPrescribed:any = [
    {
        id: 1,
        medicationName: "Paracetamol",
        dosage: "500 mg",
        frequency: "3 lần/ngày",
        duration: "5 ngày",
        notes: "Uống sau bữa ăn",
    },
    {
        id: 2,
        medicationName: "Amoxicillin",
        dosage: "250 mg",
        frequency: "2 lần/ngày",
        duration: "7 ngày",
        notes: "Uống đủ liều",
    },
    {
        id: 1,
        medicationName: "Paracetamol",
        dosage: "500 mg",
        frequency: "3 lần/ngày",
        duration: "5 ngày",
        notes: "Uống sau bữa ăn",
    },
    {
        id: 2,
        medicationName: "Amoxicillin",
        dosage: "250 mg",
        frequency: "2 lần/ngày",
        duration: "7 ngày",
        notes: "Uống đủ liều",
    },
    {
        id: 1,
        medicationName: "Paracetamol",
        dosage: "500 mg",
        frequency: "3 lần/ngày",
        duration: "5 ngày",
        notes: "Uống sau bữa ăn",
    },
    {
        id: 2,
        medicationName: "Amoxicillin",
        dosage: "250 mg",
        frequency: "2 lần/ngày",
        duration: "7 ngày",
        notes: "Uống đủ liều",
    },
];
const patientMedicationUseData:PatientMedicationUse[]=[
  {
    id: BigInt(1),
    
    catalogue_name: "Thuốc thần kinh",
    medication_name: "Panadol Extra",
    price: 5000,
    dosage: "viên",
    measure: "2 viên",
    description: "Ngày uống 3 lần, mỗi lần 1 viên",
    create_date:new Date("2024-10-01T00:00:00.000Z"),
    insurance_applicable: 1,
    insurance_coverage_percentage: 80,
    total_price: 10000,
    amount_due: 2000 // 20% của 10000
  },
  {
    id: BigInt(2),
    
    catalogue_name: "Bơm kim tiêm",
    medication_name: "Bơm kim tiêm 10ml",
    price: 2000,
    dosage: "cái",
    measure:  "1 cái",
    description: "Sử dụng khi truyền dịch",
    create_date:new Date("2024-10-02T00:00:00.000Z"),
    insurance_applicable: 1,
    insurance_coverage_percentage: 80,
    total_price: 2000,
    amount_due: 400 // 20% của 2000
  },
  {
    id: BigInt(3),
    
    catalogue_name: "Dịch truyền",
    medication_name: "Nước muối sinh lý",
    price: 15000,
    dosage: "chai",
    measure: "1 chai",
    description: "Truyền 500ml trong vòng 30 phút",
    create_date:new Date("2024-10-03T00:00:00.000Z"),
    insurance_applicable: 1,
    insurance_coverage_percentage: 80,
    total_price: 15000,
    amount_due: 3000 // 20% của 15000
  },
  {
    id: BigInt(4),
    
    catalogue_name: "Truyền máu",
    medication_name: "Máu toàn phần",
    price: 500000,
    dosage: "đơn vị",
    measure: "1 đơn vị",
    description: "Truyền máu toàn phần cho bệnh nhân thiếu máu",
    create_date:new Date("2024-10-04T00:00:00.000Z"),
    insurance_applicable: 1,
    insurance_coverage_percentage: 80,
    total_price: 500000,
    amount_due: 100000 // 20% của 500000
  }
]


const healthRecords: DailyHealth =   {
    id: BigInt(1),
    treament_session_id: BigInt(101),
    check_date: new Date("2024-10-29T08:30:00"),
    temperature: 36.8,
    blood_pressure: "120/80",
    heart_rate: 75,
    blood_sugar: 5.2,
    note: "Không có triệu chứng bất thường",
  }

  const dailyHealthData: DailyHealth[] = [
    {
      id: BigInt(1),
      treament_session_id: BigInt(101),
      check_date: new Date('2024-10-01T09:00:00'),
      temperature: 37.2, // default là 37
      blood_pressure: "120/80",
      heart_rate: 78,
      blood_sugar: 5.2,
      note: "Bệnh nhân hơi mệt mỏi vào buổi sáng",
    },
    {
      id: BigInt(2),
      treament_session_id: BigInt(101),
      check_date: new Date('2024-10-02T09:00:00'),
      temperature: 36.8,
      blood_pressure: "118/76",
      heart_rate: 80,
      blood_sugar: 5.4,
      note: "Triệu chứng ổn định",
    },
    {
      id: BigInt(3),
      treament_session_id: BigInt(102),
      check_date: new Date('2024-10-03T09:00:00'),
      temperature: 37.5,
      blood_pressure: "130/85",
      heart_rate: 82,
      blood_sugar: 6.1,
      note: "Bệnh nhân có dấu hiệu sốt nhẹ, tiếp tục theo dõi",
    },
    {
      id: BigInt(4),
      treament_session_id: BigInt(103),
      check_date: new Date('2024-10-04T09:00:00'),
      temperature: 37.0,
      blood_pressure: "125/80",
      heart_rate: 75,
      blood_sugar: 5.8,
      note: "Sức khỏe bệnh nhân tiến triển tốt",
    },
    {
      id: BigInt(5),
      treament_session_id: BigInt(103),
      check_date: new Date('2024-10-05T09:00:00'),
      temperature: 36.9,
      blood_pressure: "120/78",
      heart_rate: 77,
      blood_sugar: 5.5,
      note: "Chỉ số sức khỏe ổn định, không có triệu chứng bất thường",
    },
  ];
  
const MedicalRecordDetail = () => {
  const router = useRouter(); 

  const [isPrescriptionVisible, setPrescriptionVisible] = useState(false); // Trạng thái hiển thị đơn thuốc
  const [error,setError]=useState<string|undefined>("");
  const [isPending,startTransition]=useTransition();
  const [status, setStatus] = useState<number|null>(null); // Trạng thái không chọn gì
  const [keyword, setKeyword] = useState('');
  const [limit, setLimit] = useState(20); // Mặc định không hiển thị bản ghi nào
  const [totalRecords, setTotalRecords] = useState(1);
  const [pageIndex, setPageIndex] = useState(1);
  const [deleteItem, setDeleteItem] = useState<UserInfoType | null>(null);
  const [item, setItem] = useState<PatientService | null>(null);
  const [itemServiceResult, setItemServiceResult] = useState<ServiceResultDetail | null>(null);
  const [isOpenResultService,setIsOpenResultService]=useState<boolean>(false);
  const [isOpenAddService,setIsOpenAddService]=useState<boolean>(false);
  const [isOpenAddMedication,setIsOpenAddMedication]=useState<boolean>(false);
  const [isOpenAddDailyHealth,setIsOpenAddDailyHealth]=useState<boolean>(false);
  const [isOpenChangeDepartment,setIsOpenChangeDepartment]=useState<boolean>(false);
  const [itemServiceResultDetail, setItemServiceResultDetail] = useState<Record<string, string>>({});


  const [treatmentSession,setTreatmentSession]=useState<TreatmentSession|null>(inpatientTreatmentData[inpatientTreatmentData.length-1]);
  const form=useForm<z.infer<typeof PatientSchema>>({
    resolver:zodResolver(PatientSchema),
    defaultValues: {
      name: "",
      cccd_number: "", // Khởi tạo giá trị mặc định cho Căn cước công dân
      gender: "male", // Khởi tạo giá trị mặc định cho giới tính
      phone: "", // Khởi tạo giá trị mặc định cho số điện thoại
      address: "", // Khởi tạo giá trị mặc định cho địa chỉ
      province_id: "", // Khởi tạo giá trị mặc định cho tỉnh/thành phố
      district_id: "", // Khởi tạo giá trị mặc định cho quận/huyện
      ward_id: "", // Khởi tạo giá trị mặc định cho phường/xã
      health_insurance_code: "", // Khởi tạo giá trị mặc định cho chứng chỉ
      guardian_phone: "", // Khởi tạo giá trị mặc định cho chứng chỉ
    },
  });

  const paymentInfo = billsData.map(bill => {
    const details = billDetailsData.filter(detail => detail.bill_id === bill.id);
    return {
        billId: bill.id,
        totalPrice: bill.total_price,
        status: bill.status,
        createdAt: bill.created_at,
        details: details,
    };
});
const paymentTableData:any = paymentInfo.flatMap(payment => 
    payment.details.map(detail => ({
        billId: payment.billId,
        totalPrice: payment.totalPrice,
        status: payment.status,
        createdAt: payment.createdAt,
        modelName: detail.model_name,
        price: detail.price,
        healthInsuranceApplied: detail.health_insurance_applied ? "Có" : "Không",
        healthInsuranceValue: detail.health_insurance_value,
    }))
);  
 const {medicalId}=useParams();
 const medicalIdBigInt = Array.isArray(medicalId) ? BigInt(medicalId[0]) : BigInt(medicalId);
  const medicalInfor:any = patientExaminations.find((medicalRecord) => BigInt(medicalRecord.id) === medicalIdBigInt);
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
  const addService = () => {
    // Use router in a safe way, like in an event handler or inside useEffect
    setIsOpenAddService(true)
  };
  const addMedication=()=>{
    setIsOpenAddMedication(true);
  }
  const addDailyHealth=()=>{
    setIsOpenAddDailyHealth(true);
  }

  const onSubmit = (values: z.infer<typeof PatientSchema>) => {
    // startTransition(() => {
    //   createUser(values)
    //     .then((data) => {
    //       if (data.error) {
    //         setError(data.error);
           
    //       } else if (data.success) {
    //         setError('');
            
    //         // Hiển thị toast cho thành công
    //         toast({
    //           variant:"success",
    //           title: "Thêm thành công",
    //           description: data.success,
    //           action: <ToastAction altText="Thử lại">Ok</ToastAction>
    //         });
    //         router.push('/main/cartegory/user')
    //         // Tắt sau khi thành công
    //       }
    //     })
    // });
  };
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
const buttonColumnConfig = {
    id: 'customButton',
    header: 'Kết quả',
    onClickConfig: (id: string | BigInt) => {
          const item = serviceResultDetails.find((service) => service.service_id === id);
          if (item) {
            setItemServiceResult(item); // Lưu trữ thông tin dịch vụ đã chọn
            setItemServiceResultDetail(JSON.parse(item.result_details)); 
          }
          setIsOpenResultService(true); // Mở dialog hiển thị thông tin chi tiết
    },
    content: 'Xem kết quả',
  };
const closeDialogServiceResult=()=>{
  setIsOpenResultService(false);
  
  setItemServiceResultDetail({});
  setItemServiceResult(null);
}
const buttonColumnConfigInpatient = {
    id: 'customButton',
    header: 'Xem chi tiết',
    onClickConfig: (id: string | BigInt) => {
      const selectedTreatment = inpatientTreatmentData.find((treatment) => treatment.id === id);
      if(selectedTreatment)
        setTreatmentSession(selectedTreatment);
    },
    content: 'Chi tiết',
  };

  const changeDepartment=()=>{
    setIsOpenChangeDepartment(true);
  }
const currentDate = new Date();
const currentExaminationIndex = patientExaminations.findIndex((examination) => {
    const admissionDate = new Date(examination.admissionDate);
    const dischargeDate = examination.dischargeDate ? new Date(examination.dischargeDate) : null;
    return admissionDate < currentDate && (!dischargeDate || dischargeDate > currentDate);
  });
const handleNavigate = (examinationId:any) => {
    router.push(`/medical_records/${examinationId}`); // Điều hướng đến trang chi tiết lần khám
};
const columnService = patientServiceData.length > 0 ? createColumns(patientServiceData,undefined, undefined, undefined, columnServiceHeaderMap,undefined,undefined,buttonColumnConfig ) : [];
const columnMedication = medicationsPrescribed.length > 0 ? createColumns(medicationsPrescribed,undefined, undefined, undefined, columnMedicalRecordMedicationHeaderMap) : [];
const columnInpatient = inpatientTreatmentData.length > 0 ? createColumns(inpatientTreatmentData,undefined, undefined, undefined, columnInpatientHeaderMap,undefined, undefined,buttonColumnConfigInpatient) : [];
const columnPayment = paymentTableData.length > 0 ? createColumns(paymentTableData, undefined, undefined, undefined, columnPaymentHeaderMap) : [];
const columnMedicationUse = patientMedicationUseData.length > 0 ? createColumns(patientMedicationUseData, undefined, undefined, undefined, columnMedicaionUseHeaderMap) : [];
const columnDailyHealth = dailyHealthData.length > 0 ? createColumns(dailyHealthData, undefined, undefined, undefined,columnDailyHealthHeaderMap ) : [];
// Chuyển đổi chi tiết hóa đơn thành định dạng bảng



return (
        <main className="flex w-full flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 col bg-muted/40">
        <div className="w-full items-center">
          <h1 className="text-lg font-semibold md:text-xl">Thông tin chi tiết khám</h1>
        
        </div>
        <div
          className="flex flex-col flex-1 rounded-lg px-5 border border-dashed shadow-sm" x-chunk="dashboard-02-chunk-1"
        >
          <Dialog open={isOpenChangeDepartment} 
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setIsOpenChangeDepartment(false);           
              }
              setIsOpenChangeDepartment(isOpen);
            }}
            >
             <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Chọn khoa muốn chuyển đến</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-3">
                                        <div className="grid grid-cols-2 gap-4">
                                        <FormField 
                                      control={form.control}
                                      name="department"
                                      render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                          <FormLabel className="mr-2">Khoa</FormLabel>
                                          <FormControl className="flex-grow">
                                            <Combobox<number>
                                              options={departments}
                                              onSelect={handleSelectRecords}
                                              placeholder="Chọn khoa"
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField 
                                      control={form.control}
                                      name="room"
                                      render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                          <FormLabel className="mr-2">Phòng</FormLabel>
                                          <FormControl className="flex-grow">
                                            <Combobox<number>
                                              options={departments}
                                              onSelect={handleSelectRecords}
                                              placeholder="Chọn Phòng"
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                                    <FormField 
                                      control={form.control}
                                      name="position"
                                      render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                          <FormLabel className="mr-2">Chọn Giường</FormLabel>
                                          <FormControl className="flex-grow">
                                            <Combobox<number>
                                              options={departments}
                                              onSelect={handleSelectRecords}
                                              placeholder="Chọn giường"
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                                    <FormField 
                                      control={form.control}
                                      name="position"
                                      render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                          <FormLabel className="mr-2">Chọn bác sĩ điều trị</FormLabel>
                                          <FormControl className="flex-grow">
                                            <Combobox<number>
                                              options={departments}
                                              onSelect={handleSelectRecords}
                                              placeholder="Chọn bác sĩ điều trị"
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                        </div>
                                      </div>

                      <Button>Save changes</Button>
         
                  </DialogContent>
                </form>
            </Form>
              </Dialog>
          <Dialog open={isOpenResultService} 
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setIsOpenResultService(false);
  
              setItemServiceResultDetail({});
              setItemServiceResult(null);
             
            }
            setIsOpenResultService(isOpen);
          }}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Thông tin chi tiết dịch vụ</DialogTitle>
              </DialogHeader>
              {itemServiceResult !== null ? (
                <div className="space-y-2">
                  {/* Thông tin cơ bản */}
                  <p>
                    <strong>Dịch vụ:</strong> {itemServiceResult.service_name}
                  </p>
                  <p>
                    <strong>Mô tả:</strong> {itemServiceResult.description}
                  </p>
                  <p>
                    <strong>Khoa:</strong> {itemServiceResult.department}
                  </p>
                  <p>
                    <strong>Phòng:</strong> {itemServiceResult.room}
                  </p>
                  <p>
                    <strong>Bác sĩ phụ trách:</strong> {itemServiceResult.doctor_name}
                  </p>
                 
                 

                  {/* Thông tin chi tiết */}
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold border-t mt-4 mb-2 text-green-500">Kết quả chi tiết:</h3>
                    <div className="flex flex-col gap-4">
                      {Object.entries(itemServiceResultDetail).map(([key, value], index) => (
                        <span key={index}>
                        {key !== "conclusion" ? (
                          <>
                            <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> <i>{value}</i>
                          </>
                        ) : (
                          <>
                            <strong className='text-green-500'>Kết luận:</strong> {value}
                          </>
                        )}
                      </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-red-600 font-semibold text-center py-4">
                  Bệnh nhân chưa thực hiện dịch vụ
                </div>
              )}

              <DialogFooter>
                <Button onClick={closeDialogServiceResult} className="btn btn-primary">
                  Đóng
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isOpenAddService} 
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setIsOpenAddService(false);           
            }
            setIsOpenResultService(isOpen);
          }}
          >
             <Form {...form}>
             <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle>Chỉ định dịch vụ</DialogTitle>
              </DialogHeader>
                    <div className="grid gap-3">
                            <div className="grid grid-cols-2 gap-4">
                            <FormField 
                          control={form.control}
                          name="department"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="mr-2">Khoa</FormLabel>
                              <FormControl className="flex-grow">
                                <Combobox<number>
                                  options={departments}
                                  onSelect={handleSelectRecords}
                                  placeholder="Chọn khoa"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField 
                          control={form.control}
                          name="room"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="mr-2">Phòng</FormLabel>
                              <FormControl className="flex-grow">
                                <Combobox<number>
                                  options={departments}
                                  onSelect={handleSelectRecords}
                                  placeholder="Chọn Phòng"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                          <FormField 
                          control={form.control}
                          name="position"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="mr-2">Nhóm dịch vụ</FormLabel>
                              <FormControl className="flex-grow">
                                <Combobox<number>
                                  options={departments}
                                  onSelect={handleSelectRecords}
                                  placeholder="Chọn nhóm dịch vụ"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                                        <FormField 
                          control={form.control}
                          name="position"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="mr-2">Dịch vụ</FormLabel>
                              <FormControl className="flex-grow">
                                <Combobox<number>
                                  options={departments}
                                  onSelect={handleSelectRecords}
                                  placeholder="Chọn dịch vụ"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                            </div>
                        <Button>Save changes</Button>
                          </div>
                                
            </DialogContent>
            </form>
            </Form>
          </Dialog>
          <Card className='mb-5 mt-5'>
              <CardHeader className='pb-4 border-b mb-4'>
                <CardTitle>Thông tin chi tiết của bệnh nhân</CardTitle>
                <CardDescription>
                  Chi tiết các thông tin cá nhân của bệnh nhân
                </CardDescription>
                <div className='grid grid-cols-3 gap-4 border-t'>
                  <div className="grid grid-cols-1 p-4 ">
                        <div> <strong>Thông tin chung</strong></div>
                        <div><strong>Lý do khám:</strong> {medicalInfor.reason}</div>
                        <div><strong>Bác sĩ khám:</strong> {medicalInfor.doctor}</div>
                        <div><strong>Ngày vào khám:</strong> {medicalInfor.admissionDate}</div>
                        <div><strong>Ngày ra:</strong> {medicalInfor.dischargeDate}</div>
                    </div>
                    <div className="grid grid-cols-1 p-4">
                        <div> <strong>Chỉ số sức khỏe</strong></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div><strong>Nhiệt độ cơ thể:</strong> {healthRecords.temperature} <i>(Độ C)</i> </div>
                          <div><strong>Huyết áp:</strong> {healthRecords.blood_pressure} <i>(mmHg)</i> </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div><strong>Nhịp tim:</strong> {healthRecords.heart_rate} <i>(Nhịp / ph)</i> </div>
                          <div><strong>Đường huyết:</strong> {healthRecords.blood_sugar} <i>(mol/l)</i> </div>
                        </div>
                        <div><strong>Ghi chú:</strong> {healthRecords.note}</div>
                       
                    </div>
                    <div className="grid grid-cols-1 p-4">
                        <div> <strong>Bác sĩ nhận xét</strong></div>
                        <div><strong>Chuẩn đoán:</strong> {medicalInfor.diagnosis}</div>
                        <div><strong>Kết luận:</strong> {medicalInfor.conclusion}</div>
                        {/* <div><strong>Ngày tái khám:</strong> {medicalInfor.followUpDate}</div>
                        <div><strong>Điều trị nội trú:</strong> {medicalInfor.inpatientTreatment ? "Có" : "Không"}</div>
                        <p><i>Tình trạng bệnh xấu:</i><strong className='text-green-500 cursor-pointer' onClick={changeDepartment}> Nhập viện </strong> </p> */}
                        {/* <div><strong>Tình trạng tái khám:</strong> {medicalInfor.followUpStatus}</div> */}
                        <div><strong>Ghi chú:</strong>: </div>
                    </div>
                </div>
                 
              </CardHeader >
             
              <CardContent className="space-y-2">
              <div>
                <div className="flex flex-col gap-1 border-b pb-5">
                <div className="mb-6 border-b">
                  <h3 className="text-lg font-bold">Dịch Vụ Đã Thực Hiện</h3>
                  {/* Thêm mã hiển thị bảng dịch vụ ở đây */}
              </div>  
                <div className='flex mt-5 justify-between'>
              
                  <Combobox<number>
                  options={numberOptions}
                  onSelect={handleSelectRecords}
                  placeholder="Chọn số bản ghi"  // Thêm placeholder tùy chỉnh
                  />
        

                <div className="flex items-center space-x-5">
                      <div className='flex'>
                      <Combobox<number>
                        options={numberOptions}
                        onSelect={handleSelectRecords}
                        placeholder="Chọn tình trạng"  // Thêm placeholder tùy chỉnh
                      />
                      </div>
                      <div className="flex items-center space-x-2 bg-white">
                        <Input type="text" placeholder="Tìm kiếm" />
                        <Button type="submit">Lọc</Button>
                      </div>
                </div>
                </div>
                </div>
                <div>
                  <DataTable
                    data={patientServiceData}
                    columns={columnService}
                    totalRecords={totalRecords}
                    pageIndex={pageIndex}
                    pageSize={limit}
                    onPageChange={(newPageIndex) => {
                      console.log("pageindex:", newPageIndex)
                      setPageIndex(newPageIndex) // Cập nhật pageIndex với giá trị mới
                    }}
                  />
                </div>
              </div>
              
              <Dialog open={isOpenAddMedication} 
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setIsOpenAddMedication(false);           
              }
              setIsOpenAddMedication(isOpen);
            }}
            >

             <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="mb-6 border-b max-w-[600px]">
                  <h3 className="text-lg font-bold mb-4">Nhận xét của bác sĩ</h3>
                  <FormField
                                          control={form.control}
                                          name="conclusion"
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Kết luận</FormLabel>
                                              <FormControl>
                                                <Textarea
                                                  {...field}
                                                  disabled={isPending}
                                                  placeholder="kết luận"
                                                  type="teratext"
                                                />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                  <FormField
                                          control={form.control}
                                          name="note"
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Ghi chú</FormLabel>
                                              <FormControl>
                                                <Textarea
                                                  {...field}
                                                  disabled={isPending}
                                                  placeholder="Ghi chú: cần nhập viện hay điều trị ngoại trú"
                                                  type="teratext"
                                                />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
              </div> 
              
                </form>
            </Form>
            <div className=' flex gap-2'>
                <Button  onClick={() => setPrescriptionVisible(!isPrescriptionVisible)}> Kê thuốc</Button>
                <Button> Nhập viện</Button>
              </div>
             <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Kê đơn thuốc</DialogTitle>
                    </DialogHeader>
                      <div className="grid gap-3">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField 
                            control={form.control}
                            name="department"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel className="mr-2">Nhóm dược</FormLabel>
                                <FormControl className="flex-grow">
                                  <Combobox<number>
                                    options={departments}
                                    onSelect={handleSelectRecords}
                                    placeholder="Chọn nhóm dược"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField 
                            control={form.control}
                            name="department"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel className="mr-2">Dược</FormLabel>
                                <FormControl className="flex-grow">
                                  <Combobox<number>
                                    options={departments}
                                    onSelect={handleSelectRecords}
                                    placeholder="Chọn dược"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Liều lượng</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      disabled={isPending}
                                      placeholder="Example: 80"
                                      type="text"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                              />
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Đơn vị</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    disabled={isPending}
                                    placeholder="Example:viên"
                                    type="text"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                            />
                        </div>
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ghi chú</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  disabled={isPending}
                                  placeholder="Example: Uống sau ăn, 2 viên 1 lần"
                                  type="teratext"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button>Save changes</Button>
                      </div>           
                  </DialogContent>
                </form>
            </Form>
              </Dialog>
              
              {isPrescriptionVisible && (
        <div>
          <div className="flex flex-col gap-1 border-b pb-5">
            <div className="mb-6 border-b">
              <h3 className="text-lg font-bold">Đơn Thuốc Ngoại Trú</h3>
            </div>

            <div className='flex mt-5 justify-between'>
              <Combobox<number>
                options={numberOptions}
                onSelect={handleSelectRecords}
                placeholder="Chọn số bản ghi" // Thêm placeholder tùy chỉnh
              />
              
              <div className="flex items-center space-x-5">
                <div className='flex'>
                  <Combobox<number>
                    options={numberOptions}
                    onSelect={handleSelectRecords}
                    placeholder="Chọn tình trạng" // Thêm placeholder tùy chỉnh
                  />
                </div>
                <div className="flex items-center space-x-2 bg-white">
                  <Input type="text" placeholder="Tìm kiếm" />
                  <Button type="submit">Lọc</Button>
                </div>
                <Button className='ml-5' onClick={addMedication}>+ Thêm mới</Button>
              </div>
            </div>
          </div>
          
          <div>
            <DataTable
              data={medicationsPrescribed}
              columns={columnMedication}
              totalRecords={totalRecords}
              pageIndex={pageIndex}
              pageSize={limit}
              onPageChange={(newPageIndex) => {
                console.log("pageindex:", newPageIndex);
                setPageIndex(newPageIndex); // Cập nhật pageIndex với giá trị mới
              }}
            />
          </div>
        </div>
      )}


             
              <div>
                <div className="flex flex-col gap-1 border-b pb-5">
                <div className="mb-6 border-b">
                  <h3 className="text-lg font-bold">Thông tin nội trú</h3>
                  {/* Thêm mã hiển thị bảng dịch vụ ở đây */}
              </div>  
                <div className='flex mt-5 justify-between'>
              
                  <Combobox<number>
                  options={numberOptions}
                  onSelect={handleSelectRecords}
                  placeholder="Chọn số bản ghi"  // Thêm placeholder tùy chỉnh
                  />
                <div className="flex items-center space-x-5">
                        <div className='flex'>
                          <Combobox<number>
                            options={numberOptions}
                            onSelect={handleSelectRecords}
                            placeholder="Chọn tình trạng"  // Thêm placeholder tùy chỉnh
                          />
                        </div>
                        <div className="flex items-center space-x-2 bg-white">
                          <Input type="text" placeholder="Tìm kiếm" />
                          <Button type="submit">Lọc</Button>
                        </div>
                       <Button className='ml-5' onClick={addService}>+ Thêm mới</Button>
                    
                      </div>
                      </div>
                      </div>
                      <div>
                        <DataTable
                          data={inpatientTreatmentData}
                          columns={columnInpatient}
                          totalRecords={totalRecords}
                          pageIndex={pageIndex}
                          pageSize={limit}
                          onPageChange={(newPageIndex) => {
                            console.log("pageindex:", newPageIndex)
                            setPageIndex(newPageIndex) // Cập nhật pageIndex với giá trị mới
                          }}
                        />
                      </div>
                      {treatmentSession ? ( 
                        <Card>
                        <CardHeader className='border-b pb-2'>
                          <CardTitle>Thông tin chi tiết đợt điều trị</CardTitle>
                            <div className='flex justify-between'>
                                <div>
                                  <p><strong>Lý do điều trị:</strong> {treatmentSession.reasonForTreatment}</p>
                                  <p><strong>Khoa:</strong> {treatmentSession.department}</p>
                                  <p><strong>Phòng:</strong> {treatmentSession.room}</p>
                                  <p><strong>Giường:</strong> {treatmentSession.bed}</p>
                                  <p><strong>Bác sĩ phụ trách:</strong> {treatmentSession.treatingDoctor}</p>
                                  <p><strong>Ghi chú:</strong> {treatmentSession.notes}</p>
                                </div>

                                <div className='max-w-[425px] mr-5'>
                                  <div >
                                    <i>Đợt điều trị:</i> <strong className='text-green-500'>{treatmentSession && treatmentSession.id === BigInt(inpatientTreatmentData.length) ? "Hiện tại" : `${treatmentSession?.id}`}.</strong>
                                  </div>
                                  <div>
                                    <i>Tình trạng:</i> <strong className='text-green-500'> {treatmentSession?.treatmentStatus}</strong>
                                  </div>
                                  <p><i>Tình trạng bệnh xấu:</i><strong className='text-green-500 cursor-pointer' onClick={changeDepartment}> Chuyển khoa </strong> </p>
                                  <p><strong>Ngày bắt đầu:</strong> {treatmentSession.start_date.toLocaleDateString()}</p>
                                  <p><strong>Ngày kết thúc:</strong> {treatmentSession.end_date ? treatmentSession.end_date.toLocaleDateString() : "Chưa xác định"}</p>
                                
                                </div>
                            </div>
                         
                        </CardHeader>
                        <CardContent>
                        <div>
                          <div className="flex flex-col gap-1 border-b py-3">
                          <div className="mb-2 border-b">
                            <h3 className="text-lg font-bold">Đơn thuốc chỉ định</h3>
                            {/* Thêm mã hiển thị bảng dịch vụ ở đây */}
                        </div>  
                          <div className='flex justify-between'>
                        
                            <Combobox<number>
                            options={numberOptions}
                            onSelect={handleSelectRecords}
                            placeholder="Chọn số bản ghi"  // Thêm placeholder tùy chỉnh
                            />
                  

                          <div className="flex items-center space-x-5">
                                <div className='flex'>
                                <Combobox<number>
                                  options={numberOptions}
                                  onSelect={handleSelectRecords}
                                  placeholder="Chọn tình trạng"  // Thêm placeholder tùy chỉnh
                                />
                                </div>
                                <div className="flex items-center space-x-2 bg-white">
                                  <Input type="text" placeholder="Tìm kiếm" />
                                  <Button type="submit">Lọc</Button>
                                </div>
                                <Button className='ml-5' onClick={addMedication}>+ Thêm mới</Button>
                              
                          </div>
                          </div>
                          </div>
                          <div>
                            <DataTable
                              data={medicationsPrescribed}
                              columns={columnMedication}
                              totalRecords={totalRecords}
                              pageIndex={pageIndex}
                              pageSize={limit}
                              onPageChange={(newPageIndex) => {
                                console.log("pageindex:", newPageIndex)
                                setPageIndex(newPageIndex) // Cập nhật pageIndex với giá trị mới
                              }}
                            />
                          </div>
                        </div>

                        <div>
                        <div className="flex flex-col gap-1 border-b pb-5">
                        <div className="mb-6 border-b">
                          <h3 className="text-lg font-bold">Dịch Vụ Được Chỉ định thêm</h3>
                          {/* Thêm mã hiển thị bảng dịch vụ ở đây */}
                      </div>  
                        <div className='flex mt-5 justify-between'>
                      
                          <Combobox<number>
                          options={numberOptions}
                          onSelect={handleSelectRecords}
                          placeholder="Chọn số bản ghi"  // Thêm placeholder tùy chỉnh
                          />
                

                        <div className="flex items-center space-x-5">
                              <div className='flex'>
                              <Combobox<number>
                                options={numberOptions}
                                onSelect={handleSelectRecords}
                                placeholder="Chọn tình trạng"  // Thêm placeholder tùy chỉnh
                              />
                              </div>
                              <div className="flex items-center space-x-2 bg-white">
                                <Input type="text" placeholder="Tìm kiếm" />
                                <Button type="submit">Lọc</Button>
                              </div>
                              <Button className='ml-5' onClick={addService}>+ Thêm mới</Button>
                            
                        </div>
                        </div>
                        </div>
                <div>
                  <DataTable
                    data={patientServiceData}
                    columns={columnService}
                    totalRecords={totalRecords}
                    pageIndex={pageIndex}
                    pageSize={limit}
                    onPageChange={(newPageIndex) => {
                      console.log("pageindex:", newPageIndex)
                      setPageIndex(newPageIndex) // Cập nhật pageIndex với giá trị mới
                    }}
                  />
                </div>
                        </div>

                        <div>
                        <div className="flex flex-col gap-1 border-b pb-5">
                        <div className="mb-6 border-b">
                          <h3 className="text-lg font-bold">Thống kê dược sử dụng</h3>
                          {/* Thêm mã hiển thị bảng dịch vụ ở đây */}
                      </div>  
                        <div className='flex mt-5 justify-between'>
                      
                          <Combobox<number>
                          options={numberOptions}
                          onSelect={handleSelectRecords}
                          placeholder="Chọn số bản ghi"  // Thêm placeholder tùy chỉnh
                          />
                

                        <div className="flex items-center space-x-5">
                              <div className='flex'>
                              <Combobox<number>
                                options={numberOptions}
                                onSelect={handleSelectRecords}
                                placeholder="Chọn tình trạng"  // Thêm placeholder tùy chỉnh
                              />
                              </div>
                              <div className="flex items-center space-x-2 bg-white">
                                <Input type="text" placeholder="Tìm kiếm" />
                                <Button type="submit">Lọc</Button>
                              </div>
                              <Button className='ml-5' onClick={addMedication}>+ Thêm mới</Button>
                            
                        </div>
                        </div>
                        </div>
                <div>
                  <DataTable
                    data={patientMedicationUseData}
                    columns={columnMedicationUse}
                    totalRecords={totalRecords}
                    pageIndex={pageIndex}
                    pageSize={limit}
                    onPageChange={(newPageIndex) => {
                      console.log("pageindex:", newPageIndex)
                      setPageIndex(newPageIndex) // Cập nhật pageIndex với giá trị mới
                    }}
                  />

                
              <Dialog open={isOpenAddDailyHealth} 
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setIsOpenAddDailyHealth(false);           
              }
              setIsOpenAddDailyHealth(isOpen);
            }}
            >
             <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Chỉ số sức khỏe</DialogTitle>
                      <DialogDescription>
                      Các chỉ số đo lường tình trạng sức khỏe
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6">
                                      <div className="grid gap-3">
                                        <div className="grid grid-cols-2 gap-2">
                                          <FormField
                                            control={form.control}
                                            name="temperature"
                                            render={({ field }) => (
                                              <FormItem>
                                                <FormLabel>Nhiệt độ thân thể(Đơn vị đo:Độ C)</FormLabel>
                                                <FormControl>
                                                  <Input
                                                    {...field}
                                                    disabled={isPending}
                                                    placeholder="18"
                                                    type="text"
                                                  />
                                                </FormControl>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          />
                              
                                          <FormField
                                            control={form.control}
                                            name="blood_pressure"
                                            render={({ field }) => (
                                              <FormItem>
                                                <FormLabel>Huyết áp( Đơn vị đó: mmHg)</FormLabel>
                                                <FormControl>
                                                  <Input
                                                    {...field}
                                                    disabled={isPending}
                                                    placeholder="80"
                                                    type="text"
                                                  />
                                                </FormControl>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                        <FormField
                                            control={form.control}
                                            name="heart_rate"
                                            render={({ field }) => (
                                              <FormItem>
                                                <FormLabel>Nhịp tim (nhịp / ph)</FormLabel>
                                                <FormControl>
                                                  <Input
                                                    {...field}
                                                    disabled={isPending}
                                                    placeholder="80"
                                                    type="text"
                                                  />
                                                </FormControl>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          />
                              
                                          <FormField
                                            control={form.control}
                                            name="blood_sugar"
                                            render={({ field }) => (
                                              <FormItem>
                                                <FormLabel>Đường huyết( Đơn vị đo:ml/lit)</FormLabel>
                                                <FormControl>
                                                  <Input
                                                    {...field}
                                                    disabled={isPending}
                                                    placeholder="80"
                                                    type="text"
                                                  />
                                                </FormControl>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          />
                                           
                                        </div>
                                      </div>

                                      <FormField
                                          control={form.control}
                                          name="note"
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Ghi chú</FormLabel>
                                              <FormControl>
                                                <Textarea
                                                  {...field}
                                                  disabled={isPending}
                                                  placeholder="Tình trạng tổng quan đáng báo động"
                                                  type="teratext"
                                                />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
     
                                  </div>

                      <Button>Save changes</Button>
         
                  </DialogContent>
                </form>
            </Form>
              </Dialog>

                </div>
                        </div>

                        <div>
                        <div className="flex flex-col gap-1 border-b pb-5">
                        <div className="mb-6 border-b">
                          <h3 className="text-lg font-bold">Bảng theo dõi tình trạng bệnh</h3>
                          {/* Thêm mã hiển thị bảng dịch vụ ở đây */}
                      </div>  
                        <div className='flex mt-5 justify-between'>
                      
                          <Combobox<number>
                          options={numberOptions}
                          onSelect={handleSelectRecords}
                          placeholder="Chọn số bản ghi"  // Thêm placeholder tùy chỉnh
                          />
                

                        <div className="flex items-center space-x-5">
                              <div className='flex'>
                              <Combobox<number>
                                options={numberOptions}
                                onSelect={handleSelectRecords}
                                placeholder="Chọn tình trạng"  // Thêm placeholder tùy chỉnh
                              />
                              </div>
                              <div className="flex items-center space-x-2 bg-white">
                                <Input type="text" placeholder="Tìm kiếm" />
                                <Button type="submit">Lọc</Button>
                              </div>
                              <Button className='ml-5' onClick={addDailyHealth}>+ Thêm mới</Button>
                            
                        </div>
                        </div>
                        </div>
                <div>
                  <DataTable
                    data={dailyHealthData}
                    columns={columnDailyHealth}
                    totalRecords={totalRecords}
                    pageIndex={pageIndex}
                    pageSize={limit}
                    onPageChange={(newPageIndex) => {
                      console.log("pageindex:", newPageIndex)
                      setPageIndex(newPageIndex) // Cập nhật pageIndex với giá trị mới
                    }}
                  />
                </div>
                        </div>
                        </CardContent>
                      </Card>)
                      : (
                        <p>Không có thông tin chi tiết đợt điều trị.</p>
                      )}
              </div>
              <div>
                <div className="flex flex-col gap-1 border-b pb-5">
                <div className="mb-6 border-b">
                  <h3 className="text-lg font-bold">Thông tin thanh toán</h3>
                  {/* Thêm mã hiển thị bảng dịch vụ ở đây */}
              </div>  
                <div className='flex mt-5 justify-between'>
              
                  <Combobox<number>
                  options={numberOptions}
                  onSelect={handleSelectRecords}
                  placeholder="Chọn số bản ghi"  // Thêm placeholder tùy chỉnh
                  />
        

                <div className="flex items-center space-x-5">
                      <div className='flex'>
                      <Combobox<number>
                        options={numberOptions}
                        onSelect={handleSelectRecords}
                        placeholder="Chọn tình trạng"  // Thêm placeholder tùy chỉnh
                      />
                      </div>
                      <div className="flex items-center space-x-2 bg-white">
                        <Input type="text" placeholder="Tìm kiếm" />
                        <Button type="submit">Lọc</Button>
                      </div>
                      <Button className='ml-5' onClick={addService}>+ Thêm mới</Button>
                    
                </div>
                </div>
                </div>
                <div>
                <DataTable
                      data={paymentTableData}
                      columns={columnPayment}
                      totalRecords={paymentTableData.length}
                      pageIndex={pageIndex}
                      pageSize={limit}
                      onPageChange={(newPageIndex) => {
                          console.log("pageindex:", newPageIndex);
                          setPageIndex(newPageIndex); // Cập nhật pageIndex với giá trị mới
                      }}
                  />
                </div>
              </div>

  
              </CardContent>  
          </Card >
          </div>
      </main>
  );
};

export default MedicalRecordDetail;