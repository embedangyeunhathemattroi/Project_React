import axiosClient from "./axiosClient";
import type { User } from "../types/utils";

const API_URL = "/users"; // endpoint API cho user

// Lấy danh sách tất cả user từ server
export const fetchUsers = async (): Promise<User[]> => {
  const res = await axiosClient.get<User[]>(API_URL); // gọi GET /users
  return res.data; // trả về mảng user
};

// Đăng ký user mới
export const registerApi = async (userData: Omit<User, "id" | "role">): Promise<User> => {
  const users = await fetchUsers(); // lấy danh sách user hiện tại
  if (users.some(u => u.email === userData.email)) {
    // kiểm tra email đã tồn tại chưa
    throw new Error("Email đã tồn tại"); // nếu tồn tại → ném lỗi
  }
  const newUser = { ...userData, role: "user" }; // thêm role mặc định "user"
  const res = await axiosClient.post<User>(API_URL, newUser); // gửi POST tạo user mới
  return res.data; // trả về user vừa tạo
};

// Đăng nhập user
export const loginApi = async (email: string, password: string): Promise<User> => {
  const users = await fetchUsers(); // lấy danh sách user hiện tại
  const found = users.find(u => u.email === email && u.password === password); // tìm user khớp email & password
  if (!found) throw new Error("Sai email hoặc mật khẩu"); // nếu không có → ném lỗi
  return found; // nếu có → trả về user
};
