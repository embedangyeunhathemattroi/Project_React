
// // Question (Quiz)
// export interface Question {
//   id: number;
//   question: string;
//   options: string[];
//   answer: string;
//   category: string;
// }

// // Quiz Result
// export interface Result {
//   id: number;
//   userId: number;
//   score: number;
//   total: number;
//   category: string;
//   date: string; // yyyy-mm-dd
// }

// // Answer Record (optional, dùng khi hiển thị chi tiết đáp án)
// export interface AnswerRecord {
//   questionId: number;
//   selected: string;
//   correct: string;
//   isCorrect: boolean;
// }


export interface Question {
  id: number;
  question: string;
  options: string[];
  answer: string;
  category: string;
}

export interface Result {
  id: number;
  score: number;
  total: number;
  date?: string;
}
