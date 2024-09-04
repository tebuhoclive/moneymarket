import { useState, useEffect } from 'react';
import { ExportAsExcel } from 'react-export-table';
import Toolbar from '../../../../../shared/functions/transactions/month-end-report-grid/month-end-run/MonthEndToolBar';
import { IDepositTransaction } from '../../../../../shared/models/deposit-transaction/DepositTransactionModel';
import { dateFormat_DD_MM_YY, dateFormat_YY_MM_DD, dateFormat_YY_MM_DD_NEW } from '../../../../../shared/utils/utils';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getBase64ImageFromURL, getUser } from '../../../../../shared/functions/MyFunctions';
import { faFileExcel, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { useAppContext } from '../../../../../shared/functions/Context';
import generateArchivedTransactionsPDF from './ArchivedTransactionsPdf';
import { ISwitchTransaction } from '../../../../../shared/models/SwitchTransactionModel';

interface IProps {
    data: ISwitchTransaction[];
}

const ViewSwitchArchivedTransactions = ({ data }: IProps) => {
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [filteredTransactions, setFilteredTransactions] = useState<ISwitchTransaction[]>([]);
    const { store } = useAppContext();

    useEffect(() => {
        filterTransactionsByDateRange();
    }, [startDate, endDate]);

    const filterTransactionsByDateRange = () => {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const transactionsInRange = data.filter(transaction => {
            const transactionDate = new Date(transaction.valueDate);
            return transactionDate >= start && transactionDate <= end;
        });

        setFilteredTransactions(transactionsInRange);
    };

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
        setter(event.target.value);
    };

    const generatePDFNew = async () => {
        const logo = await getBase64ImageFromURL(`${process.env.PUBLIC_URL}/ijg-header.jpg`);
        await generateArchivedTransactionsPDF({ data: formattedData });
    };

    const formattedData = filteredTransactions.map((d) => {
        const $transactionDate = d.valueDate;
        const $bankReference = d.reference;
        const $clientAccount = d.fromAccount;
        const $clientName = d.fromAccount;
        const $amount = d.amount;
        const $archivedBy = d.switchedBy;

        return {
            transactionDate: dateFormat_YY_MM_DD_NEW($transactionDate),
            bankReference: $bankReference,
            clientAccount: $clientAccount,
            clientName: $clientName,
            amount: $amount,
            archivedBy: getUser($archivedBy ?? "", store)
        };
    });

    const renderExcel = ({ onClick }: { onClick: () => void }) => (
        <button className="btn btn-primary" onClick={onClick}>
            <FontAwesomeIcon icon={faFileExcel} size="lg" className="icon uk-margin-small-right" />
            Export Excel
        </button>
    );

    return (
        <div className="custom-modal-style uk-modal-dialog uk-width-4-5">
            <button className="uk-modal-close-default" type="button" data-uk-close></button>
            <div className="form-title">
                <h3 style={{ marginRight: "1rem" }}>REPORT</h3>
                <img src={`${process.env.PUBLIC_URL}/arrow.png`} alt='' />
                <h3 className="text-to-break" style={{ marginLeft: "2rem" }}>ARCHIVED TRANSACTIONS</h3>
            </div>
            <hr />
            <div className="dialog-content uk-position-relative">
                <Toolbar
                    leftControls={<h4 className="main-title-md">Transactions from {dateFormat_DD_MM_YY(startDate)} to {dateFormat_DD_MM_YY(endDate)}</h4>}
                    rightControls={
                        <div className="uk-flex uk-flex-middle uk-flex-between uk-width-1-1">
                            <button className="btn btn-primary" onClick={generatePDFNew}>
                                <FontAwesomeIcon icon={faFilePdf} /> Export PDF
                            </button>
                            <ExportAsExcel
                                fileName={`Archived Transactions ${dateFormat_YY_MM_DD(new Date().getTime())}`}
                                name="Summary"
                                data={formattedData}
                                headers={[
                                    "Transaction Date", "Bank reference", "Client Account", "Client Name", "Amount", "Archived By"
                                ]}
                            >
                                {renderExcel}
                            </ExportAsExcel>
                            <form className="uk-flex uk-flex-column uk-flex-center">
                                <div className="uk-form-controls">
                                    <label className="uk-form-label uk-text-white uk" htmlFor="start-date">Start Date</label>
                                    <input
                                        id="start-date"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => handleDateChange(e, setStartDate)}
                                        className="uk-input uk-form-small uk-width-1-3"
                                    />
                                    <label className="uk-form-label uk-text-white" htmlFor="end-date">End Date</label>
                                    <input
                                        id="end-date"
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => handleDateChange(e, setEndDate)}
                                        className="uk-input uk-form-small uk-width-1-3"
                                    />
                                </div>
                            </form>
                        </div>
                    }
                />
                <table className="kit-table-bordered uk-margin-small-top">
                    <thead>
                        <tr>
                            <th>Transaction Date</th>
                            <th>Bank Reference</th>
                            <th>Client Account</th>
                            <th>Client Name</th>
                            <th>Amount</th>
                            <th>Archived By</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.map(d => (
                            <tr key={d.id}>
                                <td>{dateFormat_YY_MM_DD(d.valueDate)}</td>
                                <td>{d.reference}</td>
                                <td>{d.fromAccount || "un-allocated"}</td>
                                <td>{d.fromAccount}</td>
                                <td>{d.amount}</td>
                                <td>{getUser(d.switchedBy ?? "", store)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ViewSwitchArchivedTransactions;
