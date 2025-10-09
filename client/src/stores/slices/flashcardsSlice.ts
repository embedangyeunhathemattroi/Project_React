// ========================== IMPORT THƯ VIỆN VÀ KIỂU DỮ LIỆU ==========================
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { markVocabAsLearnedApi } from "../../apis/FlashcardApi"; // API đánh dấu từ đã học
import { fetchVocabsApi } from "../../apis/vocabApi"; // API lấy danh sách từ vựng + danh mục
import type { Category } from "../../types/category"; // Kiểu dữ liệu cho Category
import type { Vocab } from "../../types/vocab";       // Kiểu dữ liệu cho Vocab

// ========================== ĐỊNH NGHĨA KIỂU CHO STATE ==========================
interface FlashcardState {
  vocabs: Vocab[];                // Danh sách tất cả từ vựng
  categories: Category[];         // Danh sách danh mục từ vựng
  currentIndex: number;           // Vị trí hiện tại của thẻ đang học
  loading: boolean;               // Cờ cho biết đang tải dữ liệu
  error: string | null;           // Lưu thông báo lỗi nếu có
  filterCategoryId: number | "All"; // ID danh mục hiện tại (hoặc "All")
}

// ========================== STATE BAN ĐẦU ==========================
const initialState: FlashcardState = {
  vocabs: [],
  categories: [],
  currentIndex: 0,
  loading: false,
  error: null,
  filterCategoryId: "All",
};

// ========================== ASYNC ACTION 1: LẤY DỮ LIỆU VOCAB + CATEGORY ==========================
// Dùng createAsyncThunk để gọi API bất đồng bộ
export const fetchVocabs = createAsyncThunk(
  "flashcard/fetchVocabs", // Tên action
  async (_, { rejectWithValue }) => {
    try {
      // Gọi API lấy dữ liệu từ vựng và danh mục
      return await fetchVocabsApi();
    } catch (err: any) {
      // Nếu lỗi -> trả về lỗi để reducer xử lý
      return rejectWithValue(err.message || "Failed to fetch vocabs");
    }
  }
);

// ========================== ASYNC ACTION 2: ĐÁNH DẤU TỪ ĐÃ HỌC ==========================
export const markAsLearned = createAsyncThunk(
  "flashcard/markAsLearned",
  async (vocab: Vocab, { rejectWithValue }) => {
    try {
      // Gọi API cập nhật trạng thái từ vựng đã học
      return await markVocabAsLearnedApi(vocab);
    } catch (err: any) {
      // Nếu lỗi -> trả về lỗi cho reducer xử lý
      return rejectWithValue(err.message || "Failed to mark as learned");
    }
  }
);

// ========================== KHAI BÁO SLICE ==========================
const flashcardSlice = createSlice({
  name: "flashcard",
  initialState,

  // ============ CÁC REDUCER ĐỒNG BỘ (THAO TÁC NGAY LẬP TỨC KHÔNG GỌI API) ============
  reducers: {
    // 👉 Chuyển sang từ tiếp theo
    nextCard(state) {
      // Lấy danh sách từ đang được lọc theo danh mục hiện tại
      const filtered =
        state.filterCategoryId === "All"
          ? state.vocabs
          : state.vocabs.filter(v => v.categoryId === state.filterCategoryId);

      // Nếu chưa ở cuối danh sách -> tăng currentIndex
      if (state.currentIndex < filtered.length - 1) state.currentIndex += 1;
    },

    // 👉 Quay lại từ trước đó
    previousCard(state) {
      if (state.currentIndex > 0) state.currentIndex -= 1;
    },

    // 👉 Lọc theo danh mục (khi người dùng chọn dropdown)
    filterByCategory(state, action) {
      state.filterCategoryId = action.payload; // Gán lại danh mục đang chọn
      state.currentIndex = 0; // Reset lại về từ đầu tiên trong danh mục mới
    },
  },

  // ============ CÁC REDUCER BẤT ĐỒNG BỘ (KHI GỌI API) ============
  extraReducers: (builder) => {
    builder
      // ===== Trạng thái: ĐANG FETCH DỮ LIỆU =====
      .addCase(fetchVocabs.pending, (state) => {
        state.loading = true;
        state.error = null; // Xóa lỗi cũ nếu có
      })

      // ===== Trạng thái: FETCH DỮ LIỆU THÀNH CÔNG =====
      .addCase(fetchVocabs.fulfilled, (state, action) => {
        state.loading = false;
        // API trả về 2 mảng: vocabs và categories
        state.vocabs = action.payload.vocabs;
        state.categories = action.payload.categories;
      })

      // ===== Trạng thái: FETCH DỮ LIỆU THẤT BẠI =====
      .addCase(fetchVocabs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string; // Lưu lỗi vào state
      })

      // ===== Trạng thái: ĐÁNH DẤU TỪ ĐÃ HỌC THÀNH CÔNG =====
      .addCase(markAsLearned.fulfilled, (state, action) => {
        // Tìm vị trí của từ vừa được cập nhật
        const index = state.vocabs.findIndex(v => v.id === action.payload.id);
        // Nếu tìm thấy -> cập nhật isLearned = true trong store
        if (index !== -1) state.vocabs[index].isLearned = true;
      })

      // ===== Trạng thái: ĐÁNH DẤU THẤT BẠI =====
      .addCase(markAsLearned.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// ========================== EXPORT ACTION VÀ REDUCER ==========================
// Export các action đồng bộ để component có thể dispatch
export const { nextCard, previousCard, filterByCategory } = flashcardSlice.actions;

// Export reducer chính để thêm vào store
export default flashcardSlice.reducer;
