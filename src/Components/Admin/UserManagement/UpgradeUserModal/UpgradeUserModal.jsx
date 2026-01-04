import React from "react";
import "./UpgradeUserModal.css";

export default function UpgradeUserModal({ 
  show, 
  onClose, 
  user, 
  packageId, 
  setPackageId, 
  onConfirm 
}) {
  if (!show) return null;

  return (
    <div className="upgrade-modal-overlay">
      <div className="upgrade-modal">
        <div className="modal-header">
          <h5 className="modal-title">Upgrade to Teacher</h5>
          <button 
            type="button" 
            className="btn-close" 
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <p className="upgrade-message">
            You are upgrading user <strong>{user?.email}</strong> to Teacher role.
          </p>
          
          <div className="form-group">
            <label className="form-label">Select Teacher Package</label>
            <select 
              className="form-select"
              value={packageId}
              onChange={(e) => setPackageId(e.target.value)}
            >
              <option value="1">Basic Teacher Package</option>
              <option value="2">Pro Teacher Package</option>
              <option value="3">Premium Teacher Package</option>
            </select>
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={onConfirm}
          >
            Confirm Upgrade
          </button>
        </div>
      </div>
    </div>
  );
}
