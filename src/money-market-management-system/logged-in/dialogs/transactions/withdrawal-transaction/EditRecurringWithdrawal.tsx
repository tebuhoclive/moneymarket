// import swal from "sweetalert";
// import MODAL_NAMES from "../../ModalName";
// import { useState, FormEvent, useEffect, SetStateAction } from "react";
// import { observer } from "mobx-react-lite";
// import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";
// import { useAppContext } from "../../../../../shared/functions/Context";
// import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
// import { splitAndTrimString } from "../../../../../shared/functions/StringFunctions";
// import { IMoneyMarketAccount } from "../../../../../shared/models/money-market-account/MoneyMarketAccount";
// import {
//   IWithdrawalTransactionAudit,
//   defaultWithdrawalTransactionAudit,
// } from "../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionAuditModel";
// import { ILegalEntity } from "../../../../../shared/models/clients/LegalEntityModel";
// import { INaturalPerson } from "../../../../../shared/models/clients/NaturalPersonModel";
// import {
//   IRecurringWithdrawalInstruction,
//   defaultRecurringWithdrawalInstruction,
// } from "../../../../../shared/models/recurring-withdrawal-instruction/RecurringWithdrawalInstructionModel";
// import DaySelector from "../../../../../shared/components/day-selector/DaySelector";
// import { RecurringAuditTrailGrid } from "../recurring-withdrawal-instruction/RecurringAuditTrail";
// import { useParams } from "react-router-dom";

// const EditRecurringWithdrawalModal = observer(() => {
//   const { api, store } = useAppContext();
//   const [loading, setLoading] = useState(false);
//   const [clientWithdrawal, setClientWithdrawal] =
//     useState<IRecurringWithdrawalInstruction>({
//       ...defaultRecurringWithdrawalInstruction,
//     });
//   const [selectedClientAccount, setSelectedClientAccount] =
//     useState<IMoneyMarketAccount>();
//   const [selectedClient, setSelectedClient] = useState<
//     INaturalPerson | ILegalEntity
//   >();

//   const [recurringDays, setRecurringDays] = useState(0);
//   const [recurringAmount, setRecurringAmount] = useState(0);

//   // const clients = [
//   //   ...store.client.naturalPerson.all,
//   //   ...store.client.legalEntity.all,
//   // ];

//   const clientAccount = store.mma.all;
//   const auditTrail = store.withdrawalTransactionAudit.all;
//   const [instructionFileURL, setInstructionFileURL] = useState("");
//   const [reasonForNoAttachment, setReasonForNoAttachment] = useState("");
//   const timeCreated = Date.now();
//   const formattedCreated = new Date(timeCreated).toUTCString();

//   const [stop, setStop] = useState(false);
//   const { id } = useParams();
//   const handleInstructionFileUpload = (url: string) => {
//     // Handle the URL in the parent component
//     setInstructionFileURL(url);
//   };
//   const recurralAudits = store.recurringWithdrawalAuditStore.all.map(
//     (recurring) => {
//       return recurring.asJson;
//     }
//   );
//   console.log("audit Trails", recurralAudits);
//   const handleReasonForNoAttachment = (reason: string) => {
//     // Handle the URL in the parent component
//     setReasonForNoAttachment(reason);
//   };

//   const handleDayChange = (selectedDay: string) => {
//     console.log("Selected Day" + selectedDay);
//     // setClientWithdrawal({
//     //   ...clientWithdrawal,
//     //   recurringDay: parseInt(selectedDay),
//     // });
//     const day = parseInt(selectedDay);
//     setRecurringDays(day);
//     console.log("clientWithdrawal", clientWithdrawal);
//   };

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
//       amount: recurringAmount,
//       reference: clientWithdrawal.reference || "IJG Recurring",
//       description: clientWithdrawal.description,
//       transactionDate: Date.now(),
//       allocationStatus: "Awaiting Verification",
//       transactionStatus: "Pending",
//       transactionAction: "Returned for Amendment",
//       returnNote: clientWithdrawal.returnNote || "",
//       recurringDay: recurringDays,
//     };
//     // console.log("My Recurring transaction",recurringTransaction);
//     console.log("return", saveTransaction);

