import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const Dropdown = ({ items, name, selectedValue, onSelect, searchable }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [internalSelected, setInternalSelected] = useState(
        selectedValue || ""
    );
    const dropdownRef = useRef(null);

    const handleToggle = () => {
        setIsOpen((prev) => !prev);
    };

    const handleItemClick = (item) => {
        setInternalSelected(item);
        if (onSelect) {
            onSelect(item);
        }
        setIsOpen(false);
        setSearchTerm("");
    };

    const filteredItems = searchable
        ? items.filter((item) =>
              item.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : items;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="dropdown w-40 relative" ref={dropdownRef}>
            <button
                type="button"
                className="btn w-full flex justify-between items-center input-bordered bg-base-100 text-base-content"
                onClick={handleToggle}
            >
                {internalSelected || name}
                <ChevronDown className="h-5 w-5 ml-2 text-gray-400" />
            </button>
            {isOpen && (
                <div className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 mt-1 z-50 absolute left-0">
                    {searchable && (
                        <input
                            type="text"
                            className="w-full px-2 py-1 border-b"
                            placeholder={`Search ${name}`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    )}
                    <ul>
                        {filteredItems.map((item) => (
                            <li key={item}>
                                <button
                                    type="button"
                                    className="w-full text-left"
                                    onClick={() => handleItemClick(item)}
                                >
                                    {item}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Dropdown;
