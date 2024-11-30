// app/patients/[patientId]/details/page.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Patient {
  id: number;
  name: string;
  dob: string;
  gender: string;
  phone: string;
  address: string;
}

const PatientDetailsPage = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    // Giả lập gọi API lấy thông tin chi tiết bệnh nhân (cần thay bằng API thực tế)
    fetch(`/api/patients/${patientId}`)
      .then((response) => response.json())
      .then((data) => setPatient(data));
  }, [patientId]);

  if (!patient) return <div>Loading...</div>;

  return (
    <div className="container">
      <h1>Patient Details: {patient.name}</h1>
      <p>Date of Birth: {patient.dob}</p>
      <p>Gender: {patient.gender}</p>
      <p>Phone: {patient.phone}</p>
      <p>Address: {patient.address}</p>
      {/* Thêm các thông tin khác nếu cần */}
    </div>
  );
};

export default PatientDetailsPage;
