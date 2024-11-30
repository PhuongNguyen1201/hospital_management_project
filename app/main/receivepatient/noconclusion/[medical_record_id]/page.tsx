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
import { DailyHealth, MedicalRecord, MedicalRecordHistoryDetail, MedicalRecordRecordServiceDetail, MedicationCatalogue, MedicationDetail, MedicationType, Patient, PatientCurrently , PatientServiceInfo, RoomType, ServiceCatalogue, ServiceDetailPatientResul, ServicePivot, ServiceType, UserInfoType } from '@/types';
import { useParams, useRouter } from 'next/navigation'
import createColumns from '@/components/column-custom';
import { DataTable } from '@/components/data-table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertCircle, CalendarIcon, ChevronDownIcon, ChevronLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from "zod"
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { Textarea } from '@/components/ui/textarea';
import {  CreateMedication, MedicalRecordUpdateDiagnose, PatientServiceSchema } from '@/schema';
import axios from 'axios';
import { useUser } from '@/components/context/UserContext';
import { format } from 'date-fns';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DayPicker } from 'react-day-picker';
import { cn } from '@/lib/utils';

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
  name:"Thuộc tính",
  reference_range:"Khoảng tham chiếu",
  unit:"Đơn vị",
  value: "Kết quả",
}
const columnHeaderMapMedicationDetail={
  name:"Tên thuốc",
  dosage:"Liều lượng",
  measure:"Đơn vị",
  description: "Hướng dẫn dùng",
}
const columnHeaderMapMedicalRecordHistoryDetail={
  visit_date: "Ngày khám",
  diagnosis: "Chuẩn đoán",
  notes: "Ghi chú",
  apointment_date: "Ngày hẹn tái khám",
  is_inpatient: "Đối tượng nội trú",
  inpatient_detail: "Chi tiết nội trú",
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
  // no conclusion
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
    const [isOpenDialogMedicalRecordHistory, setIsOpenDialogMedicalRecordHistory] = useState(false);
    const [isPrescriptionVisible, setPrescriptionVisible] = useState(false);
    const [isOpenAddMedication, setIsOpenAddMedication] = useState(false);
    const [isOpenInpatientAnocermentDialog, setIsOpenInpatientAnocermentDialog] = useState(false);

    const [medicationCatalogues, setMedicationCatalogues] = useState<MedicationCatalogue[]>([]);
    const [medications, setMedications] = useState<MedicationType[]>([]);
    const [medicationDetails,setMedicationDetails]=useState<MedicationDetail[]>([]);
    const [editMedicationDetail, setEditMedicationDetail] = useState<MedicationDetail>();
    const [deleteMedicationDetail, setDeleteMedicationDetail] = useState<MedicationDetail>();
    const [isEditing, setIsEditing] = useState(true); // Ban đầu đang chỉnh sửa
const [isSaveDisabled, setIsSaveDisabled] = useState(true); // Ban đầu nút Lưu hồ sơ bị khóa

    const {medical_record_id}=useParams();
  let currentUser: UserInfoType | null = null;
  const user = useUser();  
  // Kiểm tra nếu user và currentUser tồn tại
  if (user && user.currentUser) {
    currentUser = user.currentUser;
  }
  const formUpdateDiagnose=useForm<z.infer<typeof MedicalRecordUpdateDiagnose>>({
    resolver:zodResolver(MedicalRecordUpdateDiagnose),
  });
  const formCreateMedication=useForm<z.infer<typeof CreateMedication>>({
    resolver:zodResolver(CreateMedication),
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
        fetchMedicalRecordHistoryDetail(fetchedMedicalRecordDetail.patient_id);
        setMedicalRecordDetail(fetchedMedicalRecordDetail);
        setServiceDetailPatients(serviceDetailPatients);
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu bệnh án:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchMedicationCatalogues = async () => {
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/medicationCatalogues`;
    
    try {
        const response = await axios.get(endpoint);
        const totalRecords = response.data.data.total;

        // Gọi API để lấy tất cả các bản ghi
        const responseAll = await axios.get(endpoint, { params: { limit: totalRecords } });
        const { data } = responseAll.data.data;

        if (Array.isArray(data)) {
            const medicationCatalogueList: MedicationCatalogue[] = data
                .filter((item: any) => item.status === 1)
                .map((item: any) => ({
                    id: BigInt(item.id), // Chuyển id thành bigint
                    name: item.name,
                    description: item.description,
                    status: item.status,
                    level:item.level,
                    parent_id:item.parent_id,
                }));
            setMedicationCatalogues(medicationCatalogueList);
        } else {
            console.warn("Data is not an array:", data);
        }
    } catch (err) {
        console.error("Error fetching meidcation catalogues:", err);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load meidcation catalogues.",
        });
    }
};

  const fetchMedications = async (value:Number) => {
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/medications`;
    try {
      const response = await axios.get(endpoint, {
        params: {
          limit: limit, // Số bản ghi trên mỗi trang
          page: pageIndex, // Trang hiện tại
          status: status!==2?status:undefined, // Thêm trạng thái vào tham số API
          keyword: keyword.trim()!==""?keyword:undefined // Thêm từ khóa tìm kiếm vào tham số API
        },
      })
      
      const {data}    = response.data.data
      // Lọc mảng theo medication_catalogue_id nếu cần

      const medical = data.filter(
        (item: any) => item.medication_catalogue_id === value
      );

    console.log(medical)
      if (Array.isArray(medical)) {
        const fetchedMedication: MedicationType[] = medical.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          medication_catalogue_name:item.medication_catalogue.name,
          price: item.price,
          status:item.status,
          measure:item.measure,
          measure_count:item.measure_count,
          medication_catalogue_id:item.medication_catalogue_id,
        }));
        console.log(fetchedMedication)
        setMedications(fetchedMedication) // Cập nhật danh sách phòng ban
      } else {
        throw new Error('Invalid response format') // Xử lý trường hợp định dạng không hợp lệ
      }
    } catch (err) {
      console.error('Error fetching medication Catalogues:', err)
    } finally {

    }
  }
  
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch medical record details
        await fetchMedicalRecordDetail();
        
        // Fetch medication catalogues
        await fetchMedicationCatalogues();
      } catch (error) {
        console.error("Error while fetching data:", error);
      }
    };
  
    fetchAllData();
  }, [limit]);
  

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

  const handleDelete = (id: string | BigInt) => {
    const medicaion: MedicationDetail | undefined = medicationDetails.find((me) => me.id === id);
    const name = medicaion?.name;
    if (name) {
      setDeleteMedicationDetail(medicaion); // Lưu phần tử cần xóa
    }
  };
  
  const confirmDelete = async () => {
    if (!deleteMedicationDetail) return;
  
    // Xóa thành công, cập nhật danh sách medicationDetails
    setMedicationDetails((prevItems) => {
      if (!prevItems) {
        return []; // Trả về mảng rỗng nếu prevItems là undefined
      }
  
      // Lọc phần tử bị xóa
      const updatedItems = prevItems.filter((prevItem: any) => prevItem.id !== deleteMedicationDetail.id);
  
      // Cập nhật lại ID cho các phần tử còn lại, bắt đầu từ 1 và tăng dần
      const updatedItemsWithNewIds = updatedItems.map((item, index) => ({
        ...item,
        id: BigInt(index + 1), // Cập nhật ID bắt đầu từ 1 và chuyển thành BigInt
      }));
  
      return updatedItemsWithNewIds;
    });
  
    // Thông báo thành công
    toast({
      variant: "success",
      title: "Xóa thành công",
      description: `Thuốc ${deleteMedicationDetail.name} đã được xóa thành công.`,
      action: <ToastAction altText="Ok">Ok</ToastAction>,
    });
  
    // Reset trạng thái deleteMedicationDetail
    setDeleteMedicationDetail(undefined);
  };
  
    
        // Đóng dialog sau khi xóa hoặc có lỗi

  const handleSelectMedicationCatalogue = (value: Number | null) => {
    if(value!==null)
      fetchMedications(value);
  };
  const handleSelectMedication = (value: bigint | null) => {
    if(value!==null){
      const medication=medications.find((item)=>item.id===value)
      console.log(medication)
      if(medication)
        formCreateMedication.setValue('name',medication.name)
    }
  };

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

