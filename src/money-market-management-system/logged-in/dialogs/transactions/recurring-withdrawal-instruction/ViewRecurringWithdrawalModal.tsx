// import { observer } from "mobx-react-lite";
// import { useState, useEffect } from "react";
// import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";
// import { VerifyUploadComponent } from "../../../../../shared/components/instruction-file-upload/edit-upload-component/VerifyComponent";
// import { useAppContext } from "../../../../../shared/functions/Context";
// import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
// import { splitAndTrimString } from "../../../../../shared/functions/StringFunctions";
// import { onAmendRecurringWithdrawal } from "../../../../../shared/functions/transactions/WithdrawalTransactionsFunctions";
// import { IWithdrawalTransactionAudit, defaultWithdrawalTransactionAudit } from "../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionAuditModel";
// import { IRecurringWithdrawalInstruction, defaultRecurringWithdrawalInstruction } from "../../../../../shared/models/recurring-withdrawal-instruction/RecurringWithdrawalInstructionModel";
// import { dateFormat_YY_MM_DD_NEW } from "../../../../../shared/utils/utils";
// import ClientWithdrawalAuditTrailView from "../../../system-modules/money-market-transactions-module/bank-statement-upload/transaction-status/ClientWithdrawalAuditTrailView";
// import { ClientWithdrawalPaymentAuditTrailGrid } from "../../../system-modules/money-market-transactions-module/withdrawal-transaction/WithdrawalTransactionAuditTrailGrid";
// import MODAL_NAMES from "../../ModalName";
// import swal from "sweetalert";
// import { RecurringAuditTrailGrid } from "./RecurringAuditTrail";


// const ViewRecurringWithdrawalModal = observer(() => {
//   const { api, store } = useAppContext();

//   const [loading, setLoading] = useState(false);

//   const [clientWithdrawal, setClientWithdrawal] =
//     useState<IRecurringWithdrawalInstruction>({...defaultRecurringWithdrawalInstruction });
//   const [displayDetails, setDisplayDetails] = useState(false);
//   const [selectedAudit, setSelectedAudit] =
//     useState<IWithdrawalTransactionAudit>({
//       ...defaultWithdrawalTransactionAudit,
//     });

//   const mmAccounts = store.mma.all;

//   const auditTrail = store.recurringWithdrawalAuditStore.all.map((audit)=>{return audit.asJson});

// console.log("check audit", auditTrail);


//   const recurralAudit = auditTrail
//   .sort((a, b) => {
//     const dateA = new Date(a.auditDateTime || 0);
//     const dateB = new Date(b.auditDateTime || 0);

//     return dateB.getTime() - dateA.getTime();
//   })
//   .map((c) => {
//     return c;
//   });


//   const clients = [
//     ...store.client.naturalPerson.all,
//     ...store.client.legalEntity.all,
//   ];

//  const onVerifyParty = async () => {
//    const selected = store.recurringWithdrawalInstruction.selected;
//    if (selected) {
//      try {
//        await api.recurringWithdrawalInstruction.updateRecurringWithdrawalStatus(
//          clientWithdrawal,
//          "Verified"
//        );
//        swal({
//          icon: "success",
//          text: "Recurring Withdrawal Verified",
//        });
//      } catch (error) {}
//    }
//    setLoading(false);
//    onCancel();
//    hideModalFromId(
//      MODAL_NAMES.BACK_OFFICE.RECORD_RECURRING_EDIT_WITHDRAWAL_MODAL
//    );
//  };

//   const getAccountBalance = (transaction: IRecurringWithdrawalInstruction) => {
//     const account = mmAccounts.find(
//       (account) => account.asJson.accountNumber === transaction.allocation
//     );
//     if (account) {
//       return account.asJson.balance - account.asJson.cession;
//     } else {
//       return "";
//     }
//   };

//   const onCancel = () => {
//     store.withdrawalTransaction.clearSelected();
//     store.depositTransactionAudit.clearSelected();

//     setDisplayDetails(false);
//     setClientWithdrawal({ ...defaultRecurringWithdrawalInstruction });

//     hideModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTION_WITHDRAWAL_MODAL);
//     setLoading(false);
//   };

//     const getEntityId = (transaction: IRecurringWithdrawalInstruction) => {
//       const account = mmAccounts.find(
//         (account) => account.asJson.accountNumber === transaction.allocation
//       );
//       if (account) {
//         const client = clients.find(
//           (client) => client.asJson.entityId === account.asJson.parentEntity
//         );
//         if (client) {
//           const entityId = client.asJson.entityId;
//           return entityId;
//         }
//       } else {
//         return "";
//       }
//     };
//    const getClientName = (transaction: IRecurringWithdrawalInstruction) => {
//      const account = mmAccounts.find(
//        (account) => account.asJson.accountNumber === transaction.allocation
//      );
//      if (account) {
//        const client = clients.find(
//          (client) => client.asJson.entityId === account.asJson.parentEntity
//        );
//        if (client) {
//          const clientName = client.asJson.entityDisplayName;
//          return clientName;
//        }
//      } else {
//        return "";
//      }
//    };

