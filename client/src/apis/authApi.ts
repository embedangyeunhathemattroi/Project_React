import axiosClient from "./axiosClient";
import type { User } from "../types/utils";
const API_URL = "/users"; 
export const fetchUsers = async (): Promise<User[]> => {
  const res = await axiosClient.get<User[]>(API_URL); 
  return res.data; 
};

export const registerApi = async (userData: Omit<User, "id" | "role">): Promise<User> => {
  const users = await fetchUsers();
  if (users.some(u => u.email === userData.email)) {
    throw new Error("Email đã tồn tại");
  }
  const newUser = { ...userData, role: "user" };
  const res = await axiosClient.post<User>(API_URL, newUser);
  return res.data;
};
export const loginApi = async (email: string, password: string): Promise<User> => {
  const users = await fetchUsers(); 
  const found = users.find(u => u.email === email && u.password === password);
  if (!found) throw new Error("Sai email hoặc mật khẩu"); 
  return found; 
};
