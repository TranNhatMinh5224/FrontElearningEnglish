import React, { useState, useEffect } from "react";
import { MdClose, MdSave } from "react-icons/md";

export default function CourseFormModal({ show, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    maxStudent: 0,
    isFeatured: false,
    imageTempKey: "", // Backend expects this
    imageType: "url", // or file
    type: 1 // System
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.descriptionMarkdown || initialData.description || "",
        price: initialData.price || 0,
        maxStudent: initialData.maxStudent || 0,
        isFeatured: initialData.isFeatured || false,
        imageTempKey: initialData.imageKey || "",
        imageType: initialData.imageType || "url",
        type: initialData.type || 1
      });
    } else {
      // Reset for create mode
      setFormData({
        title: "",
        description: "",
        price: 0,
        maxStudent: 0,
        isFeatured: false,
        imageTempKey: "",
        imageType: "url",
        type: 1
      });
    }
  }, [initialData, show]);

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{initialData ? "Edit Course" : "Create New Course"}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-3">
                {/* Title */}
                <div className="col-md-12">
                  <label className="form-label">Course Title <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                {/* Price & Max Student */}
                <div className="col-md-6">
                  <label className="form-label">Price (VND)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Max Students (0 = Unlimited)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.maxStudent}
                    onChange={(e) => setFormData({ ...formData, maxStudent: parseInt(e.target.value) })}
                  />
                </div>

                {/* Description */}
                <div className="col-md-12">
                  <label className="form-label">Description (Markdown)</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  ></textarea>
                </div>

                {/* Image Key (Mock Upload) */}
                <div className="col-md-12">
                  <label className="form-label">Image Key / URL</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter image key or URL"
                    value={formData.imageTempKey}
                    onChange={(e) => setFormData({ ...formData, imageTempKey: e.target.value })}
                  />
                  <small className="text-muted">For demo, enter a valid image URL here.</small>
                </div>

                {/* Options */}
                <div className="col-md-12">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="featuredCheck"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="featuredCheck">Is Featured Course?</label>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary d-flex align-items-center">
                <MdSave className="me-2" /> Save Course
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
