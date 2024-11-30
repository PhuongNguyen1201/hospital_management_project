"use client";
export const description =
  "An orders dashboard with a sidebar navigation. The sidebar has icon navigation. The content area has a breadcrumb and search in the header. The main area has a list of recent orders with a filter and export button. The main area also has a detailed view of a single order with order details, shipping information, billing information, customer information, and payment information."
import React, { useEffect, useState, useTransition } from 'react'
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
import {  MedicalRecordRecordService,  RoomType, UserInfoType } from '@/types';
import { useParams, useRouter } from 'next/navigation'
import createColumns from '@/components/column-custom';
import { DataTable } from '@/components/data-table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ChevronLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { CreateUserSchema, PatientSchema } from '@/schema';
import * as z from "zod"
import { zodResolver } from '@hookform/resolvers/zod';
import { toast, useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@/components/context/UserContext';
import axios from 'axios';

// user tức nhân viên có thể là bác sĩ xét nghiệm đăng nhập vào hệ thống thì sẽ lấy ra được room Id -> sau đó lấy được các bệnh nhân được phân vào room id
// lấy các thông tin về phòng
// lấy các thông tin về dịch vụ

const columnHeaderMap: { [key: string]: string } = {
  patient_name: "Tên bệnh nhân",
  gender: "Giới tính",
  birthday_date: "Năm sinh",
  phone: "Điện thoại",
};

const numberOptions = [
  { value: 10, label: "10 bản ghi" },
  { value: 20, label: "20 bản ghi" },
  { value: 40, label: "40 bản ghi" },
]
 
const MedicalRecordService = () => {
  const router = useRouter(); 
   // Các giá trị lọc
  
   const [keyword, setKeyword] = useState('');
   const [limit, setLimit] = useState(20); // Mặc định không hiển thị bản ghi nào
   const [totalRecords, setTotalRecords] = useState(1);
   const [pageIndex, setPageIndex] = useState(1);

 // infor room:
 const [inforRoom, setInforRoom]=useState<RoomType>();
 const [medicalReacordServices, setMedicalRecordServices]=useState<MedicalRecordRecordService[]>([]);

   const user = useUser();  // Giả sử đây là hook lấy thông tin người dùng
  let currentUser: UserInfoType | null = null;

  // Kiểm tra nếu user và currentUser tồn tại
  if (user && user.currentUser) {
    currentUser = user.currentUser;
  }
  const { room_id } = useParams(); // Thêm kiểu dữ liệu nếu cần thiết

  // message

  
  const [error,setError]=useState<string|undefined>("");
  const { toast } = useToast()
  const [loading, setLoading] = useState(true);
  const [isPending,startTransition]=useTransition();


  const handleSelecLimit = (value: number | null) => {
    if (value) {
      setLimit(value);
      setPageIndex(1); // Reset về trang 1 khi thay đổi limit
    }
  }


  // Cấu hình cho cột nút
  const buttonColumnConfig = {
    id: 'customButton',
    header: 'Xét nghiệm',
    onClickConfig: (id: string | bigint) => {
      // Điều hướng đến trang chi tiết cho bệnh nhân
      const item: MedicalRecordRecordService | undefined = medicalReacordServices.find(me => me.id === id);
      router.push(`/main/services/medicalrecordservice/${item?.id}`);
    },
    content: 'Thực thi',
  };
  const fetchRooms = async () => {
    if (!currentUser) return; // Không làm gì nếu chưa có thông tin người dùng
  
    setLoading(true); // Bắt đầu trạng thái loading
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/rooms`;
  
    try {
      // Gửi yêu cầu với tham số limit để lấy tất cả các phòng
      const response = await axios.get(endpoint, {
        params: { limit: 1000 } // Truyền tham số limit vào đây
      });
  
      const data = response?.data?.data?.data; // Lấy mảng dữ liệu
      if (Array.isArray(data)) {
        // Thay `room_id` bằng giá trị ID bạn muốn tìm
        const roomData = data.find((item) => Number(item.id) === Number(room_id)); // Tìm phòng có `id` phù hợp
  
        if (roomData) {
          // Chuyển đổi roomData thành kiểu RoomType
          const infoRoom: RoomType = {
            id: roomData.id,
            code: roomData.code,
            description: roomData.room_catalogue?.description || "N/A", // Lấy mô tả từ room_catalogue
            status: roomData.status,
            room_catalogue_id: roomData.room_catalogue_id,
            department_id: roomData.department_id,
            beds_count: roomData.beds_count,
            status_bed: roomData.status_bed,
            department_name: roomData.department?.name || "N/A", // Lấy tên phòng ban từ department
            room_catalogue_code: roomData.room_catalogue?.name || "N/A", // Lấy tên mã phòng từ room_catalogue
          };
  
          setInforRoom(infoRoom);
        } else {
          console.error(`Không tìm thấy phòng với ID: ${room_id}`);
          setInforRoom(undefined); // Nếu không tìm thấy, đặt giá trị null
        }
      } else {
        console.error("Dữ liệu không phải là một mảng:", data);
        setInforRoom(undefined);
      }
    } catch (err) {
      setError("Error fetching rooms. Please try again.");
      console.error("Error fetching rooms:", err);
    } finally {
      setLoading(false); // Kết thúc trạng thái loading
    }
  };
  const fetchMedicalRecordService = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/medicalRecords/list`, {
        params: {
          keyword:keyword,
          room_id,  // Lọc theo room_id
          limit:limit,
        },
      });

      const data = response?.data?.data?.data || [];
      if (!Array.isArray(data)) throw new Error("Invalid response format");
      // Chuyển đổi dữ liệu API thành kiểu `MedicalRecord`
      const fetchedMedicalRecord: MedicalRecordRecordService[] = data
      .filter((item: any) => item.services && item.services.length > 0) // Lọc những mục có services.length > 0
      .map((item: any) => ({
        id: item.id,
        patient_id: item.patient_id,
        patient_name: item.patient.name,
        patient_birthday: item.patient.birthday,
        patient_phone: item.patient.phone,
        user_id: item.user_id,
        room_id: item.room_id,
        visit_date: item.visit_date,
        diagnosis: item.diagnosis,
        notes: item.notes,
        apointment_date: item.apointment_date,
        is_inpatient: item.is_inpatient,
        inpatient_detail: item.inpatient_detail,
        status: item.status,
      }));
    
      setMedicalRecordServices(fetchedMedicalRecord);  // Cập nhật danh sách phòng phụ trách
    } catch (error) {
      console.error("Error fetching medical records:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    

    if (room_id) {
      fetchRooms();
      fetchMedicalRecordService();
    }
  }, [limit, pageIndex,room_id]);  // Khi user_id hoặc room_id thay đổi, gọi lại API
  

  if (loading) {
    return <div>Loading...</div>;
  }
 

  const columns = medicalReacordServices.length > 0 ? createColumns(medicalReacordServices,undefined, undefined, undefined,columnHeaderMap,{view:false,edit: false, delete: false},undefined,buttonColumnConfig ) : [];

    
  return (
        <main className="flex w-full flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 col bg-muted/40">
        <div className="w-full items-center">
        <h1 className="text-lg font-semibold md:text-xl">Quản lý tiếp nhận bệnh nhân xét nghiệm</h1>
          <h1 className="text-lg font-semibold md:text-xl">Khoa: {currentUser?.department_name}</h1>
          <h1 className="text-lg font-semibold md:text-xl">Nhóm phòng: {inforRoom?.room_catalogue_code}</h1>
          <h2 className="text-lg font-semibold md:text-x">Phòng: {inforRoom?.code}</h2>
          <h2 className="text-lg font-semibold md:text-x">Bác sĩ: {currentUser?.name}</h2>
        </div>
        <div
          className="flex flex-col flex-1 rounded-lg px-5 border border-dashed shadow-sm" x-chunk="dashboard-02-chunk-1"
        >
          <Card className='mb-5 mt-5'>
              <CardHeader className='pb-0'>
                <CardTitle>Danh sách các bệnh nhân chờ xét nghiệm</CardTitle>
                <CardDescription>
                  Các bệnh nhân đang chờ xét nghiệm của phòng xét nghiệm 302 khoa Xét nghiệm
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
              <div className="flex flex-col gap-1 border-b pb-5">
              <div className='flex mt-5 justify-between'>

                <Combobox<number>
                options={numberOptions}
                onSelect={handleSelecLimit}
                placeholder="Chọn số bản ghi"  // Thêm placeholder tùy chỉnh
                />
      

              <div className="flex items-center space-x-5">
                    <div className='flex'>
                    </div>
                    <div className="flex items-center space-x-2 bg-white">
                    <Input type="text" placeholder="Tìm kiếm" 
                        value={keyword} // Đặt giá trị từ state keyword
                        onChange={(e) => setKeyword(e.target.value)}
                        />
                      <Button  onClick={() => fetchMedicalRecordService()}>Lọc</Button>
                    </div>
                   
              </div>
              </div>
              </div>
              <div>
                <DataTable
                  data={medicalReacordServices}
                  columns={columns}
                  totalRecords={totalRecords}
                  pageIndex={pageIndex}
                  pageSize={limit}
                  onPageChange={(newPageIndex) => {
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

export default MedicalRecordService;