'use client';

import React from 'react';
import AsyncButton from '@/components/AsyncButton';
import CloseIcon from '@/components/icons/CloseIcon';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    isLoading?: boolean;
    loadingText?: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    isLoading = false,
    loadingText = 'Processing...',
    confirmButtonText = 'Delete',
    cancelButtonText = 'Cancel',
}) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-ink/40 flex justify-center items-center z-50 p-4">
            <div className="relative w-full max-w-md rounded-md bg-surface p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl text-ink">{title}</h2>
                    <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1.5 text-ink-2 hover:bg-gray-200 hover:text-ink">
                        <CloseIcon />
                    </button>
                </div>
                <div>
                    <p className="text-[15px] leading-relaxed text-ink-2">{message}</p>
                    <div className="flex justify-end gap-4 mt-6">
                        <AsyncButton
                            onClick={onClose}
                            className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 border border-ink bg-transparent hover:bg-gray-200"
                        >
                            {cancelButtonText}
                        </AsyncButton>
                        <AsyncButton
                            onClick={onConfirm}
                            isLoading={isLoading}
                            loadingText={loadingText}
                            className="px-4 py-2 rounded-md text-sm font-medium text-paper bg-red-600 hover:bg-red-700"
                        >
                            {confirmButtonText}
                        </AsyncButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
