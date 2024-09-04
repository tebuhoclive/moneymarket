import { useEffect, useState } from "react";
import { useAppContext } from "../../../../../../../shared/functions/Context";
import { dateFormat_YY_MM_DD } from "../../../../../../../shared/utils/utils";
import { LoadingEllipsis } from "../../../../../../../shared/components/loading/Loading";

import { calculateInterest,getFilteredStatementMonthEndTransactionsView, getStatementTotalDays, getStatementTotalDistribution } from "../../../../../../../shared/functions/transactions/Statement";
import { capitaliseTransactionLogicAmount, capitaliseTransactionLogicDays } from "../../../../../../../shared/functions/MyFunctions";

import "./MonthEndClientStatement.scss"
import { numberCurrencyFormat } from "../../../../../../../shared/functions/Directives";

let _currentDate = new Date();

// Get the first day of the next month
let firstDayNextMonth = new Date(_currentDate.getFullYear(), _currentDate.getMonth() + 1, 1);

// Subtract one day in milliseconds to get the last day of the current month
let lastDayCurrentMonth = new Date(firstDayNextMonth.getTime() - 1);

interface IProps {
  moneyMarketAccountId: string;
  noButtons?: boolean;
  noDates?: boolean;
  generateAndSendPDF?: () => void;
  exportAccountStatement?: () => void;
}

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();

const startOfMonth = new Date(currentYear, currentMonth, 1);
const endOfMonth = new Date(currentYear, currentMonth + 1, 1);

const MonthEndClientStatement = (props: IProps) => {

  const { api, store } = useAppContext();

  const [startDate, setStartDate] = useState<Date>(startOfMonth);
  const [endDate, setEndDate] = useState<Date>(endOfMonth);

  const { moneyMarketAccountId, noButtons, noDates } = props;

  const [loading, setLoading] = useState(false)

  const statementTransactions = store.statementTransaction.all.filter(notBlinded => notBlinded.asJson.blinded !== true);

  const statementTransactionsAsJson = statementTransactions.filter((transaction) => transaction.asJson.remark !== "Capitalisation").map((transaction) => {
    return transaction.asJson;
  }
  );

  const filteredStatementTransactions = getFilteredStatementMonthEndTransactionsView(startDate, endDate, statementTransactionsAsJson, Date.parse(formatDate(lastDayCurrentMonth)));

  const totalDays = getStatementTotalDays(filteredStatementTransactions);
  const totalDistribution = getStatementTotalDistribution(filteredStatementTransactions);

  calculateInterest(statementTransactionsAsJson, filteredStatementTransactions);

  const statementBalance =
    filteredStatementTransactions[
      filteredStatementTransactions.length - 1
    ]?.balance || 0;


  const moneyMarketAccountBalance = store.mma.all.find((a) => a.asJson.id === moneyMarketAccountId)?.asJson.balance;

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


  return (
    <div>
      <div className="uk-grid">

        {(statementBalance !== moneyMarketAccountBalance || 0) &&

          <div className="normalClientStatement">
            <div className="something-wrong">
              Something is wrong with the statement or account! <br />
              Statement Balance = {statementBalance} {" "}
              Account Balance = {moneyMarketAccountBalance || 0}
            </div>
          </div>
        }

        {noDates && <div className="uk-width-2-3 uk-flex">
          {/* Existing component code... */}
          <div className="uk-margin">
            <label className="uk-form-label" htmlFor="startDate">
              Statement Period Start:
            </label>
            <input
              className="uk-input uk-form-small"
              type="date"
              id="startDate"
              value={startDate.toISOString().substr(0, 10)}
              onChange={(e) => setStartDate(new Date(e.target.value))}
            />
          </div>
          <div className="uk-margin-left">
            <label className="uk-form-label" htmlFor="endDate">
              Statement Period End:
            </label>
            <input
              className="uk-input uk-form-small"
              type="date"
              id="endDate"
              value={endDate.toISOString().substr(0, 10)}
              onChange={(e) => setEndDate(new Date(e.target.value))}
            />
          </div>
        </div>}
        <div className="uk-width-expand uk-align-items-right">
          {!noButtons && (
            <>
            </>
          )}
        </div>
      </div>

      <div className="uk-width-expand">
        {!loading && statementTransactions.length > 0 && (
          <table className="kit-table-bordered">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Previous Balance</th>
                <th>Balance</th>
                <th>Rate</th>
                <th>Days</th>
                <th>Interest</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th></th>
                <th>Opening Balance</th>
                <th>
                  {(filteredStatementTransactions &&
                    filteredStatementTransactions[0]?.balance) || 0
                  }
                </th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
              </tr>
              {filteredStatementTransactions &&
                filteredStatementTransactions.map((transaction, index) => (
                  <tr
                    className={transaction.blinded ? "uk-text-danger" : ""}
                    key={transaction.id}>
                    <td>{dateFormat_YY_MM_DD(transaction.date)}</td>
                    <td>
                      {transaction.remark === "Opening Balance after Capitalization" ?
                        "-" :
                        <>
                          {transaction.amount}
                        </>
                      }
                    </td>

                    <td>
                      {transaction.remark === "Opening Balance after Capitalization" ?
                        "-" :
                        <>
                          {
                            filteredStatementTransactions[index - 1]?.balance || 0
                          }
                        </>
                      }
                    </td>
                    <td>{transaction.balance}</td>
                    <td>{transaction.rate}</td>
                    {/* <td>{(transaction.days) || "-"}</td> */}
                    <td>{capitaliseTransactionLogicDays(transaction)}</td>
                    <td>{capitaliseTransactionLogicAmount(transaction)}</td>
                    <td>{transaction.remark}</td>
                  </tr>
                ))}
              <tr>
                <th></th>
                <th>Closing Balance</th>
                <th>
                  {(filteredStatementTransactions &&
                    filteredStatementTransactions[
                      filteredStatementTransactions.length - 1
                    ]?.balance) || 0
                  }
                </th>
                <th></th>
                <th>Totals</th>
                <th>{totalDays}</th>
                <th>{numberCurrencyFormat(totalDistribution)}</th>
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

export default MonthEndClientStatement


function formatDate(date: Date) {
  let year = date.getFullYear();
  let month = (date.getMonth() + 1).toString().padStart(2, '0');
  let day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}
