import React, { useState } from "react";
import { TextField, Button, Card, CardContent, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 
import Swal from "sweetalert2"; 
import Navbar from "../../components/common/Navbar"; 
const API_URL = "http://localhost:8080/users";
const RegisterPage: React.FC = () => {
  const navigate = useNavigate(); 

  //  State lưu dữ liệu form
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  //  State lưu lỗi validate
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  //  Cập nhật form và reset lỗi
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value }); // update field
    setErrors({ ...errors, [e.target.name]: "" }); // reset lỗi của field đó
  };

  //  Validate form trước submit
  const validate = () => {
    const newErrors = { firstName: "", lastName: "", email: "", password: "", confirmPassword: "" };
    // check bắt buộc nhập firstName và lastName
    if (!form.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required.";
    // validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) newErrors.email = "Email is required.";
    else if (!emailRegex.test(form.email)) newErrors.email = "Email is invalid.";
    // validate password: ít nhất 8 ký tự, có chữ hoa, chữ thường, số, ký tự đặc biệt
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!form.password) newErrors.password = "Password is required.";
    else if (!passwordRegex.test(form.password))
      newErrors.password = "Password must be at least 8 chars, include uppercase, lowercase, number & special.";
    // confirm password
    if (!form.confirmPassword) newErrors.confirmPassword = "Confirm password is required.";
    else if (form.confirmPassword !== form.password) newErrors.confirmPassword = "Passwords do not match.";

    setErrors(newErrors); // set lỗi vào state
    return Object.values(newErrors).every((err) => err === ""); // true nếu không còn lỗi
  };

  //  Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // chặn reload page

    if (!validate()) return; // nếu validate fail → dừng

    try {
      // 1. Lấy danh sách user hiện có
      const { data: users } = await axios.get(API_URL);
      // 2. Kiểm tra email tồn tại chưa
      if (users.find((u: any) => u.email === form.email)) {
        setErrors((prev) => ({ ...prev, email: "Email already exists!" }));
        return;
      }

      // 3. Thêm user mới vào server
      await axios.post(API_URL, {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        role: "user", // mặc định role là user
      });

      // 4. Hiển thị popup thành công và chuyển sang login
      Swal.fire({
        icon: "success",
        title: "Đăng ký thành công!",
      }).then(() => navigate("/login")); // navigate đến login page
    } catch (err) {
      Swal.fire({ icon: "error", title: "Đăng ký thất bại!", text: "Vui lòng thử lại." });
    }
  };

  return (
    <>
      {/* Navbar luôn hiển thị, activePage highlight button đang active */}
      <Navbar
        activePage="register"
        onChangePage={(page) => navigate(page === "login" ? "/login" : "/register")}
      />

      {/* Box chứa form */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <Card sx={{ width: 450, borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h5" fontWeight="bold" align="center" gutterBottom>
              Register
            </Typography>

            {/* form submit */}
            <form onSubmit={handleSubmit}>
              {/* First Name */}
              <TextField
                label="First Name"
                name="firstName"
                fullWidth
                margin="normal"
                value={form.firstName}
                onChange={handleChange}
                error={!!errors.firstName} // show red border nếu lỗi
                helperText={errors.firstName} // hiển thị text lỗi
              />

              {/* Last Name */}
              <TextField
                label="Last Name"
                name="lastName"
                fullWidth
                margin="normal"
                value={form.lastName}
                onChange={handleChange}
                error={!!errors.lastName}
                helperText={errors.lastName}
              />

              {/* Email */}
              <TextField
                label="Email"
                name="email"
                fullWidth
                margin="normal"
                value={form.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
              />

              {/* Password */}
              <TextField
                label="Password"
                name="password"
                type="password"
                fullWidth
                margin="normal"
                value={form.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
              />

              {/* Confirm Password */}
              <TextField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                fullWidth
                margin="normal"
                value={form.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
              />

              <Button type="submit" variant="contained" color="success" fullWidth sx={{ mt: 2 }}>
                Register
              </Button>
            </form>
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

export default RegisterPage; 
