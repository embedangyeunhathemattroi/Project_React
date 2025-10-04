// // src/apis/FlashcardAPI.ts
// import axios from "axios";

// import type { Category } from "../types/category";
// import type { Vocab } from "../types/vocab";


// const VOCABS_URL = "http://localhost:8080/vocabs";
// const CATEGORIES_URL = "http://localhost:8080/categories";

// // Lấy vocabs và categories
// export const fetchVocabsApi = async (): Promise<{ vocabs: Vocab[], categories: Category[] }> => {
//   const [vocabsRes, categoriesRes] = await Promise.all([
//     axios.get<Vocab[]>(VOCABS_URL),
//     axios.get<Category[]>(CATEGORIES_URL),
//   ]);
//   return {
//     vocabs: vocabsRes.data,
//     categories: categoriesRes.data,
//   };
// };

// // Cập nhật trạng thái học
// export const markVocabAsLearnedApi = async (vocab: Vocab): Promise<Vocab> => {
//   const res = await axios.patch<Vocab>(`${VOCABS_URL}/${vocab.id}`, { ...vocab, isLearned: true });
//   return res.data;
// };

// src/apis/FlashcardAPI.ts

// Import axiosClient để gọi API tới server
import axiosClient from "./axiosClient";

// Import kiểu Category và Vocab để gõ kiểu dữ liệu
import type { Category } from "../types/category";
import type { Vocab } from "../types/vocab";

/**
 * Hàm fetchVocabsAndCategoriesApi:
 * Mục đích: Lấy tất cả vocabs và categories cùng lúc
 * Cách hoạt động:
 *   1. Sử dụng Promise.all để gọi đồng thời 2 API:
 *      - GET /vocabs
 *      - GET /categories
 *      => Giúp tốc độ nhanh hơn so với gọi tuần tự
 *   2. Trả về một object gồm:
 *      - vocabs: danh sách từ vựng
 *      - categories: danh sách danh mục
 */
export const fetchVocabsAndCategoriesApi = async (): Promise<{ vocabs: Vocab[], categories: Category[] }> => {
  const [vocabsRes, categoriesRes] = await Promise.all([
    axiosClient.get<Vocab[]>("/vocabs"),       // GET tất cả vocabs
    axiosClient.get<Category[]>("/categories") // GET tất cả categories
  ]);

  return {
    vocabs: vocabsRes.data,         // Trả về vocabs
    categories: categoriesRes.data, // Trả về categories
  };
};

/**
 * Hàm markVocabAsLearnedApi:
 * Mục đích: Đánh dấu một vocab đã học
 * Cách hoạt động:
 *   1. Nhận một đối tượng vocab
 *   2. Gọi PATCH tới endpoint /vocabs/:id
 *      - Cập nhật isLearned = true
 *   3. Trả về vocab đã được cập nhật
 */
export const markVocabAsLearnedApi = async (vocab: Vocab): Promise<Vocab> => {
  const res = await axiosClient.patch<Vocab>(`/vocabs/${vocab.id}`, { ...vocab, isLearned: true });
  return res.data; // Trả về vocab đã đánh dấu là đã học
};
