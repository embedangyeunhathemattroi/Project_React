import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/common/Footer";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/home/dashboard");
  };

  const handleCreateAccount = () => {
    navigate("/register");
  };

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.documentElement.style.height = "100%";
    document.body.style.height = "100vh";
    document.body.style.backgroundColor = "#F3F4F6";
  }, []);

  return (
    <div
      className="container-fluid text-center d-flex flex-column justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        backgroundColor: "#F3F4F6",
        padding: 0,
        margin: 0,
      }}
    >
      <h1
        className="fw-bold"
        style={{
          color: "#111827",
          marginBottom: "20px",
          fontSize: "2.3rem",
        }}
      >
        Welcome to VocabApp
      </h1>

      <p
        style={{
          color: "#1F2937",
          fontSize: "1.1rem",
          maxWidth: "700px",
          marginBottom: "30px",
        }}
      >
        Learn and practice vocabulary with flashcards and quizzes
      </p>

      <div className="d-flex justify-content-center gap-3 mt-3">
        <button
          className="btn btn-primary btn-lg"
          style={{
            padding: "12px 28px",
            borderRadius: "8px",
          }}
          onClick={handleGetStarted}
        >
          Get Started
        </button>

        <button
          className="btn btn-success btn-lg"
          style={{
            padding: "12px 28px",
            borderRadius: "8px",
          }}
          onClick={handleCreateAccount}
        >
          Create Account
        </button>
      </div>

      <div style={{ marginTop: "auto", width: "100%" }}>
        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;
