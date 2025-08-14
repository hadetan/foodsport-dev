import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useRouter } from "next/navigation";
import styles from "@/app/shared/css/Header.module.css";

export default function Search({ sortedActivities }) {
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const searchInputRef = useRef(null);
    const dropdownRef = useRef(null);
    const router = useRouter();

    const filteredSearchResults = useMemo(() => {
        if (!searchValue.trim()) return [];
        return sortedActivities.filter(a =>
            a.title && a.title.toLowerCase().includes(searchValue.trim().toLowerCase())
        );
    }, [searchValue, sortedActivities]);

    const handleOpenSearch = () => {
        setSearchOpen(true);
        setTimeout(() => {
            searchInputRef.current && searchInputRef.current.focus();
        }, 100);
    };

    const handleCloseSearch = () => {
        setSearchOpen(false);
        setShowDropdown(false);
        setSearchValue("");
    };

    useEffect(() => {
        if (!searchOpen) return;
        function handleClick(e) {
            if (
                searchInputRef.current &&
                !searchInputRef.current.contains(e.target) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                handleCloseSearch();
            }
        }
        function handleEsc(e) {
            if (e.key === "Escape") handleCloseSearch();
        }
        document.addEventListener("mousedown", handleClick);
        document.addEventListener("keydown", handleEsc);
        return () => {
            document.removeEventListener("mousedown", handleClick);
            document.removeEventListener("keydown", handleEsc);
        };
    }, [searchOpen]);

    useEffect(() => {
        if (searchOpen && searchValue.trim()) {
            setShowDropdown(true);
        } else {
            setShowDropdown(false);
        }
    }, [searchOpen, searchValue]);

    const handleInputChange = (e) => {
        setSearchValue(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchValue.trim()) {
            router.push(`/activities?activity=${encodeURIComponent(searchValue.trim())}`);
            handleCloseSearch();
        }
    };

    const handleResultClick = (id) => {
        router.push(`/activities/${id}`);
        handleCloseSearch();
    };

    return (
        <div className={styles.searchContainer}>
            {searchOpen ? (
                <form
                    className={styles.searchForm}
                    onSubmit={handleSearchSubmit}
                    autoComplete="off"
                    style={{ position: "relative" }}
                >
                    <input
                        ref={searchInputRef}
                        className={styles.searchInput}
                        type="text"
                        value={searchValue}
                        onChange={handleInputChange}
                        placeholder="Search activities..."
                        onFocus={() => searchValue && setShowDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                    />
                    <button
                        type="submit"
                        className={styles.searchIconBtn}
                        aria-label="Search"
                        onMouseDown={e => e.preventDefault()}
                    >
                        <FaSearch />
                    </button>
                    {/* Dropdown */}
                    <div
                        ref={dropdownRef}
                        className={[
                            styles.searchDropdown,
                            showDropdown ? styles.dropdownOpen : ""
                        ].join(" ")}
                        style={{
                            pointerEvents: showDropdown ? "auto" : "none",
                            maxHeight: showDropdown ? 320 : 0,
                            transition: "max-height 0.25s cubic-bezier(.4,2,.6,1)",
                            overflow: "hidden",
                            position: "absolute",
                            top: "110%",
                            left: 0,
                            right: 0,
                            zIndex: 1000,
                            background: "#fff",
                            borderRadius: "0 0 8px 8px",
                            boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                        }}
                    >
                        {searchValue && filteredSearchResults.length === 0 && (
                            <div className={styles.noResults}>No results found</div>
                        )}
                        {filteredSearchResults.map((a) => (
                            <div
                                key={a.id}
                                className={styles.dropdownItem}
                                onMouseDown={() => handleResultClick(a.id)}
                                style={{ cursor: "pointer", padding: "0.75rem 1rem", display: "flex", flexDirection: "column", borderBottom: "1px solid #f0f0f0" }}
                            >
                                <span style={{ fontWeight: 600 }}>{a.title}</span>
                                <span style={{ fontSize: "0.95em", color: "#888" }}>{a.activityType} &middot; {a.startDate ? new Date(a.startDate).toLocaleDateString() : ""}</span>
                            </div>
                        ))}
                    </div>
                </form>
            ) : (
                <span
                    className={`${styles.icon} ${styles.borderLeft}`}
                    onClick={handleOpenSearch}
                    style={{ cursor: "pointer" }}
                >
                    <FaSearch />
                </span>
            )}
        </div>
    );
}
