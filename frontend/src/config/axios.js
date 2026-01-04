import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true // <--- THIS IS MAGIC. It sends the cookies automatically.
})

export default axiosInstance;