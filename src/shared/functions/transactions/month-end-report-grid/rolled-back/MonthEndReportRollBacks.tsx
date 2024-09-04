import "../MonthEndGrid.scss"

import { observer } from "mobx-react-lite";
import { IconButton } from "@mui/material";
import { Fragment, useMemo, useState } from "react";
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import { useAppContext } from "../../../Context";
import { EntityNumber, accountName, accountNumber, accountType, calculateAverageRate, calculateTotalBalance, calculateTotalInterest, clientName, executeReInitiate, totalAccounts } from "../SimpleFunctions";

import { IProcessedAccount } from "../../../../models/MonthEndRunModel";

import { groupDataByFund } from "../groupingReportData";
import MODAL_NAMES from "../../../../../money-market-management-system/logged-in/dialogs/ModalName";
import Modal from "../../../../../shared/components/Modal";
import showModalFromId, { hideModalFromId } from "../../../ModalShow";
import { UpdateStatement } from "./UpdateStatementRoll";
import BrowserUpdatedIcon from '@mui/icons-material/BrowserUpdated';
import MonthEndSummaryTable from "../month-end-run/Summary";
import { ExportAsExcel } from "react-export-table";
import { faFileExcel } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Toolbar from "../month-end-run/MonthEndToolBar";


interface MonthEndReportInterface {
    id: string;
    accountNumber: string;
    accountName: string;
    clientName: string;
    entityNumber: string;
    interest: number;
    days: number;
    lastRate: number;

    lastBalance: number;
}

interface IProps {
    data: MonthEndReportInterface[];
    year: string;
    month: string;
}

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();


const startOfMonth = new Date(currentYear, currentMonth, 1);
const endOfMonth = new Date(currentYear, currentMonth + 1, 1);



