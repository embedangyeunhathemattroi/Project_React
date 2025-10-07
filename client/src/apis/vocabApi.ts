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
  const res = await axiosClient.put<Vocab>(`${API_URL}/${vocabData.id}`, vocabData); 
  return res.data;
};
export const deleteVocabApi = async (id: number): Promise<number> => {
  await axiosClient.delete(`${API_URL}/${id}`); 
  return id; 
};
