import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = "http://localhost:8080/users";

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
};

interface AuthState {
  user: User | null;
  loading: boolean;
  isInitialized: boolean;
  error: string | null;
}

const savedUser = localStorage.getItem("user");
const initialState: AuthState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  loading: false,
  isInitialized: false,
  error: null,
};

export const initializeAuth = createAsyncThunk("auth/initialize", async () => {
  const saved = localStorage.getItem("user");
  return saved ? JSON.parse(saved) : null;
});

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData: Omit<User, "id" | "role">, { rejectWithValue }) => {
    try {
      const { data: users } = await axios.get<User[]>(API_URL);
      if (users.some((u) => u.email === userData.email)) {
        return rejectWithValue("Email already exists");
      }
      const newUser = { ...userData, role: "user" };
      const res = await axios.post<User>(API_URL, newUser);
      localStorage.setItem("user", JSON.stringify(res.data));
      return res.data;
    } catch {
      return rejectWithValue("Đăng ký thất bại");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data: users } = await axios.get<User[]>(API_URL);
      const found = users.find((u) => u.email === email && u.password === password);
      if (!found) {
        return rejectWithValue("Sai email hoặc mật khẩu");
      }
      localStorage.setItem("user", JSON.stringify(found));
      return found;
    } catch {
      return rejectWithValue("Đăng nhập thất bại");
    }
  }
);

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
    localStorage.removeItem("user");
    await Swal.fire({
      title: "Đã đăng xuất!",
      text: "Hẹn gặp lại bạn sớm nhé 💙",
      imageUrl: "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif",
      imageWidth: 120,
      imageHeight: 120,
      showConfirmButton: false,
      timer: 2000,
    });
    return true;
  } else {
    return false;
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isInitialized = true;
      })
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
      .addCase(logoutUser.fulfilled, (state, action) => {
        if (action.payload === true) {
          state.user = null;
        }
      });
  },
});

export default authSlice.reducer;
