import { useEffect, useState } from "react";
import MODAL_NAMES from "../../ModalName";
import { observer } from "mobx-react-lite";
import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";
import { useAppContext } from "../../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import { dateFormat_YY_MM_DD } from "../../../../../shared/utils/utils";
// import { initiateMonthEnd } from "../../../../../shared/functions/transactions/MonthEndRunFunctions";
import swal from "sweetalert";
import { CustomOpenAccordion } from "../../../../../shared/components/accordion/Accordion";
import { IMonthEndRun, defaultMonthEndRun } from "../../../../../shared/models/MonthEndRunModel";
import { rollBackMonthEnd } from "../../../system-modules/money-market-transactions-module/month-end/RollBackFunction";
import { LoadingEllipsis } from "../../../../../shared/components/loading/Loading";


interface IProps {
  setIsVisible: (show: boolean) => void;
}

export const MonthEndRollBack = observer(({ setIsVisible }: IProps) => {
  const { api, store } = useAppContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [monthEndRun, setMonthEndRun] = useState<IMonthEndRun>({ ...defaultMonthEndRun });
  const [progress, setProgress] = useState<number>(0);
  const [accountsUpdated, setAccountsUpdated] = useState(0);


  const moneyMarketAccounts = store.mma
    .getAllLiabilityAccountsNoZeroBalances()
    .sort((a, b) =>
      a.asJson.accountNumber.localeCompare(b.asJson.accountNumber))
    // .slice(0, 20)
    .map((acc) => { return acc.asJson });


  const onCancel = () => {
    setIsVisible(false);
    hideModalFromId(MODAL_NAMES.BACK_OFFICE.MONTH_END_INITIATION_MODAL);
    store.monthEndRun.clearSelected();
  };

  useEffect(() => {
    if (store.monthEndRun.selected) {
      setMonthEndRun(store.monthEndRun.selected);
    } else {
    }
  }, [store.monthEndRun.selected])

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
          Roll Back Month End ({monthEndRun.year} {monthEndRun.id})
        </h3>
        {loading && <LoadingEllipsis />}
        {/* <div className="uk-width-1-1 uk-margin">
          <label>Month End Reverting</label> <br />
          <label className="uk-form-label required">
            {`Progress ${progress}% - ${accountsUpdated} out of ${moneyMarketAccounts.length} completed`}
          </label>
          <progress
            className="uk-progress"
            value={progress}
            max={100}
          ></progress>
          <br />
   </div> */}

        <button
          className="btn btn-primary"
          // onClick={() => rollBackMonthEnd(moneyMarketAccounts, monthEndRun.year, monthEndRun.id, setLoading)}
        >
          Roll Back Month End
        </button>

      </div>
    </ErrorBoundary>
  );
});

