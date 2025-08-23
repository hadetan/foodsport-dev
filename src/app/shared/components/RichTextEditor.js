"use client";

import { useRef, useState, useEffect } from "react";

const BLOCK_TYPES = [
    { label: "Paragraph", command: "formatBlock", value: "P" },
    { label: "Quote", command: "formatBlock", value: "BLOCKQUOTE" },
    { label: "Heading 1", command: "formatBlock", value: "H1" },
    { label: "Heading 2", command: "formatBlock", value: "H2" },
    { label: "Heading 3", command: "formatBlock", value: "H3" },
];

// Helper to select current word if no selection
function selectCurrentWord() {
    const selection = window.getSelection();
    if (!selection || !selection.focusNode) return;
    if (!selection.isCollapsed) return; // already selected

    const node = selection.focusNode;
    if (node.nodeType !== Node.TEXT_NODE) return;

    const text = node.textContent;
    let offset = selection.focusOffset;
    let start = offset,
        end = offset;

    while (start > 0 && /\S/.test(text[start - 1])) start--;
    while (end < text.length && /\S/.test(text[end])) end++;

    const range = document.createRange();
    range.setStart(node, start);
    range.setEnd(node, end);
    selection.removeAllRanges();
    selection.addRange(range);
}

export default function RichTextEditor({ value, onChange }) {
    const editorRef = useRef(null);
    const [blockType, setBlockType] = useState("Paragraph");

    // Set initial content only on mount
    useEffect(() => {
        if (
            editorRef.current &&
            value &&
            editorRef.current.innerHTML !== value
        ) {
            editorRef.current.innerHTML = value;
        }
        // eslint-disable-next-line
    }, []);

    // Handle toolbar actions
    const handleCommand = (command, value = null) => {
        editorRef.current.focus();
        const selection = window.getSelection();
        if (selection && selection.isCollapsed && selection.focusNode) {
            selectCurrentWord();
        }
        document.execCommand(command, false, value);
        if (onChange) onChange(editorRef.current.innerHTML);
    };

    // Handle block type change
    const handleBlockType = (type) => {
        editorRef.current.focus();
        document.execCommand("formatBlock", false, type.value);
        setBlockType(type.label);
        if (onChange) onChange(editorRef.current.innerHTML);
    };

    // Sync content on input
    const handleInput = () => {
        if (onChange) onChange(editorRef.current.innerHTML);
    };

    return (
        <div className="w-full">
            <div className="form-control flex items-center gap-4 mb-2">
                <span className="w-32 text-white">Summary</span>
                <div className="flex-1"></div>
            </div>
            <div className="rounded-lg border border-base-300 bg-base-100">
                {/* Toolbar */}
                <div className="flex items-center gap-2 px-2 py-1 border-b border-base-300 bg-base-200 rounded-t-lg sticky top-0 z-10">
                    {/* Bold */}
                    <button
                        type="button"
                        className="btn btn-xs btn-ghost"
                        onClick={() => handleCommand("bold")}
                        aria-label="Bold"
                    >
                        <b>B</b>
                    </button>
                    {/* Italic */}
                    <button
                        type="button"
                        className="btn btn-xs btn-ghost"
                        onClick={() => handleCommand("italic")}
                        aria-label="Italic"
                    >
                        <i>I</i>
                    </button>
                    {/* Underline */}
                    <button
                        type="button"
                        className="btn btn-xs btn-ghost"
                        onClick={() => handleCommand("underline")}
                        aria-label="Underline"
                    >
                        <u>U</u>
                    </button>
                    {/* Blockquote */}
                    <button
                        type="button"
                        className="btn btn-xs btn-ghost"
                        onClick={() => handleBlockType(BLOCK_TYPES[1])}
                        aria-label="Blockquote"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 17h6M9 13h6M7 7h10v6a2 2 0 01-2 2H9a2 2 0 01-2-2V7z"
                            ></path>
                        </svg>
                    </button>
                    {/* Undo */}
                    <button
                        type="button"
                        className="btn btn-xs btn-ghost"
                        onClick={() => handleCommand("undo")}
                        aria-label="Undo"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 14l-4-4 4-4M5 10h12a4 4 0 010 8h-1"
                            ></path>
                        </svg>
                    </button>
                    {/* Redo */}
                    <button
                        type="button"
                        className="btn btn-xs btn-ghost"
                        onClick={() => handleCommand("redo")}
                        aria-label="Redo"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 10l4 4-4 4M19 14H7a4 4 0 010-8h1"
                            ></path>
                        </svg>
                    </button>
                    {/* Block type dropdown - moved to left after redo */}
                    <div className="dropdown dropdown-hover">
                        <label
                            tabIndex={0}
                            className="btn btn-xs btn-ghost normal-case px-2"
                        >
                            {blockType}
                            <svg
                                className="ml-1 w-3 h-3 inline"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 9l-7 7-7-7"
                                ></path>
                            </svg>
                        </label>
                        <ul
                            tabIndex={0}
                            className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-36 z-20"
                        >
                            {BLOCK_TYPES.map((type) => (
                                <li key={type.label}>
                                    <button
                                        type="button"
                                        className="text-left"
                                        onClick={() => handleBlockType(type)}
                                    >
                                        {type.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                {/* Editor area */}
                <div
                    ref={editorRef}
                    className="min-h-[180px] max-h-[400px] w-full p-4 outline-none bg-base-100 text-base resize-y text-black"
                    contentEditable
                    spellCheck={true}
                    onInput={handleInput}
                    suppressContentEditableWarning={true}
                    style={{ borderRadius: "0 0 0.5rem 0.5rem" }}
                    dir="ltr"
                />
            </div>
        </div>
    );
}
