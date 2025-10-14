import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import {addCategoryApi,deleteCategoryApi,fetchCategoriesApi,updateCategoryApi,} from "../../apis/categoryApi";
import type { Category } from "../../types/category";
//  Định nghĩa kiểu state lưu trong Redux
interface CategoriesState {
  categories: Category[];   // Danh sách các danh mục hiện có
  loading: boolean;         
  error: string | null;     
  currentFilter: string;    // Bộ lọc hiện tại
}

//  State khởi tạo ban đầu
const initialState: CategoriesState = {
  categories: [],
  loading: false,
  error: null,
  currentFilter: "All",
};

//  Thunk 1: Lấy toàn bộ danh mục từ API
export const fetchCategories = createAsyncThunk("categories/fetch", async (_, { rejectWithValue }) => {
    try {// Gọi API lấy danh sách category
      return await fetchCategoriesApi();
    } catch (err: any) {
      return rejectWithValue(err.message || "Fetch failed");
    }
  }
);

// Thunk 3: Thêm danh mục mới
export const addCategory = createAsyncThunk("categories/add", async (category: { name: string; topic: string }, { rejectWithValue }) => {
    try {
      // Gọi API thêm category
      return await addCategoryApi(category);
    } catch (err: any) {
      return rejectWithValue(err.message || "Add failed");
    }
  }
);

//  Thunk 4: Cập nhật danh mục
export const updateCategory = createAsyncThunk( "categories/update", async (category: Category, { rejectWithValue }) => {
    try {
      return await updateCategoryApi(category);
    } catch (err: any) {
      return rejectWithValue(err.message || "Update failed");
    }
  }
);

//  Thunk 5: Xóa danh mục
export const deleteCategory = createAsyncThunk( "categories/delete",async (id: number, { rejectWithValue }) => {
    try {
      await deleteCategoryApi(id);
      return id; // Trả về id để reducer biết danh mục nào cần xóa khỏi state
    } catch (err: any) {
      return rejectWithValue(err.message || "Delete failed");
    }
  }
);

//  Thunk 2: Lọc danh mục theo "topic"
export const filterCategories = createAsyncThunk( "categories/filter",async (topic: string, { rejectWithValue }) => {
    try {
      // Nếu topic = "All" → gọi toàn bộ
      const url = topic === "All"   ? "http://localhost:8080/categories"  : `http://localhost:8080/categories?topic=${topic}`;
      const res = await axios.get(url);
      return res.data; // Trả dữ liệu về cho reducer
    } catch (err: any) {
      return rejectWithValue(err.message || "Filter failed");
    }
  }
);

// Tạo Slice quản lý categories
const categoriesSlice = createSlice({ name: "categories",initialState, reducers: {
    //  Action sync: thay đổi bộ lọc hiện tại (không cần gọi API)
    setFilter(state, action) {
      state.currentFilter = action.payload;
    },
  },


  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true; // Hiển thị spinner loading
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload; // Gán danh sách lấy được vào store
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string; // Lưu lỗi để hiển thị
      })

      // -------- FILTER CATEGORIES --------
      .addCase(filterCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(filterCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload; // Gán danh mục đã lọc
      })
      .addCase(filterCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // -------- ADD CATEGORY --------
      .addCase(addCategory.fulfilled, (state, action) => {
        // Khi thêm thành công → push danh mục mới vào mảng
        state.categories.push(action.payload);
      })

      // -------- UPDATE CATEGORY --------
      .addCase(updateCategory.fulfilled, (state, action) => {
        // Cập nhật phần tử có id trùng khớp trong danh sách
        state.categories = state.categories.map((cat) =>
          cat.id === action.payload.id ? action.payload : cat
        );
      })

      // -------- DELETE CATEGORY --------
      .addCase(deleteCategory.fulfilled, (state, action) => {
        // Xóa phần tử có id trùng với action.payload
        state.categories = state.categories.filter(
          (cat) => cat.id !== action.payload
        );
      });
  },
});

export const { setFilter } = categoriesSlice.actions;
export default categoriesSlice.reducer;
