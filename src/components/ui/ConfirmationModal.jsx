import React from 'react';
import ModalWrapper from '../shared/ModalWrapper';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDanger = true,
  isLoading = false,
}) => {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm:max-w-md">
      <div className="flex flex-col gap-4 text-left mt-2">
        <p className="text-sm font-semibold text-gray-400 leading-relaxed">
          {message}
        </p>
        <div className="flex items-center gap-3 mt-4 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl border border-gray-800 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2.5 rounded-xl text-xs font-black text-white transition-all disabled:opacity-50 cursor-pointer shadow-lg ${
              isDanger
                ? 'bg-red-600 hover:bg-red-500 shadow-red-600/10'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/10'
            }`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default ConfirmationModal;
