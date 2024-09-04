// import { FormEvent, SetStateAction, useEffect, useState } from "react";

// import MODAL_NAMES from "../../ModalName";

// import { observer } from "mobx-react-lite";

// import swal from "sweetalert";

// import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";
// import InstructionFileUploader from "../../../../../shared/components/instruction-file-upload/InstructionFileUploader";
// import SingleSelect from "../../../../../shared/components/single-select/SingleSelect";
// import { useAppContext } from "../../../../../shared/functions/Context";
// import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
// import Select from "react-select";
// import { splitAndTrimString } from "../../../../../shared/functions/StringFunctions";
// import { IMoneyMarketAccount } from "../../../../../shared/models/money-market-account/MoneyMarketAccount";
// import {
//   ISwitchAudit,
//   defaultSwitchAudit,
// } from "../../../../../shared/models/SwitchAuditModel";
// import { ISwitchTransaction } from "../../../../../shared/models/SwitchTransactionModel";
// import {
//   IDepositTransaction,
//   defaultDepositTransaction,
// } from "../../../../../shared/models/deposit-transaction/DepositTransactionModel";
// import {
//   IWithdrawalTransaction,
//   defaultWithdrawalTransaction,
// } from "../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionModel";
// import { dateFormat_YY_MM_DD } from "../../../../../shared/utils/utils";
// import NumberInput from "../../../shared/components/number-input/NumberInput";
// import { VerifyUploadComponent } from "../../../../../shared/components/instruction-file-upload/edit-upload-component/VerifyComponent";
// import { INaturalPerson } from "../../../../../shared/models/clients/NaturalPersonModel";
// import { ILegalEntity } from "../../../../../shared/models/clients/LegalEntityModel";
// import { SwitchAuditTrailGrid } from "../../../system-modules/money-market-transactions-module/switch-between-accounts/SwitchAuditTrailGrid";
// import { LoadingEllipsis } from "../../../../../shared/components/loading/Loading";
// import FormattedNumberInput from "../../../../../shared/functions/FormattedNumberInput";


// interface IProps {
//   setVisible: (show: boolean) => void;
// }

// const AmendSwitchModal = observer(({setVisible}:IProps) => {
//   const { api, store } = useAppContext();
//   const [loading, setLoading] = useState<boolean>(false);
//   const [loadingSave, setLoadingSave] = useState<boolean>(false);
//   const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);

//   const switchTransaction = store.switch.selected;
//   const auditTrail = store.switchAudit.all;
//   const moneyMarketAccounts = store.mma.all;


//   const [clientName, setClientName] = useState("");
//   const [clientNameTo, setClientNameTo] = useState("");
//   const clients = [
//     ...store.client.naturalPerson.all,
//     ...store.client.legalEntity.all,
//   ];

//   const [willSwitchClient, setWillSwitchClient] = useState(false);

//   const timeAuthorized = Date.now();
//   const formattedTime = new Date(timeAuthorized).toUTCString();
//   const [selectedClient, setSelectedClient] = useState<
//     INaturalPerson | ILegalEntity | null
//   >();
//   const [selectedClientTo, setSelectedClientTo] = useState<
//     INaturalPerson | ILegalEntity | null
//   >();

//   const [clientAccountOptions, setClientAccountOptions] = useState<
//     IMoneyMarketAccount[]
//   >([]);
//   const [clientAccountOptionsTo, setClientAccountOptionsTo] = useState<
//     IMoneyMarketAccount[]
//   >([]);

//   const [moneyMarketAccountDeposit, setMoneyMarketAccountDeposit] =
//     useState<IDepositTransaction>({ ...defaultDepositTransaction });
//   const [moneyMarketAccountWithdrawal, setMoneyMarketAccountWithdrawal] =
//     useState<IWithdrawalTransaction>({ ...defaultWithdrawalTransaction });

//   const [switchAmount, setSwitchAmount] = useState<number>(0);
//   console.log("🚀 ~ AmendSwitchModal ~ switchAmount:", switchAmount)


//   let newFromAccount = moneyMarketAccounts.find(
//     (account) =>
//       account.asJson.accountNumber === moneyMarketAccountWithdrawal.accountNumber
//   );

