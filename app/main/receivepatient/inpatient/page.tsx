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
import { DailyHealth, MedicalRecord, MedicalRecordRecordServiceDetail, Patient, PatientCurrently , PatientServiceInfo, RoomType, ServiceCatalogue, ServiceDetailPatientResul, ServicePivot, ServiceType, UserInfoType } from '@/types';
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
import { useUser } from '@/components/context/UserContext';
import { format } from 'date-fns';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export type ServicePatient={
  id:bigint;
  service_name:string;
  department_name:string;
  room_code:string;
  price:number;
  service_id:bigint;
  room_id:bigint;
}
const columnHeaderMap={
  name:"Tên dịch vụ",
  assigning_doctor_name:"Bác sĩ chỉ định",
  health_insurance_applied:"Áp dụng bảo hiểm",
  health_insurance_value: "Phần trăm",
}
const columnHeaderMapDetailResultService={
  keyword:"Từ khóa",
  name:"Thuộc tín",
  reference_range:"Khoảng tham chiếu",
  unit:"Đơn vị",
  value: "Kết quả",
}

const numberOptions = [
  { value: 10, label: "10 bản ghi" },
  { value: 20, label: "20 bản ghi" },
  { value: 40, label: "40 bản ghi" },
]
export  type DetailResultService={
  id:string;
  keyword:string;
  name:string;
  reference_range:string;
  unit:string;
  value:string;
}
const PatientDetail = () => {
  const router = useRouter(); 
  const [status, setStatus] = useState<number|null>(null); // Trạng thái không chọn gì
  const [keyword, setKeyword] = useState('');
  const [limit, setLimit] = useState(20); // Mặc định không hiển thị bản ghi nào
  const [totalRecords, setTotalRecords] = useState(1);
  const [pageIndex, setPageIndex] = useState(1);


  
  const [loading, setLoading] = useState(false);

  const [details, setDetails] = useState<{ [key: string]: any }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [enrichedDetail, setEnrichedDetail] = useState<any[]>([]); // Dữ liệu chi tiết
  
  const [medicalReacordDetail, setMedicalRecordDetail]=useState<MedicalRecordRecordServiceDetail>();
    const [serviceDetailPatients,setServiceDetailPatients]=useState<ServiceDetailPatientResul[]>([]);
    const [seletedService,setSeletedService]=useState<ServiceDetailPatientResul>();
    const [detailResultSelectedService,setDetailResultSelectedService]=useState<DetailResultService[]>([])
    const [inforRoom, setInforRoom]=useState<RoomType>();
    const [isOpenDialogServiceDetailResult, setIsOpenDialogServiceDetailResult] = useState(false);


    const {medical_record_id}=useParams();
  let currentUser: UserInfoType | null = null;
  const user = useUser();  
  // Kiểm tra nếu user và currentUser tồn tại
  if (user && user.currentUser) {
    currentUser = user.currentUser;
  }
  const form=useForm<z.infer<typeof PatientServiceSchema>>({
    resolver:zodResolver(PatientServiceSchema),
  });
  const handleSelecLimit = (value: number | null) => {
    console.log("Selected value:", value)
    if (value) {
      setLimit(value);
      setPageIndex(1); // Reset về trang 1 khi thay đổi limit
    }
  }
 
  const fetchMedicalRecordDetail = async () => {
    try {
        const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/medicalRecords/waitDiagnosis`;
      const room_id = currentUser?.room_ids?.[0] ?? 0;  // Giá trị mặc định là 0 nếu không có room_id
      const response = await axios.get(endpoint, { params: {
          limit: 1000,
          room_id: room_id,
          id: Number(medical_record_id),
        },
      });
  

    
      const data = response?.data?.data || [];  // Kiểm tra response đúng cách
      const fetchedMedicalRecordDetail: MedicalRecordRecordServiceDetail = {
        id: data.id,
        patient_id: data.patient_id,
        patient_name: data.patient.name,
        patient_birthday: data.patient.birthday,
        patient_phone: data.patient.phone,
        patient_gender: data.patient.gender,
        patient_address: data.patient.address,
        patient_cccd_number: data.patient.cccd_number,
        user_id: data.user_id,
        room_id: data.room_id,
        visit_date: data.visit_date,
        diagnosis: data.diagnosis,
        notes: data.notes,
        apointment_date: data.apointment_date,
        is_inpatient: data.is_inpatient,
        inpatient_detail: data.inpatient_detail,
        status: data.status,
        services: Array.isArray(data.services) ? data.services.map((service: any) => ({
          id: service.id,
          name: service.name,
          description: service.description,
          health_insurance_applied: service.health_insurance_applied,
          health_insurance_value: service.health_insurance_value,
          assigning_doctor_id: service.assigning_doctor_id,
          assigning_doctor_name: currentUser?.name,
          pivot_id:service.pivot.id,
          result_detail:service.pivot.result_details,
        })) : [],
      };
  
      if (fetchedMedicalRecordDetail) {
        const serviceDetailPatients: ServiceDetailPatientResul[] = fetchedMedicalRecordDetail.services;
        setMedicalRecordDetail(fetchedMedicalRecordDetail);
        setServiceDetailPatients(serviceDetailPatients);
      }
      console.log(serviceDetailPatients)
  
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu bệnh án:", error);
    } finally {
      setLoading(false);
    }
  };
  
  
// Sử dụng dữ liệu giả lập
useEffect(() => {
        fetchMedicalRecordDetail();
  }, [limit]); 
  const handleReset = () => {
    form.reset(); 
    form.clearErrors(); 
  };
  const onSubmit = (values: z.infer<typeof PatientServiceSchema>) => {
    // const { service_catalogue_id, service_id, room_id } = values;
  
    // const service = services.find((s) => BigInt(s.id )=== service_id);
    // const room = rooms.find((r) => BigInt(r.id) === room_id);
    // if (service && room) {
    //   // Thêm dịch vụ vào danh sách
    //   setServicePatients((prev) => {
    //     const updatedList = [
    //       ...prev,
    //       {
    //         id: service_id + BigInt(1), // Tạo ID mới cho dịch vụ
    //         service_name: service.name,
    //         department_name: serviceCatalogues.find((c) => c.id === service_catalogue_id)?.name || "Không xác định",
    //         room_code: room.code,
    //         price: service.price,
    //         service_id,
    //         room_id,
    //       },
    //     ];
    //     return updatedList;
    //   });
  
    //   // Reset form sau khi thêm
    //   form.reset({
    //     service_catalogue_id: undefined,
    //     service_id: undefined,
    //     room_id: undefined,
    //   });
    // }
  };
  
  const handleSaveConfirmed = () => {
    // const payload = {
    //   medical_record_id: Number(patient_receive_id), // ID của hồ sơ bệnh án
    //   services: servicePatients.map(({ service_id, room_id, service_name }) => ({
    //     service_id: Number(service_id),
    //     service_name,
    //     room_id: Number(room_id),
    //     patient_id: Number(patient?.id),
    //   })),
    // };
  
    // axios
    //   .post(`${process.env.NEXT_PUBLIC_API_URL}/api/medicalRecords/createPivot`, payload)
    //   .then((res) => {
    //     console.log("Kết quả trả về từ API:", res);
  
    //     if (res.status === 200) {
    //       toast({
    //         variant: "success",
    //         title: "Thêm dịch vụ thành công",
    //         description: res.statusText,
    //       });
    //       setServicePatients([]);
    //       router.back();
    //     } else {
    //       toast({
    //         variant: "destructive",
    //         title: "Lỗi khi thêm dịch vụ",
    //         description: "Không thể thêm dịch vụ vào hồ sơ bệnh án.",
    //       });
    //     }
    //   })
    //   .catch((err) => {
    //     console.error("Lỗi chỉ định:", err);
  
    //     toast({
    //       variant: "destructive",
    //       title: "Lỗi",
    //       description: err?.response?.data?.message || err.message,
    //     });
    //   });
  };
  
  
  
  
  const handleDelete = (id:bigint|string) => {
    // // Xóa dịch vụ khỏi danh sách
    // setServicePatients((prev) =>
    //   prev.filter((service) => !(service.id===id))
    // );
  };
  


// const handleSelectServiceCatalogue = (value: bigint | null) => {
// // if(value!==null){

// // form.setValue('service_catalogue_id', BigInt(value)); // Update the form value directly
// // // Lọc danh sách services
// //     const filteredServices = services.filter(
// //     (service) =>  BigInt(service.service_catalogue_id )=== value
// //     );
// //     // Xử lý `filteredServices` tại đây, ví dụ cập nhật state:
// //     setFilteredServices(filteredServices);

// // }
// };
const handleSelectService=(value: bigint | null)=>{
//   if(value!==null){
//     form.setValue('service_id', BigInt(value)); // Update the form value directly
      
//       const servicelist= services.filter(
//         (service) => service.id === value
//       );
//       const filteredRooms= rooms.filter(
//         (room) => room.room_catalogue_id === servicelist[0].room_catalogue_id
//       );
//       setFilteredRooms(filteredRooms);
    
//     }
};
const handleSelectRoom=(value: bigint | null)=>{
  if(value!==null){
    form.setValue('room_id', BigInt(value)); // Update the form value directly
  }
}
const buttonColumnConfig = {
  id: 'customButton',
  header: 'Chi tiết kết quả',
  onClickConfig: (id: string | bigint) => {
    const item = serviceDetailPatients.find((pati) => pati.id === id);

    if (item?.result_detail) {
      const detailResultService = JSON.parse(item.result_detail).map(
        (result: DetailResultService) => ({
          id: result.keyword,
          keyword: result.keyword,
          name: result.name,
          reference_range: result.reference_range,
          value: result.value.toString(),
          unit: result.unit,
        })
      );
      setSeletedService(item);
      setDetailResultSelectedService(detailResultService);
      setIsOpenDialogServiceDetailResult(true)
    } else {
      console.error('Không tìm thấy hoặc result_detail không hợp lệ.');
    }
  },
  content: 'Xem',
};

  //const columnServicePatient = servicePatients.length > 0 ? createColumns(servicePatients,undefined, undefined, handleDelete,columnServicePartientNotHeaderMap,{view:false,edit: false, delete: true},undefined) : [];
  const columnServiceDetails = serviceDetailPatients.length > 0 ? createColumns(serviceDetailPatients,undefined, undefined, undefined,columnHeaderMap,{view:false,edit: false, delete: false},undefined,buttonColumnConfig ) : [];
  const columnServiceDetailsResult = detailResultSelectedService.length > 0 ? createColumns(detailResultSelectedService,undefined, undefined, undefined,columnHeaderMapDetailResultService,{view:false,edit: false, delete: false} ) : [];
  return (
        <main className="flex w-full flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 col bg-muted/40">
        <div
          className="flex flex-col flex-1 rounded-lg px-5 border border-dashed shadow-sm" x-chunk="dashboard-02-chunk-1"
        >
      
      <Tabs defaultValue="MedicalRecordDetail" className='w-full mt-2'>
          <TabsList className="grid w-full grid-cols-2 w-fit">
            <TabsTrigger value="MedicalRecordDetail">Thông tin chi tiết bệnh án</TabsTrigger>
            <TabsTrigger value="HistoryMedicalRecordDetail">Lịch sử khám</TabsTrigger>
          </TabsList>
          <TabsContent value="MedicalRecordDetail">
          <Card className='mb-5 mt-5'>
              <CardHeader className='pb-4 border-b mb-4'>
                <CardTitle>Thông tin chi tiết của bệnh nhân</CardTitle>
                <CardDescription>
                  Chi tiết các thông tin cá nhân của bệnh nhân
                </CardDescription>
                <div className='grid grid-cols-3 gap-4 border-t'>
                  <div className="grid grid-cols-1 p-4 ">
                  <p><strong>Tên bệnh nhân:</strong> {medicalReacordDetail?.patient_name || "Không có"}</p>
                    <p><strong>Ngày sinh:</strong> {medicalReacordDetail?.patient_birthday || "Không có"}</p>
                    <p><strong>Giới tính:</strong> {medicalReacordDetail?.patient_gender === 1 ? "Nam" : medicalReacordDetail?.patient_gender === 2 ? "Nữ" : "Không có"}</p>
                    <p><strong>Điện thoại:</strong> {medicalReacordDetail?.patient_phone || "Không có"}</p>
                    <p><strong>Địa chỉ:</strong> {medicalReacordDetail?.patient_address || "Không có"}</p>
                    <p><strong>Số CCCD:</strong> {medicalReacordDetail?.patient_cccd_number || "Không có"}</p>

                    </div>
                  <div className="grid grid-cols-1 p-4 ">
                        <div> <strong>Thông tin chung</strong></div>
                        <div><strong>Bác sĩ khám:</strong> {currentUser?.name}</div>
                        <div><strong>Ngày vào khám:</strong> {medicalReacordDetail?.visit_date ? format(new Date(medicalReacordDetail?.visit_date), 'yyyy-MM-dd') : 'Ngày không xác định'}</div>

                       
                    </div>
                    <div className="grid grid-cols-1 p-4">
                        <div> <strong>Bác sĩ nhận xét</strong></div>
                        <div><strong>Chuẩn đoán: </strong> {medicalReacordDetail?.diagnosis||"Chưa chuẩn đoán"}</div>
                        <div><strong>Ghi chú: </strong> {medicalReacordDetail?.notes||"Chưa có ghi chú"}</div>
                    </div>
                </div>
                 
              </CardHeader >
             
               <CardContent className="space-y-2">
              <div>
                <div className="flex flex-col gap-1 border-b pb-5">
                <div className="mb-6 border-b">
                  <h3 className="text-lg font-bold">Dịch Vụ Đã Thực Hiện</h3>
               
              </div>  
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
                        <Button type="submit" onClick={() => fetchMedicalRecordDetail()}>Lọc</Button>
                      </div>
                </div>
                </div>
                </div>
                <div className='flex item-center justify-center'>

                    {loading ? (
                    <p className='flex item-center justify-center'>Loading...</p>
                    ) : (

                    <DataTable
                    data={serviceDetailPatients}
                    columns={columnServiceDetails}
                    totalRecords={totalRecords}
                    pageIndex={pageIndex}
                    pageSize={limit}
                    onPageChange={(newPageIndex) => {
                    console.log("pageindex:", newPageIndex)
                    setPageIndex(newPageIndex) // Cập nhật pageIndex với giá trị mới
                    }}
                    />
                    )}


                    </div>
              </div>
              <Dialog open={isOpenDialogServiceDetailResult} onOpenChange={setIsOpenDialogServiceDetailResult} 
             >
              
            
            <DialogContent className="w-[1200px] max-w-full overflow-y-auto">
            <DialogHeader>
              <DialogTitle> Kết quả {seletedService?.name}</DialogTitle>
              <DialogDescription>Thông tin chi tiết {seletedService?.description}</DialogDescription>
            </DialogHeader>
            <div className='flex item-center justify-center w-full'>

              {loading ? (
              <p className='flex item-center justify-center'>Loading...</p>
              ) : (

              <DataTable
              data={detailResultSelectedService}
              columns={columnServiceDetailsResult}
              totalRecords={totalRecords}
              pageIndex={pageIndex}
              pageSize={limit}
              onPageChange={(newPageIndex) => {
              setPageIndex(newPageIndex) // Cập nhật pageIndex với giá trị mới
              }}
              />
              )}


              </div>
       

            <DialogFooter>
            </DialogFooter>
            </DialogContent>
        </Dialog>

              </CardContent>
              
         {/*     <Dialog open={isOpenAddMedication} 
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setIsOpenAddMedication(false);           
              }
              setIsOpenAddMedication(isOpen);
            }}
            >

           
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

  
              </CardContent>   */}
          </Card >
          <Card>
            
      
          <CardHeader className='pb-4 border-b mb-4'>
                <CardTitle>Nhận xét của bác sĩ</CardTitle>
                <CardDescription>
                  Nhận xét, chuẩn đoán bệnh tình
                </CardDescription>
              </CardHeader >
             
               <CardContent className="space-y-2">
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
            </CardContent>
            <Button className='ml-5' onClick={addService}> Kê thuốc</Button>
            <Button className='ml-5' onClick={addService}> Nhập viện</Button>
          </Card>
         
          </TabsContent>
          <TabsContent value="HistoryMedicalRecordDetail">
            <Card className='mb-5'>
              <CardHeader className='pb-0'>
                <CardTitle>Danh sách các đợt khám</CardTitle>
                <CardDescription>
                  Thông tin tiền sử khám của bệnh nhân
                </CardDescription>
              </CardHeader>
              {/* <CardContent className="space-y-2">
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
                 
              </div>
              </div>
              </div>
              <div className='flex item-center justify-center'>

                  {loading ? (
                  <p className='flex item-center justify-center'>Loading...</p>
                  ) : (

                  <DataTable
                  data={patientNotExamined}
                  columns={columnPatientNotExamined}
                  totalRecords={totalRecords}
                  pageIndex={pageIndex}
                  pageSize={limit}
                  onPageChange={(newPageIndex) => {
                  console.log("pageindex:", newPageIndex)
                  setPageIndex(newPageIndex) // Cập nhật pageIndex với giá trị mới
                  }}
                  />
                  )}


</div>
              </CardContent>   */}
            </Card >
          </TabsContent> 

        </Tabs>
          </div>
      </main>
)};

export default PatientDetail;