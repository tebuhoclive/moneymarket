// import swal from "sweetalert";

// import MODAL_NAMES from "../../ModalName";
// import { useState, FormEvent, useEffect } from "react";

// import { observer } from "mobx-react-lite";
// import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";
// import { useAppContext } from "../../../../../shared/functions/Context";
// import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
// import { getMMAProduct } from "../../../../../shared/functions/MyFunctions";
// import { splitAndTrimString } from "../../../../../shared/functions/StringFunctions";
// import { IMoneyMarketAccount } from "../../../../../shared/models/money-market-account/MoneyMarketAccount";
// import { IWithdrawalTransaction, defaultWithdrawalTransaction } from "../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionModel";
// import { ILegalEntity } from "../../../../../shared/models/clients/LegalEntityModel";
// import { INaturalPerson } from "../../../../../shared/models/clients/NaturalPersonModel";


// const AmendRecurringWithdrawalModal = observer(() => {
//   const { api, store } = useAppContext();
//   const [loading, setLoading] = useState(false);
//   const [clientWithdrawal, setClientWithdrawal] =
//     useState<IWithdrawalTransaction>({ ...defaultWithdrawalTransaction });
//   const [selectedClientAccount, setSelectedClientAccount] =
//     useState<IMoneyMarketAccount>();
//   const [selectedClient, setSelectedClient] = useState<
//     INaturalPerson | ILegalEntity
//   >();
//   const [searchType, setSearchType] = useState("Account Number");

//   const [instructionFileURL, setInstructionFileURL] = useState("");
//   const [reasonForNoAttachment, setReasonForNoAttachment] = useState("");
//   const timeCreated = Date.now();
//   const formattedCreated = new Date(timeCreated).toUTCString();

//   const handleInstructionFileUpload = (url: string) => {
//     // Handle the URL in the parent component
//     setInstructionFileURL(url);
//   };

//   const handleReasonForNoAttachment = (reason: string) => {
//     // Handle the URL in the parent component
//     setReasonForNoAttachment(reason);
//   };

//   const clientAccount = store.mma.all;

//   const clients = [
//     ...store.client.naturalPerson.all,
//     ...store.client.legalEntity.all,
//   ];

//   const clientOptions = clients.map((cli) => ({
//     label: cli.asJson.entityDisplayName,
//     value: cli.asJson.entityId,
//   }));

//   const agents = store.agent.all;

//   const clientAccountOptions = store.mma.all
//     .filter((mma) => mma.asJson.status === "Active")
//     .map((cli) => ({
//       label: cli.asJson.accountNumber,
//       value: cli.asJson.accountNumber,
//     }));

//   const clientAccountOptionsAlt = store.mma.all.filter(
//     (mma) =>
//       mma.asJson.parentEntity === selectedClient?.entityId &&
//       mma.asJson.status === "Active"
//   );

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

//   const handleClientAccountChange = (accountNumber: string) => {
//     const selectedAccount = store.mma.all.find(
//       (mma) => mma.asJson.accountNumber === accountNumber
//     );
//     if (selectedAccount) {
//       store.mma.select(selectedAccount.asJson);
//       const account = store.mma.selected;
//       if (account) {
//         setClientWithdrawal({
//           ...clientWithdrawal,
//           allocation: account?.accountNumber,
//           bank: "",
//         });
//         setSelectedClientAccount(account);
//         const client = clients.find(
//           (client) => client.asJson.entityId === account.parentEntity
//         );
//         if (client) {
//           setSelectedClient(client.asJson);
//         }
//         return "";
//       }
//     }
//   };

//   const handleClientChange = (entityId: string) => {
//     const _selectedClient = clients.find(
//       (client) => client.asJson.entityId === entityId
//     );
//     if (_selectedClient) {
//       setSelectedClient(_selectedClient.asJson);
//       setSelectedClientAccount(undefined);
//     }
//   };

