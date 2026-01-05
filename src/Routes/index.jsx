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
import PaymentSuccess from "../Pages/Payment/PaymentSuccess";
import PaymentFailed from "../Pages/Payment/PaymentFailed";
import PaymentHistory from "../Pages/PaymentHistory/PaymentHistory";
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
import AssessmentDetail from "../Pages/AssessmentDetail/AssessmentDetail";
import QuizDetail from "../Pages/QuizDetail/QuizDetail";
import QuizResults from "../Pages/QuizResults/QuizResults";
import EssayDetail from "../Pages/EssayDetail/EssayDetail";
import PronunciationDetail from "../Pages/PronunciationDetail/PronunciationDetail";
import CourseManagement from "../Pages/Teacher/TeacherCourseManagement/CourseManagement";
import TeacherCourseDetail from "../Pages/Teacher/TeacherCourseDetail/TeacherCourseDetail";
import TeacherLessonDetail from "../Pages/Teacher/TeacherLessonDetail/TeacherLessonDetail";
import TeacherStudentManagement from "../Pages/Teacher/TeacherStudentManagement/TeacherStudentManagement";
import TeacherModuleLectureDetail from "../Pages/Teacher/TeacherModuleLectureDetail/TeacherModuleLectureDetail";
import EditLecture from "../Pages/Teacher/TeacherModuleLectureDetail/EditLecture";
import TeacherModuleFlashCardDetail from "../Pages/Teacher/TeacherModuleFlashCardDetail/TeacherModuleFlashCardDetail";
import TeacherQuizEssayManagement from "../Pages/Teacher/TeacherQuizEssayManagement/TeacherQuizEssayManagement";
import TeacherQuizSectionManagement from "../Pages/Teacher/TeacherQuizSectionManagement/TeacherQuizSectionManagement";
import TeacherQuestionManagement from "../Pages/Teacher/TeacherQuestionManagement/TeacherQuestionManagement";
import TeacherSubmissionManagement from "../Pages/Teacher/TeacherSubmissionManagement/TeacherSubmissionManagement";

