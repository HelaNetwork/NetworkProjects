import React from 'react';
import { Button } from './Button';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-100 rounded-full text-amber-600">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          </div>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={onClose}>
              {cancelText}
            </Button>
            <Button variant="primary" className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => { onConfirm(); onClose(); }}>
              {confirmText}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