//     swal({
//       title: "Are you sure now?",
//       icon: "warning",
//       buttons: ["Cancel", "Amend "],
//       dangerMode: true,
//     }).then(async (edit) => {
//       if (edit) {
//         setLoading(true);
//         try {
//           await update(saveTransaction);
//           console.log("Update Successful", saveTransaction);
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

//   const handleRecurringStatus = () => {
//     // Check if the transaction status is not already "Stopped"
//     if (clientWithdrawal.transactionStatus !== "Stopped") {
//       // Show the confirmation dialog only if the transaction status is not already "Stopped"
//       swal({
//         title: "Are you sure?",
//         text: "You are about to stop the transaction.",
//         icon: "warning",
//         buttons: ["Cancel", "Stop"],
//         dangerMode: true,
//       }).then(async (edit) => {
//         if (edit) {
//           // If the user confirms, update the transaction status
//           setLoading(true);
//           try {
//             const saveTransaction: IRecurringWithdrawalInstruction = {
//               ...clientWithdrawal,
//               allocationStatus: "Stopped",
//               transactionStatus: "Pending",

//               transactionAction: "Stopped by User",
//             };
//             await update(saveTransaction);
//             console.log("Transaction stopped successfully", saveTransaction);
//             swal({
//               icon: "success",
//               text: "Transaction has been stopped.",
//             });
//           } catch (error) {
//             console.log("Error stopping transaction", error);
//             swal({
//               icon: "error",
//               text: "An error occurred while stopping the transaction.",
//             });
//           }
//           setLoading(false);
//           onCancel();
//         } else {
//           // If the user cancels, show a message
//           swal({
//             icon: "info",
//             text: "Transaction stop operation cancelled.",
//           });
//         }
//       });
//     } else {
//       // If the transaction status is already "Stopped", show a message indicating it's already stopped
//       swal({
//         icon: "info",
//         text: "Transaction is already stopped.",
//       });
//     }
//   };

//   const update = async (transaction: IRecurringWithdrawalInstruction) => {
//     try {
//       console.log("About to update transaction", transaction);
//       // await api.recurringWithdrawalInstruction.update(transaction);
//       await api.recurringWithdrawalInstruction.updateAndCreateAuditTrail(
//         clientWithdrawal,
//         transaction
//       );
//       console.log("Recurring Withdrawal Updated successfully", transaction);

