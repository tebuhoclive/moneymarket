// import swal from "sweetalert";

// import MODAL_NAMES from "../../ModalName";
// import { useState, FormEvent, useEffect } from "react";

// import NumberInput from "../../../shared/components/number-input/NumberInput";
// import { observer } from "mobx-react-lite";
// import DaySelector from "../../../../../shared/components/day-selector/DaySelector";
// import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";
// import InstructionFileUploader from "../../../../../shared/components/instruction-file-upload/InstructionFileUploader";
// import SingleSelect from "../../../../../shared/components/single-select/SingleSelect";
// import { useAppContext } from "../../../../../shared/functions/Context";
// import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
// import { getMMAProduct } from "../../../../../shared/functions/MyFunctions";
// import { splitAndTrimString } from "../../../../../shared/functions/StringFunctions";
// import { IMoneyMarketAccount } from "../../../../../shared/models/money-market-account/MoneyMarketAccount";
// import { IWithdrawalTransaction, defaultWithdrawalTransaction } from "../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionModel";
// import { ILegalEntity } from "../../../../../shared/models/clients/LegalEntityModel";
// import { INaturalPerson, defaultNaturalPerson } from "../../../../../shared/models/clients/NaturalPersonModel";
// import { IRecurringWithdrawalInstruction } from "../../../../../shared/models/recurring-withdrawal-instruction/RecurringWithdrawalInstructionModel";


// interface ITransactionInstructionsProps {
//   client: INaturalPerson | undefined;
// }

// const NewRecurringWithdrawalModal = observer((props: ITransactionInstructionsProps) => {

//   const { api, store } = useAppContext();
//   const {client} = props;

//   const [loading, setLoading] = useState(false);
//   const [clientWithdrawal, setClientWithdrawal] =useState<IWithdrawalTransaction>({ ...defaultWithdrawalTransaction });
//   const [selectedClientAccount, setSelectedClientAccount] = useState<IMoneyMarketAccount>();

//   const [selectedClient, setSelectedClient] = useState<INaturalPerson | ILegalEntity>();
//   const [instructionFileURL, setInstructionFileURL] = useState("");
//   const [reasonForNoAttachment, setReasonForNoAttachment] = useState("");
//   const timeCreated = Date.now();
//   const formattedCreated = new Date(timeCreated).toUTCString();
//   const [searchType, setSearchType] = useState("Client Name");

//   const handleInstructionFileUpload = (url: string) => {
//     // Handle the URL in the parent component
//     setInstructionFileURL(url);
//   };

//   const handleReasonForNoAttachment = (reason: string) => {
//     // Handle the URL in the parent component
//     setReasonForNoAttachment(reason);
//   };

//   const agents = store.agent.all;


//   const handleClientAccountChange = (accountNumber: string) => {
//     const selectedAccount = store.mma.all.find(mma => mma.asJson.accountNumber === accountNumber);
//     if (selectedAccount) {
//       store.mma.select(selectedAccount.asJson);
//       const account = store.mma.selected;
//       if (account) {
//         setClientWithdrawal({
//           ...clientWithdrawal,
//           allocation: account?.accountNumber,
//           bank: ""
//         });
//         setSelectedClientAccount(account);
//         return "";
//       }
//     }
//   };

//   const bankAccounts = selectedClient?.bankingDetail.map((acc) => ({
//     label: `${acc.bankName} | ${acc.accountNumber} | ${acc.accountHolder} | ${acc.branchNumber}`,
//     value: `${acc.bankName} | ${acc.accountNumber} | ${acc.accountHolder} | ${acc.branchNumber}`,
//   }));

//   const agentsAccount = agents.map((acc) => ({
//     label: ` ${acc.asJson.agentName} - ${acc.asJson.bankName} (${acc.asJson.accountNumber}) `,
//     value: `${acc.asJson.bankName} | ${acc.asJson.agentName} | ${acc.asJson.accountNumber} | ${acc.asJson.branchCode}`,
//   }));

