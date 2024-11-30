"use client";

import { Button } from '@/components/ui/button';
import React, { useEffect, useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from "zod";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { DataTable } from '@/components/data-table';
import createColumns from '@/components/column-custom';
import { MedicationCatalogue, MedicationType } from '@/types'; // Define your Medication type here
import { MedicationSchema } from '@/schema'; // Import your Medication schema
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/combobox';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import axios from 'axios';
import { create_medication, delete_medication, update_medication, update_status_medication } from '@/actions/cartegory/medication';
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
  name: "Tên dược",
  description:"Mô tả",
  medication_catalogue_name:"Nhóm dược",
  price: "Giá tiền",
  status:"Tình trạng",
  measure: "Đơn vị tính",
  measure_count:"Số lượng",
};


const MedicationPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<MedicationType| any>(null);
  const [items, setItems] = useState<MedicationType[]>([]);
  const [editData, setEditData] = useState<MedicationType | any>(null);
  const [error, setError] = useState<string | any>("");
  const [status, setStatus] = useState<number|any>(null); // Trạng thái không chọn gì
  const [keyword, setKeyword] = useState('');
  const [limit, setLimit] = useState(20); // Mặc định không hiển thị bản ghi nào
  const [totalRecords, setTotalRecords] = useState(1);
  const [pageIndex, setPageIndex] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isPending,startTransition]=useTransition();
  const [medicationCatalogues, setMedicationCatalogues] = useState<MedicationCatalogue[]>([]);
  

  const [isOpenDialogCreate, setIsOpenDialogCreate] = useState(false);
  const [isOpenDialogUpdate, setIsOpenDialogUpdate] = useState(false);

 const { toast } = useToast();

  const formCreate=useForm<z.infer<typeof MedicationSchema>>({
    //resolver:zodResolver(MedicationSchema),
  });
  const formUpdate=useForm<z.infer<typeof MedicationSchema>>({
   // resolver:zodResolver(MedicationSchema),

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
  const onSubmitCreate = async (values: z.infer<typeof MedicationSchema>) => {
    setError("");
  
    try {
      // Bắt đầu quá trình tạo phòng
      const data = await create_medication(values);
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
        console.log("Fetching updated medication catalogues...");
        await fetchMedications();
        console.log("Room catalogues fetched successfully");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
      toast({
        variant: "destructive",
        title: "Lỗi không xác định",
        description: "Có lỗi xảy ra khi thêm dược.",
        action: <ToastAction altText="Try again">Ok</ToastAction>,
      });
    }
  };

  const onSubmitEdit = (formData: z.infer<typeof MedicationSchema>) => {
    console.log(editData)
    if (!editData) return; // Ensure there is data to edit
    setError("");
    startTransition(()=>{
      update_medication(editData?.id,formData)
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
          fetchMedications();
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
  
      // Cập nhật giá trị cho form
      resetFormUpdate({
        name: itemToEdit.name,
        description: itemToEdit.description,
        price: itemToEdit.price,
        measure: itemToEdit.measure,
        measure_count: itemToEdit.measure_count,
        medication_catalogue_id: BigInt(itemToEdit.medication_catalogue_id),
        
      });
  
      setIsOpenDialogUpdate(true);
    }
  };
  


  const handleDelete = (id: string | bigint) => {
    const medicationcreate_medication = items.find((room) => room.id === id);
    const code = medicationcreate_medication?.name;
    if (code) {
      setDeleteItem(medicationcreate_medication);
    }
  };
  const handleSwitchChange = async (id: string | bigint, newStatus: number) => {

    try {
      const result = await update_status_medication(id, newStatus);
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
      const response = await delete_medication(deleteItem.id); // Gọi API để xóa phần tử từ backend
  
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
        fetchMedicationCatalogues();
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
  const fetchMedications = async () => {
    setLoading(true) // Bắt đầu trạng thái loading
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
      const { data } = response.data.data
      if (Array.isArray(data)) {
        const fetchedMedication: MedicationType[] = data.map((item: any) => ({
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
        setItems(fetchedMedication) // Cập nhật danh sách phòng ban
        setTotalRecords(response.data.data.total) // Giả sử API trả về tổng số bản ghi
      } else {
        throw new Error('Invalid response format') // Xử lý trường hợp định dạng không hợp lệ
      }
    } catch (err) {
      setError('Error fetching medication Catalogues') // Xử lý lỗi
      console.error('Error fetching medication Catalogues:', err)
    } finally {
      setLoading(false) // Kết thúc trạng thái loading
    }
  }
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

  const handleSelectMedicationCatalogue = (value: bigint | null) => {
    if(value!==null)
      if(isOpenDialogCreate){
        formCreate.setValue('medication_catalogue_id', BigInt(value)); // Update the form value directly
      }
      else if(isOpenDialogUpdate){
        formUpdate.setValue('medication_catalogue_id', BigInt(value));
      }
    console.log(value)
  };

  useEffect( () => {
    fetchMedications();
  }, [limit, pageIndex,status]) // Thêm limit và page vào dependency để tự động gọi lại khi chúng thay đổi
  useEffect( () => {
    fetchMedicationCatalogues();
  }, []) // Thêm limit và page vào dependency để tự động gọi lại khi chúng thay đổi
  const switchConfig = [
    { key: "status", onStatusChange: handleSwitchChange },
  ];
 
  
  
  const columns = items.length > 0 ? createColumns(items,undefined, handleEdit, handleDelete,columnHeaderMap,{view:false,edit: true, delete: true},switchConfig ) : [];

  return (
    <main className="flex w-full flex-1 flex-col gap-4 p-4">
      <h1 className="text-lg font-semibold md:text-xl">Quản lý thuốc</h1>

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
          <Dialog open={isOpenDialogCreate} onOpenChange={setIsOpenDialogCreate}>
          <DialogTrigger asChild>
                <Button className='ml-5'> + Thêm</Button>
              </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thêm thuốc</DialogTitle>
            <DialogDescription>
              Nhập thông tin thuốc và nhấn Lưu.
            </DialogDescription>
          </DialogHeader>
          <Form {...formCreate}>
            <form onSubmit={formCreate.handleSubmit(onSubmitCreate)} className="space-y-4">
              <FormField control={formCreate.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên thuốc</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Tên thuốc" />
                  </FormControl>
                </FormItem>
              )} />

                  <FormField 
                      control={formCreate.control}
                      name="medication_catalogue_id"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="mr-2">Nhóm dược</FormLabel>
                          <FormControl className="flex-grow">
                            <Combobox<bigint>
                              options={medicationCatalogues.map(meidcationCatalogue => ({
                                value: meidcationCatalogue.id,
                                label: meidcationCatalogue.name,
                              }))}
                                placeholder="Chọn nhóm được"
                                onSelect={handleSelectMedicationCatalogue}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

              <FormField control={formCreate.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá</FormLabel>
                  <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder="Giá dược"
                    onChange={(e) => field.onChange(Number(e.target.value))}  // Chuyển giá trị thành number
                />
                  </FormControl>
                </FormItem>
              )} />

              <FormField control={formCreate.control} name="measure" render={({ field }) => (
                <FormItem>
                  <FormLabel>Đơn vị đo lường</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Đơn vị" />
                  </FormControl>
                </FormItem>
              )} />

              <FormField control={formCreate.control} name="measure_count" render={({ field }) => (
                <FormItem>
                  <FormLabel>Số lượng</FormLabel>
                  <FormControl>
                  <Input
                  {...field}
                  type="number"
                  placeholder="Số lượng"
                  onChange={(e) => field.onChange(Number(e.target.value))}  // Chuyển giá trị thành number
                />
                  </FormControl>
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

              <DialogFooter>
                <Button type="submit">Lưu</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
          <Dialog open={isOpenDialogUpdate} onOpenChange={setIsOpenDialogUpdate}>
        <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thêm thuốc</DialogTitle>
            <DialogDescription>
              Nhập thông tin thuốc và nhấn Lưu.
            </DialogDescription>
          </DialogHeader>
          <Form {...formUpdate}>
            <form onSubmit={formUpdate.handleSubmit(onSubmitEdit)} className="space-y-4">
              <FormField control={formUpdate.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên thuốc</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Tên thuốc" />
                  </FormControl>
                </FormItem>
              )} />

                  <FormField 
                      control={formUpdate.control}
                      name="medication_catalogue_id"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="mr-2">Nhóm thuốc</FormLabel>
                          <FormControl className="flex-grow">
                            <Combobox<bigint>
                               options={medicationCatalogues.map(meidcationCatalogue => ({
                                value: meidcationCatalogue.id,
                                label: meidcationCatalogue.name,
                              }))}
                                placeholder="Chọn nhóm dịch vụ"
                                onSelect={handleSelectMedicationCatalogue}
                                defaultValue={field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

              <FormField control={formUpdate.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá</FormLabel>
                  <FormControl>
                  <Input
                  {...field}
                  type="number"
                  placeholder="Giá dược"
                  onChange={(e) => field.onChange(Number(e.target.value))}  // Chuyển giá trị thành number
                />
                  </FormControl>
                </FormItem>
              )} />

              <FormField control={formUpdate.control} name="measure" render={({ field }) => (
                <FormItem>
                  <FormLabel>Đơn vị đo lường</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Đơn vị" />
                  </FormControl>
                </FormItem>
              )} />

              <FormField control={formUpdate.control} name="measure_count" render={({ field }) => (
                <FormItem>
                  <FormLabel>Số lượng</FormLabel>
                  <FormControl>
                  <Input
                  {...field}
                  type="number"
                  placeholder="Số lượng"
                  onChange={(e) => field.onChange(Number(e.target.value))}  // Chuyển giá trị thành number
                />
                  </FormControl>
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

     


      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa thuốc</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa thuốc <strong>{deleteItem?.name}</strong> không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteItem(null)}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
};

export default MedicationPage;
