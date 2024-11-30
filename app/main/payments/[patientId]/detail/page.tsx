// app/payments/[patientId]/details/page.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Service {
  id: number;
  name: string;
  price: number;
  isPaid: number;
}

interface Patient {
  id: number;
  name: string;
  totalAmount: number;
}

const PaymentDetailsPage = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Giả lập gọi API lấy thông tin bệnh nhân và danh sách dịch vụ
    fetch(`/api/payments/${patientId}`)
      .then((response) => response.json())
      .then((data) => {
        setPatient(data.patient);
        setServices(data.services);
      });
  }, [patientId]);

  const handlePayment = async () => {
    // Giả lập gọi API thực hiện thanh toán
    await fetch(`/api/payments/${patientId}`, {
      method: 'POST',
    });
    router.push('/payments'); // Điều hướng lại trang danh sách sau khi thanh toán xong
  };

  if (!patient) return <div>Loading...</div>;

  return (
    <div className="container">
      <h1>Payment Details for {patient.name}</h1>
      <h2>Total Amount: {patient.totalAmount}</h2>
      <h3>Services</h3>
      <ul>
        {services.map((service) => (
          <li key={service.id}>
            {service.name}: ${service.price} - {service.isPaid === 0 ? 'Unpaid' : 'Paid'}
          </li>
        ))}
      </ul>
      <button onClick={handlePayment} disabled={patient.totalAmount === 0}>
        Make Payment
      </button>
    </div>
  );
};

export default PaymentDetailsPage;
