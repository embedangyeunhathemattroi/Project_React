import React from "react";
import { Card } from "antd";
import Navbar from "../../components/common/Navbar";
import LoginForm from "../../components/forms/LoginForm";
const LoginPage: React.FC = () => {
  return (
    <>   
      <Navbar
        activePage="login" 
        onChangePage={(page) => {
          window.location.href =
            page === "login" ? "/login" : "/register"; 
        }}
      />
      <Card
        title={<h2 style={{ textAlign: "center" }}>Login</h2>}
        style={{ maxWidth: 400, margin: "50px auto 0 auto" }}
      >
        <LoginForm />
      </Card>
    </>
  );
};
export default LoginPage;