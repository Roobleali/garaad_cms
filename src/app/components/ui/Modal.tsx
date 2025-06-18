import * as Dialog from '@radix-ui/react-dialog';
import { ReactNode } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    description?: string;
}

export function Modal({ isOpen, onClose, title, children, description }: ModalProps) {
    if (!isOpen) return null;

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] animate-fade-in" />
                <Dialog.Content className="fixed inset-0 z-[10000] overflow-y-auto">
                    <div className="flex min-h-screen items-start justify-center p-4">
                        <div
                            className="relative w-full max-w-4xl bg-white shadow-xl rounded-lg mt-20 mb-8 animate-fade-in animate-zoom-in border-4 border-red-500"
                            style={{ transform: 'none' }}
                        >
                            <div className="flex flex-col" style={{ maxHeight: 'calc(100vh - 160px)' }}>
                                <div className="flex-none border-b border-gray-200 px-6 py-4 bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <Dialog.Title className="text-xl font-semibold text-gray-900">
                                            {title}
                                        </Dialog.Title>
                                        <Dialog.Close className="rounded-lg p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                                            <span className="sr-only">Xir</span>
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </Dialog.Close>
                                    </div>
                                    {description && (
                                        <Dialog.Description className="mt-2 text-sm text-gray-500">
                                            {description}
                                        </Dialog.Description>
                                    )}
                                </div>
                                <div className="flex-1 overflow-y-auto p-6 bg-white">
                                    {children}
                                </div>
                            </div>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
} 