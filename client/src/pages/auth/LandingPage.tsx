import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const handleGetStartedClick = () => {
    navigate("/login");
  };
  const handleCreateAccountClick = () => {
    navigate("/register");
  };

  return (
    <div className="container text-center pt-7 mt-7">
      <h1 className="fw-bold mb-3">Welcome to VocabApp</h1>
      <p className="lead text-muted">
        Learn and practice vocabulary with flashcards and quizzes
      </p>

      <div className="d-flex justify-content-center gap-3 mt-4">
        <button
          className="btn btn-primary btn-lg px-4 py-2"
          onClick={handleGetStartedClick}
        >
          Get Started
        </button>

        <button
          className="btn btn-success btn-lg px-4 py-2"
          onClick={handleCreateAccountClick}
        >
          Create Account
        </button>
      </div>
    </div>
  );
};
//LandingPage dành cho người chưa login → chỉ cần hiển thị giới thiệu app và 2 nút dẫn đến login/register.
export default LandingPage;
