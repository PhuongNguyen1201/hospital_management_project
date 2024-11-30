// components/WardTable.tsx
import React from 'react';
import { DistrictType, ProvinceType, WardType } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Button } from '../../ui/button';

interface WardTableProps {
  provinces: ProvinceType[];
  districts: DistrictType[];
  wards: WardType[];
}

const WardTable = ({ provinces, districts, wards }: WardTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mã Tỉnh/Thành Phố</TableHead>
          <TableHead>Tỉnh/Thành Phố</TableHead>
          <TableHead>Mã Quận/Huyện</TableHead>
          <TableHead>Quận/Huyện</TableHead>
          <TableHead>Mã Phường/Xã</TableHead>
          <TableHead>Phường/Xã</TableHead>
          <TableHead className="hidden sm:table-cell text-right">Hành Động</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {districts.map((district) => {
          const province = provinces.find((p) => p.id === district.province_id);
          const wardList = wards.filter((ward) => ward.district_id === district.id);

          return (
            <React.Fragment key={district.id}>
              {wardList.map((ward) => (
                <TableRow key={ward.id} className="bg-accent">
                  <TableCell>{province?.id}</TableCell>
                  <TableCell>{province?.name}</TableCell>
                  <TableCell>{district.id}</TableCell>
                  <TableCell>{district.name}</TableCell>
                  <TableCell>{ward.id}</TableCell>
                  <TableCell>{ward.name}</TableCell>
                  <TableCell className="hidden sm:table-cell text-right">
                    
                      <Button variant="default" className="mr-2">Update</Button>
                      <Button variant="destructive">Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default WardTable;
