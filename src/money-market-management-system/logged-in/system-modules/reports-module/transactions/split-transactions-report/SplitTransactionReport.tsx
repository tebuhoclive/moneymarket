// import { observer } from "mobx-react-lite"
// import { useAppContext } from "../../../../../../shared/functions/Context"
// import Toolbar from "../../../../shared/components/toolbar/Toolbar";
// import { useEffect, useState } from "react";
// import { dateFormat_YY_MM_DD } from "../../../../../../shared/utils/utils";
// import AltRouteIcon from '@mui/icons-material/AltRoute';
// import Modal from "../../../../../../shared/components/Modal";
// import MODAL_NAMES from "../../../../dialogs/ModalName";
// import { ViewParentTransactionModal } from "../../../../dialogs/transactions/client-deposit-allocation/view-parent-transaction-view/ViewParentTransactionModal";
// import { onViewTransaction } from "../../../../../../shared/functions/transactions/BankUploadFunctions";
// import { NoData } from "../../../../../../shared/components/nodata/NoData";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faFileExcel } from "@fortawesome/free-solid-svg-icons";
// import { ExportAsExcel } from "react-export-table";

// export const SplitTransaction = observer(() => {

//     const { store, api } = useAppContext();

//     const [loading, setLoading] = useState(false);

//     const todaysDate = Date.now();
//     const [reportDate, setReportDate] = useState(todaysDate);
//     const splitTransactions = store.depositTransaction.all
//         .filter((t) => t.asJson.parentTransaction === "Parent")
//         .map((t) => { return t.asJson })



//     const handleFilterDateChange = (date: number) => {
//         setReportDate(date);
//     }

//     const handleFilterDateReset = () => {
//         setReportDate(Date.now());
//     }


//     const filteredTransaction = splitTransactions
//         .filter(transaction => dateFormat_YY_MM_DD(transaction.createdAt || 0) === (reportDate ? dateFormat_YY_MM_DD(reportDate) : dateFormat_YY_MM_DD(todaysDate)))


//     const renderExcel = ({ onClick }: { onClick: () => void }) => {
//         return (
//             <button className="btn btn-primary" onClick={onClick}>
//                 <FontAwesomeIcon
//                     icon={faFileExcel}
//                     size="lg"
//                     className="icon uk-margin-small-right"
//                 />
//                 Export Excel
//             </button>
//         )
//     }


//     const formattedData = filteredTransaction
//         .map((d) => {
//             const $createdDate = d.createdAtTime;
//             const $reference = d.reference;
//             const $bank = d.bank;
//             const $valueDate = d.valueDate;
//             const $amount = d.amount;
//             return (
//                 {
//                     createdAt: dateFormat_YY_MM_DD($createdDate || 0),
//                     reference: $reference,
//                     bank: $bank,
//                     valueDate: dateFormat_YY_MM_DD($valueDate),
//                     amount: $amount
//                 }
//             )
//         });


//     useEffect(() => {
//         const loadData = async () => {
//             try {
//                 setLoading(true);
//                 await api.depositTransaction.getAll();
//                 setLoading(false);
//             } catch (error) {
//             }

//         }
//         loadData();
//     }, [])



//     return (
//         <div className="page uk-section uk-section-small">
//             <div className="uk-container uk-container-expand">
//                 <Toolbar


//                     rightControls={
//                         <div className="uk-form-controls uk-flex">
//                             <label className="uk-form-label uk-text-white" htmlFor="">
//                                 Report Date
//                             </label>
//                             <input
//                                 id="date"
//                                 value={reportDate ? dateFormat_YY_MM_DD(reportDate) : dateFormat_YY_MM_DD(todaysDate)}
//                                 className="uk-input uk-form-small"
//                                 type="date"
//                                 onChange={(e) => handleFilterDateChange(e.target.valueAsNumber)}
//                             />
//                             <button
//                                 type="button"
//                                 onClick={handleFilterDateReset}
//                                 className="btn btn-danger">
//                                 Reset
//                             </button>
//                         </div>
//                     }
//                     leftControls={
//                         <h1 className="main-title-md">
//                             Daily Split Deposits
//                         </h1>
//                     }
//                 />
//                 <hr />
//                 <Toolbar

//                     rightControls={
//                         <>
//                             {filteredTransaction.length > 0 &&
//                                 <ExportAsExcel
//                                     fileName={"Split deposit report"}
//                                     name="Summary"
//                                     data={formattedData}
//                                     headers={
//                                         [
//                                             "Created Date",
//                                             "Reference",
//                                             "Bank",
//                                             "Value Date",
//                                             "Amount",
//                                         ]
//                                     }
//                                 >{renderExcel}
//                                 </ExportAsExcel>
//                             }
//                         </>
//                     }
//                 />
//                 {filteredTransaction.length > 0 &&
//                     <hr />
//                 }
//                 {filteredTransaction.length < 1 ?
//                     <NoData />
//                     :
//                     <CustomOpenAccordion title={`Split Transactions`}>
//                         <div className="uk-margin">
//                             <table className="uk-table uk-table-small kit-table">
//                                 <thead>
//                                     <tr>
//                                         <th>Created Date</th>
//                                         <th>Reference</th>
//                                         <th>Bank</th>
//                                         <th>Value Date</th>
//                                         <th>Amount</th>
//                                         <th>Options</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {filteredTransaction.map((t) => {
//                                         return (
//                                             <tr key={t.id}>
//                                                 <td>{dateFormat_YY_MM_DD(t.createdAt || 0)}</td>
//                                                 <td>{t.reference}</td>
//                                                 <td>{t.bank}</td>
//                                                 <td>{dateFormat_YY_MM_DD(t.valueDate)}</td>
//                                                 <td>{(t.amount)}</td>
//                                                 <td>
//                                                     <button
//                                                         className="btn btn-primary"
//                                                         data-uk-tooltip="View Split Parent transaction"
//                                                         onClick={() => onViewTransaction(t.id, store)}
//                                                     >
//                                                         <AltRouteIcon style={{ color: "#01aced" }} />
//                                                         More details
//                                                     </button>
//                                                 </td>
//                                             </tr>
//                                         )
//                                     })}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </CustomOpenAccordion>
//                 }
//             </div>
//             <Modal
//                 modalId={
//                     MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_PARENT_TRANSACTION_MODAL
//                 }
//             >
//                 <ViewParentTransactionModal />
//             </Modal>

//         </div>
//     )
// })

import React from 'react'

const SplitTransactionReport = () => {
  return (
    <div>
      
    </div>
  )
}

export default SplitTransactionReport
