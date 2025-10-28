import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
}

/**
 * ConfirmModal component for user confirmations (delete operations, logout, etc.)
 * Replaces native browser confirm dialogs with a styled modal dialog
 * Features: Customizable button text and styles, backdrop overlay, scale-in animation
 * Accessible with proper ARIA attributes and keyboard support
 */
const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonClass = 'bg-red-500 hover:bg-red-700'
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'
      role='dialog'
      aria-modal='true'
      aria-labelledby='modal-title'
      aria-describedby='modal-description'
    >
      <div className='bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 animate-scale-in'>
        <h3 id='modal-title' className='text-xl font-bold text-gray-900 mb-4'>
          {title}
        </h3>
        <p id='modal-description' className='text-gray-600 mb-6'>
          {message}
        </p>
        <div className='flex gap-3 justify-end'>
          <button
            onClick={onCancel}
            className='px-4 py-2 bg-gray-500 hover:bg-gray-700 text-white font-semibold rounded transition-colors'
            aria-label={`${cancelText} and close dialog`}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 ${confirmButtonClass} text-white font-semibold rounded transition-colors`}
            aria-label={`${confirmText} action`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
