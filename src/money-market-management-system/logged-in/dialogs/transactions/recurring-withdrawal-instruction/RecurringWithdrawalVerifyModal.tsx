// import { observer } from "mobx-react-lite";
// import { FormEvent, useEffect, useState } from "react";

// import MODAL_NAMES from "../../ModalName";
// import DaySelector from "../../../../../shared/components/day-selector/DaySelector";
// import InstructionFileUploader from "../../../../../shared/components/instruction-file-upload/InstructionFileUploader";
// import SingleSelect from "../../../../../shared/components/single-select/SingleSelect";
// import { useAppContext } from "../../../../../shared/functions/Context";
// import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
// import { IMoneyMarketAccount } from "../../../../../shared/models/money-market-account/MoneyMarketAccount";
// import { INaturalPerson, defaultNaturalPerson } from "../../../../../shared/models/clients/NaturalPersonModel";
// import { IRecurringWithdrawalInstruction, defaultRecurringWithdrawalInstruction } from "../../../../../shared/models/recurring-withdrawal-instruction/RecurringWithdrawalInstructionModel";
// import swal from "sweetalert";

// interface ITransactionInstructionsProps {
//   client: INaturalPerson | undefined;
// }

// const RecurringWithdrawalVerifyModal = observer((props: ITransactionInstructionsProps) => {
//   const { api, store } = useAppContext();
//   const [recurringWithdrawal, setRecurringWithdrawal] = useState<IRecurringWithdrawalInstruction>({ ...defaultRecurringWithdrawalInstruction });
//   const [loading, setLoading] = useState(false);
//   const [selectedClient, setSelectedClient] = useState<INaturalPerson>({ ...defaultNaturalPerson });
//   const [selectedClientAccount, setSelectedClientAccount] = useState<IMoneyMarketAccount>();
//   const agents = store.agent.all;
//   const { client } = props;
//   const clientAccountOptions = store.mma.all.filter(
//     (mma) => mma.asJson.status === "Active" && mma.asJson.parentEntity === selectedClient.entityId).map((cli) => ({
//     label: cli.asJson.accountNumber,
//     value: cli.asJson.accountNumber,
//   }));
//   const bankAccounts = selectedClient.bankingDetail.map((acc) => ({
//     label: `${acc.bankName} | ${acc.accountNumber} | ${acc.accountHolder} | ${acc.branchNumber}`,
//     value: `${acc.bankName} | ${acc.accountNumber} | ${acc.accountHolder} | ${acc.branchNumber}`,
//   }));
//   const handleInstructionFileUpload = (url: string) => {
//     setRecurringWithdrawal((prevRecurringWithdrawal) => ({
//       ...prevRecurringWithdrawal,
//       instruction: url,
//     }));
//   };
//   //! Record modify , ammend
//   const [clientWithdrawal, setClientWithdrawal] = useState<IRecurringWithdrawalInstruction>({ ...defaultRecurringWithdrawalInstruction });
//   const handleClientAccountChange = (accountNumber: string) => {
//     const selectedAccount = store.mma.all.find(mma => mma.asJson.accountNumber === accountNumber);
//     if (selectedAccount) {
//       store.mma.select(selectedAccount.asJson);
//       const account = store.mma.selected;
//       if (account) {
//         setRecurringWithdrawal({
//           ...recurringWithdrawal,
//           allocation: account?.accountNumber,
//           bank: ""
//         });
//         setSelectedClientAccount(account);
//         return "";
//       }
//     }
//   };
//   const handleReasonForNoAttachment = (reason: string) => {
//     setRecurringWithdrawal((prevRecurringWithdrawal) => ({
//       ...prevRecurringWithdrawal,
//       reasonForNoInstruction: reason,
//     }));
//   };

