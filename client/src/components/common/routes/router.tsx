import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";


import ProtectedRoutes from "./protected.routes";
import PublicRoutes from "./public.routes";
import LoginPage from "../../../pages/auth/LoginPage";
import RegisterPage from "../../forms/RegisterForm";
import HomePage from "../../../pages/auth/HomePage";
import CategoriesPage from "../../../pages/admin/CategoryPage";
import Dashboard from "../../../pages/user/Dashboard";
import FlashCardPage from "../../../pages/user/FlashcardPage";
import VocabularyPage from "../../../pages/admin/VocabularyPage";
import QuizPage from "../../../pages/user/QuizPage";


const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
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

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoutes>
            <HomePage />
          </ProtectedRoutes>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="vocabulary" element={<VocabularyPage />} />
        <Route path="flashcard" element={<FlashCardPage />} />
        <Route path="quiz" element={<QuizPage />} />
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;