import React, { ReactElement } from "react";
import { observer } from "mobx-react-lite";
import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";

interface ICardProps {
  title: string;
  //  icon: ReactNode;
  button?: ReactElement;
  total: number;
}

const DashboardCard: React.FC<ICardProps> = ({ title, total, button }) => (
  <ErrorBoundary>
    <div>
      <div className="instrument-card uk-card uk-card-small uk-card-body">
        <div>
          <h4 className="uk-card-title in-title">{title}</h4>
          <div className="in-card-footer">
            <div
              className="uk-flex uk-flex-column"
              style={{ justifyContent: "center" }}
            >
              <div>
                <div className="total in-title">{total}</div>
              </div>
              <div>
                {button && (
                  <button
                    className="uk-button uk-button-small uk-button-primary"
                    style={{ borderRadius: "4px" }}
                  >
                    View
                  </button>
                )}
              </div>
              {/* <div>
              <div className="icon-container">{icon}</div>
            </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  </ErrorBoundary>
);

export default observer(DashboardCard);
