// components/DistrictTable.tsx
import React from 'react';
import { DistrictType, ProvinceType } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Button } from '../../ui/button';

interface DistrictTableProps {
  provinces: ProvinceType[];
  districts: DistrictType[];
}

const DistrictTable = ({ provinces, districts }: DistrictTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mã Tỉnh/Thành Phố</TableHead>
          <TableHead>Tỉnh/Thành Phố</TableHead>
          <TableHead>Mã Quận/Huyện</TableHead>
          <TableHead>Quận/Huyện</TableHead>
          <TableHead className="hidden sm:table-cell text-right">Hành Động</TableHead> {/* Align header to the right */}
        </TableRow>
      </TableHeader>
      <TableBody>
        {districts.map((district) => {
          const province = provinces.find((p) => p.id === district.province_id);

          return (
            <TableRow key={district.id} className="bg-accent">
              <TableCell>{province?.id}</TableCell>
              <TableCell>{province?.name}</TableCell>
              <TableCell>{district.id}</TableCell>
              <TableCell>{district.name}</TableCell>
              <TableCell className="hidden sm:table-cell text-right"> {/* Align to the right */}
                <Button variant="default" className="mr-2">Update</Button>
                <Button variant="destructive">Delete</Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default DistrictTable;
