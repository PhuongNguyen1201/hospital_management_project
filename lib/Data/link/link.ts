import { LinkBaseRoleType } from '@/types';
import { promises as fs } from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'lib', 'Data', 'link', 'link.json');

// Hàm lấy danh sách link từ file JSON
export async function getLinkList(): Promise<LinkBaseRoleType[]> {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
}

  
// Hàm lấy link dựa trên role
export async function getLinkByRole(role: string): Promise<LinkBaseRoleType | undefined> {
  const linkList = await getLinkList();
  return linkList.find(linkItem => linkItem.role === role);
}
