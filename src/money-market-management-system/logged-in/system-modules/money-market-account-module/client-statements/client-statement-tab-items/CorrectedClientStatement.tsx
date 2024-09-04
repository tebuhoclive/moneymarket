import { Fragment, useEffect, useState } from "react";
import { useAppContext } from "../../../../../../shared/functions/Context";
import { dateFormat_YY_MM_DD } from "../../../../../../shared/utils/utils";
import swal from "sweetalert";
import { LoadingEllipsis } from "../../../../../../shared/components/loading/Loading";

import { getFilteredStatementTransactions, getStatementTotalDays, getStatementTotalDistribution, calculateInterest } from "../../../../../../shared/functions/transactions/Statement";
import { depositCorrection, rateChange, switchFromCorrection, switchToCorrection, withdrawalCorrection } from "../../../../../../shared/functions/transactions/CorrectionsOnStatement";


import { IconButton } from "@mui/material";
import { IStatementTransaction } from "../../../../../../shared/models/StatementTransactionModel";
import showModalFromId from "../../../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../../../../dialogs/ModalName";
import Modal from "../../../../../../shared/components/Modal";
import { UpdateRemarkModal } from "./UpdateRemarkModal";
import { numberCurrencyFormat } from '../../../../../../shared/functions/Directives';
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import { BorderColor, CancelOutlined } from "@mui/icons-material";

interface IProps {
    moneyMarketAccountId: string;
    generateAndSendPDF?: () => void;
    exportAccountStatement?: () => void;
}

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();

const startOfMonth = new Date(currentYear, currentMonth, 1);
const endOfMonth = new Date(currentYear, currentMonth + 1, 1);

