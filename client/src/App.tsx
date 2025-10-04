

// import React, { useState } from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import type { RootState } from "./stores/store";

// import QuizPage from "./pages/user/QuizPage";
// import Dashboard from "./pages/user/Dashboard";
// import FlashCardPage from "./pages/user/FlashcardPage";
// import VocabularyPage from "./pages/admin/VocabularyPage";
// import CategoriesPage from "./pages/admin/CategoryPage";

// import HomePage from "./pages/auth/HomePage";
// import LoginPage from "./pages/auth/LoginPage";
// import RegisterPage from "./pages/auth/ResgisterPage";


// const App: React.FC = () => {

//   const user = useSelector((state: RootState) => state.auth.user);
//   const isAuthenticated = !!user;
//   const [isAuth, setIsAuth] = useState("login")

//   return (
//     <Routes>
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/register" element={<RegisterPage />} />
//       {!isAuthenticated ? (
//         <Route path="/" element={<HomePage />}>
//           <Route index element={<LoginPage />} />
//           <Route path="login" element={<LoginPage />} />
//           <Route path="register" element={<RegisterPage />} />
//         </Route>
//       ) : (
//         <Route path="/" element={<HomePage />}>
//           <Route path="dashboard" element={<Dashboard />} />
//           <Route path="flashcard" element={<FlashCardPage />} />
//           <Route path="quiz" element={<QuizPage />} />
//           <Route path="categories" element={<CategoriesPage />} />
//           <Route path="vocabulary" element={<VocabularyPage />} />
//         </Route>
//       )}

//       {/* fallback */}
//       <Route
//         path="*"
//         element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />}
//       />
//     </Routes>
//   );
// };

// export default App;





// import React, { useState } from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import type { RootState } from "./stores/store";

// import QuizPage from "./pages/user/QuizPage";
// import Dashboard from "./pages/user/Dashboard";
// import FlashCardPage from "./pages/user/FlashcardPage";
// import VocabularyPage from "./pages/admin/VocabularyPage";
// import CategoriesPage from "./pages/admin/CategoryPage";

// import HomePage from "./pages/auth/HomePage";
// import LoginPage from "./pages/auth/LoginPage";
// import RegisterPage from "./pages/auth/ResgisterPage";


// const App: React.FC = () => {

//   const user = useSelector((state: RootState) => state.auth.user);
//   const isAuthenticated = !!user;
//   const [isAuth, setIsAuth] = useState("login")

//   return (
//     <Routes>
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/register" element={<RegisterPage />} />
//       {!isAuthenticated ? (
//         <Route path="/" element={<HomePage />}>
//           <Route index element={<LoginPage />} />
//           <Route path="login" element={<LoginPage />} />
//           <Route path="register" element={<RegisterPage />} />
//         </Route>
//       ) : (
//         <Route path="/" element={<HomePage />}>
//           <Route path="dashboard" element={<Dashboard />} />
//           <Route path="flashcard" element={<FlashCardPage />} />
//           <Route path="quiz" element={<QuizPage />} />
//           <Route path="categories" element={<CategoriesPage />} />
//           <Route path="vocabulary" element={<VocabularyPage />} />
//         </Route>
//       )}

//       {/* fallback */}
//       <Route
//         path="*"
//         element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />}
//       />
//     </Routes>
//   );
// };

// export default App;



// import React from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import type { RootState } from "./stores/store";

// import QuizPage from "./pages/user/QuizPage";
// import Dashboard from "./pages/user/Dashboard";
// import FlashCardPage from "./pages/user/FlashcardPage";
// import VocabularyPage from "./pages/admin/VocabularyPage";
// import CategoriesPage from "./pages/admin/CategoryPage";

// import HomePage from "./pages/auth/HomePage";
// import LoginPage from "./pages/auth/LoginPage";


// const App: React.FC = () => {
//   const user = useSelector((state: RootState) => state.auth.user);
//   const isAuthenticated = !!user;

//   return (
//     <Routes>
//       {/* Nếu chưa đăng nhập */}
//       {!isAuthenticated ? (
//         <>
//           <Route path="/" element={<HomePage />} />
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/register" element={<RegisterPage />} />
//         </>
//       ) : (
//         <>
//           {/* Nếu đã đăng nhập */}
//           <Route path="/" element={<Navigate to="/dashboard" replace />} />
//           <Route path="/dashboard" element={<Dashboard />} />
//           <Route path="/flashcard" element={<FlashCardPage />} />
//           <Route path="/quiz" element={<QuizPage />} />
//           <Route path="/categories" element={<CategoriesPage />} />
//           <Route path="/vocabulary" element={<VocabularyPage />} />
//         </>
//       )}

//       {/* fallback */}
//       <Route
//         path="*"
//         element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />}
//       />
//     </Routes>
//   );
// };

// export default App



// import React, { useState } from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import type { RootState } from "./stores/store";

// import QuizPage from "./pages/user/QuizPage";
// import Dashboard from "./pages/user/Dashboard";
// import FlashCardPage from "./pages/user/FlashcardPage";
// import VocabularyPage from "./pages/admin/VocabularyPage";
// import CategoriesPage from "./pages/admin/CategoryPage";

// import HomePage from "./pages/auth/HomePage";
// import LoginPage from "./pages/auth/LoginPage";
// import RegisterPage from "./pages/auth/ResgisterPage";


// const App: React.FC = () => {

//   const user = useSelector((state: RootState) => state.auth.user);
//   const isAuthenticated = !!user;
//   const [isAuth, setIsAuth] = useState("login")

//   return (
//     <Routes>
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/register" element={<RegisterPage />} />
//       {!isAuthenticated ? (
//         <Route path="/" element={<HomePage />}>
//           <Route index element={<LoginPage />} />
//           <Route path="login" element={<LoginPage />} />
//           <Route path="register" element={<RegisterPage />} />
//         </Route>
//       ) : (
//         <Route path="/" element={<HomePage />}>
//           <Route path="dashboard" element={<Dashboard />} />
//           <Route path="flashcard" element={<FlashCardPage />} />
//           <Route path="quiz" element={<QuizPage />} />
//           <Route path="categories" element={<CategoriesPage />} />
//           <Route path="vocabulary" element={<VocabularyPage />} />
//         </Route>
//       )}

//       {/* fallback */}
//       <Route
//         path="*"
//         element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />}
//       />
//     </Routes>
//   );
// };

// export default App;
import React from "react";
import AppRouter from "./components/common/routes/router";


const App: React.FC = () => {
  return <AppRouter />;
};

export default App;
