import React from "react";
import { Form, Input, Button, Spin } from "antd";

import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hook/hooks";
import { loginUser } from "../../stores/slices/authSlice";

interface LoginFormProps {
  onSuccessRedirect?: string; // page redirect sau khi login
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccessRedirect = "/dashboard" }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector((state) => state.auth);

  const onFinish = async (values: any) => {
    try {
      const user = await dispatch(loginUser(values)).unwrap();
      navigate(onSuccessRedirect);
    } catch (err: any) {
      alert(err?.message || "Đăng nhập thất bại. Vui lòng thử lại!");
    }
  };

  return (
    <Form layout="vertical" onFinish={onFinish}>
      <Form.Item
        name="email"
        label="Email"
        rules={[{ required: true, message: "Email is required" }]}
      >
        <Input placeholder="Enter email" />
      </Form.Item>

      <Form.Item
        name="password"
        label="Password"
        rules={[{ required: true, message: "Password is required" }]}
      >
        <Input.Password placeholder="Enter password" />
      </Form.Item>

      <Button type="primary" htmlType="submit" block disabled={loading}>
        {loading ? <Spin /> : "Login"}
      </Button>
    </Form>
  );
};

export default LoginForm;