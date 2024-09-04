// import swal from "sweetalert";

// import MODAL_NAMES from "../../ModalName";
// import { useState, FormEvent, useEffect } from "react";

// import { observer } from "mobx-react-lite";
// import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";
// import { VerifyUploadComponent } from "../../../../../shared/components/instruction-file-upload/edit-upload-component/VerifyComponent";
// import { useAppContext } from "../../../../../shared/functions/Context";
// import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
// import { splitAndTrimString } from "../../../../../shared/functions/StringFunctions";
// import { IMoneyMarketAccount } from "../../../../../shared/models/money-market-account/MoneyMarketAccount";
// import { IWithdrawalTransactionAudit, defaultWithdrawalTransactionAudit } from "../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionAuditModel";
// import { ILegalEntity } from "../../../../../shared/models/clients/LegalEntityModel";
// import { INaturalPerson } from "../../../../../shared/models/clients/NaturalPersonModel";
// import { IRecurringWithdrawalInstruction, defaultRecurringWithdrawalInstruction } from "../../../../../shared/models/recurring-withdrawal-instruction/RecurringWithdrawalInstructionModel";
// import ClientWithdrawalAuditTrailView from "../../../system-modules/money-market-transactions-module/bank-statement-upload/transaction-status/ClientWithdrawalAuditTrailView";
// import { ClientWithdrawalPaymentAuditTrailGrid } from "../../../system-modules/money-market-transactions-module/withdrawal-transaction/ClientWithdrawalPaymentAuditTrailGrid";

// const ReturnRecurringWithdrawalForAmendmentModal = observer(() => {
//   const { api, store } = useAppContext();
//   const [loading, setLoading] = useState(false);
//    const [clientWithdrawal, setClientWithdrawal] =
//      useState<IRecurringWithdrawalInstruction>({
//        ...defaultRecurringWithdrawalInstruction,
//      });
//   const [selectedClientAccount, setSelectedClientAccount] =
//     useState<IMoneyMarketAccount>();
//   const [selectedClient, setSelectedClient] = useState<
//     INaturalPerson | ILegalEntity
//   >();
//   const [displayDetails, setDisplayDetails] = useState(false);
//   const [selectedAudit, setSelectedAudit] =
//     useState<IWithdrawalTransactionAudit>({
//       ...defaultWithdrawalTransactionAudit,
//     });

//   const clients = [
//     ...store.client.naturalPerson.all,
//     ...store.client.legalEntity.all,
//   ];

//   const clientAccount = store.mma.all;

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

//   const clientBalance = () => {
//     const account = store.mma.all.find(
//       (mma) => mma.asJson.accountNumber === clientWithdrawal.allocation
//     );
//     return account ? account.asJson.balance - account.asJson.cession : 0;
//   };

//   const availableBalance = clientBalance() - clientWithdrawal.amount;

//   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     const saveTransaction: IRecurringWithdrawalInstruction = {
//       ...clientWithdrawal,
//       allocationStatus: "Pending",
//       transactionStatus: "Pending",
//       transactionAction: "Returned for Amendment",
//       returnNote: clientWithdrawal.returnNote || "",
//     };
//    // console.log("My Recurring transaction",recurringTransaction);
// console.log("return",saveTransaction);

//     swal({
//       title: "Are you sure?",
//       icon: "warning",
//       buttons: ["Cancel", "Return for Amendment"],
//       dangerMode: true,
//     }).then(async (edit) => {
//       if (edit) {
//         setLoading(true);
//         try {
//           await update(saveTransaction);
//           swal({
//             icon: "success",
//             text: `Transaction has been recorded, `,
//           });
//         } catch (error) {
//           console.log(error);
//         }
//         setLoading(false);
//         onCancel();
//       } else {
//         swal({
//           icon: "error",
//           text: "Transaction cancelled!",
//         });
//         setLoading(false);
//       }
//       setLoading(false);
//     });
//   };