const CorrectedClientStatement = (props: IProps) => {

    const { api, store } = useAppContext();

    const [startDate, setStartDate] = useState<Date>(startOfMonth);
    const [endDate, setEndDate] = useState<Date>(endOfMonth);

    const { moneyMarketAccountId } = props;

    const [selectedRows, setSelectedRows] = useState<number[]>([]);

    const [newRemark, setNewRemark] = useState("")

    const [loading, setLoading] = useState(false)
    // const [refreshing, setRefreshing] = useState(false);
    const toggleRowSelection = (index: number) => {
        if (selectedRows.includes(index)) {
            setSelectedRows(selectedRows.filter((selected) => selected !== index));
        } else {
            setSelectedRows([...selectedRows, index]);
        }
    };

    const statementTransactions = store.statementTransaction.all;

    const statementTransactionsAsJson = statementTransactions.map(
        (transaction) => {
            return transaction.asJson;
        }
    );
    const filteredStatementTransactions = getFilteredStatementTransactions(startDate, endDate, statementTransactionsAsJson)

    const totalDays = getStatementTotalDays(filteredStatementTransactions);
    const totalDistribution = getStatementTotalDistribution(filteredStatementTransactions);

    calculateInterest(statementTransactionsAsJson, filteredStatementTransactions);


    const handleDeletion = async (statementTransactionId: string) => {
        swal({
            title: "Are you sure?",
            icon: "warning",
            buttons: ["Cancel", "Adjust"],
            dangerMode: true,
        }).then(async (edit) => {
            if (edit) {
                const transactionOnStatement = filteredStatementTransactions.find(
                    (transaction) => transaction.id === statementTransactionId
                );
                setLoading(true);
                if (transactionOnStatement) {
                    switch (transactionOnStatement.transaction) {
                        case 'deposit':
                            depositCorrection(newRemark, moneyMarketAccountId, transactionOnStatement, api, store);
                            setSelectedRows([]);
                            break;
                        case 'withdrawal':
                            withdrawalCorrection(newRemark, moneyMarketAccountId, transactionOnStatement, api, store);
                            setSelectedRows([]);
                            break;
                        case 'switchFrom':
                            switchFromCorrection(newRemark, moneyMarketAccountId, transactionOnStatement, api, store);
                            setSelectedRows([]);
                            break;
                        case 'switchTo':
                            switchToCorrection(newRemark, moneyMarketAccountId, transactionOnStatement, api, store);
                            setSelectedRows([]);
                            break;
                        case 'rateChange':
                            rateChange(newRemark, moneyMarketAccountId, transactionOnStatement, api, store);
                            setSelectedRows([]);
                            break;
                        default:
                            break;
                    }
                }

                setLoading(false)
            } else {
                swal({
                    icon: "error",
                    text: "Statement adjustment cancelled!",
                });
            }
        });
    }

    const updateRemark = (transaction: IStatementTransaction) => {
        store.statementTransaction.select(transaction);
        showModalFromId(MODAL_NAMES.BACK_OFFICE.EDIT_NORMAL_STATEMENT_MODAL)
    }

    // const onRefresh = async () => {
    //     try {
    //         setRefreshing(true);
    //         await api.statementTransaction.getAll(moneyMarketAccountId);
    //         setRefreshing(false);
    //     } catch (error) {
    //     }
    // }


    useEffect(() => {
        const loadStatement = async () => {
            if (moneyMarketAccountId) {
                try {
                    await Promise.all([
                        store.statementTransaction.removeAll(),
                        api.statementTransaction.getAll(moneyMarketAccountId),
                    ]);
                } catch (error) { }
            } else {
            }
        };

        loadStatement();
    }, [api.statementTransaction, moneyMarketAccountId, store.statementTransaction]);

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
                            type="date"
                            id="endDate"
                            value={endDate.toISOString().substr(0, 10)}
                            onChange={(e) => setEndDate(new Date(e.target.value))}
                        />
                    </div>
                </div>
                <div className="uk-width-expand uk-align-items-right">
                </div>
            </div>

            {loading ? <LoadingEllipsis /> :
                <div className="uk-width-expand">
                    {!loading &&
                        <table className="kit-table-bordered">
                            <thead>
                                <tr>
                                    <th>Adjustment</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Previous Balance</th>
                                    <th>Balance</th>
                                    <th>Rate</th>
                                    <th>Days</th>
                                    <th>Interest</th>
                                    <th>Remark</th>
                                    <th>Other Options</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <th colSpan={4} className="uk-text-center">Opening Balance</th>
                                    <th className="uk-text-right">
                                        {filteredStatementTransactions &&
                                            (
                                                filteredStatementTransactions[0]?.balance || 0
                                            )}
                                    </th>
                                    <th colSpan={5}></th>
                                </tr>
                                {filteredStatementTransactions &&
                                    filteredStatementTransactions.map((transaction, index) => (
                                        <Fragment key={transaction.id}>
                                            <tr className={transaction.blinded ? 'uk-text-danger' : ''} key={transaction.id}>
                                                <td>
                                                    {!transaction.blinded && !selectedRows.includes(index) &&
                                                        // <button className="btn btn-danger btn-small" onClick={() => toggleRowSelection(index)}>Correction</button>
                                                        // <IconButton onClick={() => toggleRowSelection(index)}>
                                                        //     <MinusCircleIcon style={{ color: "red" }} />
                                                        // </IconButton>
                                                        <span
                                                            className="uk-text-danger"
                                                            data-uk-tooltip="Delete item"
                                                            onClick={() => toggleRowSelection(index)}
                                                            data-uk-icon="icon:  minus-circle;"
                                                        ></span>
                                                    }
                                                    {
                                                        transaction.blinded &&
                                                        <p className="">
                                                            Blinded! This transaction will not appear on the statement the client receives
                                                        </p>
                                                    }
                                                </td>
                                                <td>{dateFormat_YY_MM_DD(transaction.date)}</td>
                                                <td className="uk-text-right">
                                                    {transaction.amount
                                                        ? transaction.transaction === "withdrawal"
                                                            ? `-${numberCurrencyFormat(transaction.amount)}`
                                                            : numberCurrencyFormat(transaction.amount)
                                                        : "-"}
                                                </td>

                                                <td className="uk-text-right">{numberCurrencyFormat((filteredStatementTransactions[index - 1]?.balance || 0))}</td>
                                                <td className="uk-text-right">{numberCurrencyFormat(transaction.balance)}</td>
                                                <td>{(transaction.rate)}</td>
                                                <td>
                                                    {!transaction.blinded && (
                                                        (transaction.days) || "-"
                                                    )
                                                    }
                                                </td>
                                                <td>
                                                    {!transaction.blinded && (
                                                        (transaction.distribution || 0) || "-"
                                                    )
                                                    }
                                                </td>
                                                <td>{transaction.remark}</td>
                                                <td>
                                                    <IconButton onClick={() => updateRemark(transaction)}>
                                                        <BorderColor style={{ color: "#fff" }} />
                                                    </IconButton>
                                                </td>
                                            </tr>
                                            {selectedRows.includes(index) && (
                                                <>
                                                    <tr className="uk-text-danger">
                                                        <td>
                                                            <label htmlFor="">Transaction will be blinded</label>
                                                        </td>
                                                        <td>{dateFormat_YY_MM_DD(transaction.date)}</td>
                                                        <td className="uk-text-right">
                                                            {transaction.amount
                                                                ? transaction.transaction === "withdrawal" || transaction.transaction === "switchFrom"
                                                                    ? `+${numberCurrencyFormat(transaction.amount)}`
                                                                    : `${numberCurrencyFormat(-transaction.amount)}`
                                                                : "-"}
                                                            <br />
                                                        </td>
                                                        <td className="uk-text-right">{numberCurrencyFormat(transaction.previousBalance || 0)}</td>
                                                        <td className="uk-text-right">{numberCurrencyFormat((transaction.balance))}</td>
                                                        <td>{(transaction.rate)}</td>
                                                        <td>
                                                            {
                                                                (transaction.days) || "-"

                                                            }
                                                        </td>
                                                        <td>
                                                            {
                                                                (transaction.distribution || 0) || "-"

                                                            }
                                                        </td>
                                                        <td colSpan={2}>
                                                            <form className="uk-form uk-form-horizontal uk-grid uk-grid-small" data-uk-grid>
                                                                <input placeholder="Enter remark here" className="uk-margin-small" type="text" onChange={(e) => setNewRemark(e.target.value)} />

                                                                <IconButton data-uk-tooltip="View" onClick={() => handleDeletion(transaction.id)}>
                                                                    <CheckCircleOutline style={{ color: "#1e87f0" }} />
                                                                </IconButton>

                                                                <IconButton data-uk-tooltip="View" onClick={() => setSelectedRows([])}>
                                                                    <CancelOutlined style={{ color: "red" }} />
                                                                </IconButton>
                                                                {/* <button type="button" onClick={() => handleDeletion(transaction.id)} className="btn btn-table btn-primary">Blind</button>
                                                                <button type="button" onClick={() => setSelectedRows([])} className="btn btn-table btn-danger">Cancel</button> */}
                                                            </form>
                                                        </td>
                                                    </tr>
                                                    <tr className="uk-text-danger">
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr> </>
                                            )}
                                        </Fragment>
                                    ))}
                                <tr>
                                    <th colSpan={4}>Closing Balance</th>
                                    <th className="uk-text-right">
                                        {filteredStatementTransactions &&
                                            (
                                                filteredStatementTransactions[
                                                    filteredStatementTransactions.length - 1
                                                ]?.balance || 0
                                            )}
                                    </th>
                                    <th>Totals</th>
                                    <th className="uk-text-left">{totalDays}</th>
                                    <th className="uk-text-right">{numberCurrencyFormat(totalDistribution)}</th>
                                    <th colSpan={2}></th>
                                </tr>
                            </tbody>
                        </table>
                    }
                    {
                        loading && <LoadingEllipsis />
                    }
                </div>
            }
            <Modal modalId={MODAL_NAMES.BACK_OFFICE.EDIT_NORMAL_STATEMENT_MODAL}>
                <UpdateRemarkModal mmaId={moneyMarketAccountId} />
            </Modal>
        </div>
    )
}

export default CorrectedClientStatement