//   const clientBalance = () => {
//     const account = store.mma.all.find(
//       (mma) => mma.asJson.accountNumber === clientWithdrawal.allocation
//     );
//     return account ? account.asJson.balance - account.asJson.cession : 0;
//   };

//   const availableBalance = clientBalance() - clientWithdrawal.amount;

//   const handleUseAgentChange = () => {
//     setClientWithdrawal((prev) => ({
//       ...prev,
//       useAgent: !prev.useAgent,
//       bank: ""
//     }));
//   };

//   const handleDayChange = (selectedDay: string) => {
//     setClientWithdrawal({
//       ...clientWithdrawal,
//       recurringDay: parseInt(selectedDay)
//     });
//   };

//   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
  
//     if (!selectedClient || !selectedClientAccount) {
//       return;
//     }
  
//     const saveTransaction: IRecurringWithdrawalInstruction = {
//       id: "",
//       allocation: clientWithdrawal.allocation,
//       productCode: getMMAProduct(clientWithdrawal.allocation, store),
//       entity: selectedClient.entityId,
//       amount: clientWithdrawal.amount,
//       bank: clientWithdrawal.bank,
//       reference: clientWithdrawal.reference || "IJG Payments",
//       email: clientWithdrawal.email || "",
//       description: clientWithdrawal.description,
//       valueDate: clientWithdrawal.valueDate || Date.now(),
//       transactionDate: Date.now(),
//       allocationStatus: "Awaiting Verification",
//       transactionStatus: "Pending",
//       transactionAction: "Loaded by User",
//       instruction: reasonForNoAttachment ? "" : instructionFileURL,
//       reasonForNoInstruction: instructionFileURL ? "" : reasonForNoAttachment,
//       recurringDay: clientWithdrawal.recurringDay,
//       timeCreated: formattedCreated,
//       useAgent: clientWithdrawal?.useAgent,
//     };
  
//     console.log("My Recurring Withdrawal", saveTransaction);
  
//     swal({
//       title: "Are you sure?",
//       icon: "warning",
//       buttons: ["Cancel", "Record"],
//       dangerMode: true,
//     }).then(async (edit) => {
//       if (edit) {
//         setLoading(true);
//         try {
//           await create(saveTransaction);
//           swal({
//             icon: "success",
//             text: `Transaction has been recorded, `,
//           });
//           onCancel();
//         } catch (error) {
//           console.error("Error recording transaction:", error);
//           swal({
//             icon: "error",
//             text: "An error occurred while recording the transaction.",
//           });
//         } finally {
//           setLoading(false);
//         }
//       } else {
//         swal({
//           icon: "error",
//           text: "Transaction cancelled!",
//         });
//       }
//     });
//   };
  

//   const create = async (transaction: IRecurringWithdrawalInstruction) => {
//     try {
//       await api.recurringWithdrawalInstruction.create(transaction);
//     //   const email = MAIL_DEPOSIT_PROCESSED_NOTIFICATION(getClientName(clientWithdrawal, store), clientWithdrawal.bank, clientWithdrawal.amount)
//     //   await api.mail.sendMail(["maunda@ijg.net", 'ict@lotsinsigts.com'], "no-reply@ijgmms.net", "Processed Deposit Notification", email.BODY)
//       swal({
//         icon: "success",
//         text: "Transaction has been recorded",
//       });
//     } catch (error) {
//       console.log(error);
//     }
//   };
//   const clientAccountOptionsAlt = store.mma.all.filter(
//     (mma) =>
//       mma.asJson.parentEntity === selectedClient?.entityId && mma.asJson.status === "Active"
//   );
//   const handleClientChange = (entityId: string) => {
//     const _selectedClient = clients.find(
//       (client) => client.asJson.entityId === entityId
//     );
//     if (_selectedClient) {
//       setSelectedClient(_selectedClient.asJson)
//       setSelectedClientAccount(undefined)
//     }
//   };
  
