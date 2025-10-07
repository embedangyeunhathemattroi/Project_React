import React from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../stores/store";
import { logoutUser } from "../../stores/slices/authSlice";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; 
interface NavbarProps {
  activePage?: "login" | "register"; 
  onChangePage?: (page: "login" | "register") => void; 
}

const Navbar: React.FC<NavbarProps> = ({ activePage, onChangePage }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Are you sure you want to logout?",
      text: "Your session will be ended.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4caf50", 
      cancelButtonColor: "#f44336", 
      confirmButtonText: "Yes, logout",
    });
    if (result.isConfirmed) {
      await dispatch(logoutUser()); 
      await Swal.fire({
        title: "Logged out!",
        text: "You have been logged out successfully.",
        icon: "success",
        imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExb3h3azhyY3l2a3lwOXk5ZDI0eHZ6OWxybW01bWJ1azZ1YjBuaTNndSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ZqlvCTNHpqrio/giphy.gif",
        imageWidth: 120,
        imageHeight: 120,
        confirmButtonColor: "#43a047",
      });
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
      <div
        style={{
          fontWeight: "bold",
          fontSize: "28px",
          cursor: "pointer",
          flex: 1,
        }}
        onClick={() => navigate(user ? "/dashboard" : "/")}
      >
        VocabApp
      </div>
      {!user ? (
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => onChangePage && onChangePage("login")}
            style={{
              padding: "8px 16px",
              borderRadius: "5px",
              border: "1px solid #43a5f5",
              cursor: "pointer",
              backgroundColor:
                activePage === "login" ? " #3B82F6" : "#1e77c0ff",
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
              backgroundColor:
                activePage === "register" ? "#2e7d32" : "#22C55E",
              color: "#fff",
              transition: "0.3s",
            }}
          >
            Register
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span>Hi, {user.firstName || user.email}</span>
          <button
            onClick={handleLogout}
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
