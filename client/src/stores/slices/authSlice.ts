import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"; 
import axios from "axios"; // axios để gọi API
import Swal from "sweetalert2"; 

//  URL API backend (JSON server hoặc backend riêng)
const API_URL = "http://localhost:8080/users";
export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string; // role của user: "user" hoặc "admin"
};

//  Định nghĩa state cho authentication
interface AuthState {
  user: User | null; // thông tin user hiện tại, null nếu chưa login
  loading: boolean; 
  isInitialized: boolean; // kiểm tra xem app đã đọc dữ liệu từ localStorage chưa
  error: string | null; 
}

//load app, app sẽ tự động "nhớ" ai đã login trước đó nhờ localStorage, không cần login lại ngay
const savedUser = localStorage.getItem("user"); // get user từ localStorage
const initialState: AuthState = {
  user: savedUser ? JSON.parse(savedUser) : null, // nếu có user lưu → set vào state
  loading: false,
  isInitialized: false,
  error: null,
};

// 6a. Khởi tạo auth khi app load
export const initializeAuth = createAsyncThunk("auth/initialize", async () => {
  const saved = localStorage.getItem("user"); // đọc từ localStorage
  return saved ? JSON.parse(saved) : null; // trả về user nếu có
});

// 6b. Đăng ký user mới
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData: Omit<User, "id" | "role">, { rejectWithValue }) => {
    try {
      // 1. Lấy danh sách user hiện tại
      const { data: users } = await axios.get<User[]>(API_URL);

      // 2. Kiểm tra email đã tồn tại chưa
      if (users.some((u) => u.email === userData.email)) {
        return rejectWithValue("Email already exists"); // trả lỗi
      }

      // 3. Tạo user mới (role mặc định "user")
      const newUser = { ...userData, role: "user" };

      // 4. Gửi POST lên server để thêm user
      const res = await axios.post<User>(API_URL, newUser);

      // 5. Lưu user vào localStorage để ghi nhớ login
      localStorage.setItem("user", JSON.stringify(res.data));
      return res.data;
    } catch (err) {
      console.error(err);
      return rejectWithValue("Đăng ký thất bại"); // nếu lỗi server
    }
  }
);

// 6c. Đăng nhập user
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data: users } = await axios.get<User[]>(API_URL); // lấy danh sách user
      const found = users.find((u) => u.email === email && u.password === password); // tìm user
      if (!found) {
        return rejectWithValue("Sai email hoặc mật khẩu"); // nếu không tồn tại → lỗi
      }

      localStorage.setItem("user", JSON.stringify(found)); // lưu vào localStorage
      return found; // trả về user
    } catch (err) {
      console.error(err);
      return rejectWithValue("Đăng nhập thất bại"); // lỗi API
    }
  }
);

// 6d. Logout user với confirm popup
export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  const result = await Swal.fire({
    title: "Bạn có chắc muốn đăng xuất không?",
    text: "Chúng tôi sẽ nhớ bạn lắm đó!",
    imageUrl: "https://media.giphy.com/media/9Y5BbDSkSTiY8/giphy.gif",
    imageWidth: 120,
    imageHeight: 120,
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Vâng, đăng xuất thôi!",
    cancelButtonText: "Ở lại",
  });

  if (result.isConfirmed) {
    localStorage.removeItem("user"); // xóa user khỏi localStorage
    await Swal.fire({
      title: "Đã đăng xuất!",
      text: "Hẹn gặp lại bạn sớm nhé 💙",
      imageUrl: "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif",
      imageWidth: 120,
      imageHeight: 120,
      showConfirmButton: false,
      timer: 2000,
    });
    return true; // trả về true → reducer sẽ set user = null
  } else {
    return false; // không logout
  }
});

// 7️⃣ Tạo authSlice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {}, 
  extraReducers: (builder) => {
    builder
      // Khi khởi tạo auth xong
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isInitialized = true;
      })
      // Khi đăng ký user
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Khi login user
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Khi logout user
      .addCase(logoutUser.fulfilled, (state, action) => {
        if (action.payload === true) {
          state.user = null; // logout thành công → set user = null
        }
      });
  },
});
export default authSlice.reducer;
//Auth slice quản lý login, register và logout. Khi app load, nó check localStorage để tự ‘nhớ’ user. Mỗi action bất đồng bộ có 3 trạng thái: pending (đang load), fulfilled (thành công → lưu user), rejected (thất bại → lưu lỗi).