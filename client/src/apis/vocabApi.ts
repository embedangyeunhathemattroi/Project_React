import axiosClient from "./axiosClient";
import type { Vocab } from "../types/vocab";
const API_URL = "/vocabs";
export const fetchVocabsApi = async (): Promise<Vocab[]> => {
  const res = await axiosClient.get<Vocab[]>(API_URL); 
  return res.data;
};
export const addVocabApi = async (vocabData: Omit<Vocab, "id">): Promise<Vocab> => {
  const res = await axiosClient.post<Vocab>(API_URL, vocabData); 
  return res.data; 
};
export const updateVocabApi = async (vocabData: Vocab): Promise<Vocab> => {
  //  Gửi yêu cầu PUT đến API, kèm theo dữ liệu vocab cần cập nhật
  // `${API_URL}/${vocabData.id}` → đường dẫn chứa ID của từ cần sửa
  // `vocabData` → dữ liệu mới gửi lên server để cập nhật
  const res = await axiosClient.put<Vocab>(`${API_URL}/${vocabData.id}`, vocabData); 
  return res.data;
};

export const deleteVocabApi = async (id: number): Promise<number> => {
  await axiosClient.delete(`${API_URL}/${id}`); 
  return id; 
};
