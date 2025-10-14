import axiosClient from "./axiosClient";
import type { Category } from "../types/category"; 
const API_URL = "/categories"; 

export const fetchCategoriesApi = async (): Promise<Category[]> => {
  const res = await axiosClient.get<Category[]>(API_URL);
  return res.data; 
};

//  Thêm category mới
export const addCategoryApi = async (category: { name: string; topic: string }): Promise<Category> => {
  const newCategory = { ...category, createdAt: new Date().toISOString() };
  const res = await axiosClient.post<Category>(API_URL, newCategory); 
  return res.data; 
};

//  Cập nhật category
export const updateCategoryApi = async (category: Category): Promise<Category> => {
  const res = await axiosClient.patch<Category>(`${API_URL}/${category.id}`, category); 
  return res.data;
};

//  Xóa category
export const deleteCategoryApi = async (id: number): Promise<number> => {
  await axiosClient.delete(`${API_URL}/${id}`); 
  return id;
};
