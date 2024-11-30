"use client"
import React, { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { ResetPasswordSchema, UpdateUserSelfSchema } from "@/schema"; // Đảm bảo rằng schema phù hợp
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { DepartmentType, PositionType, RoomType, UserInfoType } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ToastAction } from "@/components/ui/toast";
import { update_user } from "@/actions/setting/update";
import { useUser } from "@/components/context/UserContext";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { reset_password } from "@/actions/setting/resestpassword";

const Setting = () => {
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>("");
  const [isEditable, setIsEditable] = useState(false); // Trạng thái để kiểm soát khả năng chỉnh sửa
  const [isChanged, setIsChanged] = useState(false); // Trạng thái để kiểm soát thay đổi
 
  const [isOpenDialog, setIsOpenDialog] = useState(false);
 
 
  const { toast } = useToast();
  const router = useRouter();
  const { id } = useParams(); // Lấy ID từ tham số URL
  const user= useUser();
  const currentUser: UserInfoType | any= user.currentUser;

  const form = useForm<z.infer<typeof UpdateUserSelfSchema>>({
    resolver: zodResolver(UpdateUserSelfSchema),
  });
  const formResetPassword = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
  });
  const { reset, setValue } = form;
  useEffect(() => {
    // Đảm bảo rằng currentUser đã được tải xong trước khi tiếp tục
    if (currentUser) {
      setLoading(false);
      form.reset({
        name: currentUser.name,
        email: currentUser.email,
        cccd: currentUser.cccd,
        phone: currentUser.phone,
        address: currentUser.address,
        certificate: currentUser.certificate,
        gender: currentUser.gender,
      });
    }
  }, [currentUser]);  // Chỉ thực hiện reset khi currentUser thay đổi

  // Hàm xử lý submit
  const onSubmit = (values: z.infer<typeof UpdateUserSelfSchema>) => {
    setError(""); // Reset lỗi trước khi xử lý
    startTransition(() => {
      update_user(currentUser?.id, values)
        .then((data) => {
          if (data.error) {
            setError(data.error); // Nếu có lỗi
            toast({
              variant: "destructive",
              title: "Lỗi khi thêm",
              description: data.error,
              action: <ToastAction altText="Try again">Ok</ToastAction>,
            });
          } else if (data.success) {
            setError(""); // Xóa lỗi khi thành công
            toast({
              variant: "success",
              title: "Thêm thành công",
              description: data.success,
              action: <ToastAction altText="Try again">Ok</ToastAction>,
            });
            window.location.reload(); // Sử dụng phương thức reload của window
          }
        })
        .catch((err) => {
          setError("Đã xảy ra lỗi khi cập nhật!");
          console.error("Update error:", err);
        })
        .finally(() => {
          setLoading(false); // Đảm bảo loading được cập nhật khi xong
          setIsEditable(false)
        });
    });
  };

  // Hàm reset form
  const handleReset = () => {
    form.reset({
      name: currentUser.name,
      email: currentUser.email,
      cccd: currentUser.cccd,
      phone: currentUser.phone,
      address: currentUser.address,
      certificate: currentUser.certificate,
      gender: currentUser.gender,
    });
  };

  // Hàm kích hoạt chế độ chỉnh sửa
  const handleEdit = () => {
    setIsEditable(true); // Bật chế độ chỉnh sửa
  };

  useEffect(() => {
    // Reset lại form khi tải trang và bắt đầu ở trạng thái không thể chỉnh sửa
    setIsEditable(false);
  }, []);
 const handleResetPassword = (values: z.infer<typeof ResetPasswordSchema>) => {
  setError(""); // Reset lỗi trước khi xử lý
  setLoading(true); // Bật trạng thái loading
  startTransition(() => {
    reset_password(values)
      .then((data) => {
        if (data?.error) {
          setError(data.error); // Nếu có lỗi
          toast({
            variant: "destructive",
            title: "Lỗi khi thay đổi mật khẩu",
            description: data.error,
            action: <ToastAction altText="Try again">Ok</ToastAction>,
          });
        } else if (data?.success) {
          setError(""); // Xóa lỗi khi thành công
          toast({
            variant: "success",
            title: "Thay đổi mật khẩu thành công",
            description: data.success,
            action: <ToastAction altText="Ok">Ok</ToastAction>,
          });
          setIsOpenDialog(false)
        }

      })
      .catch((err) => {
        setError("Đã xảy ra lỗi khi cập nhật mật khẩu.");
        console.error("Update error:", err);
      })
      .finally(() => {
        
        setLoading(false); // Đảm bảo trạng thái loading được cập nhật khi xong
      });
  });
};

  return (
    <main className="flex w-full flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 col bg-muted/40">
      <div className="flex w-full items-center">
        <h1 className="text-lg font-semibold md:text-xl">Quản lý chức danh</h1>
      </div>
      <div className="mx-auto grid max-w-[59rem] flex-1 auto-rows-max gap-4 mt-10">
      <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Đổi mật khẩu</DialogTitle>
                <DialogDescription>
                  Sau khi nhập, click vào lưu khi bạn hoàn thành.
                </DialogDescription>
              </DialogHeader>
              <Form {...formResetPassword}>
              <form onSubmit={formResetPassword.handleSubmit(handleResetPassword)} className="space-y-4">
                    <FormField
                      control={formResetPassword.control}
                      name="email"
                      render={({field})=>(
                        <FormItem>
                          <FormLabel>
                           Email
                          </FormLabel>
                          <FormControl>
                            <Input {...field}
                              disabled={isPending}
                              placeholder='Email'
                              type="text"
                            />
                          </FormControl>
                          <FormMessage/>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={formResetPassword.control}
                      name="old_password"
                      render={({field})=>(
                        <FormItem>
                          <FormLabel>
                           Mật khẩu cũ
                          </FormLabel>
                          <FormControl>
                            <Input {...field}
                              disabled={isPending}
                              placeholder='Mật khẩu cũ'
                              type="password"
                            />
                          </FormControl>
                          <FormMessage/>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={formResetPassword.control}
                      name="new_password"
                      render={({field})=>(
                        <FormItem>
                          <FormLabel>
                           Mật khẩu mới
                          </FormLabel>
                          <FormControl>
                            <Input {...field}
                              disabled={isPending}
                              placeholder='Mật khẩu mới'
                              type="password"
                            />
                          </FormControl>
                          <FormMessage/>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={formResetPassword.control}
                      name="repeat_new_password"
                      render={({field})=>(
                        <FormItem>
                          <FormLabel>
                           Nhập lại mật khẩu
                          </FormLabel>
                          <FormControl>
                            <Input {...field}
                              disabled={isPending}
                              placeholder='Nhập lại mật khẩu'
                              type="password"
                            />
                          </FormControl>
                          <FormMessage/>
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
        <Form {...form}>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                router.back();
              }}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Quay lại</span>
            </Button>
            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
              Thêm người dùng
            </h1>
            <div className="hidden items-center gap-2 md:ml-auto md:flex">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={!isEditable} // Nút đặt lại chỉ sáng lên khi có thay đổi
              >
                Đặt lại
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
              >
                Cập nhật thông tin
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={()=>{setIsOpenDialog(true)}}

              >
                Đổi mật khẩu
              </Button>
              <Button size="sm" type="submit" onClick={form.handleSubmit(onSubmit)} disabled={!isEditable}>Lưu thông tin</Button>
            </div>
          </div>
          <form>
            <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
              <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                <Card x-chunk="dashboard-07-chunk-0">
                  <CardHeader>
                    <CardTitle>Thông tin cá nhân</CardTitle>
                    <CardDescription>Thông tin cá nhân của nhân viên</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      <div className="grid gap-3">
                        <div className="grid grid-cols-[2fr_2fr_1fr] gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tên nhân viên</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    disabled={!isEditable} // Chỉ bật chỉnh sửa khi nhấn "Cập nhật"
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
                            name="cccd"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Căn cước công dân</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    disabled={!isEditable}
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
                                        checked={Number(field.value) === 1}
                                        onChange={() => field.onChange(1)}
                                        disabled={!isEditable}
                                      />
                                      <span>Nam</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        value={0}
                                        checked={Number(field.value) === 0}
                                        onChange={() => field.onChange(0)}
                                        disabled={!isEditable}
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
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              {...field}

                              placeholder="abc@Example.com"
                              type="text"
                              disabled={!isEditable}
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
                <Card x-chunk="dashboard-07-chunk-0">
              <CardHeader>
                <CardTitle>Thông tin liên hệ</CardTitle>
                <CardDescription>
                  Thông tin địa chỉ, số điện thoại liên hệ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                    <div className="grid gap-3">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Số điện thoại liên hệ</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}

                                  placeholder="0901234567"
                                  type="text"
                                  disabled={!isEditable}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Địa chỉ liên hệ</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}

                                  placeholder="Số nhà, đường, phường, quận"
                                  type="text"
                                  disabled={!isEditable}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                </div>
              </CardContent>
            </Card>
              </div>
              <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
            <Card x-chunk="dashboard-07-chunk-3">
              <CardHeader>
                <CardTitle>Thông tin công tác</CardTitle>
                <CardDescription>
                  Khoa, phòng ban, chức danh
                </CardDescription>
              </CardHeader>
              <CardContent>
              <div className="flex flex-col gap-4">
                    <p><strong>Khoa:</strong> {currentUser.department_name}</p>
                    <p><strong>Các phòng: </strong>
                      {currentUser.room_codes.length > 0 ? (
                        <ul>
                          {currentUser.room_codes.map((room: string, index: number) => (
                            <li key={index}>{room}</li>
                          ))}
                        </ul>
                      ) : (
                        <span>Chưa có phòng nào</span>
                      )}
                    </p>

                    <p><strong>Chức danh:</strong> {currentUser.position_name}</p>
              </div>
              </CardContent>
            </Card>

            <Card x-chunk="dashboard-07-chunk-3">
              <CardHeader>
                <CardTitle>Thông tin học vấn</CardTitle>
                <CardDescription>
                  Chứng chỉ ngành nghề, học hàm học vị
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-1">
                  <FormField
                        control={form.control}
                        name="certificate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tên chứng chỉ</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Ví dụ: chứng chỉ hành nghề chẩn đoán mọi bệnh"
                                type="text"
                                disabled={!isEditable}
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
            </div>
          </form>
        </Form>
      </div>
    </main>
  );
};

export default Setting;
