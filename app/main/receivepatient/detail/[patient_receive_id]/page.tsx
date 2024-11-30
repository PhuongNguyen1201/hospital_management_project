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
import { DailyHealth, MedicalRecord, Patient, PatientCurrently , PatientServiceInfo, RoomType, ServiceCatalogue, ServiceType, UserInfoType } from '@/types';
import { useParams, useRouter } from 'next/navigation'
import createColumns from '@/components/column-custom';
import { DataTable } from '@/components/data-table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ChevronLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from "zod"
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { Textarea } from '@/components/ui/textarea';
import {  PatientServiceSchema } from '@/schema';
import axios from 'axios';

export type ServicePatient={
  id:bigint;
  service_name:string;
  department_name:string;
  room_code:string;
  price:number;
  service_id:bigint;
  room_id:bigint;
}
const columnServicePartientNotHeaderMap={
  service_name:"Tên dịch vụ",
  department_name:"Tên khoa",
  room_code:"Phòng",
  price: "giá",
}

const PatientReceive = () => {
  const router = useRouter(); 
  const [loading, setLoading] = useState(true);
  const [error,setError]=useState<string|undefined>("");
  const [isPending,startTransition]=useTransition();
  const [status, setStatus] = useState<number|null>(null); // Trạng thái không chọn gì
  const [keyword, setKeyword] = useState('');
  const [limit, setLimit] = useState(20); // Mặc định không hiển thị bản ghi nào
  const [totalRecords, setTotalRecords] = useState(1);
  const [pageIndex, setPageIndex] = useState(1);
  const [deleteItem, setDeleteItem] = useState<ServicePatient >();
  
  const [serviceCatalogues,setServiceCatalogues] =useState<ServiceCatalogue []>([]);
 
  const [services,setServices]   =useState<ServiceType [] >([]);

  const [rooms,setRooms]  =useState<RoomType[] >([]);


const [filteredServices, setFilteredServices] = useState<ServiceType[]>([]);
const [filteredRooms, setFilteredRooms] = useState<RoomType[]>([]);
const [confirmSaveDialogOpen, setConfirmSaveDialogOpen] = useState(false);


  const [patient,setPatient]=useState<Patient>();

                                          
  const {patient_receive_id}=useParams();

  const [servicePatients,setServicePatients]=useState<ServicePatient[]>([]);
  const form=useForm<z.infer<typeof PatientServiceSchema>>({
    resolver:zodResolver(PatientServiceSchema),
  });

 
 
  const handleReset = () => {
    form.reset(); 
    form.clearErrors(); 
  };
  const onSubmit = (values: z.infer<typeof PatientServiceSchema>) => {
    const { service_catalogue_id, service_id, room_id } = values;
  
    const service = services.find((s) => BigInt(s.id )=== service_id);
    const room = rooms.find((r) => BigInt(r.id) === room_id);
    if (service && room) {
      // Thêm dịch vụ vào danh sách
      setServicePatients((prev) => {
        const updatedList = [
          ...prev,
          {
            id: service_id + BigInt(1), // Tạo ID mới cho dịch vụ
            service_name: service.name,
            department_name: serviceCatalogues.find((c) => c.id === service_catalogue_id)?.name || "Không xác định",
            room_code: room.code,
            price: service.price,
            service_id,
            room_id,
          },
        ];
        return updatedList;
      });
  
      // Reset form sau khi thêm
      form.reset({
        service_catalogue_id: undefined,
        service_id: undefined,
        room_id: undefined,
      });
    }
  };
  
  const handleSaveConfirmed = () => {
    const payload = {
      medical_record_id: Number(patient_receive_id), // ID của hồ sơ bệnh án
      services: servicePatients.map(({ service_id, room_id, service_name }) => ({
        service_id: Number(service_id),
        service_name,
        room_id: Number(room_id),
        patient_id: Number(patient?.id),
      })),
    };
  
    axios
      .post(`${process.env.NEXT_PUBLIC_API_URL}/api/medicalRecords/createPivot`, payload)
      .then((res) => {
        console.log("Kết quả trả về từ API:", res);
  
        if (res.status === 200) {
          toast({
            variant: "success",
            title: "Thêm dịch vụ thành công",
            description: res.statusText,
          });
          
          setServicePatients([]);
         //router.back();
        } else {
          toast({
            variant: "destructive",
            title: "Lỗi khi thêm dịch vụ",
            description: "Không thể thêm dịch vụ vào hồ sơ bệnh án.",
          });
        }
      })
      .catch((err) => {
        console.error("Lỗi chỉ định:", err);
  
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: err?.response?.data?.message || err.message,
        });
      });
  };
  
  
  
  
  const handleDelete = (id:bigint|string) => {
    // Xóa dịch vụ khỏi danh sách
    setServicePatients((prev) =>
      prev.filter((service) => !(service.id===id))
    );
  };
  

