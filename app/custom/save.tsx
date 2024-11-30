<div className="flex flex-col gap-1 mt-2 border-b pb-5">
<h3 className="text-xl tracking-tight">
      Quản lý hệ thống Người dùng
</h3>
<div className='flex mt-5 justify-between'>
{/* Phần bên trái */}
  <Combobox<number>
  options={numberOptions}
  onSelect={handleSelectRecords}
  placeholder="Chọn số bản ghi"  // Thêm placeholder tùy chỉnh
  />

{/* Phần bên phải */}
<div className="flex items-center space-x-5">
  <div className='flex'>
    <Combobox<number>
      options={numberOptions}
      onSelect={handleSelectRecords}
      placeholder="Chọn tình trạng"  // Thêm placeholder tùy chỉnh
    />
  </div>
  <div className="flex items-center space-x-2 bg-white">
    <Input type="text" placeholder="Tìm kiếm" />
    <Button type="submit">Lọc</Button>
  </div>
        <Button className='ml-5' onClick={handleClick}>+ Thêm mới</Button>

        <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa không?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Bạn đang xóa chức danh là :{" "}
              <strong>{deleteItem?.name}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteItem(null)}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Xác nhận</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
</div>
</div>
</div>
<div>
<DataTable
data={userData}
columns={columns}
totalRecords={totalRecords}
pageIndex={pageIndex}
pageSize={limit}
onPageChange={(newPageIndex) => {
  console.log("pageindex:", newPageIndex)
  setPageIndex(newPageIndex) // Cập nhật pageIndex với giá trị mới
}}
/>

</div>