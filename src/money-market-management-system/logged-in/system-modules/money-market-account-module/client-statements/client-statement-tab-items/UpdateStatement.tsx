import { useEffect, useState } from "react";
import { useAppContext } from "../../../../../../shared/functions/Context";
import { dateFormat_YY_MM_DD } from "../../../../../../shared/utils/utils";
import { LoadingEllipsis } from "../../../../../../shared/components/loading/Loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMailForward, faFileExport } from "@fortawesome/free-solid-svg-icons";
import { calculateInterest, getFilteredStatementTransactions, getStatementTotalDays, getStatementTotalDistribution, getTotalDaysInMonth } from "../../../../../../shared/functions/transactions/Statement";

interface IProps {
    moneyMarketAccountId: string;
    startDate: Date;
    endDate: Date;
    generateAndSendPDF: () => void;
    exportAccountStatement: () => void;
}

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();

const startOfMonth = new Date(currentYear, currentMonth, 1);
const endOfMonth = new Date(currentYear, currentMonth + 1, 1);

export const UpdateStatement = (props: IProps) => {

    const { api, store } = useAppContext();

    const [startDate, setStartDate] = useState<Date>(startOfMonth);
    const [endDate, setEndDate] = useState<Date>(endOfMonth);

    const { moneyMarketAccountId, generateAndSendPDF, exportAccountStatement } = props;

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

    const totalDaysInMonth = getTotalDaysInMonth(statementTransactionsAsJson);

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
    }, [api.statementTransaction, moneyMarketAccountId]);

    return (
        <div>
            <div className="uk-grid">
                <div className="uk-width-2-3 uk-flex">
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
                </div>
                <div className="uk-width-expand uk-align-items-right">
                    <button
                        className="btn btn-primary"
                        disabled={filteredStatementTransactions.length === 0}
                        onClick={generateAndSendPDF}>
                        <FontAwesomeIcon icon={faMailForward} /> Email
                    </button>
                    <button
                        className="btn btn-primary"
                        disabled={filteredStatementTransactions.length === 0}
                        onClick={exportAccountStatement}>
                        <FontAwesomeIcon icon={faFileExport} /> Export(PDF)
                    </button>
                </div>
            </div>

            <div className="uk-width-expand">
                {!loading && statementTransactions.length > 0 &&
                    <table className="uk-table">
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
                                    {filteredStatementTransactions &&
                                        (
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
                                                transaction.amount ? transaction.transaction === "withdrawal" ? `-${(transaction.amount)}`
                                                    : (transaction.amount)
                                                    : "-"
                                            }
                                        </td>
                                        <td>{(transaction.previousBalance || 0)}</td>
                                        <td>{(transaction.balance)}</td>
                                        <td>{(transaction.rate)}</td>
                                        <td>{(transaction.days) || "-"}</td>
                                        <td>{(transaction.distribution || 0) || "-"}</td>
                                        <td>{transaction.remark}</td>
                                    </tr>
                                ))}
                            <tr>
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
                        </tbody>
                    </table>
                }
                {
                    loading && <LoadingEllipsis />
                }
            </div>
        </div>
    )
}

