import { useState } from "react";

interface IHeadProp {
  title: string;
  children?: JSX.Element;
}
export const CustomCloseAccordion = ({ title, children }: IHeadProp) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const onClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="custom-made-accordion uk-padding uk-height-expand">
      <div className="position-relative">
        <h4 className="custom-title" onClick={onClick}>
          {title}
        </h4>
        <div className="more">
          <span
            onClick={onClick}
            className={`icon ${isExpanded ? "expanded" : ""}`}
            data-uk-icon="chevron-down"
          ></span>
        </div>
      </div>
      <div
        className={`custom-accordion ${isExpanded ? "expanded" : ""} uk-height-expand`}
      >
        {children}
      </div>
    </div>
  );
};



export const CustomOpenAccordion = ({ title, children }: IHeadProp) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const onClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="custom-made-accordion uk-margin-small-top uk-padding">
      <div className="position-relative">
        <h4 className="main-title-sm uk-margin" onClick={onClick}>
          {title}
        </h4>
        <div className="more">
          <span
            onClick={onClick}
            className={`icon ${isExpanded ? "expanded" : ""}`}
            data-uk-icon="chevron-down"
          ></span>
        </div>
      </div>
      <div
        className={`custom-accordion ${isExpanded ? "expanded" : ""}`} data-uk-
      >
        {children}
      </div>
    </div>
  );
};

interface ITransactionHeadProp {
  title: string;
  totalTransactions: number;
  totalAmount: number | string;
  children?: JSX.Element;
}

export const CustomTransactionOpenAccordion = ({ title, totalTransactions, totalAmount, children }: ITransactionHeadProp) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const onClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="custom-made-accordion">
      <div className="position-relative">
        <div className="uk-grid">

          <div className="uk-width-1-3">
            <h4 className="main-title-lg uk-margin" onClick={onClick}>
              {title}
            </h4>
          </div>
          <div className="uk-width-1-3">
            {
              !isExpanded &&
              <h4 className="main-title-sm uk-margin uk-padding-small uk-text-align-left" onClick={onClick}>
                Total Transactions: {totalTransactions}
              </h4>
            }

          </div>
          <div className="uk-width-1-3 uk-text-align-left">
            {
              !isExpanded &&
              <h4 className="main-title-sm uk-margin uk-padding-small" onClick={onClick}>
                Total Amount: {totalAmount}
              </h4>
            }
          </div>

        </div>

        <div className="more uk-padding-small">
          <span
            onClick={onClick}
            className={`icon ${isExpanded ? "expanded" : ""}`}
            data-uk-icon="chevron-down"
          ></span>
        </div>
      </div>
      {
        isExpanded && <hr />
      }
      <div
        className={`custom-accordion ${isExpanded ? "expanded" : ""}`}
      >
        {children}
      </div>
    </div>
  );
};