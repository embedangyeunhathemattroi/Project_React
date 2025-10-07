import axiosClient from "./axiosClient";
import type { Result } from "../types/utils";
const BASE_URL = "/results";
export const getResults = async (): Promise<Result[]> => {
  const res = await axiosClient.get<Result[]>(BASE_URL); 
  return res.data;
};
export const postResult = async (newResult: Result): Promise<Result> => {
  const res = await axiosClient.post<Result>(BASE_URL, newResult); 
  return res.data; 
};
