import React from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/common/Footer";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
   
    navigate("/home/dashboard"); 
  };

  const handleCreateAccount = () => {
    navigate("/register"); // chuyển thẳng sang trang Register
  };

  return (
    <div className="container text-center pt-5 mt-5">
      <h1>Welcome to VocabApp</h1>
      <p>Learn and practice vocabulary with flashcards and quizzes</p>

      <div className="d-flex justify-content-center gap-3 mt-4">
        <button className="btn btn-primary btn-lg" onClick={handleGetStarted}>
          Get Started
        </button>
        <button className="btn btn-success btn-lg" onClick={handleCreateAccount}>
          Create Account
        </button>
      </div>
       <Footer></Footer>
    </div>
  );
};

export default Dashboard;