//   const handleUseAgentChange = () => {
//     setClientWithdrawal((prev) => ({
//       ...prev,
//       useAgent: !prev.useAgent,
//       bank: "",
//     }));
//   };

//   const handleChangeSearchType = (searchTYpe: string) => {
//     setSearchType(searchTYpe);
//     store.client.naturalPerson.clearSelected();
//     store.client.legalEntity.clearSelected();
//     store.mma.clearSelected();
//     setSelectedClient(undefined);
//     setSelectedClientAccount(undefined);
//     setClientWithdrawal({ ...defaultWithdrawalTransaction });
//   };

//   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     if (selectedClient && selectedClientAccount) {
//       e.preventDefault();

//       const saveTransaction: IWithdrawalTransaction = {
//         ...clientWithdrawal,
//         allocation: clientWithdrawal.allocation,
//         productCode: getMMAProduct(clientWithdrawal.allocation, store),
//         entity: selectedClient?.entityId,
//         amount: clientWithdrawal.amount,
//         bank: clientWithdrawal.bank,
//         reference: clientWithdrawal.reference || "IJG Payments",
//         email: clientWithdrawal.email || "",
//         valueDate: clientWithdrawal.valueDate || Date.now(),
//         transactionDate: Date.now(),
//         allocationStatus: "Awaiting Verification",
//         transactionStatus: "Pending",
//         transactionAction: "Amended",

//         instruction: reasonForNoAttachment ? "" : instructionFileURL,
//         reasonForNoInstruction: instructionFileURL ? "" : reasonForNoAttachment,
//         isRecurring: clientWithdrawal.isRecurring,
//         timeCreated: formattedCreated,
//         returnNote: "",
//       };

//       swal({
//         title: "Are you sure?",
//         icon: "warning",
//         buttons: ["Cancel", "Amend"],
//         dangerMode: true,
//       }).then(async (edit) => {
//         if (edit) {
//           setLoading(true);
//           try {
//             await update(saveTransaction);
//             swal({
//               icon: "success",
//               text: `Transaction has been amended `,
//             });
//           } catch (error) {
//             console.log(error);
//           }
//           setLoading(false);
//           onCancel();
//         } else {
//           swal({
//             icon: "error",
//             text: "Transaction cancelled!",
//           });
//           setLoading(false);
//         }
//         setLoading(false);
//       });
//     }
//   };

