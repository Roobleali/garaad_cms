import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Quote,
    Undo,
    Redo,
    Code
} from 'lucide-react';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    const buttons = [
        {
            icon: <Heading1 className="w-4 h-4" />,
            title: 'Heading 1',
            action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
            isActive: editor.isActive('heading', { level: 1 }),
        },
        {
            icon: <Heading2 className="w-4 h-4" />,
            title: 'Heading 2',
            action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
            isActive: editor.isActive('heading', { level: 2 }),
        },
        {
            icon: <Bold className="w-4 h-4" />,
            title: 'Bold',
            action: () => editor.chain().focus().toggleBold().run(),
            isActive: editor.isActive('bold'),
        },
        {
            icon: <Italic className="w-4 h-4" />,
            title: 'Italic',
            action: () => editor.chain().focus().toggleItalic().run(),
            isActive: editor.isActive('italic'),
        },
        {
            icon: <List className="w-4 h-4" />,
            title: 'Bullet List',
            action: () => editor.chain().focus().toggleBulletList().run(),
            isActive: editor.isActive('bulletList'),
        },
        {
            icon: <ListOrdered className="w-4 h-4" />,
            title: 'Ordered List',
            action: () => editor.chain().focus().toggleOrderedList().run(),
            isActive: editor.isActive('orderedList'),
        },
        {
            icon: <Code className="w-4 h-4" />,
            title: 'Code',
            action: () => editor.chain().focus().toggleCode().run(),
            isActive: editor.isActive('code'),
        },
        {
            icon: <Quote className="w-4 h-4" />,
            title: 'Blockquote',
            action: () => editor.chain().focus().toggleBlockquote().run(),
            isActive: editor.isActive('blockquote'),
        },
        {
            icon: <Undo className="w-4 h-4" />,
            title: 'Undo',
            action: () => editor.chain().focus().undo().run(),
            isActive: false,
        },
        {
            icon: <Redo className="w-4 h-4" />,
            title: 'Redo',
            action: () => editor.chain().focus().redo().run(),
            isActive: false,
        },
    ];

    return (
        <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50">
            {buttons.map((btn, i) => (
                <button
                    key={i}
                    type="button"
                    onClick={btn.action}
                    className={`p-1.5 rounded transition-colors ${btn.isActive
                            ? 'bg-blue-100 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                        }`}
                    title={btn.title}
                >
                    {btn.icon}
                </button>
            ))}
        </div>
    );
};

export const RichTextEditor = ({ content, onChange, placeholder }: RichTextEditorProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose max-w-none focus:outline-none min-h-[150px] p-4 text-gray-900',
            },
        },
    });

    return (
        <div className="w-full border border-gray-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all duration-200">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
            <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror {
          outline: none !important;
        }
        .ProseMirror blockquote {
          border-left: 3px solid #e2e8f0;
          padding-left: 1rem;
          color: #4a5568;
          font-style: italic;
        }
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5rem;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
        }
      `}</style>
        </div>
    );
};