//   const clients = [
//     ...store.client.naturalPerson.all,
//   ];

//   const clientOptions = clients.sort((a, b) => {
//     const nameA = a.asJson.entityDisplayName;
//     const nameB = b.asJson.entityDisplayName;

//     return nameA.localeCompare(nameB);

//   }).map((cli) => ({
//     label: `${cli.asJson.entityId} - ${cli.asJson.entityDisplayName}(${cli.asJson.oldCPNumber})`,
//     value: cli.asJson.entityId,
//   }));

//   const onCancel = () => {

//     store.recurringWithdrawalInstruction.clearSelected();
//     // store.recurringWithdrawalInstruction.clearSelected();
    
//     setInstructionFileURL("");
//     setReasonForNoAttachment("");
//     setSelectedClient({...defaultNaturalPerson});
//     setSelectedClientAccount(undefined);
//     setClientWithdrawal({ ...defaultWithdrawalTransaction });

//     hideModalFromId(MODAL_NAMES.BACK_OFFICE.RECORD_WITHDRAWAL_MODAL);
//   };
//   const clientAccountOptions = store.mma.all.filter((mma) => mma.asJson.status === "Active").map((cli) => ({
//     label: cli.asJson.accountNumber,
//     value: cli.asJson.accountNumber,
//   }));
//   const handleChangeSearchType = (searchTYpe: string) => {
//     setSearchType(searchTYpe);
//     store.client.naturalPerson.clearSelected();
//     store.client.legalEntity.clearSelected();
//     store.mma.clearSelected();
//     setSelectedClient(undefined);
//     setSelectedClientAccount(undefined);
//     setClientWithdrawal({ ...defaultWithdrawalTransaction });
//   }

//   return (
//     <ErrorBoundary>
//       <div className="view-modal custom-modal-style uk-modal-dialog uk-modal-body uk-width-3-4">
//         <button
//           className="uk-modal-close-default"
//           onClick={onCancel}
//           disabled={loading}
//           type="button"
//           data-uk-close></button>
//         <h3 className="main-title-sm text-to-break">
//           Load Recurring Withdrawal Instruction
//         </h3>
//         <hr />
//         <div className="uk-grid uk-grid-column">
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
//             <h4>Recurring Withdrawal Form</h4>
//             <form
//               className="uk-grid uk-grid-small"
//               data-uk-grid
//               onSubmit={handleSubmit}>
//               <div className="uk-width-1-2">
//                 <div className="uk-form-controls">
//                   <label className="uk-form-label required" htmlFor="">
//                     Search Type
//                   </label>
//                   <select
//                     className="uk-select uk-form-small"
//                     defaultValue={searchType}
//                     id="searchType"
//                     name={"searchType"}
//                     onChange={(e) => handleChangeSearchType(e.target.value)}>
//                     <option value="">Select search type...</option>
//                     <option value="Client Name">Client Name</option>
//                     {/* <option value="Account Number">Account Number</option> */}
//                   </select>
//                 </div>
//               </div>

//               {/* Conditional rendering based on search type */}

