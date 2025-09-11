import { useEditor, EditorContent } from "@tiptap/react";
import "./tiptap-editor.css";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { BulletList } from "@tiptap/extension-bullet-list";
import { OrderedList } from "@tiptap/extension-ordered-list";
import { ListItem } from "@tiptap/extension-list-item";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import {
    FaBold,
    FaItalic,
    FaUnderline,
    FaStrikethrough,
    FaListUl,
    FaListOl,
    FaLink,
    FaImage,
    FaMinus,
    FaAlignLeft,
    FaAlignCenter,
    FaAlignRight,
    FaAlignJustify,
} from "react-icons/fa6";
import { IoMdUndo, IoMdRedo } from "react-icons/io";
import { useEffect, useState, useCallback, useRef } from "react";

import { Node, mergeAttributes } from '@tiptap/core';

const FONT_FAMILIES = [
    { label: "Default Font", value: "" },
    { label: "Arial", value: "Arial, Helvetica, sans-serif" },
    { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
    { label: "Georgia", value: "Georgia, serif" },
    { label: "Courier New", value: "'Courier New', Courier, monospace" },
    { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
];

const ImageGrid = Node.create({
    name: 'imageGrid',
    group: 'block',
    content: 'image+',
    selectable: true,
    draggable: false,
    addAttributes() {
        return {
            cols: {
                default: 1,
            },
        };
    },
    parseHTML() {
        return [
            {
                tag: 'div.image-grid',
            },
        ];
    },
    renderHTML({ HTMLAttributes }) {
        const cols = HTMLAttributes.cols || 1;
        return [
            'div',
            mergeAttributes({ class: `image-grid image-grid-${cols}`, 'data-cols': cols }, HTMLAttributes),
            0,
        ];
    },
    addCommands() {
        return {
            setImageGrid:
                attrs =>
                ({ commands }) => {
                    return commands.wrapIn(this.name, attrs);
                },
            unsetImageGrid:
                () =>
                ({ commands }) => {
                    return commands.lift(this.name);
                },
        };
    },
});

export default function TiptapEditor({ value, onChange }) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                blockquote: false,
                code: false,
                codeBlock: false,
                table: false,
                taskList: false,
                taskItem: false,
                bulletList: false,
                orderedList: false,
                listItem: false,
            }),
            Underline,
            Link,
            Image,
            ImageGrid,
            BulletList.configure({
                HTMLAttributes: {
                    class: "list-disc pl-6",
                },
            }),
            OrderedList.configure({
                HTMLAttributes: {
                    class: "list-decimal pl-6",
                },
            }),
            ListItem,
            TextAlign.configure({
                types: ["heading", "paragraph"],
                alignments: ["left", "center", "right", "justify"],
                defaultAlignment: "left",
            }),
            TextStyle,
            FontFamily.configure({
                types: ["textStyle"],
            }),
        ],
        immediatelyRender: false,
        content: value || "",
        onUpdate: ({ editor }) => {
            if (onChange) onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "tiptap-editor",
                spellCheck: "true",
                dir: "ltr",
            },
            handleKeyDown(_, event) {
                try {
                    if (event.key === 'Tab') {
                        if (!editor) return false;

                        const { state } = editor;
                        const { $from } = state.selection;
                        let listDepth = 0;
                        for (let d = $from.depth; d > 0; d--) {
                            const node = $from.node(d);
                            if (!node) continue;
                            const name = node.type && node.type.name;
                            if (name === 'bulletList' || name === 'orderedList') listDepth++;
                        }

                        if (listDepth === 0) return false;

                        event.preventDefault();

                        const MAX_DEPTH = 4;

                        if (event.shiftKey) {
                            editor.chain().focus().liftListItem('listItem').run();
                            return true;
                        } else {
                            if (listDepth >= MAX_DEPTH) {
                                return true;
                            }
                            editor.chain().focus().sinkListItem('listItem').run();
                            return true;
                        }
                    }
                 } catch (err) {
                     console.error('handleKeyDown error', err);
                 }
                 return false;
             },
        },
    });

    const fileInputRef = useRef(null);

    const handleImageSelect = (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const src = e.target.result;
            if (src && editor) {
                editor.chain().focus().setImage({ src }).run();
            }
        };
        reader.readAsDataURL(file);
        event.target.value = "";
    };

    const [toolbarState, setToolbarState] = useState({});

    const computeToolbarState = useCallback(() => {
        if (!editor) return {};
        return {
            isBold: editor.isActive("bold"),
            canBold: editor.can().chain().toggleBold().run(),
            isItalic: editor.isActive("italic"),
            canItalic: editor.can().chain().toggleItalic().run(),
            isStrike: editor.isActive("strike"),
            canStrike: editor.can().chain().toggleStrike().run(),
            canClearMarks: editor.can().chain().unsetAllMarks().run(),
            isParagraph: editor.isActive("paragraph"),
            isHeading1: editor.isActive("heading", { level: 1 }),
            isHeading2: editor.isActive("heading", { level: 2 }),
            isHeading3: editor.isActive("heading", { level: 3 }),
            isBulletList: editor.isActive("bulletList"),
            isOrderedList: editor.isActive("orderedList"),
            canUndo: editor.can().chain().undo().run(),
            canRedo: editor.can().chain().redo().run(),
            alignLeft: editor.isActive({ textAlign: "left" }),
            alignCenter: editor.isActive({ textAlign: "center" }),
            alignRight: editor.isActive({ textAlign: "right" }),
            alignJustify: editor.isActive({ textAlign: "justify" }),
            currentFontFamily:
                editor.getAttributes("textStyle")?.fontFamily || "",
            isImageGrid: editor.isActive('imageGrid'),
            currentImageGridCols: editor.getAttributes('imageGrid')?.cols || 1,
        };
    }, [editor]);

    useEffect(() => {
        if (!editor) return;
        setToolbarState(computeToolbarState());
        const updateHandler = () => setToolbarState(computeToolbarState());
        editor.on("update", updateHandler);
        editor.on("selectionUpdate", updateHandler);
        return () => {
            editor.off("update", updateHandler);
            editor.off("selectionUpdate", updateHandler);
        };
    }, [editor, computeToolbarState]);

    useEffect(() => {
        if (editor && value && editor.getHTML() !== value) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    if (!editor)
        return (
            <div className="bg-base-100 rounded-lg min-h-[320px] animate-pulse" />
        );
    
    const handleLink = () => {
        try {
            const current = editor.isActive('link') ? editor.getAttributes('link') || {} : {};
            const currentHref = current.href || '';
            const url = window.prompt('Enter URL (leave empty to remove)', currentHref);
            if (url === null) return;
            const trimmed = url.trim();
            if (trimmed === '') {
                if (editor.isActive('link')) {
                    editor.chain().focus().unsetLink().run();
                }
                return;
            }

            const schemeMatch = trimmed.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
            const allowedSchemes = ['http', 'https', 'mailto', 'tel'];
            if (schemeMatch && !allowedSchemes.includes(schemeMatch[1].toLowerCase())) {
                window.alert('Invalid URL scheme. Please use http(s), mailto, or tel.');
                return;
            }

            let finalUrl = trimmed;
            if (!/^([a-zA-Z][a-zA-Z0-9+.-]*):/.test(finalUrl)) {
                finalUrl = 'https://' + finalUrl;
            }

            const openInNewTab = window.confirm('Open link in new tab? (OK = yes, Cancel = no)');
            const attrs = { href: finalUrl };
            if (openInNewTab) {
                attrs.target = '_blank';
                attrs.rel = 'noopener noreferrer';
            } else {
                attrs.target = undefined;
                attrs.rel = undefined;
            }

            if (editor.isActive('link')) {
                editor.chain().focus().extendMarkRange('link').setLink(attrs).run();
            } else {
                editor.chain().focus().setLink(attrs).run();
            }
        } catch (err) {
            console.error('Link command failed', err);
        }
    }

    return (
        <div className="w-full max-w-full h-full">
            <div className="relative bg-base-200 rounded-t-lg border border-base-300 px-2 py-1 flex flex-wrap items-center gap-1 justify-center">
                {/* Heading Dropdown */}
                <div className="relative">
                    <select
                        className={`p-2 rounded bg-base-100 text-base-content border border-base-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none`}
                        value={
                            toolbarState.isHeading1
                                ? "h1"
                                : toolbarState.isHeading2
                                ? "h2"
                                : toolbarState.isHeading3
                                ? "h3"
                                : "p"
                        }
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === "h1")
                                editor
                                    .chain()
                                    .focus()
                                    .toggleHeading({ level: 1 })
                                    .run();
                            else if (val === "h2")
                                editor
                                    .chain()
                                    .focus()
                                    .toggleHeading({ level: 2 })
                                    .run();
                            else if (val === "h3")
                                editor
                                    .chain()
                                    .focus()
                                    .toggleHeading({ level: 3 })
                                    .run();
                            else editor.chain().focus().setParagraph().run();
                        }}
                        title="Heading Level"
                    >
                        <option value="p">Paragraph</option>
                        <option value="h1">Heading 1</option>
                        <option value="h2">Heading 2</option>
                        <option value="h3">Heading 3</option>
                    </select>
                </div>
                {/* Font Family Dropdown */}
                <div className="relative">
                    <select
                        className="p-2 rounded bg-base-100 text-base-content border border-base-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none"
                        value={toolbarState.currentFontFamily}
                        onChange={(e) =>
                            editor
                                .chain()
                                .focus()
                                .setFontFamily(e.target.value)
                                .run()
                        }
                        title="Font Family"
                        style={{ minWidth: 120 }}
                    >
                        {FONT_FAMILIES.map((f) => (
                            <option key={f.value} value={f.value}>
                                {f.label}
                            </option>
                        ))}
                    </select>
                </div>
                {/* Layout / Image Grid Dropdown */}
                <div className="relative">
                    <select
                        className="p-2 rounded bg-base-100 text-base-content border border-base-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none"
                        value={toolbarState.currentImageGridCols || 1}
                        onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (val === 1) {
                                if (editor.isActive('imageGrid')) {
                                    editor.chain().focus().unsetImageGrid().run();
                                }
                            } else {
                                if (editor.isActive('imageGrid')) {
                                    editor.chain().focus().updateAttributes('imageGrid', { cols: val }).run();
                                } else {
                                    editor.chain().focus().setImageGrid({ cols: val }).run();
                                }
                            }
                        }}
                        title="Layout / Image Grid"
                        style={{ minWidth: 120 }}
                    >
                        <option value={1}>Default Layout</option>
                        <option value={2}>Grid 2</option>
                        <option value={3}>Grid 3</option>
                    </select>
                </div>
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={!toolbarState.canBold}
                    className={`p-2 rounded hover:bg-base-300 ${
                        toolbarState.isBold
                            ? "bg-base-300 text-yellow-400"
                            : "text-base-content"
                    }`}
                    title="Bold"
                >
                    <FaBold />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={!toolbarState.canItalic}
                    className={`p-2 rounded hover:bg-base-300 ${
                        toolbarState.isItalic
                            ? "bg-base-300 text-yellow-400"
                            : "text-base-content"
                    }`}
                    title="Italic"
                >
                    <FaItalic />
                </button>
                <button
                    onClick={() =>
                        editor.chain().focus().toggleUnderline().run()
                    }
                    className={`p-2 rounded hover:bg-base-300 ${
                        editor.isActive("underline")
                            ? "bg-base-300 text-yellow-400"
                            : "text-base-content"
                    }`}
                    title="Underline"
                >
                    <FaUnderline />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    disabled={!toolbarState.canStrike}
                    className={`p-2 rounded hover:bg-base-300 ${
                        toolbarState.isStrike
                            ? "bg-base-300 text-yellow-400"
                            : "text-base-content"
                    }`}
                    title="Strikethrough"
                >
                    <FaStrikethrough />
                </button>
                <button
                    onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                    className={`p-2 rounded hover:bg-base-300 ${
                        toolbarState.isBulletList
                            ? "bg-base-300 text-yellow-400"
                            : "text-base-content"
                    }`}
                    title="Bullet List"
                >
                    <FaListUl />
                </button>
                <button
                    onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                    }
                    className={`p-2 rounded hover:bg-base-300 ${
                        toolbarState.isOrderedList
                            ? "bg-base-300 text-yellow-400"
                            : "text-base-content"
                    }`}
                    title="Ordered List"
                >
                    <FaListOl />
                </button>
                <button
                    onClick={() =>
                        editor.chain().focus().setHorizontalRule().run()
                    }
                    className="p-2 rounded hover:bg-base-300 text-base-content"
                    title="Horizontal Rule"
                >
                    <FaMinus />
                </button>
                <button
                    onClick={handleLink}
                     className={`p-2 rounded hover:bg-base-300 ${
                         editor.isActive("link")
                             ? "bg-base-300 text-yellow-400"
                             : "text-base-content"
                     }`}
                     title="Link"
                 >
                     <FaLink />
                 </button>
                <button
                    onClick={() =>
                        fileInputRef.current && fileInputRef.current.click()
                    }
                    className="p-2 rounded hover:bg-base-300 text-base-content"
                    title="Insert Image from Device"
                >
                    <FaImage />
                </button>
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleImageSelect}
                />
                <button
                    onClick={() =>
                        editor.chain().focus().setTextAlign("left").run()
                    }
                    className={`p-2 rounded hover:bg-base-300 ${
                        toolbarState.alignLeft
                            ? "bg-base-300 text-yellow-400"
                            : "text-base-content"
                    }`}
                    title="Align Left"
                >
                    <FaAlignLeft />
                </button>
                <button
                    onClick={() =>
                        editor.chain().focus().setTextAlign("center").run()
                    }
                    className={`p-2 rounded hover:bg-base-300 ${
                        toolbarState.alignCenter
                            ? "bg-base-300 text-yellow-400"
                            : "text-base-content"
                    }`}
                    title="Align Center"
                >
                    <FaAlignCenter />
                </button>
                <button
                    onClick={() =>
                        editor.chain().focus().setTextAlign("right").run()
                    }
                    className={`p-2 rounded hover:bg-base-300 ${
                        toolbarState.alignRight
                            ? "bg-base-300 text-yellow-400"
                            : "text-base-content"
                    }`}
                    title="Align Right"
                >
                    <FaAlignRight />
                </button>
                <button
                    onClick={() =>
                        editor.chain().focus().setTextAlign("justify").run()
                    }
                    className={`p-2 rounded hover:bg-base-300 ${
                        toolbarState.alignJustify
                            ? "bg-base-300 text-yellow-400"
                            : "text-base-content"
                    }`}
                    title="Justify"
                >
                    <FaAlignJustify />
                </button>
                <button
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!toolbarState.canUndo}
                    className="p-2 rounded hover:bg-base-300 text-base-content"
                    title="Undo"
                >
                    <IoMdUndo />
                </button>
                <button
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!toolbarState.canRedo}
                    className="p-2 rounded hover:bg-base-300 text-base-content"
                    title="Redo"
                >
                    <IoMdRedo />
                </button>
            </div>
            <div className="overflow-auto w-full">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
