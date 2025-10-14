import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Result } from "../../types/utils";
import { getResults, postResult } from "../../apis/resultApi";

// ----- Định nghĩa state cho kết quả quiz -----
interface ResultState {
  results: Result[];     
  loading: boolean;       
  error: string | null;   
}

// ----- Giá trị khởi tạo state -----
const initialState: ResultState = {
  results: [],           
  loading: false,         
  error: null,            
};

// ----- Thunk async lấy kết quả quiz từ API -----
export const fetchResults = createAsyncThunk("result/fetchResults",async (_, { rejectWithValue }) => {
    try {
      return await getResults();  
    } catch (err: any) {
      return rejectWithValue(err.message || "Fetch failed"); 
    }
  }
);

// ----- Thunk async lưu kết quả quiz lên API -----
export const saveResult = createAsyncThunk(
  "result/saveResult",
  async (newResult: Result, { rejectWithValue }) => {
    try {
      return await postResult(newResult);
    } catch (err: any) {
      return rejectWithValue(err.message || "Save failed"); 
    }
  }
);

// ----- Tạo slice quản lý kết quả quiz -----
const resultSlice = createSlice({
  name: "result",         
  initialState,            
  reducers: {              
    clearResults(state) {   // xóa toàn bộ kết quả trong state
      state.results = [];  
      state.error = null; 
      state.loading = false;
    },
  },
  extraReducers: (builder) => {  
    builder
      .addCase(fetchResults.pending, (state) => { 
        state.loading = true;    
        state.error = null;      
      })
    
      .addCase(fetchResults.fulfilled, (state, action) => { 
        state.loading = false; 
        state.results = action.payload; 
      })
   
      .addCase(fetchResults.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload as string; 
      })

      .addCase(saveResult.pending, (state) => { 
        state.loading = true; 
        state.error = null; 
      })
    
      .addCase(saveResult.fulfilled, (state, action) => { 
        state.loading = false; 
        state.results.push(action.payload); // thêm result mới vào state
      })
   
      .addCase(saveResult.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload as string; 
      });
  },
});

export const { clearResults } = resultSlice.actions;
export default resultSlice.reducer;