//   let newToAccount = moneyMarketAccounts.find(
//     (account) =>
//       account.asJson.accountNumber === moneyMarketAccountDeposit.accountNumber
//   );

//   let fromAccount = moneyMarketAccounts.find(
//     (account) => account.asJson.accountNumber === switchTransaction?.fromAccount
//   );

//   let toAccount = moneyMarketAccounts.find(
//     (account) => account.asJson.accountNumber === switchTransaction?.toAccount
//   );

//   const switchAudit = auditTrail
//     .sort((a, b) => {
//       const dateA = new Date(a.asJson.auditDateTime || 0);
//       const dateB = new Date(b.asJson.auditDateTime || 0);

//       return dateB.getTime() - dateA.getTime();
//     })
//     .map((c) => {
//       return c.asJson;
//     });

//   // const clientOptions = clients
//   //   .filter(cli => {
//   //     // Filter out clients with only one money market account
//   //     const clientMMAs = moneyMarketAccounts.filter(
//   //       mma => mma.asJson.parentEntity === cli.asJson.entityId
//   //     );
//   //     return clientMMAs.length > 1;
//   //   })
//   //   .map(cli => ({
//   //     label: `${cli.asJson.entityDisplayName} (${cli.asJson.entityId})`,
//   //     value: cli.asJson.entityId,
//   //   }))
//   //   .sort((a, b) => {
//   //     const nameA = a.label;
//   //     const nameB = b.label;
//   //     return nameA.localeCompare(nameB);
//   //   });

//   const clientOptions = clients
//     .map((cli) => ({
//       label: `${cli.asJson.entityDisplayName} (${cli.asJson.entityId})`,
//       value: cli.asJson.entityId,
//     }))
//     .sort((a, b) => {
//       const nameA = a.label;
//       const nameB = b.label;
//       return nameA.localeCompare(nameB);
//     });
//   const clientOptionsTo = clients
//     .map((cli) => ({
//       label: `${cli.asJson.entityDisplayName} (${cli.asJson.entityId})`,
//       value: cli.asJson.entityId,
//     }))
//     .sort((a, b) => {
//       const nameA = a.label;
//       const nameB = b.label;
//       return nameA.localeCompare(nameB);
//     });

//   const handleClientChange = (clientName: string) => {
//     // setMoneyMarketAccountDeposit({ ...defaultDepositTransaction });
//     setMoneyMarketAccountWithdrawal({ ...defaultWithdrawalTransaction });
//     setClientAccountOptions([]);
//     toAccount = undefined;
//     fromAccount = undefined;

//     setClientName(clientName);

//     const _selectedClient = clients.find(
//       (client) => client.asJson.entityId === clientName
//     );

//     if (_selectedClient) {
//       setSelectedClient(_selectedClient.asJson);
//     }

//     const _clientAccountOptions = moneyMarketAccounts
//       .filter((mma) => mma.asJson.parentEntity === clientName)
//       .map((mma) => {
//         return mma.asJson;
//       });

//     if (_clientAccountOptions) {
//       setClientAccountOptions(_clientAccountOptions);
//     }
//   };


//   const handleClientChangeTo = (clientName: string) => {
//     // setMoneyMarketAccountDeposit({ ...defaultDepositTransaction });
//     // setMoneyMarketAccountWithdrawal({ ...defaultWithdrawalTransaction });
//     setClientAccountOptionsTo([]);
//     toAccount = undefined;
//     fromAccount = undefined;

//     setClientNameTo(clientName);

//     const _selectedClient = clients.find(
//       (client) => client.asJson.entityId === clientName
//     );

//     if (_selectedClient) {
//       setSelectedClientTo(_selectedClient.asJson);
//     }

//     const _clientAccountOptions = moneyMarketAccounts
//       .filter((mma) => mma.asJson.parentEntity === clientName)
//       .map((mma) => {
//         return mma.asJson;
//       });

//     if (_clientAccountOptions) {
//       setClientAccountOptionsTo(_clientAccountOptions);
//     }
//   };


