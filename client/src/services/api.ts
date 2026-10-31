const API_BASE_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res: Response) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.message || `HTTP error ${res.status}: ${res.statusText}`;
    throw new Error(errorMsg);
  }
  return data;
};

export const api = {
  // Health
  checkHealth: async () => {
    const res = await fetch(`${API_BASE_URL}/health`);
    return handleResponse(res);
  },

  // Auth
  loginStudent: async (credentials: { registrationNumber: string; password: string }) => {
    const res = await fetch(`${API_BASE_URL}/auth/student/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(res);
  },

  loginOfficer: async (credentials: { email: string; password: string }) => {
    const res = await fetch(`${API_BASE_URL}/auth/officer/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(res);
  },

  getCurrentUser: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Student Endpoints
  getStudentProfile: async () => {
    const res = await fetch(`${API_BASE_URL}/students/profile`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  updateStudentProfile: async (data: { phone?: string; personalEmail?: string; profilePicture?: string }) => {
    const res = await fetch(`${API_BASE_URL}/students/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  getStudentSkills: async () => {
    const res = await fetch(`${API_BASE_URL}/students/skills`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  updateStudentSkills: async (skills: string[]) => {
    const res = await fetch(`${API_BASE_URL}/students/skills`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ skills }),
    });
    return handleResponse(res);
  },

  getRecommendations: async () => {
    const res = await fetch(`${API_BASE_URL}/students/recommendations`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getStudentApplications: async () => {
    const res = await fetch(`${API_BASE_URL}/students/applications`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  applyToJob: async (jobDriveId: string, payload?: { notes?: string; confirmedExternal?: boolean }) => {
    const res = await fetch(`${API_BASE_URL}/students/apply/${jobDriveId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload || {}),
    });
    return handleResponse(res);
  },

  confirmExternalApplication: async (applicationId: string) => {
    const res = await fetch(`${API_BASE_URL}/students/applications/${applicationId}/confirm-external`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Public / Shared Job endpoints
  getActiveJobs: async (query?: { search?: string; department?: string }) => {
    const params = new URLSearchParams();
    if (query?.search) params.append('search', query.search);
    if (query?.department) params.append('department', query.department);

    const res = await fetch(`${API_BASE_URL}/jobs?${params.toString()}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getJobById: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Placement Officer Endpoints
  getDashboardStats: async () => {
    const res = await fetch(`${API_BASE_URL}/placement/dashboard-stats`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getPlacementJobDrives: async (query?: { status?: string; search?: string; department?: string }) => {
    const params = new URLSearchParams();
    if (query?.status) params.append('status', query.status);
    if (query?.search) params.append('search', query.search);
    if (query?.department) params.append('department', query.department);

    const res = await fetch(`${API_BASE_URL}/placement/drives?${params.toString()}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  createJobDrive: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/placement/drives`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  updateJobDrive: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE_URL}/placement/drives/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  deleteJobDrive: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/placement/drives/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getAllApplications: async (query?: { jobDriveId?: string; status?: string; department?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (query?.jobDriveId) params.append('jobDriveId', query.jobDriveId);
    if (query?.status) params.append('status', query.status);
    if (query?.department) params.append('department', query.department);
    if (query?.search) params.append('search', query.search);

    const res = await fetch(`${API_BASE_URL}/placement/applications?${params.toString()}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  updateApplicationStatus: async (id: string, status: string, remarks?: string) => {
    const res = await fetch(`${API_BASE_URL}/placement/applications/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, remarks }),
    });
    return handleResponse(res);
  },

  getCompanies: async () => {
    const res = await fetch(`${API_BASE_URL}/placement/companies`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  createCompany: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/placement/companies`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
};
