"use client";
import { Button } from '@/components/ui/button';
import React, { useEffect, useState, useTransition } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import {  FieldArrayWithId, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from "zod";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { DataTable } from '@/components/data-table';
import createColumns from '@/components/column-custom';
import { RoomCatalogueType, ServiceCatalogue, ServiceType } from '@/types'; // Định nghĩa kiểu Service
import { RoomSchema,  ServiceSchema } from '@/schema'; // Schema cho Service
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/combobox';
import { ToastAction } from '@/components/ui/toast';
import { create_service, delete_service, update_service, update_status_service } from '@/actions/cartegory/service';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { Label } from '@/components/ui/label';


const numberOptions = [
  { value: 10, label: "10 bản ghi" },
  { value: 20, label: "20 bản ghi" },
  { value: 40, label: "40 bản ghi" },
]
const statusOptions = [
  { value: 0, label: "Không hoạt động" },
  { value: 1, label: "Hoạt động" },
  { value: 2, label: "Tât cả" },
]


const columnHeaderMap: { [key: string]: string } = {
  name: "Tên dịch vụ",
  description:"Mô tả",
  price: "Giá tiền",
  status:"Tình trạng",
  room_catalogue_code: "Nhóm phòng",
  beds_count: "Giường hoạt động",
  health_insurance_applied:"Đối tượng AD Bảo hiểm",
  health_insurance_value:"Tỷ lệ hưởng BH",
  service_catalogue_name:"Nhóm dịch vụ",
  room_catalogue_name:"Nhóm phòng",
};
type Field = {
  fieldName: string;
  value: string;
};

type AttributeField = {
  attributeName: string;
  fields: Field[]; // Mảng các trường con
};
const ServicePage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<ServiceType| any>(null);
  const [items, setItems] = useState<ServiceType[]>([]);
  const [editData, setEditData] = useState<ServiceType | any>(null);
  const [error, setError] = useState<string | any>("");
  const [status, setStatus] = useState<number|any>(null); // Trạng thái không chọn gì
  const [keyword, setKeyword] = useState('');
  const [limit, setLimit] = useState(20); // Mặc định không hiển thị bản ghi nào
  const [totalRecords, setTotalRecords] = useState(1);
  const [pageIndex, setPageIndex] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isPending,startTransition]=useTransition();

  const [roomCatalogues, setRoomCatalogues] = useState<RoomCatalogueType[]>([]);
  const [serviceCatalogues, setServiceCatalogues] = useState<ServiceCatalogue[]>([]);
  const [isApplyHealthInsurance, setIsApplyHealthInsurance] = useState<boolean>(false);
  const [healthInsuranceValue, setHealthInsuranceValue] = useState<number>(0);
  
  const [isOpenDialogCreate, setIsOpenDialogCreate] = useState(false);
  const [isOpenDialogUpdate, setIsOpenDialogUpdate] = useState(false);


  type DetailField = {
    keyword: string;
    name: string;
    reference_range: string;
    unit: string;
  };

  const [details, setDetails] = useState<DetailField[]>([]);
  const [newDetail, setNewDetail] = useState<DetailField>({
    keyword: "",
    name: "",
    reference_range: "",
    unit: "",
  });
  const [editingDetail, setEditingDetail] = useState<DetailField | null>(null);
  const [editingDetailIndex, setEditingDetailIndex] = useState<number | null>(null);
  const [isOpenDialogDetail, setIsOpenDialogDetail] = useState<boolean>(false);
  const [isEditDetailOpen, setIsEditDetailOpen] = useState<boolean>(false);


  const handleAddDetail = () => {
    if (!newDetail.keyword || !newDetail.name || !newDetail.reference_range || !newDetail.unit) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    setDetails([...details, newDetail]);
    setNewDetail({ keyword: "", name: "", reference_range: "", unit: "" });
    setError(null);
  };

  const handleEditDetail = () => {
    if (editingDetailIndex !== null && editingDetail) {
      const updatedDetails = [...details];
      updatedDetails[editingDetailIndex] = editingDetail;
      setDetails(updatedDetails);
      setEditingDetail(null);
      setEditingDetailIndex(null);
      setIsEditDetailOpen(false);
    }
  };

  const handleDeleteDetail = (index: number) => {
    setDetails(details.filter((_, i) => i !== index));
  };





 
    // Handle save edit field

  
    const onSubmitEditDetailService = () => {
      if (details.length === 0) {
        setError("Vui lòng thêm thông tin mẫu dịch vụ.");
        return;
      }
    
      // Tạo danh sách các chi tiết dịch vụ theo định dạng mới
      const serviceData = details.map((detail) => ({
        keyword: detail.keyword,
        name: detail.name,
        reference_range: detail.reference_range,
        unit: detail.unit,
      }));
    
      // Chuyển thành chuỗi JSON
      const jsonString = JSON.stringify(serviceData);
      
      // Chuẩn bị dữ liệu để cập nhật
      const newEditData = {
        ...editData,
        room_catalogue_id: BigInt(editData.room_catalogue_id),
        service_catalogue_id: BigInt(editData.service_catalogue_id),
        detail: jsonString,
      };
      console.log(newEditData);
      if (!editData) return;
    
      setError("");
      startTransition(() => {
        update_service(editData.id, newEditData).then((data) => {
          if (data.error) {
            setError(data.error);
            toast({
              variant: "destructive",
              title: "Lỗi khi cập nhật",
              description: data.error,
              action: <ToastAction altText="Try again">Ok</ToastAction>,
            });
          } else if (data.success) {
            setError("");
            toast({
              variant: "success",
              title: "Cập nhật thành công",
              description: data.success,
              action: <ToastAction altText="Try again">Ok</ToastAction>,
            });
            setIsOpenDialogDetail(false);
            fetchServices(); // Reload dịch vụ
          }
        });
      });
    };
    
    // end detail service:

  const { toast } = useToast();

  const formCreate=useForm<z.infer<typeof ServiceSchema>>({
    resolver:zodResolver(ServiceSchema),
  });
  const formUpdate=useForm<z.infer<typeof ServiceSchema>>({
    resolver:zodResolver(ServiceSchema),

  });
  
  const { reset: resetFormCreate } = formCreate; 
  const { reset: resetFormUpdate } = formUpdate;
 
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
  const onSubmitCreate = async (values: z.infer<typeof ServiceSchema>) => {
    setError("");
  
    try {
      // Bắt đầu quá trình tạo phòng
      const data = await create_service(values);
      console.log("Response from create_room:", data); // Kiểm tra phản hồi từ create_room
  
      if (data.error) {
        setError(data.error);
        toast({
          variant: "destructive",
          title: "Lỗi khi thêm",
          description: data.error,
          action: <ToastAction altText="Try again">Ok</ToastAction>,
        });
      } else if (data.success) {
        setError("");
        // Hiển thị toast cho thành công
        toast({
          variant: "success",
          title: "Thêm thành công",
          description: data.success,
          action: <ToastAction altText="Try again">Ok</ToastAction>,
        });
        // Reset form và đóng dialog
        resetFormCreate();
        setIsOpenDialogCreate(false);
        
        // Gọi lại danh sách phòng sau khi thêm thành công
        console.log("Fetching updated room catalogues...");
        await fetchServices();
        console.log("Room catalogues fetched successfully");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
      toast({
        variant: "destructive",
        title: "Lỗi không xác định",
        description: "Có lỗi xảy ra khi thêm phòng.",
        action: <ToastAction altText="Try again">Ok</ToastAction>,
      });
    }
  };

  const onSubmitEdit = (formData: z.infer<typeof ServiceSchema>) => {
    console.log(editData)
    if (!editData) return; // Ensure there is data to edit
    setError("");
    startTransition(()=>{
      update_service(editData?.id,formData)
      .then((data) => {
        if (data.error) {
          setError(data.error);
          toast({
            variant:"destructive",
            title: "Lỗi khi cập nhật",
            description: data.error,
            action: <ToastAction altText="Try again">Ok</ToastAction>,
          });
         
        } else if (data.success) {
          setError('');
          // Hiển thị toast cho thành công
          toast({
            variant:"success",
            title: "Cập nhật thành công",
            description: data.success,
            action: <ToastAction altText="Try again">Ok</ToastAction>,
          });
          // Điều hướng sau khi thành công
          resetFormUpdate();
          setIsOpenDialogUpdate(false);
          fetchServices();
        }
      })
    });
  };
  

  
  const handleEdit = (id: string | bigint) => {
    setError("");
    const itemToEdit = items.find((item) => item.id === id);
    if (itemToEdit) {
      setEditData(itemToEdit);  
  
      // Kiểm tra giá trị của health_insurance_applied, nếu là 1 thì hiển thị ô nhập giá trị bảo hiểm
      setIsApplyHealthInsurance(itemToEdit.health_insurance_applied === 1); 
  
      // Cập nhật giá trị cho form
      resetFormUpdate({
        name: itemToEdit.name,
        description: itemToEdit.description,
        price: itemToEdit.price,
        health_insurance_applied: itemToEdit.health_insurance_applied,
        health_insurance_value: itemToEdit.health_insurance_value, 
        room_catalogue_id: BigInt(itemToEdit.room_catalogue_id),
        service_catalogue_id: BigInt(itemToEdit.service_catalogue_id),
      });
  
      setIsOpenDialogUpdate(true);
    }
  };
  


  const handleDelete = (id: string | bigint) => {
    const service = items.find((room) => room.id === id);
    const code = service?.name;
    if (code) {
      setDeleteItem(service);
    }
  };
  const handleSwitchChange = async (id: string | bigint, newStatus: number) => {

    try {
      const result = await update_status_service(id, newStatus);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Cập nhật thất bại",
          description: result.error,
        });
      } else {
        toast({
          variant: "success",
          title: "Cập nhật thành công",
          description: "Trạng thái đã được cập nhật.",
        });
  
        // Cập nhật trạng thái trực tiếp trên phần tử trong danh sách departments
        setItems(prevItems =>
          prevItems.map(item =>
            item.id === id ? { ...item, status: newStatus } : item
          )
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Đã có lỗi xảy ra khi cập nhật trạng thái.",
      });
    } 
  };
  
  const confirmDelete = async () => {
    if (!deleteItem) return;
  
    try {
      const response = await delete_service(deleteItem.id); // Gọi API để xóa phần tử từ backend
  
      if (response.success) {
        // Xóa thành công, cập nhật danh sách departments
        setItems((prevItems) => prevItems.filter((item) => item.id !== deleteItem.id));
  
        // Thông báo thành công
        toast({
          variant: "success",
          title: "Xóa thành công",
          description: `Phòng ${deleteItem.name} đã được xóa thành công.`,
          action: <ToastAction altText="Ok">Ok</ToastAction>,
        });
        fetchRoomCatalogues();
      } else {
        // Thông báo lỗi nếu có
        toast({
          variant: "destructive",
          title: "Lỗi khi xóa",
          description: response.error || "Đã xảy ra lỗi khi xóa Phòng.",
          action: <ToastAction altText="Try again">Thử lại</ToastAction>,
        });
      }
    } catch (error) {
      console.error("Error deleting position:", error);
      toast({
        variant: "destructive",
        title: "Lỗi khi xóa",
        description: "Đã xảy ra lỗi khi xóa Phòng.",
        action: <ToastAction altText="Try again">Thử lại</ToastAction>,
      });
    } finally {
      // Đóng dialog sau khi xóa hoặc có lỗi
      setDeleteItem(null);
    }
  };
  const fetchServices = async () => {
    setLoading(true) // Bắt đầu trạng thái loading
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/services`;
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
        console.log(fetchedServices)
        setItems(fetchedServices) // Cập nhật danh sách phòng ban
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
  }
  const fetchRoomCatalogues = async () => {
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/roomCatalogues`;
    
    try {
        const response = await axios.get(endpoint);
        const totalRecords = response.data.data.total;

        // Gọi API để lấy tất cả các bản ghi
        const responseAll = await axios.get(endpoint, { params: { limit: totalRecords } });
        const { data } = responseAll.data.data;

        if (Array.isArray(data)) {
            const roomCatalogueList: RoomCatalogueType[] = data
                .filter((item: any) => item.status === 1)
                .map((item: any) => ({
                    id: BigInt(item.id), // Chuyển id thành bigint
                    keyword: item.keyword,
                    name: item.name,
                    description: item.description,
                    status: item.status,
                }));
            setRoomCatalogues(roomCatalogueList);
        } else {
            console.warn("Data is not an array:", data);
        }
    } catch (err) {
        console.error("Error fetching room catalogues:", err);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load room catalogues.",
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

  const handleSelectRoomCatalogue = (value: bigint | null) => {
    if(value!==null)
      if(isOpenDialogCreate){
        formCreate.setValue('room_catalogue_id', BigInt(value)); // Update the form value directly
      }
      else if(isOpenDialogUpdate){
        formUpdate.setValue('room_catalogue_id', BigInt(value));
      }
  };
  const handleSelectServiceCatalogue = (value: bigint | null) => {
    if(value!==null)
      if(isOpenDialogCreate){
        formCreate.setValue('service_catalogue_id', BigInt(value)); // Update the form value directly
      }
      else if(isOpenDialogUpdate){
        formUpdate.setValue('service_catalogue_id', BigInt(value));
      }
      
  };
  useEffect( () => {
    fetchServices();
  }, [limit, pageIndex,status]) // Thêm limit và page vào dependency để tự động gọi lại khi chúng thay đổi
  useEffect( () => {
    fetchServiceCatalogues();
    fetchRoomCatalogues();
  }, []) // Thêm limit và page vào dependency để tự động gọi lại khi chúng thay đổi
  const switchConfig = [
    { key: "status", onStatusChange: handleSwitchChange },
  ];
  const buttonColumnConfig = {
    id: "customButton",
    header: "Chi tiết mẫu",
    onClickConfig: (id: string | BigInt) => {
      const item = items.find((service) => service.id === id);
      setEditData(item);
  
      if (item && item.detail) {
        try {
          const parsedDetail = JSON.parse(item.detail);
  
          if (Array.isArray(parsedDetail)) {
            // Chuyển JSON sang danh sách các chi tiết
            const attributes = parsedDetail.map((detail: DetailField) => ({
              keyword: detail.keyword,
              name: detail.name,
              reference_range: detail.reference_range,
              unit: detail.unit,
            }));
            setDetails(attributes);
          } else {
            setDetails([]); // Nếu không phải mảng hợp lệ
          }
        } catch (e) {
          console.error("Lỗi khi phân tích JSON:", e);
          setDetails([]); // Xử lý lỗi JSON
        }
      } else {
        setDetails([]);
      }
  
      setIsOpenDialogDetail(true); // Mở dialog
    },
    content: "Chi tiết",
  };
  
  
  const columns = items.length > 0 ? createColumns(items,undefined, handleEdit, handleDelete,columnHeaderMap,{view:false,edit: true, delete: true},switchConfig,buttonColumnConfig ) : [];




  return (
    <main className="flex w-full flex-1 flex-col gap-4 p-4">
      <h1 className="text-lg font-semibold md:text-xl">Quản lý dịch vụ</h1>
      
      <div className="flex justify-between">
      <Combobox<number>
          options={numberOptions}
          onSelect={handleSelecLimit}
          placeholder="Chọn số bản ghi"  // Thêm placeholder tùy chỉnh
          />
        <div className="flex items-center space-x-5">
        <div className='flex'>
            <Combobox<number>
              options={statusOptions}
              onSelect={handleSelectStatus}
              placeholder="Chọn tình trạng"  // Thêm placeholder tùy chỉnh
            />
          </div>
          <div className="flex items-center space-x-2 bg-white">
            <Input type="text" placeholder="Tìm kiếm" />
            <Button type="submit">Lọc</Button>
          </div>

          <Dialog open={isOpenDialogDetail} onOpenChange={setIsOpenDialogDetail}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thông tin mẫu dịch vụ</DialogTitle>
          <DialogDescription>Chi tiết mẫu dịch vụ</DialogDescription>
        </DialogHeader>

        {/* Form nhập liệu */}
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Keyword</label>
            <Input
              value={newDetail.keyword}
              onChange={(e) => setNewDetail({ ...newDetail, keyword: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <Input
              value={newDetail.name}
              onChange={(e) => setNewDetail({ ...newDetail, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Reference Range</label>
            <Input
              value={newDetail.reference_range}
              onChange={(e) => setNewDetail({ ...newDetail, reference_range: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Unit</label>
            <Input
              value={newDetail.unit}
              onChange={(e) => setNewDetail({ ...newDetail, unit: e.target.value })}
            />
          </div>
          {error && <p className="text-red-600">{error}</p>}
          <Button onClick={handleAddDetail}>Thêm</Button>
        </div>

        {/* Danh sách chi tiết */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold">Chi tiết mẫu dịch vụ</h3>
          <Button className='w-full' onClick={onSubmitEditDetailService}>Lưu thay đổi</Button>
          <ul className="space-y-4 mt-4">
            {details.map((detail, index) => (
              <li key={index} className="border p-4 rounded-lg shadow-sm">
                <div>
                  <div>
                    <strong>Keyword:</strong> {detail.keyword}
                  </div>
                  <div>
                    <strong>Name:</strong> {detail.name}
                  </div>
                  <div>
                    <strong>Reference Range:</strong> {detail.reference_range}
                  </div>
                  <div>
                    <strong>Unit:</strong> {detail.unit}
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingDetail(detail);
                      setEditingDetailIndex(index);
                      setIsEditDetailOpen(true);
                    }}
                  >
                    Chỉnh sửa
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteDetail(index)}
                  >
                    Xóa
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Dialog chỉnh sửa */}
        <Dialog open={isEditDetailOpen} onOpenChange={setIsEditDetailOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chỉnh sửa chi tiết</DialogTitle>
              <DialogDescription>Chỉnh sửa thông tin chi tiết của dịch vụ.</DialogDescription>
            </DialogHeader>
            {editingDetail && (
              <div className="grid gap-4 py-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Keyword</label>
                  <Input
                    value={editingDetail.keyword}
                    onChange={(e) =>
                      setEditingDetail((prev) => (prev ? { ...prev, keyword: e.target.value } : null))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <Input
                    value={editingDetail.name}
                    onChange={(e) =>
                      setEditingDetail((prev) => (prev ? { ...prev, name: e.target.value } : null))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reference Range</label>
                  <Input
                    value={editingDetail.reference_range}
                    onChange={(e) =>
                      setEditingDetail((prev) =>
                        prev ? { ...prev, reference_range: e.target.value } : null
                      )
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unit</label>
                  <Input
                    value={editingDetail.unit}
                    onChange={(e) =>
                      setEditingDetail((prev) => (prev ? { ...prev, unit: e.target.value } : null))
                    }
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={handleEditDetail}>Lưu thay đổi</Button>
              <DialogClose asChild>
                <Button variant="ghost">Đóng</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>





          <Dialog open={isOpenDialogUpdate} onOpenChange={setIsOpenDialogUpdate}>
            <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Chỉnh sửa dịch vụ</DialogTitle>
                <DialogDescription>
                  Nhập thông tin dịch vụ và nhấn Lưu.
                </DialogDescription>
              </DialogHeader>
              <Form {...formUpdate}>
                <form onSubmit={formUpdate.handleSubmit(onSubmitEdit)} className="space-y-4">
                  <FormField control={formUpdate.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên dịch vụ</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Tên dịch vụ" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={formUpdate.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Mô tả" />
                      </FormControl>
                    </FormItem>
                  )} />
                  <FormField 
                            control={formUpdate.control}
                            name="room_catalogue_id"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel className="mr-2">Nhóm Phòng</FormLabel>
                                <FormControl className="flex-grow">
                                  <Combobox<bigint>
                                  options={roomCatalogues.map(room => ({
                                    value: room.id,
                                    label: room.keyword,
                                  }))}
                                    placeholder="Chọn nhóm phòng"
                                    onSelect={handleSelectRoomCatalogue}
                                    defaultValue={field.value}
                                    />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                  <FormField 
                            control={formUpdate.control}
                            name="service_catalogue_id"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel className="mr-2">Nhóm dịch vụ</FormLabel>
                                <FormControl className="flex-grow">
                                  <Combobox<bigint>
                                  options={serviceCatalogues.map(service => ({
                                    value: service.id,
                                    label: service.name,
                                  }))}
                                    placeholder="Chọn nhóm dịch vụ"
                                    onSelect={handleSelectServiceCatalogue}
                                    defaultValue={field.value}
                                    />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                 <FormField control={formUpdate.control} name="price" render={({ field }) => (
            <FormItem>
              <FormLabel>Giá dịch vụ</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  placeholder="Giá dịch vụ"
                  onChange={(e) => field.onChange(Number(e.target.value))}  // Chuyển giá trị thành number
                />
              </FormControl>
            </FormItem>
          )} />

<FormField
  control={formUpdate.control}
  name="health_insurance_applied"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Áp dụng bảo hiểm y tế</FormLabel>
      <FormControl>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="1"  // Chuyển từ true thành 1
              checked={field.value === 1}  // So sánh với giá trị 1 thay vì true
              onChange={() => {
                field.onChange(1);  // Gửi giá trị 1 thay vì true
                setIsApplyHealthInsurance(true);
              }}
            />
            <span>Có</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="0"  // Chuyển từ false thành 0
              checked={field.value === 0}  // So sánh với giá trị 0 thay vì false
              onChange={() => {
                field.onChange(0);  // Gửi giá trị 0 thay vì false
                setIsApplyHealthInsurance(false);
                formUpdate.setValue("health_insurance_value", 0); // Reset giá trị bảo hiểm về 0 khi chọn "Không"
              }}
            />
            <span>Không</span>
          </label>
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

{/* Trường Giá trị bảo hiểm sức khỏe chỉ hiển thị khi chọn "Có" */}
{formUpdate.watch("health_insurance_applied") === 1 && (
  <FormField
    control={formUpdate.control}
    name="health_insurance_value"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Giá trị bảo hiểm sức khỏe</FormLabel>
        <FormControl>
          <Input
            {...field}
            type="number"
            placeholder="Giá trị bảo hiểm"
            onChange={(e) => {
              field.onChange(Number(e.target.value)); // Cập nhật trạng thái của form
            }}
          />
        </FormControl>
      </FormItem>
    )}
  />
)}

                  

                  <DialogFooter>
                    <Button type="submit">Lưu</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
         </Dialog>
            <Dialog open={isOpenDialogCreate} onOpenChange={setIsOpenDialogCreate}>
      <DialogTrigger asChild>
        <Button className="ml-5">+ Thêm mới</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1000px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm dịch vụ</DialogTitle>
          <DialogDescription>
            Nhập thông tin dịch vụ và nhấn Lưu.
          </DialogDescription>
        </DialogHeader>
        <Form {...formCreate}>
          <form onSubmit={formCreate.handleSubmit(onSubmitCreate)} className="space-y-4">
            <FormField control={formCreate.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Tên dịch vụ</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Tên dịch vụ" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={formCreate.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Mô tả</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Mô tả" />
                </FormControl>
              </FormItem>
            )} />

<FormField 
                      control={formCreate.control}
                      name="room_catalogue_id"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="mr-2">Nhóm Phòng</FormLabel>
                          <FormControl className="flex-grow">
                            <Combobox<bigint>
                             options={roomCatalogues.map(room => ({
                              value: room.id,
                              label: room.keyword,
                            }))}
                              placeholder="Chọn nhóm phòng"
                              onSelect={handleSelectRoomCatalogue}
                              />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
             <FormField 
                      control={formCreate.control}
                      name="service_catalogue_id"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="mr-2">Nhóm dịch vụ</FormLabel>
                          <FormControl className="flex-grow">
                            <Combobox<bigint>
                             options={serviceCatalogues.map(service => ({
                              value: service.id,
                              label: service.name,
                            }))}
                              placeholder="Chọn nhóm dịch vụ"
                              onSelect={handleSelectServiceCatalogue}
                              />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

          <FormField control={formCreate.control} name="price" render={({ field }) => (
            <FormItem>
              <FormLabel>Giá dịch vụ</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  placeholder="Giá dịch vụ"
                  onChange={(e) => field.onChange(Number(e.target.value))}  // Chuyển giá trị thành number
                />
              </FormControl>
            </FormItem>
          )} />


<FormField
  control={formCreate.control}
  name="health_insurance_applied"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Áp dụng bảo hiểm y tế</FormLabel>
      <FormControl>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="1"  // Chuyển từ true thành 1
              checked={field.value === 1}  // So sánh với giá trị 1 thay vì true
              onChange={() => {
                field.onChange(1);  // Gửi giá trị 1 thay vì true
                setIsApplyHealthInsurance(true);
              }}
            />
            <span>Có</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="0"  // Chuyển từ false thành 0
              checked={field.value === 0}  // So sánh với giá trị 0 thay vì false
              onChange={() => {
                field.onChange(0);  // Gửi giá trị 0 thay vì false
                setIsApplyHealthInsurance(false);
                formUpdate.setValue("health_insurance_value", 0); // Reset giá trị bảo hiểm về 0 khi chọn "Không"
              }}
            />
            <span>Không</span>
          </label>
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

{/* Trường Giá trị bảo hiểm sức khỏe chỉ hiển thị khi chọn "Có" */}
{formCreate.watch("health_insurance_applied") === 1 && (
  <FormField
    control={formCreate.control}
    name="health_insurance_value"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Giá trị bảo hiểm sức khỏe</FormLabel>
        <FormControl>
          <Input
            {...field}
            type="number"
            placeholder="Giá trị bảo hiểm"
            onChange={(e) => {
              field.onChange(Number(e.target.value)); // Cập nhật trạng thái của form
            }}
          />
        </FormControl>
      </FormItem>
    )}
  />
)}

            <DialogFooter>
              <Button type="submit">Lưu</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
            </Dialog>
        </div>
      </div>
      {/* Hiển thị bảng danh sách dịch vụ */}
      <div className='flex item-center justify-center'>

        {loading ? (
        <p className='flex item-center justify-center'>Loading...</p>
        ) : (

        <DataTable
        data={items}
        columns={columns}
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

      {/* Hộp thoại xóa */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa không?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Bạn đang xóa dịch vụ:{" "}
              <strong>{deleteItem?.name}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteItem(null)}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Xác nhận</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
};

export default ServicePage;