//   const handleFromAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     // setMoneyMarketAccountDeposit({ ...defaultDepositTransaction });
//     // setMoneyMarketAccountWithdrawal({ ...defaultWithdrawalTransaction });
//     const selectedValue = e.target.value;

//     // if (selectedValue === moneyMarketAccountDeposit.accountNumber) {
//     //   setMoneyMarketAccountDeposit({ ...defaultDepositTransaction });
//     // }

//     setMoneyMarketAccountWithdrawal({
//       ...moneyMarketAccountWithdrawal,
//       accountNumber: selectedValue,
//     });
//   };
//   const handleFromAccountChangeTo = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     // setMoneyMarketAccountDeposit({ ...defaultDepositTransaction });
//     setMoneyMarketAccountDeposit({ ...defaultDepositTransaction });
//     const selectedValue = e.target.value;

//     // if (selectedValue === moneyMarketAccountDeposit.accountNumber) {
//     //   setMoneyMarketAccountDeposit({ ...defaultDepositTransaction });
//     // }

//     setMoneyMarketAccountDeposit({
//       ...moneyMarketAccountDeposit,
//       accountNumber: selectedValue,
//     });
//   };

//   const handleUpdateSwitchTransaction = () => {
//     swal({
//       title: "Are you sure?",
//       icon: "warning",
//       text: "You are about to save changes made on this transaction",
//       buttons: ["Cancel", "Save"],
//       dangerMode: true,
//     }).then(async (edit) => {

//       if (edit) {
//         setLoadingSave(true);
//         const withDrawFromAccount = moneyMarketAccounts.find(
//           (account) =>
//             account.asJson.accountNumber ===
//             moneyMarketAccountWithdrawal.accountNumber
//         );
//         const depositToAccount = moneyMarketAccounts.find(
//           (account) =>
//             account.asJson.accountNumber ===
//             moneyMarketAccountDeposit.accountNumber
//         );

//         if (switchTransaction) {
//           const _switchTransaction: ISwitchTransaction = {
//             ...switchTransaction,
//             // switchDate: Date.now(),
//             fromAccount:
//               moneyMarketAccountWithdrawal.accountNumber ||
//               switchTransaction?.fromAccount,
//             // fromProductCode: getMMAProduct(moneyMarketAccountWithdrawal.accountNumber, store),
//             toAccount:
//               moneyMarketAccountDeposit.accountNumber ||
//               switchTransaction?.toAccount,
//             // toProductCode: getMMAProduct(moneyMarketAccountDeposit.accountNumber, store),
//             amount: switchAmount,
//             executionTime: formattedTime,
//             switchStatus: "Pending",
//             switchAction: "Amended",
//             timeTransactionQueue: Date.now(),
//             instruction: moneyMarketAccountDeposit.instruction,
//             reasonForNoInstruction:
//               moneyMarketAccountDeposit.reasonForNoInstruction,
//           };

//           try {
//             console.log("Switches new", _switchTransaction);
//             console.log("Switches", switchTransaction);
//             await api.switch.updateAndCreateAuditTrail(
//               switchTransaction,
//               _switchTransaction
//             );
//           } catch (error) {
//             console.log(error);
//           }
//         }

//         swal({
//           icon: "success",
//           text: "Switch amended",
//         });
//         onCancel();
//       }
//     });
//     setLoadingSave(false);
//   };
//   const handleUpdateSwitchTransactionSave = (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     swal({
//       title: "Are you sure?",
//       icon: "warning",
//       text: "You are about to submit the changes made on this transaction for first level approval",
//       buttons: ["Cancel", "Submit"],
//       dangerMode: true,
//     }).then(async (edit) => {

//       if (edit) {
//         setLoadingSubmit(true);
//         const withDrawFromAccount = moneyMarketAccounts.find(
//           (account) =>
//             account.asJson.accountNumber ===
//             moneyMarketAccountWithdrawal.accountNumber
//         );
//         const depositToAccount = moneyMarketAccounts.find(
//           (account) =>
//             account.asJson.accountNumber ===
//             moneyMarketAccountDeposit.accountNumber
//         );

