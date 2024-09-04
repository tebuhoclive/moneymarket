import { useEffect, useState } from "react";
import { useAppContext } from "../../../../../../shared/functions/Context";
import { dateFormat_YY_MM_DD } from "../../../../../../shared/utils/utils";
import { LoadingEllipsis } from "../../../../../../shared/components/loading/Loading";
import { calculateInterest, getFilteredStatementTransactions, getStatementTotalDays, getStatementTotalDistribution } from "../../../../../../shared/functions/transactions/Statement";
import { capitaliseTransactionLogicAmount, capitaliseTransactionLogicDays } from "../../../../../../shared/functions/MyFunctions";
import { StatementPDFComponent } from "./statement-run-pdf/StatementPdf";
import { sendStatements } from "./statement-run-pdf/statement-email-templates/StatementEmail";
import { IMoneyMarketAccount } from "../../../../../../shared/models/money-market-account/MoneyMarketAccount";
import swal from "sweetalert";
import { clientEmail, clientName, clientPostalAddress, entityNumber } from "../../../../../../shared/functions/transactions/month-end-report-grid/SimpleFunctions";
import { getProductName } from "../../../reports-module/transactions/GetProductCode";
import { StatementExcelComponent } from "./statement-run-pdf/StatementExcelComponent";
import "./NormalClientStatement.scss"
import { onReAlign } from "../../../../../../shared/functions/transactions/CorrectionsOnStatement";
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import FormatLineSpacingIcon from '@mui/icons-material/FormatLineSpacing';
import { ACTIVE_ENV } from "../../../../CloudEnv";
import { numberCurrencyFormat } from '../../../../../../shared/functions/Directives';

interface IProps {
  moneyMarketAccountId: string;
  noButtons?: boolean;
  noDates?: boolean;
  generateAndSendPDF?: () => void;
  exportAccountStatement?: () => void;
}

interface IStatementRunData {
  id: string,
  entityNumber?: string;
  clientName?: string,
  accountNumber?: string;
  product?: string;
  instrumentName?: string;
  emailAddress?: string;
  rate?: number;
  postalAddress?: string;
}
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();
const startOfMonth = new Date(currentYear, currentMonth, 1);
const endOfMonth = new Date(currentYear, currentMonth + 1, 1);