// Admin Imports
import AdminLayout from "../Layouts/AdminLayout/AdminLayout";
import AdminDashboard from "../Pages/Admin/Dashboard/AdminDashboard";
import AdminCourseList from "../Pages/Admin/CourseManagement/AdminCourseList";
import AdminCourseDetail from "../Pages/Admin/CourseManagement/AdminCourseDetail";
import AdminStudentManagement from "../Pages/Admin/CourseManagement/AdminStudentManagement";
import AdminLessonDetail from "../Pages/Admin/AdminLessonDetail/AdminLessonDetail";
import AdminModuleLectureDetail from "../Pages/Admin/AdminModuleLectureDetail/AdminModuleLectureDetail";
import AdminModuleFlashCardDetail from "../Pages/Admin/AdminModuleFlashCardDetail/AdminModuleFlashCardDetail";
import AdminUserList from "../Pages/Admin/UserManagement/AdminUserList";
import AdminQuizEssayManagement from "../Pages/Admin/AdminQuizEssayManagement/AdminQuizEssayManagement";
import AdminQuizSectionManagement from "../Pages/Admin/AdminQuizSectionManagement/AdminQuizSectionManagement";
import AdminQuestionManagement from "../Pages/Admin/AdminQuestionManagement/AdminQuestionManagement";
import AdminSubmissionManagement from "../Pages/Admin/AdminSubmissionManagement/AdminSubmissionManagement";
import PackageManagement from "../Pages/Admin/PackageManagement/PackageManagement";
import AdminManagement from "../Pages/Admin/AdminManagement/AdminManagement";

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
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-failed" element={<PaymentFailed />} />
      <Route path={ROUTE_PATHS.PAYMENT_HISTORY} element={<PaymentHistory />} />
      <Route path={ROUTE_PATHS.VOCABULARY_REVIEW} element={<VocabularyReview />} />
      <Route path="/vocabulary-review/session" element={<FlashCardReviewSession />} />
      <Route path={ROUTE_PATHS.VOCABULARY_NOTEBOOK} element={<VocabularyNotebook />} />

      {/* Course routes - specific routes first */}
      <Route path="/course/:courseId/lesson/:lessonId/module/:moduleId/lecture/:lectureId" element={<LectureDetail />} />
      <Route path="/course/:courseId/lesson/:lessonId/module/:moduleId/flashcards" element={<FlashCardDetail />} />
      <Route path="/course/:courseId/lesson/:lessonId/module/:moduleId/pronunciation" element={<PronunciationDetail />} />
      <Route path="/course/:courseId/lesson/:lessonId/module/:moduleId/assignment/:assessmentId" element={<AssessmentDetail />} />
      <Route path="/course/:courseId/lesson/:lessonId/module/:moduleId/assignment" element={<AssignmentDetail />} />
      <Route path="/course/:courseId/lesson/:lessonId/module/:moduleId/quiz/:quizId/attempt/:attemptId/results" element={<QuizResults />} />
      <Route path="/course/:courseId/lesson/:lessonId/module/:moduleId/quiz/:quizId/attempt/:attemptId" element={<QuizDetail />} />
      <Route path="/course/:courseId/lesson/:lessonId/module/:moduleId/essay/:essayId" element={<EssayDetail />} />
      <Route path="/course/:courseId/lesson/:lessonId/module/:moduleId" element={<LectureDetail />} />

      {/* General course routes */}
      <Route path="/course/:courseId" element={<CourseDetail />} />
      <Route path="/course/:courseId/learn" element={<CourseLearn />} />
      <Route path="/course/:courseId/lesson/:lessonId" element={<LessonDetail />} />

      {/* Teacher routes */}
      <Route path="/teacher" element={<CourseManagement />} />
      <Route path="/teacher/account-management" element={<CourseManagement />} />
      <Route path="/teacher/submission-management" element={<TeacherSubmissionManagement />} />
      <Route path="/teacher/course-management" element={<CourseManagement />} />
      <Route path="/teacher/course/:courseId/students" element={<TeacherStudentManagement />} />
      <Route path="/teacher/course/:courseId/lesson/:lessonId" element={<TeacherLessonDetail />} />
      <Route path="/teacher/course/:courseId/lesson/:lessonId/module/:moduleId/create-lecture" element={<TeacherModuleLectureDetail />} />
      <Route path="/teacher/course/:courseId/lesson/:lessonId/module/:moduleId/lecture/:lectureId/edit" element={<EditLecture />} />
      <Route path="/teacher/course/:courseId/lesson/:lessonId/module/:moduleId/create-flashcard" element={<TeacherModuleFlashCardDetail />} />
      <Route path="/teacher/course/:courseId/lesson/:lessonId/module/:moduleId/edit-flashcard/:flashcardId" element={<TeacherModuleFlashCardDetail />} />
      <Route path="/teacher/course/:courseId/lesson/:lessonId/module/:moduleId/assessment/:assessmentId/manage" element={<TeacherQuizEssayManagement />} />
      <Route path="/teacher/course/:courseId/lesson/:lessonId/module/:moduleId/assessment/:assessmentId/quiz/:quizId/sections" element={<TeacherQuizSectionManagement />} />
      <Route path="/teacher/course/:courseId/lesson/:lessonId/module/:moduleId/assessment/:assessmentId/quiz/:quizId/section/:sectionId/questions" element={<TeacherQuestionManagement />} />
      <Route path="/teacher/course/:courseId/lesson/:lessonId/module/:moduleId/assessment/:assessmentId/quiz/:quizId/group/:groupId/questions" element={<TeacherQuestionManagement />} />
      <Route path="/teacher/course/:courseId" element={<TeacherCourseDetail />} />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="courses" element={<AdminCourseList />} />
        <Route path="courses/:courseId" element={<AdminCourseDetail />} />
        <Route path="courses/:courseId/students" element={<AdminStudentManagement />} />
        <Route path="courses/:courseId/lesson/:lessonId" element={<AdminLessonDetail />} />
        <Route path="courses/:courseId/lesson/:lessonId/module/:moduleId/lecture/create" element={<AdminModuleLectureDetail />} />
        <Route path="courses/:courseId/lesson/:lessonId/module/:moduleId/flashcard/create" element={<AdminModuleFlashCardDetail />} />
        <Route path="courses/:courseId/lesson/:lessonId/module/:moduleId/assessment/:assessmentId" element={<AdminQuizEssayManagement />} />
        <Route path="courses/:courseId/lesson/:lessonId/module/:moduleId/assessment/:assessmentId/quiz/:quizId/sections" element={<AdminQuizSectionManagement />} />
        <Route path="courses/:courseId/lesson/:lessonId/module/:moduleId/assessment/:assessmentId/quiz/:quizId/section/:sectionId/questions" element={<AdminQuestionManagement />} />
        <Route path="users" element={<AdminUserList />} />
        <Route path="packages" element={<PackageManagement />} />
        <Route path="admin-management" element={<AdminManagement />} />
        <Route path="finance" element={<AdminDashboard />} />
        <Route path="submission-management" element={<AdminSubmissionManagement />} />
      </Route>
    </Routes>
  );
}

