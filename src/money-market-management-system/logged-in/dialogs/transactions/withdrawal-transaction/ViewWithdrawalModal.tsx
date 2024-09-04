// import { observer } from "mobx-react-lite";
// import { useState, useEffect } from "react";
// import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";
// import { VerifyUploadComponent } from "../../../../../shared/components/instruction-file-upload/edit-upload-component/VerifyComponent";
// import { useAppContext } from "../../../../../shared/functions/Context";
// import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
// import { splitAndTrimString } from "../../../../../shared/functions/StringFunctions";
// import { onAmendWithdrawal, onApproveForBatching, onDeleteTransaction, onFirstLevelApproval, onReturnWithdrawalForAmendment, onSecondLevelApproval } from "../../../../../shared/functions/transactions/WithdrawalTransactionsFunctions";
// import { IWithdrawalTransactionAudit, defaultWithdrawalTransactionAudit } from "../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionAuditModel";
// import { IWithdrawalTransaction, defaultWithdrawalTransaction } from "../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionModel";
// import { dateFormat_YY_MM_DD_NEW } from "../../../../../shared/utils/utils";
// import ClientWithdrawalAuditTrailView from "../../../system-modules/money-market-transactions-module/bank-statement-upload/transaction-status/ClientWithdrawalAuditTrailView";
// import { ClientWithdrawalPaymentAuditTrailGrid } from "../../../system-modules/money-market-transactions-module/withdrawal-transaction/ClientWithdrawalPaymentAuditTrailGrid";
// import MODAL_NAMES from "../../ModalName";
// import AppApi from "../../../../../shared/apis/AppApi";
// import AppStore from "../../../../../shared/stores/AppStore";

// interface IProps {
//   setVisible: (show: boolean) => void;
// }

// const ViewWithdrawalModal = observer(({ setVisible }: IProps) => {
//   const { api, store } = useAppContext();

//   const [loading, setLoading] = useState(false);
//   const [loadingFirstLevelApproval, setLoadingFirstLevelApproval] =
//     useState(false);
//   const [loadingSecondLevelApproval, setLoadingSecondLevelApproval] =
//     useState(false);
//   const [
//     loadingApproveForBatching,
//     setLoadingApproveForBatching,
//   ] = useState(false);

//   const [clientWithdrawal, setClientWithdrawal] = useState<IWithdrawalTransaction>({ ...defaultWithdrawalTransaction });
//   const [displayDetails, setDisplayDetails] = useState(false);
//   const [selectedAudit, setSelectedAudit] = useState<IWithdrawalTransactionAudit>({ ...defaultWithdrawalTransactionAudit });

//   const mmAccounts = store.mma.all;

//   const auditTrail = store.withdrawalTransactionAudit.all;

//   const withdrawalTransactionAudit = auditTrail
//     .sort((a, b) => {
//       const dateA = new Date(a.asJson.auditDateTime || 0);
//       const dateB = new Date(b.asJson.auditDateTime || 0);

//       return dateB.getTime() - dateA.getTime();
//     })
//     .map((c) => {
//       return c.asJson;
//     });

//   const clients = [
//     ...store.client.naturalPerson.all,
//     ...store.client.legalEntity.all,
//   ];

//   const getClientName = (transaction: IWithdrawalTransaction) => {
//     const account = mmAccounts.find(
//       (account) => account.asJson.accountNumber === transaction.allocation
//     );
//     if (account) {
//       const client = clients.find(
//         (client) => client.asJson.entityId === account.asJson.parentEntity
//       );
//       if (client) {
//         const clientName = client.asJson.entityDisplayName;
//         return clientName;
//       }
//     } else {
//       return "";
//     }
//   };

//   const getEntityId = (transaction: IWithdrawalTransaction) => {
//     const account = mmAccounts.find(
//       (account) => account.asJson.accountNumber === transaction.allocation
//     );
//     if (account) {
//       const client = clients.find(
//         (client) => client.asJson.entityId === account.asJson.parentEntity
//       );
//       if (client) {
//         const entityId = client.asJson.entityId;
//         return entityId;
//       }
//     } else {
//       return "";
//     }
//   };

