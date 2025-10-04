// src/apis/AuthAPI.ts

// Đây là nơi import axiosClient dùng để gọi API tới server
import axiosClient from "./axiosClient";

// Import type User từ thư mục types để gõ kiểu dữ liệu
import type { User } from "../types/utils";

// URL tương đối cho endpoint users, axiosClient sẽ tự nối với baseURL
const API_URL = "/users"; 

/**
 * Hàm fetchUsers:
 * Mục đích: Lấy tất cả user từ server
 * Cách hoạt động:
 *   1. Gọi GET tới endpoint /users
 *   2. Trả về danh sách user dưới dạng mảng User[]
 */
export const fetchUsers = async (): Promise<User[]> => {
  const res = await axiosClient.get<User[]>(API_URL); // GET tất cả users
  return res.data; // Trả về dữ liệu users
};

/**
 * Hàm registerApi:
 * Mục đích: Đăng ký user mới
 * Cách hoạt động:
 *   1. Lấy danh sách user hiện tại từ server
 *   2. Kiểm tra xem email đã tồn tại chưa
 *      - Nếu có trùng email => ném lỗi
 *   3. Nếu email chưa tồn tại:
 *      - Thêm role mặc định "user"
 *      - Gọi POST tới server để tạo user mới
 *   4. Trả về user vừa tạo
 */
export const registerApi = async (userData: Omit<User, "id" | "role">): Promise<User> => {
  const users = await fetchUsers(); // Lấy danh sách user hiện tại

  // Kiểm tra email đã tồn tại chưa
  if (users.some(u => u.email === userData.email)) {
    throw new Error("Email đã tồn tại"); // Nếu email trùng, ném lỗi
  }

  // Tạo user mới với role mặc định là "user"
  const newUser = { ...userData, role: "user" };

  // Gọi API tạo user mới (POST)
  const res = await axiosClient.post<User>(API_URL, newUser);

  return res.data; // Trả về user vừa tạo
};

/**
 * Hàm loginApi:
 * Mục đích: Đăng nhập user
 * Cách hoạt động:
 *   1. Lấy danh sách user từ server
 *   2. Tìm user có email và password trùng
 *   3. Nếu không tìm thấy => ném lỗi "Sai email hoặc mật khẩu"
 *   4. Nếu tìm thấy => trả về thông tin user
 */
export const loginApi = async (email: string, password: string): Promise<User> => {
  const users = await fetchUsers(); // Lấy tất cả users
  const found = users.find(u => u.email === email && u.password === password); // Tìm user

  if (!found) throw new Error("Sai email hoặc mật khẩu"); // Nếu không tìm thấy

  return found; // Trả về user đăng nhập thành công
};
