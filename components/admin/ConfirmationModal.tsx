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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                        <CloseIcon />
                    </button>
                </div>
                <div>
                    <p className="text-sm text-gray-700">{message}</p>
                    <div className="flex justify-end gap-4 mt-6">
                        <AsyncButton
                            onClick={onClose}
                            className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300"
                        >
                            {cancelButtonText}
                        </AsyncButton>
                        <AsyncButton
                            onClick={onConfirm}
                            isLoading={isLoading}
                            loadingText={loadingText}
                            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-500 hover:bg-red-600"
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
