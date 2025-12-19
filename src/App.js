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
import VocabularyReview from "./Pages/VocabularyReview/VocabularyReview";
import GoogleCallback from "./Pages/AuthCallback/GoogleCallback";
import FacebookCallback from "./Pages/AuthCallback/FacebookCallback";
import CourseDetail from "./Pages/CourseDetail/CourseDetail";
import CourseLearn from "./Pages/CourseLearn/CourseLearn";


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
        <Route path="/vocabulary-review" element={<VocabularyReview />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route path="/auth/facebook/callback" element={<FacebookCallback />} />
        <Route path="/course/:courseId" element={<CourseDetail />} />
        <Route path="/course/:courseId/learn" element={<CourseLearn />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
