import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoutes from "./protected.routes";
import PublicRoutes from "./public.routes";
import LoginPage from "../../../pages/auth/LoginPage";
import RegisterPage from "../../forms/RegisterForm";
import HomePage from "../../../pages/auth/HomePage";

import Dashboard from "../../../pages/user/Dashboard";
import FlashCardPage from "../../../pages/user/FlashcardPage";
import VocabularyPage from "../../../pages/admin/VocabularyPage";
import QuizPage from "../../../pages/user/QuizPage";
import Cate from "../../../pages/admin/Cate";

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route
        path="/login"
        element={
          <PublicRoutes>
            <LoginPage />
          </PublicRoutes>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoutes>
            <RegisterPage />
          </PublicRoutes>
        }
      />

      {/* PROTECTED */}
      <Route
        path="/"
        element={
          <ProtectedRoutes>
            <HomePage />
          </ProtectedRoutes>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="categories" element={<Cate />} />
        <Route path="vocabulary" element={<VocabularyPage />} />
        <Route path="flashcard" element={<FlashCardPage />} />
        <Route path="quiz" element={<QuizPage />} />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
