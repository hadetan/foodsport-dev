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
import {
    FaBold,
    FaItalic,
    FaUnderline,
    FaStrikethrough,
    FaListUl,
    FaListOl,
    FaLink,
    FaImage,
    FaHeading,
    FaMinus,
    FaAlignLeft,
    FaAlignCenter,
    FaAlignRight,
    FaAlignJustify,
} from "react-icons/fa6";
import { IoMdUndo, IoMdRedo } from "react-icons/io";
import { useEffect, useState, useCallback } from "react";

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
        },
    });


    const [toolbarState, setToolbarState] = useState({});

    const computeToolbarState = useCallback(() => {
        if (!editor) return {};
        return {
            isBold: editor.isActive('bold'),
            canBold: editor.can().chain().toggleBold().run(),
            isItalic: editor.isActive('italic'),
            canItalic: editor.can().chain().toggleItalic().run(),
            isStrike: editor.isActive('strike'),
            canStrike: editor.can().chain().toggleStrike().run(),
            canClearMarks: editor.can().chain().unsetAllMarks().run(),
            isParagraph: editor.isActive('paragraph'),
            isHeading1: editor.isActive('heading', { level: 1 }),
            isHeading2: editor.isActive('heading', { level: 2 }),
            isHeading3: editor.isActive('heading', { level: 3 }),
            isBulletList: editor.isActive('bulletList'),
            isOrderedList: editor.isActive('orderedList'),
            canUndo: editor.can().chain().undo().run(),
            canRedo: editor.can().chain().redo().run(),
            alignLeft: editor.isActive({ textAlign: 'left' }),
            alignCenter: editor.isActive({ textAlign: 'center' }),
            alignRight: editor.isActive({ textAlign: 'right' }),
            alignJustify: editor.isActive({ textAlign: 'justify' }),
        };
    }, [editor]);

    useEffect(() => {
        if (!editor) return;
        setToolbarState(computeToolbarState());
        const updateHandler = () => setToolbarState(computeToolbarState());
        editor.on('update', updateHandler);
        editor.on('selectionUpdate', updateHandler);
        return () => {
            editor.off('update', updateHandler);
            editor.off('selectionUpdate', updateHandler);
        };
    }, [editor, computeToolbarState]);

    useEffect(() => {
        if (editor && value && editor.getHTML() !== value) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);


    if (!editor)
        return (
            <div className="bg-[#18181b] rounded-lg min-h-[320px] animate-pulse" />
        );

    return (
        <div className="w-full max-w-full h-full">
            <div className="relative bg-[#101014] rounded-t-lg border border-[#23232b] px-2 py-1 flex flex-wrap items-center gap-1 shadow-md justify-center">
                {/* Heading Dropdown */}
                <div className="relative">
                    <select
                        className={`p-2 rounded bg-[#18181b] text-white border border-[#23232b] focus:outline-none focus:ring-2 focus:ring-yellow-300 appearance-none`}
                        value={toolbarState.isHeading1 ? 'h1' : toolbarState.isHeading2 ? 'h2' : toolbarState.isHeading3 ? 'h3' : 'p'}
                        onChange={e => {
                            const val = e.target.value;
                            if (val === 'h1') editor.chain().focus().toggleHeading({ level: 1 }).run();
                            else if (val === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run();
                            else if (val === 'h3') editor.chain().focus().toggleHeading({ level: 3 }).run();
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
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={!toolbarState.canBold}
                    className={`p-2 rounded hover:bg-[#23232b] ${toolbarState.isBold ? "bg-[#23232b] text-yellow-300" : "text-white"}`}
                    title="Bold"
                >
                    <FaBold />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={!toolbarState.canItalic}
                    className={`p-2 rounded hover:bg-[#23232b] ${toolbarState.isItalic ? "bg-[#23232b] text-yellow-300" : "text-white"}`}
                    title="Italic"
                >
                    <FaItalic />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`p-2 rounded hover:bg-[#23232b] ${editor.isActive("underline") ? "bg-[#23232b] text-yellow-300" : "text-white"}`}
                    title="Underline"
                >
                    <FaUnderline />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    disabled={!toolbarState.canStrike}
                    className={`p-2 rounded hover:bg-[#23232b] ${toolbarState.isStrike ? "bg-[#23232b] text-yellow-300" : "text-white"}`}
                    title="Strikethrough"
                >
                    <FaStrikethrough />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-2 rounded hover:bg-[#23232b] ${toolbarState.isBulletList ? "bg-[#23232b] text-yellow-300" : "text-white"}`}
                    title="Bullet List"
                >
                    <FaListUl />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-2 rounded hover:bg-[#23232b] ${toolbarState.isOrderedList ? "bg-[#23232b] text-yellow-300" : "text-white"}`}
                    title="Ordered List"
                >
                    <FaListOl />
                </button>
                <button
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    className="p-2 rounded hover:bg-[#23232b] text-white"
                    title="Horizontal Rule"
                >
                    <FaMinus />
                </button>
                <button
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .setLink({ href: prompt("Enter URL") || "" })
                            .run()
                    }
                    className={`p-2 rounded hover:bg-[#23232b] ${editor.isActive("link") ? "bg-[#23232b] text-yellow-300" : "text-white"}`}
                    title="Link"
                >
                    <FaLink />
                </button>
                <button
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .setImage({ src: prompt("Enter image URL") || "" })
                            .run()
                    }
                    className="p-2 rounded hover:bg-[#23232b] text-white"
                    title="Image"
                >
                    <FaImage />
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={`p-2 rounded hover:bg-[#23232b] ${toolbarState.alignLeft ? "bg-[#23232b] text-yellow-300" : "text-white"}`}
                    title="Align Left"
                >
                    <FaAlignLeft />
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={`p-2 rounded hover:bg-[#23232b] ${toolbarState.alignCenter ? "bg-[#23232b] text-yellow-300" : "text-white"}`}
                    title="Align Center"
                >
                    <FaAlignCenter />
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={`p-2 rounded hover:bg-[#23232b] ${toolbarState.alignRight ? "bg-[#23232b] text-yellow-300" : "text-white"}`}
                    title="Align Right"
                >
                    <FaAlignRight />
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    className={`p-2 rounded hover:bg-[#23232b] ${toolbarState.alignJustify ? "bg-[#23232b] text-yellow-300" : "text-white"}`}
                    title="Justify"
                >
                    <FaAlignJustify />
                </button>
                <button
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!toolbarState.canUndo}
                    className="p-2 rounded hover:bg-[#23232b] text-white"
                    title="Undo"
                >
                    <IoMdUndo />
                </button>
                <button
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!toolbarState.canRedo}
                    className="p-2 rounded hover:bg-[#23232b] text-white"
                    title="Redo"
                >
                    <IoMdRedo />
                </button>
            </div>
            <EditorContent editor={editor} />
        </div>
    );
}
