import "../MonthEndGrid.scss"
import { observer } from "mobx-react-lite";
import { IconButton } from "@mui/material";
import { Fragment, useEffect, useMemo, useState } from "react";
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import { useAppContext } from "../../../Context";
import { EntityNumber, accountName, accountNumber, accountType, calculateAverageRate, calculateTotalBalance, calculateTotalInterest, clientName, executeRollBack, totalAccounts } from "../SimpleFunctions";
import { IProcessedAccount } from "../../../../models/MonthEndRunModel";
import React from "react";
import { groupDataByFund } from "../groupingReportData";
import BrowserUpdatedIcon from '@mui/icons-material/BrowserUpdated';
import showModalFromId, { hideModalFromId } from "../../../ModalShow";
import MODAL_NAMES from "../../../../../money-market-management-system/logged-in/dialogs/ModalName";
import Modal from "../../../../components/Modal";
import { UpdateStatementProcessed } from "../rolled-back/UpdateStatementProssed";
import MonthEndSummaryTable from "./Summary";
import { ExportAsExcel } from "react-export-table";
import { faFileExcel } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Toolbar from "../month-end-run/MonthEndToolBar";
import NumberFormat from "react-number-format";
import { numberCurrencyFormat, roundOff } from "../../../Directives";


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



export const MonthEndReportGridComponent = observer(({ data, year, month }: IProps) => {
    const { api, store } = useAppContext();
    const [rollingBack, setRollingBack] = useState(false);
    const [selectedId, setSelectedId] = useState("");
    const [startDate, setStartDate] = useState<Date>(startOfMonth);
    const [endDate, setEndDate] = useState<Date>(endOfMonth);


    const onUpdateInterest = (id: string) => {
        setSelectedId(id);
        hideModalFromId(MODAL_NAMES.BACK_OFFICE.MONTH_END_BACK_MODAL);
        showModalFromId(MODAL_NAMES.BACK_OFFICE.UPDATE_INTEREST_MODAL_PROCESSED);
    }


    const onCancel = () => {
        hideModalFromId(MODAL_NAMES.BACK_OFFICE.UPDATE_INTEREST_MODAL_PROCESSED);
        showModalFromId(MODAL_NAMES.BACK_OFFICE.MONTH_END_REPORT_MODAL);
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
            {rollingBack ? <>Rolling Back...</> :
                <div className="modal-split-view-visible-scrollbar" style={{ width: "100%", height: "400px" }}>
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
                                                    headers={["Account Number", "ClientName", "Last Rate", "Accrued Interest", "Days", "Last Balance", "Fund"]}
                                                >{renderExcel}
                                                </ExportAsExcel>
                                            </>
                                        }
                                    />
                                </div>
                                <div  >
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
                                                .sort((a, b) => {
                                                    return accountType(b.accountNumber, store).localeCompare(accountType(a.accountNumber, store));
                                                })
                                                .map((d, index: number) => (
                                                    <tr key={index}>
                                                        <td >{accountNumber(d.accountNumber, store)}</td>
                                                        <td>{accountName(d.accountNumber, store)}</td>
                                                        <td>{clientName(d.accountNumber, store)}</td>
                                                        <td>{roundOff((d.lastRate))} %</td>
                                                        <td>{numberCurrencyFormat(roundOff((d.interest)))}</td>
                                                        <td>{d.days}</td>
                                                        <td>{numberCurrencyFormat(roundOff(d.lastBalance))}</td>
                                                        <td>{accountType(d.accountNumber, store)}</td>
                                                        <td>
                                                            <div>
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
                                                <td>{(totalRate)} %</td>
                                                <td>{numberCurrencyFormat(totalInterest)}</td>
                                                <td>{(totalDays)}</td>
                                                <td>{numberCurrencyFormat(totalBalance)}</td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </li>
                    </ul>

                    <div>
                        <Modal modalId={MODAL_NAMES.BACK_OFFICE.UPDATE_INTEREST_MODAL_PROCESSED}>
                            <div className="view-modal custom-modal-style uk-modal-dialog uk-modal-body uk-width-1-1">
                                <button
                                    className="uk-modal-close-default"
                                    onClick={onCancel}
                                    // disabled={loading}
                                    type="button"
                                    data-uk-close></button>
                                <h3 className="main-title-sm text-to-break">
                                    Update Statement (Processed)
                                </h3>
                                <UpdateStatementProcessed moneyMarketAccountId={selectedId} startDate={startDate} endDate={endDate} />
                            </div>
                        </Modal>

                    </div >
                </div>
            }


        </div>
    )
});