//         if (switchTransaction) {
//           const _switchTransaction: ISwitchTransaction = {
//             ...switchTransaction,
//             // switchDate: Date.now(),
//             fromAccount:
//               moneyMarketAccountWithdrawal.accountNumber ||
//               switchTransaction?.fromAccount,
//             // fromProductCode: getMMAProduct(moneyMarketAccountWithdrawal.accountNumber, store),
//             toAccount:
//               moneyMarketAccountDeposit.accountNumber ||
//               switchTransaction?.toAccount,
//             // toProductCode: getMMAProduct(moneyMarketAccountDeposit.accountNumber, store),
//             amount: switchAmount,
//             executionTime: formattedTime,
//             switchStatus: "Pending",
//             switchAction: "Amended",
//             timeFirstLevel: Date.now(),
//             instruction: moneyMarketAccountDeposit.instruction,
//             reasonForNoInstruction:
//               moneyMarketAccountDeposit.reasonForNoInstruction,
//           };

//           try {
//             console.log("Switches new", _switchTransaction);
//             console.log("Switches", switchTransaction);
//             await api.switch.updateAndCreateAuditTrail(
//               switchTransaction,
//               _switchTransaction
//             );
//           } catch (error) {
//             console.log(error);
//           }
//         }

//         swal({
//           icon: "success",
//           text: "Switch amended",
//         });
//         onCancel();
//       }
//     });
//     setLoadingSubmit(false);
//   };

//   // const onCancel = () => {
//   //   hideModalFromId(MODAL_NAMES.BACK_OFFICE.AMEND_SWITCH_MODAL);
//   //   setLoading(false);
//   // };
//   const onCancel = () => {
//     store.switch.clearSelected();
//     hideModalFromId(MODAL_NAMES.BACK_OFFICE.AMEND_SWITCH_MODAL);
//     setLoading(false);
//     setLoadingSubmit(false);
//     setLoadingSave(false);
//     setSelectedClientTo(null);
//     setSelectedClient(null);
//     setMoneyMarketAccountDeposit({ ...defaultDepositTransaction });
//     setMoneyMarketAccountWithdrawal({ ...defaultWithdrawalTransaction });
//     setWillSwitchClient(false);
//     setVisible(false);
//   };

//   useEffect(() => {
//     const loadData = async () => {
//       if (switchTransaction && switchTransaction?.id) {
//         try {
//           await Promise.all([
//             api.switchAudit.getAll(switchTransaction.id),
//             // Add more async operations here if needed
//           ]);
//         } catch (error) {
//           console.error("Error loading data:", error);
//           // Handle errors if necessary
//         }
//       }
//     };
//     loadData();
//   }, [api.switchAudit, switchTransaction]);

//   useEffect(() => {

//     if (store.switch.selected) {
//       const switchTransaction = store.switch.selected;
//       setSwitchAmount(switchTransaction.amount)
//     } else {

//     }
//   }, [store.switch.selected])

//   const handleAmountChange = (newAmount: number) => {
//     setMoneyMarketAccountDeposit({
//       ...moneyMarketAccountDeposit,
//       amount: newAmount,
//     });
//     setSwitchAmount(newAmount);
//   };

