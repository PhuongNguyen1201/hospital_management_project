"use client";
import { Button } from '@/components/ui/button';
import React, { useEffect, useState, useTransition } from 'react';
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
import { PermissionSchema } from '@/schema'; // Schema cho Permission
import {  PermissionType } from '@/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/combobox';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { create_permission, delete_permission, update_permission } from '@/actions/cartegory/permission';
import axios from 'axios';

// Dữ liệu giả cho quyền
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
  name: "Tên quyền",
  keyword: "Từ khóa",
};
const PermissionPage = () => {
  // Các giá trị lọc
  const [status, setStatus] = useState<number|any>(); // Trạng thái không chọn gì
  const [keyword, setKeyword] = useState('');
  const [limit, setLimit] = useState(20); // Mặc định không hiển thị bản ghi nào
  const [totalRecords, setTotalRecords] = useState(1);
  const [pageIndex, setPageIndex] = useState(1);

  //data
  const [items,setItems]=useState<PermissionType[]>([]);

  const [isOpenDialogCreate, setIsOpenDialogCreate] = useState(false);
  const [isOpenDialogUpdate, setIsOpenDialogUpdate] = useState(false);
  const [deleteItem, setDeleteItem] = useState<PermissionType >();
  //const [items, setItems] = useState(data);

  const [editData, setEditData] = useState<PermissionType>();
  const [error,setError]=useState<string|undefined>("");
  const { toast } = useToast()
  const [loading, setLoading] = useState(true);
  const [isPending,startTransition]=useTransition();
  const handleSelecLimit = (value: number | any) => {
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
  
  const formCreate=useForm<z.infer<typeof PermissionSchema>>({
    resolver:zodResolver(PermissionSchema),
   
  });
  const formUpdate=useForm<z.infer<typeof PermissionSchema>>({
    resolver:zodResolver(PermissionSchema),
  });
  const { reset: resetFormCreate } = formCreate; 
  const { reset: resetFormUpdate } = formUpdate;
  const handleEdit = (id: string|BigInt) => {
    setError("");
    const itemToEdit = items.find((item) => item.id === id);
    if (itemToEdit) {
      // Set edit data
      setEditData(itemToEdit);
      // Reset form with the selected item's data
      // Open dialog
       // Reset form with the selected item's data
      resetFormUpdate({
        name: itemToEdit.name,
        keyword: itemToEdit.keyword,
      });
      setIsOpenDialogUpdate(true);
      resetFormUpdate();
    }
  };
const onSubmitUpdate = (values:z.infer<typeof PermissionSchema>) => {
  if (!editData) return; // Ensure there is data to edit
  setError("");
  startTransition(()=>{
    update_permission(editData?.id,values)
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
        fetchPermissions();
      }
    })
  });
};
const onSubmitCreate=(values:z.infer<typeof PermissionSchema>)=>{
  setError("");
  startTransition(()=>{
    create_permission(values)
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
        fetchPermissions();
      }
    })
  });
}


const handleDelete = (id: string | BigInt) => {
  const permission: PermissionType|any  = items.find((permission) => permission.id === id);
  const name = permission?.name;
  if (name) {
    setDeleteItem(permission); // Lưu phần tử cần xóa
  }
};

   // Function to confirm and delete item
   const confirmDelete = async () => {
    if (!deleteItem) return;
  
    try {
      const response = await delete_permission(deleteItem.id); // Gọi API để xóa phần tử từ backend
  
      if (response.success) {
        // Xóa thành công, cập nhật danh sách permissions
        setItems((prevItems) => prevItems.filter((item) => item.id !== deleteItem.id));
  
        // Thông báo thành công
        toast({
          variant: "success",
          title: "Xóa thành công",
          description: `Khoa ${deleteItem.name} đã được xóa thành công.`,
          action: <ToastAction altText="Ok">Ok</ToastAction>,
        });
        fetchPermissions();
      } else {
        // Thông báo lỗi nếu có
        toast({
          variant: "destructive",
          title: "Lỗi khi xóa",
          description: response.error || "Đã xảy ra lỗi khi xóa khoa.",
          action: <ToastAction altText="Try again">Thử lại</ToastAction>,
        });
      }
    } catch (error) {
      console.error("Error deleting department:", error);
      toast({
        variant: "destructive",
        title: "Lỗi khi xóa",
        description: "Đã xảy ra lỗi khi xóa khoa.",
        action: <ToastAction altText="Try again">Thử lại</ToastAction>,
      });
    } finally {
      // Đóng dialog sau khi xóa hoặc có lỗi
      setDeleteItem(undefined);
    }
  };
  
  const fetchPermissions = async () => {
    setLoading(true) // Bắt đầu trạng thái loading
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/permissions`;
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
        const fetchedPermissions: PermissionType[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          keyword:item.keyword,
        })) // Chỉ lấy các thuộc tính cần thiết
    
        setItems(fetchedPermissions) // Cập nhật danh sách phòng ban
        setTotalRecords(response.data.data.total) // Giả sử API trả về tổng số bản ghi
      } else {
        throw new Error('Invalid response format') // Xử lý trường hợp định dạng không hợp lệ
      }
    } catch (err) {
      setError('Error fetching permissions') // Xử lý lỗi
      console.error('Error fetching permissions:', err)
    } finally {
      setLoading(false) // Kết thúc trạng thái loading
    }
  }
  useEffect( () => {
    fetchPermissions()
  }, [limit, pageIndex,status]) // Thêm limit và page vào dependency để tự động gọi lại khi chúng thay đổi

  const columns = items.length > 0 ? createColumns(items,undefined, handleEdit, handleDelete,columnHeaderMap,{view:false,edit: true, delete: true} ) : [];

  return (
    <main className="flex w-full flex-1 flex-col gap-4 p-4">
      <h1 className="text-lg font-semibold md:text-xl">Quản lý quyền</h1>
      
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
            <Button>+ Thêm</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Thêm quyền</DialogTitle>
              <DialogDescription>
                Nhập thông tin quyền chỉnh sửa và nhấn Lưu.
              </DialogDescription>
            </DialogHeader>
            <Form {...formCreate}>
              <form onSubmit={formCreate.handleSubmit(onSubmitCreate)} className="space-y-4">
                <FormField control={formCreate.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên quyền</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Tên quyền" />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={formCreate.control} name="keyword" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keyword</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Keyword" />
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
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa quyền mới</DialogTitle>
              <DialogDescription>
                Nhập thông tin cần chỉnh sửa và nhấn Lưu.
              </DialogDescription>
            </DialogHeader>
            <Form {...formUpdate}>
              <form onSubmit={formUpdate.handleSubmit(onSubmitUpdate)} className="space-y-4">
                <FormField control={formUpdate.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên quyền</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Tên quyền" />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={formUpdate.control} name="keyword" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keyword</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Keyword" />
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
      {/* Hiển thị bảng danh sách quyền */}
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
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa không?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Bạn đang xóa quyền:{" "}
              <strong>{deleteItem?.name}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteItem(undefined)}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Xác nhận</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
};

export default PermissionPage;
