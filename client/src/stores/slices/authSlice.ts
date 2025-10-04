
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

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
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

// Đăng ký
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData: Omit<User, "id" | "role">, { rejectWithValue }) => {
    try {
      const { data: users } = await axios.get<User[]>(API_URL);

      // Check email tồn tại
      if (users.some((u) => u.email === userData.email)) {
        return rejectWithValue("Email already exists");
      }

      // Add role mặc định
      const newUser = { ...userData, role: "user" };
      const res = await axios.post<User>(API_URL, newUser);
      return res.data;
    } catch (err) {
      console.error(err);
      return rejectWithValue("Đăng ký thất bại");
    }
  }
);


// authSlice.ts
export const logoutUser = () => (dispatch: any) => {
  localStorage.removeItem("token");
  dispatch({ type: "auth/logout" });
};


// Đăng nhập
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const { data: users } = await axios.get<User[]>(API_URL);

      const found = users.find(
        (u) => u.email === email && u.password === password
      );

      if (found) {
        return found;
      }
      return rejectWithValue("Sai email hoặc mật khẩu");
    } catch (err) {
      console.error(err);
      return rejectWithValue("Đăng nhập thất bại");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      localStorage.removeItem("user");
    },
    loadUserFromStorage: (state) => {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          state.user = JSON.parse(stored) as User;
        }
      } catch {
        state.user = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload as User;
        localStorage.setItem("user", JSON.stringify(action.payload));
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
        state.user = action.payload as User;
        localStorage.setItem("user", JSON.stringify(action.payload));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
  
});

export const { logout, loadUserFromStorage } = authSlice.actions;
export default authSlice.reducer;