//               {/* Additional form fields */}
//               <div className="uk-width-1-2 uk-form-controls">
//                 <label className="uk-form-label required" htmlFor="">
//                   Recurring Day
//                 </label>
//                 <DaySelector onChange={handleDayChange} />
//               </div>
//               {searchType === "Client Name" && (
//                 <div className="uk-width-1-2" style={{ marginBottom: "20px" }}>
//                   {/* Client Name and Money Market Account */}
//                   <div className="uk-grid uk-grid-small">
//                     <div className="uk-width-1-1 uk-form-controls">
//                       <label className="uk-form-label required" htmlFor="">
//                         Client Name
//                       </label>
//                       <SingleSelect
//                         options={clientOptions}
//                         name="selectedClient?.entityId"
//                         value={selectedClient?.entityId}
//                         onChange={(value) => handleClientChange(value)}
//                         placeholder="e.g Client Name"
//                         required
//                       />
//                     </div>
//                     <div className="uk-width-1-1 uk-form-controls">
//                       <label className="uk-form-label required" htmlFor="">
//                         Money Market Account
//                       </label>
//                       <select
//                         className="uk-select uk-form-small"
//                         defaultValue={"Select Account"}
//                         id="clientAccount"
//                         name={"clientAccount"}
//                         onChange={(e) =>
//                           handleClientAccountChange(e.target.value)
//                         }
//                         required>
//                         <option value="">Select...</option>
//                         {clientAccountOptionsAlt.map((acc) => (
//                           <option
//                             key={acc.asJson.id}
//                             value={acc.asJson.accountNumber}>
//                             {acc.asJson.accountNumber}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Amount field */}
//               <div className="uk-width-1-2 uk-form-controls">
//                 <label className="uk-form-label required" htmlFor="">
//                   Amount
//                 </label>
//                 <NumberInput
//                   id="amount"
//                   className="auto-save uk-input purchase-input uk-form-small"
//                   placeholder="-"
//                   value={clientWithdrawal.amount}
//                   onChange={(value) =>
//                     setClientWithdrawal({
//                       ...clientWithdrawal,
//                       amount: Number(value),
//                     })
//                   }
//                 />
//               </div>

//               {/* Bank Reference field */}
//               <div className="uk-width-1-2 uk-form-controls">
//                 <label className="uk-form-label required" htmlFor="">
//                   Bank Reference
//                 </label>
//                 <textarea
//                   className="uk-textarea uk-form-small"
//                   defaultValue="IJG Payments"
//                   rows={3}
//                   id="bankReference"
//                   maxLength={30}
//                   name={"bankReference"}
//                   onChange={(e) =>
//                     setClientWithdrawal({
//                       ...clientWithdrawal,
//                       reference: e.target.value,
//                     })
//                   }
//                   required
//                 />
//               </div>

//               {/* Client Email field */}
//               <div className="uk-width-1-2 uk-form-controls">
//                 <label className="uk-form-label" htmlFor="">
//                   Client Email
//                 </label>
//                 <input
//                   className="uk-textarea uk-form-small"
//                   defaultValue={selectedClient?.contactDetail.emailAddress}
//                   id="emailAddress"
//                   maxLength={30}
//                   name={"emailAddress"}
//                   onChange={(e) =>
//                     setClientWithdrawal({
//                       ...clientWithdrawal,
//                       email: e.target.value,
//                     })
//                   }
//                 />
//               </div>

//               {/* Instruction File Uploader */}
//               <div className="uk-width-1-1 uk-form-controls">
//                 <InstructionFileUploader
//                   onFileUpload={handleInstructionFileUpload}
//                   onProvideReason={handleReasonForNoAttachment}
//                   fileUrl={clientWithdrawal.instruction}
//                   reasonForNotProvingFile={
//                     clientWithdrawal.reasonForNoInstruction
//                   }
//                   label="Client Instruction"
//                   allocation={clientWithdrawal.allocation}
//                   onCancel={onCancel}
//                 />
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
//                   <button type="submit" className="btn btn-primary" disabled>
//                     Record
//                   </button>
//                 )}
//                 {availableBalance >= 0 && (
//                   <button
//                     type="submit"
//                     className="btn btn-primary"
//                     disabled={clientWithdrawal.amount === 0 || loading}>
//                     Record {loading && <div data-uk-spinner={"ratio:.5"}></div>}
//                   </button>
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

// export default NewRecurringWithdrawalModal;

import React from 'react'

const NewRecurringWithdrawalModal = () => {
  return (
    <div>
      
    </div>
  )
}

export default NewRecurringWithdrawalModal
