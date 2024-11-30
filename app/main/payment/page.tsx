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


const columnPartientPaymentHeaderMap: { [key: string]: string } = {
  patientName: "Tên bệnh nhân",
  cccd: "Căn cước CD",
  gender: "Giới tính",
  birthday_date: "Giới tính",
  phone: "Điện thoại",
  admission_date:"Ngày vào viện",
  discharge_date:"Ngày ra viện",
  advanceAmount:"Tổng tiền cần thanh toán",
  amountDue:"Tiền tạm ứng",
  paymentStatus:"Tình trạng thanh toán",
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
const patientPaymentData: PatientPaymentInfo[] = [
  {
    id:BigInt(1),
    patientName: "Nguyễn Văn A",
    cccd: "123456789012",
    gender: 1,
    birthday_date: new Date("1985-06-15"),
    phone: "0912345678",
    admission_date: new Date("2024-10-01"),
    discharge_date: new Date("2024-10-15"),
    advanceAmount: 5000000,
    amountDue: 2000000,
    paymentStatus: 1,
    
  },
  {
    id:BigInt(2),
    patientName: "Trần Thị B",
    cccd: "987654321098",
    gender: 0,
    birthday_date: new Date("1990-09-21"),
    phone: "0987654321",
    admission_date: new Date("2024-09-10"),
    discharge_date: new Date("2024-09-25"),
    advanceAmount: 3000000,
    amountDue: 1500000,
    paymentStatus: 1,
    
  },
  {
    id:BigInt(3),
    patientName: "Lê Văn C",
    cccd: "567890123456",
    gender: 1,
    birthday_date: new Date("2001-01-12"),
    phone: "0901234567",
    admission_date: new Date("2024-10-05"),
    discharge_date:new Date("2024-10-05"),
    advanceAmount: 7000000,
    amountDue: 3000000,
    paymentStatus: 0,
    
  },
  {
    id:BigInt(4),
    patientName: "Hoàng Thị D",
    cccd: "456789012345",
    gender: 0,
    birthday_date: new Date("1978-12-30"),
    phone: "0934567890",
    admission_date: new Date("2024-08-20"),
    discharge_date: new Date("2024-09-10"),
    advanceAmount: 4000000,
    amountDue: 1000000,
    paymentStatus: 1,
    
  },
  {
    id:BigInt(5),
    patientName: "Phạm Văn E",
    cccd: "234567890123",
    gender: 1,
    birthday_date: new Date("2005-11-15"),
    phone: "0967890123",
    admission_date: new Date("2024-10-18"),
    discharge_date: new Date("2024-10-18"),
    advanceAmount: 8000000,
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

    const column = patientPaymentData.length > 0 ? createColumns(patientPaymentData,handleView, handleEdit, handleDelete, columnPartientPaymentHeaderMap,{view: true, edit: false, delete: false},switchConfig ) : [];
   
  return (
        <main className="flex w-full flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 col bg-muted/40">
        <div className="flex w-full items-center">
          <h1 className="text-lg font-semibold md:text-xl">Quản lý tiếp nhận thanh toán</h1>
        
        </div>
        <div
          className="flex flex-col flex-1 rounded-lg px-5 border border-dashed shadow-sm" x-chunk="dashboard-02-chunk-1"
        >
          <Card className='mb-5 mt-5'>
              <CardHeader className='pb-0'>
                <CardTitle>Danh sách các thông tin thanh toán cho bệnh nhân</CardTitle>
                <CardDescription>
                  Thông tin thanh toán của bệnh nhân
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
                  data={patientPaymentData}
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