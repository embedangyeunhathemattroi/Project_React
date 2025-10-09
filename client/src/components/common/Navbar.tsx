import React from "react";
import { useSelector, useDispatch } from "react-redux"; // hook để lấy state và dispatch action
import type { RootState } from "../../stores/store"; // type RootState của Redux store
import { logoutUser } from "../../stores/slices/authSlice"; // async thunk logout
import { useNavigate } from "react-router-dom"; // hook navigate chuyển trang
import Swal from "sweetalert2"; // hiển thị popup đẹp

// Props của Navbar
interface NavbarProps {
  activePage?: "login" | "register"; // trang đang active (màu button)
  onChangePage?: (page: "login" | "register") => void; // callback chuyển trang
}

// Navbar component
const Navbar: React.FC<NavbarProps> = ({ activePage, onChangePage }) => {
  // Lấy user từ Redux state
  const user = useSelector((state: RootState) => state.auth.user);
  // dispatch các async thunk (logoutUser)
  const dispatch = useDispatch<any>();
  // navigate để chuyển trang
  const navigate = useNavigate();

  // ----------------------- Hàm logout -----------------------
  const handleLogout = async () => {
    //  Hiển thị confirm popup trước khi logout
    const result = await Swal.fire({
      title: "Are you sure you want to logout?",
      text: "Your session will be ended.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4caf50", 
      cancelButtonColor: "#f44336", 
      confirmButtonText: "Yes, logout",
    });

    //  Nếu user xác nhận logout
    if (result.isConfirmed) {
      await dispatch(logoutUser()); // gọi async thunk logout → xóa user khỏi Redux state & localStorage
      //  Hiển thị popup thông báo đã logout thành công
      await Swal.fire({
        title: "Logged out!",
        text: "You have been logged out successfully.",
        icon: "success",
        imageUrl:
          "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExb3h3azhyY3l2a3lwOXk5ZDI0eHZ6OWxybW01bWJ1azZ1YjBuaTNndSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ZqlvCTNHpqrio/giphy.gif",
        imageWidth: 120,
        imageHeight: 120,
        confirmButtonColor: "#43a047",
      });

      //  Chuyển về trang login sau khi logout
      navigate("/login"); 
    }
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
        // click vào logo → nếu user login thì về dashboard, chưa login thì về trang home
        onClick={() => navigate(user ? "/dashboard" : "/")}
      >
        VocabApp
      </div>

      {/* Nếu chưa login → hiển thị button Login / Register */}
      {!user ? (
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => onChangePage && onChangePage("login")} // gọi callback để parent chuyển trang
            style={{
              padding: "8px 16px",
              borderRadius: "5px",
              border: "1px solid #43a5f5",
              cursor: "pointer",
              backgroundColor: activePage === "login" ? " #3B82F6" : "#1e77c0ff", // highlight button active
              color: "#fff",
              transition: "0.3s",
            }}
          >
            Login
          </button>
          <button
            onClick={() => onChangePage && onChangePage("register")}
            style={{
              padding: "8px 16px",
              borderRadius: "5px",
              border: "1px solid #22C55E",
              cursor: "pointer",
              backgroundColor: activePage === "register" ? "#2e7d32" : "#22C55E", // highlight button active
              color: "#fff",
              transition: "0.3s",
            }}
          >
            Register
          </button>
        </div>
      ) : (
        // Nếu đã login → hiển thị tên user + button Logout
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span>Hi, {user.firstName || user.email}</span>
          <button
            onClick={handleLogout} // gọi hàm logout
            style={{
              padding: "8px 16px",
              borderRadius: "5px",
              border: "1px solid #f44336",
              cursor: "pointer",
              backgroundColor: "#f44336",
              color: "#fff",
              transition: "0.3s",
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