export const MonthEndRollBackGrid = observer(({ data, year, month }: IProps) => {
    const { api, store } = useAppContext();
    const [reinitiate, setReInitiate] = useState(false);
    const [selectedId, setSelectedId] = useState("");

    const [startDate, setStartDate] = useState<Date>(startOfMonth);
    const [endDate, setEndDate] = useState<Date>(endOfMonth);


    const onUpdateInterest = (id: string) => {
        setSelectedId(id);
        hideModalFromId(MODAL_NAMES.BACK_OFFICE.MONTH_END_ROLLED_BACK_MODAL);
        showModalFromId(MODAL_NAMES.BACK_OFFICE.UPDATE_INTEREST_MODAL);
    }


    const onCancel = () => {
        hideModalFromId(MODAL_NAMES.BACK_OFFICE.UPDATE_INTEREST_MODAL);
        showModalFromId(MODAL_NAMES.BACK_OFFICE.MONTH_END_ROLLED_BACK_MODAL);
    }

    const totalRate = data.reduce((acc, item) => acc + item.lastRate, 0);
    const totalInterest = data.reduce((acc, item) => acc + item.interest, 0);
    const totalDays = data.reduce((acc, item) => acc + item.days, 0);
    const totalBalance = data.reduce((acc, item) => acc + item.lastBalance, 0);

    const renderExcel = ({ onClick }: { onClick: () => void }) => {
        return (
            <button className="btn btn-primary" onClick={onClick}>
                <FontAwesomeIcon
                    icon={faFileExcel}
                    size="lg"
                    className="icon uk-margin-small-right"
                />
                Export Excel
            </button>
        )
    }



    const formattedData = data

        .map((d) => {

            const $accountNumber = accountNumber(d.accountNumber, store);
            const $clientName = clientName(d.accountNumber, store);
            const $accountName = accountName(d.accountNumber, store);
            const $lastRate = (d.lastRate);
            const $accruedInterest = (d.interest);
            const $days = d.days;
            const $balance = (d.lastBalance);
            const $fund = accountType(d.accountNumber, store);



            return (
                {
                    accountNumber: $accountNumber,
                    accountName: $accountName,
                    clientName: $clientName,
                    lastRate: $lastRate,
                    interest: $accruedInterest,
                    days: $days,
                    balance: $balance,
                    fund: $fund
                }
            )
        })


    return (
        <div className="grid">
            {reinitiate ? <>Re Initiating...</> :
                <div>
                    <div>
                        <ul data-uk-accordion uk-accordion="multiple: false">
                            <li>
                                <a className="uk-accordion-title" style={{ background: "#01aced", padding: "7px", borderRadius: "10px" }} >Report Summary</a>
                                <div className="uk-accordion-content">
                                    <MonthEndSummaryTable data={data} />
                                </div>
                            </li>
                        </ul>
                    </div>
                    <ul data-uk-accordion uk-accordion="multiple: false">
                        <li>
                            <a className="uk-accordion-title" style={{ background: "#01aced", padding: "7px", borderRadius: "10px" }} >Accounts Processed</a>
                            <div className="uk-accordion-content">

                                <div className="uk-margin">
                                    <Toolbar
                                        rightControls={
                                            <>
                                                <ExportAsExcel
                                                    fileName="Month End Report"
                                                    name="Report"
                                                    data={formattedData}
                                                    headers={["Account Number", "Account Number", "ClientName", "Last Rate", "Accrued Interest", "Days", "Last Balance", "Fund"]}
                                                >{renderExcel}
                                                </ExportAsExcel>
                                            </>
                                        }
                                    />
                                </div>
                                <table className="uk-table uk-table-small uk-table-divider">
                                    <thead>
                                        <tr>
                                            <th>Account Number</th>
                                            <th>Account Name</th>
                                            <th>Client Name</th>
                                            <th>Last Rate</th>
                                            <th>Accrued Interest</th>
                                            <th>Days</th>
                                            <th>Last Balance</th>
                                            <th>Fund</th>
                                            <th>Options</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data
                                            .sort((a, b) =>
                                                a.accountNumber.localeCompare(b.accountNumber))
                                            .map((d, index: number) => (
                                                <tr key={index}>
                                                    <td >{accountNumber(d.accountNumber, store)}</td>
                                                    <td>{accountName(d.accountNumber, store)}</td>
                                                    <td>{clientName(d.accountNumber, store)}</td>
                                                    <td>{(d.lastRate)} %</td>
                                                    <td>{(d.interest)}</td>
                                                    <td>{d.days}</td>
                                                    <td>{(d.lastBalance)}</td>
                                                    <td>{accountType(d.accountNumber, store)}</td>
                                                    <td>
                                                        <div>
                                                            <IconButton
                                                                data-uk-tooltip="Roll back Month End"
                                                                onClick={() => {
                                                                    const processedAccount: IProcessedAccount = {
                                                                        account: d.accountNumber,
                                                                        accountType: accountType(d.accountNumber, store),
                                                                        id: d.accountNumber,
                                                                        totalInterest: d.interest,
                                                                        days: 0,
                                                                        lastRate: d.lastRate,
                                                                        lastBalance: d.lastBalance
                                                                    };
                                                                    executeReInitiate(year, month, processedAccount, setReInitiate, api);
                                                                }}
                                                            >
                                                                <CloudSyncIcon />
                                                            </IconButton>
                                                            <IconButton onClick={() => onUpdateInterest(d.id)}>
                                                                <BrowserUpdatedIcon />
                                                            </IconButton>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td>Totals</td>
                                            <td></td>
                                            <td></td>
                                            <td>{(totalRate)}</td>
                                            <td>{(totalInterest)}</td>
                                            <td>{(totalDays)}</td>
                                            <td>{(totalBalance)}</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </li>
                    </ul>
                </div>
            }

            <Modal modalId={MODAL_NAMES.BACK_OFFICE.UPDATE_INTEREST_MODAL}>
                <div className="view-modal custom-modal-style uk-modal-dialog uk-modal-body uk-width-1-1">
                    <button
                        className="uk-modal-close-default"
                        // onClick={onCancel}
                        // disabled={loading}
                        type="button"
                        data-uk-close></button>
                    <h3 className="main-title-sm text-to-break">
                        Update Statement
                    </h3>
                    <UpdateStatement moneyMarketAccountId={selectedId} startDate={startDate} endDate={endDate} />
                </div>
            </Modal>

        </div >
    )
})
