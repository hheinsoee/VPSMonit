import axios from 'axios';

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000', // Replace with your actual API URL
  timeout: 10000, // Optional: Set a timeout for requests
  headers: {
    Connection: 'keep-alive', // Enable keep-alive in the request headers
  },
});

export default axiosInstance;