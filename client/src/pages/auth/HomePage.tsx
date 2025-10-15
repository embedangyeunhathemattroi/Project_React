import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import LandingPage from "./LandingPage";
import RegisterPage from "./ResgisterPage";
import LoginPage from "./LoginPage";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../stores/slices/authSlice";
import type { RootState } from "../../stores/store";
import Footer from "../../components/common/Footer";
const HomePage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showLanding, setShowLanding] = useState(true);
  const [activePage, setActivePage] = useState<"login" | "register">("login");
  const [activePath, setActivePath] = useState<string>("/dashboard"); 

  const isAuthenticated = !!user;

  const handleNavClick = (path: string) => {
    navigate(path);
    setActivePath(path);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    setShowLanding(true);
    setActivePage("login");
    navigate("/");
  };

  const handleGetStarted = () => {
    setShowLanding(false);
    setActivePage("login");
  };

  const handleCreateAccount = () => {
    setShowLanding(false);
    setActivePage("register");
  };

  return (
    <div className="homepage d-flex flex-column min-vh-100">
      <header className="navbar navbar-expand-lg navbar-light bg-light px-3 shadow-sm">
        <div className="container-fluid">
          <span
            className="navbar-brand fw-bold"
            style={{ cursor: "pointer" }}
            onClick={() =>
              handleNavClick(isAuthenticated ? "/dashboard" : "/")
            }
          >
            VocabApp
          </span>

          {!isAuthenticated && !showLanding && (
            <div className="d-flex gap-2 ms-auto">
              <button
                className={`btn ${
                  activePage === "login" ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => setActivePage("login")}
              >
                Login
              </button>
              <button
                className={`btn ${
                  activePage === "register" ? "btn-success" : "btn-outline-success"
                }`}
                onClick={() => setActivePage("register")}
              >
                Register
              </button>
            </div>
          )}

          {isAuthenticated && (
            <>
              <ul className="navbar-nav me-auto mb-2 mb-lg-0 d-flex flex-row gap-2">
                {["/dashboard", "/categories", "/vocabulary", "/flashcard", "/quiz"].map(
                  (path) => (
                    <li className="nav-item" key={path}>
                      <button
                        className={`btn nav-link ${
                          activePath === path ? "fw-bold text-primary" : ""
                        }`} // chữ đậm và màu xanh khi active
                        onClick={() => handleNavClick(path)}
                      >
                        {path.replace("/", "").charAt(0).toUpperCase() +
                          path.replace("/", "").slice(1)}
                      </button>
                    </li>
                  )
                )}
              </ul>
              <span className="ms-auto me-2">Hi, {user.firstName}</span>
              <button className="btn btn-danger" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </header>

      <main className="flex-fill">
        {!isAuthenticated && showLanding && (
          <LandingPage
            onGetStarted={handleGetStarted}
            onCreateAccount={handleCreateAccount}
          />
        )}
        {!isAuthenticated && !showLanding && activePage === "login" && <LoginPage />}
        {!isAuthenticated && !showLanding && activePage === "register" && (
          <RegisterPage />
        )}
        {isAuthenticated && <Outlet />}
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;

