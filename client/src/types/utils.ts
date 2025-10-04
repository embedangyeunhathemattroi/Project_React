//các hàm tiện ích(validation, constants)
// src/types/utils.ts

// Người dùng
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string; // "user" | "admin"
}

// Câu hỏi Quiz
export interface Question {
  id: number;
  question: string;
  options: string[];
  answer: string;
  category: string;
}

// Câu trả lời của người dùng trong Quiz
export interface AnswerRecord {
  questionId: number;
  selected: string;
  correct: string;
  isCorrect: boolean;
}

// Kết quả Quiz lưu vào backend / redux
export interface Result {
  id: number;
  userId: number;
  score: number;   // số câu đúng
  total: number;   // tổng số câu
  category: string;
  date: string;    // ISO string hoặc yyyy-mm-dd
}
