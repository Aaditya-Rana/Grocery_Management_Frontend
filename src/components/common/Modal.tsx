import React, { type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    showCloseButton?: boolean;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    showCloseButton = true,
    maxWidth = 'md',
    className = '',
}) => {
    if (!isOpen) return null;

    const maxWidthClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            {/* Blurred Backdrop */}
            <div
                className="absolute inset-0 backdrop-blur-sm bg-black/50 pointer-events-auto"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className={`pointer-events-auto relative bg-white rounded-3xl shadow-xl w-full ${maxWidthClasses[maxWidth]} p-6 sm:p-8 animate-in scale-in-90 duration-300 ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex justify-between items-center mb-6">
                        {title && <h3 className="text-xl font-bold text-gray-900">{title}</h3>}
                        {showCloseButton && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors ml-auto"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                )}

                {/* Body */}
                {children}
            </div>
        </div>
    );
};

export default Modal;
