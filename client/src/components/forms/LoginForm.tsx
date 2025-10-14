import React from "react";
import { Form, Input, Button, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hook/hooks";
import { loginUser } from "../../stores/slices/authSlice";
interface LoginFormProps {
  onSuccessRedirect?: string;
}
const LoginForm: React.FC<LoginFormProps> = ({ onSuccessRedirect = "/dashboard" }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector((state) => state.auth); 
  const onFinish = async (values: any) => {
    try {
      const user = await dispatch(loginUser(values)).unwrap();
      // Nếu login thành công → chuyển trang
      navigate(onSuccessRedirect);
    } catch (err: any) {
      alert(err?.message || "Đăng nhập thất bại. Vui lòng thử lại!");
    }
  };

  return (
    <Form 
      layout="vertical" 
      onFinish={onFinish}          
      requiredMark={false}         
    >
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
        <Input.Password 
          placeholder="Enter password"
          visibilityToggle={false}
        />
      </Form.Item>

      <Button 
        type="primary" 
        htmlType="submit" 
        block 
        loading={loading} 
      >
        Login
      </Button>
    </Form>
  );
};

export default LoginForm;