//   const update = async (transaction: IWithdrawalTransaction) => {
//     try {
//       await api.withdrawalTransaction.updateAndCreateAuditTrail(
//         clientWithdrawal,
//         transaction
//       );
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const onCancel = () => {
//     store.withdrawalTransaction.clearSelected();
//     store.withdrawalTransaction.clearSelected();

//     setInstructionFileURL("");
//     setReasonForNoAttachment("");

//     setSelectedClient(undefined);
//     setSelectedClientAccount(undefined);
//     setClientWithdrawal({ ...defaultWithdrawalTransaction });

//     hideModalFromId(MODAL_NAMES.BACK_OFFICE.WITHDRAWAL_AMEND_MODAL);
//   };

//   useEffect(() => {
//     if (store.withdrawalTransaction.selected) {
//       setClientWithdrawal(store.withdrawalTransaction.selected);
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
//   }, [store.withdrawalTransaction.selected]);

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
//           Amend Withdrawal Transaction
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

//           {/* <div className="dialog-content uk-position-relative uk-width-2-3">
//             <h4>Withdrawal Form</h4>
//             <form className="uk-grid" data-uk-grid onSubmit={handleSubmit}>
//               <div className="uk-form-controls uk-width-1-2">
//                 <label className="uk-form-label required" htmlFor="">
//                   Search Type
//                 </label>
//                 <select
//                   className="uk-select uk-form-small"
//                   defaultValue={searchType}
//                   id="clientAccount"
//                   name={"clientAccount"}
//                   onChange={(e) => handleChangeSearchType(e.target.value)}>
//                   <option value="">Select search type...</option>
//                   <option value="Account Number">Account Number</option>
//                   <option value="Client Name">Client Name</option>
//                 </select>
//               </div>
//               <div className="uk-form-controls uk-width-1-2">
//                 <label className="uk-form-label required" htmlFor="">
//                   Value Date
//                 </label>
//                 <input
//                   className="uk-input uk-form-small"
//                   id="valueDate"
//                   defaultValue={dateFormat_YY_MM_DD(Date.now())}
//                   type="date"
//                   name="valueDate"
//                   onChange={(e) =>
//                     setClientWithdrawal({
//                       ...clientWithdrawal,
//                       valueDate: e.target.valueAsNumber,
//                     })
//                   }
//                   required
//                 />
//               </div>

//               {searchType === "Client Name" && (
//                 <>
//                   <div className="uk-form-controls uk-width-1-2">
//                     <label className="uk-form-label required" htmlFor="">
//                       Client Name
//                     </label>
//                     <SingleSelect
//                       options={clientOptions}
//                       name="selectedClient?.entityId"
//                       value={selectedClient?.entityId}
//                       onChange={(value) => handleClientChange(value)}
//                       placeholder="e.g Client Name"
//                       required
//                     />
//                   </div>
//                   <div className="uk-form-controls uk-width-1-2">
//                     <label className="uk-form-label required" htmlFor="">
//                       Select Money Market Account
//                     </label>
//                     <select
//                       className="uk-select uk-form-small"
//                       defaultValue={"Select Account"}
//                       id="clientAccount"
//                       name={"clientAccount"}
//                       onChange={(e) =>
//                         handleClientAccountChange(e.target.value)
//                       }
//                       required>
//                       <option value={""}>Select...</option>
//                       {clientAccountOptionsAlt.map((acc) => (
//                         <option
//                           key={acc.asJson.id}
//                           value={acc.asJson.accountNumber}>
//                           {acc.asJson.accountNumber}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </>
//               )}

//               {searchType === "Account Number" && (
//                 <div className="uk-form-controls uk-width-1-2">
//                   <label className="uk-form-label required" htmlFor="">
//                     Search Money Market Account
//                   </label>
//                   <SingleSelect
//                     options={clientAccountOptions}
//                     name="selectedClient?.entityId"
//                     value={selectedClientAccount?.accountNumber}
//                     onChange={(value) => handleClientAccountChange(value)}
//                     placeholder="e.g Client Name"
//                     required
//                   />
//                 </div>
//               )}
//               {selectedClient && (
//                 <div className="uk-form-controls uk-width-1-2">
//                   <label className={`uk-form-label uk-display-block`}>
//                     Do you wish to make the payment to an Agent?
//                     <input
//                       className="uk-checkbox"
//                       type="checkbox"
//                       checked={clientWithdrawal.useAgent}
//                       onChange={handleUseAgentChange}
//                       style={{ marginLeft: "10px" }}
//                     />
//                   </label>
//                 </div>
//               )}
//               {selectedClient && !clientWithdrawal.useAgent && bankAccounts && (
//                 <div className="uk-form-controls uk-width-1-2">
//                   <label
//                     className="uk-form-label required"
//                     htmlFor="clientAccount">
//                     Client Bank Account
//                   </label>
//                   <select
//                     className="uk-select uk-form-small"
//                     value={clientWithdrawal.bank}
//                     id="clientAccount"
//                     name={"clientAccount"}
//                     onChange={(e) =>
//                       setClientWithdrawal({
//                         ...clientWithdrawal,
//                         bank: e.target.value,
//                       })
//                     }
//                     required>
//                     <option value="">Select...</option>
//                     {bankAccounts.map((acc: any) => (
//                       <option key={acc.value} value={acc.value}>
//                         {acc.label}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               )}
//               {selectedClient && clientWithdrawal.useAgent && agentsAccount && (
//                 <div className="uk-form-controls uk-width-1-2">
//                   <label className="uk-form-label required" htmlFor="">
//                     Agent Bank Account
//                   </label>
//                   <select
//                     className="uk-select uk-form-small"
//                     value={clientWithdrawal.bank}
//                     id="clientAccount"
//                     name={"clientAccount"}
//                     onChange={(e) =>
//                       setClientWithdrawal({
//                         ...clientWithdrawal,
//                         bank: e.target.value,
//                       })
//                     }
//                     required>
//                     <option value="">Select agent...</option>
//                     {agentsAccount.map((acc) => (
//                       <option key={acc.value} value={acc.value}>
//                         {acc.label}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               )}
//               {(selectedClient && clientWithdrawal.useAgent && !bankAccounts) ||
//               (selectedClient?.entityId &&
//                 !clientWithdrawal.useAgent &&
//                 !agentsAccount) ? (
//                 <div className="uk-width-1-2">
//                   No Bank account(s) have been loaded for{" "}
//                   {clientWithdrawal.useAgent
//                     ? "selected agent"
//                     : "selected client"}
//                 </div>
//               ) : (
//                 <></>
//               )}

//               <div className="uk-form-controls uk-width-1-2">
//                 <label className="uk-form-label required" htmlFor="">
//                   Amount
//                 </label>
//                 <NumberInput
//                   id="amount"
//                   className="auto-save uk-input purchase-input uk-form-small"
//                   placeholder="-"
//                   value={clientWithdrawal.amount}
//                   min={1}
//                   onChange={(value) =>
//                     setClientWithdrawal({
//                       ...clientWithdrawal,
//                       amount: Number(value),
//                     })
//                   }
//                 />
//               </div>

//               <div className="uk-form-controls uk-width-1-2">
//                 <label className="uk-form-label required" htmlFor="">
//                   Bank Reference
//                 </label>

//                 <textarea
//                   className="uk-textarea uk-form-small"
//                   defaultValue="IJG Payments"
//                   rows={3}
//                   id="amount"
//                   maxLength={30}
//                   name={"amount"}
//                   onChange={(e) =>
//                     setClientWithdrawal({
//                       ...clientWithdrawal,
//                       reference: e.target.value,
//                     })
//                   }
//                   required
//                 />
//               </div>
//               <div className="uk-form-controls uk-width-1-2">
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

//               <div className="uk-grid uk-grid-small uk-grid-match uk-child-width-1-1 uk-width-1-1">
//                 <div className="uk-width-1-2">
//                   <InstructionFileUploader
//                     onFileUpload={handleInstructionFileUpload}
//                     onProvideReason={handleReasonForNoAttachment}
//                     fileUrl={clientWithdrawal.instruction}
//                     reasonForNotProvingFile={
//                       clientWithdrawal.reasonForNoInstruction
//                     }
//                     label="Client Instruction"
//                     allocation={clientWithdrawal.allocation}
//                     onCancel={onCancel}
//                   />
//                 </div>
//               </div>

//               {!clientWithdrawal.bank && <div className="uk-width-1-2"></div>}
//               <hr className="uk-width-1-1" />
//               <div className="uk-form-controls uk-width-1-1">
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
//                     Amend
//                   </button>
//                 )}
//                 {availableBalance >= 0 && (
//                   <>
//                     <button
//                       type="submit"
//                       className="btn btn-primary"
//                       disabled={clientWithdrawal.amount === 0 || loading}>
//                       Amend{" "}
//                       {loading && <div data-uk-spinner={"ratio:.5"}></div>}
//                     </button>
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
//           </div> */}
          
//         </div>
//       </div>
//     </ErrorBoundary>
//   );
// });

// export default AmendRecurringWithdrawalModal;

import React from 'react'

const AmendRecurringWithdrawalModal = () => {
  return (
    <div>
      
    </div>
  )
}

export default AmendRecurringWithdrawalModal