//   return (
//     <ErrorBoundary>
//       <div className="view-modal custom-modal-style uk-modal-dialog uk-modal-body uk-width-4-5">
//         <button
//           className="uk-modal-close-default"
//           onClick={onCancel}
//           type="button"
//           data-uk-close></button>
//         <h3 className="main-title-md text-to-break">Switch Transaction</h3>
//         <hr />
//         <div className="uk-grid uk-grid-small" data-uk-grid>
//           <div className="dialog-content uk-position-relative uk-width-1-3">
//             <h4 className="main-title-sm">Switch Transaction Details</h4>
//             <div className="uk-grid uk-grid-small" data-uk-grid>
//               <div className="uk-width-1-3">
//                 <p>Transaction Date</p>
//               </div>
//               <div className="uk-width-2-3">
//                 <p>
//                   {dateFormat_YY_MM_DD(
//                     switchTransaction?.switchDate || Date.now()
//                   )}
//                 </p>
//               </div>
//               <div className="uk-width-1-3">
//                 <p>From Account</p>
//               </div>
//               <div className="uk-width-2-3">
//                 <p>{switchTransaction?.fromAccount}</p>
//               </div>
//               <div className="uk-width-1-3">
//                 <p>To Account</p>
//               </div>
//               <div className="uk-width-2-3">
//                 <p>{switchTransaction?.toAccount}</p>
//               </div>
//               <div className="uk-width-1-3">
//                 <p>Amount</p>
//               </div>
//               <div className="uk-width-2-3">
//                 <p>{(switchTransaction?.amount || 0)}</p>
//               </div>
//             </div>
//             <div className="uk-grid uk-grid-small uk-width-1-1">
//               {fromAccount && (
//                 <div className="uk-margin-top">
//                   <h4 className="main-title-sm">Switch-From Account Information</h4>
//                   <div className="uk-grid uk-grid-small" data-uk-grid>
//                     <div className="uk-width-1-3">
//                       <p>Account Number</p>
//                     </div>
//                     <div className="uk-width-2-3">
//                       <p>{fromAccount.asJson.accountNumber}</p>
//                     </div>

//                     <div className="uk-width-1-3">
//                       <p>Account Name</p>
//                     </div>
//                     <div className="uk-width-2-3">
//                       <p>{fromAccount.asJson.accountName}</p>
//                     </div>

//                     <div className="uk-width-1-3">
//                       <p>Product Code</p>
//                     </div>
//                     <div className="uk-width-2-3">
//                       <p>
//                         {
//                           splitAndTrimString(
//                             "-",
//                             fromAccount.asJson.accountType
//                           )[2]
//                         }
//                       </p>
//                     </div>

//                     <div className="uk-width-1-3">
//                       <p>Fee Rate</p>
//                     </div>
//                     <div className="uk-width-2-3">
//                       <p>{fromAccount.asJson.feeRate}</p>
//                     </div>

//                     <div className="uk-width-1-3">
//                       <p>Cession</p>
//                     </div>
//                     <div className="uk-width-2-3">
//                       <p>
//                         {(fromAccount.asJson.cession)}
//                       </p>
//                     </div>

//                     <div className="uk-width-1-3">
//                       <p>Balance</p>
//                     </div>
//                     <div className="uk-width-2-3">
//                       <p>
//                         {(fromAccount.asJson.balance)}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )}
//               {toAccount && (
//                 <div className="uk-margin-top">
//                   <h4 className="main-title-sm">Switch-To Account Information</h4>
//                   <div className="uk-grid uk-grid-small" data-uk-grid>
//                     <div className="uk-width-1-3">
//                       <p>Account Number</p>
//                     </div>
//                     <div className="uk-width-2-3">
//                       <p>{toAccount.asJson.accountNumber}</p>
//                     </div>

//                     <div className="uk-width-1-3">
//                       <p>Account Name</p>
//                     </div>
//                     <div className="uk-width-2-3">
//                       <p>{toAccount.asJson.accountName}</p>
//                     </div>

//                     <div className="uk-width-1-3">
//                       <p>Product Code</p>
//                     </div>
//                     <div className="uk-width-2-3">
//                       <p>
//                         {
//                           splitAndTrimString(
//                             "-",
//                             toAccount.asJson.accountType
//                           )[2]
//                         }
//                       </p>
//                     </div>

//                     <div className="uk-width-1-3">
//                       <p>Fee Rate</p>
//                     </div>
//                     <div className="uk-width-2-3">
//                       <p>{toAccount.asJson.feeRate}</p>
//                     </div>

//                     <div className="uk-width-1-3">
//                       <p>Cession</p>
//                     </div>
//                     <div className="uk-width-2-3">
//                       <p>{(toAccount.asJson.cession)}</p>
//                     </div>

//                     <div className="uk-width-1-3">
//                       <p>Balance</p>
//                     </div>
//                     <div className="uk-width-2-3">
//                       <p>{(toAccount.asJson.balance)}</p>
//                     </div>


