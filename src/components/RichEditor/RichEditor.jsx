// components/RichEditor.jsx
import React, { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";

export default function RichEditor({ value, onChange, maxChars = 1000 }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Placeholder.configure({
        placeholder: "Write a compelling description…",
      }),
      CharacterCount.configure({ limit: maxChars }),
    ],
    content: value || "",
    autofocus: false,
    onUpdate: ({ editor }) => {
      // HTML সংরক্ষণ: প্রোডাক্ট ডিটেইলস rich থাক⁠লে ভাল লাগে
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
    }
  }, [value]);

  if (!editor) return null;

  const btn = "px-2 py-1 rounded border text-sm hover:bg-slate-50";
  const isActive = (a) => (editor.isActive(a) ? "bg-slate-100 border-slate-300" : "border-slate-200");

  return (
    <div className="soft overflow-hidden">
      {/* Toolbar */}
      <div className="flex gap-1 p-2 border-b bg-white/70 backdrop-blur">
        <button className={`${btn} ${isActive("bold")}`} onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
        <button className={`${btn} ${isActive("italic")}`} onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></button>
        <button className={`${btn} ${isActive("strike")}`} onClick={() => editor.chain().focus().toggleStrike().run()}><s>S</s></button>
        <span className="mx-1 w-px bg-slate-200" />
        <button className={`${btn} ${isActive("bulletList")}`} onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
        <button className={`${btn} ${isActive("orderedList")}`} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</button>
        <button className={`${btn}`} onClick={() => editor.chain().focus().setHardBreak().run()}>↵</button>
        <button className={`${btn}`} onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>Clear</button>
      </div>

      {/* Editor area */}
      <div className="px-3 py-2">
        <EditorContent
          editor={editor}
          className="min-h-[220px] prose prose-sm max-w-none focus:outline-none"
        />
      </div>

      {/* Footer / counter */}
      <div className="flex items-center justify-between px-3 py-2 border-t text-xs text-slate-500">
        <span>Rich text supported (bold, lists, breaks)</span>
        <span>{editor.storage.characterCount.characters()}/{maxChars}</span>
      </div>
    </div>
  );
}
