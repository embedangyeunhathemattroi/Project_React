import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import LandingPage from "./LandingPage";
import RegisterPage from "./ResgisterPage";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../stores/slices/authSlice";
import type { RootState } from "../../stores/store";
import Footer from "../../components/common/Footer";

const HomePage: React.FC = () => {
  // Lấy thông tin user từ Redux store
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // State điều khiển hiển thị LandingPage hay Login/Register
  const [showLanding, setShowLanding] = useState(true);
  const [activePage, setActivePage] = useState<"login" | "register">("login");
  // Kiểm tra xem user đã đăng nhập chưa
  const isAuthenticated = !!user;

  // Hàm điều hướng navbar
  const handleNavClick = (path: string) => navigate(path);
  // Logout: gọi action logout redux, show lại Landing, điều hướng về "/"
  const handleLogout = () => {
    dispatch(logoutUser());
    setShowLanding(true);
    setActivePage("login");
    navigate("/");
  };

  return (
    <div className="homepage d-flex flex-column min-vh-100">
      {/* Navbar luôn hiển thị */}
      <header className="navbar navbar-expand-lg navbar-light bg-light px-3 shadow-sm">
        <div className="container-fluid">
          {/* Logo VocabApp, click về Dashboard nếu đã login, về Landing nếu chưa */}
          <span
            className="navbar-brand fw-bold"
            style={{ cursor: "pointer" }}
            onClick={() => handleNavClick(isAuthenticated ? "/dashboard" : "/")}
          >
            VocabApp
          </span>

          {/* Navbar khi chưa đăng nhập */}
          {!isAuthenticated && !showLanding && (
            <div className="d-flex gap-2 ms-auto">
              {/* Nút chuyển Login / Register */}
              <button
                className={`btn ${activePage === "login" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setActivePage("login")}
              >
                Login
              </button>
              <button
                className={`btn ${activePage === "register" ? "btn-success" : "btn-outline-success"}`}
                onClick={() => setActivePage("register")}
              >
                Register
              </button>
            </div>
          )}

          {/* Navbar khi đã đăng nhập */}
          {isAuthenticated && (
            <>
              {/* Menu links */}
              <ul className="navbar-nav me-auto mb-2 mb-lg-0 d-flex flex-row gap-2">
                {["/dashboard", "/categories", "/vocabulary", "/flashcard", "/quiz"].map((path) => (
                  <li className="nav-item" key={path}>
                    <button className="btn nav-link" onClick={() => handleNavClick(path)}>
                      {/* Chuyển path thành chữ hiển thị */}
                      {path.replace("/", "").charAt(0).toUpperCase() + path.replace("/", "").slice(1)}
                    </button>
                  </li>
                ))}
              </ul>
              {/* Hiển thị tên user */}
              <span className="ms-auto me-2">Hi, {user.firstName}</span>
              {/* Nút Logout */}
              <button className="btn btn-danger" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-fill">
        {/* LandingPage hiển thị khi chưa login và showLanding=true */}
        {!isAuthenticated && showLanding && (
          <LandingPage onGetStarted={handleGetStarted} onCreateAccount={handleCreateAccount} />
        )}

        {/* Swap giữa Login / Register khi ẩn Landing */}
        {!isAuthenticated && !showLanding && activePage === "login" && <LoginPage />}
        {!isAuthenticated && !showLanding && activePage === "register" && <RegisterPage />}

        {/* Khi user đã đăng nhập, render Outlet cho nested routes */}
        {isAuthenticated && <Outlet />}
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
