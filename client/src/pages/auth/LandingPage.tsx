import React from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStartedClick = () => {
    Swal.fire({
      title: "Bạn đã sẵn sàng bắt đầu chưa?",
      text: "Hãy cùng học từ vựng thật vui và hăng hái!",
      icon: "question",
      imageUrl: "https://media.giphy.com/media/3o7aD6ZCczJ1T5R3Xy/giphy.gif",
      imageWidth: 150,
      imageHeight: 150,
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Chưa sẵn sàng",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/login"); // đi đến login
      }
    });
  };

  const handleCreateAccountClick = () => {
    Swal.fire({
      title: "Bạn đã tạo tài khoản chưa?",
      text: "Nếu chưa thì hãy tạo ngay nhé!",
      icon: "question",
      imageUrl: "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif",
      imageWidth: 150,
      imageHeight: 150,
      showCancelButton: true,
      confirmButtonText: "Chưa tạo",
      cancelButtonText: "Đã tạo",
    }).then(() => {
      navigate("/register"); // đi đến register
    });
  };

  return (
    <div className="container text-center pt-5 mt-5">
      <h1>Welcome to VocabApp</h1>
      <p>Learn and practice vocabulary with flashcards and quizzes</p>
      <div className="d-flex justify-content-center gap-3 mt-4">
        <button className="btn btn-primary btn-lg" onClick={handleGetStartedClick}>
          Get Started
        </button>
        <button className="btn btn-success btn-lg" onClick={handleCreateAccountClick}>
          Create Account
        </button>
      </div>
    </div>
  );
};

export default LandingPage;