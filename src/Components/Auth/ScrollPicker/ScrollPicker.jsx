import React, { useRef, useEffect, useState } from "react";
import "./ScrollPicker.css";

export default function ScrollPicker({
    options = [],
    value,
    onChange,
    disabled = false,
    placeholder = "Chọn...",
    hasError = false,
}) {
    const scrollRef = useRef(null);
    const [isScrolling, setIsScrolling] = useState(false);

    const paddingCount = 2;

    useEffect(() => {
        if (scrollRef.current && value && options.length > 0) {
            const selectedIndex = options.findIndex((opt) => opt.value === value);
            if (selectedIndex !== -1) {
                const itemHeight = 50;
                const scrollPosition = (selectedIndex + paddingCount) * itemHeight;
                scrollRef.current.scrollTop = scrollPosition;
            }
        }
    }, [value, options]);

    const handleScroll = () => {
        if (!scrollRef.current || isScrolling) return;

        const itemHeight = 50;
        const scrollTop = scrollRef.current.scrollTop;
        const selectedIndex = Math.round(scrollTop / itemHeight) - paddingCount;

        if (selectedIndex >= 0 && selectedIndex < options.length) {
            const selectedOption = options[selectedIndex];
            if (selectedOption.value !== value) {
                onChange(selectedOption.value);
            }
        }
    };

    const handleScrollEnd = () => {
        if (!scrollRef.current || isScrolling || options.length === 0) return;

        setIsScrolling(true);
        const itemHeight = 50;
        const scrollTop = scrollRef.current.scrollTop;
        const selectedIndex = Math.round(scrollTop / itemHeight) - paddingCount;

        // Clamp selectedIndex to valid range
        const clampedIndex = Math.max(0, Math.min(selectedIndex, options.length - 1));

        // Smooth scroll to nearest item
        if (scrollRef.current) {
            const targetScroll = (clampedIndex + paddingCount) * itemHeight;
            scrollRef.current.scrollTo({
                top: targetScroll,
                behavior: "smooth",
            });
        }

        // Update value to clamped option
        if (clampedIndex >= 0 && clampedIndex < options.length) {
            const selectedOption = options[clampedIndex];
            if (selectedOption.value !== value) {
                onChange(selectedOption.value);
            }
        }

        setTimeout(() => {
            setIsScrolling(false);
        }, 300);
    };

    const handleItemClick = (optionValue) => {
        if (disabled) return;
        onChange(optionValue);

        // Scroll to clicked item
        if (scrollRef.current) {
            const selectedIndex = options.findIndex((opt) => opt.value === optionValue);
            if (selectedIndex !== -1) {
                const itemHeight = 50;
                const targetScroll = (selectedIndex + paddingCount) * itemHeight;
                scrollRef.current.scrollTo({
                    top: targetScroll,
                    behavior: "smooth",
                });
            }
        }
    };

    // Add padding items for better scrolling
    const paddingItems = Array.from({ length: paddingCount }, (_, i) => ({ value: `pad-top-${i}`, label: "" }));
    const bottomPaddingItems = Array.from({ length: paddingCount }, (_, i) => ({ value: `pad-bottom-${i}`, label: "" }));
    const displayOptions = [...paddingItems, ...options, ...bottomPaddingItems];

    return (
        <div className={`scroll-picker-container ${hasError ? "error" : ""}`}>
            <div
                className="scroll-picker-wrapper"
                ref={scrollRef}
                onScroll={handleScroll}
                onTouchEnd={handleScrollEnd}
                onMouseUp={handleScrollEnd}
            >
                {displayOptions.map((option, index) => {
                    const isPadding = option.value.startsWith("pad-");
                    // Check if this is the selected option (accounting for padding offset)
                    const actualIndex = index - paddingCount;
                    const isSelected = !isPadding && actualIndex >= 0 && actualIndex < options.length && options[actualIndex].value === value;

                    return (
                        <div
                            key={`${option.value}-${index}`}
                            className={`scroll-picker-item ${isSelected ? "selected" : ""} ${isPadding ? "padding" : ""}`}
                            onClick={() => !isPadding && actualIndex >= 0 && handleItemClick(options[actualIndex].value)}
                        >
                            {option.label || (actualIndex >= 0 && actualIndex < options.length ? options[actualIndex].label : option.value)}
                        </div>
                    );
                })}
            </div>
            <div className="scroll-picker-overlay-top"></div>
            <div className="scroll-picker-overlay-bottom"></div>
        </div>
    );
}

