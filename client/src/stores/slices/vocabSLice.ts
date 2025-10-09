import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchVocabsApi, addVocabApi, updateVocabApi, deleteVocabApi } from "../../apis/vocabApi";
import type { Vocab } from "../../types/vocab";

// Định nghĩa state cho vocab
interface VocabState {
  vocabs: Vocab[];   // danh sách vocab hiện có
  loading: boolean;  // trạng thái loading khi gọi API
  error: string | null;
}

// state ban đầu
const initialState: VocabState = {
  vocabs: [],
  loading: false,
  error: null,
};

// Lấy danh sách vocab từ server
export const fetchVocabs = createAsyncThunk( "vocabs/fetch", async (_, { rejectWithValue }) => {       
    try {
      return await fetchVocabsApi();       // gọi API trả về danh sách vocab
    } catch (err: any) {
      return rejectWithValue(err.message || "Lấy dữ liệu thất bại"); 
    }
  }
);

// Thêm vocab mới
export const addVocab = createAsyncThunk( "vocabs/add",async (vocabData: Omit<Vocab, "id">, { rejectWithValue }) => {
    try {
      return await addVocabApi(vocabData);   // gọi API thêm vocab mới
    } catch (err: any) {
      return rejectWithValue(err.message || "Thêm vocab thất bại");
    }
  }
);

// Cập nhật vocab
export const updateVocab = createAsyncThunk( "vocabs/update",async (vocabData: Vocab, { rejectWithValue }) => {
    try {
      return await updateVocabApi(vocabData); // gọi API cập nhật vocab
    } catch (err: any) {
      return rejectWithValue(err.message || "Cập nhật vocab thất bại");
    }
  }
);

// Xóa vocab
export const deleteVocab = createAsyncThunk("vocabs/delete",async (id: number, { rejectWithValue }) => {
    try {
      return await deleteVocabApi(id); // gọi API xóa vocab theo id
    } catch (err: any) {
      return rejectWithValue(err.message || "Xóa vocab thất bại");
    }
  }
);

const vocabSlice = createSlice({
  name: "vocabs",           // tên slice
  initialState,             // state mặc định
  reducers: {},             // reducer thuần, ở đây không dùng
  extraReducers: (builder) => {
    builder
      .addCase(fetchVocabs.pending, (state) => { // đang load API
        state.loading = true;   
        state.error = null;    
      })
      .addCase(fetchVocabs.fulfilled, (state, action) => { // fetch thành công
        state.loading = false;
        state.vocabs = action.payload; // lưu danh sách vocab vào state
      })
      .addCase(fetchVocabs.rejected, (state, action) => { // fetch thất bại
        state.loading = false;
        state.error = action.payload as string;
      })

      // --- xử lý thêm vocab ---
      .addCase(addVocab.fulfilled, (state, action) => {
        state.vocabs.push(action.payload); // thêm vocab mới vào state
      })

      // --- xử lý cập nhật vocab ---
      .addCase(updateVocab.fulfilled, (state, action) => {
        const index = state.vocabs.findIndex(v => v.id === action.payload.id);
        if (index !== -1) state.vocabs[index] = action.payload; // update vocab theo id
      })

      // --- xử lý xóa vocab ---
      .addCase(deleteVocab.fulfilled, (state, action) => {
        state.vocabs = state.vocabs.filter(v => v.id !== action.payload); // xóa vocab theo id
      });
  },
});

// === Selector để lọc vocab theo search và category ===
export const selectFilteredVocabs = (state: any, search: string, category: string) => {
  return state.vocabs.vocabs.filter((v: Vocab) =>
    v.word.toLowerCase().includes(search.toLowerCase()) &&  // lọc theo từ khóa
    (category === "All" || v.topic === category)           // lọc theo category nếu khác "All"
  );
};

export default vocabSlice.reducer; 