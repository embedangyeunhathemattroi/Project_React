// import axios from "axios";
// import type { Vocab } from "../types/vocab";


// const API_URL = "http://localhost:8080/vocabs";

// export const fetchVocabsApi = async (): Promise<Vocab[]> => {
//   const res = await axios.get<Vocab[]>(API_URL);
//   return res.data;
// };

// export const addVocabApi = async (vocabData: Omit<Vocab, "id">): Promise<Vocab> => {
//   const res = await axios.post<Vocab>(API_URL, vocabData);
//   return res.data;
// };

// export const updateVocabApi = async (vocabData: Vocab): Promise<Vocab> => {
//   const res = await axios.put<Vocab>(`${API_URL}/${vocabData.id}`, vocabData);
//   return res.data;
// };

// export const deleteVocabApi = async (id: number): Promise<number> => {
//   await axios.delete(`${API_URL}/${id}`);
//   return id;
// };

// src/apis/VocabAPI.ts

// Import axiosClient để gọi API tới server
import axiosClient from "./axiosClient";

// Import kiểu Vocab để gõ kiểu dữ liệu
import type { Vocab } from "../types/vocab";

// URL tương đối cho endpoint vocabs
const API_URL = "/vocabs";

/**
 * Hàm fetchVocabsApi:
 * Mục đích: Lấy tất cả từ vựng từ server
 * Cách hoạt động:
 *   1. Gọi GET tới endpoint /vocabs
 *   2. Trả về mảng các Vocab
 */
export const fetchVocabsApi = async (): Promise<Vocab[]> => {
  const res = await axiosClient.get<Vocab[]>(API_URL); // GET tất cả từ vựng
  return res.data; // Trả về danh sách từ vựng
};

/**
 * Hàm addVocabApi:
 * Mục đích: Thêm từ vựng mới
 * Cách hoạt động:
 *   1. Nhận đối tượng vocabData (không có id)
 *   2. Gọi POST tới endpoint /vocabs để tạo vocab mới
 *   3. Trả về vocab vừa tạo
 */
export const addVocabApi = async (vocabData: Omit<Vocab, "id">): Promise<Vocab> => {
  const res = await axiosClient.post<Vocab>(API_URL, vocabData); // POST vocab mới
  return res.data; // Trả về vocab vừa thêm
};

/**
 * Hàm updateVocabApi:
 * Mục đích: Cập nhật từ vựng
 * Cách hoạt động:
 *   1. Nhận đối tượng vocabData đầy đủ (có id)
 *   2. Gọi PUT tới endpoint /vocabs/:id để cập nhật vocab
 *   3. Trả về vocab đã được cập nhật
 */
export const updateVocabApi = async (vocabData: Vocab): Promise<Vocab> => {
  const res = await axiosClient.put<Vocab>(`${API_URL}/${vocabData.id}`, vocabData); // PUT vocab
  return res.data; // Trả về vocab đã cập nhật
};

/**
 * Hàm deleteVocabApi:
 * Mục đích: Xóa từ vựng
 * Cách hoạt động:
 *   1. Nhận id của vocab cần xóa
 *   2. Gọi DELETE tới endpoint /vocabs/:id
 *   3. Trả về id của vocab vừa xóa
 */
export const deleteVocabApi = async (id: number): Promise<number> => {
  await axiosClient.delete(`${API_URL}/${id}`); // DELETE vocab theo id
  return id; // Trả về id đã xóa
};
