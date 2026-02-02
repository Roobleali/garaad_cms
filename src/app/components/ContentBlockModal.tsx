import { Modal } from './ui/Modal';
import { ContentBlockData } from '../types/content';

interface ContentBlockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
    title: string;
    content: ContentBlockData;
    setContent: (content: ContentBlockData) => void;
    isAdding: boolean;
    error?: string;
    renderContentForm: (content: ContentBlockData, setContent: (content: ContentBlockData) => void) => React.ReactNode;
    fullScreen?: boolean;
    onSaveAndAddNew?: (e: React.FormEvent) => Promise<void>;
}

export function ContentBlockModal({
    isOpen,
    onClose,
    onSubmit,
    title,
    content,
    setContent,
    isAdding,
    error,
    renderContentForm,
    fullScreen = true,
    onSaveAndAddNew
}: ContentBlockModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} fullScreen={fullScreen}>
            <form onSubmit={onSubmit} className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto px-6 py-3">
                    <div className="space-y-3">
                        {renderContentForm(content, setContent)}
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex-none border-t border-gray-200 bg-gray-50 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            {error && (
                                <p className="text-sm text-red-600">
                                    {error}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Jooji
                            </button>

                            {onSaveAndAddNew && (
                                <button
                                    type="button"
                                    onClick={onSaveAndAddNew}
                                    disabled={isAdding}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Kaydi & Mid kale ku dar
                                </button>
                            )}

                            <button
                                type="submit"
                                disabled={isAdding}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isAdding ? (
                                    <>
                                        <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Kaydinaya...
                                    </>
                                ) : 'Kaydi'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </Modal>
    );
} 