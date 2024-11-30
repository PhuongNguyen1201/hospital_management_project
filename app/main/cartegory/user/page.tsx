"use client"; 
import { Button } from '@/components/ui/button'
import React, { use, useEffect, useState } from 'react'

 

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';


import { useTransition } from 'react';
import * as z from "zod"
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

import {useForm} from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';

import { CreateDepartmentSchema, CreateUserSchema} from '@/schema';

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
import { create_department } from '@/actions/cartegory/department/createdepartment';
import { UserInfoType } from '@/types';
import { useRouter } from 'next/navigation'
import axios from 'axios';
import { delete_user } from '@/actions/cartegory/user/index';
import { update_status_user } from '@/actions/cartegory/user/updatestatus';

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
  name: "Tên bệnh nhân",
  email: "Địa chỉ email",
  address: "Địa chỉ",
  phone: "Điện thoại",
  cccd: "CCCD",
  certificate: "Chứng chỉ",
  examination_status:"Tình trạng khám",
  gender:"Giới tính",
  status:"Tình trạng",
  position_name:"Chức danh",
  department_name:"Khoa",
  room_codes:"Các phòng" 
  // Add more mappings as needed
};

 

const UserInfor = () => {
  const router = useRouter(); 
  const [status, setStatus] = useState<number|null>(null); // Trạng thái không chọn gì
  const [keyword, setKeyword] = useState('');
  const [limit, setLimit] = useState(20); // Mặc định không hiển thị bản ghi nào
  const [totalRecords, setTotalRecords] = useState(1);
  const [pageIndex, setPageIndex] = useState(1);

  //data
  const [users,setUsers]=useState<UserInfoType[]>([]);


  const [deleteItem, setDeleteItem] = useState<UserInfoType | null>(null);
  //const [items, setItems] = useState(data);

  const [editData, setEditData] = useState<UserInfoType|null>(null);
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

  
  const handleClick = () => {
    // Use router in a safe way, like in an event handler or inside useEffect
    router.push('/main/cartegory/user/create');
  };
  const handleEdit = (id: string | bigint) => {
    router.push(`/main/cartegory/user/edit/${id}`); // Điều hướng đến trang edit với ID
  };
  
  
  const handleDelete = (id: string|bigint) => {
    const user:UserInfoType|undefined=users.find((user) => user.id === id);
    const nameChoosen=user?.name;
    if(nameChoosen){

      setDeleteItem(user); // Save the item to be deleted
    }
    // Logic to delete the item
  };
   // Function to confirm and delete item
   const confirmDelete = async () => {
    if (!deleteItem) return;
  
    try {
      const response = await delete_user(deleteItem.id); // Gọi API để xóa phần tử từ backend
  
      if (response.success) {
        // Xóa thành công, cập nhật danh sách departments
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== deleteItem.id));
  
        // Thông báo thành công
        toast({
          variant: "success",
          title: "Xóa thành công",
          description: `Người dùng ${deleteItem.name} đã được xóa thành công.`,
          action: <ToastAction altText="Ok">Ok</ToastAction>,
        });
        fetchUsers();
      } else {
        // Thông báo lỗi nếu có
        toast({
          variant: "destructive",
          title: "Lỗi khi xóa",
          description: response.error || "Đã xảy ra lỗi khi xóa người dùng.",
          action: <ToastAction altText="Try again">Thử lại</ToastAction>,
        });
      }
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      toast({
        variant: "destructive",
        title: "Lỗi khi xóa",
        description: "Đã xảy ra lỗi khi xóa người dùng.",
        action: <ToastAction altText="Try again">Thử lại</ToastAction>,
      });
    } finally {
      // Đóng dialog sau khi xóa hoặc có lỗi
      setDeleteItem(null);
    }
  };
  const handleView = (id: string | BigInt) => {
    // const department: DepartmentType | undefined = departments.find((department) => department.id === id);
    // const name = department?.name;
    // if (name) {
    //   setDeleteItem(department); // Lưu phần tử cần xóa
    // }
  };
  const handleSwitchChange = async (id: string | bigint, newStatus: number) => {

    try {
      const result = await update_status_user(id, newStatus);
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
  
        // Cập nhật trạng thái trực tiếp trên phần tử trong danh sách users
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === id ? { ...user, status: newStatus } : user
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
  const fetchUsers = async () => {
    setLoading(true); // Bắt đầu trạng thái loading
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/users`;
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
        const userLists: UserInfoType[] = data.map((item: any) => ({
          id: BigInt(item.id),
          name: item.name,
          email: item.email,
          address: item.address,
          phone: item.phone,
          cccd: item.cccd,
          certificate: item.certificate,
          gender: item.gender,
          status: item.status , // Chuyển đổi thành boolean
          position_id: BigInt(item.position.id),
          position_name: item.position.name,
          department_id: BigInt(item.department.id),
          department_name: item.department.name,
          room_ids: item.rooms ? item.rooms.map((room: any) => room.id) : [], // Chuyển đổi danh sách phòng
          room_codes: item.rooms ? item.rooms.map((room: any) => room.code) : [], // Lấy danh sách mã phòng
        }));
  
        console.log(userLists)
        setUsers(userLists); // Cập nhật danh sách người dùng
        setTotalRecords(response.data.data.total); // Giả sử API trả về tổng số bản ghi
      } else {
        throw new Error('Invalid response format'); // Xử lý trường hợp định dạng không hợp lệ
      }
    } catch (err) {
      setError('Error fetching users'); // Xử lý lỗi
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false); // Kết thúc trạng thái loading
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, [limit, pageIndex, status]); // Thêm limit và page vào dependency để tự động gọi lại khi chúng thay đổi
  const switchConfig = [
    { key: "status", onStatusChange: handleSwitchChange },
  ];
  const columns = users.length > 0 ? createColumns(users,handleView, handleEdit, handleDelete, columnHeaderMap,{view: false, edit: true, delete: true},switchConfig ) : [];
  // // Gọi createColumns
 
  

  return (
    <main className="flex w-full flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 col bg-muted/40">
    <div className="flex w-full items-center">
      <h1 className="text-lg font-semibold md:text-xl">Quản lý Người dùng</h1>
    </div>
    <div
      className="flex flex-col flex-1 rounded-lg px-5 border border-dashed shadow-sm" x-chunk="dashboard-02-chunk-1"
    >
      <div className="flex flex-col gap-1 mt-2 border-b pb-5">
        <h3 className="text-xl tracking-tight">
          Quản lý hệ thống Người dùng
        </h3>

        <div className='flex mt-5 justify-between'>
{/* Phần bên trái */}
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
                <Button className='ml-5' onClick={handleClick}>+ Thêm mới</Button>

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
      <DataTable 
      data={users} 
      columns={columns} 
      totalRecords={totalRecords}
      pageIndex={pageIndex}
      pageSize={limit}
      onPageChange={(newPageIndex) => {
        console.log("pageindex:", newPageIndex)
        setPageIndex(newPageIndex) // Cập nhật pageIndex với giá trị mới
      }}
      
      />

      </div>
      </div>
  </main>
  )
}

export default UserInfor
