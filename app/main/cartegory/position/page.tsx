"use client"
import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'

 

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';


import { useTransition } from 'react';
import * as z from "zod"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import {useForm} from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';

import { CreateDepartmentSchema} from '@/schema';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"



import { useToast } from '@/hooks/use-toast';
import { FormError } from '@/components/form-error';
import { ToastAction } from '@radix-ui/react-toast';

import  {Combobox}  from '@/components/combobox'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/data-table'
import createColumns from '@/components/column-custom'
import { PositionType } from '@/types';
import { delete_position, update_position, update_status_position,create_position } from '@/actions/cartegory/position/index';
import axios from 'axios';

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
const cartegoryOptions = [
  { value: 111, label: "Sản phẩm điện tử" },
  { value: 222, label: "Sản phẩm phòng khách" },
  { value: 333, label: "Sản phẩm bếp" },
]
 
const columnHeaderMap: { [key: string]: string } = {
  name: "Tên vị trí",
  description: "Mô tả",
  status:"Trạng thái hoạt động"
};
const Prosition = () => {
  const [status, setStatus] = useState<number|null>(null); // Trạng thái không chọn gì
  const [keyword, setKeyword] = useState('');
  const [limit, setLimit] = useState(20); // Mặc định không hiển thị bản ghi nào
  const [totalRecords, setTotalRecords] = useState(1);
  const [pageIndex, setPageIndex] = useState(1);

  //data
  const [positions,setPositions]=useState<PositionType[]>([]);

  const [isOpenDialogCreate, setIsOpenDialogCreate] = useState(false);
  const [isOpenDialogUpdate, setIsOpenDialogUpdate] = useState(false);
  const [deleteItem, setDeleteItem] = useState<PositionType | null>(null);
  //const [items, setItems] = useState(data);

  const [editData, setEditData] = useState<PositionType|null>(null);
  const [error,setError]=useState<string|undefined>("");
  const { toast } = useToast()
  const [loading, setLoading] = useState(true);
  const [isPending,startTransition]=useTransition();
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
  
  const formCreate=useForm<z.infer<typeof CreateDepartmentSchema>>({
    resolver:zodResolver(CreateDepartmentSchema),
    defaultValues:{
      name:"",
      description:"",
    },
  });
  const formUpdate=useForm<z.infer<typeof CreateDepartmentSchema>>({
    resolver:zodResolver(CreateDepartmentSchema),
    defaultValues:{
      name:"",
      description:"",
    },
  });
  const { reset: resetFormCreate } = formCreate; 
  const { reset: resetFormUpdate } = formUpdate;
  const handleEdit = (id: string|BigInt) => {
    setError("");
    const itemToEdit = positions.find((item) => item.id === id);
    if (itemToEdit) {
      // Set edit data
      setEditData(itemToEdit);
      // Reset form with the selected item's data
      // Open dialog
       // Reset form with the selected item's data
      resetFormUpdate({
        name: itemToEdit.name,
        description: itemToEdit.description,
      });
      setIsOpenDialogUpdate(true);
      resetFormUpdate();
    }
  };

const onSubmitUpdate = (values:z.infer<typeof CreateDepartmentSchema>) => {
  if (!editData) return; // Ensure there is data to edit
  setError("");
  startTransition(()=>{
    update_position(editData?.id,values)
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
        fetchPositions();
      }
    })
  });
};
const onSubmitCreate=(values:z.infer<typeof CreateDepartmentSchema>)=>{
  setError("");
  startTransition(()=>{
    create_position(values)
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
        fetchPositions();
      }
    })
  });
}
const handleSwitchChange = async (id: string | BigInt, newStatus: number) => {

  try {
    const result = await update_status_position(id, newStatus);
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
        description: "Trạng thái vị trí đã được cập nhật.",
      });

      // Cập nhật trạng thái trực tiếp trên phần tử trong danh sách departments
      setPositions(prevPositions =>
        prevPositions.map(position =>
          position.id === id ? { ...position, status: newStatus } : position
        )
      );
    }
  } catch (error) {
    console.error("Error updating status:", error);
    toast({
      variant: "destructive",
      title: "Lỗi",
      description: "Đã có lỗi xảy ra khi cập nhật trạng thái vị trí.",
    });
  } 
};


