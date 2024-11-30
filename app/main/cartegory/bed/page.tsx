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
import { BedSchema } from '@/schema'; // Schema cho Bed
import { BedType, DepartmentType, RoomCatalogueType, RoomType } from '@/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/combobox';
import { ToastAction } from '@radix-ui/react-toast';
import { create_bed, delete_bed, update_bed, update_status_bed } from '@/actions/cartegory/bed';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

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
  code: "Từ khóa",
  department_name:"Khoa",
  room_catalogue_name:"Nhóm phòng",
  room_code:"Phòng",
  patient_name: "Tên bệnh nhân",
  price:"Giá giường",
  status:"Trạng thái hoạt động"
};

const BedPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<BedType| any>(null);
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [items, setItems] = useState<BedType[]>([]);
  const [editData, setEditData] = useState<BedType | any>(null);
  const [error, setError] = useState<string | any>("");
  const [status, setStatus] = useState<number|any>(null); // Trạng thái không chọn gì
  const [keyword, setKeyword] = useState('');
  const [limit, setLimit] = useState(20); // Mặc định không hiển thị bản ghi nào
  const [totalRecords, setTotalRecords] = useState(1);
  const [pageIndex, setPageIndex] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isPending,startTransition]=useTransition();

  const [roomCatalogues, setRoomCatalogues] = useState<RoomCatalogueType[]>([]);
  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  const [selectDepartments, setSelectDepartments] = useState<DepartmentType[]>([]);
  
  const [isOpenDialogCreate, setIsOpenDialogCreate] = useState(false);
  const [isOpenDialogUpdate, setIsOpenDialogUpdate] = useState(false);

  const { toast } = useToast();

  const formCreate=useForm<z.infer<typeof BedSchema>>({
    resolver:zodResolver(BedSchema),
    defaultValues: {
      price: 200000, // Giá trị mặc định của "price" tại đây
    },
  });
  const formUpdate=useForm<z.infer<typeof BedSchema>>({
    resolver:zodResolver(BedSchema),
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
  const onSubmitCreate = async (values: z.infer<typeof BedSchema>) => {
    setError("");
  
    try {
      // Bắt đầu quá trình tạo phòng
      const data = await create_bed(values);
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
        await fetchBeds();
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
    setError(""); // Reset error message before editing
    const itemToEdit: BedType | any = items.find((item) => item.id === id);
  
    if (itemToEdit) {
      resetFormUpdate(  
        {
          code:itemToEdit.code,
          room_id:BigInt(itemToEdit.room_id),
          price:itemToEdit.price,
        }
      )
      fetchRooms(itemToEdit.department_id, "NOITRU");
      
      setEditData(itemToEdit); // Set the data to edit
      setIsOpenDialogUpdate(true); // Open the update dialog
    } else {
      setError("Không tìm thấy giường để chỉnh sửa"); // Optional: Handle case where item doesn't exist
    }
  };
  

  const onSubmitEdit = (formData: z.infer<typeof BedSchema>) => {
    if (!editData) return; // Ensure there is data to edit
    setError("");
    startTransition(()=>{
      update_bed(editData?.id,formData)
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
          fetchBeds();
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
  const confirmDelete = async () => {
    if (!deleteItem) return;
  
    try {
      const response = await delete_bed(deleteItem.id); // Gọi API để xóa phần tử từ backend
  
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
  const handleSwitchChange = async (id: string | bigint, newStatus: number) => {

    try {
      const result = await update_status_bed(id, newStatus);
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
          setSelectDepartments(departmentlist);
          setDepartments(departmentlist); // Cập nhật danh sách đã lọc
        }
        
      } catch (err) {
          console.error("Error fetching departments:", err);
          toast({ variant: "destructive", title: "Error", description: "Could not load departments." });
      }
  };
  const fetchBeds = async () => {
    setLoading(true); // Bắt đầu trạng thái loading
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/beds`;

    try {
        const response = await axios.get(endpoint, {
            params: {
                limit: limit, // Số bản ghi trên mỗi trang
                page: pageIndex, // Trang hiện tại
                status: status !== 2 ? status : undefined, // Thêm trạng thái vào tham số API
                keyword: keyword.trim() !== "" ? keyword : undefined // Thêm từ khóa tìm kiếm vào tham số API
            },
        });
        const { data } = response.data.data;

        if (Array.isArray(data)) {
            const fetchedBeds: BedType[] = data.map((item: any) => ({
                id: item.id,
                code: item.code,
                room_code: item.room.code,
                department_id: item.room.department_id,
                room_catalogue_id: item.room.room_catalogue_id,
                room_id: item.room.id,
                // Tạm thời để trống department_name và room_catalogue_name
                department_name: "", 
                room_catalogue_name: "", 
                patient_id: item.patient?.id,
                patient_name: item.patient?.name,
                price: item.price,
                status: item.status,
            }));
            setItems(fetchedBeds); // Cập nhật danh sách giường
            setTotalRecords(response.data.data.total); // Giả sử API trả về tổng số bản ghi

            // Bổ sung department_name và room_catalogue_name sau khi có dữ liệu
            updateBedNames(fetchedBeds);
        } else {
            throw new Error('Invalid response format'); // Xử lý trường hợp định dạng không hợp lệ
        }
    } catch (err) {
        setError('Error fetching beds'); // Xử lý lỗi
        console.error('Error fetching beds:', err);
    } finally {
        setLoading(false); // Kết thúc trạng thái loading
    }
};

// Hàm để cập nhật department_name và room_catalogue_name sau khi có danh sách
const updateBedNames = (beds: BedType[]) => {
    setItems(beds.map(bed => ({
        ...bed,
        department_name: departments.find(dep => dep.id === bed.department_id)?.name || "",
        room_catalogue_name: roomCatalogues.find(cat => cat.id === bed.room_catalogue_id)?.name || ""
    })));
};

const fetchRooms = async (departmentId: bigint, keyword: string) => {
  setLoading(true);
  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/rooms`;

  try {
    // Gọi API để lấy tổng số bản ghi cho departmentId và keyword
    const initialResponse = await axios.get(endpoint, {
    });

    const totalRecords = initialResponse.data.data.total;

    // Gọi API với limit = totalRecords để lấy tất cả các phòng
    const response = await axios.get(endpoint, {
      params: {
        limit: totalRecords,
      },
    });

    const { data } = response.data.data;
    if (Array.isArray(data)) {
      // Lọc các phòng có room_catalogue.name là "NOTRU"
      const fetchedRooms: RoomType[] = data
        .filter((item: any) => item.department_id===departmentId&&item.room_catalogue.keyword===keyword) // Chỉ lấy phòng có tên "NOTRU"
        .map((item: any) => ({
          id: item.id,
          code: item.code,
          department_name: item.department.name,
          room_catalogue_code: item.room_catalogue.keyword,
          description: item.room_catalogue.description,
          beds_count: item.beds_count,
          status_bed: item.status_bed,
          status: item.status,
          department_id: item.department_id,
          room_catalogue_id: item.room_catalogue_id,
        }));
      setRooms(fetchedRooms); // Cập nhật danh sách phòng
      setTotalRecords(totalRecords);
    } else {
      throw new Error('Invalid response format');
    }
  } catch (err) {
    setError('Error fetching rooms');
    console.error('Error fetching rooms:', err);
  } finally {
    setLoading(false);
  }
};



  const handleSelectRoom = (value: bigint | null) => {
    
    if(value!==null){
      if(isOpenDialogCreate){
        console.log(value)
        formCreate.setValue('room_id', BigInt(value)); // Update the form value directly
      }
      else if(isOpenDialogUpdate){
        formUpdate.setValue('room_id', BigInt(value));
      }
    }
    // console.log(value)
  };
  const handleSelectDepartment = async (departmentId: bigint | null) => {
    if (departmentId === null) return;
    
    try {
      // Gọi API để lấy room_catalogue có key là "NOITRU" trong khoa đã chọn
        fetchRooms(departmentId, "NOITRU"); // Gọi fetchRooms với department_id và room_catalogue_id
      } 
     catch (err) {
      console.error("Có lỗi khi lấy dữ liệu phòng", err);
    }
  };
  

// Gọi fetchRoomCatalogues và fetchDepartments một lần khi component mount
useEffect(() => {
  const fetchInitialData = async () => {
      setLoading(true);
      try {
          await Promise.all([fetchRoomCatalogues(), fetchDepartments()]);
      } catch (err) {
          console.error("Error fetching initial data:", err);
      } finally {
          setLoading(false);
      }
  };

  fetchInitialData();
}, []); // Chạy một lần khi component mount

// Gọi fetchBeds khi limit, pageIndex, hoặc status thay đổi
useEffect(() => {
  if (departments.length > 0 && roomCatalogues.length > 0) {
      // Chỉ gọi fetchBeds khi đã có dữ liệu của departments và roomCatalogues
      fetchBeds();
  }
}, [limit, pageIndex, status, departments, roomCatalogues]); 
  const switchConfig = [
    { key: "status", onStatusChange: handleSwitchChange },
  ];
  const columns = items.length > 0 ? createColumns(items,undefined, handleEdit, handleDelete,columnHeaderMap,{view:false,edit: true, delete: true},switchConfig ) : [];


  return (
    <main className="flex w-full flex-1 flex-col gap-4 p-4">
      <div className="flex w-full items-center">
        <h1 className="text-lg font-semibold md:text-xl">Quản lý giường</h1>
      </div>

      {/* Phần thêm mới giường */}
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
            <Button className='ml-5'>+ Thêm mới</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Thêm giường mới</DialogTitle>
              <DialogDescription>
                Nhập thông tin giường mới và nhấn Lưu.
              </DialogDescription>
            </DialogHeader>
            <Form {...formCreate}>
              <form onSubmit={formCreate.handleSubmit(onSubmitCreate)} className="space-y-4">
                <FormField control={formCreate.control} name="code" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã giường</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Mã giường" />
                    </FormControl>
                  </FormItem>
                )} />
                <FormItem className="flex flex-col">
                    <FormLabel className="mr-2">Khoa</FormLabel>
                    <FormControl className="flex-grow">
                    <Combobox<bigint>
                          options={selectDepartments.map(department => ({
                            value: department.id,
                            label: department.name,
                          }))}
                            placeholder="Chọn khoa"
                            onSelect={handleSelectDepartment}
                            />
                    </FormControl>
                    <FormMessage />
                  </FormItem>

                 <FormField 
                      control={formCreate.control}
                      name="room_id"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="mr-2">Phòng</FormLabel>
                          <FormControl className="flex-grow">
                            <Combobox<bigint>
                             options={rooms.map(room => ({
                              value: room.id,
                              label: room.code,
                            }))}
                              placeholder="Chọn phòng"
                              onSelect={handleSelectRoom}
                              />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                <FormField control={formCreate.control} name="price" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá giường</FormLabel>
                    <FormControl>
                      {/* <Input {...field} type="number" placeholder="Giá giường" /> */}
                      <Input {...field} type="number" placeholder="Giá giường"/>
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
              <DialogTitle>Chỉnh sửa giường</DialogTitle>
              <DialogDescription>
                Nhập thông tin giường và nhấn Lưu.
              </DialogDescription>
            </DialogHeader>
            <Form {...formUpdate}>
              <form onSubmit={formUpdate.handleSubmit(onSubmitEdit)} className="space-y-4">
                <FormField control={formUpdate.control} name="code" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã giường</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Mã giường" />
                    </FormControl>
                  </FormItem>
                )} />
                  <FormItem className="flex flex-col">
                    <FormLabel className="mr-2">Khoa</FormLabel>
                    <FormControl className="flex-grow">
                    <Combobox<bigint>
                          options={selectDepartments.map(department => ({
                            value: department.id,
                            label: department.name,
                          }))}
                            placeholder="Chọn khoa"
                            onSelect={handleSelectDepartment}
                            defaultValue={editData?.department_id}
                            />
                    </FormControl>
                    <FormMessage />
                  </FormItem>

                 <FormField 
                      control={formCreate.control}
                      name="room_id"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="mr-2">Phòng</FormLabel>
                          <FormControl className="flex-grow">
                            <Combobox<bigint>
                             options={rooms.map(room => ({
                              value: room.id,
                              label: room.code,
                            }))}
                              placeholder="Chọn phòng"
                              onSelect={handleSelectRoom}
                              defaultValue={editData?.room_id}
                              />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                <FormField control={formUpdate.control} name="price" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá giường</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="Giá giường"/>
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
              Hành động này không thể hoàn tác. Bạn đang xóa giường:{" "}
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

export default BedPage;
