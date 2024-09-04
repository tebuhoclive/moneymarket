import React from "react";
import ReactDOM from "react-dom";
import ErrorBoundary from "./error-boundary/ErrorBoundary";

interface IProps {
  modalId: string;
  cssClass?: string;
  children: any;
}

const Modal = (props: IProps) => {
  const { modalId, cssClass, children } = props;
  const newClass = cssClass ? cssClass : "";

  const modal = (
    <ErrorBoundary>
      <div
        id={modalId}
        className={`custom-modal-style ${newClass}`}
        data-uk-modal
        data-bg-close={false}
        style={{ backgroundColor: "#004c98" }} // Dark blue background
      >
        {children}
      </div>
    </ErrorBoundary>
  );

  return ReactDOM.createPortal(modal, document.body);
};

export default Modal;

export const FullModal = (props: IProps) => {
  const { modalId, cssClass, children } = props;
  const newClass = cssClass ? cssClass : "";

  const modal = (
    <div
      id={modalId}
      className={`uk-modal-full custom-modal-style ${newClass}`}
      data-uk-modal
      data-uk-bg-close
      style={{ backgroundColor: "rgba(0, 0, 50, )" }} // Dark blue background
    >
      {children}
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
};
