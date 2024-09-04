import { useEffect, useState } from "react";
import { useAppContext } from "../../../Context";
import { calculateFeeInterest, getFilteredFeeStatementTransactions, getStatementTotalDays, getStatementTotalDistribution } from "../../Statement";
import { numberFormat, roundOff } from "../../../Directives";
import { dateFormat_YY_MM_DD } from "../../../../utils/utils";
import { capitaliseTransactionLogicAmount, capitaliseTransactionLogicDays } from "../../../MyFunctions";
import { IMoneyMarketAccount } from "../../../../models/money-market-account/MoneyMarketAccount";

interface IProps {
    moneyMarketAccountId: string;
    account: IMoneyMarketAccount
}

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();

const startOfMonth = new Date(currentYear, currentMonth, 1);
const endOfMonth = new Date(currentYear, currentMonth + 1, 1);

const NormalClientFeeStatement = (props: IProps) => {

    const { api, store } = useAppContext();

    const [startDate, setStartDate] = useState<Date>(startOfMonth);
    const [endDate, setEndDate] = useState<Date>(endOfMonth);

    const { moneyMarketAccountId, account } = props;

    const [loading, setLoading] = useState(false);

    const statementTransactions = store.statementTransaction.all.filter(notBlinded => notBlinded.asJson.blinded !== true);

    const statementTransactionsAsJson = statementTransactions.map((transaction) => {
        return transaction.asJson;
    });

    const filteredStatementTransactions = getFilteredFeeStatementTransactions(startDate, endDate, statementTransactionsAsJson, account);

    const totalDays = getStatementTotalDays(filteredStatementTransactions);
    const totalDistribution = getStatementTotalDistribution(filteredStatementTransactions);

    calculateFeeInterest(statementTransactionsAsJson, filteredStatementTransactions, account);

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
            <div className="uk-grid uk-grid-small" data-uk-grid>
                <div className="uk-width-2-3 uk-flex">
                    <div className="uk-margin">
                        <label className="uk-form-label" htmlFor="startDate">
                            Statement Period Start:
                        </label>
                        <input className="uk-form-small" type="date" id="startDate"
                            value={startDate.toISOString().substr(0, 10)}
                            onChange={(e) => setStartDate(new Date(e.target.value))}
                        />
                    </div>
                    <div className="uk-margin-left">
                        <label className="uk-form-label" htmlFor="endDate">
                            Statement Period End:
                        </label>
                        <input className="uk-form-small" type="date" id="endDate"
                            value={endDate.toISOString().substr(0, 10)}
                            onChange={(e) => setEndDate(new Date(e.target.value))}
                        />
                    </div>
                </div>
            </div>

            <div className="uk-width-expand">
                {!loading && statementTransactions.length > 0 &&
                    <table className="kit-table-bordered">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Previous Balance</th>
                                <th>Balance</th>
                                <th>Fee</th>
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
                                        numberFormat(
                                            filteredStatementTransactions[0]?.balance || 0
                                        )}
                                </th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                            </tr>
                            {filteredStatementTransactions &&
                                filteredStatementTransactions.map((transaction, index) => (
                                    <tr className={transaction.blinded ? 'uk-text-danger' : ''} key={transaction.id}>
                                        <td>{dateFormat_YY_MM_DD(transaction.date)}</td>
                                        <td>
                                            {
                                                transaction.amount ? transaction.transaction === "withdrawal" ? `-${numberFormat(transaction.amount)}`
                                                    : numberFormat(transaction.amount)
                                                    : "-"
                                            }
                                        </td>
                                        <td>{numberFormat(filteredStatementTransactions[index - 1]?.balance || 0)}</td>
                                        <td>{numberFormat(transaction.balance)}</td>
                                        <td>{roundOff(account.baseRate - transaction.rate)}</td>
                                        <td>{capitaliseTransactionLogicDays(transaction)}</td>
                                        <td>{capitaliseTransactionLogicAmount(transaction)}</td>
                                        <td>{transaction.remark}</td>
                                    </tr>
                                ))}
                            <tr>
                                <th></th>
                                <th>Closing Balance</th>
                                <th>
                                    {filteredStatementTransactions &&
                                        numberFormat(
                                            filteredStatementTransactions[
                                                filteredStatementTransactions.length - 1
                                            ]?.balance || 0
                                        )}
                                </th>
                                <th></th>
                                <th>Totals</th>
                                <th>{totalDays}</th>
                                <th>{numberFormat(totalDistribution)}</th>
                                <th></th>
                            </tr>
                        </tbody>
                    </table>
                }
                {
                    loading && <p>Loading</p>
                }
            </div>
        </div>
    )
}

export default NormalClientFeeStatement