//   const getAccountBalance = (transaction: IWithdrawalTransaction) => {
//     const account = mmAccounts.find(
//       (account) => account.asJson.accountNumber === transaction.allocation
//     );
//     if (account) {
//       return account.asJson.balance - account.asJson.cession
//     } else {
//       return "";
//     }
//   };

//   const onCancel = () => {
//     store.withdrawalTransaction.clearSelected();
//     store.depositTransactionAudit.clearSelected();

//     setDisplayDetails(false);
//     setClientWithdrawal({ ...defaultWithdrawalTransaction });

//     hideModalFromId(MODAL_NAMES.BACK_OFFICE.EDIT_WITHDRAWAL_MODAL);
//     setLoading(false);
//     setVisible(false);
//   };

//   useEffect(() => {
//     if (store.withdrawalTransaction.selected) {
//       setClientWithdrawal(store.withdrawalTransaction.selected);
//     }
//   }, [store.withdrawalTransaction.selected]);

//   useEffect(() => {
//     const loadData = async () => {
//       setLoading(true);
//       if (clientWithdrawal.id) {
//         await api.withdrawalTransactionAudit.getAll(clientWithdrawal.id);
//       }
//       setLoading(false);
//     };
//     loadData();
//   }, [api.withdrawalTransactionAudit, clientWithdrawal.id]);

//   function onVerifyBackDatedWithdrawalTransaction(id: string, api: AppApi, store: AppStore): void {
//     throw new Error("Function not implemented.");
//   }

//   return (
//     <ErrorBoundary>
//       <div className="view-modal custom-modal-style uk-modal-dialog uk-modal-body uk-width-4-5 uk-padding-small">
//         <button
//           className="uk-modal-close-default"
//           onClick={onCancel}
//           disabled={loading}
//           type="button"
//           data-uk-close></button>
//         <h3 className="main-title-md text-to-break">
//           Withdrawal Transaction
//         </h3>
//         <hr />
//         <div className="uk-grid uk-grid-small" data-uk-grid>
//           <div className="dialog-content uk-position-relative uk-width-1-3">
//             <div className="uk-grid" data-uk-grid>
//               <h4 className="main-title-sm">Transaction Details</h4>
//               <div className="uk-grid uk-grid-small" data-uk-grid>
//                 <div className="uk-width-1-3">
//                   <p className="uk-text-bold">Transaction Date:</p>
//                 </div>
//                 <div className="uk-width-2-3">
//                   <p className="uk-text-bold">
//                     {dateFormat_YY_MM_DD_NEW(
//                       clientWithdrawal.transactionDate
//                     )}
//                   </p>
//                 </div>
//                 <div className="uk-width-1-3">
//                   <p className="uk-text-bold">Value Date:</p>
//                 </div>
//                 <div className="uk-width-2-3">
//                   <p className="uk-text-bold">
//                     {dateFormat_YY_MM_DD_NEW(clientWithdrawal.valueDate)}
//                   </p>
//                 </div>
//                 <div className="uk-width-1-3">
//                   <p className="uk-text-bold">Client Name:</p>
//                 </div>
//                 <div className="uk-width-2-3">
//                   <p>{getClientName(clientWithdrawal)}</p>
//                 </div>
//                 <div className="uk-width-1-3">
//                   <p className="uk-text-bold">Account:</p>
//                 </div>
//                 <div className="uk-width-2-3">
//                   <p>{clientWithdrawal.allocation}</p>
//                 </div>
//                 <div className="uk-width-1-3">
//                   <p className="uk-text-bold">Entity No.:</p>
//                 </div>
//                 <div className="uk-width-2-3">
//                   <p>{getEntityId(clientWithdrawal)}</p>
//                 </div>
//                 <div className="uk-width-1-3">
//                   <p className="uk-text-bold">Description:</p>
//                 </div>
//                 <div className="uk-width-2-3">
//                   <p>{clientWithdrawal.description}</p>
//                 </div>
//                 <div className="uk-width-1-3">
//                   <p className="uk-text-bold">Reference:</p>
//                 </div>
//                 <div className="uk-width-2-3">
//                   <p>{clientWithdrawal.reference}</p>
//                 </div>
//                 <div className="uk-width-1-3">
//                   <p className="uk-text-bold">Account Balance:</p>
//                 </div>
//                 <div className="uk-width-2-3">
//                   <p>
//                     {(getAccountBalance(clientWithdrawal))}
//                   </p>
//                 </div>
//                 <div className="uk-width-1-3">
//                   <p className="uk-text-bold">Amount:</p>
//                 </div>
//                 <div className="uk-width-2-3">
//                   <p>{(clientWithdrawal.amount)}</p>
//                 </div>
//                 <div className="uk-width-1-3">
//                   <p className="uk-text-bold">Product Code:</p>
//                 </div>
//                 <div>
//                   <p>{clientWithdrawal.productCode}</p>
//                 </div>
//                 <h4 className="main-title-sm uk-margin-top">
//                   Selected Bank Account Details
//                 </h4>
//                 <div className="uk-grid uk-grid-small" data-uk-grid>
//                   <div className="uk-width-1-3 uk-margin-top">
//                     <p className="uk-text-bold">Bank Name:</p>
//                   </div>
//                   <div className="uk-width-2-3 uk-margin-top">
//                     <p>
//                       {splitAndTrimString("|", clientWithdrawal.bank)[0]}
//                     </p>
//                   </div>