//   useEffect(() => {
//     if (store.recurringWithdrawalInstruction.selected) {
//       setClientWithdrawal(store.recurringWithdrawalInstruction.selected);
//     }
//   }, [store.withdrawalTransaction.selected, store.recurringWithdrawalInstruction.selected]);


  
//   useEffect(() => {
//     const loadData = async () => {
//       setLoading(true);

//       if (clientWithdrawal.id) {
       
//         await api.recurringWithdrawalAudit.getAll(clientWithdrawal.id);
//       }
//       // const test= store.recurringWithdrawalAuditStore.getItemById(clientWithdrawal.id)
//       // console.log("test",test);
      
//   await api.recurringWithdrawalInstruction.getAll()
//       setLoading(false);
//     };
//     loadData();
//   }, [api.recurringWithdrawalAudit, api.recurringWithdrawalInstruction, clientWithdrawal.id]);
//   return (
//     <ErrorBoundary>
//       <div className="view-modal custom-modal-style uk-modal-dialog uk-modal-body uk-width-1-1">
//         <button
//           className="uk-modal-close-default"
//           onClick={onCancel}
//           disabled={loading}
//           type="button"
//           data-uk-close></button>
//         <h3 className="main-title-sm text-to-break">
//           Recurring Withdrawal Instruction
//         </h3>
//         <div className="uk-grid" data-uk-grid>
//           <div className="dialog-content uk-position-relative uk-width-1-3">
//             <div className="uk-grid">
//               <div className="uk-card uk-width-1-1">
//                 <div className="uk-card-body">
//                   <h4>Withdrawal Transaction Details</h4>
//                   <div className="uk-grid">
//                     <div className="uk-width-1-3">
//                       <p>Transaction Date</p>
//                     </div>
//                     <div className="uk-width-2-3">
//                       <p>
//                         {dateFormat_YY_MM_DD_NEW(
//                           clientWithdrawal.transactionDate
//                         )}
//                       </p>
//                     </div>
//                     <hr className="uk-width-1-1" />

//                     <div className="uk-width-1-3">
//                       <p>Value Date</p>
//                     </div>
//                     <div className="uk-width-2-3">
//                       <p>
//                         {dateFormat_YY_MM_DD_NEW(clientWithdrawal.valueDate)}
//                       </p>
//                     </div>
//                     <hr className="uk-width-1-1" />

//                     <div className="uk-width-1-3">
//                       <p>Client Name</p>
//                     </div>
//                     <div className="uk-width-2-3">
//                       <p>{getClientName(clientWithdrawal)}</p>
//                     </div>
//                     <hr className="uk-width-1-1" />

//                     <div className="uk-width-1-3">
//                       <p>Account</p>
//                     </div>
//                     <div className="uk-width-2-3">
//                       <p>{clientWithdrawal.allocation}</p>
//                     </div>
//                     <hr className="uk-width-1-1" />

//                     <div className="uk-width-1-3">
//                       <p>Entity No.</p>
//                     </div>
//                     <div className="uk-width-2-3">
//                       <p>{getEntityId(clientWithdrawal)}</p>
//                     </div>
//                     <hr className="uk-width-1-1" />

//                     <div className="uk-width-1-3">
//                       <p>Reference:</p>
//                     </div>
//                     <div className="uk-width-2-3">
//                       <p>{clientWithdrawal.reference}</p>
//                     </div>
//                     <hr className="uk-width-1-1" />

//                     <div className="uk-width-1-3">
//                       <p>Account Balance</p>
//                     </div>
//                     <div className="uk-width-2-3">
//                       <p>
//                         {(getAccountBalance(clientWithdrawal))}
//                       </p>
//                     </div>
//                     <hr className="uk-width-1-1" />

//                     <div className="uk-width-1-3">
//                       <p>Amount</p>
//                     </div>
//                     <div className="uk-width-2-3">
//                       <p>{(clientWithdrawal.amount)}</p>
//                     </div>
//                     <hr className="uk-width-1-1" />

//                     <div className="uk-width-1-3">
//                       <p>Product Code</p>
//                     </div>
//                     <div className="uk-width-2-3">
//                       <p>
//                         {
//                           splitAndTrimString(
//                             "-",
//                             clientWithdrawal.productCode || ""
//                           )[2]
//                         }
//                       </p>
//                     </div>
//                     <hr className="uk-width-1-1" />

