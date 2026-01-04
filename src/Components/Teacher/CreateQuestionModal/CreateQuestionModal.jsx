import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Form, Row, Col, Tab, Tabs, InputGroup, Badge } from "react-bootstrap";
import { FaPlus, FaTrash, FaArrowUp, FaArrowDown, FaImage, FaVideo, FaTimes, FaLayerGroup, FaQuestionCircle } from "react-icons/fa";
import { questionService } from "../../../Services/questionService";
import { fileService } from "../../../Services/fileService";
import { quizService } from "../../../Services/quizService";
import { useQuestionTypes } from "../../../hooks/useQuestionTypes";
import "./CreateQuestionModal.css";

const QUESTION_BUCKET = "questions";
const QUIZ_GROUP_BUCKET = "quizgroups";

export default function CreateQuestionModal({
  show,
  onClose,
  onSuccess,
  sectionId,
  groupId,
  questionToUpdate,
  isBulkMode = false,
  onSaveDraft,
  isAdmin = false
}) {  const { QUESTION_TYPES } = useQuestionTypes();  const [activeTab, setActiveTab] = useState("question");
  const [internalGroupId, setInternalGroupId] = useState(groupId); 
  const [groupInfo, setGroupInfo] = useState(null);
  const [sectionInfo, setSectionInfo] = useState(null);
  const [createdGroupName, setCreatedGroupName] = useState(""); 

  useEffect(() => {
    if (show) {
      const targetGId = questionToUpdate ? (questionToUpdate.quizGroupId || questionToUpdate.QuizGroupId) : groupId;
      setInternalGroupId(targetGId);
      setActiveTab("question");
      if (targetGId) fetchGroupDetails(targetGId);
      if (sectionId) fetchSectionDetails(sectionId);
      if (!questionToUpdate) resetQuestionForm(QUESTION_TYPES.MultipleChoice);
    }
  }, [show, groupId, sectionId, questionToUpdate]);

  const fetchGroupDetails = async (id) => {
      try {
          const res = await quizService.getQuizGroupById(id);
          if (res.data?.success) setGroupInfo(res.data.data);
      } catch (e) { console.error(e); }
  };

  const fetchSectionDetails = async (id) => {
      try {
          const res = await quizService.getQuizSectionById(id);
          if (res.data?.success) setSectionInfo(res.data.data);
      } catch (e) { console.error(e); }
  };

  const [qFormData, setQFormData] = useState({
    stemText: "",
    explanation: "",
    points: 10,
    type: QUESTION_TYPES.MultipleChoice,
    options: [],
    matchingPairs: [], 
  });
  
  const [qMediaPreview, setQMediaPreview] = useState(null);
  const [qMediaTempKey, setQMediaTempKey] = useState(null);
  const [qMediaType, setQMediaType] = useState(null);
  const [qUploadingMedia, setQUploadingMedia] = useState(false);
  const qFileInputRef = useRef(null);
  const [qLoading, setQLoading] = useState(false);
  const [qError, setQError] = useState("");

  useEffect(() => {
    if (show && questionToUpdate) {
        // Chuẩn hóa options từ backend: Chuyển 'Text' thành 'text' để UI hoạt động
        let initialOptions = (questionToUpdate.options || []).map(opt => ({
            ...opt,
            text: opt.text || opt.Text || "",
            isCorrect: opt.isCorrect !== undefined ? opt.isCorrect : (opt.IsCorrect || false)
        }));

        let initialPairs = [];
        if (questionToUpdate.type === QUESTION_TYPES.Matching && questionToUpdate.correctAnswersJson) {
           try {
             const parsed = typeof questionToUpdate.correctAnswersJson === 'string' ? JSON.parse(questionToUpdate.correctAnswersJson) : questionToUpdate.correctAnswersJson; 
             if (Array.isArray(parsed)) initialPairs = parsed;
             else if (typeof parsed === 'object') initialPairs = Object.entries(parsed).map(([k, v]) => ({ key: k, value: v }));
           } catch (e) { initialPairs = [{ key: "", value: "" }]; }
        } else if (questionToUpdate.matchingPairs) {
            initialPairs = questionToUpdate.matchingPairs;
        }

        setQFormData({
          stemText: questionToUpdate.stemText || "",
          explanation: questionToUpdate.explanation || "",
          points: questionToUpdate.points || 10,
          type: questionToUpdate.type || QUESTION_TYPES.MultipleChoice,
          options: initialOptions,
          matchingPairs: initialPairs.length > 0 ? initialPairs : [{ key: "", value: "" }],
        });

        const url = questionToUpdate.mediaUrl || questionToUpdate.MediaUrl || questionToUpdate.mediaPreview;
        if (url) {
            setQMediaPreview(url);
            const lowerUrl = url.toLowerCase();
            if (lowerUrl.match(/\.(mp4|webm|mov)$/)) setQMediaType('video');
            else if (lowerUrl.match(/\.(mp3|wav|ogg)$/)) setQMediaType('audio');
            else setQMediaType('image');
        }
    }
  }, [show, questionToUpdate]);

  const resetQuestionForm = (type) => {
    let defaultOptions = [];
    let defaultPairs = [];
    if (type === QUESTION_TYPES.MultipleChoice || type === QUESTION_TYPES.MultipleAnswers) {
      defaultOptions = [{ text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }];
    } else if (type === QUESTION_TYPES.TrueFalse) {
      defaultOptions = [{ text: "True", isCorrect: true }, { text: "False", isCorrect: false }];
    } else if (type === QUESTION_TYPES.Ordering) {
      defaultOptions = [{ text: "", isCorrect: true }, { text: "", isCorrect: true }, { text: "", isCorrect: true }];
    } else if (type === QUESTION_TYPES.Matching) {
      defaultPairs = [{ key: "", value: "" }, { key: "", value: "" }];
    }
    setQFormData({ stemText: "", explanation: "", points: 10, type: type, options: defaultOptions, matchingPairs: defaultPairs });
    setQMediaPreview(null); setQMediaTempKey(null); setQMediaType(null);
  };

  const handleQTypeChange = (e) => resetQuestionForm(parseInt(e.target.value));

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...qFormData.options];
    if (field === "isCorrect" && (qFormData.type === QUESTION_TYPES.MultipleChoice || qFormData.type === QUESTION_TYPES.TrueFalse)) {
      newOptions.forEach((opt, i) => { opt.isCorrect = i === index; });
    } else { newOptions[index][field] = value; }
    setQFormData({ ...qFormData, options: newOptions });
  };

  const addOption = () => setQFormData({ ...qFormData, options: [...qFormData.options, { text: "", isCorrect: qFormData.type === QUESTION_TYPES.Ordering }] });
  const removeOption = (index) => setQFormData({ ...qFormData, options: qFormData.options.filter((_, i) => i !== index) });
  const moveOption = (index, direction) => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === qFormData.options.length - 1)) return;
    const newOptions = [...qFormData.options];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newOptions[index], newOptions[targetIndex]] = [newOptions[targetIndex], newOptions[index]];
    setQFormData({ ...qFormData, options: newOptions });
  };

  const handlePairChange = (index, field, value) => {
    const newPairs = [...qFormData.matchingPairs];
    newPairs[index][field] = value;
    setQFormData({ ...qFormData, matchingPairs: newPairs });
  };
  const addPair = () => setQFormData({ ...qFormData, matchingPairs: [...qFormData.matchingPairs, { key: "", value: "" }] });
  const removePair = (index) => setQFormData({ ...qFormData, matchingPairs: qFormData.matchingPairs.filter((_, i) => i !== index) });

  const handleQMediaChange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 100 * 1024 * 1024) { setQError("File quá lớn (giới hạn 100MB)."); return; }
      setQUploadingMedia(true); setQError("");
      try {
          const previewUrl = URL.createObjectURL(file);
          setQMediaPreview(previewUrl);
          let type = file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'audio' : 'image';
          setQMediaType(type);
          const response = await fileService.uploadTempFile(file, QUESTION_BUCKET, "temp");
          if (response.data?.success && response.data?.data) setQMediaTempKey(response.data.data.tempKey || response.data.data.TempKey);
          else setQError("Upload thất bại.");
      } catch (err) { setQError("Lỗi khi upload file."); } finally { setQUploadingMedia(false); }
  };

  const handleRemoveQMedia = () => {
      setQMediaPreview(null);
      setQMediaTempKey(null);
      setQMediaType(null);
      if (qFileInputRef.current) qFileInputRef.current.value = "";
  };

  const handleQuestionSubmit = async (isAddMore = false) => {
    if (!qFormData.stemText.trim()) { setQError("Vui lòng nhập nội dung câu hỏi"); return; }
    setQLoading(true); setQError("");
    try {
      const payload = {
        questionId: questionToUpdate?.questionId,
        stemText: qFormData.stemText.trim(),
        explanation: qFormData.explanation,
        points: parseFloat(qFormData.points),
        type: qFormData.type,
        quizSectionId: sectionId || null,
        quizGroupId: internalGroupId || null,
        mediaTempKey: qMediaTempKey,
        mediaType: qMediaType,
        options: []
      };

      if (qFormData.type === QUESTION_TYPES.Matching) {
        const correctMatchesMap = {};
        const leftTexts = []; const rightTexts = [];
        qFormData.matchingPairs.forEach(p => {
            const leftText = (p.key || "").trim();
            const rightText = (p.value || "").trim();
            if (leftText && rightText) {
                correctMatchesMap[leftText] = rightText;
                leftTexts.push(leftText); rightTexts.push(rightText);
            }
        });
        payload.correctAnswersJson = JSON.stringify(correctMatchesMap);
        payload.metadataJson = JSON.stringify({ left: leftTexts, right: rightTexts });
        payload.options = [
            ...leftTexts.map(t => ({ text: t, isCorrect: true })),
            ...rightTexts.map(t => ({ text: t, isCorrect: false }))
        ];

      } else if (qFormData.type === QUESTION_TYPES.FillBlank) {
         const matches = [...qFormData.stemText.matchAll(/\[(.*?)\]/g)];
         const extractedAnswers = matches.map(m => m[1].trim());
         payload.correctAnswersJson = JSON.stringify(extractedAnswers);
         payload.options = extractedAnswers.map(ans => ({ text: ans, isCorrect: true }));

      } else if (qFormData.type === QUESTION_TYPES.Ordering) {
         // Luôn dùng 'text' viết thường trong map để lấy từ state UI
         payload.options = qFormData.options.map((opt, index) => ({
            text: (opt.text || opt.Text || "").trim(),
            displayOrder: index,
            isCorrect: true
         }));
         payload.correctAnswersJson = JSON.stringify(payload.options.map(o => o.text));
      } else {
        payload.options = qFormData.options.map(opt => ({
            text: (opt.text || opt.Text || "").trim(),
            isCorrect: !!opt.isCorrect,
            feedback: opt.feedback || null
        }));
      }

      let response = questionToUpdate 
        ? (isAdmin ? await questionService.updateAdminQuestion(questionToUpdate.questionId, payload) : await questionService.updateQuestion(questionToUpdate.questionId, payload))
        : (isAdmin ? await questionService.createAdminQuestion(payload) : await questionService.createQuestion(payload));
      if (response.data?.success) {
        onSuccess(response.data.data);
        if (isAddMore) { resetQuestionForm(qFormData.type); setQError(""); } else onClose();
      } else { setQError(response.data?.message || "Có lỗi xảy ra"); }
    } catch (err) { setQError(err.response?.data?.message || "Lỗi kết nối"); } finally { setQLoading(false); }
  };

  const [gFormData, setGFormData] = useState({ name: "", title: "", description: "", sumScore: 0 });
  const [gMedia, setGMedia] = useState({ preview: null, tempKey: null, type: null, duration: null });
  const [gLoading, setGLoading] = useState(false);
  const [gError, setGError] = useState("");
  const gFileInputRef = useRef(null);

  const handleGMediaChange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      let type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : null;
      if (!type) { setGError("Chỉ hỗ trợ ảnh hoặc video cho Group"); return; }
      setGLoading(true);
      try {
          const preview = URL.createObjectURL(file);
          let duration = null;
          if (type === 'video') {
             const vid = document.createElement('video'); vid.src = preview;
             await new Promise(r => vid.onloadedmetadata = r); duration = Math.round(vid.duration);
          }
          const res = await fileService.uploadTempFile(file, QUIZ_GROUP_BUCKET, "temp");
          if (res.data?.success) { setGMedia({ preview, tempKey: res.data.data.tempKey || res.data.data.TempKey, type, duration }); setGError(""); }
      } catch (err) { setGError("Lỗi upload media group"); } finally { setGLoading(false); }
  };

  const handleGroupSubmit = async () => {
      if (!gFormData.name.trim() || !gFormData.title.trim()) { setGError("Tên và tiêu đề là bắt buộc"); return; }
      setGLoading(true); setGError("");
      try {
          const payload = { quizSectionId: parseInt(sectionId), name: gFormData.name.trim(), title: gFormData.title.trim(), description: gFormData.description, sumScore: parseFloat(gFormData.sumScore), imageTempKey: gMedia.type === 'image' ? gMedia.tempKey : null, imageType: gMedia.type === 'image' ? gMedia.type : null, videoTempKey: gMedia.type === 'video' ? gMedia.tempKey : null, videoType: gMedia.type === 'video' ? gMedia.type : null, videoDuration: gMedia.duration };
          const res = await quizService.createQuizGroup(payload);
          if (res.data?.success) { setInternalGroupId(res.data.data.quizGroupId); setCreatedGroupName(res.data.data.name); setActiveTab("question"); setGFormData({ name: "", title: "", description: "", sumScore: 0 }); setGMedia({ preview: null, tempKey: null, type: null, duration: null }); }
      } catch (err) { setGError("Lỗi kết nối khi tạo group"); } finally { setGLoading(false); }
  };

  const renderMCQOptions = () => (
    <div className="options-grid"><Row>{qFormData.options.map((option, index) => (
            <Col md={6} key={index} className="mb-3"><div className="option-item d-flex align-items-center gap-2">
                    <Form.Check type={qFormData.type === QUESTION_TYPES.MultipleAnswers ? "checkbox" : "radio"} name="correctAnswer" checked={option.isCorrect} onChange={(e) => handleOptionChange(index, "isCorrect", e.target.checked)} className="scale-125" />
                    <Form.Control type="text" value={option.text || option.Text || ""} onChange={(e) => handleOptionChange(index, "text", e.target.value)} placeholder={`Đáp án ${index + 1}`} className="border-0 shadow-none fw-medium" />
                    {qFormData.type !== QUESTION_TYPES.TrueFalse && <Button variant="outline-danger" size="sm" className="border-0" onClick={() => removeOption(index)}><FaTrash /></Button>}
                </div></Col>))}</Row>
      {qFormData.type !== QUESTION_TYPES.TrueFalse && <Button variant="outline-primary" size="sm" onClick={addOption} className="mt-2"><FaPlus className="me-1" /> Thêm đáp án</Button>}
    </div>
  );

  const renderMatchingOptions = () => (
    <><div className="alert alert-info py-2 small mb-3"><FaQuestionCircle className="me-2"/>Nhập các cặp tương ứng. Backend sẽ dùng Text để đối chiếu ID.</div>
        {qFormData.matchingPairs.map((pair, index) => (
            <div key={index} className="option-item mb-2"><Row className="align-items-center g-2">
                    <Col md={5}><InputGroup><InputGroup.Text className="bg-light text-muted small fw-bold" style={{width: '40px'}}>{index + 1}A</InputGroup.Text><Form.Control type="text" value={pair.key} onChange={(e) => handlePairChange(index, "key", e.target.value)} placeholder="Vế trái" className="border-0 shadow-none" /></InputGroup></Col>
                    <Col md={1} className="text-center text-primary matching-arrow"><FaArrowDown style={{transform: 'rotate(-90deg)'}} /></Col>
                    <Col md={5}><InputGroup><InputGroup.Text className="bg-light text-muted small fw-bold" style={{width: '40px'}}>{index + 1}B</InputGroup.Text><Form.Control type="text" value={pair.value} onChange={(e) => handlePairChange(index, "value", e.target.value)} placeholder="Vế phải" className="border-0 shadow-none" /></InputGroup></Col>
                    <Col md={1} className="text-end"><Button variant="outline-danger" size="sm" className="border-0" onClick={() => removePair(index)}><FaTimes /></Button></Col>
                </Row></div>))}
        <Button variant="outline-primary" size="sm" onClick={addPair} className="mt-2"><FaPlus className="me-1" /> Thêm cặp nối</Button>
    </>
  );

  const renderOrderingOptions = () => (
      <><div className="alert alert-info py-2 small mb-3"><FaQuestionCircle className="me-2"/>Sắp xếp theo đúng thứ tự logic.</div>
        {qFormData.options.map((option, index) => (
            <div key={index} className="option-item mb-2 d-flex align-items-center gap-3"><span className="badge bg-secondary rounded-circle p-2 d-flex align-items-center justify-content-center" style={{width: '30px', height: '30px'}}>{index + 1}</span>
                <Form.Control type="text" value={option.text || option.Text || ""} onChange={(e) => handleOptionChange(index, "text", e.target.value)} placeholder={`Bước ${index + 1}`} className="border-0 shadow-none fw-medium flex-grow-1" />
                <div className="d-flex gap-1 order-controls bg-white border rounded p-1 shadow-sm">
                    <Button type="button" variant="outline-secondary" size="sm" disabled={index === 0} onClick={() => moveOption(index, 'up')}><FaArrowUp /></Button>
                    <Button type="button" variant="outline-secondary" size="sm" disabled={index === qFormData.options.length - 1} onClick={() => moveOption(index, 'down')}><FaArrowDown /></Button>
                </div>
                <Button variant="outline-danger" size="sm" className="border-0 ms-2" onClick={() => removeOption(index)}><FaTrash /></Button>
            </div>))}
        <Button variant="outline-primary" size="sm" onClick={addOption} className="mt-2"><FaPlus className="me-1" /> Thêm bước</Button>
      </>
  );

  return (
    <Modal show={show} onHide={onClose} backdrop="static" centered dialogClassName="create-question-modal-xl">
      <Modal.Header closeButton><Modal.Title>{questionToUpdate ? "Cập nhật câu hỏi" : "Tạo mới nội dung"}</Modal.Title></Modal.Header>
      <Modal.Body className="p-0">
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="px-3 pt-2 border-bottom-0 custom-tabs">
            <Tab eventKey="question" title={<span><FaQuestionCircle className="me-2"/>Câu hỏi</span>}>
                <div className="p-3 border-top"><div className="mb-3">
                        {internalGroupId ? (
                             <div className="alert alert-info py-2 small border-0 shadow-sm"><div className="d-flex justify-content-between align-items-center w-100">
                                    <div><FaLayerGroup className="me-2"/>Đang thêm vào nhóm: <strong>{groupInfo?.title || groupInfo?.name || createdGroupName || `Group #${internalGroupId}`}</strong></div>
                                    <div className="d-flex align-items-center gap-3">
                                        {groupInfo?.sumScore !== undefined && <Badge bg="secondary">Tổng điểm nhóm: {groupInfo.sumScore}</Badge>}
                                        {sectionInfo && <span className="text-muted fw-bold">| Section: {sectionInfo.title}</span>}
                                        <Button variant="link" size="sm" className="p-0 text-decoration-none ms-2 text-danger" onClick={() => {setInternalGroupId(null); setCreatedGroupName(""); setGroupInfo(null);}}><FaTimes className="me-1"/>Thoát nhóm</Button>
                                    </div>
                                 </div></div>
                        ) : (sectionInfo && <div className="alert alert-light py-2 small border shadow-sm"><FaQuestionCircle className="me-2 text-primary"/>Thêm câu hỏi lẻ vào Section: <strong>{sectionInfo.title}</strong></div>)}
                    </div>
                    {qError && <div className="alert alert-danger">{qError}</div>}
                    <Form><Row className="mb-3">
                            <Col md={5}><Form.Group><Form.Label>Loại câu hỏi</Form.Label><Form.Select value={qFormData.type} onChange={handleQTypeChange} disabled={!!questionToUpdate}>
                                    <option value={QUESTION_TYPES.MultipleChoice}>Trắc nghiệm (1 đáp án)</option>
                                    <option value={QUESTION_TYPES.MultipleAnswers}>Trắc nghiệm (Nhiều đáp án)</option>
                                    <option value={QUESTION_TYPES.TrueFalse}>Đúng / Sai</option>
                                    <option value={QUESTION_TYPES.FillBlank}>Điền từ (Fill in blanks)</option>
                                    <option value={QUESTION_TYPES.Matching}>Nối từ (Matching)</option>
                                    <option value={QUESTION_TYPES.Ordering}>Sắp xếp (Ordering)</option>
                                </Form.Select></Form.Group></Col>
                            <Col md={4}><Form.Group><Form.Label>Điểm số</Form.Label><InputGroup><Form.Control type="number" value={qFormData.points} onChange={(e) => setQFormData({ ...qFormData, points: e.target.value })}/>
                                        {internalGroupId && groupInfo && <InputGroup.Text className="bg-light text-muted small">/ {groupInfo.sumScore} (Nhóm)</InputGroup.Text>}
                                    </InputGroup></Form.Group></Col>
                        </Row><Row>
                            <Col md={7}><Form.Group className="mb-3"><Form.Label>Nội dung câu hỏi</Form.Label><Form.Control as="textarea" rows={4} value={qFormData.stemText} onChange={(e) => setQFormData({ ...qFormData, stemText: e.target.value })} placeholder={qFormData.type === QUESTION_TYPES.FillBlank ? "Ví dụ: Hanoi is the [capital] of Vietnam." : "Nhập câu hỏi..."} /></Form.Group><Form.Group className="mb-3"><Form.Label>Giải thích (Optional)</Form.Label><Form.Control as="textarea" rows={2} value={qFormData.explanation} onChange={(e) => setQFormData({ ...qFormData, explanation: e.target.value })} /></Form.Group></Col>
                            <Col md={5}><Form.Group className="mb-3"><Form.Label>Media đính kèm</Form.Label><div className="border p-2 rounded bg-light text-center" style={{minHeight: '150px'}}>
                                        {!qMediaPreview ? (<div className="py-4 cursor-pointer" onClick={() => qFileInputRef.current?.click()}><FaPlus size={20} className="text-muted mb-2 d-block mx-auto"/><span className="text-muted small">{qUploadingMedia ? "Đang tải..." : "Chọn Ảnh/Video/Audio"}</span></div>) : (
                                            <div className="position-relative">
                                                {qMediaType === 'image' && <img src={qMediaPreview} alt="Preview" className="img-fluid rounded" style={{maxHeight:'180px'}}/>}
                                                {qMediaType === 'video' && <video src={qMediaPreview} controls style={{maxHeight:'180px', width:'100%'}}/>}
                                                {qMediaType === 'audio' && <audio src={qMediaPreview} controls style={{width:'100%'}}/>}
                                                <Button variant="danger" size="sm" className="position-absolute top-0 end-0 m-1" onClick={handleRemoveQMedia}><FaTimes/></Button>
                                            </div>)}
                                        <input type="file" ref={qFileInputRef} onChange={handleQMediaChange} style={{display:'none'}} accept="image/*,video/*,audio/*"/>
                                    </div></Form.Group></Col>
                        </Row><hr/><div className="mb-3"><Form.Label className="fw-bold">Thiết lập đáp án</Form.Label><div className="bg-light p-3 rounded">
                                {(qFormData.type === QUESTION_TYPES.MultipleChoice || qFormData.type === QUESTION_TYPES.MultipleAnswers || qFormData.type === QUESTION_TYPES.TrueFalse) && renderMCQOptions()}
                                {qFormData.type === QUESTION_TYPES.Matching && renderMatchingOptions()}
                                {qFormData.type === QUESTION_TYPES.Ordering && renderOrderingOptions()}
                                {qFormData.type === QUESTION_TYPES.FillBlank && <div className="alert alert-info small">Dùng <code>[từ đúng]</code> trong nội dung câu hỏi để tạo chỗ trống.</div>}
                            </div></div></Form>
                    <div className="d-flex justify-content-end gap-2 mt-4"><Button variant="secondary" onClick={onClose}>Đóng</Button>
                        {!questionToUpdate && <Button variant="success" onClick={() => handleQuestionSubmit(true)} disabled={qLoading || qUploadingMedia}>{qLoading ? "Đang lưu..." : "Lưu & Thêm câu khác"}</Button>}
                        <Button variant="primary" onClick={() => handleQuestionSubmit(false)} disabled={qLoading || qUploadingMedia}>{qLoading ? "Đang xử lý..." : questionToUpdate ? "Lưu thay đổi" : "Tạo câu hỏi"}</Button>
                    </div></div></Tab>
            {sectionId && !groupId && !questionToUpdate && (
                <Tab eventKey="group" title={<span><FaLayerGroup className="me-2"/>Tạo nhóm câu hỏi</span>}>
                     <div className="p-4 border-top"><div className="alert alert-light border shadow-sm mb-4"><h6 className="alert-heading fw-bold"><FaLayerGroup className="me-2"/>Tạo Group mới</h6><p className="mb-0 small text-muted">Tạo một nhóm câu hỏi (ví dụ: Bài đọc hiểu, Bài nghe) sau đó bạn có thể thêm nhiều câu hỏi con vào nhóm này.</p></div>
                        {gError && <div className="alert alert-danger">{gError}</div>}
                        <Form><Row><Col md={8}><Form.Group className="mb-3"><Form.Label className="required">Tên nhóm (Mã định danh)</Form.Label><Form.Control type="text" value={gFormData.name} onChange={e => setGFormData({...gFormData, name: e.target.value})} placeholder="VD: Reading Passage 1"/></Form.Group><Form.Group className="mb-3"><Form.Label className="required">Tiêu đề hiển thị</Form.Label><Form.Control type="text" value={gFormData.title} onChange={e => setGFormData({...gFormData, title: e.target.value})} placeholder="VD: Đọc đoạn văn sau và trả lời câu hỏi..."/></Form.Group><Form.Group className="mb-3"><Form.Label>Nội dung / Đoạn văn / Mô tả</Form.Label><Form.Control as="textarea" rows={5} value={gFormData.description} onChange={e => setGFormData({...gFormData, description: e.target.value})}/></Form.Group></Col>
                                <Col md={4}><Form.Group className="mb-3"><Form.Label>Tổng điểm nhóm</Form.Label><Form.Control type="number" value={gFormData.sumScore} onChange={e => setGFormData({...gFormData, sumScore: e.target.value})}/></Form.Group>
                                    <Form.Group className="mb-3"><Form.Label>Media nhóm (Ảnh/Video)</Form.Label><div className="border p-2 rounded bg-light text-center" style={{minHeight: '200px'}}>
                                            {!gMedia.preview ? (<div className="py-5 cursor-pointer" onClick={() => gFileInputRef.current?.click()}><FaPlus size={24} className="text-muted mb-2 d-block mx-auto"/><span className="text-muted">{gLoading ? "Đang tải..." : "Upload Media"}</span></div>) : (
                                                <div className="position-relative">{gMedia.type === 'image' && <img src={gMedia.preview} alt="Preview" className="img-fluid rounded" />}
                                                    {gMedia.type === 'video' && <video src={gMedia.preview} controls style={{width:'100%'}} />}
                                                    <Button variant="danger" size="sm" className="position-absolute top-0 end-0 m-1" onClick={() => setGMedia({preview: null, tempKey: null, type: null, duration: null})}><FaTimes/></Button></div>)}
                                            <input type="file" ref={gFileInputRef} onChange={handleGMediaChange} style={{display:'none'}} accept="image/*,video/*"/>
                                        </div></Form.Group></Col></Row></Form>
                        <div className="d-flex justify-content-end gap-2 mt-4"><Button variant="secondary" onClick={onClose}>Hủy</Button><Button variant="success" onClick={handleGroupSubmit} disabled={gLoading}>{gLoading ? "Đang tạo..." : "Tạo Group và Thêm câu hỏi"}</Button></div></div></Tab>)}
        </Tabs></Modal.Body></Modal>
  );
}
