import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { BulletList } from "@tiptap/extension-bullet-list";
import { OrderedList } from "@tiptap/extension-ordered-list";
import { ListItem } from "@tiptap/extension-list-item";
import {
    FaBold,
    FaItalic,
    FaUnderline,
    FaStrikethrough,
    FaQuoteRight,
    FaListUl,
    FaListOl,
    FaCode,
    FaLink,
    FaImage,
    FaTable,
    FaHeading,
    FaMinus,
} from "react-icons/fa6";
import { MdOutlineTaskAlt } from "react-icons/md";
import { IoMdUndo, IoMdRedo } from "react-icons/io";
import { useEffect } from "react";

export default function TiptapEditor({ value, onChange }) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: false,
                orderedList: false,
                listItem: false,
            }),
            Underline,
            Link,
            Image,
            Table.configure({ resizable: true }),
            TableRow,
            TableCell,
            TableHeader,
            TaskList,
            TaskItem,
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
            Placeholder.configure({
                placeholder: 'Type "/" for commands, or start writing...',
            }),
        ],
        immediatelyRender: false,
        content: value || "",
        onUpdate: ({ editor }) => {
            if (onChange) onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "prose prose-invert dark:prose-invert min-h-[320px] max-h-[600px] w-full px-0 py-4 bg-[#18181b] text-white rounded-b-lg focus:outline-none",
                spellCheck: "true",
                style: "border-radius: 0 0 0.75rem 0.75rem;",
                dir: "ltr",
            },
        },
    });

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
        <div className="w-full max-w-full">
            <div className="relative bg-[#101014] rounded-t-lg border border-[#23232b] px-2 py-1 flex flex-wrap items-center gap-1 shadow-md">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 rounded hover:bg-[#23232b] ${
                        editor.isActive("bold")
                            ? "bg-[#23232b] text-yellow-300"
                            : "text-white"
                    }`}
                    title="Bold"
                >
                    <FaBold />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded hover:bg-[#23232b] ${
                        editor.isActive("italic")
                            ? "bg-[#23232b] text-yellow-300"
                            : "text-white"
                    }`}
                    title="Italic"
                >
                    <FaItalic />
                </button>
                <button
                    onClick={() =>
                        editor.chain().focus().toggleUnderline().run()
                    }
                    className={`p-2 rounded hover:bg-[#23232b] ${
                        editor.isActive("underline")
                            ? "bg-[#23232b] text-yellow-300"
                            : "text-white"
                    }`}
                    title="Underline"
                >
                    <FaUnderline />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`p-2 rounded hover:bg-[#23232b] ${
                        editor.isActive("strike")
                            ? "bg-[#23232b] text-yellow-300"
                            : "text-white"
                    }`}
                    title="Strikethrough"
                >
                    <FaStrikethrough />
                </button>
                <button
                    onClick={() =>
                        editor.chain().focus().toggleBlockquote().run()
                    }
                    className={`p-2 rounded hover:bg-[#23232b] ${
                        editor.isActive("blockquote")
                            ? "bg-[#23232b] text-yellow-300"
                            : "text-white"
                    }`}
                    title="Blockquote"
                >
                    <FaQuoteRight />
                </button>
                <button
                    onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                    className={`p-2 rounded hover:bg-[#23232b] ${
                        editor.isActive("bulletList")
                            ? "bg-[#23232b] text-yellow-300"
                            : "text-white"
                    }`}
                    title="Bullet List"
                >
                    <FaListUl />
                </button>
                <button
                    onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                    }
                    className={`p-2 rounded hover:bg-[#23232b] ${
                        editor.isActive("orderedList")
                            ? "bg-[#23232b] text-yellow-300"
                            : "text-white"
                    }`}
                    title="Ordered List"
                >
                    <FaListOl />
                </button>
                <button
                    onClick={() =>
                        editor.chain().focus().toggleTaskList().run()
                    }
                    className={`p-2 rounded hover:bg-[#23232b] ${
                        editor.isActive("taskList")
                            ? "bg-[#23232b] text-yellow-300"
                            : "text-white"
                    }`}
                    title="Task List"
                >
                    <MdOutlineTaskAlt />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className={`p-2 rounded hover:bg-[#23232b] ${
                        editor.isActive("code")
                            ? "bg-[#23232b] text-yellow-300"
                            : "text-white"
                    }`}
                    title="Inline Code"
                >
                    <FaCode />
                </button>
                <button
                    onClick={() =>
                        editor.chain().focus().toggleCodeBlock().run()
                    }
                    className={`p-2 rounded hover:bg-[#23232b] ${
                        editor.isActive("codeBlock")
                            ? "bg-[#23232b] text-yellow-300"
                            : "text-white"
                    }`}
                    title="Code Block"
                >
                    <FaCode className="scale-110" />
                </button>
                <button
                    onClick={() =>
                        editor.chain().focus().setHorizontalRule().run()
                    }
                    className="p-2 rounded hover:bg-[#23232b] text-white"
                    title="Horizontal Rule"
                >
                    <FaMinus />
                </button>
                <button
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 1 }).run()
                    }
                    className={`p-2 rounded hover:bg-[#23232b] ${
                        editor.isActive("heading", { level: 1 })
                            ? "bg-[#23232b] text-yellow-300"
                            : "text-white"
                    }`}
                    title="Heading 1"
                >
                    <FaHeading className="scale-90" />
                </button>
                <button
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                    className={`p-2 rounded hover:bg-[#23232b] ${
                        editor.isActive("heading", { level: 2 })
                            ? "bg-[#23232b] text-yellow-300"
                            : "text-white"
                    }`}
                    title="Heading 2"
                >
                    <FaHeading className="scale-75" />
                </button>
                <button
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 3 }).run()
                    }
                    className={`p-2 rounded hover:bg-[#23232b] ${
                        editor.isActive("heading", { level: 3 })
                            ? "bg-[#23232b] text-yellow-300"
                            : "text-white"
                    }`}
                    title="Heading 3"
                >
                    <FaHeading className="scale-50" />
                </button>
                <button
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .setLink({ href: prompt("Enter URL") || "" })
                            .run()
                    }
                    className={`p-2 rounded hover:bg-[#23232b] ${
                        editor.isActive("link")
                            ? "bg-[#23232b] text-yellow-300"
                            : "text-white"
                    }`}
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
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .insertTable({
                                rows: 3,
                                cols: 3,
                                withHeaderRow: true,
                            })
                            .run()
                    }
                    className="p-2 rounded hover:bg-[#23232b] text-white"
                    title="Table"
                >
                    <FaTable />
                </button>
                <button
                    onClick={() => editor.chain().focus().undo().run()}
                    className="p-2 rounded hover:bg-[#23232b] text-white"
                    title="Undo"
                >
                    <IoMdUndo />
                </button>
                <button
                    onClick={() => editor.chain().focus().redo().run()}
                    className="p-2 rounded hover:bg-[#23232b] text-white"
                    title="Redo"
                >
                    <IoMdRedo />
                </button>
            </div>
            <EditorContent
                editor={editor}
                className="tiptap-editor prose-ul:list-disc prose-ol:list-decimal"
            />
        </div>
    );
}
