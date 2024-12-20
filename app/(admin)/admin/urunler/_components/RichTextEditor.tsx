"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import {
  BiBold,
  BiItalic,
  BiUnderline,
  BiStrikethrough,
  BiHighlight,
  BiCode,
  BiLink,
  BiUnlink,
} from "react-icons/bi";
import {
  AiOutlineOrderedList,
  AiOutlineUnorderedList,
  AiOutlineAlignLeft,
  AiOutlineAlignCenter,
  AiOutlineAlignRight,
  AiOutlineRedo,
  AiOutlineUndo,
} from "react-icons/ai";
import { LuHeading1, LuHeading2 } from "react-icons/lu";
import { TbBlockquote, TbSuperscript, TbSubscript } from "react-icons/tb";
import { MdHorizontalRule } from "react-icons/md";
import { Fragment } from "react";

interface TipTapEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-2 border-b p-2">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`rounded p-2 hover:bg-gray-100 ${
          editor.isActive("bold") ? "bg-gray-200" : ""
        }`}
      >
        <BiBold size={20} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`rounded p-2 hover:bg-gray-100 ${
          editor.isActive("italic") ? "bg-gray-200" : ""
        }`}
      >
        <BiItalic size={20} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`rounded p-2 hover:bg-gray-100 ${
          editor.isActive("underline") ? "bg-gray-200" : ""
        }`}
      >
        <BiUnderline size={20} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`rounded p-2 hover:bg-gray-100 ${
          editor.isActive("strike") ? "bg-gray-200" : ""
        }`}
      >
        <BiStrikethrough size={20} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`rounded p-2 hover:bg-gray-100 ${
          editor.isActive("code") ? "bg-gray-200" : ""
        }`}
      >
        <BiCode size={20} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={`rounded p-2 hover:bg-gray-100 ${
          editor.isActive("highlight") ? "bg-gray-200" : ""
        }`}
      >
        <BiHighlight size={20} />
      </button>

      <div className="h-6 w-[1px] bg-gray-300" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`rounded p-2 hover:bg-gray-100 ${
          editor.isActive("heading", { level: 1 }) ? "bg-gray-200" : ""
        }`}
      >
        <LuHeading1 size={20} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`rounded p-2 hover:bg-gray-100 ${
          editor.isActive("heading", { level: 2 }) ? "bg-gray-200" : ""
        }`}
      >
        <LuHeading2 size={20} />
      </button>

      <div className="h-6 w-[1px] bg-gray-300" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`rounded p-2 hover:bg-gray-100 ${
          editor.isActive("blockquote") ? "bg-gray-200" : ""
        }`}
      >
        <TbBlockquote size={20} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="rounded p-2 hover:bg-gray-100"
      >
        <MdHorizontalRule size={20} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`rounded p-2 hover:bg-gray-100 ${
          editor.isActive("bulletList") ? "bg-gray-200" : ""
        }`}
      >
        <AiOutlineUnorderedList size={20} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`rounded p-2 hover:bg-gray-100 ${
          editor.isActive("orderedList") ? "bg-gray-200" : ""
        }`}
      >
        <AiOutlineOrderedList size={20} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        className={`rounded p-2 hover:bg-gray-100 ${
          editor.isActive("superscript") ? "bg-gray-200" : ""
        }`}
      >
        <TbSuperscript size={20} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        className={`rounded p-2 hover:bg-gray-100 ${
          editor.isActive("subscript") ? "bg-gray-200" : ""
        }`}
      >
        <TbSubscript size={20} />
      </button>

      <div className="h-6 w-[1px] bg-gray-300" />

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={`rounded p-2 hover:bg-gray-100 ${
          editor.isActive({ textAlign: "left" }) ? "bg-gray-200" : ""
        }`}
      >
        <AiOutlineAlignLeft size={20} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={`rounded p-2 hover:bg-gray-100 ${
          editor.isActive({ textAlign: "center" }) ? "bg-gray-200" : ""
        }`}
      >
        <AiOutlineAlignCenter size={20} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={`rounded p-2 hover:bg-gray-100 ${
          editor.isActive({ textAlign: "right" }) ? "bg-gray-200" : ""
        }`}
      >
        <AiOutlineAlignRight size={20} />
      </button>

      <div className="h-6 w-[1px] bg-gray-300" />

      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        className="rounded p-2 hover:bg-gray-100"
      >
        <AiOutlineUndo size={20} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        className="rounded p-2 hover:bg-gray-100"
      >
        <AiOutlineRedo size={20} />
      </button>
    </div>
  );
};

const TipTapEditor = ({ value, onChange, className }: TipTapEditorProps) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link,
      Superscript,
      Subscript,
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "min-h-[200px] p-4 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  // Editör alanı için özel stiller
  const editorStyles = `
    .ProseMirror > * + * {
      margin-top: 0.75em;
    }
    .ProseMirror ul {
      list-style-type: disc;
      padding-left: 1.5em;
    }
    .ProseMirror ol {
      list-style-type: decimal;
      padding-left: 1.5em;
    }
    .ProseMirror h1 {
      font-size: 2em;
      font-weight: bold;
    }
    .ProseMirror h2 {
      font-size: 1.5em;
      font-weight: bold;
    }
  `;

  return (
    <Fragment>
      <style>{editorStyles}</style>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="bg-gray-200" placeholder="Metin girin..." />
    </Fragment>
  );
};

export default TipTapEditor;
