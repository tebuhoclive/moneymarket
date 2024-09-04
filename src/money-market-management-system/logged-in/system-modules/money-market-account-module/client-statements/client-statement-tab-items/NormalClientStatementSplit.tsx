import { useEffect, useState } from "react";
import { useAppContext } from "../../../../../../shared/functions/Context";
import { dateFormat_YY_MM_DD } from "../../../../../../shared/utils/utils";
import { LoadingEllipsis } from "../../../../../../shared/components/loading/Loading";
import { calculateInterest, getFilteredStatementTransactions, getStatementTotalDays, getStatementTotalDistribution } from "../../../../../../shared/functions/transactions/Statement";
import { capitaliseTransactionLogicAmount, capitaliseTransactionLogicDays } from "../../../../../../shared/functions/MyFunctions";
import { IMoneyMarketAccount } from "../../../../../../shared/models/money-market-account/MoneyMarketAccount";
import "./NormalClientStatement.scss"
import SingleSelect from "../../../../../../shared/components/single-select/SingleSelect";

interface IProps {
  accountsToSplit: IMoneyMarketAccount[];
}

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();
const startOfMonth = new Date(currentYear, currentMonth, 1);
const endOfMonth = new Date(currentYear, currentMonth + 1, 1);

const NormalClientStatementSplit = (props: IProps) => {

  const { api, store } = useAppContext();
  const [startDate, setStartDate] = useState<Date>(startOfMonth);
  const [endDate, setEndDate] = useState<Date>(endOfMonth);

  const [account, setAccount] = useState<IMoneyMarketAccount>()

  const { accountsToSplit } = props;

  const clientAccountOptions = accountsToSplit.map((account) => ({
    label: `${account.accountNumber}-${account.accountName}`,
    value: account.accountNumber,
  }));

  const onChangeAccount = (accountNumber: string) => {
    const account = store.mma.all.find(account => account.asJson.accountNumber === accountNumber);
    if (account) {
      setAccount(account.asJson);
    }
  }

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

  useEffect(() => {
    const loadStatement = async () => {
      if (account && account.id) {
        try {
          setLoading(true);
          await Promise.all([
            store.statementTransaction.removeAll(),
            api.statementTransaction.getAll(account.id),
          ]);
          setLoading(false);
        } catch (error) { }
      }
    };

    loadStatement();
  }, [account, api.statementTransaction, store.statementTransaction]);

  return (
    <>
      <div className="uk-width-1-1 uk-child-width-1-3 uk-grid uk-grid-small" data-uk-grid>
        <div>
          <label className="uk-form-label" htmlFor="startDate">
            Account:
          </label>
          <SingleSelect options={clientAccountOptions} onChange={(value) => onChangeAccount(value)}  value={account?.accountNumber ??""} />
        </div>
        <div>
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
                <th></th>
                <th>{totalDays}</th>
                <th>{totalDistribution}</th>
                <th></th>
              </tr>
            </tbody>
          </table>
        )}
        {loading && <LoadingEllipsis />}
      </div>
    </>
  );
}

export default NormalClientStatementSplit
