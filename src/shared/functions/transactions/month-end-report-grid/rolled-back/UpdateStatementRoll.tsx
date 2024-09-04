import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMailForward, faFileExport, faPenNib } from "@fortawesome/free-solid-svg-icons";
import { dateFormat_YY_MM_DD } from "../../../../utils/utils";
import { useAppContext } from "../../../Context";
import swal from "sweetalert";
import { getFilteredStatementTransactions, getStatementTotalDays, getStatementTotalDistribution, calculateInterest, getTotalDaysInMonth } from "../../Statement";
import { IMonthEndRun, defaultMonthEndRun } from "../../../../models/MonthEndRunModel";
import showModalFromId, { hideModalFromId } from "../../../ModalShow";
import MODAL_NAMES from "../../../../../money-market-management-system/logged-in/dialogs/ModalName";
import { capitaliseTransactionLogicAmount, capitaliseTransactionLogicDays, daysLogic, interestLogic } from "../../../MyFunctions";

interface IProps {
    moneyMarketAccountId: string;
    startDate: Date;
    endDate: Date;
    generateAndSendPDF?: () => void;
    exportAccountStatement?: () => void;
}

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();

const startOfMonth = new Date(currentYear, currentMonth, 1);
const endOfMonth = new Date(currentYear, currentMonth + 1, 1);

