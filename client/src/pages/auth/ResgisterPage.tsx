import React, { useState } from "react";
import { TextField, Button, Card, CardContent, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Navbar from "../../components/common/Navbar";

const API_URL = "http://localhost:8080/users";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors = { firstName: "", lastName: "", email: "", password: "", confirmPassword: "" };
    if (!form.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required.";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) newErrors.email = "Email is required.";
    else if (!emailRegex.test(form.email)) newErrors.email = "Email is invalid.";

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!form.password) newErrors.password = "Password is required.";
    else if (!passwordRegex.test(form.password))
      newErrors.password = "Password must be at least 8 chars, include uppercase, lowercase, number & special.";

    if (!form.confirmPassword) newErrors.confirmPassword = "Confirm password is required.";
    else if (form.confirmPassword !== form.password) newErrors.confirmPassword = "Passwords do not match.";

    setErrors(newErrors);
    return Object.values(newErrors).every((err) => err === "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const { data: users } = await axios.get(API_URL);
      if (users.find((u: any) => u.email === form.email)) {
        setErrors((prev) => ({ ...prev, email: "Email already exists!" }));
        return;
      }
      await axios.post(API_URL, {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        role: "user",
      });

      Swal.fire({
        icon: "success",
        title: "Đăng ký thành công!",
      }).then(() => navigate("/login")); // tự chuyển sang login
    } catch (err) {
      Swal.fire({ icon: "error", title: "Đăng ký thất bại!", text: "Vui lòng thử lại." });
    }
  };

  return (
    <>
      {/* Navbar luôn hiển thị */}
      <Navbar activePage="register" onChangePage={(page) => navigate(page === "login" ? "/login" : "/register")} />

      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <Card sx={{ width: 450, borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h5" fontWeight="bold" align="center" gutterBottom>
              Register
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                label="First Name"
                name="firstName"
                fullWidth
                margin="normal"
                value={form.firstName}
                onChange={handleChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
              />
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