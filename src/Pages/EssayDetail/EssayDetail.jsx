import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import MainHeader from "../../Components/Header/MainHeader";
import NotificationModal from "../../Components/Common/NotificationModal/NotificationModal";
import ConfirmModal from "../../Components/Common/ConfirmModal/ConfirmModal";
import { essayService } from "../../Services/essayService";
import { essaySubmissionService } from "../../Services/essaySubmissionService";
import { fileService } from "../../Services/fileService";
import { moduleService } from "../../Services/moduleService";
import { courseService } from "../../Services/courseService";
import { lessonService } from "../../Services/lessonService";
import { FaFileUpload, FaTimes, FaEdit, FaClock, FaCheckCircle, FaTimesCircle, FaVolumeUp } from "react-icons/fa";
import "./EssayDetail.css";

export default function EssayDetail() {
    const { courseId, lessonId, moduleId, essayId } = useParams();
    const navigate = useNavigate();

    const [essay, setEssay] = useState(null);
    const [course, setCourse] = useState(null);
    const [lesson, setLesson] = useState(null);
    const [module, setModule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);

    // Submission state
    const [currentSubmission, setCurrentSubmission] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Form state
    const [textContent, setTextContent] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [attachmentTempKey, setAttachmentTempKey] = useState(null);
    const [attachmentType, setAttachmentType] = useState(null);
    const [existingAttachmentUrl, setExistingAttachmentUrl] = useState(null);

    const [notification, setNotification] = useState({ isOpen: false, type: "info", message: "" });
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const fileInputRef = useRef(null);
    const moduleStartedRef = useRef(false);
    const audioRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError("");

                // Gọi API hoàn thành module khi vào trang essay
                const parsedModuleId = typeof moduleId === 'string' ? parseInt(moduleId) : moduleId;
                if (parsedModuleId && !isNaN(parsedModuleId) && !moduleStartedRef.current) {
                    try {
                        await moduleService.startModule(parsedModuleId);
                        moduleStartedRef.current = true;
                        console.log(`Module ${parsedModuleId} started successfully`);
                    } catch (err) {
                        console.error("Error starting module:", err);
                    }
                }

                // Fetch course info
                const courseResponse = await courseService.getCourseById(courseId);
                if (courseResponse.data?.success && courseResponse.data?.data) {
                    setCourse(courseResponse.data.data);
                }

                // Fetch lesson info
                const lessonResponse = await lessonService.getLessonById(lessonId);
                if (lessonResponse.data?.success && lessonResponse.data?.data) {
                    setLesson(lessonResponse.data.data);
                }

                // Fetch module info
                const moduleResponse = await moduleService.getModuleById(moduleId);
                if (moduleResponse.data?.success && moduleResponse.data?.data) {
                    setModule(moduleResponse.data.data);
                }

                // Fetch essay info
                if (essayId) {
                    const essayResponse = await essayService.getById(essayId);
                    if (essayResponse.data?.success && essayResponse.data?.data) {
                        setEssay(essayResponse.data.data);

                        // Check if user has already submitted this essay
                        try {
                            const statusResponse = await essaySubmissionService.getSubmissionStatus(essayId);
                            if (statusResponse?.data?.success && statusResponse?.data?.data) {
                                const submissionData = statusResponse.data.data;
                                const submissionId = submissionData?.submissionId || submissionData?.SubmissionId;

                                if (submissionId) {
                                    // Fetch full submission details
                                    const submissionResponse = await essaySubmissionService.getById(submissionId);
                                    if (submissionResponse?.data?.success && submissionResponse?.data?.data) {
                                        const submission = submissionResponse.data.data;
                                        if (submission) {
                                            setCurrentSubmission(submission);

                                            // Load submission data into form
                                            const content = submission?.textContent || submission?.TextContent || "";
                                            setTextContent(content);

                                            // Load attachment if exists
                                            const attachmentUrl = submission?.attachmentUrl || submission?.AttachmentUrl;
                                            if (attachmentUrl) {
                                                setExistingAttachmentUrl(attachmentUrl);
                                            }

                                            console.log("✅ [EssayDetail] Loaded existing submission:", submission);
                                        }
                                    }
                                }
                            }
                        } catch (statusErr) {
                            // If no submission exists, that's fine - user hasn't submitted yet
                            console.log("ℹ️ [EssayDetail] No existing submission found:", statusErr);
                        }
                    } else {
                        setError(essayResponse.data?.message || "Không thể tải thông tin essay");
                    }
                }
            } catch (err) {
                console.error("Error fetching essay data:", err);
                setError("Không thể tải dữ liệu essay");
            } finally {
                setLoading(false);
            }
        };

        if (moduleId && essayId) {
            fetchData();
        }
    }, [moduleId, essayId, courseId, lessonId]);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 10MB for documents)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                setNotification({
                    isOpen: true,
                    type: "error",
                    message: "File quá lớn. Kích thước tối đa là 10MB."
                });
                return;
            }

            // Validate file type (only text/word documents)
            const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.docm', '.dotx', '.dotm'];
            const fileName = file.name.toLowerCase();
            const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

            if (!hasValidExtension) {
                setNotification({
                    isOpen: true,
                    type: "error",
                    message: "Chỉ chấp nhận file PDF, DOC, DOCX, TXT, DOCM, DOTX, DOTM"
                });
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                return;
            }

            setSelectedFile(file);
            setAttachmentTempKey(null); // Reset temp key when new file is selected
            setAttachmentType(file.type || 'application/octet-stream'); // Default type if not detected

            // No preview for text/word files
            setFilePreview(null);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        setAttachmentTempKey(null);
        setAttachmentType(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleAudioClick = async (e) => {
        e.stopPropagation();
        const audioUrl = essay?.audioUrl || essay?.AudioUrl;
        if (!audioUrl) {
            console.warn("No audio URL provided");
            return;
        }

        try {
            // Stop any currently playing audio
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
                audioRef.current = null;
            }
            
            // Try fetching audio as blob first (to bypass CORS and handle 403)
            // Similar to FlashCardViewer approach
            try {
                const response = await fetch(audioUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'audio/mpeg, audio/*',
                    },
                    mode: 'cors',
                    credentials: 'include', // Include credentials (cookies/auth headers) for authenticated requests
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                const audio = new Audio(blobUrl);
                
                audio.onended = () => {
                    // Clean up blob URL when audio ends
                    URL.revokeObjectURL(blobUrl);
                    audioRef.current = null;
                };
                
                audio.onerror = (err) => {
                    console.error("Error playing audio from blob:", err);
                    URL.revokeObjectURL(blobUrl);
                    audioRef.current = null;
                    setNotification({
                        isOpen: true,
                        type: "error",
                        message: "Không thể phát âm thanh. Vui lòng thử lại."
                    });
                };
                
                audioRef.current = audio;
                await audio.play();
                console.log("Audio playing successfully via blob");
            } catch (fetchError) {
                // If fetch fails (403, CORS, etc.), try direct audio URL as fallback
                console.log("Fetch failed, trying direct audio URL:", fetchError);
                try {
                    const audio = new Audio(audioUrl);
                    audioRef.current = audio;
                    
                    // Set crossOrigin to anonymous to allow CORS
                    audio.crossOrigin = "anonymous";
                    
                    audio.onended = () => {
                        audioRef.current = null;
                    };
                    
                    audio.onerror = (err) => {
                        console.error("Error playing audio from direct URL:", err);
                        audioRef.current = null;
                        setNotification({
                            isOpen: true,
                            type: "error",
                            message: "Không thể phát âm thanh. Vui lòng thử lại."
                        });
                    };
                    
                    await audio.play();
                    console.log("Audio playing successfully via direct URL");
                } catch (directError) {
                    console.error("Both blob fetch and direct URL failed:", directError);
                    setNotification({
                        isOpen: true,
                        type: "error",
                        message: "Không thể phát âm thanh. Vui lòng thử lại."
                    });
                }
            }
        } catch (err) {
            console.error("Error playing audio:", err);
            console.error("Error name:", err.name);
            console.error("Error message:", err.message);
            console.error("Audio URL:", audioUrl);
            setNotification({
                isOpen: true,
                type: "error",
                message: "Không thể phát âm thanh. Vui lòng thử lại."
            });
        }
    };

    const handleUploadFile = async () => {
        if (!selectedFile) return;

        try {
            setUploadingFile(true);
            console.log("📤 [EssayDetail] Uploading file to temp storage...");

            // Upload file to temp storage
            const uploadResponse = await fileService.uploadTempFile(
                selectedFile,
                "essay-attachments",
                "temp"
            );

            console.log("📥 [EssayDetail] Upload response:", uploadResponse.data);

            if (uploadResponse.data?.success && uploadResponse.data?.data) {
                // Backend trả về ResultUploadDto với PascalCase: TempKey, ImageUrl, ImageType
                const resultData = uploadResponse.data.data;
                const tempKey = resultData.TempKey || resultData.tempKey;
                const imageUrl = resultData.ImageUrl || resultData.imageUrl;
                const imageType = resultData.ImageType || resultData.imageType || selectedFile.type;

                if (!tempKey) {
                    throw new Error("Không nhận được TempKey từ server");
                }

                setAttachmentTempKey(tempKey);

                // Backend validator yêu cầu MIME type chính xác:
                // - PDF: application/pdf
                // - DOC: application/msword
                // - DOCX: application/vnd.openxmlformats-officedocument.wordprocessingml.document
                const extension = selectedFile?.name?.split('.').pop()?.toLowerCase();

                // Type mapping theo backend validator (CreateEssaySubmissionDtoValidator)
                const typeMap = {
                    'pdf': 'application/pdf',
                    'doc': 'application/msword',
                    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    // Các loại khác không được backend chấp nhận, nhưng để an toàn vẫn map
                    'txt': 'text/plain',
                    'docm': 'application/vnd.ms-word.document.macroEnabled.12',
                    'dotx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
                    'dotm': 'application/vnd.ms-word.template.macroEnabled.12'
                };

                // Ưu tiên dùng type từ mapping, nếu không có thì dùng imageType từ server
                let finalAttachmentType = typeMap[extension];

                // Nếu không có trong mapping, kiểm tra imageType từ server
                if (!finalAttachmentType) {
                    // Kiểm tra nếu imageType từ server là MIME type hợp lệ cho backend
                    if (imageType) {
                        // Nếu là MIME type đầy đủ cho docx
                        if (imageType.includes('vnd.openxmlformats-officedocument.wordprocessingml.document')) {
                            finalAttachmentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                        } else if (imageType === 'application/msword' || imageType === 'application/pdf') {
                            finalAttachmentType = imageType;
                        } else {
                            // Fallback: dùng type từ file nếu hợp lệ
                            finalAttachmentType = imageType;
                        }
                    } else {
                        // Fallback cuối cùng
                        finalAttachmentType = 'application/octet-stream';
                    }
                }

                setAttachmentType(finalAttachmentType);

                console.log("✅ [EssayDetail] File uploaded successfully:", {
                    tempKey,
                    imageUrl,
                    imageType: finalAttachmentType,
                    originalImageType: imageType,
                    fileName: selectedFile?.name || "Unknown"
                });

                setNotification({
                    isOpen: true,
                    type: "success",
                    message: `Upload file "${selectedFile?.name || "file"}" thành công!`
                });
            } else {
                const errorMessage = uploadResponse.data?.message || "Không thể upload file";
                throw new Error(errorMessage);
            }
        } catch (err) {
            console.error("❌ [EssayDetail] Error uploading file:", err);
            setNotification({
                isOpen: true,
                type: "error",
                message: err.response?.data?.message || "Không thể upload file. Vui lòng thử lại."
            });
        } finally {
            setUploadingFile(false);
        }
    };

    const handleSubmitEssay = async () => {
        if (!essay) {
            setNotification({
                isOpen: true,
                type: "error",
                message: "Không tìm thấy thông tin essay"
            });
            return;
        }

        // Validate text content
        if (!textContent.trim()) {
            setNotification({
                isOpen: true,
                type: "error",
                message: "Vui lòng nhập nội dung essay"
            });
            return;
        }

        // If file is selected but not uploaded, upload it first (optional)
        if (selectedFile && !attachmentTempKey && !existingAttachmentUrl) {
            try {
                await handleUploadFile();
                // Wait a bit for upload to complete
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (err) {
                console.error("Error uploading file:", err);
                // Continue with submission even if file upload fails (file is optional)
            }
        }

        try {
            if (currentSubmission) {
                // Update existing submission
                setIsUpdating(true);
                const submissionId = currentSubmission.submissionId || currentSubmission.SubmissionId;

                // Backend expects PascalCase: TextContent, AttachmentTempKey, AttachmentType
                const updateData = {
                    TextContent: textContent.trim(),
                };

                // Only add attachment fields if new file is uploaded
                if (attachmentTempKey) {
                    updateData.AttachmentTempKey = attachmentTempKey;
                }
                if (attachmentType) {
                    updateData.AttachmentType = attachmentType;
                }

                console.log("📤 [EssayDetail] Updating submission...");
                console.log("📝 [EssayDetail] Update data (PascalCase):", updateData);

                const updateResponse = await essaySubmissionService.update(submissionId, updateData);
                console.log("📥 [EssayDetail] Update response:", updateResponse.data);

                if (updateResponse.data?.success) {
                    setNotification({
                        isOpen: true,
                        type: "success",
                        message: "Cập nhật bài essay thành công!"
                    });

                    // Reload submission data
                    const submissionResponse = await essaySubmissionService.getById(submissionId);
                    if (submissionResponse.data?.success && submissionResponse.data?.data) {
                        setCurrentSubmission(submissionResponse.data.data);
                        setExistingAttachmentUrl(submissionResponse.data.data.attachmentUrl || submissionResponse.data.data.AttachmentUrl);
                        setAttachmentTempKey(null);
                        setSelectedFile(null);
                    }

                    // Navigate back to assignment page after 2 seconds
                    setTimeout(() => {
                        navigate(`/course/${courseId}/lesson/${lessonId}/module/${moduleId}/assignment`);
                    }, 2000);
                } else {
                    setNotification({
                        isOpen: true,
                        type: "error",
                        message: updateResponse.data?.message || "Không thể cập nhật bài essay"
                    });
                }
            } else {
                // Submit new submission
                setSubmitting(true);

                // Backend expects PascalCase: EssayId, TextContent, AttachmentTempKey, AttachmentType
                const submissionData = {
                    EssayId: essay.essayId || essay.EssayId,
                    TextContent: textContent.trim(),
                };

                // Only add attachment fields if they exist
                if (attachmentTempKey) {
                    submissionData.AttachmentTempKey = attachmentTempKey;
                }
                if (attachmentType) {
                    submissionData.AttachmentType = attachmentType;
                }

                console.log("📤 [EssayDetail] Submitting essay...");
                console.log("📝 [EssayDetail] Submission data (PascalCase):", submissionData);

                const submitResponse = await essaySubmissionService.submit(submissionData);
                console.log("📥 [EssayDetail] Submit response:", submitResponse.data);

                if (submitResponse.data?.success) {
                    setNotification({
                        isOpen: true,
                        type: "success",
                        message: "Nộp bài essay thành công!"
                    });

                    // Navigate back to assignment page after 2 seconds
                    setTimeout(() => {
                        navigate(`/course/${courseId}/lesson/${lessonId}/module/${moduleId}/assignment`);
                    }, 2000);
                } else {
                    setNotification({
                        isOpen: true,
                        type: "error",
                        message: submitResponse.data?.message || "Không thể nộp bài essay"
                    });
                }
            }
        } catch (err) {
            console.error("❌ [EssayDetail] Error submitting/updating essay:", err);

            // Log full error response
            if (err.response?.data) {
                console.error("❌ [EssayDetail] Full error response:", err.response.data);
                try {
                    console.error("❌ [EssayDetail] Error response (stringified):", JSON.stringify(err.response.data, null, 2));
                } catch (e) {
                    console.error("❌ [EssayDetail] Could not stringify error response");
                }
            }

            // Extract error message from backend response
            let errorMessage = currentSubmission
                ? "Không thể cập nhật bài essay. Vui lòng thử lại."
                : "Không thể nộp bài essay. Vui lòng thử lại.";

            if (err.response?.data) {
                const responseData = err.response.data;

                // Check for validation errors (FluentValidation format)
                if (responseData.errors) {
                    const validationErrors = Object.values(responseData.errors).flat();
                    errorMessage = validationErrors.join(", ") || errorMessage;
                } else if (responseData.title) {
                    // ASP.NET Core ProblemDetails format
                    errorMessage = responseData.title || errorMessage;
                    if (responseData.errors) {
                        const validationErrors = Object.values(responseData.errors).flat();
                        if (validationErrors.length > 0) {
                            errorMessage = validationErrors.join(", ");
                        }
                    }
                } else if (responseData.message) {
                    errorMessage = responseData.message;
                } else if (typeof responseData === 'string') {
                    errorMessage = responseData;
                }
            }

            setNotification({
                isOpen: true,
                type: "error",
                message: errorMessage
            });
        } finally {
            setSubmitting(false);
            setIsUpdating(false);
            setShowSubmitModal(false);
        }
    };

    const handleDeleteSubmission = async () => {
        if (!currentSubmission) return;

        try {
            setIsDeleting(true);
            const submissionId = currentSubmission.submissionId || currentSubmission.SubmissionId;

            console.log("🗑️ [EssayDetail] Deleting submission:", submissionId);

            const deleteResponse = await essaySubmissionService.delete(submissionId);
            console.log("📥 [EssayDetail] Delete response:", deleteResponse.data);

            if (deleteResponse.data?.success) {
                setNotification({
                    isOpen: true,
                    type: "success",
                    message: "Xóa bài nộp thành công!"
                });

                // Reset form
                setCurrentSubmission(null);
                setTextContent("");
                setSelectedFile(null);
                setFilePreview(null);
                setAttachmentTempKey(null);
                setAttachmentType(null);
                setExistingAttachmentUrl(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } else {
                setNotification({
                    isOpen: true,
                    type: "error",
                    message: deleteResponse.data?.message || "Không thể xóa bài nộp"
                });
            }
        } catch (err) {
            console.error("❌ [EssayDetail] Error deleting submission:", err);
            setNotification({
                isOpen: true,
                type: "error",
                message: err.response?.data?.message || "Không thể xóa bài nộp. Vui lòng thử lại."
            });
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Không có";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
    };

    const handleBackClick = () => {
        navigate(`/course/${courseId}/lesson/${lessonId}/module/${moduleId}/assignment`);
    };

    if (loading) {
        return (
            <>
                <MainHeader />
                <div className="essay-detail-container">
                    <div className="loading-message">Đang tải...</div>
                </div>
            </>
        );
    }

    if (error && !essay) {
        return (
            <>
                <MainHeader />
                <div className="essay-detail-container">
                    <div className="error-message">{error}</div>
                    <div style={{ marginTop: "20px", textAlign: "center" }}>
                        <Button variant="primary" onClick={handleBackClick}>
                            Quay lại
                        </Button>
                    </div>
                </div>
            </>
        );
    }

    const essayTitle = essay?.title || essay?.Title || "Essay";
    const courseTitle = course?.title || course?.Title || "Khóa học";
    const lessonTitle = lesson?.title || lesson?.Title || "Bài học";
    const moduleName = module?.name || module?.Name || "Module";

    // Safety check: ensure all required objects exist before rendering
    if (!essay) {
        return (
            <>
                <MainHeader />
                <div className="essay-detail-container">
                    <div className="loading-message">Đang tải...</div>
                </div>
            </>
        );
    }

    return (
        <>
            <MainHeader />
            <div className="essay-detail-container">
                <Container fluid>
                    <Row>
                        <Col>
                            <div className="essay-breadcrumb">
                                <span onClick={() => navigate("/my-courses")} className="breadcrumb-link">
                                    Khóa học của tôi
                                </span>
                                <span className="breadcrumb-separator">/</span>
                                <span onClick={() => navigate(`/course/${courseId}`)} className="breadcrumb-link">
                                    {courseTitle}
                                </span>
                                <span className="breadcrumb-separator">/</span>
                                <span onClick={() => navigate(`/course/${courseId}/learn`)} className="breadcrumb-link">
                                    Lesson
                                </span>
                                <span className="breadcrumb-separator">/</span>
                                <span onClick={() => navigate(`/course/${courseId}/lesson/${lessonId}`)} className="breadcrumb-link">
                                    {lessonTitle}
                                </span>
                                <span className="breadcrumb-separator">/</span>
                                <span className="breadcrumb-current">{essayTitle}</span>
                            </div>
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <div className="essay-header">
                                <div className="essay-title-wrapper">
                                    <h1 className="essay-title">{essayTitle}</h1>
                                    {essay?.audioUrl && (
                                        <button 
                                            className="essay-audio-icon-btn"
                                            onClick={handleAudioClick}
                                            title="Nghe đề bài"
                                        >
                                            <FaVolumeUp />
                                        </button>
                                    )}
                                </div>
                                {essay?.description && (
                                    <p className="essay-description">{essay.description || essay.Description}</p>
                                )}
                                {essay?.imageUrl && (
                                    <div className="essay-image-container">
                                        <img 
                                            src={essay.imageUrl} 
                                            alt={essayTitle || "Essay image"} 
                                            className="essay-image"
                                        />
                                    </div>
                                )}
                            </div>
                        </Col>
                    </Row>

                    <Row>
                        <Col lg={8}>
                            <div className="essay-form-section">
                                <h2 className="section-title">
                                    {currentSubmission ? "Cập nhật bài Essay" : "Nộp bài Essay"}
                                </h2>

                                {currentSubmission && (
                                    <div className="alert alert-info mb-3" role="alert">
                                        <FaCheckCircle className="me-2" />
                                        Bạn đã nộp bài essay này. Bạn có thể cập nhật hoặc xóa bài nộp.
                                        {currentSubmission.submittedAt && (
                                            <div className="mt-2">
                                                <small>Nộp lúc: {formatDate(currentSubmission.submittedAt || currentSubmission.SubmittedAt)}</small>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <Form>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="form-label">
                                            <FaEdit className="label-icon" />
                                            Nội dung Essay <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={12}
                                            value={textContent}
                                            onChange={(e) => setTextContent(e.target.value)}
                                            placeholder="Nhập nội dung essay của bạn ở đây..."
                                            className="essay-textarea"
                                        />
                                        <Form.Text className="text-muted">
                                            Số ký tự: {textContent.length}
                                        </Form.Text>
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="form-label">
                                            <FaFileUpload className="label-icon" />
                                            File đính kèm (tùy chọn)
                                        </Form.Label>
                                        <div className="file-upload-section">
                                            {existingAttachmentUrl && !selectedFile && (
                                                <div className="existing-file-section mb-3">
                                                    <div className="file-preview-card">
                                                        <div className="file-preview-info">
                                                            <FaFileUpload className="file-icon" />
                                                            <div className="file-info">
                                                                <div className="file-name">File đính kèm hiện tại</div>
                                                                <div className="file-size">
                                                                    <a href={existingAttachmentUrl} target="_blank" rel="noopener noreferrer" className="text-primary">
                                                                        Xem file
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="file-actions">
                                                            <span className="upload-success">
                                                                <FaCheckCircle /> Đã có file
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedFile ? (
                                                <div className="file-preview-section">
                                                    <div className="file-preview-card">
                                                        <div className="file-preview-info">
                                                            <FaFileUpload className="file-icon" />
                                                            <div className="file-info">
                                                                <div className="file-name">{selectedFile?.name || "Unknown file"}</div>
                                                                <div className="file-size">{formatFileSize(selectedFile?.size || 0)}</div>
                                                            </div>
                                                        </div>
                                                        {filePreview && (
                                                            <div className="file-preview-image">
                                                                <img src={filePreview} alt="Preview" />
                                                            </div>
                                                        )}
                                                        <div className="file-actions">
                                                            {!attachmentTempKey && (
                                                                <Button
                                                                    variant="primary"
                                                                    size="sm"
                                                                    onClick={handleUploadFile}
                                                                    disabled={uploadingFile}
                                                                >
                                                                    {uploadingFile ? "Đang upload..." : "Upload file"}
                                                                </Button>
                                                            )}
                                                            {attachmentTempKey && (
                                                                <span className="upload-success">
                                                                    <FaCheckCircle /> Đã upload
                                                                </span>
                                                            )}
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={handleRemoveFile}
                                                            >
                                                                <FaTimes /> Xóa
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="file-upload-area">
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        id="file-input"
                                                        className="file-input"
                                                        onChange={handleFileSelect}
                                                        accept=".pdf,.doc,.docx,.txt,.docm,.dotx,.dotm"
                                                    />
                                                    <label htmlFor="file-input" className="file-upload-label">
                                                        <FaFileUpload className="upload-icon" />
                                                        <span>Chọn file để upload</span>
                                                        <small>(PDF, DOC, DOCX, TXT, DOCM, DOTX, DOTM - tối đa 10MB)</small>
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    </Form.Group>

                                    <div className="essay-submit-section d-flex gap-2">
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            className="submit-essay-btn"
                                            onClick={() => setShowSubmitModal(true)}
                                            disabled={(submitting || isUpdating) || !textContent.trim()}
                                            style={{
                                                backgroundColor: '#41d6e3',
                                                borderColor: '#41d6e3',
                                                color: '#fff'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!submitting && !isUpdating && textContent.trim()) {
                                                    e.target.style.backgroundColor = '#35b8c4';
                                                    e.target.style.borderColor = '#35b8c4';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!submitting && !isUpdating && textContent.trim()) {
                                                    e.target.style.backgroundColor = '#41d6e3';
                                                    e.target.style.borderColor = '#41d6e3';
                                                }
                                            }}
                                        >
                                            {isUpdating ? "Đang cập nhật..." : submitting ? "Đang nộp bài..." : currentSubmission ? "Cập nhật bài" : "Nộp bài"}
                                        </Button>
                                        {currentSubmission && (
                                            <Button
                                                variant="outline-danger"
                                                size="lg"
                                                onClick={() => setShowDeleteModal(true)}
                                                disabled={isDeleting}
                                            >
                                                {isDeleting ? "Đang xóa..." : "Xóa bài"}
                                            </Button>
                                        )}
                                    </div>
                                </Form>
                            </div>
                        </Col>

                        <Col lg={4}>
                            <div className="essay-info-section">
                                <h3 className="info-section-title">Thông tin Essay</h3>

                                <div className="info-item">
                                    <FaClock className="info-icon" />
                                    <div className="info-content">
                                        <div className="info-label">Hạn nộp</div>
                                        <div className="info-value">
                                            {essay?.assessment?.dueAt
                                                ? formatDate(essay?.assessment?.dueAt)
                                                : "Không có hạn nộp"}
                                        </div>
                                    </div>
                                </div>

                                <div className="info-item">
                                    <FaCheckCircle className="info-icon" />
                                    <div className="info-content">
                                        <div className="info-label">Trạng thái</div>
                                        <div className="info-value">
                                            {currentSubmission ? (
                                                <span className="text-success">
                                                    <FaCheckCircle className="me-1" />
                                                    Đã nộp
                                                </span>
                                            ) : (
                                                "Chưa nộp"
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {currentSubmission && currentSubmission.submittedAt && (
                                    <div className="info-item">
                                        <FaClock className="info-icon" />
                                        <div className="info-content">
                                            <div className="info-label">Thời gian nộp</div>
                                            <div className="info-value">
                                                {formatDate(currentSubmission.submittedAt || currentSubmission.SubmittedAt)}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {essay?.description && (
                                    <div className="info-description">
                                        <h4>Mô tả</h4>
                                        <p>{essay.description || essay.Description}</p>
                                    </div>
                                )}
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            <ConfirmModal
                isOpen={showSubmitModal}
                onClose={() => setShowSubmitModal(false)}
                onConfirm={handleSubmitEssay}
                title={currentSubmission ? "Xác nhận cập nhật bài" : "Xác nhận nộp bài"}
                message={currentSubmission
                    ? "Bạn có chắc chắn muốn cập nhật bài essay này?"
                    : "Bạn có chắc chắn muốn nộp bài essay này? Sau khi nộp, bạn có thể cập nhật hoặc xóa bài nộp."
                }
                confirmText={currentSubmission ? "Cập nhật bài" : "Nộp bài"}
                cancelText="Hủy"
            />

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteSubmission}
                title="Xác nhận xóa bài"
                message="Bạn có chắc chắn muốn xóa bài nộp này? Hành động này không thể hoàn tác."
                confirmText="Xóa bài"
                cancelText="Hủy"
                type="danger"
            />

            <NotificationModal
                isOpen={notification.isOpen}
                onClose={() => setNotification({ ...notification, isOpen: false })}
                type={notification.type}
                message={notification.message}
            />
        </>
    );
}

