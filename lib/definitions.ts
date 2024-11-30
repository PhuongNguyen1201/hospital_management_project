// lib/definitions.ts
import { JWTPayload } from 'jose';
export interface SessionPayload extends JWTPayload{
  email: string;
  department?:string;
  room_ids:Number[];
  role: string; // Ví dụ: 'admin', 'user', v.v.
  iat?: number; // issued at
  exp?: number; // expiration time
}
