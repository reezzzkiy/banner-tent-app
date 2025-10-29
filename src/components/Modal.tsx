import React, { ReactNode } from "react";
import './styles.css';

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({ children, onClose }) => {
  return (
    <div className="mobile-modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
         <div className="form-header">
    <div></div>
  <button
    type="button"
    className="close-button"
    onClick={()=>{onClose?.()
      console.log(1)
    }}  // ← это должно быть именно так
  >
    ×
  </button>
</div>
        {children}
        {/* <button className="button button-gray mt-4" onClick={onClose}>Закрыть</button> */}
      </div>
    </div>
  );
};