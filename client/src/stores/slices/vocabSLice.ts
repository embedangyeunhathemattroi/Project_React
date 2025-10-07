import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchVocabsApi, addVocabApi, updateVocabApi, deleteVocabApi } from "../../apis/vocabApi";
import type { Vocab } from "../../types/vocab";

interface VocabState {
  vocabs: Vocab[];   
  loading: boolean;
  error: string | null;
}

const initialState: VocabState = {
  vocabs: [],
  loading: false,
  error: null,
};

export const fetchVocabs = createAsyncThunk(
  "vocabs/fetch",                            
  async (_, { rejectWithValue }) => {       
    try {
      return await fetchVocabsApi();       
    } catch (err: any) {

      return rejectWithValue(err.message || "Lấy dữ liệu thất bại");
    }
  }
);
export const addVocab = createAsyncThunk(
  "vocabs/add",
  async (vocabData: Omit<Vocab, "id">, { rejectWithValue }) => {
    try {
      return await addVocabApi(vocabData);   
    } catch (err: any) {
      return rejectWithValue(err.message || "Thêm vocab thất bại");
    }
  }
);

export const updateVocab = createAsyncThunk(
  "vocabs/update",
  async (vocabData: Vocab, { rejectWithValue }) => {
    try {
      return await updateVocabApi(vocabData);
    } catch (err: any) {
      return rejectWithValue(err.message || "Cập nhật vocab thất bại");
    }
  }
);

export const deleteVocab = createAsyncThunk(
  "vocabs/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      return await deleteVocabApi(id);
    } catch (err: any) {
      return rejectWithValue(err.message || "Xóa vocab thất bại");
    }
  }
);

const vocabSlice = createSlice({
  name: "vocabs",    
  initialState,          
  reducers: {},        

  extraReducers: (builder) => {
    builder
      .addCase(fetchVocabs.pending, (state) => {
        state.loading = true;   
        state.error = null;    
      })
      .addCase(fetchVocabs.fulfilled, (state, action) => {
        state.loading = false;
        state.vocabs = action.payload;
      })
      .addCase(fetchVocabs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(addVocab.fulfilled, (state, action) => {
        state.vocabs.push(action.payload);
      })

      .addCase(updateVocab.fulfilled, (state, action) => {
        const index = state.vocabs.findIndex(v => v.id === action.payload.id);
        if (index !== -1) state.vocabs[index] = action.payload;
      })

      .addCase(deleteVocab.fulfilled, (state, action) => {
        state.vocabs = state.vocabs.filter(v => v.id !== action.payload);
      });
  },
});

export const selectFilteredVocabs = (state: any, search: string, category: string) => {
  return state.vocabs.vocabs.filter((v: Vocab) =>
    v.word.toLowerCase().includes(search.toLowerCase()) && 
    (category === "All" || v.topic === category)          
  );
};

export default vocabSlice.reducer;
