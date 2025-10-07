import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { markVocabAsLearnedApi } from "../../apis/FlashcardApi";
import { fetchVocabsApi } from "../../apis/vocabApi";
import type { Category } from "../../types/category";
import type { Vocab } from "../../types/vocab";

interface FlashcardState {
  vocabs: Vocab[];
  categories: Category[];
  currentIndex: number;
  loading: boolean;
  error: string | null;
  filterCategoryId: number | "All";
}

const initialState: FlashcardState = {
  vocabs: [],
  categories: [],
  currentIndex: 0,
  loading: false,
  error: null,
  filterCategoryId: "All",
};

export const fetchVocabs = createAsyncThunk(
  "flashcard/fetchVocabs",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchVocabsApi();
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch vocabs");
    }
  }
);

export const markAsLearned = createAsyncThunk(
  "flashcard/markAsLearned",
  async (vocab: Vocab, { rejectWithValue }) => {
    try {
      return await markVocabAsLearnedApi(vocab);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to mark as learned");
    }
  }
);

const flashcardSlice = createSlice({
  name: "flashcard",
  initialState,
  reducers: {
    nextCard(state) {
      const filtered = state.filterCategoryId === "All"
        ? state.vocabs
        : state.vocabs.filter(v => v.categoryId === state.filterCategoryId);
      if (state.currentIndex < filtered.length - 1) state.currentIndex += 1;
    },
    previousCard(state) {
      if (state.currentIndex > 0) state.currentIndex -= 1;
    },
    filterByCategory(state, action) {
      state.filterCategoryId = action.payload;
      state.currentIndex = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVocabs.pending, (state) => { 
        state.loading = true; 
        state.error = null; 
      })
      .addCase(fetchVocabs.fulfilled, (state, action) => {
        state.loading = false;
        state.vocabs = action.payload.vocabs;
        state.categories = action.payload.categories;
      })
      .addCase(fetchVocabs.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload as string; 
      })
      .addCase(markAsLearned.fulfilled, (state, action) => {
        const index = state.vocabs.findIndex(v => v.id === action.payload.id);
        if (index !== -1) state.vocabs[index].isLearned = true;
      })
      .addCase(markAsLearned.rejected, (state, action) => { 
        state.error = action.payload as string; 
      });
  },
});

export const { nextCard, previousCard, filterByCategory } = flashcardSlice.actions;
export default flashcardSlice.reducer;
