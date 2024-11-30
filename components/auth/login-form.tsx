"use client";

import React, { useState } from 'react'
import { useTransition } from 'react';
import * as z from "zod"


import {useForm} from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';

import { LoginSchema } from '@/schema';
import { CardWarpper } from './card-wrapprt'
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
import { FormError } from '../form-error';
import { ToastAction } from '@radix-ui/react-toast';


const LoginForm = () => {
   const [error,setError]=useState<string|undefined>("");
  // const [success,setSuccess]=useState<string|undefined>("");

  const { toast } = useToast()
  const [isPending,startTransition]=useTransition();
  const form=useForm<z.infer<typeof LoginSchema>>({
    resolver:zodResolver(LoginSchema),
    defaultValues:{
      email:"",
      password:"",
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    startTransition(() => {
      login(values)
        .then((data) => {
          if (data.error) {
            setError(data.error);
           
          } else if (data.success) {
            setError('');
            // Hiển thị toast cho thành công
            toast({
              variant:"success",
              title: "Login Success",
              description: data.success,
              action: <ToastAction altText="Try again">Ok</ToastAction>
            });
            // Điều hướng sau khi thành công
            setTimeout(() => {
              window.location.href = '/main';
            }, 2000);  // Chờ 2 giây để người dùng thấy thông báo trước khi chuyển trang
          }
        })
    });
  };
  

  return (
    <CardWarpper
      headerLabel='Wekcomback'
      backButtonLabel='Dont have Acount?'
      backButtonHref='/auth/register'
      showSocial
    >
     <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({field})=>(
                <FormItem>
                  <FormLabel>
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input {...field}
                      disabled={isPending}
                      placeholder='yourname0123@example.com'
                      type="email"
                    />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />

<FormField
              control={form.control}
              name="password"
              render={({field})=>(
                <FormItem>
                  <FormLabel>
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input {...field}
                      disabled={isPending}
                      placeholder='******'
                      type="password"
                    />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />
          <FormError message={error}/>
          </div>
          <Button 
            disabled={isPending}
            type='submit'
            className='w-full'
          >
            Login
          </Button>
      </form>
     </Form>
    </CardWarpper>
  )
}

export default LoginForm