const handleDelete = (id: string | BigInt) => {
  const department: PositionType | undefined = positions.find((position) => position.id === id);
  const name = department?.name;
  if (name) {
    setDeleteItem(department); // Lưu phần tử cần xóa
  }
};

   // Function to confirm and delete item
   const confirmDelete = async () => {
    if (!deleteItem) return;
  
    try {
      const response = await delete_position(deleteItem.id); // Gọi API để xóa phần tử từ backend
  
      if (response.success) {
        // Xóa thành công, cập nhật danh sách departments
        setPositions((prevPositions) => prevPositions.filter((position) => position.id !== deleteItem.id));
  
        // Thông báo thành công
        toast({
          variant: "success",
          title: "Xóa thành công",
          description: `Khoa ${deleteItem.name} đã được xóa thành công.`,
          action: <ToastAction altText="Ok">Ok</ToastAction>,
        });
        fetchPositions();
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
  
  const fetchPositions = async () => {
    setLoading(true) // Bắt đầu trạng thái loading
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/positions`;
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
        const fetchedPositions: PositionType[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          status: item.status,
        })) // Chỉ lấy các thuộc tính cần thiết
    
        setPositions(fetchedPositions) // Cập nhật danh sách phòng ban
        setTotalRecords(response.data.data.total) // Giả sử API trả về tổng số bản ghi
      } else {
        throw new Error('Invalid response format') // Xử lý trường hợp định dạng không hợp lệ
      }
    } catch (err) {
      setError('Error fetching positions') // Xử lý lỗi
      console.error('Error fetching positions:', err)
    } finally {
      setLoading(false) // Kết thúc trạng thái loading
    }
  }
  useEffect( () => {
    fetchPositions()
  }, [limit, pageIndex,status]) // Thêm limit và page vào dependency để tự động gọi lại khi chúng thay đổi
  const switchConfig = [
    { key: "status", onStatusChange: handleSwitchChange },
  ];

  const columns = positions.length > 0 ? createColumns(positions,undefined, handleEdit, handleDelete,columnHeaderMap,{view:false,edit: true, delete: true}, switchConfig) : [];
  return (
    <main className="flex w-full flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 col bg-muted/40">
    <div className="flex w-full items-center">
      <h1 className="text-lg font-semibold md:text-xl">Quản lý chức danh</h1>
    </div>
    <div
      className="flex flex-col flex-1 rounded-lg px-5 border border-dashed shadow-sm" x-chunk="dashboard-02-chunk-1"
    >
      <div className="flex flex-col gap-1 mt-2 border-b pb-5">
        <h3 className="text-xl tracking-tight">
          Quản lý hệ thống chức danh
        </h3>

        <div className='flex mt-5 justify-between'>
{/* Phần bên trái */}
<Combobox<number>
          options={numberOptions}
          onSelect={handleSelecLimit}
          placeholder="Chọn số bản ghi"  // Thêm placeholder tùy chỉnh
          defaultValue={limit} // Default to 20 records
          />

        {/* Phần bên phải */}
        <div className="flex items-center space-x-5">
          <div className='flex'>
            <Combobox<number>
              options={statusOptions}
              onSelect={handleSelectStatus}
              defaultValue={null} // No default selection for status
              placeholder="Chọn tình trạng"  // Thêm placeholder tùy chỉnh
            />
          </div>
          <div className="flex items-center space-x-2 bg-white">
            <Input type="text" placeholder="Tìm kiếm" 
             value={keyword} // Đặt giá trị từ state keyword
             onChange={(e) => setKeyword(e.target.value)}
            />
            <Button type="submit">Lọc</Button>
          </div>
          
                <Dialog open={isOpenDialogUpdate} onOpenChange={setIsOpenDialogUpdate}>
                      <DialogContent className="sm:max-w-[425px]">
                      <Form {...formUpdate}>
                      <form onSubmit={formUpdate.handleSubmit(onSubmitUpdate)}
                        className="space-y-4"
                        >
                          <DialogHeader>
                          <DialogTitle>Chỉnh sửa chức danh</DialogTitle>
                          <DialogDescription>
                            Để chỉnh sửa  chức danh, click vào lưu khi bạn hoàn thành
                          </DialogDescription>
                          </DialogHeader>
                            <FormField
                              control={formUpdate.control}
                              name="name"
                              render={({field})=>(
                                <FormItem>
                                  <FormLabel>
                                    Tên chức danh
                                  </FormLabel>
                                  <FormControl>
                                    <Input {...field}
                                      disabled={isPending}
                                      placeholder='Example: Y tá'
                                      type="text"
                                    />
                                  </FormControl>
                                  <FormMessage/>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={formUpdate.control}
                              name="description"
                              render={({field})=>(
                                <FormItem>
                                  <FormLabel>
                                    Mô tả
                                  </FormLabel>
                                  <FormControl>
                                    <Input {...field}
                                      disabled={isPending}
                                      placeholder='Example: theo dõi sức khỏe bệnh nhân hằng ngày'
                                      type="text"
                                    />
                                  </FormControl>
                                  <FormMessage/>
                                </FormItem>
                              )}
                            />
                            <FormError message={error}/>
                          <DialogFooter>
                            <Button type="submit">Lưu</Button>
                          </DialogFooter>
                      </form>
                    </Form>
                      </DialogContent>
                  </Dialog>
                <Dialog open={isOpenDialogCreate} onOpenChange={setIsOpenDialogCreate}>
                  <DialogTrigger asChild>
                  <Button className='ml-5'>+ Thêm mới</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                  <Form {...formCreate}>
                      <form onSubmit={formCreate.handleSubmit(onSubmitCreate)}
                        className="space-y-4"
                        >
                          <DialogHeader>
                          <DialogTitle>Thêm mới chức danh</DialogTitle>
                          <DialogDescription>
                            Để thêm mới chức danh, click vào Thêm khi bạn hoàn thành
                          </DialogDescription>
                          </DialogHeader>
                            <FormField
                              control={formCreate.control}
                              name="name"
                              render={({field})=>(
                                <FormItem>
                                  <FormLabel>
                                    Tên Chức danh
                                  </FormLabel>
                                  <FormControl>
                                    <Input {...field}
                                      disabled={isPending}
                                      placeholder='Example: Bác s'
                                      type="text"
                                    />
                                  </FormControl>
                                  <FormMessage/>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={formCreate.control}
                              name="description"
                              render={({field})=>(
                                <FormItem>
                                  <FormLabel>
                                    Mô tả
                                  </FormLabel>
                                  <FormControl>
                                    <Input {...field}
                                      disabled={isPending}
                                      placeholder='Example: theo dõi sức khỏe cho bệnh nhân'
                                      type="text"
                                    />
                                  </FormControl>
                                  <FormMessage/>
                                </FormItem>
                              )}
                            />
                            <FormError message={error}/>
                          <DialogFooter>
                            <Button type="submit">Thêm</Button>
                          </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
                <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Bạn có chắc chắn muốn xóa không?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Hành động này không thể hoàn tác. Bạn đang xóa chức danh là :{" "}
                      <strong>{deleteItem?.name}</strong>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeleteItem(null)}>Hủy</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete}>Xác nhận</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
        </div>
        </div>
      </div>
      <div>
      {loading ? (
          <p className='flex item-center justify-center'>Loading...</p>
        ) : (
          
            <DataTable
            data={positions}
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
      </div>
  </main>
  )
}

export default Prosition
