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
import { FaFileUpload, FaTimes, FaEdit, FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
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
    
    // Form state
    const [textContent, setTextContent] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [attachmentTempKey, setAttachmentTempKey] = useState(null);
    const [attachmentType, setAttachmentType] = useState(null);
    
    const [notification, setNotification] = useState({ isOpen: false, type: "info", message: "" });
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    
    const fileInputRef = useRef(null);
    const moduleStartedRef = useRef(false);

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
                
                // Backend chỉ cho phép AttachmentType tối đa 50 ký tự
                // Dùng extension-based type mapping với type ngắn gọn (tất cả <= 50 ký tự)
                const extension = selectedFile.name.split('.').pop()?.toLowerCase();
                
                // Type mapping ngắn gọn (tất cả đều <= 50 ký tự)
                const typeMap = {
                    'pdf': 'application/pdf', // 15 chars
                    'doc': 'application/msword', // 20 chars
                    'docx': 'application/docx', // 18 chars (shortened from full MIME type)
                    'txt': 'text/plain', // 12 chars
                    'docm': 'application/docm', // 18 chars (shortened)
                    'dotx': 'application/dotx', // 18 chars (shortened)
                    'dotm': 'application/dotm' // 18 chars (shortened)
                };
                
                // Ưu tiên dùng type từ mapping (ngắn gọn), nếu không có thì dùng imageType, cuối cùng là default
                let finalAttachmentType = typeMap[extension];
                
                // Nếu không có trong mapping, dùng imageType hoặc tạo từ extension
                if (!finalAttachmentType) {
                    if (imageType && imageType.length <= 50) {
                        finalAttachmentType = imageType;
                    } else {
                        // Tạo type đơn giản từ extension
                        finalAttachmentType = extension ? `application/${extension}` : 'application/octet-stream';
                    }
                }
                
                // Đảm bảo không vượt quá 50 ký tự (fallback safety)
                if (finalAttachmentType.length > 50) {
                    finalAttachmentType = finalAttachmentType.substring(0, 50);
                }
                
                setAttachmentType(finalAttachmentType);
                
                console.log("✅ [EssayDetail] File uploaded successfully:", {
                    tempKey,
                    imageUrl,
                    imageType: finalAttachmentType,
                    originalImageType: imageType,
                    fileName: selectedFile.name
                });
                
                setNotification({
                    isOpen: true,
                    type: "success",
                    message: `Upload file "${selectedFile.name}" thành công!`
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

        // Validate minimum length (backend requires at least 50 characters)
            if (textContent.trim().length < 10) {
                setNotification({
                    isOpen: true,
                    type: "error",
                    message: "Nội dung essay phải có ít nhất 10 ký tự. Hiện tại bạn đã nhập " + textContent.trim().length + " ký tự."
                });
                return;
        }

        // Validate maximum length (backend allows max 10000 characters)
        if (textContent.trim().length > 10000) {
            setNotification({
                isOpen: true,
                type: "error",
                message: "Nội dung essay không được vượt quá 10000 ký tự. Hiện tại bạn đã nhập " + textContent.trim().length + " ký tự."
            });
            return;
        }

        // If file is selected but not uploaded, upload it first
        if (selectedFile && !attachmentTempKey) {
            await handleUploadFile();
            // Wait a bit for upload to complete
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Check again if upload was successful
            if (!attachmentTempKey) {
                setNotification({
                    isOpen: true,
                    type: "error",
                    message: "Vui lòng upload file trước khi nộp bài"
                });
                return;
            }
        }

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
        
        try {
            setSubmitting(true);
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
        } catch (err) {
            console.error("❌ [EssayDetail] Error submitting essay:", err);
            
            // Log full error response
            if (err.response?.data) {
                console.error("❌ [EssayDetail] Full error response:", err.response.data);
                try {
                    console.error("❌ [EssayDetail] Error response (stringified):", JSON.stringify(err.response.data, null, 2));
                } catch (e) {
                    console.error("❌ [EssayDetail] Could not stringify error response");
                }
            }
            
            console.error("❌ [EssayDetail] Error details:", {
                message: err.message,
                status: err.response?.status,
                statusText: err.response?.statusText,
                headers: err.response?.headers,
                requestData: submissionData
            });
            
            // Extract error message from backend response
            let errorMessage = "Không thể nộp bài essay. Vui lòng thử lại.";
            
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
            setShowSubmitModal(false);
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
                                <h1 className="essay-title">{essayTitle}</h1>
                                {essay?.description && (
                                    <p className="essay-description">{essay.description || essay.Description}</p>
                                )}
                            </div>
                        </Col>
                    </Row>

                    <Row>
                        <Col lg={8}>
                            <div className="essay-form-section">
                                <h2 className="section-title">Nộp bài Essay</h2>
                                
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
                                        <Form.Text className={`text-muted ${textContent.trim().length < 50 ? 'text-danger' : textContent.trim().length > 10000 ? 'text-danger' : ''}`}>
                                            Số ký tự: {textContent.length} / 10000
                                            {textContent.trim().length < 50 && (
                                                <span className="ms-2">(Tối thiểu 50 ký tự)</span>
                                            )}
                                        </Form.Text>
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="form-label">
                                            <FaFileUpload className="label-icon" />
                                            File đính kèm (tùy chọn)
                                        </Form.Label>
                                    <div className="file-upload-section">
                                        {!selectedFile ? (
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
                                        ) : (
                                                <div className="file-preview-section">
                                                    <div className="file-preview-card">
                                                        <div className="file-preview-info">
                                                            <FaFileUpload className="file-icon" />
                                                            <div className="file-info">
                                                                <div className="file-name">{selectedFile.name}</div>
                                                                <div className="file-size">{formatFileSize(selectedFile.size)}</div>
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
                                            )}
                                        </div>
                                    </Form.Group>

                                    <div className="essay-submit-section">
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            className="submit-essay-btn"
                                            onClick={() => setShowSubmitModal(true)}
                                            disabled={submitting || !textContent.trim()}
                                        >
                                            {submitting ? "Đang nộp bài..." : "Nộp bài"}
                                        </Button>
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
                                                ? formatDate(essay.assessment.dueAt)
                                                : "Không có hạn nộp"}
                                        </div>
                                    </div>
                                </div>

                                <div className="info-item">
                                    <FaCheckCircle className="info-icon" />
                                    <div className="info-content">
                                        <div className="info-label">Trạng thái</div>
                                        <div className="info-value">Chưa nộp</div>
                                    </div>
                                </div>

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
                title="Xác nhận nộp bài"
                message="Bạn có chắc chắn muốn nộp bài essay này? Sau khi nộp, bạn không thể chỉnh sửa."
                confirmText="Nộp bài"
                cancelText="Hủy"
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

