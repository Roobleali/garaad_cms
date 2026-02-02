import * as Dialog from '@radix-ui/react-dialog';
import { ReactNode } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    description?: string;
    fullScreen?: boolean;
}

export function Modal({ isOpen, onClose, title, children, description, fullScreen }: ModalProps) {
    if (!isOpen) return null;

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] animate-fade-in" />
                <Dialog.Content className="fixed inset-0 z-[10000] overflow-y-auto">
                    <div className={`flex min-h-screen items-center justify-center ${fullScreen ? 'p-0' : 'p-4'}`}>
                        <div
                            className={`relative w-full bg-white shadow-2xl animate-fade-in animate-zoom-in ${fullScreen
                                ? 'min-h-screen'
                                : 'max-w-[1200px] rounded-xl my-8'
                                }`}
                            style={{ transform: 'none' }}
                        >
                            <div className="flex flex-col h-full" style={{ minHeight: fullScreen ? '100vh' : 'auto', maxHeight: fullScreen ? 'none' : 'calc(100vh - 64px)' }}>
                                <div className={`flex-none border-b border-gray-200 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 ${fullScreen ? '' : 'rounded-t-xl'}`}>
                                    <div className="flex items-center justify-between">
                                        <Dialog.Title className="text-xl font-bold text-gray-900">
                                            {title}
                                        </Dialog.Title>
                                        <Dialog.Close className="rounded-lg p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 transition-colors">
                                            <span className="sr-only">Xir</span>
                                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </Dialog.Close>
                                    </div>
                                    {description && (
                                        <Dialog.Description className="mt-2 text-sm text-gray-600">
                                            {description}
                                        </Dialog.Description>
                                    )}
                                </div>
                                <div className={`flex-1 flex flex-col p-2 bg-white ${fullScreen ? '' : 'rounded-b-xl'}`}>
                                    <div className={fullScreen ? "max-w-6xl mx-auto w-full h-full" : "w-full h-full"}>
                                        {children}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
