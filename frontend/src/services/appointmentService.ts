export interface AppointmentResponse {
  id: number;
  employeeId: number;
  employeeName: string;
  appointmentTypeCode: string;
  appointmentTypeName: string;
  beforeDepartmentId: number | null;
  beforeDepartmentName: string | null;
  beforePositionCode: string | null;
  beforePositionName: string | null;
  afterDepartmentId: number | null;
  afterDepartmentName: string | null;
  afterPositionCode: string | null;
  afterPositionName: string | null;
  afterPayStep: number | null;
  applyDate: string;
  applied: boolean;
  note: string;
}

export interface AppointmentCreateRequest {
  employeeId: number;
  appointmentTypeCode: string;
  afterDepartmentId: number | null;
  afterPositionCode: string | null;
  afterPayStep: number | null;
  applyDate: string;
  note: string;
}

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

export const getAllAppointments = async (): Promise<AppointmentResponse[]> => {
  const res = await fetch('/api-system/appointments', {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch appointments');
  return res.json();
};

export const createAppointment = async (data: AppointmentCreateRequest): Promise<AppointmentResponse> => {
  const res = await fetch('/api-system/appointments', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create appointment');
  return res.json();
};
