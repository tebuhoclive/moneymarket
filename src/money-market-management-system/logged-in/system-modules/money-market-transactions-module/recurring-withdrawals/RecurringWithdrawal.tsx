// import { useEffect, useState } from "react";
// import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";
// import showModalFromId from "../../../../../shared/functions/ModalShow";

// import { useAppContext } from "../../../../../shared/functions/Context";
// import { LoadingEllipsis } from "../../../../../shared/components/loading/Loading";

// import { BatchDetailsModal } from "../withdrawal-transaction/batches/modal/BatchDetailsModal";
// import { CancelTransactionModal } from "../withdrawal-transaction/cancelTransaction/CancelTransactionModal";
// import { RecurringWithdrawalsGrid } from "./RecurringWithdrawalsGrid";
// import RecurringWithdrawalTabs from "./RecurringWithdrawalTabs";

// import {
//   getAccountType,
// } from "../../../../../shared/functions/MyFunctions";
// import { useParams } from "react-router-dom";
// import Modal from "../../../../../shared/components/Modal";
// import { INaturalPerson } from "../../../../../shared/models/clients/NaturalPersonModel";
// import { IRecurringWithdrawalInstruction } from "../../../../../shared/models/recurring-withdrawal-instruction/RecurringWithdrawalInstructionModel";
// import MODAL_NAMES from "../../../dialogs/ModalName";
// import ReturnRecurringWithdrawalForAmendmentModal from "../../../dialogs/transactions/withdrawal-transaction/ReturnRecurringWithdrawalModalForAmendModal";
// import ReturnWithdrawalForAmendmentModal from "../../../dialogs/transactions/withdrawal-transaction/ReturnWithdrawalForAmendmentModal";
// import ViewWithdrawalModal from "../../../dialogs/transactions/withdrawal-transaction/ViewWithdrawalModal";
// import NewRecurringWithdrawalModal from "../../../dialogs/transactions/recurring-withdrawal-instruction/NewRecurringWithdrawalModal";
// import ViewRecurringWithdrawalModal from "../../../dialogs/transactions/recurring-withdrawal-instruction/ViewRecurringWithdrawalModal";
// import Toolbar from "../../../shared/components/toolbar/Toolbar";
// import WithdrawalModal from "../../../dialogs/transactions/withdrawal-transaction/capture-amend-return/RecordWithdrawalModal";
// import EditRecurringWithdrawalModal from "../../../dialogs/transactions/withdrawal-transaction/EditRecurringWithdrawal";


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
//   client: INaturalPerson | undefined;
//   withdrawal: IRecurringWithdrawalInstruction | undefined;
// }
// const RecurringWithdrawal = (props: ITransactionInstructionsProps) => {
//   const { store, api } = useAppContext();
//   const [selectedTab, setSelectedTab] = useState("pending-tab");
//   const [loading, setLoading] = useState(false);
//   const { client, withdrawal } = props;
//   const recordWithdrawal = () => {
//     showModalFromId(MODAL_NAMES.BACK_OFFICE.RECORD_RECURRING_WITHDRAWAL_MODAL);
//   };
//   const { accountId } = useParams<{ accountId: string }>();
//   const pending = store.recurringWithdrawalInstruction.all
//     .sort((a, b) => {
//       const dateA = new Date(a.asJson.timeCreated || 0);
//       const dateB = new Date(b.asJson.timeCreated || 0);

//       return dateB.getTime() - dateA.getTime();
//     })
//     .filter((u) => u.asJson.transactionStatus === "Pending")
//     .map((u) => {
//       return u.asJson;
//     });
//   const account = store.mma.getItemById(accountId || "");
//   //   const awaitingVerification = store.recurringWithdrawalInstruction.all.sort((a, b) => {
//   //     const dateA = new Date(a.asJson.timeVerified || 0);
//   //     const dateB = new Date(b.asJson.timeVerified || 0);

//   //     return dateB.getTime() - dateA.getTime();

//   //   }).filter((u) => u.asJson.allocationStatus === "Awaiting Verification").map((u) => {
//   //     return u.asJson;
//   //   });
//   const verified = store.recurringWithdrawalInstruction.all
//     .sort((a, b) => {
//       const dateA = new Date(a.asJson.timeVerified || 0);
//       const dateB = new Date(b.asJson.timeVerified || 0);

//       return dateB.getTime() - dateA.getTime();
//     })
//     .filter((u) => u.asJson.transactionStatus === "Verified")
//     .map((u) => {
//       return u.asJson;
//     });
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
//   // const clientAccounts = store.mma.all
//   // .filter(
//   //   (mma) =>
//   //     mma.asJson.parentEntity === entity && mma.asJson.status === "Active"
//   // )
//   // .map((mma) => {
//   //   return mma.asJson;
//   // });
//   const accType = getAccountType(account?.asJson.accountType || "", store);

//   const totalMonthlyInterest = account?.asJson.monthTotalInterest;

//   const processedPayment = store.withdrawalTransaction.all
//     .sort((a, b) => {
//       const dateA = new Date(a.asJson.transactionDate || 0);
//       const dateB = new Date(b.asJson.transactionDate || 0);
//       return dateB.getDate() - dateA.getDate();
//     })
//     .filter(
//       (u) =>
//         u.asJson.allocationStatus === "Approved" &&
//         u.asJson.isPaymentProcessed === true
//     )
//     .map((u) => {
//       return u.asJson;
//     });

//   const batches = store.batches.all
//     .sort(
//       (a, b) =>
//         new Date(b.asJson.timeProcessed || 0).getTime() -
//         new Date(a.asJson.timeProcessed || 0).getTime()
//     )
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
//       <Modal modalId={MODAL_NAMES.BACK_OFFICE.TRANSACTION_WITHDRAWAL_MODAL}>
//         <ViewRecurringWithdrawalModal />
//       </Modal>
//       {/* <Modal modalId={MODAL_NAMES.BACK_OFFICE.RECORD_WITHDRAWAL_MODAL}>
//         <WithdrawalModal setVisible={}/>
//       </Modal> */}
//       <Modal modalId={MODAL_NAMES.BACK_OFFICE.WITHDRAWAL_AMEND_MODAL}>
//         <ReturnRecurringWithdrawalForAmendmentModal />
//       </Modal>
//       {/* <Modal
//         modalId={MODAL_NAMES.BACK_OFFICE.RETURN_WITHDRAWAL_FOR_AMENDMENT_MODAL}>
//         <ReturnWithdrawalForAmendmentModal />
//       </Modal> */}
//       {/* <Modal modalId={MODAL_NAMES.BACK_OFFICE.TRANSACTION_WITHDRAWAL_MODAL}>
//         <ViewWithdrawalModal />
//       </Modal> */}
//       <Modal modalId={MODAL_NAMES.BACK_OFFICE.EDIT_WITHDRAWAL_RECURRING_MODAL}>
//         <EditRecurringWithdrawalModal />
//       </Modal>
      
//       {/* <Modal modalId={MODAL_NAMES.ADMIN.VIEW_DETAIL_BATCHES}>
//         <BatchDetailsModal />
//       </Modal>
//       <Modal modalId={MODAL_NAMES.ADMIN.CANCEL_TRANSACTION_MODAL}>
//         <CancelTransactionModal />
//       </Modal> */}
//     </ErrorBoundary>
//   );
// };
// export default RecurringWithdrawal;
 import React from 'react'
 
 const RecurringWithdrawal = () => {
   return (
     <div>
       
     </div>
   )
 }
 
 export default RecurringWithdrawal
 