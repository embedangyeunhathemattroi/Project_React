// import React from "react";
// import { Navigate } from "react-router-dom"; // Dùng để chuyển hướng
// import { useSelector } from "react-redux";   // Dùng để lấy state từ Redux
// import type { RootState } from "../../../stores/store"; // Kiểu RootState của Redux

// // Props cho component PublicRoutes
// interface PublicRoutesProps {
//   children: React.ReactNode; // Các component con sẽ được render nếu user chưa đăng nhập
// }

// const PublicRoutes: React.FC<PublicRoutesProps> = ({ children }) => {
//   // Lấy thông tin user từ Redux state
//   const user = useSelector((state: RootState) => state.auth.user);

//   // Nếu user đã đăng nhập
//   if (user) {
//     // Chuyển hướng về /dashboard (hoặc trang chính), không cho truy cập login/register
//     return <Navigate to="/dashboard" replace />;
//   }

//   // Nếu chưa đăng nhập, render các component con (Login, Register)
//   return <>{children}</>;
// };

// export default PublicRoutes;
import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../stores/store";


interface PublicRoutesProps {
  children: React.ReactNode;
}

const PublicRoutes: React.FC<PublicRoutesProps> = ({ children }) => {
  const user = useSelector((state: RootState) => state.auth.user);

  if (user) {
    // Nếu đã đăng nhập, không cho truy cập login/register, chuyển hướng về dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicRoutes;