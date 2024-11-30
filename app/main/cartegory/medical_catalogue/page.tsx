"use client";

import { Button } from '@/components/ui/button';
import React, { startTransition, useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from "zod";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { DataTable } from '@/components/data-table';
import createColumns from '@/components/column-custom';
import { MedicationCatalogue } from '@/types'; // Định nghĩa kiểu MedicationCatalogue
import { MedicationCatalogueSchema } from '@/schema'; // Schema cho Medication
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/combobox';
import { useToast } from '@/hooks/use-toast';
import { update_status_medication_catalogue } from '@/actions/cartegory/medicationcatalouge/updatestatus';
import { ToastAction } from '@/components/ui/toast';
import { create_medication_catalogue, delete_medication_catalogue, update_medication_catalogue } from '@/actions/cartegory/medicationcatalouge';
import axios from 'axios';

// Dữ liệu giả cho danh sách Nhóm thuốc

const numberOptions = [
  { value: 10, label: "10 bản ghi" },
  { value: 20, label: "20 bản ghi" },
  { value: 40, label: "40 bản ghi" },
];
const statusOptions = [
  { value: 0, label: "Không hoạt động" },
  { value: 1, label: "Hoạt động" },
  { value: 2, label: "Tât cả" },
]
const columnHeaderMap: { [key: string]: string } = {
  name: "Tên nhóm dược",
  description: "Mô tả",
  status:"Trạng thái hoạt động",
  level:"Cấp độ nhóm",
};

const MedicationPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<MedicationCatalogue| null>(null);
  const [items, setItems] = useState<MedicationCatalogue[]>([]);
  const [itemConverts, setItemConvert] = useState<MedicationCatalogue[]>([]);
  const [editData, setEditData] = useState<MedicationCatalogue | null>(null);
  const [error, setError] = useState<string | undefined>("");
  const [status, setStatus] = useState<number|null>(null); // Trạng thái không chọn gì
  const [keyword, setKeyword] = useState('');
  const [limit, setLimit] = useState(20); // Mặc định không hiển thị bản ghi nào
  const [totalRecords, setTotalRecords] = useState(1);
  const [pageIndex, setPageIndex] = useState(1);
  const [loading, setLoading] = useState(true);

  const [isOpenDialogCreate, setIsOpenDialogCreate] = useState(false);
  const [isOpenDialogUpdate, setIsOpenDialogUpdate] = useState(false);

  const { toast } = useToast();

  const formCreate=useForm<z.infer<typeof MedicationCatalogueSchema>>({
    resolver:zodResolver(MedicationCatalogueSchema),
  });
  const formUpdate=useForm<z.infer<typeof MedicationCatalogueSchema>>({
    resolver:zodResolver(MedicationCatalogueSchema),
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
  const onSubmitCreate=(values:z.infer<typeof MedicationCatalogueSchema>)=>{
    console.log('Submitting form with values:', values);
    setError("");
    startTransition(()=>{
      create_medication_catalogue(values)
      .then((data) => {
        if (data.error) {
          setError(data.error);
          toast({
            variant:"destructive",
            title: "Lỗi khi thêm",
            description: data.error,
            action: <ToastAction altText="Try again">Ok</ToastAction>,
          });
         
        } else if (data.success) {
          setError('');
          // Hiển thị toast cho thành công
          toast({
            variant:"success",
            title: "Thêm thành công",
            description: data.success,
            action: <ToastAction altText="Try again">Ok</ToastAction>,
          });
          // Điều hướng sau khi thành công
          resetFormCreate();
          setIsOpenDialogCreate(false);
          fetchMedicationCatalogues();
        }
      })
    });
  }
  const handleEdit = (id: string | bigint) => {
    setError("");
    const itemToEdit = items.find((item) => item.id === id);
    if (itemToEdit) {
      setEditData(itemToEdit);
      console.log(itemToEdit.parent_id)
      resetFormUpdate({
        name: itemToEdit.name,
        description: itemToEdit.description,
        parent_id:itemToEdit.parent_id===null?0:itemToEdit.parent_id,
      });
      setIsOpenDialogUpdate(true);
    }
  };

  const onSubmitEdit = (formData: z.infer<typeof MedicationCatalogueSchema>) => {
    if (!editData) return; // Ensure there is data to edit
    setError("");
    startTransition(()=>{
      update_medication_catalogue(editData?.id,formData)
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
          fetchMedicationCatalogues();
        }
      })
    });
  };
  

  const handleDelete = (id: string | bigint) => {
    const medicationCatalogue = items.find((medicationCatalogue) => medicationCatalogue.id === id);
    const name = medicationCatalogue?.name;
    if (name) {
      setDeleteItem(medicationCatalogue);
    }
  };
  const handleSwitchChange = async (id: string | bigint, newStatus: number) => {

    try {
      const result = await update_status_medication_catalogue(id, newStatus);
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
          description: "Trạng thái nhóm dược đã được cập nhật.",
        });
  
        // Cập nhật trạng thái trực tiếp trên phần tử trong danh sách departments
        setItemConvert(prevItems =>
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
        description: "Đã có lỗi xảy ra khi cập nhật trạng thái khoa.",
      });
    } 
  };
  
  const confirmDelete = async () => {
    if (!deleteItem) return;
  
    try {
      const response = await delete_medication_catalogue(deleteItem.id); // Gọi API để xóa phần tử từ backend
  
      if (response.success) {
        // Xóa thành công, cập nhật danh sách departments
        setItems((prevItems) => prevItems.filter((item) => item.id !== deleteItem.id));
  
        // Thông báo thành công
        toast({
          variant: "success",
          title: "Xóa thành công",
          description: `Khoa ${deleteItem.name} đã được xóa thành công.`,
          action: <ToastAction altText="Ok">Ok</ToastAction>,
        });
        fetchMedicationCatalogues();
      } else {
        // Thông báo lỗi nếu có
        toast({
          variant: "destructive",
          title: "Lỗi khi xóa",
          description: response.error || "Đã xảy ra lỗi khi xóa chức danh.",
          action: <ToastAction altText="Try again">Thử lại</ToastAction>,
        });
      }
    } catch (error) {
      console.error("Error deleting position:", error);
      toast({
        variant: "destructive",
        title: "Lỗi khi xóa",
        description: "Đã xảy ra lỗi khi xóa chức danh.",
        action: <ToastAction altText="Try again">Thử lại</ToastAction>,
      });
    } finally {
      // Đóng dialog sau khi xóa hoặc có lỗi
      setDeleteItem(null);
    }
  };

  const handleSelectMedicationCatalogue = (value: number | null) => {
    if(value!==null)
      if(isOpenDialogCreate){
        formCreate.setValue('parent_id', value); // Update the form value directly
      }
      else if(isOpenDialogUpdate){
        formUpdate.setValue('parent_id', value);
      }
    console.log(value)
  };
  // fetch data:
  const processCataloguesWithIndentation = (data: MedicationCatalogue[]) => {
    return data.map(item => {
      let indent = "";
      if (item.level === 1) indent = "|---";
      else if (item.level === 2) indent = "|---|---";
      else if (item.level === 3) indent = "|---|---|---";
      
      return {
        ...item,
        name: `${indent} ${item.name}`,
      };
    });
  };
  const fetchMedicationCatalogues = async () => {
    setLoading(true) // Bắt đầu trạng thái loading
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/medicationCatalogues`;
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
        const fetchedMedicationCatalogues: MedicationCatalogue[] = data.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          parent_id:item.parent_id,
          status: item.status,
          level: item.level,
        }));
  
        const processedCatalogues = processCataloguesWithIndentation(fetchedMedicationCatalogues);
        setItems(fetchedMedicationCatalogues);
        setItemConvert(processedCatalogues);
        setTotalRecords(response.data.data.total) // Giả sử API trả về tổng số bản ghi
      } else {
        throw new Error('Invalid response format') // Xử lý trường hợp định dạng không hợp lệ
      }
    } catch (err) {
      setError('Error fetching MedicationCatalogues') // Xử lý lỗi
      console.error('Error fetching MedicationCatalogues:', err)
    } finally {
      setLoading(false) // Kết thúc trạng thái loading
    }
  }
  useEffect( () => {
    fetchMedicationCatalogues()
  }, [limit, pageIndex,status]) // Thêm limit và page vào dependency để tự động gọi lại khi chúng thay đổi
  const switchConfig = [
    { key: "status", onStatusChange: handleSwitchChange },
  ];
  const columns = items.length > 0 ? createColumns(itemConverts,undefined, handleEdit, handleDelete,columnHeaderMap,{view:false,edit: true, delete: true},switchConfig ) : [];


  return (
    <main className="flex w-full flex-1 flex-col gap-4 p-4">
      <h1 className="text-lg font-semibold md:text-xl">Quản lý nhóm dược</h1>
      
      <div className="flex justify-between">
      <Combobox<number>
          options={numberOptions}
          onSelect={handleSelecLimit}
          placeholder="Chọn số bản ghi"  // Thêm placeholder tùy chỉnh
          />

        {/* Phần bên phải */}
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
          <Button className='ml-5'>Thêm</Button>
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
                  <FormLabel>Tên Nhóm thuốc</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Tên nhóm dược" />
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
 <FormField 
              control={formCreate.control}
              name="parent_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="mr-2">Nhóm dược cha</FormLabel>
                  <FormControl className="flex-grow">
                    <Combobox<number>
                     options={[
                        { value: 0, label: "Root" }, // Thêm lựa chọn "Root" với ID là 0
                        ...items.map(medicationCatalogue => ({
                          value: Number(medicationCatalogue.id),
                          label: `${"|---".repeat(medicationCatalogue.level)}${medicationCatalogue.name}`,
                        })),
                      ]}
                      placeholder="Chọn nhóm dược cha"
                      onSelect={handleSelectMedicationCatalogue}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
              <DialogFooter>
                <Button type="submit">{editData ? "Lưu" : "Thêm"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
        </Dialog>
      <Dialog open={isOpenDialogUpdate} onOpenChange={setIsOpenDialogUpdate}>
        <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editData ? "Chỉnh sửa Nhóm thuốc" : "Thêm Nhóm thuốc"}</DialogTitle>
            <DialogDescription>
              Nhập thông tin Nhóm thuốc và nhấn Lưu.
            </DialogDescription>
          </DialogHeader>
          <Form {...formUpdate}>
            <form onSubmit={formUpdate.handleSubmit(onSubmitEdit)} className="space-y-4">
              <FormField control={formUpdate.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên Nhóm thuốc</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Tên Nhóm thuốc" />
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
            <FormField 
              control={formUpdate.control}
              name="parent_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="mr-2">Nhóm dược cha</FormLabel>
                  <FormControl className="flex-grow">
                    <Combobox<number>
                     options={[
                        { value: 0, label: "Root" }, // Thêm lựa chọn "Root" với ID là 0
                        ...items.map(medicationCatalogue => ({
                          value: Number(medicationCatalogue.id),
                          label: `${"|---".repeat(medicationCatalogue.level)}${medicationCatalogue.name}`,
                        })),
                      ]}
                      placeholder="Chọn nhóm dược cha"
                      onSelect={handleSelectMedicationCatalogue}
                      defaultValue={Number(field.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

              <DialogFooter>
                <Button type="submit">{editData ? "Lưu" : "Thêm"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
    </div>
</div>
          {/* Hiển thị bảng danh sách */}
          <div className='flex item-center justify-center'>

{loading ? (
<p className='flex item-center justify-center'>Loading...</p>
) : (

<DataTable
data={itemConverts}
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
        <AlertDialogTrigger asChild>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa Nhóm thuốc</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa Nhóm thuốc <strong>{deleteItem?.name}</strong> không?
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
