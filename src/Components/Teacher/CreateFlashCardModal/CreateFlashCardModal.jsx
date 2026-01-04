import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Row, Col } from "react-bootstrap";
import { FaImage, FaMusic, FaSearch, FaMagic, FaTimes } from "react-icons/fa";
import { flashcardService } from "../../../Services/flashcardService";
import { fileService } from "../../../Services/fileService";
import GenerateFlashcardModal from "../GenerateFlashcardModal/GenerateFlashcardModal";
import LookupWordModal from "../LookupWordModal/LookupWordModal";
import "./CreateFlashCardModal.css";

const FLASHCARD_IMAGE_BUCKET = "flashcards";
const FLASHCARD_AUDIO_BUCKET = "flashcard-audio";

export default function CreateFlashCardModal({ show, onClose, onSuccess, moduleId, flashcardToUpdate, isAdmin = false }) {
  const isEditMode = !!flashcardToUpdate;

  // Form state
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState("");
  const [example, setExample] = useState("");
  const [exampleTranslation, setExampleTranslation] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Modals state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showLookupModal, setShowLookupModal] = useState(false);

  // Media state
  const [imagePreview, setImagePreview] = useState(null);
  const [imageTempKey, setImageTempKey] = useState(null);
  const [imageType, setImageType] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef(null);

  const [audioPreview, setAudioPreview] = useState(null);
  const [audioTempKey, setAudioTempKey] = useState(null);
  const [audioType, setAudioType] = useState(null);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const audioInputRef = useRef(null);

  useEffect(() => {
    if (show) {
      if (flashcardToUpdate) {
        setWord(flashcardToUpdate.word || flashcardToUpdate.Word || "");
        setMeaning(flashcardToUpdate.meaning || flashcardToUpdate.Meaning || "");
        setPronunciation(flashcardToUpdate.pronunciation || flashcardToUpdate.Pronunciation || "");
        setPartOfSpeech(flashcardToUpdate.partOfSpeech || flashcardToUpdate.PartOfSpeech || "");
        setExample(flashcardToUpdate.example || flashcardToUpdate.Example || "");
        setExampleTranslation(flashcardToUpdate.exampleTranslation || flashcardToUpdate.ExampleTranslation || "");
        
        setImagePreview(flashcardToUpdate.imageUrl || flashcardToUpdate.ImageUrl || null);
        setAudioPreview(flashcardToUpdate.audioUrl || flashcardToUpdate.AudioUrl || null);
        setImageTempKey(null);
        setAudioTempKey(null);
      } else {
        resetForm();
      }
      setErrors({});
    }
  }, [show, flashcardToUpdate]);

  const resetForm = () => {
    setWord("");
    setMeaning("");
    setPronunciation("");
    setPartOfSpeech("");
    setExample("");
    setExampleTranslation("");
    setImagePreview(null);
    setAudioPreview(null);
    setImageTempKey(null);
    setAudioTempKey(null);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: "Kích thước ảnh tối đa 5MB" });
      return;
    }

    setUploadingImage(true);
    try {
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
      
      const res = await fileService.uploadTempFile(file, FLASHCARD_IMAGE_BUCKET, "temp");
      if (res.data?.success) {
        setImageTempKey(res.data.data.TempKey || res.data.data.tempKey);
        setImageType(res.data.data.ImageType || res.data.data.imageType || file.type);
        setErrors({...errors, image: null});
      } else {
        setErrors({...errors, image: "Upload thất bại"});
      }
    } catch (err) {
      console.error(err);
      setErrors({...errors, image: "Lỗi upload ảnh"});
    } finally {
      setUploadingImage(false);
      if(imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const handleAudioChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrors({ ...errors, audio: "Kích thước audio tối đa 10MB" });
      return;
    }

    setUploadingAudio(true);
    try {
      const preview = URL.createObjectURL(file);
      setAudioPreview(preview);
      
      const res = await fileService.uploadTempFile(file, FLASHCARD_AUDIO_BUCKET, "temp");
      if (res.data?.success) {
        setAudioTempKey(res.data.data.TempKey || res.data.data.tempKey);
        setAudioType(res.data.data.AudioType || res.data.data.audioType || file.type);
        setErrors({...errors, audio: null});
      } else {
        setErrors({...errors, audio: "Upload thất bại"});
      }
    } catch (err) {
      console.error(err);
      setErrors({...errors, audio: "Lỗi upload audio"});
    } finally {
      setUploadingAudio(false);
      if(audioInputRef.current) audioInputRef.current.value = "";
    }
  };

  const handleGenerateSuccess = (data) => {
    if(data.word) setWord(data.word);
    if(data.meaning) setMeaning(data.meaning);
    if(data.pronunciation) setPronunciation(data.pronunciation);
    if(data.partOfSpeech) setPartOfSpeech(data.partOfSpeech);
    if(data.example) setExample(data.example);
    if(data.exampleTranslation) setExampleTranslation(data.exampleTranslation);
    
    if(data.imageUrl || data.imageTempKey) {
        setImagePreview(data.imageUrl);
        setImageTempKey(data.imageTempKey);
        setImageType(data.imageType);
    }
    if(data.audioUrl || data.audioTempKey) {
        setAudioPreview(data.audioUrl);
        setAudioTempKey(data.audioTempKey);
        setAudioType(data.audioType);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate
    if (!word.trim() || !meaning.trim() || !pronunciation.trim() || !partOfSpeech.trim()) {
        setErrors({submit: "Vui lòng điền đầy đủ các trường bắt buộc (*)"});
        return;
    }
    if (!imagePreview && !imageTempKey) {
        setErrors({image: "Ảnh là bắt buộc"});
        return;
    }
    if (!audioPreview && !audioTempKey) {
        setErrors({audio: "Âm thanh là bắt buộc"});
        return;
    }

    setSubmitting(true);
    try {
        const payload = {
            word: word.trim(),
            meaning: meaning.trim(),
            pronunciation: pronunciation.trim(),
            partOfSpeech: partOfSpeech.trim(),
            example: example.trim() || null,
            exampleTranslation: exampleTranslation.trim() || null,
            imageTempKey: imageTempKey,
            audioTempKey: audioTempKey,
            imageType: imageType,
            audioType: audioType
        };

        let res;
        if (isEditMode) {
            const flashcardId = flashcardToUpdate.flashcardId || flashcardToUpdate.FlashcardId;
            res = isAdmin
                ? await flashcardService.updateAdminFlashcard(flashcardId, payload)
                : await flashcardService.updateFlashcard(flashcardId, payload);
        } else {
            payload.moduleId = parseInt(moduleId);
            res = isAdmin
                ? await flashcardService.createAdminFlashcard(payload)
                : await flashcardService.createFlashcard(payload);
        }

        if (res.data?.success) {
            onSuccess(res.data.data);
            onClose();
        } else {
            throw new Error(res.data?.message || "Lỗi thao tác");
        }
    } catch (err) {
        console.error(err);
        setErrors({submit: err.response?.data?.message || "Có lỗi xảy ra"});
    } finally {
        setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} backdrop="static" centered dialogClassName="custom-width-modal-1080">
      <Modal.Header closeButton>
        <Modal.Title>{isEditMode ? "Cập nhật Flashcard" : "Tạo Flashcard mới"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!isEditMode && (
            <div className="d-flex justify-content-end mb-3 gap-2">
                <Button variant="outline-info" size="sm" onClick={() => setShowLookupModal(true)}><FaSearch className="me-1"/> Tra từ</Button>
                <Button variant="outline-primary" size="sm" onClick={() => setShowGenerateModal(true)}><FaMagic className="me-1"/> AI Gen</Button>
            </div>
        )}
        <form onSubmit={handleSubmit}>
            <Row>
                <Col md={6}>
                    <div className="mb-3">
                        <label className="form-label required">Từ vựng</label>
                        <input type="text" className="form-control" value={word} onChange={e => setWord(e.target.value)} placeholder="Nhập từ vựng tiếng Anh" />
                    </div>
                </Col>
                <Col md={6}>
                    <div className="mb-3">
                        <label className="form-label required">Phiên âm</label>
                        <input type="text" className="form-control" value={pronunciation} onChange={e => setPronunciation(e.target.value)} placeholder="Nhập phiên âm IPA (VD: /ˈæp.l/)" />
                    </div>
                </Col>
            </Row>
            <div className="mb-3">
                <label className="form-label required">Nghĩa</label>
                <input type="text" className="form-control" value={meaning} onChange={e => setMeaning(e.target.value)} placeholder="Nhập nghĩa tiếng Việt" />
            </div>
            <div className="mb-3">
                <label className="form-label required">Từ loại</label>
                <input type="text" className="form-control" value={partOfSpeech} onChange={e => setPartOfSpeech(e.target.value)} placeholder="Nhập từ loại (VD: Noun, Verb, Adjective)" />
            </div>
            
            <Row>
                <Col md={6}>
                    <div className="mb-3">
                        <label className="form-label required">Ảnh minh họa</label>
                        <div className="border p-2 text-center rounded bg-light" style={{minHeight: '150px'}}>
                            {imagePreview ? (
                                <div className="position-relative">
                                    <img src={imagePreview} alt="Preview" className="img-fluid" style={{maxHeight: '140px'}}/>
                                    <Button variant="danger" size="sm" className="position-absolute top-0 end-0" onClick={() => {setImagePreview(null); setImageTempKey(null);}}><FaTimes/></Button>
                                </div>
                            ) : (
                                <div className="py-4 cursor-pointer" onClick={() => imageInputRef.current?.click()}>
                                    <FaImage size={24} className="text-muted mb-2 d-block mx-auto"/>
                                    <span className="text-muted">{uploadingImage ? "Đang tải..." : "Chọn Ảnh"}</span>
                                </div>
                            )}
                            <input type="file" ref={imageInputRef} onChange={handleImageChange} style={{display:'none'}} accept="image/*"/>
                        </div>
                        {errors.image && <div className="text-danger small mt-1">{errors.image}</div>}
                    </div>
                </Col>
                <Col md={6}>
                    <div className="mb-3">
                        <label className="form-label required">Âm thanh</label>
                        <div className="border p-2 text-center rounded bg-light" style={{minHeight: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            {audioPreview ? (
                                <div className="w-100">
                                    <audio controls src={audioPreview} style={{width: '100%'}}/>
                                    <Button variant="danger" size="sm" className="mt-2 w-100" onClick={() => {setAudioPreview(null); setAudioTempKey(null);}}><FaTimes className="me-1"/> Xóa audio</Button>
                                </div>
                            ) : (
                                <div className="cursor-pointer" onClick={() => audioInputRef.current?.click()}>
                                    <FaMusic size={24} className="text-muted mb-2 d-block mx-auto"/>
                                    <span className="text-muted">{uploadingAudio ? "Đang tải..." : "Chọn Audio"}</span>
                                </div>
                            )}
                            <input type="file" ref={audioInputRef} onChange={handleAudioChange} style={{display:'none'}} accept="audio/*"/>
                        </div>
                        {errors.audio && <div className="text-danger small mt-1">{errors.audio}</div>}
                    </div>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <div className="mb-3">
                        <label className="form-label">Ví dụ</label>
                        <textarea className="form-control" rows={2} value={example} onChange={e => setExample(e.target.value)} placeholder="Nhập câu ví dụ tiếng Anh" />
                    </div>
                </Col>
                <Col md={6}>
                    <div className="mb-3">
                        <label className="form-label">Dịch ví dụ</label>
                        <textarea className="form-control" rows={2} value={exampleTranslation} onChange={e => setExampleTranslation(e.target.value)} placeholder="Nhập bản dịch tiếng Việt" />
                    </div>
                </Col>
            </Row>

            {errors.submit && <div className="alert alert-danger">{errors.submit}</div>}
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={submitting}>Hủy</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Đang lưu..." : (isEditMode ? "Cập nhật" : "Tạo mới")}
        </Button>
      </Modal.Footer>

      <GenerateFlashcardModal show={showGenerateModal} onClose={() => setShowGenerateModal(false)} onGenerate={handleGenerateSuccess} />
      <LookupWordModal show={showLookupModal} onClose={() => setShowLookupModal(false)} />
    </Modal>
  );
}