const fetMedicatalRecord= async () => {
  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/medicalRecords`;
  
  try {
      const response = await axios.get(endpoint);

      // Gọi API để lấy tất cả các bản ghi
      const responseAll = await axios.get(endpoint, { params: { limit: 1000 } });
      const { data } = responseAll.data.data;

      if (Array.isArray(data)) {
        const medicalRecords: any = data
          .filter(
            (item: any) =>
              item.status === 0 && BigInt(item.id) === BigInt(Number(patient_receive_id)) // So sánh id chính xác
          )
          const firstRecord = medicalRecords[0]; // Kiểm tra bản ghi đầu tiên
          const patient: Patient | undefined = firstRecord?.patient
            ? {
                id: BigInt(firstRecord.patient.id),
                name: firstRecord.patient.name || "",
                birthday: firstRecord.patient.birthday || "",
                address: firstRecord.patient.address || "",
                phone: firstRecord.patient.phone || undefined,
                cccd_number: firstRecord.patient.cccd_number || "",
                health_insurance_code: firstRecord.patient.health_insurance_code || undefined,
                guardian_phone: firstRecord.patient.guardian_phone || undefined,
                gender: firstRecord.patient.gender,
              }
            : undefined;
            setPatient(patient);
      } else {
          console.warn("Data is not an array:", data);
      }
  } catch (err) {
      console.error("Error fetching service catalogues:", err);
      toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load service catalogues.",
      });
  }
};
const fetchServiceCatalogues = async () => {
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/serviceCatalogues`;
    
    try {
        const response = await axios.get(endpoint);
        const totalRecords = response.data.data.total;

        // Gọi API để lấy tất cả các bản ghi
        const responseAll = await axios.get(endpoint, { params: { limit: totalRecords } });
        const { data } = responseAll.data.data;

        if (Array.isArray(data)) {
            const serviceCatalogueList: ServiceCatalogue[] = data
                .filter((item: any) => item.status === 1)
                .map((item: any) => ({
                    id: BigInt(item.id), // Chuyển id thành bigint
                    name: item.name,
                    description: item.description,
                    status: item.status,
                }));
            setServiceCatalogues(serviceCatalogueList);
        } else {
            console.warn("Data is not an array:", data);
        }
    } catch (err) {
        console.error("Error fetching service catalogues:", err);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load service catalogues.",
        });
    }
};
const fetchServices = async () => {
  setLoading(true) // Bắt đầu trạng thái loading
  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/services`;
  try {
    const response = await axios.get(endpoint, {
      params: {
        limit: 1000, // Số bản ghi trên mỗi trang
      },
    })
    const { data } = response.data.data
    if (Array.isArray(data)) {
      const fetchedServices: ServiceType[] = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        status:item.status,
        detail:item.detail,
        health_insurance_applied:item.health_insurance_applied,
        health_insurance_value:item.health_insurance_value,
        service_catalogue_id: item.service_catalogue_id,
        room_catalogue_id: item.room_catalogue_id,
        // department_name:item.department.name,
        // room_catalogue_code:item.room_catalogue.name,
        
      }));
      setServices(fetchedServices) // Cập nhật danh sách phòng ban
    } else {
      throw new Error('Invalid response format') // Xử lý trường hợp định dạng không hợp lệ
    }
  } catch (err) {
    setError('Error fetching RoomCatalogues') // Xử lý lỗi
    console.error('Error fetching RoomCatalogues:', err)
  } finally {
    setLoading(false) // Kết thúc trạng thái loading
  }
};

const fetchRooms = async () => {
  setLoading(true) // Bắt đầu trạng thái loading
  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/rooms`;
  try {
    const response = await axios.get(endpoint, {
      params: {
        limit: limit, // Số bản ghi trên mỗi trang
        page: pageIndex, // Trang hiện tại
        status: status!==2?status:undefined, // Thêm trạng thái vào tham số API
        keyword: keyword.trim()!==""?keyword:undefined // Thêm từ khóa tìm kiếm vào tham số API
      },
    })
    const { data } = response.data.data
    if (Array.isArray(data)) {
      const fetchedRooms: RoomType[] = data.map((item: any) => ({
        id: item.id,
        code: item.code,
        department_name:item.department.name,
        room_catalogue_code:item.room_catalogue.name,
        description: item.room_catalogue.description,
        beds_count: item.beds_count,
        status_bed:item.status_bed,
        status: item.status,
        department_id: item.department_id,
        room_catalogue_id: item.room_catalogue_id,
        
      }));
  
      setRooms(fetchedRooms) // Cập nhật danh sách phòng ban
      setTotalRecords(response.data.data.total) // Giả sử API trả về tổng số bản ghi
    } else {
      throw new Error('Invalid response format') // Xử lý trường hợp định dạng không hợp lệ
    }
  } catch (err) {
    setError('Error fetching RoomCatalogues') // Xử lý lỗi
    console.error('Error fetching RoomCatalogues:', err)
  } finally {
    setLoading(false) // Kết thúc trạng thái loading
  }
};

