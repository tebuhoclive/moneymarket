import { observer } from "mobx-react-lite"
import { useAppContext } from "../../../../../shared/functions/Context";
import { useEffect, useMemo, useState } from "react";
import { IMonthEndRun, IProcessedAccount, defaultMonthEndRun } from "../../../../../shared/models/MonthEndRunModel";
import { LoadingEllipsis } from "../../../../../shared/components/loading/Loading";
import { MonthEndReportGrid } from "../../../../../shared/functions/transactions/month-end-report-grid/month-end-run/MonthEndReportGrid";
import Toolbar from "../../../shared/components/toolbar/Toolbar";
import { ACTIVE_ENV } from "../../../CloudEnv";

export interface MonthEndReportInterface {
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
    setIsVisible: (show: boolean) => void;
}

export const MonthEndReportModal = observer(({ setIsVisible }: IProps) => {
    const { api, store } = useAppContext();
    const month = new Date(Date.now()).getMonth();
    const year = new Date(Date.now()).getFullYear();
    const [selectedMonthEndRun, setSelectedMonthEndRun] = useState<IMonthEndRun>({ ...defaultMonthEndRun })
    const [isPreparingData, setIsPreparingData] = useState(false);
    const [processedData, setProcessedData] = useState<MonthEndReportInterface[]>([]);



    const monthEndData = store.monthEndRun.all;

    const processAccounts = monthEndData.find((m) => m.asJson.id === selectedMonthEndRun.id)?.asJson.processedAccounts;




    useEffect(() => {
        const loadData = async () => {
            await api.monthEndRun.getAll(`${year}`);
        }
        loadData();
    }, [])


    const prepareData = async () => {
        if (!processAccounts || processAccounts.length === 0) {
            return; // No data to process
        }
        setIsPreparingData(true); // Start loader

        const url = `${ACTIVE_ENV.url}generateMonthEndReport`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    processedAccounts: processAccounts
                })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch report data');
            }

            const data = await response.json();
            setProcessedData(data);
            setIsPreparingData(false); // Stop loader in case of error
        } catch (error) {
            console.error("Error occurred while preparing data:", error);
            setIsPreparingData(false); // Stop loader in case of error
        }
    };


    useEffect(() => {
        if (store.monthEndRun.selected) {
            setSelectedMonthEndRun(store.monthEndRun.selected);
        } else {
            //not selected
        }
    }, [store.monthEndRun.selected])

    const onCancel = () => {
        setIsVisible(false);
    }

    return (
        <div className="month-end-modal view-modal custom-modal-style uk-modal-dialog uk-modal-body uk-width-1-2" style={{ width: "100%" }}>
            <button
                className="uk-modal-close-default"
                onClick={onCancel}
                type="button"
                data-uk-close
            ></button>
            <h3 className="main-title-sm text-to-break">
                Month End Run Report
            </h3>
            <div className="uk-margin">
                <Toolbar
                    rightControls={
                        <button className="btn btn-primary uk-margin" onClick={prepareData} >  {processedData.length > 0 ? <>Refresh Report</> : <>Generate Report</>}</button>
                    }
                />
            </div>

            {isPreparingData ? <LoadingEllipsis /> :
                <div>
                    <MonthEndReportGrid data={processedData} year={`${year}`} month={`${month}`} />
                </div>
            }
        </div>
    )
})