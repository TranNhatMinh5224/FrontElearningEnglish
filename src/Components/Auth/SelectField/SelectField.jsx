import React from "react";
import Select from "react-select";
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
    // Custom styles for react-select to match InputField.css
    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            height: "52px",
            minHeight: "52px",
            borderRadius: "14px",
            borderColor: error ? "#ef4444" : (state.isFocused ? "#7a3df0" : "#d1d5db"),
            boxShadow: state.isFocused 
                ? (error ? "0 0 0 3px rgba(239, 68, 68, 0.15)" : "0 0 0 3px rgba(122, 61, 240, 0.15)") 
                : "none",
            "&:hover": {
                borderColor: error ? "#ef4444" : (state.isFocused ? "#7a3df0" : "#b0b0b0")
            },
            backgroundColor: disabled ? "#f3f4f6" : "white",
            fontSize: "15px",
            paddingLeft: "6px"
        }),
        valueContainer: (provided) => ({
            ...provided,
            height: "52px",
            padding: "0 8px"
        }),
        input: (provided) => ({
            ...provided,
            margin: "0",
            padding: "0"
        }),
        singleValue: (provided) => ({
            ...provided,
            color: "#1f2937"
        }),
        placeholder: (provided) => ({
            ...provided,
            color: "#9ca3af"
        }),
        menu: (provided) => ({
            ...provided,
            zIndex: 9999,
            borderRadius: "12px",
            overflow: "hidden",
            marginTop: "4px"
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected 
                ? "#7a3df0" 
                : state.isFocused 
                    ? "rgba(122, 61, 240, 0.1)" 
                    : "white",
            color: state.isSelected ? "white" : "#1f2937",
            cursor: "pointer",
            "&:active": {
                backgroundColor: "#7a3df0"
            }
        })
    };

    // Find the selected option object based on the value prop
    const selectedOption = options.find(opt => opt.value === value) || null;

    const handleChange = (selectedOption) => {
        const newValue = selectedOption ? selectedOption.value : "";
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
                <Select
                    value={selectedOption}
                    onChange={handleChange}
                    options={options}
                    isDisabled={disabled}
                    placeholder={placeholder}
                    styles={customStyles}
                    menuPlacement="bottom"
                    isSearchable={false}
                    name={name}
                />
            </div>
            {error && typeof error === "string" && <span className="select-field-error">{error}</span>}
        </div>
    );
}
