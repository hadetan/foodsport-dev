import React from "react";
import { ChevronDown } from "lucide-react";
const Dropdown = ({ items, name, selectedValue, onSelect }) => {
    const popoverId = `popover-${name.replace(/\s+/g, '-').toLowerCase()}`;
    
    const handleItemClick = (item) => {
        if (onSelect) {
            onSelect(item);
        }
        // Close popover
        document.getElementById(popoverId).hidePopover();
    };

    return (
        <>
            <div className="flex flex-col lg:flex-row gap-4 mb-6 w-40">
                <label className="flex relative input">
                    <button
                        popoverTarget={popoverId}
                        className="grow h-10 input-bordered w-full md:max-w-md pr-10"
                    >
                        {selectedValue || name}
                    </button>
                    <ChevronDown className="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </label>
            </div>

            <ul
                className="dropdown menu w-52 rounded-box bg-base-100 shadow-sm border-1"
                popover="auto"
                id={popoverId}
            >
                {items.map((item) => (
                    <li key={item}>
                        <button 
                            onClick={() => handleItemClick(item)}
                            className="w-full text-left"
                        >
                            {item}
                        </button>
                    </li>
                ))}
            </ul>
        </>
    );
};
export default Dropdown;