//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//           <div className="dialog-content uk-position-relative uk-width-2-3">
//             {!willSwitchClient &&
//               <>
//                 <h4 className="main-title-sm">
//                   Transaction Audit Trail
//                 </h4>
//                 {!loading && (
//                   <SwitchAuditTrailGrid
//                     data={switchAudit} displayDetails={function (value: SetStateAction<boolean>): void {
//                       throw new Error("Function not implemented.");
//                     }} setSelectedAudit={function (value: SetStateAction<ISwitchAudit>): void {
//                       throw new Error("Function not implemented.");
//                     }}
//                   />
//                 )}
//                 {loading && <LoadingEllipsis />}
//               </>
//             }

//             <form
//               className="uk-grid uk-grid-small uk-margin-top"
//               data-uk-grid
//               onSubmit={handleUpdateSwitchTransactionSave}>
//               <h4 className="main-title-sm uk-width-1-1">Switch Amendment Form</h4>

//               <div className="uk-form-controls uk-width-1-2">
//                 <label
//                   className={`uk-form-label uk-display-block`}
//                 >
//                   Do you wish to change the Client/Client Account as well?
//                   <input
//                     className="uk-checkbox"
//                     type="checkbox"
//                     checked={willSwitchClient}
//                     onChange={(e) => setWillSwitchClient(e.target.checked)}
//                     style={{ marginLeft: '10px' }}
//                   />
//                 </label>
//               </div>
//               <div className="uk-width-1-2">

//               </div>


//               {willSwitchClient && (
//                 <>
//                   <div className="uk-form-controls uk-width-1-2">
//                     <label className="uk-form-label required" htmlFor="">
//                       Entity From
//                     </label>
//                     {/* <SingleSelect
//                         options={clientOptions}
//                         name="clientName"
//                         value={clientName}
//                         onChange={(value) => handleClientChange(value)}
//                         placeholder="e.g Client Name"
//                         required
//                         isClearable
//                       /> */}
//                     <Select
//                       id="clientSelect"
//                       options={clientOptions} // Cast to any to resolve the type error
//                       onChange={(selectedOption) => {
//                         if (selectedOption?.value) {
//                           // Check for entityId property
//                           handleClientChange(selectedOption.value);
//                         }
//                       }}
//                       value={
//                         selectedClient
//                           ? {
//                             label: selectedClient.entityDisplayName,
//                             value: selectedClient.entityId,
//                           }
//                           : null
//                       }
//                       placeholder="Select a client"
//                       isSearchable // This makes the Select component searchable
//                       filterOption={(option, searchText) => {
//                         if (!searchText) return true; // If search text is empty, show all options
//                         return option.label
//                           .toLowerCase()
//                           .trim()
//                           .startsWith(searchText.toLowerCase().trim());
//                       }}
//                     />
//                   </div>
//                   <div className="uk-form-controls uk-width-1-2">
//                     <label className="uk-form-label required" htmlFor="">
//                       Entity To
//                     </label>
//                     {/* <SingleSelect
//                         options={clientOptionsTo}
//                         name="clientName"
//                         value={clientNameTo}
//                         onChange={(value) => handleClientChangeTo(value)}
//                         placeholder="e.g Client Name"
//                         required
//                         isClearable
//                       /> */}
//                     <Select
//                       id="clientSelect"
//                       options={clientOptionsTo} // Cast to any to resolve the type error
//                       onChange={(selectedOption) => {
//                         if (selectedOption?.value) {
//                           // Check for entityId property
//                           handleClientChangeTo(selectedOption.value);
//                         }
//                       }}
//                       value={
//                         selectedClientTo
//                           ? {
//                             label: selectedClientTo.entityDisplayName,
//                             value: selectedClientTo.entityId,
//                           }
//                           : null
//                       }
//                       placeholder="Select a client"
//                       isSearchable // This makes the Select component searchable
//                       filterOption={(option, searchText) => {
//                         if (!searchText) return true; // If search text is empty, show all options
//                         return option.label
//                           .toLowerCase()
//                           .trim()
//                           .startsWith(searchText.toLowerCase().trim());
//                       }}
//                     />
//                   </div>
//                   {clientAccountOptions && (
//                     <>
//                       <div className="uk-form-controls uk-width-1-2">
//                         <label className="uk-form-label required" htmlFor="">
//                           From Account
//                         </label>
//                         <select
//                           className="uk-select uk-form-small"
//                           value={moneyMarketAccountWithdrawal.accountNumber}
//                           id="clientAccount"
//                           name={"clientAccount"}
//                           onChange={handleFromAccountChange}
//                           required>
//                           <option value={""} disabled>
//                             Select...
//                           </option>
//                           {clientAccountOptions &&
//                             clientAccountOptions.map((acc, index) => (
//                               <option key={acc.id} value={acc.accountNumber}>
//                                 {acc.accountNumber}
//                               </option>
//                             ))}
//                         </select>
//                       </div>
//                       <div className="uk-form-controls uk-width-1-2">
//                         <label className="uk-form-label required" htmlFor="">
//                           To Account
//                         </label>
//                         <select
//                           className="uk-select uk-form-small"
//                           value={moneyMarketAccountDeposit.accountNumber}
//                           id="clientAccountTo"
//                           name={"clientAccountTo"}
//                           onChange={handleFromAccountChangeTo}
//                           required>
//                           <option value={""} disabled>
//                             Select...
//                           </option>
//                           {clientAccountOptionsTo
//                             .map((acc) => (
//                               <option key={acc.id} value={acc.accountNumber}>
//                                 {acc.accountNumber}
//                               </option>
//                             ))}
//                         </select>
//                       </div>
//                     </>
//                   )}
//                   <div className="uk-width-1-2">
//                     {newFromAccount && (
//                       <div className="uk-card">
//                         <div className="uk-card-body">
//                           <h4 className="uk-width-1-1">
//                             Switch-From Account Information
//                           </h4>
//                           <div className="uk-grid uk-grid-small">
//                             <div className="uk-width-1-3">
//                               <p>Account Number</p>
//                             </div>
//                             <div className="uk-width-2-3">
//                               <p>{newFromAccount.asJson.accountNumber}</p>
//                             </div>

