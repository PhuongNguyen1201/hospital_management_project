// components/ProvinceTable.tsx
import React from 'react';
import { ProvinceType } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Button } from '../../ui/button';

interface ProvinceTableProps {
  provinces: ProvinceType[];
}

const ProvinceTable = ({ provinces }: ProvinceTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mã Tỉnh/Thành Phố</TableHead>
          <TableHead className="hidden sm:table-cell">Tên Tỉnh/Thành Phố</TableHead>
          <TableHead className="hidden sm:table-cell text-right">Hành Động</TableHead> {/* Changed header name */}
        </TableRow>
      </TableHeader>
      <TableBody>
        {provinces.map((province) => (
          <TableRow className="bg-accent" key={province.id}>
            <TableCell className="hidden sm:table-cell">{province.id}</TableCell>
            <TableCell className="hidden sm:table-cell">{province.name}</TableCell>
            <TableCell className="hidden md:table-cell text-right"> {/* Align to the right */}
              <Button variant="default" className="mr-2">Update</Button>
              <Button variant="destructive">Delete</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ProvinceTable;
