import { useEffect, useState } from "react";
import { useAppContext } from "../../../../../../shared/functions/Context";
import { dateFormat_YY_MM_DD } from "../../../../../../shared/utils/utils";
import { LoadingEllipsis } from "../../../../../../shared/components/loading/Loading";
import { getStatementTotalDays, getStatementTotalDistribution, calculateInterest, getFilteredStatementCloseOutTransactions } from "../../../../../../shared/functions/transactions/Statement";
import { IMoneyMarketAccount } from "../../../../../../shared/models/money-market-account/MoneyMarketAccount";
import { ISwitchTransaction } from "../../../../../../shared/models/SwitchTransactionModel";

interface IProps {
  closeOutDate: number;
  closeOutTransaction: ISwitchTransaction;
  account: IMoneyMarketAccount;
  interest: number;
  isFromStatement: boolean;
}

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();

const startOfMonth = new Date(currentYear, currentMonth, 1);
const endOfMonth = new Date(currentYear, currentMonth + 1, 1);

const CloseOutStatementSwitch = (props: IProps) => {

  const { api, store } = useAppContext();

  const { account, closeOutDate, closeOutTransaction, interest, isFromStatement } = props;

  const [loading, setLoading] = useState(false)

  const statementTransactions = store.statementTransaction.all.filter(notBlinded => notBlinded.asJson.blinded !== true);

  const statementTransactionsAsJson = statementTransactions.map(
    (transaction) => {
      return transaction.asJson;
    }
  );
  const filteredStatementTransactions = getFilteredStatementCloseOutTransactions(startOfMonth, endOfMonth, statementTransactionsAsJson, closeOutDate)

  const totalDays = getStatementTotalDays(filteredStatementTransactions);
  const totalDistribution = getStatementTotalDistribution(filteredStatementTransactions);

  calculateInterest(statementTransactionsAsJson, filteredStatementTransactions);

  useEffect(() => {
    const loadStatement = async () => {
      setLoading(true);
      if (account.id) {
        try {

          await Promise.all([
            store.statementTransaction.removeAll(),
            api.statementTransaction.getAll(account.id),
          ]);
        } catch (error) { }
      } else {
      }
      setLoading(false);
    };

    loadStatement();
  }, [api.statementTransaction, account.id, store.statementTransaction]);

  return (
    <div className="uk-margin-top">
      <div className="uk-width-expand">
        {!loading && (
          <table className="uk-table uk-table-small kit-table">
            <thead>
              <tr>
                <th className="uk-table-expand">Date</th>
                <th className="uk-table-expand">Amount</th>
                <th className="uk-table-expand">Previous Balance</th>
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
                  {filteredStatementTransactions &&
                    (
                      filteredStatementTransactions[0]?.balance || 0
                    )}
                </th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
              </tr>
              {filteredStatementTransactions &&
                filteredStatementTransactions.map((transaction, index) => (
                  <tr key={transaction.id}>
                    <td>{dateFormat_YY_MM_DD(transaction.date)}</td>
                    <td>
                      {transaction.amount
                        ? transaction.transaction === "withdrawal"
                          ? `-${(transaction.amount)}`
                          : (transaction.amount)
                        : "-"}
                    </td>

                    <td>
                      {(
                        filteredStatementTransactions[index - 1]?.balance || 0
                      )}
                    </td>
                    <td>{(transaction.balance)}</td>
                    <td>{(transaction.rate)}</td>
                    <td>{transaction.days || "-"}</td>
                    <td>{(transaction.distribution || 0) || "-"}</td>
                    <td>{transaction.remark}</td>
                  </tr>
                ))}

              {
                isFromStatement &&
                <>
                  <tr>
                    <td>
                      {dateFormat_YY_MM_DD(
                        closeOutTransaction.valueDate
                          ? closeOutTransaction.valueDate
                          : 0
                      )}
                    </td>
                    <td>{`${(interest)}`}</td>

                    <td>{(account.balance)}</td>
                    <td>{(account.balance + interest)}</td>
                    <td>{(account.clientRate || 0)}</td>
                    <td>{totalDays || "-"}</td>
                    <td>{"-"}</td>
                    <td>{"Capitalise"}</td>
                  </tr>
                  <tr>
                    <td>
                      {dateFormat_YY_MM_DD(
                        closeOutTransaction.valueDate
                          ? closeOutTransaction.valueDate
                          : Date.now()
                      )}
                    </td>
                    <td>{`-${(account.balance + interest)}`}</td>
                    <td>{(account.balance + interest)}</td>
                    <td>
                      {(
                        closeOutTransaction.amount - closeOutTransaction.amount
                      )}
                    </td>
                    <td>{(account.clientRate || 0)}</td>
                    <td>{"-"}</td>
                    <td>{"-"}</td>
                    <td>{"Close-out: Withdrawal"}</td>
                  </tr>

                  <tr className="uk-text-bold">
                    <th></th>
                    <th>Closing Balance</th>
                    <th>
                      {filteredStatementTransactions &&
                        (
                          filteredStatementTransactions[
                            filteredStatementTransactions.length - 1
                          ]?.balance || 0
                        )}
                    </th>
                    <th></th>
                    <th>Totals</th>
                    <th>{totalDays}</th>
                    <th>{(totalDistribution)}</th>
                    <th></th>
                  </tr>
                </>

              }
              {
                !isFromStatement &&
                <>
                  <tr>
                    <td>
                      {dateFormat_YY_MM_DD(
                        closeOutTransaction.valueDate
                          ? closeOutTransaction.valueDate
                          : 0
                      )}
                    </td>
                    <td>{`${(interest)}`}</td>
                    <td>{(account.balance)}</td>
                    <td>{(account.balance + interest)}</td>
                    <td>{(account.clientRate || 0)}</td>
                    <td>{totalDays || "-"}</td>
                    <td>{"-"}</td>
                    <td>{`Switch From ${closeOutTransaction.fromAccount} : Close out`}</td>
                  </tr>
                  <tr className="uk-text-bold">
                    <th></th>
                    <th>Closing Balance</th>
                    <th>
                      {filteredStatementTransactions &&
                        (
                          filteredStatementTransactions[
                            filteredStatementTransactions.length - 1
                          ]?.balance || 0
                        )}
                    </th>
                    <th></th>
                    <th>Totals</th>
                    <th>{totalDays}</th>
                    <th>{(totalDistribution)}</th>
                    <th></th>
                  </tr>
                </>

              }

            </tbody>
          </table>
        )}
        {loading && <LoadingEllipsis />}
      </div>
    </div>
  );
}

export default CloseOutStatementSwitch;
