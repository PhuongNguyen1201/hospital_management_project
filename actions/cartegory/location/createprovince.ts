"use server";

import * as z from "zod";
import bcrypt from "bcrypt";
import { CreateProvinceSchema, LoginSchema } from "@/schema";
import { getUserByEmail } from "@/lib/Data/user/user";
import { createSession } from "@/lib/session";


export const createProvince = async (values: z.infer<typeof CreateProvinceSchema>) => {
  const validateFields = CreateProvinceSchema.safeParse(values);
  if (!validateFields.success) {
    return { error: "Invalid Fields!" };
  }

  const { province} = validateFields.data;


  if (province) {
    // TODO:
    // 4. Create user session
   
    
    // 5. Redirect user
  return { success: "Thêm thành công!" };
    
  } else {
    return { error: "Lỗi khi thêm" };
  }
};
