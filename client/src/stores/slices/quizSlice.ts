import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Result, Question } from "../../types/utils";
import { getResults, postResult, getQuestions } from "../../apis/resultApi";

interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: string[];
  results: Result[];
  loading: boolean;
  error: string | null;
  quizStarted: boolean;
}

const initialState: QuizState = {
  questions: [],
  currentQuestionIndex: 0,
  userAnswers: [],
  results: [],
  loading: false,
  error: null,
  quizStarted: false,
};

export const fetchQuestions = createAsyncThunk(
  "quiz/fetchQuestions",
  async (_, { rejectWithValue }) => {
    try {
      return await getQuestions();
    } catch (err: any) {
      return rejectWithValue(err.message || "Fetch questions failed");
    }
  }
);

export const saveQuizResult = createAsyncThunk(
  "quiz/saveResult",
  async (result: Result, { rejectWithValue }) => {
    try {
      return await postResult(result);
    } catch (err: any) {
      return rejectWithValue(err.message || "Save result failed");
    }
  }
);

const quizSlice = createSlice({
  name: "quiz",
  initialState,
  reducers: {
    startQuiz(state) {
      state.quizStarted = true;
      state.currentQuestionIndex = 0;
      state.userAnswers = [];
    },
    answerQuestion(state, action: { payload: string }) {
      state.userAnswers[state.currentQuestionIndex] = action.payload;
    },
    nextQuestion(state) {
      if (state.currentQuestionIndex < state.questions.length - 1) {
        state.currentQuestionIndex += 1;
      }
    },
    previousQuestion(state) {
      if (state.currentQuestionIndex > 0) {
        state.currentQuestionIndex -= 1;
      }
    },
    resetQuiz(state) {
      state.quizStarted = false;
      state.currentQuestionIndex = 0;
      state.userAnswers = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.questions = action.payload;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(saveQuizResult.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveQuizResult.fulfilled, (state, action) => {
        state.loading = false;
        state.results.push(action.payload);
      })
      .addCase(saveQuizResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { startQuiz, answerQuestion, nextQuestion, previousQuestion, resetQuiz } = quizSlice.actions;
export default quizSlice.reducer;
