"use client";
export const description =
  "An orders dashboard with a sidebar navigation. The sidebar has icon navigation. The content area has a breadcrumb and search in the header. The main area has a list of recent orders with a filter and export button. The main area also has a detailed view of a single order with order details, shipping information, billing information, customer information, and payment information."

import React, { useEffect, useState, useTransition } from 'react'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Combobox } from '@/components/combobox'
import { DepartmentType, MedicalRecord, Patient, PatientCurrently, RoomCatalogueType, RoomType, UserInfoType } from '@/types';
import { useRouter } from 'next/navigation'
import createColumns from '@/components/column-custom';
import { DataTable } from '@/components/data-table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertCircle, CalendarIcon, ChevronDownIcon, ChevronLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { CreateUserSchema, MedicalRecordSchema, PatientSchema } from '@/schema';
import * as z from "zod"
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import axios from 'axios';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { UserInfo } from '@/lib/dal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { create_patient } from '@/actions/patient/newpatient/create';
import { DayPicker } from 'react-day-picker';
import { FormError } from '@/components/form-error';






const NewPatient = () => {
  const router = useRouter(); 
  const [error,setError]=useState<string|undefined>("");
  const [isPending,startTransition]=useTransition();

  const [keyword, setKeyword] = useState('');
  const [limit, setLimit] = useState(20); // Mặc định không hiển thị bản ghi nào
  const [totalRecords, setTotalRecords] = useState(1);
  const [pageIndex, setPageIndex] = useState(1);

  const [loading, setLoading] = useState(true);

  const [rooms, setRooms] = useState<RoomType[]>([]);

  const [roomCatalogues,setRoomCatalogue]=useState<RoomCatalogueType[]>([]);
  const [isDialogOpen, setDialogOpen] = useState(false); // Để quản lý trạng thái dialog
  const form=useForm<z.infer<typeof MedicalRecordSchema>>({
    //resolver:zodResolver(MedicalRecordSchema),
  });

  const handleReset = () => {
    setError(""); // Xóa lỗi
    form.reset({
      name: '',
      birthday: undefined,
      address: '',
      phone: '',
      cccd_number: '',
      health_insurance_code: '',
      guardian_phone: '',
      gender: 1, // Mặc định là nam
      room_id:undefined,
    });

    form.clearErrors(); // Xóa lỗi validation
  };
    const handleSearch = async () => {
      setError("")
      if(keyword.trim()===""){
        alert("Vui lòng nhập căn cước công dân trước khi tìm")
        form.reset(); // Reset form fields
        form.clearErrors(); // Clear validation errors
      }
      else{
        try {
          // Gửi yêu cầu tìm kiếm bệnh nhân
          const response = await axios.get('http://localhost:8000/api/patients', {
            params: {
              limit: 100, // Các tham số query
            },
          });
          
    
          const patients = response.data.data.data; // Lấy danh sách bệnh nhân từ response
        // Lọc bệnh nhân có CCCD trùng với từ khoá
          const patient = patients.find((patient: Patient) => patient.cccd_number === keyword);
          // Kiểm tra nếu bệnh nhân tìm thấy
          if (patient) {
            // Cập nhật giá trị vào form
            form.setValue('name', patient.name);
            form.setValue('birthday', new Date(patient.birthday || '').getTime());
            form.setValue('address', patient.address || '');
            form.setValue('phone', patient.phone || '');
            form.setValue('cccd_number', patient.cccd_number);
            form.setValue('gender', patient.gender);
            form.setValue('health_insurance_code', patient.health_insurance_code || '');
            form.setValue('guardian_phone', patient.guardian_phone || '');
          } else {
            setDialogOpen(true); // Mở dialog nếu không tìm thấy bệnh nhân
          }
        } catch (err) {
          console.error('Lỗi tìm kiếm bệnh nhân:', err);
          setDialogOpen(true); // Mở dialog nếu có lỗi
        }
      }
      
    };
    const onSubmit = ( values: z.infer<typeof MedicalRecordSchema>) => {
      startTransition(() => {
        console.log(values)
        create_patient(values)
          .then((data) => {
            if (data?.error) {
              setError(data?.error);
             
            } else if (data?.success) {
              
              setError('');
              
              // Hiển thị toast cho thành công
              toast({
                variant:"success",
                title: "Thêm thành công",
                description: data?.success,
                action: <ToastAction altText="Thử lại">Ok</ToastAction>
              });
              handleReset();
               
              // Tắt sau khi thành công
            }
          })
      });
    };

    const fetchRoomCatalogues = async () => {
      setLoading(true) // Bắt đầu trạng thái loading
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/roomCatalogues`;
      try {
        const response = await axios.get(endpoint, {
          params: {
            limit: 1000, // Số bản ghi trên mỗi trang
          },
        })
        const { data } = response.data.data
  
        if (Array.isArray(data)) {
          const fetchedRoomCatalogues: RoomCatalogueType[] = data.map((item: any) => ({
            id: item.id,
            keyword:item.keyword,
            name: item.name,
            description: item.description,
            status: item.status,
          })) // Chỉ lấy các thuộc tính cần thiết
      
          setRoomCatalogue(fetchedRoomCatalogues) // Cập nhật danh sách phòng ban
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
    const fetchRooms = async (value: bigint,) => {
      setLoading(true);
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/rooms`;
    
      try {
        const initialResponse = await axios.get(endpoint);
        const totalRecords = initialResponse.data.data.total;
    
        const responseAll = await axios.get(endpoint, {
          params: {
            limit: totalRecords,
          },
        });
    
        const { data } = responseAll.data.data;
        console.log(data)
        if (Array.isArray(data)) {
          data.forEach((item: any) => {
            console.log("Room:", item.room_catalogue_id);
            console.log("Equals:", item.room_catalogue_id === 7);
            
          });
        }
        if (Array.isArray(data)) {
          const fetchedRooms: RoomType[] = data
            .filter((item: any) => item.department.name === "Khoa khám bệnh" && item.room_catalogue_id === value&&item.users.length>0) // Lọc phòng theo department_id và keyword
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
          console.log(fetchedRooms)
          setRooms(fetchedRooms); // Cập nhật danh sách phòng
          setTotalRecords(totalRecords);
        }
      } catch (err) {
        setError('Error fetching rooms');
        console.error('Error fetching rooms:', err);
      } finally {
        setLoading(false);
      }
    };
    

    const handleSelectRoom = (value: bigint | null) => {
      if (value !== null) {
        form.setValue('room_id', BigInt(value)); // Cập nhật phòng vào form
      }
    };
    const handleSelectRoomCatalogue=(value: bigint | null) => {
      if(value)
        fetchRooms(value); // Lấy danh sách phòng mới theo department_id
      };
    // Fetch departments when the component loads
  useEffect(() => {
    fetchRoomCatalogues();
  }, []); // Empty dependency array, ensures this runs only once when the component mounts
   
  return (
        <main className="flex w-full flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 col bg-muted/40">
        <div className="flex w-full items-center">
          <h1 className="text-lg font-semibold md:text-xl">Quản lý tiếp nhận bệnh nhân mới</h1>
        
        </div>
        <div
          className="flex flex-col flex-1 rounded-lg px-5 border border-dashed shadow-sm" x-chunk="dashboard-02-chunk-1"
        >
    
          <AlertDialog open={isDialogOpen} onOpenChange={setDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Không tìm thấy</AlertDialogTitle>
                <AlertDialogDescription>
                <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Không tìm thấy bệnh nhân</AlertTitle>
            <AlertDescription>
              Trước đây bệnh nhân chưa đến khám, vui lòng nhập thông tin cho bệnh nhân.
            </AlertDescription>
          </Alert>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
            <Card>
              <CardHeader className='pb-1'>
                <CardTitle>Tiếp nhận mới</CardTitle>
                <CardDescription>
                  Thêm thông tin tiếp nhận cho bệnh nhân
                </CardDescription>
               </CardHeader>
                <CardContent className="space-y-2">
                    <main className="grid flex-1 w-full items-start gap-4 p-4 sm:px-6 sm:py-0  md:gap-8">
                      
                        
                          <div className="mx-auto grid w-full flex-1 auto-rows-max gap-4 mt-4">
                            <div className="flex items-center gap-4">
                              <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                                Thông tin bệnh nhân
                              </h1>
                              <div className="hidden items-center gap-2 md:ml-auto md:flex">
                              <div className="flex items-center space-x-2 bg-white">
                                  <Input type="text" placeholder="Tìm kiếm bệnh nhân" 
                                    value={keyword} // Đặt giá trị từ state keyword
                                    onChange={(e) => setKeyword(e.target.value)}
                                    />
                                  <Button variant="outline" size="sm" onClick={handleSearch}>Tìm</Button>
                                </div>
                                  

                                <Button variant="outline" size="sm" type="submit" onClick={form.handleSubmit(onSubmit)}>Lưu thông tin</Button>
                                <Button variant="outline" size="sm" onClick={handleReset}>
                                      Đặt lại
                                </Button>
                                <Button variant="outline" size="sm" onClick={()=>router.back()}>
                                      Quay lại
                                </Button>
                              </div>

                            </div>
                            <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="grid grid-cols-2 auto-rows-max items-start gap-4 lg:gap-8">
                            <div className="grid auto-rows-max items-start gap-4  lg:gap-8">
                                <Card x-chunk="dashboard-07-chunk-0">
                                  <CardHeader>
                                    <CardTitle>Thông tin cá nhân</CardTitle>
                                    <CardDescription>
                                      Thông tin cá nhân của bệnh nhân
                                    </CardDescription>
                                  </CardHeader>
                                  
                                  <CardContent>
                                  <FormError message={error}/>
                                    <div className="grid gap-6">
                                      <div className="grid gap-3">
                                        <div className="grid grid-cols-[2fr_1fr] gap-4">
                                          <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                              <FormItem>
                                                <FormLabel>Tên bệnh nhân</FormLabel>
                                                <FormControl>
                                                  <Input
                                                    {...field}
                                                    disabled={isPending}
                                                    placeholder="Example: Nguyễn Văn A"
                                                    type="text"
                                                  />
                                                </FormControl>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          />
                                          <FormField
                          control={form.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Giới tính</FormLabel>
                              <FormControl>
                                <div className="flex items-center space-x-4">
                                  <label className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      value={1}
                                      checked={Number(field.value) === 1} // Convert field.value to a number
                                      onChange={() => field.onChange(1)}
                                      disabled={isPending}
                                    />
                                    <span>Nam</span>
                                  </label>
                                  <label className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      value={0}
                                      checked={Number(field.value) === 0} // Convert field.value to a number
                                      onChange={() => field.onChange(0)}
                                      disabled={isPending}
                                    />
                                    <span>Nữ</span>
                                  </label>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                                        </div>
                                      </div>
                                      <div className="grid gap-3">
                                      <FormField
                                            control={form.control}
                                            name="cccd_number"
                                            render={({ field }) => (
                                              <FormItem>
                                                <FormLabel>Căn cước công dân</FormLabel>
                                                <FormControl>
                                                  <Input
                                                    {...field}
                                                    disabled={isPending}
                                                    placeholder="123456789012"
                                                    type="text"
                                                  />
                                                </FormControl>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          />
                                    <FormField
                                            control={form.control}
                                            name="birthday"
                                            render={({ field }) => (
                                              <FormItem>
                                                <FormLabel className="text-sm font-medium text-gray-700">Ngày sinh</FormLabel>
                                                <FormControl>
                                                  <Popover>
                                                    <PopoverTrigger asChild>
                                                      <Button
                                                        variant="outline"
                                                        className={cn(
                                                          "flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2 text-left text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                                                          !field.value && "text-gray-400"
                                                        )}
                                                      >
                                                        <div className="flex items-center space-x-2">
                                                          <CalendarIcon className="h-4 w-4 text-gray-500" />
                                                          <span>
                                                            {field.value
                                                              ? format(new Date(field.value), "dd/MM/yyyy")
                                                              : "Chọn ngày"}
                                                          </span>
                                                        </div>
                                                        <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                                                      </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="z-50 w-[320px] rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
                                                    <DayPicker
                                                        mode="single"
                                                        selected={field.value ? new Date(field.value) : undefined}
                                                        onSelect={(date) =>
                                                          field.onChange(date ? date.getTime() : undefined)
                                                        }
                                                        captionLayout="dropdown"
                                                        fromYear={1900}
                                                        toYear={new Date().getFullYear()}
                                                        className="custom-daypicker"
                                                      />
                                                                    </PopoverContent>
                                                  </Popover>
                                                </FormControl>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          />

                                        <FormField
                                          control={form.control}
                                          name="health_insurance_code"
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Bảo hiểm y tế</FormLabel>
                                              <FormControl>
                                                <Input
                                                  {...field}
                                                  disabled={isPending}
                                                  placeholder="ASDFADFAF114AS"
                                                  type="text"
                                                />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                                <Card x-chunk="dashboard-07-chunk-3">
                                <CardHeader>
                                    <CardTitle>Thông tin liên hệ</CardTitle>
                                    <CardDescription>
                                      Thông tin địa chỉ, số điện thoại liên hệ
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="grid gap-6">
                                        <div className="grid gap-3">
                                          <div className="grid grid-cols-2 gap-2">
                                            <FormField
                                              control={form.control}
                                              name="phone"
                                              render={({ field }) => (
                                                <FormItem>
                                                  <FormLabel>Số điện thoại liên hệ</FormLabel>
                                                  <FormControl>
                                                    <Input
                                                      {...field}
                                                      disabled={isPending}
                                                      placeholder="0901234567"
                                                      type="text"
                                                    />
                                                  </FormControl>
                                                  <FormMessage />
                                                </FormItem>
                                              )}
                                            />
                                
                                            <FormField
                                              control={form.control}
                                              name="guardian_phone"
                                              render={({ field }) => (
                                                <FormItem>
                                                  <FormLabel>Số điện thoại người giám hộ</FormLabel>
                                                  <FormControl>
                                                    <Input
                                                      {...field}
                                                      disabled={isPending}
                                                      placeholder="0987654321"
                                                      type="text"
                                                    />
                                                  </FormControl>
                                                  <FormMessage />
                                                </FormItem>
                                              )}
                                            />
                                          </div>
                                        </div>

                                        <div className="grid gap-3">
                                        <FormField
                                              control={form.control}
                                              name="address"
                                              render={({ field }) => (
                                                <FormItem>
                                                  <FormLabel>Địa chỉ liên lạc</FormLabel>
                                                  <FormControl>
                                                    <Input
                                                      {...field}
                                                      disabled={isPending}
                                                      placeholder="Số nhà, đường, phường, quận"
                                                      type="text"
                                                    />
                                                  </FormControl>
                                                  <FormMessage />
                                                </FormItem>
                                              )}
                                            />
                                        </div>
                                    </div>
                                  </CardContent>
                                </Card>
                            </div>
                              <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                            
                                <Card x-chunk="dashboard-07-chunk-3">
                                <CardHeader>
                                    <CardTitle>Chỉ định nơi khám</CardTitle>
                                    <CardDescription>
                                      Chỉ định khoa khám, phòng khám, bác sĩ khám
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="grid gap-6">
                                    <FormItem className="flex flex-col">
                                                    <FormLabel className="mr-2">Nhóm phòng</FormLabel>
                                                    <FormControl className="flex-grow">
                                                    <Combobox<bigint|null>
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
                                          <FormField 
                                                control={form.control}
                                                name="room_id"
                                                render={({ field }) => (
                                                  <FormItem className="flex flex-col">
                                                    <FormLabel className="mr-2">Phòng</FormLabel>
                                                    <FormControl className="flex-grow">
                                                      <Combobox<bigint | null>
                                                      defaultValue={form.watch('room_id') || null} // Lấy giá trị động từ form
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

                                              
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            
                              </div>
                            </form>
                        </Form>
                          </div>
                    </main>
                  </CardContent>
            </Card>
                      
       
          </div>
      </main>
  );
};

export default NewPatient;