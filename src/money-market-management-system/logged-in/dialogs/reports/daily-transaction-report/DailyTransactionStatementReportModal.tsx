import { observer } from "mobx-react-lite";
import DailyTransactionStatementReportGrid from "./DailyTransactionStatementReportGrid";
import { ISelectedClient } from "../../../system-modules/reports-module/transactions/DailyTransactionReport";
import { useState } from "react";
import NormalClientStatementSplit from '../../../system-modules/money-market-account-module/client-statements/client-statement-tab-items/NormalClientStatementSplit';
import { IMoneyMarketAccount } from "../../../../../shared/models/money-market-account/MoneyMarketAccount";
interface IProps {
  data: ISelectedClient[];
}

const DailyTransactionStatementReportModal = observer((props: IProps) => {
  const { data } = props;
  const [selectedTab, setSelectedTab] = useState("Completed Transactions");

  const accounts:IMoneyMarketAccount[] = []


  return (
    <div className="custom-modal-style uk-modal-dialog uk-margin-auto-vertical uk-width-4-5">
      <button
        className="uk-modal-close-default"
        type="button"
        data-uk-close
      ></button>
      <div className="form-title">
        <h3 style={{ marginRight: "1rem" }}>
          Daily Transaction Report
        </h3>
        <img src={`${process.env.PUBLIC_URL}/arrow.png`} alt="" />
        <h3 className="text-to-break" style={{ marginLeft: "2rem" }}>
          Statements
        </h3>
      </div>

      <hr />
      <div className="uk-margin-bottom uk-text-right">
        <button className={`btn ${selectedTab === "Completed Transactions" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("Completed Transactions")}>
          Completed Transactions
        </button>
        <button className={`btn ${selectedTab === "Statement" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("Statement")}>
          Statement View
        </button>
      </div>

      <div className="dialog-content uk-position-relative">
        {
          selectedTab === "Completed Transactions" && <DailyTransactionStatementReportGrid data={data} />
        }
        {
          selectedTab === "Statement" &&
          <>
            <h4 className="main-title-md">Client Statement</h4>
            <NormalClientStatementSplit accountsToSplit={accounts}/>
          </>
        }

      </div>

    </div>
  );
});

export default DailyTransactionStatementReportModal;
