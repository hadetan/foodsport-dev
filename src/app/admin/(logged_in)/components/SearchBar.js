import React from "react";
import { Search } from "lucide-react";

const SearchBar = ({ searchQuery, setSearchQuery,placeholderName }) => {
    return (
        <>
            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <label className="flex relative input">
                    <input
                        type="text"
                        placeholder={placeholderName}
                        className="grow h-10 input-bordered w-full md:max-w-md pr-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </label>
            </div>

        </>
    );
};

export default SearchBar;