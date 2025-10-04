// import axios from "axios";
// import type { Result } from "../types/utils";

// const BASE_URL = "http://localhost:8080/results";

// // Lấy tất cả kết quả
// export const getResults = async (): Promise<Result[]> => {
//   const res = await axios.get<Result[]>(BASE_URL);
//   return res.data;
// };

// // Lưu kết quả mới
// export const postResult = async (newResult: Result): Promise<Result> => {
//   const res = await axios.post<Result>(BASE_URL, newResult);
//   return res.data;
// };

// src/apis/ResultAPI.ts

// Import axiosClient để gọi API tới server
import axiosClient from "./axiosClient";

// Import kiểu Result để gõ kiểu dữ liệu
import type { Result } from "../types/utils";

// URL tương đối cho endpoint results
const BASE_URL = "/results";

/**
 * Hàm getResults:
 * Mục đích: Lấy tất cả kết quả quiz từ server
 * Cách hoạt động:
 *   1. Gọi GET tới endpoint /results
 *   2. Trả về mảng các Result
 */
export const getResults = async (): Promise<Result[]> => {
  const res = await axiosClient.get<Result[]>(BASE_URL); // GET tất cả kết quả
  return res.data; // Trả về danh sách kết quả
};

/**
 * Hàm postResult:
 * Mục đích: Lưu kết quả quiz mới lên server
 * Cách hoạt động:
 *   1. Nhận đối tượng newResult (thông tin kết quả quiz)
 *   2. Gọi POST tới endpoint /results để lưu kết quả
 *   3. Trả về kết quả vừa lưu
 */
export const postResult = async (newResult: Result): Promise<Result> => {
  const res = await axiosClient.post<Result>(BASE_URL, newResult); // POST kết quả mới
  return res.data; // Trả về kết quả vừa lưu
};
