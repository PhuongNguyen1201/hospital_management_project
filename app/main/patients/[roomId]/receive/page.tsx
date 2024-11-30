// app/patients/intake/page.tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Patient {
  id: number;
  name: string;
  dob: string;
  gender: string;
  phone: string;
}

const PatientIntakePage = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const router = useRouter();

  // Giả lập gọi API để lấy danh sách bệnh nhân (cần thay bằng API thực tế)
  useEffect(() => {
    fetch('/api/patients') // endpoint này bạn cần tự tạo
      .then((response) => response.json())
      .then((data) => setPatients(data));
  }, []);

  const handleViewDetails = (id: number) => {
    router.push(`/patients/${id}/details`);
  };

  return (
    <div className="container">
      <h1>Patient Intake List</h1>
      <Link href="/patients/new">Add New Patient</Link>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Date of Birth</th>
            <th>Gender</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id}>
              <td>{patient.name}</td>
              <td>{patient.dob}</td>
              <td>{patient.gender}</td>
              <td>{patient.phone}</td>
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

export default PatientIntakePage;
