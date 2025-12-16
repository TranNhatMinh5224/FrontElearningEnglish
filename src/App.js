import { BrowserRouter, Routes, Route } from "react-router-dom";
import Loading from "./Pages/Loading/Loading";
import Welcome from "./Pages/Welcome/Welcome";
import Login from "./Pages/Login/Login";
import Register from "./Pages/Register/Register";
import Home from "./Pages/Home/Home";
import MyCourses from "./Pages/MyCourses/MyCourses";
import Profile from "./Pages/Profile/Profile";
import EditProfile from "./Pages/Profile/EditProfile";
import ChangePassword from "./Pages/Profile/ChangePassword";
import OTP from "./Pages/OtpRegister/OTP";
import ForgotPassword from "./Pages/ForgotPassword/ForgotPassword";
import OtpResetPassword from "./Pages/OtpResetPassword/OtpResetPassword";
import ResetPassword from "./Pages/ResetPassword/ResetPassword";
import Payment from "./Pages/Payment/Payment";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Loading />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/my-courses" element={<MyCourses />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/profile/change-password" element={<ChangePassword />} />
        <Route path="/otp" element={<OTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-otp" element={<OtpResetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/payment" element={<Payment />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
