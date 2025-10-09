import axiosClient from "./axiosClient";
import type { Category } from "../types/category"; 
const API_URL = "/categories"; 

// Lấy danh sách category
export const fetchCategoriesApi = async (): Promise<Category[]> => {
  const res = await axiosClient.get<Category[]>(API_URL); // gọi GET /categories trả về mảng category
  return res.data; 
};

//  Thêm category mới
export const addCategoryApi = async (category: { name: string; topic: string }): Promise<Category> => {
  const newCategory = { ...category, createdAt: new Date().toISOString() }; // tạo object category mới, thêm trường createdAt timestamp
  const res = await axiosClient.post<Category>(API_URL, newCategory);  // gửi POST lên API
  return res.data; // trả về category vừa tạo
};

//  Cập nhật category
export const updateCategoryApi = async (category: Category): Promise<Category> => {
  // gửi PATCH lên /categories/:id để cập nhật từng trường
  const res = await axiosClient.patch<Category>(`${API_URL}/${category.id}`, category); 
  return res.data;
};

//  Xóa category
export const deleteCategoryApi = async (id: number): Promise<number> => {
  await axiosClient.delete(`${API_URL}/${id}`); 
  return id;
};
