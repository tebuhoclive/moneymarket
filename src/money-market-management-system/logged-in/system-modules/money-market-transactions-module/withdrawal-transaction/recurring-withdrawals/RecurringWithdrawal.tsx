// import { useEffect, useState } from "react";
// import { observer } from "mobx-react-lite";
// import { INaturalPerson } from "../../../../../../shared/models/clients/NaturalPersonModel";
// import { IRecurringWithdrawalInstruction } from "../../../../../../shared/models/recurring-withdrawal-instruction/RecurringWithdrawalInstructionModel";
// import { useAppContext } from "../../../../../../shared/functions/Context";
// import showModalFromId from "../../../../../../shared/functions/ModalShow";

// import { getAccountType } from "../../../../../../shared/functions/MyFunctions";
// import { LoadingEllipsis } from "../../../../../../shared/components/loading/Loading";
// import ErrorBoundary from "../../../../../../shared/components/error-boundary/ErrorBoundary";

// import RecurringWithdrawalTabs from "./RecurringWithdrawalTabs";
// import { RecurringWithdrawalsGrid } from "./RecurringWithdrawalsGrid";
// import Modal from "../../../../../../shared/components/Modal";

// // import { BatchDetailsModal } from "../batches/modal/BatchDetailsModal";
// // import { CancelTransactionModal } from "../cancelTransaction/CancelTransactionModal";

// import { useParams } from "react-router-dom";

// import MODAL_NAMES from "../../../../dialogs/ModalName";
// import AmendWithdrawalModal from "../../../../dialogs/transactions/withdrawal-transaction/AmendWithdrawalModal";
// import NewRecurringVerifyWithdrawalModal from "../../../../dialogs/transactions/recurring-withdrawal-instruction/NewRecurringVerifiyModal";
// import NewRecurringViewWithdrawalModal from "../../../../dialogs/transactions/recurring-withdrawal-instruction/NewRecurringViewModal";
// import NewRecurringWithdrawalModal from "../../../../dialogs/transactions/recurring-withdrawal-instruction/NewRecurringWithdrawalModal";
// import NewRecurringEditWithdrawalModal from "../../../../dialogs/transactions/recurring-withdrawal-instruction/RecuringWithdrawalEditModal";
// import ViewRecurringWithdrawalModal from "../../../../dialogs/transactions/recurring-withdrawal-instruction/ViewRecurringWithdrawalModal";
// import Toolbar from "../../../../shared/components/toolbar/Toolbar";


// export interface IClientWithdrawalPaymentData {
//   index: number;
//   reference: string;
//   amount: number;
//   amountDisplay: string;
//   transactionDate: string;
//   bank: string;
//   allocation: string;
//   allocatedBy: string;
//   allocationApprovedBy: string;
//   transactionStatus: string;
// }
// interface ITransactionInstructionsProps {
//     client: INaturalPerson |undefined;
//     withdrawal: IRecurringWithdrawalInstruction | undefined;
// }
// const RecurringWithdrawal = observer((props: ITransactionInstructionsProps ) => {
//   const { store, api } = useAppContext();
//   const [selectedTab, setSelectedTab] = useState("pending-tab");
//   const [loading, setLoading] = useState(false);
//   const { client,withdrawal } = props;
//   const recordWithdrawal = () => {
//     showModalFromId(MODAL_NAMES.BACK_OFFICE.RECORD_RECURRING_WITHDRAWAL_MODAL);
//   };
//   const { accountId } = useParams<{ accountId: string }>();
//   const pending = store.recurringWithdrawalInstruction.all.sort((a, b) => {
//     const dateA = new Date(a.asJson.timeCreated || 0);
//     const dateB = new Date(b.asJson.timeCreated || 0);

//     return dateB.getTime() - dateA.getTime();
//   }).filter((u) => u.asJson.transactionStatus === "Pending").map((u) => {
//     return u.asJson;
//   });
//   const account = store.mma.getItemById(accountId || "");

//   const verified = store.recurringWithdrawalInstruction.all.sort((a, b) => {
//     const dateA = new Date(a.asJson.timeVerified || 0);
//     const dateB = new Date(b.asJson.timeVerified || 0);

//     return dateB.getTime() - dateA.getTime();

//   }).filter((u) => u.asJson.transactionStatus === "Verified").map((u) => {
//     return u.asJson;
//   });
//   const reportData = store.recuralWithdrawalBalanceReport.all.map((report)=>{return report.asJson});
//   const approved = store.withdrawalTransaction.all
//     .sort((a, b) => {
//       const dateA = new Date(a.asJson.timeAuthorized || 0);
//       const dateB = new Date(b.asJson.timeAuthorized || 0);

