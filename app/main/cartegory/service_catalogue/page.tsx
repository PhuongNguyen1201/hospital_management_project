"use client";
import { Button } from '@/components/ui/button';
import React, { startTransition, useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { DataTable } from '@/components/data-table';
import createColumns from '@/components/column-custom';
import { ServiceCatalogueSchema } from '@/schema'; // Schema cho ServiceCatalogue
import {  ServiceCatalogue } from '@/types'; // Định nghĩa kiểu ServiceCatalogue
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/combobox';
import { Server } from 'http';
import { useToast } from '@/hooks/use-toast';
import * as z from "zod";
import { create_service_catalogue, delete_service_catalogue, update_service_catalogue, update_status_service_catalogue } from '@/actions/cartegory/servicecatalouge';
import { ToastAction } from '@/components/ui/toast';
import axios from 'axios';

const numberOptions = [
  { value: 10, label: "10 bản ghi" },
  { value: 20, label: "20 bản ghi" },
  { value: 40, label: "40 bản ghi" },
]
const columnHeaderMap: { [key: string]: string } = {
  name: "Tên nhóm dịch vụ",
  description: "Mô tả",
  status:"Trạng thái hoạt động"
};
const ServiceCataloguePage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<ServiceCatalogue| null>(null);
  const [items, setItems] = useState<ServiceCatalogue[]>([]);
  const [editData, setEditData] = useState<ServiceCatalogue | null>(null);
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

  const formCreate=useForm<z.infer<typeof ServiceCatalogueSchema>>({
    resolver:zodResolver(ServiceCatalogueSchema),
    defaultValues:{
      name:"",
      description:"",
    },
  });
  const formUpdate=useForm<z.infer<typeof ServiceCatalogueSchema>>({
    resolver:zodResolver(ServiceCatalogueSchema),
    defaultValues:{
      name:"",
      description:"",
    },
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
  const onSubmitCreate=(values:z.infer<typeof ServiceCatalogueSchema>)=>{
    console.log('Submitting form with values:', values);
    setError("");
    startTransition(()=>{
      create_service_catalogue(values)
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
          fetchServiceCatalogues();
        }
      })
    });
  }
  const handleEdit = (id: string | bigint) => {
    setError("");
    const itemToEdit = items.find((item) => item.id === id);
    if (itemToEdit) {
      setEditData(itemToEdit);

      resetFormUpdate({
        name: itemToEdit.name,
        description: itemToEdit.description,
      });
      setIsOpenDialogUpdate(true);
      resetFormUpdate();
    }
  };

  const onSubmitEdit = (formData: z.infer<typeof ServiceCatalogueSchema>) => {
    if (!editData) return; // Ensure there is data to edit
    setError("");
    startTransition(()=>{
      update_service_catalogue(editData?.id,formData)
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
          fetchServiceCatalogues();
        }
      })
    });
  };
  

  const handleDelete = (id: string | bigint) => {
    const service = items.find((Service) => Service.id === id);
    const name = service?.name;
    if (name) {
      setDeleteItem(service);
    }
  };
  const handleSwitchChange = async (id: string | bigint, newStatus: number) => {

    try {
      const result = await update_status_service_catalogue(id, newStatus);
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
          description: "Trạng thái khoa đã được cập nhật.",
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
        description: "Đã có lỗi xảy ra khi cập nhật trạng thái khoa.",
      });
    } 
  };
  
  const confirmDelete = async () => {
    if (!deleteItem) return;
  
    try {
      const response = await delete_service_catalogue(deleteItem.id); // Gọi API để xóa phần tử từ backend
  
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
        fetchServiceCatalogues();
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
  const fetchServiceCatalogues = async () => {
    setLoading(true) // Bắt đầu trạng thái loading
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/serviceCatalogues`;
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
        const fetchedServiceCatalogues: ServiceCatalogue[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          status: item.status,
        })) 
        setItems(fetchedServiceCatalogues) // Cập nhật danh sách phòng ban
        setTotalRecords(response.data.data.total) // Giả sử API trả về tổng số bản ghi
      } else {
        throw new Error('Invalid response format') // Xử lý trường hợp định dạng không hợp lệ
      }
    } catch (err) {
      setError('Error fetching ServiceCatalogues') // Xử lý lỗi
      console.error('Error fetching ServiceCatalogues:', err)
    } finally {
      setLoading(false) // Kết thúc trạng thái loading
    }
  }
  useEffect( () => {
    fetchServiceCatalogues()
  }, [limit, pageIndex,status]) // Thêm limit và page vào dependency để tự động gọi lại khi chúng thay đổi
  const switchConfig = [
    { key: "status", onStatusChange: handleSwitchChange },
  ];
  const columns = items.length > 0 ? createColumns(items,undefined, handleEdit, handleDelete,columnHeaderMap,{view:false,edit: true, delete: true},switchConfig ) : [];

  return (
    <main className="flex w-full flex-1 flex-col gap-4 p-4">
      <h1 className="text-lg font-semibold md:text-xl">Quản lý danh mục dịch vụ</h1>
      
      <div className="flex justify-between">
        <Combobox<number>
          options={numberOptions}
          onSelect={handleSelecLimit}
          placeholder="Chọn số bản ghi"  // Thêm placeholder tùy chỉnh
          />
        <div className="flex items-center space-x-5">

        {/* Phần bên phải */}
        <div className="flex items-center space-x-5">
          <div className='flex'>
            <Combobox<number>
              options={numberOptions}
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
            <Button className='ml-5'>+ Thêm mới</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Thêm danh mục dịch vụ</DialogTitle>
              <DialogDescription>
                Nhập thông tin danh mục dịch vụ và nhấn Lưu.
              </DialogDescription>
            </DialogHeader>
            <Form {...formCreate}>
              <form onSubmit={formCreate.handleSubmit(onSubmitCreate)} className="space-y-4">
                <FormField control={formCreate.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên danh mục dịch vụ</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Tên danh mục dịch vụ" />
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
        </div>

        <Dialog open={isOpenDialogUpdate} onOpenChange={setIsOpenDialogUpdate}>
         
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa danh mục dịch vụ</DialogTitle>
              <DialogDescription>
                Nhập thông tin danh mục dịch vụ và nhấn Lưu.
              </DialogDescription>
            </DialogHeader>
            <Form {...formUpdate}>
              <form onSubmit={formUpdate.handleSubmit(onSubmitEdit)} className="space-y-4">
                <FormField control={formUpdate.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên danh mục dịch vụ</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Tên danh mục dịch vụ" />
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
      {/* Hiển thị bảng danh sách danh mục dịch vụ */}
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
              Hành động này không thể hoàn tác. Bạn đang xóa danh mục dịch vụ:{" "}
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

export default ServiceCataloguePage;
