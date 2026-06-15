import authApi from './authApi';

export const getEmployees = async (params = {}) => {
  const response = await authApi.get('/employees', { params });
  return response.data;
};

export const getEmployeeById = async (employeeId) => {
  const response = await authApi.get(`/employees/${employeeId}`);
  return response.data;
};

export const createEmployee = async (employeeData) => {
  const response = await authApi.post('/employees', employeeData);
  return response.data;
};

export const updateEmployee = async (employeeId, employeeData) => {
  const response = await authApi.put(`/employees/${employeeId}`, employeeData);
  return response.data;
};

export const deleteEmployee = async (employeeId) => {
  const response = await authApi.delete(`/employees/${employeeId}`);
  return response.data;
};

export const getEmployeesForDropdown = async () => {
  const response = await authApi.get('/employees/dropdown');
  return response.data;
};

export const getDepartments = async () => {
  const response = await authApi.get('/employees/departments');
  return response.data;
};