// convert medicalcatalogue 
// Khi click vào nút "Sửa thông tin"
const handleEditInformation = () => {
  setIsEditing(true); // Cho phép chỉnh sửa lại
  setIsSaveDisabled(true); // Khóa nút Lưu hồ sơ
};
const onSubmitDiagnose=(data: z.infer<typeof MedicalRecordUpdateDiagnose>)=>{
  setIsEditing(false); // Không cho chỉnh sửa input nữa
        setIsSaveDisabled(false); // Bật nút Lưu hồ sơ
}
// Hàm xử lý submit
const onSubmitCreateMedication = (data: z.infer<typeof CreateMedication>) => {
  // Tạo ID mới, tăng từ 1 dựa trên mảng hiện tại
  const newId = BigInt(medicationDetails.length > 0 ? Number(medicationDetails[medicationDetails.length - 1].id) + 1 : 1);

  // Tạo đối tượng thuốc mới
  const newMedication: MedicationDetail = {
    id: newId,
    name: data.name,
    dosage: data.dosage,
    measure: data.measure,
    description: data.description || "",
  };

  // Thêm vào danh sách thuốc
  setMedicationDetails((prevDetails) => [...prevDetails, newMedication]);

  // Reset form sau khi thêm thành công
  formCreateMedication.reset({
    name:"",
    dosage:0,
    measure:"",
    description:"",
  });
  setIsOpenAddMedication(false);
};
const convertTimestampToDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Thêm '0' nếu tháng < 10
  const day = String(date.getDate()).padStart(2, '0'); // Thêm '0' nếu ngày < 10
  return `${year}-${month}-${day}`;
};
const handleSaveDedicalRecordPatient=async ()=>{
  const apointment_date= convertTimestampToDate(formUpdateDiagnose.getValues('apointment_date'));
  const diagnosis=formUpdateDiagnose.getValues('diagnosis');
  const notes=formUpdateDiagnose.getValues('notes');
    try {
      const payload = {
        medical_record: {
          medical_record_id: medical_record_id, // ID hồ sơ y tế
          data: {
            apointment_date:apointment_date, // Ngày tái khám
            diagnosis:diagnosis, // Chuẩn đoán
            notes:notes, // Ghi chú
          },
        },
        medications: {
          data: medicationDetails.map((medication) => ({
            medication_id: Number(medication.id), // ID của thuốc
            name: medication.name, // Tên thuốc
            dosage:medication.dosage.toString(),
            measure: medication.measure, // Đơn vị đo
            description: medication.description, // Mô tả
          })),
        },
      };
      const updateMedicalRecord = `${process.env.NEXT_PUBLIC_API_URL}/api/medicalRecords/save`;
      const response =await  axios.post(updateMedicalRecord, payload, { timeout: 5000 });
      if (response.status === 200) {
        // Hiển thị thông báo thành công
        toast({
          variant: "success",
          title: "Thành công",
          description: "Lưu hồ sơ bệnh án thành công.",
        });
        router.back()
      } else {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Có lỗi xảy ra khi lưu",
        });
      }
    } catch (error:any) {
      // Hiển thị thông báo lỗi
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error?.response?.data?.message || error.message,
      });
    }  
}
  //const columnServicePatient = servicePatients.length > 0 ? createColumns(servicePatients,undefined, undefined, handleDelete,columnServicePartientNotHeaderMap,{view:false,edit: false, delete: true},undefined) : [];
  const columnServiceDetails = serviceDetailPatients.length > 0 ? createColumns(serviceDetailPatients,undefined, undefined, undefined,columnHeaderMap,{view:false,edit: false, delete: false},undefined,buttonColumnConfig ) : [];
  const columnServiceDetailsResult = detailResultSelectedService.length > 0 ? createColumns(detailResultSelectedService,undefined, undefined, undefined,columnHeaderMapDetailResultService,{view:false,edit: false, delete: false} ) : [];
  const columnMedicationDetail = medicationDetails.length > 0 ? createColumns(medicationDetails,undefined, undefined, handleDelete,columnHeaderMapMedicationDetail,{view:false,edit: false, delete: true} ) : [];
  const columnMedicationDetailHistory = medicationDetails.length > 0 ? createColumns(medicationDetails,undefined, undefined, undefined,columnHeaderMapMedicationDetail,{view:false,edit: false, delete: false} ) : [];
  const buttonColumnConfigHistoryDetail = {
    id: 'buttonColumnConfigHistoryDetail',
    header: 'Chi tiết hồ sơ',
    onClickConfig: (id: string | bigint) => {
      const item :MedicalRecordHistoryDetail|any= medicalRecordHistoryDetails.find((me) => me.id === id);
      if(item){
        const serviceDetailPatients: ServiceDetailPatientResul[] = item.services;
        const medicationDetails : MedicationDetail[]=item.medications;
        setMedicationDetails(medicationDetails)
        setServiceDetailPatients(serviceDetailPatients);

        setIsOpenDialogMedicalRecordHistory(true);
        setMedicalRecordHistoryDetailItem(item)
      }
       else {
        console.error('Không tìm thấy hoặc result_detail không hợp lệ.');
      }
    },
    content: 'Xem',
  };
  // history: enpoint: http://localhost:8000/api/patients/history/{id}
  const [medicalRecordHistoryDetails, setMedicalRecordHistoryDetails] = useState<MedicalRecordHistoryDetail[]>([]);
  const [medicalRecordHistoryDetailItem, setMedicalRecordHistoryDetailItem] = useState<MedicalRecordHistoryDetail>();
  const columnMedicalHistoryDetail = medicalRecordHistoryDetails.length > 0 ? createColumns(medicalRecordHistoryDetails,undefined, undefined, undefined,columnHeaderMapMedicalRecordHistoryDetail,{view:false,edit: false, delete: false},undefined,buttonColumnConfigHistoryDetail ) : [];
 
  const fetchMedicalRecordHistoryDetail = async (id: bigint) => {
  try {
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/patients/history/${id}`;
    const response = await axios.get(endpoint);
    
    const data = response?.data?.data ;  // Kiểm tra response đúng cách
    const fetchedMedicalRecordHistoryDetail: MedicalRecordHistoryDetail[] = data.medical_records.map((item:any) => ({
      id: item.id,
      user_id: item.user_id,
      user_name: item.user.name,
      room_id: item.room_id,
      visit_date: item.visit_date,
      diagnosis: item.diagnosis,
      notes: item.notes,
      apointment_date: item.apointment_date,
      is_inpatient: item.is_inpatient,
      inpatient_detail: item.inpatient_detail,
      services: item.services.map((service:any) => ({
        id: service.id,
        name: service.name,
        description: service.description,
        health_insurance_applied: service.health_insurance_applied,
        health_insurance_value: service.health_insurance_value,
        assigning_doctor_id: item.user.id,
        assigning_doctor_name: item.user.name, // Assuming `currentUser` exists in scope
        pivot_id: service.pivot.id,
        result_detail: service.pivot.result_details,
      })),
      medications: item.medications.map((medication:any) => ({
        id: medication.id,
        name: medication.name,
        dosage: medication.pivot.dosage,
        measure: medication.pivot.measure, // Removed incorrect `medication.measure.pivot.measure`
        description: medication.pivot.description,
      })),
    }));
    if (fetchedMedicalRecordHistoryDetail) {
      setMedicalRecordHistoryDetails(fetchedMedicalRecordHistoryDetail);
    }
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu bệnh án:", error);
  } finally {
    setLoading(false);
  }
};
  return (
        <main className="flex w-full flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 col bg-muted/40">
        <div
          className="flex pb-5 flex-col flex-1 rounded-lg px-5 border border-dashed shadow-sm" x-chunk="dashboard-02-chunk-1"
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
          </Card>  
          <div className='grid grid-cols-3 gap-5'>
            <Card className='col-span-1'>
          <CardHeader className='pb-4 border-b mb-4'>
                <CardTitle>Nhận xét của bác sĩ</CardTitle>
                <CardDescription>
                  Nhận xét, chuẩn đoán bệnh tình
                </CardDescription>
              </CardHeader >
             
               <CardContent className="space-y-2">
              <Form {...formUpdateDiagnose}>
              <form onSubmit={formUpdateDiagnose.handleSubmit(onSubmitDiagnose)}>
                  <div className="mb-6 border-b max-w-[600px]">
                      <h3 className="text-lg font-bold mb-4">Nhận xét của bác sĩ</h3>
                     <FormField
                        control={formUpdateDiagnose.control}
                        name="diagnosis"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chuẩn đoán</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Nhập chuẩn đoán"
                                disabled={!isEditing} // Khóa khi không chỉnh sửa
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                     <FormField
                        control={formUpdateDiagnose.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ghi chú</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Uống đủ nước, ăn nhiều rau, thường xuyên tiếp xúc với ánh nắng"
                                disabled={!isEditing} // Khóa khi không chỉnh sửa
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                    <FormField
                      control={formUpdateDiagnose.control}
                      name="apointment_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Ngày tái khám</FormLabel>
                          <FormControl>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  disabled={!isEditing}
                                  variant="outline"
                                  className={cn(
                                    "flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2 text-left text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                                    !field.value && "text-gray-400"
                                  )}
                                >
                                  <div className="flex items-center space-x-2">
                                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                                    <span>
                                      {field.value
                                        ? format(new Date(field.value), "dd/MM/yyyy")
                                        : "Chọn ngày"}
                                    </span>
                                  </div>
                                  <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="z-50 w-[320px] rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
                              <DayPicker
                                  mode="single"
                                  selected={field.value ? new Date(field.value) : undefined}
                                  onSelect={(date) =>
                                    field.onChange(date ? date.getTime() : undefined)
                                  }
                                  captionLayout="dropdown"
                                  fromYear={1900}
                                  toYear={new Date().getFullYear() + 10}
                                  disabled={{
                                    before: new Date(), // Chặn ngày trước hôm nay
                                  }}
                                  className="custom-daypicker"
                                />
                                              </PopoverContent>
                            </Popover>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                  </div> 
                  
                </form>

            </Form>

            <Button variant="outline" className='mr-5'  onClick={() => setPrescriptionVisible(!isPrescriptionVisible)}> Kê thuốc</Button>
            <Button variant="outline" className='mr-5'  disabled={!isEditing} onClick={formUpdateDiagnose.handleSubmit(onSubmitDiagnose)}> Lưu thông tin</Button>
            <Button variant="outline" className='mr-5'  disabled={isSaveDisabled} onClick={handleEditInformation}> Sửa thông tin</Button>
            <Button variant="outline" className='mr-5'  disabled={isSaveDisabled} onClick={handleSaveDedicalRecordPatient}> Lưu hồ sơ</Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Nhập viện</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Thông tin nhập viện</DialogTitle>
                  <DialogDescription>
                    
                  </DialogDescription>
                </DialogHeader>
                <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Lỗi</AlertTitle>
              <AlertDescription>
              Hệ thống chưa cập nhật tính năng, vui lòng trở lại sau.
              </AlertDescription>
            </Alert>
              </DialogContent>
            </Dialog>

   
            </CardContent>
            </Card> 
            {isPrescriptionVisible && (                               
            <Card className='mb-5 pt-5 col-span-2'>
              <CardContent>
                <Dialog open={isOpenAddMedication} onOpenChange={setIsOpenAddMedication}
              >
              <Form {...formCreateMedication}>
                <form onSubmit={formCreateMedication.handleSubmit(onSubmitCreateMedication)}>
                    <DialogContent className="sm:max-w-[600px]">
                    <DialogTrigger asChild>
                  </DialogTrigger>
                      <DialogHeader>
                        <DialogTitle>Kê đơn thuốc</DialogTitle>
                      </DialogHeader>
                        <div className="grid gap-3">
                          <div className="grid grid-cols-2 gap-4">
   
  
                        <FormItem className="flex flex-col">
                          <FormLabel className="mr-2">Nhóm dược</FormLabel>
                          <FormControl className="flex-grow">
                            <Combobox<number>
                             options={
                              medicationCatalogues.map(medicationCatalogue => ({
                                value: Number(medicationCatalogue.id),
                                label: `${"|---".repeat(medicationCatalogue.level)}${medicationCatalogue.name}`,
                              }))}
                            placeholder="Chọn nhóm dược cha"
                            onSelect={handleSelectMedicationCatalogue}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
    
                            <FormField 
                              control={formCreateMedication.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel className="mr-2">Dược</FormLabel>
                                  <FormControl className="flex-grow">
                                    <Combobox<bigint>
                                      options={medications.map(me => ({
                                        value: me.id,
                                        label: me.name,
                                      }))}
                                        placeholder="Chọn được"
                                        onSelect={handleSelectMedication}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                                control={formCreateMedication.control}
                                name="dosage"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Liều lượng</FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                      
                                        placeholder="Example: 80"
                                        type="number"
                                        onChange={(e) => {
                                          // Chuyển giá trị từ chuỗi thành number trước khi lưu vào state của form
                                          const newValue = e.target.value ? parseFloat(e.target.value) : undefined;
                                          field.onChange(newValue);
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                                />
                            <FormField
                              control={formCreateMedication.control}
                              name="measure"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Đơn vị</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                
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
                            control={formCreateMedication.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Ghi chú</FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    placeholder="Example: Uống sau ăn, 2 viên 1 lần"                               />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type='submit' onClick={formCreateMedication.handleSubmit(onSubmitCreateMedication)}>Lưu thuốc</Button>
                        </div>           
                    </DialogContent>
                  </form>
              </Form>
                </Dialog>
              
                <Card className='mb-5 mt-5'>
                <CardHeader className='pb-4 border-b mb-4'>
                  <CardTitle>Chi tiết đơn thuốc ủa bệnh nhân</CardTitle>
                  <CardDescription>
                    Thông tin đơn thuốc bác sĩ đã kê
                  </CardDescription>
                </CardHeader >
              
                <CardContent className="space-y-2">
                <div className="flex flex-col gap-1 border-b pb-5">
                      <div className="mb-6 border-b">
                        <h3 className="text-lg font-bold">Đơn Thuốc Ngoại Trú</h3>
                      </div>
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
                        <Button type="submit">Lọc</Button>
                        <Button variant="outline" onClick={()=>{setIsOpenAddMedication(true)}}>Thêm thuốc</Button>
                      </div>
                </div>
                </div>
                    <div>
                      <DataTable
                        data={medicationDetails}
                        columns={columnMedicationDetail}
                        totalRecords={totalRecords}
                        pageIndex={pageIndex}
                        pageSize={limit}
                        onPageChange={(newPageIndex) => {
                          console.log("pageindex:", newPageIndex);
                          setPageIndex(newPageIndex); // Cập nhật pageIndex với giá trị mới
                        }}
                      />
                    </div>

                </CardContent>
              </Card> 
                </CardContent>
                <AlertDialog open={!!deleteMedicationDetail} onOpenChange={() => setDeleteMedicationDetail(undefined)}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Bạn có chắc chắn muốn xóa không?</AlertDialogTitle>
      <AlertDialogDescription>
        Hành động này không thể hoàn tác. Bạn đang xóa thuốc:{" "}
        <strong>{deleteMedicationDetail?.name}</strong>
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel onClick={() => setDeleteMedicationDetail(undefined)}>Hủy</AlertDialogCancel>
      <AlertDialogAction onClick={confirmDelete}>Xác nhận</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

            </Card>
                )}
         </div>
          </TabsContent>
          <TabsContent value="HistoryMedicalRecordDetail">
          <Card className='mb-5 mt-5'>
              <CardHeader className='pb-4 border-b mb-4'>
                <CardTitle>Tiền sử khám bệnh của bệnh nhân</CardTitle>
                <CardDescription>
                  Thông tin lịch sử khám bệnh
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
                </div>
              </CardHeader >
             
               <CardContent className="space-y-2">
            <div className='flex flex-col item-center justify-center w-full'>
                <CardTitle>Danh sách các lần khám</CardTitle>
                <CardDescription>
                  Thông tin khám bệnh của bệnh nhân
                </CardDescription>
              {loading ? (
              <p className='flex item-center justify-center'>Loading...</p>
              ) : (
                
              <DataTable
              data={medicalRecordHistoryDetails}
              columns={columnMedicalHistoryDetail}
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
              <Dialog open={isOpenDialogMedicalRecordHistory} onOpenChange={setIsOpenDialogMedicalRecordHistory}>
              
            
              <DialogContent className="w-[1200px] max-w-full max-h-[900px] overflow-y-auto">
            <DialogHeader>
              <DialogTitle> Thông tin chi tiết đợt khám</DialogTitle>
              <DialogDescription>Thông tin chi tiết các dịch vụ sử dụng, kết quả, đơn thuốc được kê</DialogDescription>
            </DialogHeader>
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
                          <div><strong>Chuẩn đoán: </strong> {medicalRecordHistoryDetailItem?.diagnosis||"Chưa chuẩn đoán"}</div>
                          <div><strong>Ghi chú: </strong> {medicalRecordHistoryDetailItem?.notes||"Chưa có ghi chú"}</div>
                          <div><strong>Ngày hẹn tái khám: </strong> {medicalRecordHistoryDetailItem?.apointment_date ? format(new Date(medicalRecordHistoryDetailItem?.apointment_date), 'yyyy-MM-dd') : 'Ngày không xác định'}</div>
                      </div>
                  </div>
                  
                </CardHeader >
              
                <CardContent className="space-y-2">
                <div>
                  <div className="flex flex-col gap-1 border-b pb-5">
                  <div className="mb-6 border-b">
                    <h3 className="text-lg font-bold">Dịch Vụ Đã Thực Hiện</h3>
                
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
              </Card> 
              <Card className='mb-5 mt-5'>
                <CardHeader className='pb-4 border-b mb-4'>
                  <CardTitle>Chi tiết đơn thuốc ủa bệnh nhân</CardTitle>
                  <CardDescription>
                    Thông tin đơn thuốc bác sĩ đã kê
                  </CardDescription>
                </CardHeader >
              
                <CardContent className="space-y-2">
                <div className="flex flex-col gap-1 border-b pb-5">
                      <div className="mb-6 border-b">
                        <h3 className="text-lg font-bold">Đơn Thuốc Ngoại Trú</h3>
                      </div>
                    </div>
                    
                    <div>
                      <DataTable
                        data={medicationDetails}
                        columns={columnMedicationDetailHistory}
                        totalRecords={totalRecords}
                        pageIndex={pageIndex}
                        pageSize={limit}
                        onPageChange={(newPageIndex) => {
                          console.log("pageindex:", newPageIndex);
                          setPageIndex(newPageIndex); // Cập nhật pageIndex với giá trị mới
                        }}
                      />
                    </div>

                </CardContent>
              </Card> 
              

            <DialogFooter>
            </DialogFooter>
            </DialogContent>
              </Dialog>
          </Card>  
          
          </TabsContent> 

        </Tabs>
          </div>
      </main>
)};

export default PatientDetail;