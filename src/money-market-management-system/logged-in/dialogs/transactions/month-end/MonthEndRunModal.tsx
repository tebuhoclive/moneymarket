import { FormEvent, useEffect, useState } from "react";

import MODAL_NAMES from "../../ModalName";

import swal from "sweetalert";

import { observer } from "mobx-react-lite";
import ProgressBar from "../../../shared/components/progress-bar/ProgressBar";
import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";
import { useAppContext } from "../../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import { IMonthEndRun, defaultMonthEndRun } from "../../../../../shared/models/MonthEndRunModel";
import { dateFormat_YY_MM_DD } from "../../../../../shared/utils/utils";

const MonthEndInitiationModal = observer(() => {
  const { api, store } = useAppContext();

  const [loading, setLoading] = useState<boolean>(false);

  const [monthEndRun, setMonthEndRun] = useState<IMonthEndRun>({...defaultMonthEndRun});
  const moneyMarketAccounts = store.mma.all;

  const handleMonthEndRun = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    swal({
      title: "Are you sure?",
      icon: "warning",
      buttons: ["Cancel", "Initiate"],
      dangerMode: true,
    }).then(async (edit) => {
      setLoading(true);
      if (edit) {
        swal({
          icon: "success",
          text: "Month End Run has been initiated",
        });
        onCancel();
      }
    });
  };

  const onCancel = () => {
    hideModalFromId(MODAL_NAMES.BACK_OFFICE.SWITCH_BETWEEN_ACCOUNTS_MODAL);
    setLoading(false);
  };

  return (
    <ErrorBoundary>
      <div className="view-modal custom-modal-style uk-modal-dialog uk-modal-body uk-width-2-3">
        <button
          className="uk-modal-close-default"
          onClick={onCancel}
          type="button"
          data-uk-close
        ></button>
        <h3 className="main-title-sm text-to-break">
          Initiating Month-End Run
        </h3>
        <hr />
        <div className="dialog-content uk-position-relative">
          <form
            className="uk-grid uk-grid-small"
            data-uk-grid
            onSubmit={handleMonthEndRun}
          >
            <div className="uk-form-controls uk-width-1-2">
              <label className="uk-form-label required" htmlFor="">
                Month-End Date
              </label>
              <input className="uk-input uk-form-small" type="date" name="" id="" min={dateFormat_YY_MM_DD(Date.now())} value={dateFormat_YY_MM_DD(monthEndRun.date)}  
              onChange={(e)=>setMonthEndRun({...monthEndRun, date: e.target.valueAsNumber})}
              
              />
            </div>
            <small>Date: {monthEndRun.date}</small>
            <div className="uk-form-controls uk-width-1-1">
              <ProgressBar totalItems={moneyMarketAccounts.length} progress={0} />
            </div>
            <hr className="uk-width-1-1 uk-margin-top" />
            <div className="uk-form-controls uk-width-1-1">
              <button className="btn btn-primary" type="submit">
                Initiate  {" "}
                {loading && <div className="uk-margin-small-left" data-uk-spinner={"ratio:.5"}></div>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ErrorBoundary>
  );
});

export default MonthEndInitiationModal;