//   const handleUseAgentChange = () => {
//     setRecurringWithdrawal((prev) => ({
//       ...prev,
//       useAgent: !prev.useAgent,
//       bank: "",
//     }));
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setRecurringWithdrawal((prevRecurringWithdrawal) => ({
//       ...prevRecurringWithdrawal,
//       [name]: value,
//       transactionStatus: "Pending",
//     }));
//   };

//   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setLoading(true);

//     const selected = store.recurringWithdrawalInstruction.selected;

//     if (selected) {
//       setRecurringWithdrawal((prevRecurringWithdrawal) => ({
//         ...prevRecurringWithdrawal,
//         transactionStatus: "Pending",
//       }));
//       await update(recurringWithdrawal);
//     } else {
//       setRecurringWithdrawal((prevRecurringWithdrawal) => ({
//         ...prevRecurringWithdrawal,
//         transactionStatus: "Verified",
//       }));
//       await create(recurringWithdrawal);
//     }

//     setLoading(false);
//     onCancel();
//     hideModalFromId(MODAL_NAMES.BACK_OFFICE.RECORD_RECURRING_EDIT_WITHDRAWAL_MODAL);
//   };

//   const handleDayChange = (selectedDay: string) => {
//     setRecurringWithdrawal({
//       ...recurringWithdrawal,
//       recurringDay: parseInt(selectedDay),
//     });
//   };
//   const agentsAccount = agents.map((acc) => ({
//     label: ` ${acc.asJson.agentName} - ${acc.asJson.bankName} (${acc.asJson.accountNumber}) `,
//     value: `${acc.asJson.bankName} | ${acc.asJson.agentName} | ${acc.asJson.accountNumber} | ${acc.asJson.branchCode}`,
//   }));
//   const onVerifyParty = async () => {

//     const selected = store.recurringWithdrawalInstruction.selected;
//     if(selected){
//       try {
//      await api.recurringWithdrawalInstruction.updateRecurringWithdrawalStatus(recurringWithdrawal, "Verified")
//         swal({
//           icon: "success",
//           text: "Recurring Withdrawal Verified",
//         });
//       } catch (error) {}
    
//     }
//     setLoading(false);
//       onCancel();
//       hideModalFromId(MODAL_NAMES.BACK_OFFICE.RECORD_RECURRING_EDIT_WITHDRAWAL_MODAL); 
//   };

//   const update = async (newRecurringWithdrawal: IRecurringWithdrawalInstruction) => {
//     try {
//       await api.recurringWithdrawalInstruction.update(newRecurringWithdrawal);
//     } catch (error) {}
//   };

//   const create = async (recurringWithdrawal: IRecurringWithdrawalInstruction) => {
//     try {
//       await api.recurringWithdrawalInstruction.create(recurringWithdrawal);
//     } catch (error) {}
//   };

//   const onCancel = () => {
//     store.recurringWithdrawalInstruction.clearSelected();
//     setRecurringWithdrawal({ ...defaultRecurringWithdrawalInstruction });
//     hideModalFromId(MODAL_NAMES.BACK_OFFICE.RECORD_RECURRING_EDIT_WITHDRAWAL_MODAL);
//   };

//   useEffect(() => {
//     if (client) {
//       const loadData = async () => {
//         setLoading(true);
//         await api.recurringWithdrawalInstruction.getAll();
//         setSelectedClient(client);
//         setLoading(false);
//       };
//       loadData();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [api.recurringWithdrawalInstruction]);

//   useEffect(() => {
//     if (store.recurringWithdrawalInstruction.selected) {
//       setRecurringWithdrawal(store.recurringWithdrawalInstruction.selected);
//     }
//   }, [store.recurringWithdrawalInstruction.selected]);

//   return (
//     <div className="custom-modal-style uk-modal-dialog uk-modal-body uk-margin-auto-vertical">
//       <button className="uk-modal-close-default" type="button" data-uk-close></button>
//       <h3 className="uk-modal-title text-to-break">
//         {store.recurringWithdrawalInstruction.selected ? recurringWithdrawal.entity : "Recurring Withdrawal"}
//       </h3>
//       <div className="dialog-content uk-position-relative">
//         <form className="uk-form-stacked uk-grid-small" data-uk-grid onSubmit={handleSubmit}>
//         <div className="uk-form-controls uk-width-1-2">
//                 <label className="uk-form-label required" htmlFor="">
//                   Account
//                 </label>
//                 <SingleSelect
//                   options={clientAccountOptions}
//                   name="selectedClient?.entityId"
//                   value={selectedClientAccount?.accountNumber}
//                   onChange={(value) => handleClientAccountChange(value)}
//                   placeholder="select client account"
//                   required
//                 />
//               </div>
//           <div className="uk-form-controls uk-width-1-2">
//             <label className="uk-form-label required" htmlFor="">
//               Recurring Day
//             </label>
//             <DaySelector onChange={handleDayChange} />
//           </div>
//           <div className="uk-form-controls uk-width-1-2">
//             <label className={`uk-form-label uk-display-block`}>
//               Do you wish to make the payment to an Agent?
//               <input
//                 className="uk-checkbox"
//                 type="checkbox"
//                 checked={recurringWithdrawal.useAgent}
//                 onChange={handleUseAgentChange}
//                 style={{ marginLeft: "10px" }}
//               />
//             </label>
//           </div>
//           {/* Render agent select if the checkbox is checked */}
//           {recurringWithdrawal.useAgent && (
//              <div className="uk-form-controls uk-width-1-2">
//              <label className="uk-form-label required" htmlFor="">
//                Agent Bank Account
//              </label>
//              <select
//                className="uk-select uk-form-small"
//                value={clientWithdrawal.bank}
//                id="clientAccount"
//                name={"clientAccount"}
//                onChange={(e) =>
//                  setClientWithdrawal({
//                    ...clientWithdrawal,
//                    bank: e.target.value,
//                  })
//                }
//                required
//              >
//                <option value="">
//                  Select agent...
//                </option>
//                {agentsAccount.map((acc) => (
//                  <option key={acc.value} value={acc.value}>
//                    {acc.label}
//                  </option>
//                ))}
//              </select>
//            </div>
//           )}
//           {/* Render client field only if the checkbox is not checked */}
//           {!recurringWithdrawal.useAgent && (
//             <div className="uk-form-controls uk-width-1-2">
//               <label className="uk-form-label required" htmlFor="clientAccount">
//                 Client Bank Account
//               </label>
//               <select
//                 className="uk-select uk-form-small"
//                 value={recurringWithdrawal.bank}
//                 id="clientAccount"
//                 name={"clientAccount"}
//                 onChange={(e) =>
//                   setRecurringWithdrawal({
//                     ...recurringWithdrawal,
//                     bank: e.target.value,
//                   })
//                 }
//                 required
//               >
//                 <option value="">
//                   Select...
//                 </option>
//                 {bankAccounts.map((acc: any) => (
//                   <option key={acc.value} value={acc.value}>
//                     {acc.label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           )}
//           <div className="uk-width-1-1">
//             <label className="uk-form-label" htmlFor="bankName-fname">
//               Bank Name
//             </label>
//             <div className="uk-form-controls">
//               <input
//                 className="uk-input uk-form-small"
//                 id="bankName-fname"
//                 type="text"
//                 placeholder="Issuer Name"
//                 name="bankName"
//                 value={recurringWithdrawal.bank}
//                 onChange={handleInputChange}
//                 required
//               />
//             </div>
//           </div>
//           <div className="uk-width-1-1">
//             <label className="uk-form-label" htmlFor="counterParty-accountNumber">
//               Account Number
//             </label>
//             <div className="uk-form-controls">
//               <input
//                 className="uk-input uk-form-small"
//                 id="counterParty-accountNumber"
//                 type="text"
//                 placeholder="Account Number"
//                 name="accountNumber"
//                 value={recurringWithdrawal.allocation}
//                 onChange={handleInputChange}
//                 required
//               />
//             </div>
//           </div>
//           <InstructionFileUploader
//             onFileUpload={handleInstructionFileUpload}
//             onProvideReason={handleReasonForNoAttachment}
//             fileUrl={recurringWithdrawal.instruction}
//             reasonForNotProvingFile={recurringWithdrawal.reasonForNoInstruction}
//             label="Instruction"
//             allocation={recurringWithdrawal.allocation}
//             onCancel={onCancel}
//           />
//           <div className="uk-width-1-1 uk-text-right">
//             <button className="btn btn-primary" onClick={onVerifyParty}>
//               Verify {loading && <div data-uk-spinner="ratio: .5"></div>}
//             </button>
//             {/* <>
//               <button className="btn btn-primary" type="submit" disabled={loading}>
//                 Save {loading && <div data-uk-spinner="ratio: .5"></div>}
//               </button>
//             </> */}
//             <button className="btn btn-danger" type="button" onClick={onCancel}>
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// });

// export default RecurringWithdrawalVerifyModal;

import React from 'react'

const RecurringWithdrawalVerifyModal = () => {
  return (
    <div>
      
    </div>
  )
}

export default RecurringWithdrawalVerifyModal

