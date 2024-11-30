"use client"
import { createProvince } from '@/actions/cartegory/location/createprovince';


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DistrictType, ProvinceType, WardType } from '@/types';

import React, { useState } from 'react'
import { useTransition } from 'react';
import * as z from "zod"


import {useForm} from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';

import { CreateDistrictSchema, CreateProvinceSchema, CreateWardSchema } from '@/schema';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { login } from '@/actions/auth/login';
import { useToast } from '@/hooks/use-toast';
import { FormError } from '@/components/form-error';
import { ToastAction } from '@radix-ui/react-toast';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProvinceTable from '@/components/cartegory/location/ProvinceTable';
import DistrictTable from '@/components/cartegory/location/DistrictTable';
import WardTable from '@/components/cartegory/location/WardTable';



const Location = () => {
  const [selectedProvince, setSelectedProvince] = useState<string|undefined>('');
  const [filteredDistricts, setFilteredDistricts] = useState<DistrictType[]>([]);

  const [error,setError]=useState<string|undefined>("");
  const [open, setOpen] = useState<string|undefined>(""); // State to control dialog visibility
  // const [success,setSuccess]=useState<string|undefined>("");

  const { toast } = useToast()
  const [isPending,startTransition]=useTransition();
  const form_province=useForm<z.infer<typeof CreateProvinceSchema>>({
    resolver:zodResolver(CreateProvinceSchema),
    defaultValues:{
      province:"",
    },
  });
  const form_district=useForm<z.infer<typeof CreateDistrictSchema>>({
    resolver:zodResolver(CreateDistrictSchema),
    defaultValues:{
      province:"",
      district:"",
    },
  });
  const form_ward=useForm<z.infer<typeof CreateWardSchema>>({
    resolver:zodResolver(CreateWardSchema),
    defaultValues:{
      province:"",
      district:"",
      ward:"",
    },
  });

  const onSubmit = (values: z.infer<typeof CreateProvinceSchema>) => {
    startTransition(() => {
      createProvince(values)
        .then((data) => {
          if (data.error) {
            setError(data.error);
           
          } else if (data.success) {
            setError('');
            form.reset();
            // Hiển thị toast cho thành công
            toast({
              variant:"success",
              title: "Thêm thành công",
              description: data.success,
              action: <ToastAction altText="Thử lại">Ok</ToastAction>
            });
            // Tắt sau khi thành công
          }
        })
    });
  };
  const provinces: ProvinceType[] = [
    { id: 'P1', name: 'Province 1' },
    { id: 'P2', name: 'Province 2' },
  ];
  const districts: DistrictType[] = [
    { id: 'D1', name: 'District 1', province_id: 'P1' },
    { id: 'D2', name: 'District 2', province_id: 'P1' },
    { id: 'D3', name: 'District 3', province_id: 'P2' },
  ];
  const wards: WardType[] = [
    { id: 'W1', name: 'Ward 1', district_id: 'D1' },
    { id: 'W2', name: 'Ward 2', district_id: 'D2' },
    { id: 'W3', name: 'Ward 3', district_id: 'D3' },
  ];
   // Handle province selection
   const handleProvinceChange = (provinceId:string) => {
    setSelectedProvince(provinceId);
    const filtered = districts.filter(district => district.province_id === provinceId);
    setFilteredDistricts(filtered);
  };

  return (
    <div className="flex w-full flex-col bg-muted/40">
      <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3 relative">
        <Card x-chunk="dashboard-05-chunk-3 h-full">
            <CardHeader className="px-7">
              <CardTitle>Location </CardTitle>
              <CardDescription>
                  Location 
              </CardDescription>
            </CardHeader>
            <CardContent>
                <ProvinceTable provinces={provinces} />
                <DistrictTable provinces={provinces} districts={districts}/>
                <WardTable provinces={provinces} districts={districts} wards={wards}/>
            </CardContent>
              <div className="w-full flex px-5 py-5 relative items-center m-bott mb-5"> {/* Thêm items-center để căn giữa theo chiều dọc */}
                <div className='absolute right-5 top-1/2 transform -translate-y-1/2'>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="default" className="w-fit mr-5" size="sm">Thêm tỉnh/ thành phố</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                  <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                        >
                          <DialogHeader>
                          <DialogTitle>Thêm tỉnh / Thành phố</DialogTitle>
                          <DialogDescription>
                            Để thêm mới thành phố, click vào Thêm khi bạn hoàn thành
                          </DialogDescription>
                          </DialogHeader>
                            <FormField
                              control={form.control}
                              name="province"
                              render={({field})=>(
                                <FormItem>
                                  <FormLabel>
                                    Tên tỉnh/ Thành phố
                                  </FormLabel>
                                  <FormControl>
                                    <Input {...field}
                                      disabled={isPending}
                                      placeholder='Example: Hà Nội'
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
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="default" className="w-fit mr-5" size="sm">Thêm Quận/ Huyện</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>Thêm Quận / Huyện</DialogTitle>
                        <DialogDescription>
                          Để thêm mới Quận/ Huyện, nhập tên vào bên dưới và click vào Thêm.
                        </DialogDescription>
                      </DialogHeader>
                      {/* Select Dropdown for Provinces */}
                      <FormField
                        control={form.control}
                        name="province"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="w-[280px]">
                                  <SelectValue placeholder="Chọn tỉnh/ thành phố" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Tỉnh/ Thành phố</SelectLabel>
                                    {provinces.map((province) => (
                                      <SelectItem key={province.id} value={province.name}>
                                        {province.name}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Add New Province */}
                    
                      {/* Input Field to Add Province */}
                      <FormField
                        control={form.control}
                        name="district"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tên Quận/ Huyện</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={isPending}
                                placeholder="Example: Quốc Oai"
                                type="text"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Display Errors */}
                      <FormError message={error} />

                      {/* Submit Button */}
                      <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                          Thêm
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="default" className="w-fit mr-5" size="sm">Thêm Xã/ Phường</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>Thêm Xã / Phường</DialogTitle>
                        <DialogDescription>
                          Để thêm mới Xã / Phường, nhập tên vào bên dưới và click vào Thêm.
                        </DialogDescription>
                      </DialogHeader>
                      {/* Select Dropdown for Provinces */}
                      <FormField
                        control={form.control}
                        name="province"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chọn tỉnh/ thành phố</FormLabel>
                            <FormControl>
                              <Select onValueChange={(value) => handleProvinceChange(value)} value={selectedProvince}>
                                <SelectTrigger className="w-[280px]">
                                  <SelectValue placeholder="Chọn tỉnh/ thành phố" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Tỉnh/ Thành phố</SelectLabel>
                                    {provinces.map((province) => (
                                      <SelectItem key={province.id} value={province.id}>
                                        {province.name}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       {/* Select Dropdown for Districts */}
                    <FormField
                      control={form.control}
                      name="province"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chọn quận/ huyện</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="w-[280px]">
                                <SelectValue placeholder="Chọn Quận/ Huyện" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>Quận/ Huyện</SelectLabel>
                                  {filteredDistricts.map((district) => (
                                    <SelectItem key={district.id} value={district.id}>
                                      {district.name}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                      {/* Add New Province */}
                    
                      {/* Input Field to Add Province */}
                      <FormField
                        control={form.control}
                        name="province"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tên Xã/ Phường</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={isPending}
                                placeholder="Example: Phường Xuân Đỉnh"
                                type="text"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Display Errors */}
                      <FormError message={error} />

                      {/* Submit Button */}
                      <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                          Thêm
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                  </DialogContent>
                </Dialog>
                </div>
              </div>
        </Card>
          
      </main>
   
    </div>

  )
}

export default Location
