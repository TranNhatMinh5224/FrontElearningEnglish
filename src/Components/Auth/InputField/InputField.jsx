import React from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./InputField.css";

export default function InputField({
    type = "text",
    placeholder,
    value,
    onChange,
    error,
    disabled = false,
    showPasswordToggle = false,
    onTogglePassword,
    showPassword = false,
    name,
    maxLength,
    ...rest
}) {
    const containerClasses = [
        "input-field-container",
        error ? "error" : "",
        showPasswordToggle ? "has-password-toggle" : ""
    ].filter(Boolean).join(" ");

    return (
        <div className="input-field-wrapper">
            <div className={containerClasses}>
                <input
                    type={showPasswordToggle ? (showPassword ? "text" : "password") : type}
                    className="input-field"
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    name={name}
                    maxLength={maxLength !== undefined ? maxLength : (showPasswordToggle ? 20 : undefined)}
                    {...rest}
                />
                {showPasswordToggle && (
                    <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={onTogglePassword}
                        tabIndex={-1}
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                )}
            </div>
            {error && <span className="input-field-error">{error}</span>}
        </div>
    );
}

