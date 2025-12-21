import { Routes, Route } from "react-router-dom";
import { ROUTE_PATHS } from "./Paths";

// Import pages
import Loading from "../Pages/Loading/Loading";
import Welcome from "../Pages/Welcome/Welcome";
import Login from "../Pages/Login/Login";
import Register from "../Pages/Register/Register";
import Home from "../Pages/Home/Home";
import MyCourses from "../Pages/MyCourses/MyCourses";
import Profile from "../Pages/Profile/Profile";
import EditProfile from "../Pages/Profile/EditProfile";
import ChangePassword from "../Pages/Profile/ChangePassword";
import OTP from "../Pages/OtpRegister/OTP";
import ForgotPassword from "../Pages/ForgotPassword/ForgotPassword";
import OtpResetPassword from "../Pages/OtpResetPassword/OtpResetPassword";
import ResetPassword from "../Pages/ResetPassword/ResetPassword";
import Payment from "../Pages/Payment/Payment";
import VocabularyReview from "../Pages/VocabularyReview/VocabularyReview";
import FlashCardReviewSession from "../Pages/FlashCardReviewSession/FlashCardReviewSession";
import VocabularyNotebook from "../Pages/VocabularyNotebook/VocabularyNotebook";
import GoogleCallback from "../Pages/AuthCallback/GoogleCallback";
import FacebookCallback from "../Pages/AuthCallback/FacebookCallback";
import CourseDetail from "../Pages/CourseDetail/CourseDetail";
import CourseLearn from "../Pages/CourseLearn/CourseLearn";
import LessonDetail from "../Pages/LessonDetail/LessonDetail";
import LectureDetail from "../Pages/LectureDetail/LectureDetail";
import FlashCardDetail from "../Pages/FlashCardDetail/FlashCardDetail";
import AssignmentDetail from "../Pages/AssignmentDetail/AssignmentDetail";
import QuizDetail from "../Pages/QuizDetail/QuizDetail";
import QuizResults from "../Pages/QuizResults/QuizResults";
import EssayDetail from "../Pages/EssayDetail/EssayDetail";
import PronunciationDetail from "../Pages/PronunciationDetail/PronunciationDetail";

/**
 * Application Routes
 * Tất cả các routes được định nghĩa tại đây
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path={ROUTE_PATHS.ROOT} element={<Loading />} />
      <Route path={ROUTE_PATHS.WELCOME} element={<Welcome />} />
      <Route path={ROUTE_PATHS.LOGIN} element={<Login />} />
      <Route path={ROUTE_PATHS.REGISTER} element={<Register />} />
      <Route path={ROUTE_PATHS.OTP} element={<OTP />} />
      <Route path={ROUTE_PATHS.FORGOT_PASSWORD} element={<ForgotPassword />} />
      <Route path={ROUTE_PATHS.RESET_OTP} element={<OtpResetPassword />} />
      <Route path={ROUTE_PATHS.RESET_PASSWORD} element={<ResetPassword />} />
      
      {/* Auth callback routes */}
      <Route path={ROUTE_PATHS.GOOGLE_CALLBACK} element={<GoogleCallback />} />
      <Route path={ROUTE_PATHS.FACEBOOK_CALLBACK} element={<FacebookCallback />} />
      
      {/* Protected routes */}
      <Route path={ROUTE_PATHS.HOME} element={<Home />} />
      <Route path={ROUTE_PATHS.MY_COURSES} element={<MyCourses />} />
      <Route path={ROUTE_PATHS.PROFILE} element={<Profile />} />
      <Route path={ROUTE_PATHS.PROFILE_EDIT} element={<EditProfile />} />
      <Route path={ROUTE_PATHS.PROFILE_CHANGE_PASSWORD} element={<ChangePassword />} />
      <Route path={ROUTE_PATHS.PAYMENT} element={<Payment />} />
      <Route path={ROUTE_PATHS.VOCABULARY_REVIEW} element={<VocabularyReview />} />
      <Route path="/vocabulary-review/session" element={<FlashCardReviewSession />} />
      <Route path={ROUTE_PATHS.VOCABULARY_NOTEBOOK} element={<VocabularyNotebook />} />
      
      {/* Course routes - specific routes first */}
      <Route path="/course/:courseId/lesson/:lessonId/module/:moduleId/lecture/:lectureId" element={<LectureDetail />} />
      <Route path="/course/:courseId/lesson/:lessonId/module/:moduleId/flashcards" element={<FlashCardDetail />} />
      <Route path="/course/:courseId/lesson/:lessonId/module/:moduleId/pronunciation" element={<PronunciationDetail />} />
      <Route path="/course/:courseId/lesson/:lessonId/module/:moduleId/assignment" element={<AssignmentDetail />} />
      <Route path="/course/:courseId/lesson/:lessonId/module/:moduleId/quiz/:quizId/attempt/:attemptId/results" element={<QuizResults />} />
      <Route path="/course/:courseId/lesson/:lessonId/module/:moduleId/quiz/:quizId/attempt/:attemptId" element={<QuizDetail />} />
      <Route path="/course/:courseId/lesson/:lessonId/module/:moduleId/essay/:essayId" element={<EssayDetail />} />
      <Route path="/course/:courseId/lesson/:lessonId/module/:moduleId" element={<LectureDetail />} />
      
      {/* General course routes */}
      <Route path="/course/:courseId" element={<CourseDetail />} />
      <Route path="/course/:courseId/learn" element={<CourseLearn />} />
      <Route path="/course/:courseId/lesson/:lessonId" element={<LessonDetail />} />
    </Routes>
  );
}

