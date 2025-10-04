// src/apis/CategoriesAPI.ts

// Import axiosClient để gọi API tới server
import axiosClient from "./axiosClient";

// Import kiểu Category để gõ kiểu dữ liệu
import type { Category } from "../types/category";

// URL tương đối cho endpoint categories
const API_URL = "/categories";

/**
 * Hàm fetchCategoriesApi:
 * Mục đích: Lấy tất cả category từ server
 * Cách hoạt động:
 *   1. Gọi GET tới endpoint /categories
 *   2. Trả về dữ liệu category dưới dạng mảng Category[]
 */
export const fetchCategoriesApi = async (): Promise<Category[]> => {
  const res = await axiosClient.get<Category[]>(API_URL); // GET tất cả categories
  return res.data; // Trả về danh sách categories
};

/**
 * Hàm addCategoryApi:
 * Mục đích: Thêm category mới
 * Cách hoạt động:
 *   1. Nhận đối tượng category gồm name và topic
 *   2. Tự động thêm trường createdAt là thời gian hiện tại
 *   3. Gọi POST tới server để tạo category mới
 *   4. Trả về category vừa tạo
 */
export const addCategoryApi = async (category: { name: string; topic: string }): Promise<Category> => {
  const newCategory = { ...category, createdAt: new Date().toISOString() }; // Thêm createdAt
  const res = await axiosClient.post<Category>(API_URL, newCategory); // POST category mới
  return res.data; // Trả về category vừa thêm
};

/**
 * Hàm updateCategoryApi:
 * Mục đích: Cập nhật thông tin category
 * Cách hoạt động:
 *   1. Nhận đối tượng category đầy đủ (có id)
 *   2. Gọi PATCH tới endpoint /categories/:id để cập nhật category
 *   3. Trả về category đã được cập nhật
 */
export const updateCategoryApi = async (category: Category): Promise<Category> => {
  const res = await axiosClient.patch<Category>(`${API_URL}/${category.id}`, category); // PATCH category theo id
  return res.data; // Trả về category đã cập nhật
};

/**
 * Hàm deleteCategoryApi:
 * Mục đích: Xóa category
 * Cách hoạt động:
 *   1. Nhận id của category cần xóa
 *   2. Gọi DELETE tới endpoint /categories/:id
 *   3. Trả về id của category vừa xóa
 */
export const deleteCategoryApi = async (id: number): Promise<number> => {
  await axiosClient.delete(`${API_URL}/${id}`); // DELETE category theo id
  return id; // Trả về id đã xóa
};