//   const update = async (transaction: IRecurringWithdrawalInstruction) => {
//     try {
//       await api.recurringWithdrawalInstruction.update(transaction);
//       swal({
//         icon: "success",
//         text: "Transaction has been recorded",
//       });
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const onCancel = () => {
//     store.withdrawalTransaction.clearSelected();
//     store.withdrawalTransaction.clearSelected();

//     setSelectedClient(undefined);
//     setSelectedClientAccount(undefined);
//     setClientWithdrawal({
//       ...defaultRecurringWithdrawalInstruction,
//       returnNote: "",
//     });

//     hideModalFromId(
//       MODAL_NAMES.BACK_OFFICE.RETURN_WITHDRAWAL_FOR_AMENDMENT_MODAL
//     );
//   };

//   useEffect(() => {
//     if (store.recurringWithdrawalInstruction.selected) {
//       setClientWithdrawal(store.recurringWithdrawalInstruction.selected);
//       if (clientWithdrawal) {
//         const _selectedClient = clients.find(
//           (client) => client.asJson.entityId === clientWithdrawal.entity
//         );
//         if (_selectedClient) {
//           setSelectedClient(_selectedClient.asJson);
//         }
//       }

//       if (clientWithdrawal) {
//         const _selectedClient = clientAccount.find(
//           (client) =>
//             client.asJson.accountNumber === clientWithdrawal.allocation
//         );
//         if (_selectedClient) {
//           setSelectedClientAccount(_selectedClient.asJson);
//         }
//       }
//     }
//   }, []);

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
//           Return Withdrawal Transaction for Amendment
//         </h3>
//         <hr />
//         <div className="uk-grid">
//           <div className="uk-width-1-3">
//             {selectedClient && (
//               <div className="uk-width-1-1 uk-margin-medium-top">
//                 <h4>Selected Client Details</h4>
//                 <div className="uk-grid uk-grid-small" data-uk-grid>
//                   <div className="uk-width-1-3">
//                     <p>Client Name:</p>
//                   </div>
//                   <div className="uk-width-2-3">
//                     <p>{selectedClient.entityDisplayName}</p>
//                   </div>
//                   <hr className="uk-width-1-1" />

//                   <div className="uk-width-1-3">
//                     <p>Balance:</p>
//                   </div>
//                   <div className="uk-width-2-3">
//                     <p>
//                       {(selectedClientAccount?.balance || 0)}
//                     </p>
//                   </div>
//                   <hr className="uk-width-1-1" />

//                   <div className="uk-width-1-3">
//                     <p>Remaining Balance:</p>
//                   </div>
//                   <div className="uk-width-2-3">
//                     <p
//                       className={`${
//                         availableBalance < 0 ? "text-danger uk-text-bold" : ""
//                       }`}>
//                       {!selectedClientAccount && "Select Account"}
//                       {selectedClientAccount &&
//                         availableBalance > 5000 &&
//                         `${(availableBalance)}`}
//                       {selectedClientAccount &&
//                         availableBalance < 5000 &&
//                         `Funds cannot be withdrawn: Insufficient funds`}
//                     </p>
//                   </div>
//                   <hr className="uk-width-1-1" />
//                 </div>
//               </div>
//             )}
//             {clientWithdrawal.bank && (
//               <div className="uk-width-1-1 uk-margin-large-top">
//                 <h4>Selected Bank Account Details</h4>
//                 <div className="uk-grid uk-grid-small" data-uk-grid>
//                   <div className="uk-width-1-3">
//                     <p>Bank Name</p>
//                   </div>
//                   <div className="uk-width-2-3">
//                     <p>{splitAndTrimString("|", clientWithdrawal.bank)[0]}</p>
//                   </div>
//                   <hr className="uk-width-1-1" />

//                   <div className="uk-width-1-3">
//                     <p>Account Name</p>
//                   </div>
//                   <div className="uk-width-2-3">
//                     <p>{splitAndTrimString("|", clientWithdrawal.bank)[2]}</p>
//                   </div>
//                   <hr className="uk-width-1-1" />

//                   <div className="uk-width-1-3">
//                     <p>Account No.</p>
//                   </div>
//                   <div className="uk-width-2-3">
//                     <p>{splitAndTrimString("|", clientWithdrawal.bank)[1]}</p>
//                   </div>
//                   <hr className="uk-width-1-1" />

//                   <div className="uk-width-1-3">
//                     <p>Branch No.</p>
//                   </div>
//                   <div className="uk-width-2-3">
//                     <p>{splitAndTrimString("|", clientWithdrawal.bank)[3]}</p>
//                   </div>
//                   <hr className="uk-width-1-1" />
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="dialog-content uk-position-relative uk-width-2-3">
//             <h4>Transaction Audit Trail</h4>
//             <form className="uk-grid" data-uk-grid onSubmit={handleSubmit}>
//               <div className="uk-grid uk-grid-small uk-width-1-1">
//                 <div className="uk-width-1-1">
//                   {!displayDetails && (
//                     <>
//                       <ClientWithdrawalPaymentAuditTrailGrid
//                         data={withdrawalTransactionAudit}
//                         displayDetails={setDisplayDetails}
//                         setSelectedAudit={setSelectedAudit}
//                       />
//                       <h4 className="uk-width-1-1 uk-margin-top">
//                         Amendment Form
//                       </h4>
//                       <div className="uk-width-1-2">
//                         <VerifyUploadComponent
//                           onFileUpload={(fileUrl) => {
//                             // Update clientWithdrawal or perform other actions with fileUrl
//                             setClientWithdrawal((prev) => ({
//                               ...prev,
//                               instruction: fileUrl,
//                             }));
//                           }}
//                           onProvideReason={(reason) => {
//                             // Update clientWithdrawal or perform other actions with reason
//                             setClientWithdrawal((prev) => ({
//                               ...prev,
//                               reasonForNoInstruction: reason,
//                             }));
//                           }}
//                           fileUrl={clientWithdrawal.instruction}
//                           reasonForNotProvingFile={
//                             clientWithdrawal.reasonForNoInstruction
//                           }
//                           label="Client Instruction"
//                           allocation={clientWithdrawal.allocation}
//                         />
//                       </div>
//                       <div className="uk-form-controls uk-margin-top uk-width-1-2">
//                         <label className="uk-form-label required" htmlFor="">
//                           Return Note
//                         </label>
//                         <textarea
//                           className="uk-textarea uk-form-small "
//                           defaultValue={""}
//                           rows={5}
//                           id="returnNote"
//                           name={"returnNote"}
//                           onChange={(e) =>
//                             setClientWithdrawal({
//                               ...clientWithdrawal,
//                               returnNote: e.target.value,
//                             })
//                           }
//                           required
//                         />
//                       </div>
//                     </>
//                   )}

//                   {displayDetails && (
//                     <ClientWithdrawalAuditTrailView
//                       displayDetails={setDisplayDetails}
//                       auditTrail={selectedAudit}
//                     />
//                   )}
//                 </div>
//               </div>

//               <hr className="uk-width-1-1" />
//               <div className="uk-form-controls uk-width-1-1">
//                 <button
//                   type="submit"
//                   className="btn btn-primary"
//                   disabled={loading}>
//                   Return {loading && <div data-uk-spinner={"ratio:.5"}></div>}
//                 </button>

//                 <button
//                   type="button"
//                   className="btn btn-danger"
//                   onClick={onCancel}>
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </ErrorBoundary>
//   );
// });

// export default ReturnRecurringWithdrawalForAmendmentModal;

import React from 'react'

const ReturnRecurringWithdrawalModalForAmendModal = () => {
  return (
    <div>
      
    </div>
  )
}

export default ReturnRecurringWithdrawalModalForAmendModal