//                             <div className="uk-width-1-3">
//                               <p>Account Name</p>
//                             </div>
//                             <div className="uk-width-2-3">
//                               <p>{newFromAccount.asJson.accountName}</p>
//                             </div>

//                             <div className="uk-width-1-3">
//                               <p>Account Type</p>
//                             </div>
//                             <div className="uk-width-2-3">
//                               <p>{newFromAccount.asJson.accountType}</p>
//                             </div>

//                             <div className="uk-width-1-3">
//                               <p>Fee Rate</p>
//                             </div>
//                             <div className="uk-width-2-3">
//                               <p>{newFromAccount.asJson.feeRate}</p>
//                             </div>

//                             <div className="uk-width-1-3">
//                               <p>Cession</p>
//                             </div>
//                             <div className="uk-width-2-3">
//                               <p>
//                                 {(
//                                   newFromAccount.asJson.cession
//                                 )}
//                               </p>
//                             </div>

//                             <div className="uk-width-1-3">
//                               <p>Balance</p>
//                             </div>
//                             <div className="uk-width-2-3">
//                               <p>
//                                 {(
//                                   newFromAccount.asJson.balance
//                                 )}
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                   <div className="uk-width-1-2">

//                     {newToAccount && (
//                       <div className="uk-card">
//                         <div className="uk-card-body">
//                           <h4 className="main-title-sm">Switch-To Account Information</h4>
//                           <div className="uk-grid uk-grid-small">
//                             <div className="uk-width-1-3">
//                               <p>Account Number</p>
//                             </div>
//                             <div className="uk-width-2-3">
//                               <p>{newToAccount.asJson.accountNumber}</p>
//                             </div>

//                             <div className="uk-width-1-3">
//                               <p>Account Name</p>
//                             </div>
//                             <div className="uk-width-2-3">
//                               <p>{newToAccount.asJson.accountName}</p>
//                             </div>