//                     <h4 className="uk-margin-medium-top">
//                       Selected Bank Account Details
//                     </h4>
//                     <div className="uk-grid">
//                       <div className="uk-width-1-3">
//                         <p>Bank Name</p>
//                       </div>
//                       <div className="uk-width-2-3">
//                         <p>
//                           {splitAndTrimString("|", clientWithdrawal.bank)[0]}
//                         </p>
//                       </div>
//                       <hr className="uk-width-1-1" />

//                       <div className="uk-width-1-3">
//                         <p>Account Name</p>
//                       </div>
//                       <div className="uk-width-2-3">
//                         <p>
//                           {splitAndTrimString("|", clientWithdrawal.bank)[2]}
//                         </p>
//                       </div>
//                       <hr className="uk-width-1-1" />

//                       <div className="uk-width-1-3">
//                         <p>Account No.</p>
//                       </div>
//                       <div className="uk-width-2-3">
//                         <p>
//                           {splitAndTrimString("|", clientWithdrawal.bank)[1]}
//                         </p>
//                       </div>
//                       <hr className="uk-width-1-1" />

//                       <div className="uk-width-1-3">
//                         <p>Branch No.</p>
//                       </div>
//                       <div className="uk-width-2-3">
//                         <p>
//                           {splitAndTrimString("|", clientWithdrawal.bank)[3]}
//                         </p>
//                       </div>
//                       <hr className="uk-width-1-1" />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="grid uk-card uk-card-body uk-width-2-3">
//             <h4>Transaction Audit Trail</h4>
//             {!displayDetails && (
//               <RecurringAuditTrailGrid
//                 data={recurralAudit}
//               />
//             )}
//             {displayDetails && (
//               <ClientWithdrawalAuditTrailView
//                 displayDetails={setDisplayDetails}
//                 auditTrail={selectedAudit}
//               />
//             )}
//             <div className="uk-width-1-2">
//               <VerifyUploadComponent
//                 onFileUpload={(fileUrl) => {
//                   // Update clientWithdrawal or perform other actions with fileUrl
//                   setClientWithdrawal((prev) => ({
//                     ...prev,
//                     instruction: fileUrl,
//                   }));
//                 }}
//                 onProvideReason={(reason) => {
//                   // Update clientWithdrawal or perform other actions with reason
//                   setClientWithdrawal((prev) => ({
//                     ...prev,
//                     reasonForNoInstruction: reason,
//                   }));
//                 }}
//                 fileUrl={clientWithdrawal.instruction}
//                 reasonForNotProvingFile={
//                   clientWithdrawal.reasonForNoInstruction
//                 }
//                 label="Client Instruction"
//                 allocation={clientWithdrawal.allocation}
//               />
//             </div>
//             <div className="uk-width-1-2">
//               {clientWithdrawal.returnNote && (
//                 <div className="uk-form-controls">
//                   <label className="uk-form-label">Return Note</label>
//                   <textarea className="uk-textarea uk-form-small" disabled>
//                     {clientWithdrawal.returnNote}
//                   </textarea>
//                 </div>
//               )}
//             </div>

//             <div className="uk-margin uk-grid uk-grid-small" data-uk-grid>
//               {clientWithdrawal.allocationStatus ===
//                 "Awaiting Verification" && (
//                 <>
//                   <button
//                     type="button"
//                     onClick={() => onVerifyParty()}
//                     className="btn btn-primary">
//                     Verify withdrawal
//                   </button>

//                   <button
//                     onClick={() =>
//                       onAmendRecurringWithdrawal(clientWithdrawal.id, store)
//                     }
//                     className="btn btn-primary">
//                     Amend Transaction
//                   </button>

//                   {/* <button
//                     onClick={() =>
//                       onFirstLevelApproval(clientWithdrawal.id, api, store)
//                     }
//                     className="btn btn-primary">
//                     Submit for 2nd Approval
//                   </button> */}
//                 </>
//               )}
//               {clientWithdrawal.transactionStatus === "Verified" && (
//                 <>
//                   <button
//                     onClick={() =>
//                       onAmendRecurringWithdrawal(clientWithdrawal.id, store)
//                     }
//                     className="btn btn-primary">
//                     Amend Transaction
//                   </button>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </ErrorBoundary>
//   );
// });

// export default ViewRecurringWithdrawalModal;

import React from 'react'

const ViewRecurringWithdrawalModal = () => {
  return (
    <div>
      
    </div>
  )
}

export default ViewRecurringWithdrawalModal
