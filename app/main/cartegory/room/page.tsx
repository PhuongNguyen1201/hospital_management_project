"use client";
import { Button } from '@/components/ui/button';
import React, { startTransition, useEffect, useState, useTransition } from 'react';
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
import { RoomSchema } from '@/schema'; // Schema cho Room
import { DepartmentType, PositionType, RoomCatalogueType, RoomType } from '@/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/combobox';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import { create_room, delete_room, update_room, update_status_room } from '@/actions/cartegory/room';
import axios from 'axios';
import { Value } from '@radix-ui/react-select';


const statusOptions = [
  { value: 0, label: "Không hoạt động" },
  { value: 1, label: "Hoạt động" },
  { value: 2, label: "Tât cả" },
]
const numberOptions = [
  { value: 10, label: "10 bản ghi" },
  { value: 20, label: "20 bản ghi" },
  { value: 40, label: "40 bản ghi" },
]
const columnHeaderMap: { [key: string]: string } = {
  code: "Từ khóa",
  description:"Mô tả",
  department_name: "Tên khoa",
  status_bed:"Tình trạng giường",
  room_catalogue_code: "Nhóm phòng",
  beds_count: "Giường hoạt động",
  status:"Trạng thái hoạt động"
};
const RoomPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<RoomType| null>(null);
  const [items, setItems] = useState<RoomType[]>([]);
  const [editData, setEditData] = useState<RoomType | null>(null);
  const [error, setError] = useState<string | undefined>("");
  const [status, setStatus] = useState<number|null>(null); // Trạng thái không chọn gì
  const [keyword, setKeyword] = useState('');
  const [limit, setLimit] = useState(20); // Mặc định không hiển thị bản ghi nào
  const [totalRecords, setTotalRecords] = useState(1);
  const [pageIndex, setPageIndex] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isPending,startTransition]=useTransition();

  const [roomCatalogues, setRoomCatalogues] = useState<RoomCatalogueType[]>([]);
  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  
  const [isOpenDialogCreate, setIsOpenDialogCreate] = useState(false);
  const [isOpenDialogUpdate, setIsOpenDialogUpdate] = useState(false);

  const { toast } = useToast();

  const formCreate=useForm<z.infer<typeof RoomSchema>>({
    resolver:zodResolver(RoomSchema),
    defaultValues:{
      code:"",
      room_catalogue_id:undefined,
      department_id:undefined,
    },

  });
  const formUpdate=useForm<z.infer<typeof RoomSchema>>({
    resolver:zodResolver(RoomSchema),
    defaultValues:{
      code:"",
      room_catalogue_id:undefined,
      department_id:undefined,
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
  const handleSelectRecords = (value: number | null) => {
    console.log("Selected value:", value)
    if (value) {
      setTotalRecords(value);
      setPageIndex(1); // Reset về trang 1 khi thay đổi limit
    }
  }
  const handleSelectStatus = (value: number | null) => {
      setStatus(value);
      setPageIndex(1); // Reset về trang 1 khi thay đổi limit
  }
  const onSubmitCreate = async (values: z.infer<typeof RoomSchema>) => {
    setError("");
  
    try {
      // Bắt đầu quá trình tạo phòng
      const data = await create_room(values);
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
        await fetchRooms();
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
  
  const handleEdit = (id: string | bigint) => {
    setError("");
    const itemToEdit = items.find((item) => item.id === id);
    if (itemToEdit) {
      setEditData(itemToEdit);
      
      resetFormUpdate({
        code:itemToEdit.code,
        room_catalogue_id: itemToEdit.room_catalogue_id,
        department_id: itemToEdit.department_id,
      });
      setIsOpenDialogUpdate(true);
    }
  };

  const onSubmitEdit = (formData: z.infer<typeof RoomSchema>) => {
    if (!editData) return; // Ensure there is data to edit
    setError("");
    startTransition(()=>{
      update_room(editData?.id,formData)
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
          fetchRooms();
        }
      })
    });
  };
  

  const handleDelete = (id: string | bigint) => {
    const room = items.find((room) => room.id === id);
    const code = room?.code;
    if (code) {
      setDeleteItem(room);
    }
  };
  const handleSwitchChange = async (id: string | bigint, newStatus: number) => {

    try {
      const result = await update_status_room(id, newStatus);
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
      const response = await delete_room(deleteItem.id); // Gọi API để xóa phần tử từ backend
  
      if (response.success) {
        // Xóa thành công, cập nhật danh sách departments
        setItems((prevItems) => prevItems.filter((item) => item.id !== deleteItem.id));
  
        // Thông báo thành công
        toast({
          variant: "success",
          title: "Xóa thành công",
          description: `Phòng ${deleteItem.code} đã được xóa thành công.`,
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
    
        setItems(fetchedRooms) // Cập nhật danh sách phòng ban
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
          const totalRecords=response.data.data.total;
          const responseAll = await axios.get(endpoint, {
            params: {
              limit: totalRecords, // Số bản ghi trên mỗi trang
            },
          })
          const {data}=responseAll.data.data;
          if (Array.isArray(data)) {
            const roomCataloguelist: RoomCatalogueType[] = data
            .filter((item: any) => item.status === 1) // Lọc các phần tử có status bằng 1
            .map((item: any) =>({
              id: item.id,
              keyword: item.keyword,
              name: item.name,
              description: item.description,
              status: item.status,
            })) // Chỉ lấy các thuộc tính cần thiết
            setRoomCatalogues(roomCataloguelist) // Cập nhật
            }
      } catch (err) {
          console.error("Error fetching roomcatalogue:", err);
          toast({ variant: "destructive", title: "Error", description: "Could not load positions." });
      }
  };

  const fetchDepartments = async () => {
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/departments`;
      
    try {
        const response = await axios.get(endpoint);
        const totalRecords=response.data.data.total;
        const responseAll = await axios.get(endpoint, {
          params: {
            limit: totalRecords, // Số bản ghi trên mỗi trang
          },
        })
        const {data}=responseAll.data.data;
        if (Array.isArray(data)) {
          const departmentlist: DepartmentType[] = data
            .filter((item: any) => item.status === 1) // Lọc các phần tử có status bằng 1
            .map((item: any) => ({
              id: item.id,
              name: item.name,
              description: item.description,
              status: item.status ,
            }));
          
          setDepartments(departmentlist); // Cập nhật danh sách đã lọc
        }
        
      } catch (err) {
          console.error("Error fetching departments:", err);
          toast({ variant: "destructive", title: "Error", description: "Could not load departments." });
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
  const handleSelectDepartmemt = (value: bigint | null) => {
    if(value!==null)
      if(isOpenDialogCreate){
        formCreate.setValue('department_id', BigInt(value)); // Update the form value directly
      }
      else if(isOpenDialogUpdate){
        formUpdate.setValue('department_id', BigInt(value));
      }
      
  };
  useEffect( () => {
    fetchRoomCatalogues();
    fetchDepartments();
    fetchRooms();
  }, [limit, pageIndex,status]) // Thêm limit và page vào dependency để tự động gọi lại khi chúng thay đổi
  const switchConfig = [
    { key: "status", onStatusChange: handleSwitchChange },
  ];
  const columns = items.length > 0 ? createColumns(items,undefined, handleEdit, handleDelete,columnHeaderMap,{view:false,edit: true, delete: true},switchConfig ) : [];


  return (
    <main className="flex w-full flex-1 flex-col gap-4 p-4">
      <div className="flex w-full items-center">
        <h1 className="text-lg font-semibold md:text-xl">Quản lý phòng</h1>
      </div>

      <div className="flex flex-col gap-1 mt-2 border-b pb-5">
        <h3 className="text-xl tracking-tight">Quản lý hệ thống phòng</h3>

        <div className="flex mt-5 justify-between">
        <Combobox<number>
          options={numberOptions}
          onSelect={handleSelectRecords}
          placeholder="Chọn số bản ghi"  // Thêm placeholder tùy chỉnh
          />

        {/* Phần bên phải */}
        <div className="flex items-center space-x-5">
          <div className='flex'>
          <Combobox<number>
              options={statusOptions}
              onSelect={handleSelecLimit}
              defaultValue={limit} // No default selection for status
              placeholder="Chọn tình trạng"  // Thêm placeholder tùy chỉnh
            />
          </div>
          <div className="flex items-center space-x-2 bg-white">
            <Input type="text" placeholder="Tìm kiếm" />
            <Button type="submit">Lọc</Button>
          </div>
      
            <Dialog open={isOpenDialogUpdate} onOpenChange={setIsOpenDialogUpdate}>
                 
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Chỉnh sửa phòng</DialogTitle>
                <DialogDescription>
                  Để chỉnh sửa phòng, click vào Lưu khi bạn hoàn thành.
                </DialogDescription>
              </DialogHeader>
              <Form {...formUpdate}>
              <form onSubmit={formUpdate.handleSubmit(onSubmitEdit)} className="space-y-4">
                {/* Thêm các trường form ở đây */}
                <FormField control={formUpdate.control} name="code" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã phòng</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Mã phòng" />
                    </FormControl>
                  </FormItem>
                )} />

                <FormField 
                      control={formUpdate.control}
                      name="department_id"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="mr-2">Khoa</FormLabel>
                          <FormControl className="flex-grow">
                            <Combobox<bigint>
                              options={departments.map(department => ({
                                value: department.id,
                                label: department.name,
                              }))}
                                placeholder="Chọn khoa"
                                onSelect={handleSelectDepartmemt}
                                defaultValue={field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                 <FormField 
                      control={formUpdate.control}
                      name="room_catalogue_id"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="mr-2">Nhóm phòng</FormLabel>
                          <FormControl className="flex-grow">
                            <Combobox<bigint>
                              options={roomCatalogues.map(roomCatalogue => ({
                                value: roomCatalogue.id,
                                label: roomCatalogue.name,
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
                


                {/* Thêm các trường khác nếu cần */}
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
              <DialogHeader>
                <DialogTitle>Thêm mới phòng</DialogTitle>
                <DialogDescription>
                  Thêm phòng, click vào Lưu khi bạn hoàn thành.
                </DialogDescription>
              </DialogHeader>
              <Form {...formCreate}>
              <form onSubmit={formCreate.handleSubmit(onSubmitCreate)} className="space-y-4">
              <FormField
                              control={formCreate.control}
                              name="code"
                              render={({field})=>(
                                <FormItem>
                                  <FormLabel>
                                    Mã phòng
                                  </FormLabel>
                                  <FormControl>
                                    <Input {...field}
                                      disabled={isPending}
                                      placeholder='Mã phòng'
                                      type="text"
                                    />
                                  </FormControl>
                                  <FormMessage/>
                                </FormItem>
                              )}
                            />
                <FormField 
                      control={formCreate.control}
                      name="department_id"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="mr-2">Khoa</FormLabel>
                          <FormControl className="flex-grow">
                            <Combobox<bigint>
                              
                              options={departments.map(department => ({
                                value: department.id,
                                label: department.name,
                              }))}
                                placeholder="Chọn khoa"
                                onSelect={handleSelectDepartmemt}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                 <FormField 
                      control={formCreate.control}
                      name="room_catalogue_id"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="mr-2">Nhóm phòng</FormLabel>
                          <FormControl className="flex-grow">
                            <Combobox<bigint>
                              options={roomCatalogues.map(roomCatalogue => ({
                                value: roomCatalogue.id,
                                label: roomCatalogue.name,
                              }))}
                                placeholder="Chọn nhóm phòng"
                                onSelect={handleSelectRoomCatalogue}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                {/* Thêm các trường khác nếu cần */}
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
              Hành động này không thể hoàn tác. Bạn đang xóa phòng:{" "}
              <strong>{deleteItem?.code}</strong>
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

export default RoomPage;