useEffect(() => {
  fetMedicatalRecord();
  fetchServiceCatalogues();
  fetchServices();
  fetchRooms();
}, []); // Chỉ chạy một lần khi component được mount

  const handleSelectServiceCatalogue = (value: bigint | null) => {
    if(value!==null){

    form.setValue('service_catalogue_id', BigInt(value)); // Update the form value directly
    // Lọc danh sách services
      const filteredServices = services.filter(
        (service) =>  BigInt(service.service_catalogue_id )=== value
      );
      // Xử lý `filteredServices` tại đây, ví dụ cập nhật state:
      setFilteredServices(filteredServices);
    
    }
  };
const handleSelectService=(value: bigint | null)=>{
  if(value!==null){
    form.setValue('service_id', BigInt(value)); // Update the form value directly
      
      const servicelist= services.filter(
        (service) => service.id === value
      );
      const filteredRooms= rooms.filter(
        (room) => room.room_catalogue_id === servicelist[0].room_catalogue_id
      );
      setFilteredRooms(filteredRooms);
    
    }
};

const handleSelectRoom=(value: bigint | null)=>{
  if(value!==null){
    form.setValue('room_id', BigInt(value)); // Update the form value directly
  }
}
  const columnServicePatient = servicePatients.length > 0 ? createColumns(servicePatients,undefined, undefined, handleDelete,columnServicePartientNotHeaderMap,{view:false,edit: false, delete: true},undefined) : [];

  return (
        <main className="flex w-full flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 col bg-muted/40">
        <div className="flex w-full items-center">
          <h1 className="text-lg font-semibold md:text-xl">Chi tiết thông tin bệnh nhân đến khám</h1>
        </div>
        <div
          className="flex flex-col flex-1 rounded-lg px-5 border border-dashed shadow-sm" x-chunk="dashboard-02-chunk-1"
        >
      
            <Card>
              <CardHeader className='pb-1'>
                <CardTitle>Tiếp nhận mới</CardTitle>
                <CardDescription>
                  Thêm thông tin tiếp nhận cho bệnh nhân
                </CardDescription>
               </CardHeader>
                <CardContent className="space-y-2">
                
                      
                        <div className="mx-auto grid w-full flex-1 auto-rows-max gap-4 mt-4">
                          <div className="flex items-center gap-4">
                            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                              Thông tin bệnh nhân
                            </h1>
                            <div className="hidden items-center gap-2 md:ml-auto md:flex">
                            <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-auto flex items-center gap-1 px-2" // Thêm flex và padding
                                    onClick={() => {
                                      router.back(); // Quay lại trang trước
                                    }}
                                  >
                                    <ChevronLeft className="h-4 w-4" />
                                    <span className='text-sm'>Quay Lại</span>
                                  </Button>

                                    <Button variant="outline" className='text-sm' size="sm" onClick={handleReset}>
                                    Reset
                                  </Button>

                            </div>
                          </div>
                          <div className='grid grid-cols-3 gap-4 border-t'>
                              <div className="grid grid-cols-1 p-4 col-span-1">
                              <p><strong>Tên bệnh nhân:</strong> {patient?.name || "Không có"}</p>
                              <p><strong>Ngày sinh:</strong> {patient?.birthday || "Không có"}</p>
                              <p><strong>Giới tính:</strong> {patient?.gender === 1 ? "Nam" : patient?.gender === 2 ? "Nữ" : "Không có"}</p>
                              <p><strong>Điện thoại:</strong> {patient?.phone || "Không có"}</p>
                              <p><strong>Địa chỉ:</strong> {patient?.address || "Không có"}</p>
                              <p><strong>Số CCCD:</strong> {patient?.cccd_number || "Không có"}</p>
                              <p><strong>Mã thẻ BHYT:</strong> {patient?.health_insurance_code || "Không có"}</p>
                              <p><strong>Điện thoại người giám hộ:</strong> {patient?.guardian_phone || "Không có"}</p>

                              </div>
                            {/* <div className="grid grid-cols-1 p-4 col-span-1">
                                
                                   <div><strong>Lý do khám:</strong> {medicalInfor.reason}</div>
                                   <div><strong>Bác sĩ khám:</strong> {medicalInfor.doctor}</div> 
                                   <div><strong>Ngày khám:</strong> {medicalInfor.admissionDate}</div>  
                                
                              </div>
                              <div className="grid grid-cols-1 p-4 col-span-1">
                                
                                  <div> <strong>Chỉ số sức khỏe</strong></div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div><strong>Nhiệt độ cơ thể:</strong> {healthRecords.temperature} <i className='pl-8'>(Độ C)</i> </div>
                                    <div><strong>Huyết áp:</strong> {healthRecords.blood_pressure} <i className='pl-8'>(mmHg)</i> </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div><strong>Nhịp tim:</strong> {healthRecords.heart_rate} <i className='pl-8'>(Nhịp / ph)</i> </div>
                                    <div><strong>Đường huyết:</strong> {healthRecords.blood_sugar} <i className='pl-8'>(mol/l)</i> </div>
                                  </div>
                                  <div><strong>Ghi chú:</strong> {healthRecords.note}</div> 
                                
                              </div>   */}
                    
                           </div>
                         
                            <div className="grid grid-cols-3 auto-rows-max items-start gap-4 lg:gap-8">
                            
                               {/* <Card x-chunk="dashboard-07-chunk-0" className="col-span-1">
                                <CardHeader>
                                    <CardTitle>Chỉ số sức khỏe</CardTitle>
                                    <CardDescription>
                                      Các chỉ số đo lường tình trạng sức khỏe
                                    </CardDescription>
                                  </CardHeader>
                              
                                  <CardContent>
                                    <div className="grid gap-6">
                                        <div className="grid gap-3">
                                          <div className="grid grid-cols-2 gap-2">
                                            <FormField
                                              control={form.control}
                                              name="temperature"
                                              render={({ field }) => (
                                                <FormItem>
                                                  <FormLabel>Nhiệt độ thân thể (Độ C)</FormLabel>
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
                                                  <FormLabel>Huyết áp (mmHg)</FormLabel>
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
                                                  <FormLabel>Đường huyết (ml/lit)</FormLabel>
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
        <FormField
                                            control={form.control}
                                            name="diagnosis"
                                            render={({ field }) => (
                                              <FormItem>
                                                <FormLabel>Chuẩn đoán</FormLabel>
                                                <FormControl>
                                                  <Textarea
                                                    {...field}
                                                    disabled={isPending}
                                                    placeholder="Bình thường"
                                                    type="teratext"
                                                  />
                                                </FormControl>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          />
                                    </div>
                                  </CardContent>
                                </Card>  */}
                                <Card x-chunk="dashboard-07-chunk-3"  className="col-span-2">
                                  <CardHeader>
                                    <CardTitle>Chỉ định dịch vụ</CardTitle>
                                    <CardDescription>
                                      Chỉ định các dịch vụ cho bệnh nhân
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                  <Form {...form}>
                                  <form onSubmit={form.handleSubmit(onSubmit)}>
                                    <div className=" w-fit grid grid-cols-3 gap-2">
                                          <FormField 
                                        control={form.control}
                                        name="service_catalogue_id"
                                        render={({ field }) => (
                                          <FormItem className="flex flex-col">
                                            <FormLabel className="mr-2">Nhóm dịch vụ</FormLabel>
                                            <FormControl className="flex-grow">
                                              <Combobox<bigint>
                                               options={serviceCatalogues.map(serviceCatalogue => ({
                                                value: serviceCatalogue.id,
                                                label: serviceCatalogue.name,
                                              }))}
                                                onSelect={handleSelectServiceCatalogue}
                                                placeholder="Chọn nhóm dịch vụ"
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
           
                                          <FormField 
                                        control={form.control}
                                        name="service_id"
                                        render={({ field }) => (
                                          <FormItem className="flex flex-col">
                                            <FormLabel className="mr-2">Dịch vụ</FormLabel>
                                            <FormControl className="flex-grow">
                                              <Combobox<bigint>
                                                options={filteredServices.map(service => ({
                                                  value: service.id,
                                                  label: service.name,
                                                }))}
                                                onSelect={handleSelectService}
                                                placeholder="Chọn dịch vụ"
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                      
                                  
                                          <FormField 
                                        control={form.control}
                                        name="room_id"
                                        render={({ field }) => (
                                          <FormItem className="flex flex-col">
                                            <FormLabel className="mr-2">Phòng</FormLabel>
                                            <FormControl className="flex-grow">
                                              <Combobox<bigint>
                                                options={filteredRooms.map(room => ({
                                                  value: room.id,
                                                  label: room.code,
                                                }))}
                                                onSelect={handleSelectRoom}
                                                placeholder="Chọn phòng"
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                                    
                                        
                                      <Button className='w-[100px]' size="sm" variant="outline" onClick={form.handleSubmit(onSubmit)}>Lưu</Button>
                                    </div>
                                  </form>
                                  </Form>
                                   
                                      <Card x-chunk="dashboard-07-chunk-3" className='mt-8 '>
                                      <Button  size="sm" variant="outline" onClick={() => setConfirmSaveDialogOpen(true)}>Lưu dịch vụ</Button>

                                <AlertDialog open={confirmSaveDialogOpen} onOpenChange={setConfirmSaveDialogOpen}>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Xác nhận thêm dịch vụ</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Bạn có chắc chắn muốn thêm các dịch vụ vào hồ sơ bệnh án không? Hành động này không thể hoàn tác.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel onClick={() => setConfirmSaveDialogOpen(false)}>Hủy</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => {
                                          setConfirmSaveDialogOpen(false);
                                          handleSaveConfirmed();
                                        }}
                                      >
                                      Xác nhận
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                                    <CardHeader className='pb-1'>
                                      
                                      <CardTitle>Danh sách các dịch vụ chỉ định</CardTitle>
                                      <CardDescription>
                                        Chỉ định các dịch vụ cho bệnh nhân
                                      </CardDescription>
                                      <div className='border-b'></div>
                                    </CardHeader>
                                    <CardContent >
                                    <div className='flex item-center justify-center'>

                                          {loading ? (
                                          <p className='flex item-center justify-center mt-4'>Bệnh nhân chưa được chỉ định dịch vụ</p>
                                          ) : (

                                          <DataTable
                                          data={servicePatients}
                                          columns={columnServicePatient}
                                          totalRecords={totalRecords}
                                          pageIndex={pageIndex}
                                          pageSize={limit}
                                          onPageChange={(newPageIndex) => {
                                          setPageIndex(newPageIndex) // Cập nhật pageIndex với giá trị mới
                                          }}
                                          />
                                          )}


                                          </div>    
                                    </CardContent>
                                    </Card>
                                  </CardContent>
                                </Card>
                            </div>
                          
                        </div>
                 
                  </CardContent>
            </Card>
          </div>
      </main>
)};

export default PatientReceive;