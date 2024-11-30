// app/payments/page.tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Patient {
  id: number;
  name: string;
  totalAmount: number;
  paymentStatus: number;
}

const PaymentsPage = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Giả lập gọi API lấy danh sách bệnh nhân cần thanh toán
    fetch('/api/payments') // endpoint này bạn cần tự tạo
      .then((response) => response.json())
      .then((data) => setPatients(data));
  }, []);

  const handleViewDetails = (id: number) => {
    router.push(`/payments/${id}/details`);
  };

  return (
    <div className="container">
      <h1>Patient Payment List</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Total Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id}>
              <td>{patient.name}</td>
              <td>{patient.totalAmount}</td>
              <td>{patient.paymentStatus === 0 ? 'Unpaid' : 'Paid'}</td>
              <td>
                <button onClick={() => handleViewDetails(patient.id)}>
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentsPage;
