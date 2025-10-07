
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
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};
export default PublicRoutes;
