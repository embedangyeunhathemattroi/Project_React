import axiosClient from "./axiosClient"; 
import type { Category } from "../types/category";
import type { Vocab } from "../types/vocab";
export const fetchVocabsAndCategoriesApi = async (): Promise<{ vocabs: Vocab[], categories: Category[] }> => {
  const [vocabsRes, categoriesRes] = await Promise.all([
    axiosClient.get<Vocab[]>("/vocabs"),     
    axiosClient.get<Category[]>("/categories") 
  ]);
  return {
    vocabs: vocabsRes.data,       
    categories: categoriesRes.data, 
  };
};

export const markVocabAsLearnedApi = async (vocab: Vocab): Promise<Vocab> => {
  const res = await axiosClient.patch<Vocab>(`/vocabs/${vocab.id}`, {  ...vocab,isLearned: true });
  return res.data; 
};
