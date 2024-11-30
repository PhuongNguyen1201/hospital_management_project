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
import { MedicalRecord, PatientCurrently, PatientPaymentInfo, PatientServiceInfo, ServiceInfo, UserInfoType } from '@/types';
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


const columnHeaderMap: { [key: string]: string } = {
    serviceName: "Dịch vụ",
    department: "khoa",
    room: "Phòng",
    referringDoctor: "Bác sĩ chỉ định",
    servicePrice: "Giá dịch vụ",
    insuranceApplicable:"Áp dụng bảo hiểm",
    insuranceCoveragePercentage:"Phần trăm",
    amountDue:"Giá tiền thanh toán",
    paymentStatus:"Trạng thái thanh toán",
  // Add more mappings as needed
};

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
const patientServiceData: PatientServiceInfo[] = [
    {
        id: BigInt(1),
      serviceName: "Xét nghiệm máu",
      department: "Huyết học",
      room: "101",
      referringDoctor: "Bác sĩ Nguyễn Văn K",
      servicePrice: 500000,
      insuranceApplicable: 1,
      insuranceCoveragePercentage: 80,
      amountDue: 100000,
      paymentStatus: 1,
    },
    {
        id: BigInt(2),
      serviceName: "Chụp X-quang",
      department: "Chẩn đoán hình ảnh",
      room: "202",
      referringDoctor: "Bác sĩ Trần Thị M",
      servicePrice: 300000,
      insuranceApplicable: 0,
      insuranceCoveragePercentage: 0,
      amountDue: 300000,
      paymentStatus: 0,
      
    },
    {
        id: BigInt(3),
      serviceName: "Khám tổng quát",
      department: "Nội tổng hợp",
      room: "305",
      referringDoctor: "Bác sĩ Lê Văn N",
      servicePrice: 700000,
      insuranceApplicable: 1,
      insuranceCoveragePercentage: 50,
      amountDue: 350000,
      paymentStatus: 1,
      
    },
    {
        id: BigInt(4),
      serviceName: "Soi dạ dày",
      department: "Tiêu hóa",
      room: "405",
      referringDoctor: "Bác sĩ Phạm Thị P",
      servicePrice: 1200000,
      insuranceApplicable: 1,
      insuranceCoveragePercentage: 70,
      amountDue: 360000,
      paymentStatus: 1,
      
    },
    {
      id: BigInt(5),
      serviceName: "Phẫu thuật ruột thừa",
      department: "Ngoại khoa",
      room: "501",
      referringDoctor: "Bác sĩ Lê Văn Q",
      servicePrice: 5000000,
      insuranceApplicable: 0,
      insuranceCoveragePercentage: 0,
      amountDue: 5000000,
      paymentStatus: 0,
      
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
  
  const handleClick = () => {
    // Use router in a safe way, like in an event handler or inside useEffect
    router.push('/main/cartegory/user/create');
  };
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
  const handleEdit = (id: string|BigInt) => {
  };
  const handleView = (id: string | BigInt) => {
    // const department: DepartmentType | undefined = departments.find((department) => department.id === id);
    // const name = department?.name;
    // if (name) {
    //   setDeleteItem(department); // Lưu phần tử cần xóa
    // }
  };
  const handleDelete = (id: string | BigInt) => {

  };
  
     // Function to confirm and delete item
     const confirmDelete = async () => {
    };
    const handleSwitchChange = async (id: string | BigInt, newStatus: number) => {
    };
    const switchConfig = [
      { key: "status", onStatusChange: handleSwitchChange },
    ];
    const handlePaymentConfirmation= async () => {
    };
    const column = patientServiceData.length > 0 ? createColumns(patientServiceData,handleView, handleEdit, handleDelete, columnHeaderMap,{view: true, edit: false, delete: false} ) : [];
    const patientCurrentlyData: PatientCurrently = 
{
    id:BigInt(1),
    patient_id: BigInt(1),
    user_id: BigInt(1),
    gender: 1,
    visit_date: "2024-10-26T10:30:00",
    diagnosis: "Viêm phổi cấp",
    notes: "Bệnh nhân có triệu chứng ho nhiều, khó thở.",
    inpatient_detail: "Điều trị nội trú tại phòng A1, giường 3.",
    examination_status: 2, // 2: Đang khám
};

  return (
        <main className="flex w-full flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 col bg-muted/40">
        <div className="flex w-full items-center">
          <h1 className="text-lg font-semibold md:text-xl">Quản lý tiếp nhận thanh toán</h1>
        
        </div>
        <div
          className="flex flex-col flex-1 rounded-lg px-5 border border-dashed shadow-sm" x-chunk="dashboard-02-chunk-1"
        >
            <Card className="mb-5 mt-5">
                  <CardHeader className="pb-0">
                    <CardTitle>Thông tin bệnh nhân</CardTitle>
                    <CardDescription>Chi tiết thông tin của bệnh nhân</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-2">
                    <div>
                      <strong>Mã bệnh nhân:</strong> {patientCurrentlyData.patient_id}
                    </div>
                    <div>
                      <strong>Tên bệnh nhân:</strong> Nguyễn Văn B {/* Ví dụ để hiển thị tên bệnh nhân */}
                    </div>
                    <div>
                      <strong>Giới tính:</strong> {patientCurrentlyData.gender === 1 ? "Nam" : "Nữ"}
                    </div>
                    <div>
                      <strong>Ngày khám:</strong> {new Date(patientCurrentlyData.visit_date).toLocaleString()}
                    </div>
                    <div>
                      <strong>Chẩn đoán:</strong> {patientCurrentlyData.diagnosis}
                    </div>
                    <div>
                      <strong>Ghi chú:</strong> {patientCurrentlyData.notes}
                    </div>
                    <div>
                      <strong>Chi tiết nội trú:</strong> {patientCurrentlyData.inpatient_detail ? patientCurrentlyData.inpatient_detail : "Không"} <strong>(hoặc không)</strong>
                    </div>
                    <div>
                      <strong>Trạng thái khám:</strong> {patientCurrentlyData.examination_status === 2 ? "Đang khám" : "Khác"}
                    </div>
                  </CardContent>
                </Card>
          <Card className='mb-5 mt-5'>
              <CardHeader className='pb-0'>
                <CardTitle>Chi tiết thông tin thanh toán cho bệnh nhân</CardTitle>
                <CardDescription>
                  Chi tiết thông tin thanh toán cho bệnh nhân.
                  Bổ sung các trường thông tin cho bệnh nhân như tên, căn cước...
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
              <div className="flex flex-col gap-1 border-b pb-5">
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
                    <Button className='ml-5' onClick={handleClick}>+ Thêm mới</Button>
                    <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Bạn có chắc chắn muốn xóa không?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Hành động này không thể hoàn tác. Bạn đang xóa chức danh là :{" "}
                            <strong>{deleteItem?.name}</strong>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setDeleteItem(null)}>Hủy</AlertDialogCancel>
                          <AlertDialogAction onClick={confirmDelete}>Xác nhận</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
              </div>
              </div>
              </div>
              <div>
                <DataTable
                  data={patientServiceData}
                  columns={column}
                  totalRecords={totalRecords}
                  pageIndex={pageIndex}
                  pageSize={limit}
                  onPageChange={(newPageIndex) => {
                    console.log("pageindex:", newPageIndex)
                    setPageIndex(newPageIndex) // Cập nhật pageIndex với giá trị mới
                  }}
                />
              </div>
              </CardContent>  
            </Card >
          </div>
      </main>
  );
};

export default PaymentPage;