//       return dateB.getTime() - dateA.getTime();
//     })
//     .filter(
//       (u) =>
//         u.asJson.allocationStatus === "Approved" &&
//         (u.asJson.batchStatus === false || !u.asJson.batchStatus)
//     )
//     .map((u) => {
//       return u.asJson;
//     });

//     const accType = getAccountType(account?.asJson.accountType || "", store);
  
//     const totalMonthlyInterest = account?.asJson.monthTotalInterest;
  
//   const processedPayment = store.withdrawalTransaction.all.sort((a, b) => {
//     const dateA = new Date(a.asJson.transactionDate || 0);
//     const dateB = new Date(b.asJson.transactionDate || 0);
//     return dateB.getDate() - dateA.getDate();
//   }).filter((u) => u.asJson.allocationStatus === "Approved" && u.asJson.isPaymentProcessed === true).map((u) => {
//     return u.asJson;
//   });

//   const batches = store.batches.all.sort(
//     (a, b) =>
//       new Date(b.asJson.timeProcessed || 0).getTime() -
//       new Date(a.asJson.timeProcessed || 0).getTime()
//   )
//     .map((b) => {
//       return b.asJson;
//     });


//   if (loading) return <LoadingEllipsis />;

//   return (
//     <ErrorBoundary>
//       <div className="page uk-section uk-section-small">
//         <div className="uk-container uk-container-expand">
//           <div className="sticky-top">
//             <Toolbar
//               title="Client Recurring Withdrawals (Disinvestment)"
//               rightControls={
//                 <div className="uk-margin-bottom">
//                   <button
//                     className="btn btn-primary"
//                     onClick={recordWithdrawal}>
//                     Record Recurring Withdrawal
//                   </button>
//                 </div>
//               }
//             />
//             <hr />
//           </div>
//           <Toolbar
//             rightControls={
//               <div className="uk-margin-bottom">
//                 <RecurringWithdrawalTabs
//                   selectedTab={selectedTab}
//                   setSelectedTab={setSelectedTab}
//                 />
//               </div>
//             }
//           />
//           <ErrorBoundary>
//             <div className="page-main-card uk-card uk-card-default uk-card-body">
//               {selectedTab === "pending-tab" && (
//                 <RecurringWithdrawalsGrid
//                   data={pending}
//                   withdrawal={undefined}
//                 />
//               )}
//               {selectedTab === "verified-tab" && (
//                 <RecurringWithdrawalsGrid
//                   data={verified}
//                   withdrawal={undefined}
//                 />
//               )}
//             </div>
//           </ErrorBoundary>
//         </div>
//       </div>
//       <Modal
//         modalId={MODAL_NAMES.BACK_OFFICE.RECORD_RECURRING_WITHDRAWAL_MODAL}>
//         <NewRecurringWithdrawalModal client={client} />
//       </Modal>
//       <Modal
//         modalId={
//           MODAL_NAMES.BACK_OFFICE.RECORD_RECURRING_EDIT_WITHDRAWAL_MODAL
//         }>
//         <NewRecurringEditWithdrawalModal client={undefined} />
//       </Modal>
//       <Modal modalId={MODAL_NAMES.BACK_OFFICE.RECORD_RECURRING_VIEW_MODAL}>
//         <NewRecurringViewWithdrawalModal
//           client={undefined}
//           withdrawal={undefined}
//         />
//       </Modal>
//       <Modal
//         modalId={MODAL_NAMES.BACK_OFFICE.VERIFY_WITHDRAWAL_RECURRING_MODAL}>
//         <NewRecurringVerifyWithdrawalModal
//           client={client}
//           withdrawal={withdrawal}
//         />
//       </Modal>
//       <Modal modalId={MODAL_NAMES.BACK_OFFICE.WITHDRAWAL_AMEND_MODAL}>
//         <AmendWithdrawalModal />
//       </Modal>
//       {/* <Modal
//         modalId={MODAL_NAMES.BACK_OFFICE.RETURN_WITHDRAWAL_FOR_AMENDMENT_MODAL}>
//         <ReturnWithdrawalForAmendmentModal />
//       </Modal> */}
//       <Modal modalId={MODAL_NAMES.BACK_OFFICE.TRANSACTION_WITHDRAWAL_MODAL}>
//         <ViewRecurringWithdrawalModal />
//       </Modal>
//       {/* <Modal modalId={MODAL_NAMES.ADMIN.VIEW_DETAIL_BATCHES}>
//         <BatchDetailsModal />
//       </Modal>
//       <Modal modalId={MODAL_NAMES.ADMIN.CANCEL_TRANSACTION_MODAL}>
//         <CancelTransactionModal />
//       </Modal> */}
//     </ErrorBoundary>
//   );
// });
// export default RecurringWithdrawal;

import React from 'react'

const RecurringWithdrawal = () => {
  return (
    <div>
      
    </div>
  )
}

export default RecurringWithdrawal

