// components/ConfirmDialog.tsx
import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';

export default function ConfirmDialog({
    open,
    onOpenChange,
    title = 'Are you sure?',
    description = 'This action cannot be undone.',
    onConfirm,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    onConfirm: () => void;
}) {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="bg-black/50 fixed inset-0" />
                <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-96">
                    <Dialog.Title className="text-lg font-semibold mb-2">{title}</Dialog.Title>
                    <Dialog.Description className="text-sm text-gray-600 mb-4">
                        {description}
                    </Dialog.Description>

                    <div className="flex justify-end gap-2">
                        <Dialog.Close asChild>
                            <button className="px-4 py-2 rounded bg-gray-200 text-sm">Cancel</button>
                        </Dialog.Close>
                        <button
                            className="px-4 py-2 rounded bg-red-600 text-white text-sm"
                            onClick={() => {
                                onConfirm();
                                onOpenChange(false); // Close modal
                            }}
                        >
                            Confirm
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
