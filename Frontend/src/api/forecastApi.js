import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/v1";

const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

export const getForecastSummary = async () => {
  const response = await axios.get(
    `${API_BASE_URL}/forecast/summary`,
    getAuthConfig()
  );
  return response.data;
};

export const getDemandTrends = async () => {
  const response = await axios.get(
    `${API_BASE_URL}/forecast/trends`,
    getAuthConfig()
  );
  return response.data;
};

export const getDemandByCategory = async () => {
  const response = await axios.get(
    `${API_BASE_URL}/forecast/categories`,
    getAuthConfig()
  );
  return response.data;
};

export const getTopProducts = async (limit = 10) => {
  const response = await axios.get(
    `${API_BASE_URL}/forecast/top-products?limit=${limit}`,
    getAuthConfig()
  );
  return response.data;
};

export const getForecastDetails = async (limit = 50) => {
  const response = await axios.get(
    `${API_BASE_URL}/forecast/details?limit=${limit}`,
    getAuthConfig()
  );
  return response.data;
};