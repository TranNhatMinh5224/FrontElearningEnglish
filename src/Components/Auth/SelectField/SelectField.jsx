import React from "react";
import ScrollPicker from "../ScrollPicker/ScrollPicker";
import "./SelectField.css";

export default function SelectField({
    value,
    onChange,
    options = [],
    placeholder = "Chọn...",
    error,
    disabled = false,
    name,
}) {
    const handleChange = (newValue) => {
        const event = {
            target: {
                name: name,
                value: newValue,
            },
        };
        onChange(event);
    };

    return (
        <div className="select-field-wrapper">
            <div className={`select-field-container ${error ? "error" : ""}`}>
                <ScrollPicker
                    options={options}
                    value={value}
                    onChange={handleChange}
                    disabled={disabled}
                    placeholder={placeholder}
                    hasError={!!error}
                />
            </div>
            {error && <span className="select-field-error">{error}</span>}
        </div>
    );
}
