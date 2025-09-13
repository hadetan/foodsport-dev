import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from 'next-intl';
import { FaSearch } from "react-icons/fa";
import { useRouter } from "next/navigation";
import styles from "@/app/shared/css/Header.module.css";


export default function Search({ sortedActivities }) {
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const searchInputRef = useRef(null);
    const dropdownRef = useRef(null);
    const mouseDownOnOption = useRef(false);
    const router = useRouter();
    const t = useTranslations();

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
        setFocusedIndex(-1);
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
        document.addEventListener("mousedown", handleClick);
        return () => {
            document.removeEventListener("mousedown", handleClick);
        };
    }, [searchOpen]);

    useEffect(() => {
        if (searchOpen && searchValue.trim()) {
            setShowDropdown(true);
        } else {
            setShowDropdown(false);
        }
        setFocusedIndex(-1);
    }, [searchOpen, searchValue]);

    // Remove document-level keydown, move to input

    const handleInputChange = (e) => {
        setSearchValue(e.target.value);
    };

    const handleInputKeyDown = (e) => {
        if (!showDropdown || filteredSearchResults.length === 0) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setFocusedIndex(prev => (prev + 1) % filteredSearchResults.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setFocusedIndex(prev => (prev - 1 + filteredSearchResults.length) % filteredSearchResults.length);
        } else if (e.key === "Enter") {
            if (focusedIndex >= 0 && focusedIndex < filteredSearchResults.length) {
                handleResultClick(filteredSearchResults[focusedIndex].id);
            }
        } else if (e.key === "Escape") {
            handleCloseSearch();
        }
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
                        onKeyDown={handleInputKeyDown}
                        placeholder={t('Search.placeholder')}
                        onFocus={() => searchValue && setShowDropdown(true)}
                        onBlur={e => {
                            // If a dropdown option is being clicked, don't close
                            setTimeout(() => {
                                if (!mouseDownOnOption.current) setShowDropdown(false);
                            }, 0);
                        }}
                        role="combobox"
                        aria-autocomplete="list"
                        aria-expanded={showDropdown}
                        aria-controls="search-dropdown-listbox"
                        aria-activedescendant={
                            focusedIndex >= 0 && showDropdown && filteredSearchResults[focusedIndex]
                                ? `search-option-${filteredSearchResults[focusedIndex].id}`
                                : undefined
                        }
                        tabIndex={0}
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
                        id="search-dropdown-listbox"
                        role="listbox"
                        style={{
                            pointerEvents: showDropdown ? "auto" : "none",
                            maxHeight: showDropdown ? 320 : 0,
                            transition: "max-height 0.25s cubic-bezier(.4,2,.6,1)",
                            overflow: "auto",
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
                        {filteredSearchResults.map((a, idx) => (
                            <div
                                key={a.id}
                                id={`search-option-${a.id}`}
                                className={styles.dropdownItem}
                                role="option"
                                aria-selected={focusedIndex === idx}
                                tabIndex={-1}
                                onMouseDown={() => {
                                    mouseDownOnOption.current = true;
                                    handleResultClick(a.id);
                                }}
                                onMouseUp={() => {
                                    mouseDownOnOption.current = false;
                                }}
                                onMouseLeave={() => {
                                    mouseDownOnOption.current = false;
                                }}
                                style={{
                                    cursor: "pointer",
                                    padding: "0.75rem 1rem",
                                    display: "flex",
                                    flexDirection: "column",
                                    borderBottom: "1px solid #ced3a2ff",
                                    background: focusedIndex === idx ? "#c0f8ecff" : undefined
                                }}
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
