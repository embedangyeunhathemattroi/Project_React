import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import {
  addCategoryApi,
  deleteCategoryApi,
  fetchCategoriesApi,
  updateCategoryApi,
} from "../../apis/categoryApi";
import type { Category } from "../../types/category";
interface CategoriesState {
  categories: Category[];  
  loading: boolean;        
  error: string | null;    
  currentFilter: string;  
}


const initialState: CategoriesState = {
  categories: [],
  loading: false,
  error: null,
  currentFilter: "All",
};

export const fetchCategories = createAsyncThunk(
  "categories/fetch",
  async (_, { rejectWithValue }) => { 
    try { 
      return await fetchCategoriesApi(); 
    } catch (err: any) {
      return rejectWithValue(err.message || "Fetch failed"); 
    }
  }
);


export const filterCategories = createAsyncThunk(
  "categories/filter",
  async (topic: string, { rejectWithValue }) => {
    try {
      const url =
        topic === "All"
          ? "http://localhost:8080/categories"
          : `http://localhost:8080/categories?topic=${topic}`;

      const res = await axios.get(url);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Filter failed");
    }
  }
);

export const addCategory = createAsyncThunk(
  "categories/add",
  async (category: { name: string; topic: string }, { rejectWithValue }) => {
    try {
      return await addCategoryApi(category);
    } catch (err: any) {
      return rejectWithValue(err.message || "Add failed");
    }
  }
);


export const updateCategory = createAsyncThunk(
  "categories/update",
  async (category: Category, { rejectWithValue }) => {
    try {
      return await updateCategoryApi(category);
    } catch (err: any) {
      return rejectWithValue(err.message || "Update failed");
    }
  }
);


export const deleteCategory = createAsyncThunk(
  "categories/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteCategoryApi(id); 
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message || "Delete failed");
    }
  }
);


const categoriesSlice = createSlice({
  name: "categories",
  initialState,      
  reducers: {
    setFilter(state, action) {
      state.currentFilter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false; 
        state.categories = action.payload; 
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(filterCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(filterCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(filterCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(addCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload); 
        
      })

      .addCase(updateCategory.fulfilled, (state, action) => {

        state.categories = state.categories.map((cat) =>
          cat.id === action.payload.id ? action.payload : cat
        );
      })

      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(
          (cat) => cat.id !== action.payload
        );
      });
  },
});
export const { setFilter } = categoriesSlice.actions;
export default categoriesSlice.reducer; 
