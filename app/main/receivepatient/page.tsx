"use client";
import { useUser } from "@/components/context/UserContext";
import { RoomType } from "@/types";
import axios from "axios";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const HomePage = () => {
  const { currentUser } = useUser(); // Lấy thông tin người dùng từ context
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = async () => {
    if (!currentUser) return; // Không làm gì nếu chưa có thông tin người dùng

    setLoading(true); // Bắt đầu trạng thái loading
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/rooms`;

    try {
      // Gửi yêu cầu với tham số limit dựa trên `currentUser.room_ids`
      const response = await axios.get(endpoint, {
        params: { limit: 1000 }, // Giới hạn số lượng bản ghi lớn để lấy đủ dữ liệu
      });

      const data = response?.data?.data?.data || [];
      if (!Array.isArray(data)) throw new Error("Invalid response format");

      // Chuyển đổi dữ liệu API thành kiểu `RoomType`
      const fetchedRooms: RoomType[] = data.map((item: any) => ({
        id: item.id,
        code: item.code,
        department_name: item.department?.name || "N/A",
        room_catalogue_code: item.room_catalogue?.name || "N/A",
        description: item.room_catalogue?.description || "",
        beds_count: item.beds_count,
        status_bed: item.status_bed,
        status: item.status,
        department_id: item.department_id,
        room_catalogue_id: item.room_catalogue_id,
      }));

      // Lọc các phòng dựa trên `currentUser.room_ids`
      const userRoomIds = currentUser.room_ids || [];
      const filteredRooms = fetchedRooms.filter((room) =>
        userRoomIds.includes(Number(room.id))
      );

      setRooms(filteredRooms); // Cập nhật danh sách phòng phụ trách
    } catch (err) {
      setError("Error fetching rooms. Please try again.");
      console.error("Error fetching rooms:", err);
    } finally {
      setLoading(false); // Kết thúc trạng thái loading
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [currentUser]);

  if (loading) {
    return <div>Loading...</div>; // Hiển thị loading trong khi dữ liệu đang tải
  }

  if (error) {
    return <div className="text-red-500">{error}</div>; // Hiển thị lỗi nếu có
  }

  const renderRoomLink = (role: string, roomId: number) => {
    console.log(roomId);
    switch (role) {
      case "Bác sĩ khám": // Bác sĩ khám
        return `/main/receivepatient/${roomId}`;
      case "Bác sĩ xét nghiệm": // Bác sĩ xét nghiệm
        return `/main/services/room/${roomId}`;
      case "Điều dưỡng viên": // Điều dưỡng viên
        return "/main/newpatient";
      default:
        return null; // Admin hoặc vai trò không xác định
    }
  };

  return (
    <div className="flex w-full flex-col justify-center items-center h-screen space-y-4">
      <h1 className="text-xl font-bold">
        Xin chào {currentUser?.name}, bạn đang đăng nhập vào hệ thống với vai trò: {currentUser?.position_name}
      </h1>
      {currentUser?.position_name === "Quản trị viên" ? (
        <p className="text-lg">Quản trị viên không cần hiển thị danh sách phòng phụ trách.</p>
      ) : (
        <>
          <p className="text-lg">Danh sách các phòng phụ trách</p>
          <ul className="w-full max-w-md space-y-3">
            {rooms.length > 0 ? (
              rooms.map((room) => {
                const link = renderRoomLink(currentUser?.position_name || "", Number(room.id));
                if (!link) return null; // Không hiển thị link nếu không hợp lệ
                return (
                  <li
                    key={room.id}
                    className="border rounded-lg p-4 shadow hover:shadow-md transition"
                  >
                    <Link href={link}>
                      {
                        currentUser?.position_name==="Điều dưỡng viên"?
                        (
                          <h2 className="font-semibold text-lg">Click vào đây để thêm thêm thông tin bệnh nhân</h2>
                        ):( 
                          <><h2 className="font-semibold text-lg">{room.room_catalogue_code}</h2>
                          <p className="text-sm text-gray-600">Phòng: {room.code}</p>
                          <p className="text-sm text-gray-600">Khoa: {room.department_name}</p></>)
                      }
                    </Link>
                  </li>
                );
              })
            ) : (
              <li className="text-gray-500">Không có phòng phụ trách.</li>
            )}
          </ul>
        </>
      )}
    </div>
  );
};

export default HomePage;
