import React, { useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Image from '@tiptap/extension-image';
import { Audio } from './AudioExtension';
import { Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, List, ListOrdered, Image as ImageIcon, Music, Undo, Redo } from 'lucide-react';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  onUploadFile: (file: File) => Promise<string>;
}

const MenuBar = ({ editor, onUploadFile }: { editor: any, onUploadFile: (file: File) => Promise<string> }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  if (!editor) {
    return null;
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = await onUploadFile(file);
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = await onUploadFile(file);
      if (url) {
        editor.chain().focus().insertContent(`<audio controls src="${url}"></audio>`).run();
      }
    }
    if (audioInputRef.current) audioInputRef.current.value = '';
  };

  const btnClass = "p-2 rounded text-gray-700 hover:bg-gray-200 focus:outline-none transition-colors";
  const activeBtnClass = "p-2 rounded bg-indigo-100 text-indigo-700 focus:outline-none transition-colors";

  return (
    <div className="flex flex-wrap gap-1 border-b border-gray-300 p-2 bg-gray-50 rounded-t-lg items-center">
      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run() }}
        className={editor.isActive('bold') ? activeBtnClass : btnClass}
        title="Bold"
      >
        <Bold size={18} />
      </button>
      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run() }}
        className={editor.isActive('italic') ? activeBtnClass : btnClass}
        title="Italic"
      >
        <Italic size={18} />
      </button>
      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run() }}
        className={editor.isActive('underline') ? activeBtnClass : btnClass}
        title="Underline"
      >
        <UnderlineIcon size={18} />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 1 }).run() }}
        className={editor.isActive('heading', { level: 1 }) ? activeBtnClass : btnClass}
        title="Heading 1"
      >
        <Heading1 size={18} />
      </button>
      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run() }}
        className={editor.isActive('heading', { level: 2 }) ? activeBtnClass : btnClass}
        title="Heading 2"
      >
        <Heading2 size={18} />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run() }}
        className={editor.isActive('bulletList') ? activeBtnClass : btnClass}
        title="Bullet List"
      >
        <List size={18} />
      </button>
      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run() }}
        className={editor.isActive('orderedList') ? activeBtnClass : btnClass}
        title="Ordered List"
      >
        <ListOrdered size={18} />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Image Upload */}
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        className="hidden" 
      />
      <button
        onClick={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}
        className={btnClass}
        title="Insert Image"
      >
        <ImageIcon size={18} />
      </button>

      {/* Audio Upload */}
      <input 
        type="file" 
        accept="audio/*" 
        ref={audioInputRef} 
        onChange={handleAudioUpload} 
        className="hidden" 
      />
      <button
        onClick={(e) => { e.preventDefault(); audioInputRef.current?.click(); }}
        className={btnClass}
        title="Insert Audio"
      >
        <Music size={18} />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      <button onClick={(e) => { e.preventDefault(); editor.chain().focus().undo().run() }} disabled={!editor.can().undo()} className={btnClass} title="Undo">
        <Undo size={18} />
      </button>
      <button onClick={(e) => { e.preventDefault(); editor.chain().focus().redo().run() }} disabled={!editor.can().redo()} className={btnClass} title="Redo">
        <Redo size={18} />
      </button>
    </div>
  );
};

export const TiptapEditor: React.FC<TiptapEditorProps> = ({ content, onChange, onUploadFile }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Audio,
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-indigo sm:prose-base max-w-none focus:outline-none min-h-[300px] p-4 bg-white',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
      <MenuBar editor={editor} onUploadFile={onUploadFile} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;
