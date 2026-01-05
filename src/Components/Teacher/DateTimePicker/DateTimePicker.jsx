import React, { useState, useRef, useEffect } from "react";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import ScrollPicker from "../../Auth/ScrollPicker/ScrollPicker";
import { Row, Col } from "react-bootstrap";
import "./DateTimePicker.css";

export default function DateTimePicker({ 
  value, 
  onChange, 
  min, 
  max,
  placeholder = "dd/mm/yyyy HH:mm",
  hasError = false,
  disabled = false,
  label = "",
  required = false,
  dateOnly = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState("");
  const [hour, setHour] = useState(""); // 1-12
  const [minute, setMinute] = useState(""); // 0-59
  const [ampm, setAmpm] = useState(""); // "AM" or "PM"
  const [displayValue, setDisplayValue] = useState("");
  const pickerRef = useRef(null);

  // Initialize from value prop
  useEffect(() => {
    if (value) {
      const dateObj = new Date(value);
      if (!isNaN(dateObj.getTime())) {
        // Format date: dd/mm/yyyy
        const day = String(dateObj.getDate()).padStart(2, "0");
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const year = dateObj.getFullYear();
        const formattedDate = `${day}/${month}/${year}`;
        
        if (dateOnly) {
          // Date only mode
          setDate(formattedDate);
          setDisplayValue(formattedDate);
          setHour("");
          setMinute("");
          setAmpm("");
        } else {
          // Format time: 12-hour format with AM/PM
          let hours = dateObj.getHours();
          const minutes = dateObj.getMinutes();
          const isPM = hours >= 12;
          if (hours === 0) hours = 12;
          else if (hours > 12) hours = hours - 12;
          
          setDate(formattedDate);
          setHour(hours.toString());
          setMinute(String(minutes).padStart(2, "0"));
          setAmpm(isPM ? "PM" : "AM");
          
          const formattedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${isPM ? "PM" : "AM"}`;
          setDisplayValue(`${formattedDate} ${formattedTime}`);
        }
      } else {
        setDate("");
        setHour("");
        setMinute("");
        setAmpm("");
        setDisplayValue("");
      }
    } else {
      setDate("");
      setHour("");
      setMinute("");
      setAmpm("");
      setDisplayValue("");
    }
  }, [value, dateOnly]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Parse date string (dd/mm/yyyy) to Date object
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split("/");
    if (parts.length !== 3) return null;
    const [day, month, year] = parts.map(Number);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    return new Date(year, month - 1, day);
  };

  // Combine date and time into DateTime
  const combineDateTime = (dateStr, hourStr, minuteStr, ampmStr) => {
    const dateObj = parseDate(dateStr);
    if (!dateObj || !hourStr || !minuteStr || !ampmStr) return null;
    
    let hours = parseInt(hourStr);
    const minutes = parseInt(minuteStr);
    
    if (isNaN(hours) || isNaN(minutes)) return null;
    
    // Convert 12-hour to 24-hour format
    if (ampmStr === "PM" && hours !== 12) {
      hours += 12;
    } else if (ampmStr === "AM" && hours === 12) {
      hours = 0;
    }
    
    dateObj.setHours(hours, minutes, 0, 0);
    return dateObj;
  };

  // Handle date change from date input
  const handleDateInputChange = (e) => {
    const inputValue = e.target.value; // Format: yyyy-mm-dd
    if (inputValue) {
      const [year, month, day] = inputValue.split("-");
      const formattedDate = `${day}/${month}/${year}`;
      setDate(formattedDate);
      
      if (dateOnly) {
        // Date only mode: set to start of day
        const dateObj = parseDate(formattedDate);
        if (dateObj) {
          dateObj.setHours(0, 0, 0, 0);
          setDisplayValue(formattedDate);
          onChange(dateObj);
        }
      } else {
        if (hour && minute && ampm) {
          const dateTime = combineDateTime(formattedDate, hour, minute, ampm);
          if (dateTime) {
            const formattedTime = `${String(hour).padStart(2, "0")}:${minute} ${ampm}`;
            setDisplayValue(`${formattedDate} ${formattedTime}`);
            onChange(dateTime);
          }
        } else {
          setDisplayValue(formattedDate);
          onChange(null);
        }
      }
    } else {
      setDate("");
      if (dateOnly) {
        setDisplayValue("");
      } else {
        const timePart = hour && minute && ampm ? `${String(hour).padStart(2, "0")}:${minute} ${ampm}` : "";
        setDisplayValue(timePart);
      }
      onChange(null);
    }
  };

  // Handle hour change
  const handleHourChange = (newHour) => {
    setHour(newHour);
    if (date && newHour && minute && ampm) {
      const dateTime = combineDateTime(date, newHour, minute, ampm);
      if (dateTime) {
        const formattedTime = `${String(newHour).padStart(2, "0")}:${minute} ${ampm}`;
        setDisplayValue(`${date} ${formattedTime}`);
        onChange(dateTime);
      }
    }
  };

  // Handle minute change
  const handleMinuteChange = (newMinute) => {
    setMinute(newMinute);
    if (date && hour && newMinute && ampm) {
      const dateTime = combineDateTime(date, hour, newMinute, ampm);
      if (dateTime) {
        const formattedTime = `${String(hour).padStart(2, "0")}:${newMinute} ${ampm}`;
        setDisplayValue(`${date} ${formattedTime}`);
        onChange(dateTime);
      }
    }
  };

  // Handle AM/PM change
  const handleAmpmChange = (newAmpm) => {
    setAmpm(newAmpm);
    if (date && hour && minute && newAmpm) {
      const dateTime = combineDateTime(date, hour, minute, newAmpm);
      if (dateTime) {
        const formattedTime = `${String(hour).padStart(2, "0")}:${minute} ${newAmpm}`;
        setDisplayValue(`${date} ${formattedTime}`);
        onChange(dateTime);
      }
    }
  };

  // Generate hour options (1-12)
  const generateHours = () => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: (i + 1).toString(),
      label: String(i + 1).padStart(2, "0"),
    }));
  };

  // Generate minute options (0-59)
  const generateMinutes = () => {
    return Array.from({ length: 60 }, (_, i) => ({
      value: String(i).padStart(2, "0"),
      label: String(i).padStart(2, "0"),
    }));
  };

  // Generate AM/PM options
  const generateAmpm = () => {
    return [
      { value: "AM", label: "AM" },
      { value: "PM", label: "PM" },
    ];
  };

  // Format date for input (yyyy-mm-dd)
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("/");
    if (parts.length !== 3) return "";
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
  };

  // Get min/max values for inputs
  const getMinDate = () => {
    if (min) {
      const minDate = new Date(min);
      return minDate.toISOString().slice(0, 10);
    }
    return "";
  };

  const getMaxDate = () => {
    if (max) {
      const maxDate = new Date(max);
      return maxDate.toISOString().slice(0, 10);
    }
    return "";
  };

  // Validate time against min/max constraints
  const validateTime = (hourStr, minuteStr, ampmStr) => {
    if (!date || !hourStr || !minuteStr || !ampmStr) return true;
    
    const dateTime = combineDateTime(date, hourStr, minuteStr, ampmStr);
    if (!dateTime) return true;
    
    if (min && dateTime < new Date(min)) return false;
    if (max && dateTime > new Date(max)) return false;
    
    return true;
  };

  return (
    <div className="datetime-picker-wrapper" ref={pickerRef}>
      {label && (
        <label className={`datetime-picker-label ${required ? "required" : ""}`}>
          {label}
        </label>
      )}
      <div 
        className={`datetime-picker-input-wrapper ${hasError ? "has-error" : ""} ${disabled ? "disabled" : ""} ${isOpen ? "open" : ""}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="datetime-picker-display">
          {displayValue ? (
            <span className="datetime-picker-value">{displayValue}</span>
          ) : (
            <span className="datetime-picker-placeholder">{placeholder}</span>
          )}
        </div>
        <div className="datetime-picker-icons">
          <FaCalendarAlt className="datetime-picker-icon" />
          <FaClock className="datetime-picker-icon" />
        </div>
      </div>
      
      {isOpen && !disabled && (
        <div className="datetime-picker-dropdown">
          <div className="datetime-picker-section">
            <div className="datetime-picker-section-header">
              <FaCalendarAlt />
              <span>Chọn ngày</span>
            </div>
            <input
              type="text"
              className="datetime-picker-date-input"
              value={date}
              onChange={(e) => {
                const input = e.target.value;
                // Auto-format as user types: dd/mm/yyyy
                let formatted = input.replace(/[^\d]/g, ''); // Remove non-digits
                
                if (formatted.length >= 2) {
                  formatted = formatted.slice(0, 2) + '/' + formatted.slice(2);
                }
                if (formatted.length >= 5) {
                  formatted = formatted.slice(0, 5) + '/' + formatted.slice(5);
                }
                if (formatted.length > 10) {
                  formatted = formatted.slice(0, 10);
                }
                
                setDate(formatted);
                
                // Try to parse and set date if valid
                if (formatted.length === 10) {
                  const parts = formatted.split('/');
                  if (parts.length === 3) {
                    const [day, month, year] = parts.map(Number);
                    if (!isNaN(day) && !isNaN(month) && !isNaN(year) && 
                        day >= 1 && day <= 31 && 
                        month >= 1 && month <= 12 && 
                        year >= 1900 && year <= 2100) {
                      const dateObj = new Date(year, month - 1, day);
                      if (!isNaN(dateObj.getTime())) {
                        if (dateOnly) {
                          dateObj.setHours(0, 0, 0, 0);
                          setDisplayValue(formatted);
                          onChange(dateObj);
                        } else {
                          if (hour && minute && ampm) {
                            const dateTime = combineDateTime(formatted, hour, minute, ampm);
                            if (dateTime) {
                              const formattedTime = `${String(hour).padStart(2, "0")}:${minute} ${ampm}`;
                              setDisplayValue(`${formatted} ${formattedTime}`);
                              onChange(dateTime);
                            }
                          } else {
                            setDisplayValue(formatted);
                          }
                        }
                      }
                    }
                  }
                }
              }}
              placeholder="dd/mm/yyyy"
              maxLength={10}
            />
            <div style={{ fontSize: "0.8em", color: "#6c757d", marginTop: "4px" }}>
              Nhập theo định dạng: ngày/tháng/năm (ví dụ: 05/01/2026)
            </div>
          </div>
          
          {!dateOnly && (
            <div className="datetime-picker-section">
              <div className="datetime-picker-section-header">
                <FaClock />
                <span>Chọn giờ</span>
              </div>
            <Row className="datetime-picker-time-row">
              <Col className="datetime-picker-time-col">
                <ScrollPicker
                  options={generateHours()}
                  value={hour}
                  onChange={handleHourChange}
                  placeholder="Giờ"
                  hasError={false}
                />
                <span className="datetime-picker-time-label">Giờ</span>
              </Col>
              <Col className="datetime-picker-time-col">
                <ScrollPicker
                  options={generateMinutes()}
                  value={minute}
                  onChange={handleMinuteChange}
                  placeholder="Phút"
                  hasError={false}
                />
                <span className="datetime-picker-time-label">Phút</span>
              </Col>
              <Col className="datetime-picker-time-col">
                <ScrollPicker
                  options={generateAmpm()}
                  value={ampm}
                  onChange={handleAmpmChange}
                  placeholder="AM/PM"
                  hasError={false}
                />
                <span className="datetime-picker-time-label">AM/PM</span>
              </Col>
            </Row>
          </div>
          )}
          
          <div className="datetime-picker-actions">
            <button
              type="button"
              className="datetime-picker-clear-btn"
              onClick={() => {
                setDate("");
                setHour("");
                setMinute("");
                setAmpm("");
                setDisplayValue("");
                onChange(null);
              }}
            >
              Xóa
            </button>
            <button
              type="button"
              className="datetime-picker-close-btn"
              onClick={() => setIsOpen(false)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

