import axios from 'axios';

const BASE_URL = 'http://localhost:8000'; // Adjust the URL based on your backend server

const analyzePage = async (url, description) => {
  try {
    const response = await axios.post(`${BASE_URL}/analyze`, { url, description });
    return response.data;
  } catch (error) {
    console.error('Error analyzing page:', error);
    throw error;
  }
};

const apiService = {
  analyzePage,
};

export default apiService;