//                             <div className="uk-width-1-3">
//                               <p>Account Type</p>
//                             </div>
//                             <div className="uk-width-2-3">
//                               <p>{newToAccount.asJson.accountType}</p>
//                             </div>

//                             <div className="uk-width-1-3">
//                               <p>Fee Rate</p>
//                             </div>
//                             <div className="uk-width-2-3">
//                               <p>{newToAccount.asJson.feeRate}</p>
//                             </div>

//                             <div className="uk-width-1-3">
//                               <p>Cession</p>
//                             </div>
//                             <div className="uk-width-2-3">
//                               <p>
//                                 {(newToAccount.asJson.cession)}
//                               </p>
//                             </div>

//                             <div className="uk-width-1-3">
//                               <p>Balance</p>
//                             </div>
//                             <div className="uk-width-2-3">
//                               <p>
//                                 {(newToAccount.asJson.balance)}
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </>
//               )}

//               <div className="uk-form-controls uk-width-1-2">
//                 <label className="uk-form-label required" htmlFor="">
//                   Amount
//                 </label>
//                 {/* <NumberInput
//                   className="uk-input uk-form-small"
//                   onChange={(value) => {
//                     setMoneyMarketAccountDeposit({
//                       ...moneyMarketAccountDeposit,
//                       amount: Number(value),
//                     });
//                     setSwitchAmount(Number(value));
//                   }}
//                   max={newFromAccount?.asJson.balance}
//                   value={Number(switchTransaction?.amount || "")}
//                 /> */}
//                 <FormattedNumberInput
//                   amount={switchAmount}
//                   onAmountChange={handleAmountChange}
//                 />
//               </div>

//               <div className="uk-width-1-2"></div>

//               <div className="uk-grid uk-grid-small" data-uk-grid>

//                 <div className="uk-width-1-2">
//                   <VerifyUploadComponent
//                     onFileUpload={(fileUrl) => {
//                       // Update switchTransaction or perform other actions with fileUrl
//                       setMoneyMarketAccountDeposit((prev) => ({
//                         ...prev,
//                         instruction: fileUrl || "",
//                       }));
//                     }}
//                     onProvideReason={(reason) => {
//                       // Update switchTransaction or perform other actions with reason
//                       setMoneyMarketAccountDeposit((prev) => ({
//                         ...prev,
//                         reasonForNoInstruction: reason || "",
//                       }));
//                     }}
//                     fileUrl={switchTransaction?.instruction || ""}
//                     reasonForNotProvingFile={
//                       switchTransaction?.reasonForNoInstruction || ""
//                     }
//                     label="Client Instruction"
//                     accountNumber={switchTransaction?.fromAccount || ""}
//                   />
//                 </div>
//                 <div className="uk-width-1-2 uk-margin-top">
//                   {switchTransaction?.returnNote && (
//                     <div className="uk-form-controls">
//                       <label className="uk-form-label">Return Note</label>
//                       <textarea
//                         defaultValue={switchTransaction?.returnNote}
//                         className="uk-textarea uk-form-small"
//                         disabled></textarea>
//                     </div>
//                   )}
//                 </div>
//               </div>


//               <hr className="uk-width-1-1 uk-margin-top" />
//               <div className="uk-form-controls">

//                 <button
//                   type="button"
//                   className="btn btn-danger"
//                   onClick={onCancel}
//                   disabled={loading || loadingSave || loadingSubmit}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   className="btn btn-primary"
//                   type="button"
//                   onClick={handleUpdateSwitchTransaction}
//                   disabled={loading || loadingSave || loadingSubmit}
//                 >
//                   Save Changes
//                   {loadingSave && <div data-uk-spinner={"ratio:.5"}></div>}
//                 </button>
//                 <button
//                   className="btn btn-primary"
//                   type="submit"
//                   disabled={loading || loadingSave || loadingSubmit}
//                 >
//                   Submit Changes
//                   {loadingSubmit && <div data-uk-spinner={"ratio:.5"}></div>}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </ErrorBoundary >
//   );
// });

// export default AmendSwitchModal;

import React from 'react'

const AmendSwitchModal = () => {
  return (
    <div>
      
    </div>
  )
}

export default AmendSwitchModal

