"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";

// Import UI Components
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/form-error";
import { DataTable } from "@/components/data-table";
import createColumns from "@/components/column-custom";
import { MedicalRecordRecordService, MedicalRecordRecordServicePivot, RoomType, ServicePivot, UserInfoType } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/components/context/UserContext";
import { toast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";


// Mock Patient Data
const patientCurrentlyData = {
  id: BigInt(1),
  patient_id: BigInt(1),
  user_id: BigInt(1),
  gender: 1,
  visit_date: "2024-10-26T10:30:00",
  diagnosis: "Viêm phổi cấp",
  notes: "Bệnh nhân có triệu chứng ho nhiều, khó thở.",
  inpatient_detail: "Điều trị nội trú tại phòng A1, giường 3.",
  examination_status: 2, // 2: Đang khám
};


  
// Khai báo kiểu cho một đối tượng trong detail
interface DetailItem {
    keyword: string;
    name: string;
    reference_range: string;
    unit: string;
    value?: string; // Trường value có thể không có khi chưa điền vào
  }
interface DetailItemConvert {
  keyword: string;
  name: string;
  reference_range: string;
  unit: string;
  value?: string;  // Trường value sẽ được thêm vào sau
  id: string;  // Trường value sẽ được thêm vào sau có thể xóa.
}
const columnHeaderMap: { [key: string]: string } = {
  keywrod: "Từ khóa",
  name: "Tên thuộc tính",
  reference_range:"Khoảng tham chiếu",
  unit:"Đơn vị",
  value:"Kết quả",
};
// Main Component
const ServiceForm = () => {
  const [limit, setLimit] = useState(20); // Mặc định không hiển thị bản ghi nào
  const [totalRecords, setTotalRecords] = useState(1);
  const [pageIndex, setPageIndex] = useState(1);
  const [loading, setLoading] = useState(false);

  const [details, setDetails] = useState<{ [key: string]: any }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [enrichedDetail, setEnrichedDetail] = useState<any[]>([]); // Dữ liệu chi tiết
  
  const [medicalReacordService, setMedicalRecordService]=useState<MedicalRecordRecordServicePivot>();
    const [servicePivots,setServicePivots]=useState<ServicePivot[]>([]);
    const [inforRoom, setInforRoom]=useState<RoomType>();
    const {medicalrecordservice_id}=useParams();
    const router=useRouter();
    const user = useUser();  // Giả sử đây là hook lấy thông tin người dùng
  let currentUser: UserInfoType | null = null;

  // Kiểm tra nếu user và currentUser tồn tại
  if (user && user.currentUser) {
    currentUser = user.currentUser;
  }
  const fetchRoom = async () => {
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
        const roomData = data.find((item) => Number(item.id) === Number(currentUser.room_ids[0])); // Tìm phòng có `id` phù hợp
  
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
          setInforRoom(undefined); // Nếu không tìm thấy, đặt giá trị null
        }
      } else {
        console.error("Dữ liệu không phải là một mảng:", data);
        setInforRoom(undefined);
      }
    } catch (err) {
      console.error("Error fetching rooms:", err);
    } finally {
      setLoading(false); // Kết thúc trạng thái loading
    }
  };
  const fetchMedicalRecordService = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/medicalRecords/list`, {
        params: {
          limit: 1000,
          room_id:Number(currentUser?.room_ids[0])
        },
      });
  
      const data = response?.data?.data?.data || [];
      if (!Array.isArray(data)) {
        console.error("Dữ liệu không phải là một mảng:", data);
        return;
      }
  
      const fetchedMedicalRecord: MedicalRecordRecordServicePivot[] = data
        .filter((item: any) => {
          // Kiểm tra nếu item và item.services tồn tại và là một mảng
          return item && Array.isArray(item.services) && item.services.length > 0 && Number(item.id) === Number(medicalrecordservice_id);
        })
        .map((item: any) => {
          if (!item || !Array.isArray(item.services)) {
            console.warn("Dữ liệu không hợp lệ, thiếu dịch vụ", item);
            return null; // Nếu không có dịch vụ hợp lệ, trả về null
          }
  
          // Nếu dịch vụ hợp lệ, tiếp tục xử lý
          return {
            id: item.id,
            patient_id: item.patient_id,
            patient_name: item.patient.name,
            patient_birthday: item.patient.birthday,
            patient_phone: item.patient.phone,
            patient_gender: item.patient.gender,
            patient_address: item.patient.address,
            patient_cccd_number: item.patient.cccd_number,
            user_id: item.user_id,
            room_id: item.room_id,
            visit_date: item.visit_date,
            diagnosis: item.diagnosis,
            notes: item.notes,
            apointment_date: item.apointment_date,
            is_inpatient: item.is_inpatient,
            inpatient_detail: item.inpatient_detail,
            status: item.status,
            services: Array.isArray(item.services) ? item.services.map((service: any) => ({
              id: service.id,
              name: service.name,
              detail: service.detail,
              description: service.description,
              service_description: service.description,
              pivot: service.pivot ? {
                id: service.pivot.id,
                result_detail: service.pivot.resultDetail, // Lấy thông tin từ pivot
              } : null
            })) : [], // Nếu không có dịch vụ, trả về mảng rỗng
          };
        }).filter(item => item !== null); // Loại bỏ các mục không hợp lệ (null)
        
      if (fetchedMedicalRecord.length === 0) {
        console.warn("Không có bản ghi y tế hợp lệ với dịch vụ");
      }
  
      // Giả sử bạn chỉ muốn lấy bản ghi đầu tiên (nếu có)
      if (fetchedMedicalRecord.length > 0) {
        const servicePivots: ServicePivot[] = fetchedMedicalRecord[0].services;
        setMedicalRecordService(fetchedMedicalRecord[0]);
        setServicePivots(servicePivots);
      }
  
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu bệnh án:", error);
    } finally {
      setLoading(false);
    }
  };
  
// Sử dụng dữ liệu giả lập
useEffect(() => {
    if (user) {
        fetchRoom();
        fetchMedicalRecordService();
    }
  }, []);  
  
  useEffect(() => {
    const enrichedDetailWithValues = servicePivots.map(service => {
      const parsedDetail = JSON.parse(service.detail); // Giải nén chuỗi JSON thành mảng các đối tượng DetailItem
      return parsedDetail.map((item: any) => ({
        ...item,
        value: "", // Khởi tạo trường 'value' với giá trị rỗng
      }));
    }).flat(); // Dùng .flat() để gộp tất cả các mảng con thành một mảng duy nhất

    setEnrichedDetail(enrichedDetailWithValues);
  }, [servicePivots]);

  // Tạo schema Zod cho từng dịch vụ (dynamically)
  const createSchemaForService = (detail: any) => {
    const schemaObject: Record<string, z.ZodString> = {};

    detail.forEach((item: any) => {
      schemaObject[item.keyword] = z.string().min(1, { message: `${item.name} là bắt buộc` });
    });

    return z.object(schemaObject);
  };

   // Sử dụng useForm hook duy nhất
   const form = useForm({
    resolver: zodResolver(createSchemaForService(enrichedDetail)),
  });
  // Xử lý form submit
  const onSubmit = async (data: any) => {
    // Cập nhật enrichedDetail với giá trị từ form
    const enrichedDetailWithValues: DetailItem[] = enrichedDetail.map((item) => ({
      ...item,
      value: data[item.keyword] || "", // Lấy giá trị từ form và gán vào 'value'
    }));
  
    setEnrichedDetail(enrichedDetailWithValues); // Cập nhật lại state
  
    // Tạo kết quả theo cấu trúc yêu cầu
    const resultServiceDetail = servicePivots.map((service) => {
      const parsedDetail: DetailItem[] = JSON.parse(service.detail);
      const updatedDetail = parsedDetail.map((item) => ({
        ...item,
        value:
          enrichedDetailWithValues.find((ed) => ed.keyword === item.keyword)
            ?.value || "",
      }));
  
      return {
        id: service.pivot.id, // 'id' từ 'pivot'
        result_details: JSON.stringify(updatedDetail), // Cập nhật 'result_details'
      };
    });
    // Gọi API để gửi payload
    try {
        const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/medicalRecordService/update`;
      const response = await axios.post(endpoint, resultServiceDetail);
  
      if (response.status === 200) {
        toast({
            variant:"success",
            title: "Thêm thành công",
            description: data?.success,
            action: <ToastAction altText="Tiêp tục">Ok</ToastAction>
          });
          router.back();
      } else {
        toast({
            variant:"destructive",
            title: "Lỗi khi lưu kết quả",
            description: data?.success,
            action: <ToastAction altText="Thử lại">Ok</ToastAction>
          });
    }
      
    } catch (error:any) {
        toast({
            variant:"destructive",
            title: "Thêm thành công",
            description: error,
            action: <ToastAction altText="Thử lại">Ok</ToastAction>
          });
    }
  };
  


 // const columns = enrichedDetailConverColumn.length > 0 ? createColumns(enrichedDetailConverColumn,undefined, undefined, undefined,columnHeaderMap,{view:false,edit: false, delete: false} ) : [];
  return (
    <main className="flex w-full flex-1 flex-col gap-4 p-4 bg-muted/40">
      {/* Service Info */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 flex flex-col gap-4 ">
        <Card>
        <CardHeader>
          <CardTitle>Thông tin dịch vụ</CardTitle>
          <CardDescription>Chi tiết dịch vụ được thực hiện</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
        <h1 className="text-lg font-semibold md:text-xl">Quản lý tiếp nhận bệnh nhân xét nghiệm</h1>
          <h1 className="text-lg font-semibold md:text-xl">Khoa: {currentUser?.department_name}</h1>
          <h1 className="text-lg font-semibold md:text-xl">Nhóm phòng: {inforRoom?.room_catalogue_code}</h1>
          <h2 className="text-lg font-semibold md:text-x">Phòng: {inforRoom?.code}</h2>
          <h2 className="text-lg font-semibold md:text-x">Bác sĩ: {currentUser?.name}</h2>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Thông tin bệnh nhân</CardTitle>
          <CardDescription>Chi tiết thông tin của bệnh nhân</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
        <p><strong>Tên bệnh nhân:</strong> {medicalReacordService?.patient_name || "Không có"}</p>
        <p><strong>Ngày sinh:</strong> {medicalReacordService?.patient_birthday || "Không có"}</p>
        <p><strong>Giới tính:</strong> {medicalReacordService?.patient_gender === 1 ? "Nam" : medicalReacordService?.patient_gender === 2 ? "Nữ" : "Không có"}</p>
        <p><strong>Điện thoại:</strong> {medicalReacordService?.patient_phone || "Không có"}</p>
        <p><strong>Địa chỉ:</strong> {medicalReacordService?.patient_address || "Không có"}</p>
        <p><strong>Số CCCD:</strong> {medicalReacordService?.patient_cccd_number || "Không có"}</p>

        </CardContent>
      </Card>
        </div>
      
      <Card className="flex justify-center items-center flex-col col-span-2">
        <div className="flex justify-between mt-4 w-[600px]">
                <Button size="sm" variant="outline" onClick={()=>{router.back()}}>
                    Quay lại
                </Button>
                <Button type="submit" size="sm" variant="outline" onClick={form.handleSubmit(onSubmit)}>
                    Lưu
                </Button>
        </div>
      <Form {...form}>
            
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-[600px] m-4">
            
            {servicePivots.map((service) => {
            const enrichedDetail = JSON.parse(service.detail).map((item: any) => ({
                ...item,
                value: '', // Khởi tạo giá trị rỗng cho trường value
            }));

            // Tạo schema Zod cho từng dịch vụ (dựa trên chi tiết của dịch vụ)
            const schema = createSchemaForService(enrichedDetail);
            
            // Sử dụng useForm hook ngoài vòng lặp map để tránh gọi lại hook
            return (
                <Card key={service.id}>
                <CardHeader>
                    <CardTitle>Nhập kết quả cho dịch vụ {service.name}</CardTitle>
                    <CardDescription>Mô tả: {service.description}</CardDescription>
                </CardHeader>
                <CardContent>

                    {enrichedDetail.map((item:any) => (
                        <FormField
                        key={item.keyword}
                        control={form.control}
                        name={item.keyword}
                        render={({ field }) => (
                        <FormItem className="mb-4">
                            <FormLabel>
                            <div className="flex justify-between">
                            <p>{item.keyword} ({item.name}) </p>
                            <p>Khoảng: <i>{item.reference_range}</i> (Đơn vị: <i>{item.unit}</i>  ) </p>
                            </div>
                            </FormLabel>
                            <FormControl>
                            <Input {...field} type="text" />
                            </FormControl>
                        </FormItem>
                        )}
                    />
                    ))}
                    

                </CardContent>
                
                </Card>
            );
            })}
            
        </form>

        </Form>
      </Card>
      </div>
     
       
       

    </main>
  );
};

export default ServiceForm;
