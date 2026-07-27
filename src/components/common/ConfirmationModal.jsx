import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = "Delete",
    confirmVariant = "danger",
    isLoading = false
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-4">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-red-100 dark:bg-red-950/50 rounded-full">
                        <AlertTriangle className="text-red-600 dark:text-red-400" size={20} />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <Button variant="secondary" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        variant={confirmVariant}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