//       swal({
//         icon: "success",
//         text: "Transaction has been recorded",
//       });
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const onCancel = () => {
//     hideModalFromId(MODAL_NAMES.BACK_OFFICE.EDIT_WITHDRAWAL_RECURRING_MODAL);
//     store.withdrawalTransaction.clearSelected();
//     store.withdrawalTransaction.clearSelected();

//     setSelectedClient(undefined);
//     setSelectedClientAccount(undefined);
//     setClientWithdrawal({
//       ...defaultRecurringWithdrawalInstruction,
//       returnNote: "",
//     });
//   };
//   useEffect(() => {
//     const clients = [
//       ...store.client.naturalPerson.all,
//       ...store.client.legalEntity.all,
//     ];

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

//       if (clientWithdrawal && clientWithdrawal.id) {
//         const load = async () => {
//           try {
//             console.log("clientWithdrawal" + clientWithdrawal);
//             await api.recurringWithdrawalInstruction.getAll;
//           } catch (error) {
//             console.error("Error loading data:", error);
//           }
//         };

//         load();
//       }
//     }
//   }, [
//     api.recurringWithdrawalInstruction.getAll,
//     clientAccount,
//     clientWithdrawal,
//     store.client.legalEntity.all,
//     store.client.naturalPerson.all,
//     store.recurringWithdrawalInstruction.selected,
//   ]);

//   useEffect(() => {
//     const loadData = async () => {
//       setLoading(true);
//       await api.recurringWithdrawalInstruction.getById(clientWithdrawal.id);
//       setLoading(false);
//     };
//     loadData();
//   }, [
//     api.recurringWithdrawalInstruction,
//     clientWithdrawal.id,
//   ]);

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
//             <form
//               className="uk-grid uk-grid-small"
//               data-uk-grid
//               onSubmit={handleSubmit}>
//               <div className="uk-width-1-2 uk-form-controls">
//                 <div className="uk-width-1-1 uk-margin-medium-top">
//                   <div>
//                     <h4>Current Recurring Amount</h4>
//                   </div>
//                   <div className="uk-width-2-3">
//                     <p>{clientWithdrawal.amount}</p>
//                   </div>
//                 </div>
//                 <div className="uk-width-1-1 uk-margin-medium-top">
//                   <div>
//                     <h4>Current Recurring Day</h4>
//                   </div>
//                   <div className="uk-width-2-3">
//                     <p>{clientWithdrawal.recurringDay}</p>
//                   </div>
//                 </div>

//                 <label
//                   className="uk-form-label required"
//                   htmlFor=""
//                   style={{ marginTop: "20px" }}>
//                   New Amount
//                 </label>
//                 <div className="uk-width-2-3">
//                   <input
//                     className="uk-textarea uk-form-small"
//                     type="number"
//                     defaultValue={clientWithdrawal.amount}
//                     id="amount"
//                     onChange={(e) =>
//                       setRecurringAmount(parseInt(e.target.value))
//                     }
//                     required
//                   />
//                 </div>
//                 <div className="uk-width-1-2 uk-form-controls">
//                   <label className="uk-form-label required" htmlFor="">
//                     New Recurring Day
//                   </label>
//                   <DaySelector onChange={handleDayChange} />
//                 </div>
//               </div>
//               <div className="uk-width-1-2">
//                 <div>
//                   <h4>Audit Trail</h4>
//                 </div>
//                 <RecurringAuditTrailGrid data={recurralAudits} />
//               </div>

//               {/* Submit and Cancel buttons */}
//               <div className="uk-width-1-1 uk-form-controls">
//                 {availableBalance < 0 && (
//                   <span className="uk-text-danger uk-display-block">
//                     Insufficient funds
//                   </span>
//                 )}
//                 {selectedClient?.restricted && (
//                   <span className="uk-text-danger uk-display-block">
//                     Client has been restricted:{" "}
//                     {selectedClient.reasonForRestriction}
//                   </span>
//                 )}
//                 {(availableBalance < 0 || selectedClient?.restricted) && (
//                   <>
//                     {" "}
//                     <button type="submit" className="btn btn-primary" disabled>
//                       Amend
//                     </button>
//                     {clientWithdrawal.transactionStatus !== "Pending" &&
//                       clientWithdrawal.transactionStatus !== "Stopped" && (
//                         <button
//                           className="btn btn-primary"
//                           onClick={handleRecurringStatus}>
//                           Stop
//                         </button>
//                       )}
//                   </>
//                 )}
//                 {availableBalance >= 0 && (
//                   <>
//                     <button
//                       type="submit"
//                       className="btn btn-primary"
//                       disabled={clientWithdrawal.amount === 0 || loading}>
//                       Amend{" "}
//                     </button>
//                     {clientWithdrawal.transactionStatus !== "Pending" &&
//                       clientWithdrawal.transactionStatus !== "Stopped" && (
//                         <button
//                           className="btn btn-primary"
//                           onClick={handleRecurringStatus}>
//                           Stop
//                         </button>
//                       )}
//                   </>
//                 )}
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

// export default EditRecurringWithdrawalModal;

import React from 'react'

const EditRecurringWithdrawal = () => {
  return (
    <div>
      
    </div>
  )
}

export default EditRecurringWithdrawal
