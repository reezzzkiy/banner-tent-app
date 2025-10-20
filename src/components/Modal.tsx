import React, { ReactNode } from "react";
import './styles.css';

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({ children, onClose }) => {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
        <button className="button button-gray mt-4" onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
};