//                   <div className="uk-width-1-3">
//                     <p className="uk-text-bold">Account Name:</p>
//                   </div>
//                   <div className="uk-width-2-3">
//                     <p>
//                       {splitAndTrimString("|", clientWithdrawal.bank)[2]}
//                     </p>
//                   </div>

//                   <div className="uk-width-1-3">
//                     <p className="uk-text-bold">Account No.:</p>
//                   </div>
//                   <div className="uk-width-2-3">
//                     <p>
//                       {splitAndTrimString("|", clientWithdrawal.bank)[1]}
//                     </p>
//                   </div>

//                   <div className="uk-width-1-3">
//                     <p className="uk-text-bold">Branch No.:</p>
//                   </div>
//                   <div className="uk-width-2-3">
//                     <p>
//                       {splitAndTrimString("|", clientWithdrawal.bank)[3]}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="uk-width-2-3">
//             <h4 className="main-title-sm">Transaction Audit Trail</h4>
//             {!displayDetails && (
//               <ClientWithdrawalPaymentAuditTrailGrid
//                 displayDetails={setDisplayDetails}
//                 data={withdrawalTransactionAudit}
//                 setSelectedAudit={setSelectedAudit}
//               />
//             )}
//             {displayDetails && (
//               <ClientWithdrawalAuditTrailView
//                 displayDetails={setDisplayDetails}
//                 auditTrail={selectedAudit}
//               />
//             )}


//             <div className="uk-grid uk-grid-small" data-uk-grid>

//               <div className="uk-width-1-2">
//                 <VerifyUploadComponent
//                   onFileUpload={(fileUrl) => {
//                     // Update clientWithdrawal or perform other actions with fileUrl
//                     setClientWithdrawal((prev) => ({
//                       ...prev,
//                       instruction: fileUrl,
//                     }));
//                   }}
//                   onProvideReason={(reason) => {
//                     // Update clientWithdrawal or perform other actions with reason
//                     setClientWithdrawal((prev) => ({
//                       ...prev,
//                       reasonForNoInstruction: reason,
//                     }));
//                   }}
//                   fileUrl={clientWithdrawal.instruction}
//                   reasonForNotProvingFile={
//                     clientWithdrawal.reasonForNoInstruction
//                   }
//                   label="Client Instruction"
//                   allocation={clientWithdrawal.allocation}
//                 />
//               </div>
//               {clientWithdrawal.returnNote &&
//                 <div className="uk-width-1-2 uk-margin-top">

//                   <div className="uk-form-controls">
//                     <label className="uk-form-label">Return Note</label>
//                     <textarea
//                       defaultValue={clientWithdrawal.returnNote}
//                       className="uk-textarea uk-form-small"
//                       disabled
//                       cols={20}></textarea>
//                   </div>
//                 </div>
//               }

