//tầng API : Chứa tất cả logic gọi API(Axios, Fetch)
//cấu hình chung Axios 

// src/apis/axiosClient.ts
import axios from "axios";

/*
   file cấu hình chung cho Axios.
  Tất cả request sẽ dùng file này để:
  - Base URL: http://localhost:8080
  - Header mặc định: JSON
  - Có thể thêm interceptor để handle lỗi hoặc token
*/
const axiosClient = axios.create({
  baseURL: "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

export default axiosClient;
