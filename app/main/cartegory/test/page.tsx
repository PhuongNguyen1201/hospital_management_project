"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/combobox";


export default function CategorySelector() {
  const cartegoryOptions = [
    { value: 111, label: "Sản phẩm điện tử" },
    { value: 222, label: "Sản phẩm phòng khách" },
    { value: 333, label: "Sản phẩm bếp" },
  ];

  const [selectedCategories, setSelectedCategories] = React.useState<number[]>([]);
  const [selectedValue, setSelectedValue] = React.useState<number | null>(null);

  const handleSelectCategory = (value: number | null) => {
    // Chỉ thêm nếu giá trị chưa có trong danh sách đã chọn
    if (value !== null && !selectedCategories.includes(value)) {
      setSelectedCategories((prev) => [...prev, value]);
      setSelectedValue(null); // Reset giá trị Combobox về mặc định
    }
  };

  const handleRemoveCategory = (value: number) => {
    setSelectedCategories((prev) => prev.filter((category) => category !== value));
  };

  const handleSubmit = () => {
    // Gửi mảng selectedCategories đến server
    console.log("Submitted categories:", selectedCategories);
    // Logic gửi mảng này đến server (ví dụ: fetch API)
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-lg">
    <Combobox<number>
      options={cartegoryOptions}
      onSelect={handleSelectCategory}
      placeholder="Chọn danh mục"
      defaultValue={selectedValue} // Sử dụng value để điều khiển giá trị hiển thị
    />

{selectedCategories.length !== 0 && (
       <div className="flex flex-wrap mt-4 space-x-1 border border-black-300 rounded-md p-2">
       {selectedCategories.map((categoryId) => {
         const category = cartegoryOptions.find((cat) => cat.value === categoryId);
         return (
           <div
             key={categoryId}
             className="flex items-center justify-between p-2 bg-black-100 text-black-800 border border-black-300 rounded-md shadow-sm transition-all duration-300 hover:shadow-md w-32" // Thêm width cố định
           >
             <span className="text-sm">{category?.label}</span>
             <button
               onClick={() => handleRemoveCategory(categoryId)}
               className="text-black-500 hover:text-black-700 font-bold text-xs pl-1"
             >
               x
             </button>
           </div>
         );
       })}
     </div>
     
      )}
    

    <Button
      onClick={handleSubmit}
      className="mt-4 w-full bg-blue-600 text-white hover:bg-blue-700 rounded-lg py-2 transition duration-300"
    >
      Submit
    </Button>
  </div>
  );
}