//             </div>
//             <hr />
//             <div className="uk-grid uk-grid-small" data-uk-grid>
//               {clientWithdrawal.allocationStatus === "Pending" && (
//                 <>
//                   <button
//                     onClick={() =>
//                       onAmendWithdrawal(clientWithdrawal.id, store)
//                     }
//                     className="btn btn-danger">
//                     Amend Transaction
//                   </button>
//                   <button
//                     onClick={() =>
//                       onDeleteTransaction(clientWithdrawal.id, api, store)
//                     }
//                     className="btn btn-danger">
//                     Delete
//                   </button>
//                   <button
//                     onClick={() =>
//                       onFirstLevelApproval(
//                         clientWithdrawal.id,
//                         api,
//                         store,
//                         setLoadingFirstLevelApproval
//                       )
//                     }
//                     className="btn btn-primary"
//                     disabled={loadingFirstLevelApproval}>
//                     Submit for 1st Level Approval{" "}
//                     {loadingFirstLevelApproval && (
//                       <div data-uk-spinner={"ratio:.5"}></div>
//                     )}
//                   </button>
//                 </>
//               )}
//               {clientWithdrawal.allocationStatus ===
//                 "Awaiting Verification" && (
//                   <>
//                     <button
//                       type="button"
//                       onClick={() =>
//                         onReturnWithdrawalForAmendment(clientWithdrawal.id, store)
//                       }
//                       className="btn btn-danger"
//                       disabled={loadingApproveForBatching || loadingSecondLevelApproval}
//                     >
//                       Return for Amendment
//                     </button>
//                     <button
//                       onClick={() =>
//                         onSecondLevelApproval(
//                           clientWithdrawal.id,
//                           api,
//                           store,
//                           setLoadingSecondLevelApproval
//                         )
//                       }
//                       className="btn btn-primary"
//                       disabled={loadingSecondLevelApproval || loadingApproveForBatching}>
//                       Submit for 2nd Approval{" "}
//                       {loadingSecondLevelApproval && (
//                         <div data-uk-spinner={"ratio:.5"}></div>
//                       )}
//                     </button>
//                   </>
//                 )}
//               {clientWithdrawal.allocationStatus === "Verified" && (
//                 <>
//                   <button
//                     disabled={loadingSecondLevelApproval || loadingApproveForBatching}
//                     type="button"
//                     onClick={() =>
//                       onReturnWithdrawalForAmendment(clientWithdrawal.id, store)
//                     }
//                     className="btn btn-danger">
//                     Return for Amendment
//                   </button>
//                   <button
//                     onClick={() =>
//                       onApproveForBatching(
//                         clientWithdrawal.id,
//                         api,
//                         store,
//                         setLoadingApproveForBatching
//                       )
//                     }
//                     className="btn btn-primary"
//                     disabled={loadingSecondLevelApproval || loadingApproveForBatching}
//                   >
//                     Approve for Batching{" "}
//                     {loadingApproveForBatching && (
//                       <div data-uk-spinner={"ratio:.5"}></div>
//                     )}
//                   </button>
//                 </>
//               )}
//               {clientWithdrawal.allocationStatus ===
//                 "Awaiting New Date Confirmation" && (
//                   <>
//                     <button
//                       type="button"
//                       className="btn btn-primary"
//                       onClick={() =>
//                         onVerifyBackDatedWithdrawalTransaction(
//                           clientWithdrawal.id,
//                           api,
//                           store
//                         )
//                       }
//                       disabled={loadingSecondLevelApproval || loadingApproveForBatching}
//                     >
//                       Verify Back Dating
//                     </button>
//                   </>
//                 )}
//               {/* {clientWithdrawal.allocationStatus === "Approved" &&

//                 <button
//                   type="button"
//                   onClick={() =>
//                     onReturnWithdrawalForAmendment(clientWithdrawal.id, store)
//                   }
//                   className="btn btn-danger">
//                   Return for Amendment
//                 </button>

//               } */}
//             </div>
//           </div>
//         </div>
//       </div>
//     </ErrorBoundary>
//   );
// });

// export default ViewWithdrawalModal;

import React from 'react'

const ViewWithdrawalModal = () => {
  return (
    <div>
      
    </div>
  )
}

export default ViewWithdrawalModal

