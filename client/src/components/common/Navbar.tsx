import React from "react";
import { useSelector, useDispatch } from "react-redux"; // Lấy state và dispatch action
import type { RootState } from "../../stores/store";   // Kiểu RootState
import { logoutUser } from "../../stores/slices/authSlice"; // Action logout
import { useNavigate } from "react-router-dom";       // Dùng để chuyển hướng

// Props Navbar
interface NavbarProps {
  activePage?: "login" | "register";                // Xác định button nào đang active
  onChangePage?: (page: "login" | "register") => void; // Callback khi click đổi page
}

const Navbar: React.FC<NavbarProps> = ({ activePage, onChangePage }) => {
  // Lấy thông tin user từ Redux
  const user = useSelector((state: RootState) => state.auth.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Hàm logout
  const handleLogout = () => {
    dispatch(logoutUser());  // Xóa user khỏi Redux
    navigate("/");           // Quay về trang chủ
  };

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        padding: "10px 20px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        backgroundColor: "#fff",
      }}
    >
      {/* Logo / Brand */}
      <div
        style={{
          fontWeight: "bold",
          fontSize: "28px",
          cursor: "pointer",
          flex: 1,
        }}
        onClick={() => navigate(user ? "/dashboard" : "/")} // Click logo => dashboard nếu login, else về home
      >
        VocabApp
      </div>

      {/* Nếu chưa đăng nhập */}
      {!user ? (
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => onChangePage && onChangePage("login")}
            style={{
              padding: "8px 16px",
              borderRadius: "5px",
              border: "1px solid #4994dfff",
              cursor: "pointer",
              backgroundColor: activePage === "login" ? "#1976d2" : "#3395f8",
              color: "#fff",
            }}
          >
            Login
          </button>
          <button
            onClick={() => onChangePage && onChangePage("register")}
            style={{
              padding: "8px 16px",
              borderRadius: "5px",
              border: "1px solid #4caf50",
              cursor: "pointer",
              backgroundColor: activePage === "register" ? "#388e3c" : "#4caf50",
              color: "#fff",
            }}
          >
            Register
          </button>
        </div>
      ) : (
        // Nếu đã đăng nhập
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span>Hi, {user.firstName}</span> {/* Hiển thị tên user */}
          <button
            onClick={handleLogout} // Logout
            style={{
              padding: "8px 16px",
              borderRadius: "5px",
              border: "1px solid #f44336",
              cursor: "pointer",
              backgroundColor: "#f44336",
              color: "#fff",
            }}
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