export const UpdateStatement = (props: IProps) => {
    const [updatingInterest, setUpdatingInterest] = useState<boolean>(false)
    const { api, store } = useAppContext();
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [startDate, setStartDate] = useState<Date>(startOfMonth);
    const [endDate, setEndDate] = useState<Date>(endOfMonth);
    const [monthEndRun, setMonthEndRun] = useState<IMonthEndRun>({ ...defaultMonthEndRun });
    const month = new Date(Date.now()).getMonth();
    const year = new Date(Date.now()).getFullYear();


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

    const calculateDays = (transactionDate: number, nextTransactionDate?: number, monthEnd?: number): number => {
        const currentDate = new Date();
        const transactionDateTime = new Date(transactionDate);

        if (nextTransactionDate) {
            const nextTransactionDateTime = new Date(nextTransactionDate);
            const millisecondsPerDay = 1000 * 60 * 60 * 24;
            return Math.ceil((nextTransactionDateTime.getTime() - transactionDateTime.getTime()) / millisecondsPerDay);
        } else if (monthEnd) {
            const millisecondsPerDay = 1000 * 60 * 60 * 24;
            const remainingDays = Math.ceil((monthEnd - transactionDateTime.getTime()) / millisecondsPerDay) + 1; // Add 1 to include both start and end dates
            return remainingDays;
        } else {
            const millisecondsPerDay = 1000 * 60 * 60 * 24;
            return Math.ceil((currentDate.getTime() - transactionDateTime.getTime()) / millisecondsPerDay) - 1; // minus 1 to exclude current day
        }
    }


    async function updateInterestAccruedAndTotalDays1() {

        try {
            setUpdatingInterest(true);
            try {
                await api.statementTransaction.getAll(moneyMarketAccountId);
            } catch (error) {
            }
            const transactionStatements = store.statementTransaction.all;
            const statementTransactionsAsJson = transactionStatements.map(transaction => { return transaction.asJson });

            const filteredStatementTransactions = statementTransactionsAsJson.filter(transaction => {
                const transactionDate = new Date(transaction.date);
                return transactionDate >= startDate && transactionDate <= endDate;
            }).sort((a, b) => {
                const dateA = new Date(a.date || 0);
                const dateB = new Date(b.date || 0);

                // First, sort by date
                if (dateB.getTime() !== dateA.getTime()) {
                    return dateA.getTime() - dateB.getTime();
                } else {
                    // If dates are equal, sort by createdAt
                    const createdAtA = new Date(a.createdAt || 0);
                    const createdAtB = new Date(b.createdAt || 0);

                    return createdAtA.getTime() - createdAtB.getTime();
                }
            });


            filteredStatementTransactions.forEach((transaction, index) => {
                transaction.days = index === filteredStatementTransactions.length - 1 ?
                    calculateDays(transaction.date, undefined, monthEndRun.date) :
                    calculateDays(transaction.date, filteredStatementTransactions[index + 1].date, monthEndRun.date);
                transaction.distribution = Number((transaction.balance * transaction.rate / 100 * (transaction.days ? transaction.days / 365 : 0 / 365)).toFixed(2));
            });

            const totalDays = filteredStatementTransactions.reduce((acc, curr) => acc + (curr.days || 0), 0);
            const totalDistribution = filteredStatementTransactions.reduce((acc, curr) => acc + (curr.distribution || 0), 0);

            await api.mma.updateDaysAndInterest(moneyMarketAccountId, totalDays, totalDistribution, `${month}`, `${year}`);
            swal({
                icon: 'warning',
                text: 'Interest Updated.'
            }
            );
            onCancel();
        }
        catch (error) {
            console.log("Error: ", error);
        } finally {
            setUpdatingInterest(false);

        }
        const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const inputDate = event.target.value;
            const inputDateAsANumber = event.target.valueAsNumber;
            const selectedDay = new Date(inputDate).getDay();

            // 0 represents Sunday, 6 represents Saturday
            if (selectedDay === 0 || selectedDay === 6) {
                swal({
                    icon: 'warning',
                    text: 'Month End cannot be on a weekend. Please select a working day.'
                }
                );
                setSelectedDate(''); // Clear the input if a weekend date is selected
            } else {
                setSelectedDate(inputDate);

                setMonthEndRun({ ...monthEndRun, date: inputDateAsANumber })
            }
        };
    }

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputDate = event.target.value;
        const inputDateAsANumber = event.target.valueAsNumber;
        const selectedDay = new Date(inputDate).getDay();

        // 0 represents Sunday, 6 represents Saturday
        if (selectedDay === 0 || selectedDay === 6) {
            swal({
                icon: 'warning',
                text: 'Month End cannot be on a weekend. Please select a working day.'
            }
            );
            setSelectedDate(''); // Clear the input if a weekend date is selected
        } else {
            setSelectedDate(inputDate);

            setMonthEndRun({ ...monthEndRun, date: inputDateAsANumber })
        }
    };


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


    const onCancel = () => {
        hideModalFromId(MODAL_NAMES.BACK_OFFICE.UPDATE_INTEREST_MODAL);
        showModalFromId(MODAL_NAMES.BACK_OFFICE.MONTH_END_ROLLED_BACK_MODAL);
    }




    return (
        <div>
            {updatingInterest ? <h5 className="main-title-sm text-to-break">Updating interest....</h5> :
                <>
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
                            <div className="uk-margin-left">
                                <label className="uk-form-label required" htmlFor="">
                                    Month-End Date
                                </label>
                                <input className="uk-input uk-form-small"
                                    type="date"
                                    name="" id=""
                                    min={dateFormat_YY_MM_DD(Date.now())}
                                    //value={dateFormat_YY_MM_DD(monthEndRun.date)}
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                //onChange={(e) => setMonthEndRun({ ...monthEndRun, date: e.target.valueAsNumber })}
                                />
                            </div>
                        </div>
                        <div className="uk-width-expand uk-align-items-right">
                            <button
                                className="btn btn-primary"
                                disabled={filteredStatementTransactions.length === 0}
                                onClick={updateInterestAccruedAndTotalDays1}>
                                <FontAwesomeIcon icon={faPenNib} /> Update Interest
                            </button>
                        </div>
                    </div>

                    <div className="uk-width-expand">
                        {!loading && statementTransactions.length > 0 &&
                            <table className="uk-table kit-table">
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
                                                <td>{(filteredStatementTransactions[index - 1]?.balance || 0)}</td>
                                                <td>{(transaction.balance)}</td>
                                                <td>{(transaction.rate)}</td>
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
                            loading && <>loading</>
                        }

                    </div>
                </>
            }
        </div>
    )
}





