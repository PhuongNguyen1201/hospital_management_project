"use client";
import { Button } from '@/components/ui/button';
import React, { startTransition, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { FormError } from '@/components/form-error';
import { DataTable } from '@/components/data-table';
import createColumns from '@/components/column-custom';
import { RoomCatalogueSchema } from '@/schema';
import { RoomCatalogue } from '@/types';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/combobox';
import axios from 'axios';
import { create_room_catalogue, delete_room_catalogue, update_room_catalogue, update_status_room_catalogue } from '@/actions/cartegory/roomcatalouge/index';
import { ToastAction } from '@/components/ui/toast';


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
  keyword: "Từ khóa",
  name: "Tên nhóm phòng",
  description: "Mô tả",
  status:"Trạng thái hoạt động"
};
const RoomCataloguePage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<RoomCatalogue| null>(null);
  const [items, setItems] = useState<RoomCatalogue[]>([]);
  const [editData, setEditData] = useState<RoomCatalogue | null>(null);
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

  const formCreate=useForm<z.infer<typeof RoomCatalogueSchema>>({
    resolver:zodResolver(RoomCatalogueSchema),
    defaultValues:{
      keyword:"",
      name:"",
      description:"",
    },
  });
  const formUpdate=useForm<z.infer<typeof RoomCatalogueSchema>>({
    resolver:zodResolver(RoomCatalogueSchema),
    defaultValues:{
      keyword:"",
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
  const onSubmitCreate=(values:z.infer<typeof RoomCatalogueSchema>)=>{
    console.log('Submitting form with values:', values);
    setError("");
    startTransition(()=>{
      create_room_catalogue(values)
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
          fetchRoomCatalogues();
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
        keyword:itemToEdit.keyword,
        name: itemToEdit.name,
        description: itemToEdit.description,
      });
      setIsOpenDialogUpdate(true);
      resetFormUpdate();
    }
  };

  const onSubmitEdit = (formData: z.infer<typeof RoomCatalogueSchema>) => {
    if (!editData) return; // Ensure there is data to edit
    setError("");
    startTransition(()=>{
      update_room_catalogue(editData?.id,formData)
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
          fetchRoomCatalogues();
        }
      })
    });
  };
  

  const handleDelete = (id: string | bigint) => {
    const room = items.find((room) => room.id === id);
    const name = room?.name;
    if (name) {
      setDeleteItem(room);
    }
  };
  const handleSwitchChange = async (id: string | bigint, newStatus: number) => {

    try {
      const result = await update_status_room_catalogue(id, newStatus);
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
      const response = await delete_room_catalogue(deleteItem.id); // Gọi API để xóa phần tử từ backend
  
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
        fetchRoomCatalogues();
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
  const fetchRoomCatalogues = async () => {
    setLoading(true) // Bắt đầu trạng thái loading
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/roomCatalogues`;
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
        const fetchedRoomCatalogues: RoomCatalogue[] = data.map((item: any) => ({
          id: item.id,
          keyword:item.keyword,
          name: item.name,
          description: item.description,
          status: item.status,
        })) // Chỉ lấy các thuộc tính cần thiết
    
        setItems(fetchedRoomCatalogues) // Cập nhật danh sách phòng ban
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
  useEffect( () => {
    fetchRoomCatalogues()
  }, [limit, pageIndex,status]) // Thêm limit và page vào dependency để tự động gọi lại khi chúng thay đổi
  const switchConfig = [
    { key: "status", onStatusChange: handleSwitchChange },
  ];
  const columns = items.length > 0 ? createColumns(items,undefined, handleEdit, handleDelete,columnHeaderMap,{view:false,edit: true, delete: true},switchConfig ) : [];

  return (
    <main className="flex w-full flex-1 flex-col gap-4 p-4">
      <div className="flex w-full items-center">
        <h1 className="text-lg font-semibold md:text-xl">Quản lý nhóm phòng</h1>
      </div>

      <div className="flex flex-col gap-1 mt-2 border-b pb-5">
        <h3 className="text-xl tracking-tight">Quản lý hệ thống nhóm phòng</h3>
        
        <div className="flex mt-5 justify-between">
            <Combobox<number>
              options={numberOptions}
              onSelect={handleSelecLimit}
              placeholder="Chọn số bản ghi"  // Thêm placeholder tùy chỉnh
              defaultValue={limit} // Default to 20 records
              />
          <div className="flex items-center space-x-5">
          <div className='flex'>
          <Combobox<number>
              options={statusOptions}
              onSelect={handleSelectStatus}
              defaultValue={null} // No default selection for status
              placeholder="Chọn tình trạng"  // Thêm placeholder tùy chỉnh
            />
          </div>
            <Input type="text" placeholder="Tìm kiếm phòng" />
            <Button type="submit">Lọc</Button>

            <Dialog open={isOpenDialogUpdate} onOpenChange={setIsOpenDialogUpdate}>
              <DialogContent className="sm:max-w-[425px]">
                <Form {...formUpdate}>
                  <form onSubmit={formUpdate.handleSubmit(onSubmitEdit)} className="space-y-4">
                    <DialogHeader>
                      <DialogTitle>Chỉnh sửa phòng</DialogTitle>
                      <DialogDescription>
                        Để Chỉnh sửa phòng, click vào Lưu khi bạn hoàn thành
                      </DialogDescription>
                    </DialogHeader>
                    <FormField
                      control={formUpdate.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tên nhóm phòng</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Tên nhóm phòng" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={formUpdate.control}
                      name="keyword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Keyword</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Example: NOITRU" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={formUpdate.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mô tả</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Mô tả về nhóm phòng" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit">Lưu</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            <Dialog open={isOpenDialogCreate} onOpenChange={setIsOpenDialogCreate}>
            <DialogTrigger asChild>
                <Button className='ml-5' >+ Thêm mới</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <Form {...formCreate}>
                  <form onSubmit={formCreate.handleSubmit(onSubmitCreate)} className="space-y-4">
                    <DialogHeader>
                      <DialogTitle>Chỉnh sửa  nhóm phòng</DialogTitle>
                      <DialogDescription>
                        Để Chỉnh sửa nhóm phòng, click vào Lưu khi bạn hoàn thành
                      </DialogDescription>
                    </DialogHeader>
                    <FormField
                      control={formCreate.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tên nhóm phòng</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Tên nhóm phòng" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={formCreate.control}
                      name="keyword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Keyword</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Example: NOITRU" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={formCreate.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mô tả</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Mô tả về nhóm phòng" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit">Lưu</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Hiển thị bảng danh sách */}
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
              Hành động này không thể hoàn tác. Bạn đang xóa nhóm phòng:{" "}
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

export default RoomCataloguePage;
