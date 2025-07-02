import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { getAllFunctions } from "@/data";

interface SlashCommandMenuProps {
  onSelect: (functionId: string) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

export function SlashCommandMenu({ onSelect, onClose, position }: SlashCommandMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const functions = useMemo(() => getAllFunctions(), []);

  // Handle selection
  const handleSelect = useCallback((index: number) => {
    if (functions[index]) {
      onSelect(functions[index].id);
    }
  }, [functions, onSelect]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % functions.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + functions.length) % functions.length);
          break;
        case "Enter":
          e.preventDefault();
          handleSelect(selectedIndex);
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [functions.length, selectedIndex, handleSelect, onClose]);

  // Click outside detection
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside, true);
    return () => document.removeEventListener("mousedown", handleClickOutside, true);
  }, [onClose]);

  useEffect(() => {
    menuRef.current?.focus();
  }, []);

  return (
    <div
      ref={menuRef}
      className="absolute z-50 w-80 max-h-64 overflow-y-auto bg-white border rounded-md shadow-lg"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      tabIndex={-1}
      role="listbox"
      aria-label="Function selection menu"
    >
      <div className="p-1">
        {functions.map((func, index) => (
          <button
            key={func.id}
            className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
              index === selectedIndex
                ? "bg-blue-100 text-blue-900"
                : "hover:bg-gray-100"
            }`}
            onClick={() => handleSelect(index)}
            onMouseEnter={() => setSelectedIndex(index)}
            role="option"
            aria-selected={index === selectedIndex}
          >
            <div className="font-medium text-sm">{func.displayName}</div>
            <div className="text-xs text-gray-600">{func.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}