const NormalClientStatement = (props: IProps) => {

  const { api, store } = useAppContext();
  const [startDate, setStartDate] = useState<Date>(startOfMonth);
  const [endDate, setEndDate] = useState<Date>(endOfMonth);
  const [account, setAccount] = useState<IStatementRunData | undefined>(undefined);

  const { moneyMarketAccountId, noButtons, noDates = true } = props;

  const accountDetails = store.mma.all.find((a) => a.asJson.id === moneyMarketAccountId)?.asJson as IMoneyMarketAccount;

  useEffect(() => {

    const _account = accountDetails;

    if (_account) {
      const prepareAccount = () => {
        const $account: IStatementRunData = {
          id: _account.id,
          entityNumber: entityNumber(_account.id, store),
          clientName: clientName(_account.id, store),
          accountNumber: _account.accountNumber,
          product: _account.accountType,
          emailAddress: clientEmail(_account.id, store),
          rate: _account.clientRate,
          postalAddress: clientPostalAddress(_account.id, store),
          instrumentName: getProductName(store, _account.accountType)
        };
        setAccount($account);
      };

      prepareAccount();
    } else {
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountDetails]);

  const [loading, setLoading] = useState(false)

  const statementTransactions = store.statementTransaction.all.filter(notBlinded => notBlinded.asJson.blinded !== true);

  const statementTransactionsAsJson = statementTransactions.map((transaction) => {
    return transaction.asJson;
  }
  );

  const filteredStatementTransactions = getFilteredStatementTransactions(startDate, endDate, statementTransactionsAsJson);

  const totalDays = getStatementTotalDays(filteredStatementTransactions);
  const totalDistribution = getStatementTotalDistribution(filteredStatementTransactions);

  calculateInterest(statementTransactionsAsJson, filteredStatementTransactions);

  const singleRateChange = async () => {
    const rateChangeData = {
      moneyMarketAccountId: moneyMarketAccountId,
      date: "2024-07-18",
      rate: 7.93,
      createdDateAndTime: Date.parse("2024-07-18T04:00:00")
    };

    console.log("Data: ", rateChangeData);

    const url = `${ACTIVE_ENV.url}recordSingleRateChange`;
    setLoading(true);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rateChangeData),
      });

      if (response.ok) {
        setLoading(false);

      } else {
        const errorText = await response.text();
        setLoading(false);
        throw new Error(errorText);
      }
    } catch (error) {
      throw error; // Re-throw the error to be caught in handleInitiateMonthEndRun
    }
  }


  useEffect(() => {
    const loadStatement = async () => {
      if (moneyMarketAccountId) {
        try {
          setLoading(true);
          await Promise.all([
            store.statementTransaction.removeAll(),
            api.statementTransaction.getAll(moneyMarketAccountId),
          ]);
          setLoading(false);
        } catch (error) { }
      }
    };

    loadStatement();
  }, [api.statementTransaction, moneyMarketAccountId, store.statementTransaction]);

  const onSendClientStatement = async () => {
    swal({
      title: "Are you sure?",
      text: "Statement will be send to the client via email",
      icon: "warning",
      buttons: ["Cancel", "Send"],
      dangerMode: true,
    }).then(async (edit) => {
      if (edit) {
        setLoading(true);
        if (account) {
          await sendStatements(account, startDate, endDate);
        }
        swal({
          icon: "success",
          title: "Statement Send"
        })
        setLoading(false);
      } else {
        swal({
          title: "Oops!",
          text: "Operation cancelled",
          icon: "error"
        })
      }
    });
  }

  return (
    <div>
      <div className="uk-grid uk-grid-small" data-uk-grid>
        {noDates &&
          <div className="uk-width-1-2 uk-flex">
            <div className="uk-margin-small-right">
              <label className="uk-form-label" htmlFor="startDate">
                Statement Period Start:
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate.toISOString().substr(0, 10)}
                onChange={(e) => setStartDate(new Date(e.target.value))}
              />
            </div>
            <div>
              <label className="uk-form-label" htmlFor="endDate">
                Statement Period End:
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate.toISOString().substr(0, 10)}
                onChange={(e) => setEndDate(new Date(e.target.value))}
              />
            </div>
          </div>}
        {!noButtons && (
          <div className="uk-grid uk-grid-small uk-width-1-2 uk-child-width-expand uk-margin-top" data-uk-grid>
            <StatementPDFComponent accountId={moneyMarketAccountId} filteredTransactions={filteredStatementTransactions} totalDays={totalDays} totalDistribution={totalDistribution} startDate={startDate} endDate={endDate} />
            <StatementExcelComponent accountId={moneyMarketAccountId} filteredTransactions={filteredStatementTransactions} totalDays={totalDays} totalDistribution={totalDistribution} startDate={startDate} endDate={endDate} />
            <button
              className="btn btn-primary"
              disabled={filteredStatementTransactions.length === 0 || loading}
              onClick={onSendClientStatement}>
              <ForwardToInboxIcon style={{ fontSize: "16px" }} />
              {loading && <span data-uk-spinner={"ratio:.5"}></span>}
            </button>
            <button disabled={loading} type="button" onClick={() => onReAlign(moneyMarketAccountId)} className="btn btn-danger">
              <FormatLineSpacingIcon style={{ fontSize: "16px" }} />
            </button>
            {/* <button disabled={loading} type="button" onClick={singleRateChange} className="btn btn-danger">
              {loading ? "..." : "Rate"}
            </button> */}
          </div>
        )}
      </div>

      <div className="uk-width-expand uk-margin-top">
        {!loading && statementTransactions.length > 0 && (
          <table className="kit-table-bordered">
            <thead>
              <tr>
                <th className="uk-table-expand">Date</th>
                <th className="uk-table-expand">Amount</th>
                <th className="uk-table-expand">Previous Balance</th>
                <th className="uk-table-expand">Balance</th>
                <th className="uk-table-shrink">Rate</th>
                <th className="uk-table-shrink">Days</th>
                <th className="uk-table-expand">Interest</th>
                <th className="uk-table-expand">Remark</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th className="uk-text-center" colSpan={3}>Opening Balance</th>
                <th className="uk-text-right">
                  {(filteredStatementTransactions &&
                    numberCurrencyFormat(filteredStatementTransactions[0]?.balance)) || 0
                  }
                </th>
                <th className="uk-text-left">
                  {(filteredStatementTransactions &&
                    filteredStatementTransactions[0]?.rate) || 0
                  }
                </th>
                <th colSpan={3}></th>
              </tr>
              {filteredStatementTransactions &&
                filteredStatementTransactions.map((transaction, index) => (
                  <tr
                    className={transaction.blinded ? "uk-text-danger" : ""}
                    key={transaction.id}>
                    <td>{dateFormat_YY_MM_DD(transaction.date)}</td>
                    <td className="uk-text-right">
                      {transaction.remark === "Opening Balance after Capitalization" ?
                        "-" :
                        numberCurrencyFormat(transaction.amount)

                      }
                    </td>

                    <td className="uk-text-right">
                      {transaction.remark === "Opening Balance after Capitalization" ?
                        "-" :
                        <>
                          {
                            numberCurrencyFormat(filteredStatementTransactions[index - 1]?.balance) || 0
                          }
                        </>
                      }
                    </td>
                    <td className="uk-text-right">{numberCurrencyFormat(transaction.balance)}</td>
                    <td>{transaction.rate}</td>
                    <td>{capitaliseTransactionLogicDays(transaction)}</td>
                    <td className="uk-text-right">{capitaliseTransactionLogicAmount(transaction)}</td>
                    <td>{transaction.remark}</td>
                  </tr>
                ))}
              <tr>
                <th className="uk-text-center" colSpan={3}>Closing Balance</th>
                <th className="uk-text-right">
                  {(filteredStatementTransactions &&
                    numberCurrencyFormat(filteredStatementTransactions[
                      filteredStatementTransactions.length - 1
                    ]?.balance)) || 0
                  }
                </th>
                <th>Totals</th>
                <th className="uk-text-left">{totalDays}</th>
                <th className="uk-text-right">{numberCurrencyFormat(totalDistribution)}</th>
                <th></th>
              </tr>
            </tbody>
          </table>
        )}
        {loading && <LoadingEllipsis />}
      </div>
    </div>
  );
}

export default NormalClientStatement
