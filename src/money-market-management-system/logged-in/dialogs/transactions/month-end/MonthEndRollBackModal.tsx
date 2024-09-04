import { observer } from "mobx-react-lite"
import { useAppContext } from "../../../../../shared/functions/Context";
import { useEffect, useMemo, useState } from "react";
import { IMonthEndRun, IProcessedAccount, defaultMonthEndRun } from "../../../../../shared/models/MonthEndRunModel";
import { LoadingEllipsis } from "../../../../../shared/components/loading/Loading";
import { MonthEndRollBackGrid } from "../../../../../shared/functions/transactions/month-end-report-grid/rolled-back/MonthEndReportRollBacks";
import showModalFromId, { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../../ModalName";
import Modal from "../../../../../shared/components/Modal";
import Toolbar from "../../../shared/components/toolbar/Toolbar";


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

interface IProp {
    setIsVisible: (show: boolean) => void;
}

export const MonthEndRollBackModal = observer(({ setIsVisible }: IProp) => {
    const { api, store } = useAppContext();
    const month = new Date(Date.now()).getMonth();
    const year = new Date(Date.now()).getFullYear();
    const [selectedMonthEndRun, setSelectedMonthEndRun] = useState<IMonthEndRun>({ ...defaultMonthEndRun })
    const [isPreparingData, setIsPreparingData] = useState(false);
    const [processedData, setProcessedData] = useState<MonthEndReportInterface[]>([]);



    const monthEndData = store.monthEndRun.all;

    const processAccounts = monthEndData.find((m) => m.asJson.id === selectedMonthEndRun.id)?.asJson.rolledBackAccounts;




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

        try {
            const newData = processAccounts.map(account => ({
                id: account.id,
                accountNumber: account.account,
                accountName: "",
                clientName: "",
                entityNumber: "",
                interest: account.totalInterest,
                days: account.days || 0,
                lastRate: account.lastRate || 0,
                lastBalance: account.lastBalance || 0
            }));

            // To avoid blocking the main thread, update the state asynchronously after a delay
            setTimeout(() => {
                setProcessedData(newData);
                setIsPreparingData(false); // Stop loader
            }, 0);

        } catch (error) {
            console.error("Error occurred while preparing data:", error);
            setIsPreparingData(false); // Stop loader in case of error
        }
    };

    const onCancel = () => {
        setIsVisible(false);
    }


    useEffect(() => {
        if (store.monthEndRun.selected) {
            setSelectedMonthEndRun(store.monthEndRun.selected);
        } else {
            //not selected
        }
    }, [store.monthEndRun.selected])

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
                    <MonthEndRollBackGrid data={processedData} year={`${year}`} month={`${month}`} />
                </div>
            }
        </div>
    )
})

// export interface MonthEndReportInterface {
//     id: string;
//     accountNumber: string;
//     accountName: string;
//     clientName: string;
//     entityNumber: string;
//     interest: number;
//     days: number;
//     lastRate: number;
//     lastBalance: number;
// }

// const currentDate = new Date();
// const currentYear = currentDate.getFullYear();
// const currentMonth = currentDate.getMonth();


// const startOfMonth = new Date(currentYear, currentMonth, 1);
// const endOfMonth = new Date(currentYear, currentMonth + 1, 1);


// export const MonthEndRollBackModal = observer(() => {
//     const { api, store } = useAppContext();
//     const month = new Date(Date.now()).getMonth();
//     const year = new Date(Date.now()).getFullYear();
//     const [selectedMonthEndRun, setSelectedMonthEndRun] = useState<IMonthEndRun>({ ...defaultMonthEndRun })
//     const [isPreparingData, setIsPreparingData] = useState(false);


//     const monthEndData = store.monthEndRun.all;

//     const rolledBackAccounts = monthEndData.find((m) => m.asJson.id === selectedMonthEndRun.id)?.asJson.rolledBackAccounts;

//     const monthEndReports: MonthEndReportInterface[] = [];

//     if (rolledBackAccounts && rolledBackAccounts.length > 0) {
//         // Iterate through each item in processAccounts and map it to MonthEndReportInterface
//         rolledBackAccounts.forEach((account: IProcessedAccount) => {
//             const monthEndReport: MonthEndReportInterface = {
//                 id: account.id,
//                 accountNumber: account.account,
//                 accountName: "",
//                 clientName: "",
//                 entityNumber: "",
//                 interest: account.totalInterest,
//                 days: account.days || 0,
//                 lastRate: (account.lastRate || 0),
//                 lastBalance: (account.lastBalance || 0)
//             };

//             // Push the mapped data into the monthEndReports array
//             monthEndReports.push(monthEndReport);
//         });
//     }

//     const transactionStatements = store.statementTransaction.all.find((t) => t.asJson.id === "");







//     useEffect(() => {
//         const loadData = async () => {
//             setIsPreparingData(true);
//             await api.monthEndRun.getAll(`${year}`);
//             setIsPreparingData(false);
//         }
//         loadData();
//     }, [])


//     useEffect(() => {
//         if (store.monthEndRun.selected) {
//             setSelectedMonthEndRun(store.monthEndRun.selected);
//         } else {
//             //not selected
//         }
//     }, [store.monthEndRun.selected])

//     return (
//         <div className="month-end-modal view-modal custom-modal-style uk-modal-dialog uk-modal-body uk-width-1-2" style={{ width: "100%" }}>
//             <button
//                 className="uk-modal-close-default"
//                 // onClick={onCancel}
//                 type="button"
//                 data-uk-close
//             ></button>
//             <h3 className="main-title-sm text-to-break">
//                 Rolled Back Accounts
//             </h3>

//             {isPreparingData ? <LoadingEllipsis /> :
//                 <div>
//                     <MonthEndRollBackGrid data={monthEndReports} year={`${year}`} month={`${month}`} />
//                 </div>
//             }




//         </div>
//     )
// })