// import "./AuthorisedPayments.scss";
// import { dateFormat_YY_MM_DD_NEW } from "../../../../../../shared/utils/utils";
// import { observer } from "mobx-react-lite";
// import { IWithdrawalTransaction } from "../../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionModel";
// import { Box, IconButton } from "@mui/material";
// import { useAppContext } from "../../../../../../shared/functions/Context";
// import { DataGrid, GridColDef, GridToolbarContainer, GridToolbarQuickFilter } from "@mui/x-data-grid";
// import {
//   hideModalFromId,
// } from "../../../../../../shared/functions/ModalShow";
// import { useEffect, useState } from "react";
// import { OpenInNew } from '@mui/icons-material';
// import { batchesWithdrawalPayments, onViewWithdrawalTransaction } from "../../../../../../shared/functions/transactions/WithdrawalTransactionsFunctions";
// import { splitAndTrimString } from "../../../../../../shared/functions/StringFunctions";
// import Toolbar from "../../../../shared/components/toolbar/Toolbar";
// import MODAL_NAMES from "../../../../dialogs/ModalName";
// import { getClientName } from "../../../../../../shared/functions/MyFunctions";
// import MessageIcon from '@mui/icons-material/Message';
// import { LoadingEllipsis } from "../../../../../../shared/components/loading/Loading";



// export const WithdrawalPaymentQueueGrid = observer(({ data }: IProp) => {
//   const { store, api } = useAppContext();
//   const [showMessage, setShowMessage] = useState(false);
//   const me = store.auth.meJson;
//   const now = new Date();
//   const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Midnight of today
//   const [progressPercentage, setProgressPercentage] = useState("");
//   const [transactionUpdated, setTransactionUpdated] = useState(0);
//   const [loader, setLoader] = useState<boolean>(false);

//   const toggleMessage = () => {
//     setShowMessage(prevState => !prevState);
//   };


//   const _filteredData = data.filter(transaction => {
//     const transactionDate = new Date(transaction.valueDate || 0);
//     const transactionDateOnly = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), transactionDate.getDate());

//     // Check if the statusDescription is "Future Dated" and the date is not today or older
//     if (transaction.description === 'Future Dated') {
//       return transactionDateOnly <= today;
//     }

//     // Include all other transactions
//     return true;
//   });

//   const sortedData = _filteredData.sort(
//     (a, b) =>
//       new Date(b.timePaymentQueue || 0).getTime() -
//       new Date(a.timePaymentQueue || 0).getTime()
//   );

//   const filteredData = sortedData.filter(
//     (t) => !t.description.includes("Back Dated")
//   );

//   const [loading, setLoading] = useState<boolean>(false);

//   const totals = filteredData.reduce((sum, deposit) => sum + deposit.amount, 0);

//   const [selectedTransactions, setSelectedTransactions] = useState<string[]>(
//     []
//   );
//   const [transactionSelectedForBatching, setTransactionSelectedForBatching] =
//     useState<IWithdrawalTransaction[]>([]);


//   const addToSelected = (transactionId: string) => {
//     if (transactionId) {
//       setSelectedTransactions((prevTransactions) => {
//         let updatedTransactions: string[];
//         if (prevTransactions.includes(transactionId)) {
//           updatedTransactions = prevTransactions.filter(
//             (id) => id !== transactionId
//           );
//         } else {
//           updatedTransactions = [...prevTransactions, transactionId];
//         }

//         // Set the filtered withdrawals for batching using the updated transactions
//         const filteredWithdrawals = data.filter((withdrawal) =>
//           updatedTransactions.includes(withdrawal.id)
//         );
//         console.log("Filtered Withdrawals for Batching:", filteredWithdrawals);
//         setTransactionSelectedForBatching(filteredWithdrawals);

//         return updatedTransactions;
//       });
//     }
//   };;

//   const CustomToolbar = () => {
//     return (
//       <GridToolbarContainer>
//         <GridToolbarQuickFilter />
//       </GridToolbarContainer>
//     );
//   };

//   const [filterValue, setFilterValue] = useState("");

//   const handleFilterChange = (key: string, value: string) => {
//     setFilterValue(value);
//   };

//   const filteredTransactions = filteredData.filter((transaction) => {
//     const branchCode = splitAndTrimString("|", transaction.bank)[3].trim();
//     const namibianUniversalBranchCodes = [
//       "280172",
//       "483772",
//       "461609",
//       "087373",
//     ];

//     if (filterValue === "Normal") {
//       return (
//         transaction.amount <= 5000000 &&
//         namibianUniversalBranchCodes.includes(branchCode) &&
//         transaction.transactionStatus === "Approved"
//       );
//     } else if (filterValue === "High Value") {
//       return (
//         transaction.amount > 5000000 &&
//         namibianUniversalBranchCodes.includes(branchCode) &&
//         transaction.transactionStatus === "Approved"
//       );
//     } else if (filterValue === "ZAR") {
//       return (
//         !namibianUniversalBranchCodes.includes(branchCode) &&
//         transaction.transactionStatus === "Approved"
//       );
//     } else {
//       return transaction.transactionStatus === "Approved"; // Include all transactions with status "Approved" if filterValue is not recognized
//     }
//   });

//   const batchTransactions = async (
//     userId: string,
//     transactions: IWithdrawalTransaction[],
//     filter: string
//   ) => {
//     try {
//       setLoading(true);
//       await batchesWithdrawalPayments(store, api, userId, transactions, filter, setLoader, setTransactionUpdated, setProgressPercentage);
//       setLoading(false);
//       hideModalFromId(MODAL_NAMES.ADMIN.COUNT_BATCHES);
//     } catch (error) { }
//   };

//   const selectAllTransactions = () => {
//     const selectedIds = filteredTransactions.map(
//       (transaction) => transaction.id
//     );
//     setSelectedTransactions(selectedIds);

//     // Set the filtered withdrawals for batching using the updated transactions
//     const filteredWithdrawals = data.filter((withdrawal) =>
//       selectedIds.includes(withdrawal.id)
//     );
//     setTransactionSelectedForBatching(filteredWithdrawals);
//   };

//   const deselectAllTransactions = () => {
//     setSelectedTransactions([]);
//   };



//   // Define the columns for the grid
//   const columns: GridColDef[] = [
//     {
//       field: "checked",
//       headerName: "",
//       headerClassName: "grid",
//       renderCell: (params) => (
//         <input
//           onChange={() => addToSelected(params.row.id)}
//           className="uk-checkbox"
//           type="checkbox"
//           checked={selectedTransactions.includes(params.row.id)}
//         />
//       ),
//     },
//     {
//       field: "transactionDate",
//       headerName: "Transaction Date",
//width:200,
//       headerClassName: "grid",
//       valueGetter: (params) => {
//         return dateFormat_YY_MM_DD_NEW(params.row.transactionDate);
//       },
//     },
//     {
//       field: "valueDate",
//       headerName: "Value Date",
//width:200,
//       headerClassName: "grid",
//       valueGetter: (params) => {
//         return dateFormat_YY_MM_DD_NEW(params.row.valueDate);
//       },
//     },
//     {
//       field: "productCode",
//       headerName: "Product Code",
//width:200,
//       headerClassName: "grid",
//     },
//     {
//       field: "entity",
//       headerName: "Client Name",
//       flex: 2,
//       headerClassName: "grid",
//       valueGetter: (params) => {
//         return getClientName(params.row, store);
//       },
//     },
//     {
//       field: "allocation",
//       headerName: "Account",
//width:200,
//       headerClassName: "grid",
//     },
//     {
//       field: "amount",
//       headerName: "Amount",
//width:200,
//       headerClassName: "grid",
//       valueGetter: (params) => {
//         return (params.row.amount);
//       },
//     },
//     {
//       field: "transactionType",
//       headerName: "Transaction Type",
//width:200,
//       headerClassName: "grid",
//       valueGetter: (params) => {
//         const branchCode = splitAndTrimString("|", params.row.bank)[3].trim();
//         const namibianUniversalBranchCodes = [
//           "280172",
//           "483772",
//           "461609",
//           "087373",
//         ];

//         if (namibianUniversalBranchCodes.includes(branchCode)) {
//           return params.row.amount > 5000000 ? "High Value" : "Normal";
//         } else {
//           return `ZAR`;
//         }
//       },
//     },
//     {
//       field: "description",
//       headerName: "Description",
//width:200,
//       headerClassName: "changeable",
//       renderCell: (params) => {
//         const { value } = params;
//         let color = "";

//         // Set color based on description
//         if (value.includes("Withdrawal")) {
//           color = "green";
//         } else if (value.includes("Back Dated")) {
//           color = "blue";
//         } else if (value.includes("Future Dated")) {
//           color = "purple";
//         } else if (value.includes("Returned for Amendment")) {
//           color = "red";
//         } else if (value.includes("Amended")) {
//           color = "#80cbc4";
//         } else if (value.includes("Account Close Out")) {
//           color = "yellow";
//         }
//         return (
//           <div style={{ display: "flex" }}>
//             <div
//               data-uk-tooltip={value}
//               style={{
//                 background: `${color}`,
//                 padding: "2px",
//                 marginRight: "7px",
//               }}></div>{" "}
//             {value}
//           </div>
//         );
//       },
//     },
//     {
//       field: "Option",
//       headerName: "Option",
//width:200,
//       headerClassName: "grid",
//       renderCell: (params) => (
//         <>
//           <IconButton
//             data-uk-tooltip="View Transaction"
//             onClick={() => onViewWithdrawalTransaction(params.row.id, store)}>
//             <OpenInNew />
//           </IconButton>
//           {/* <IconButton
//           data-uk-tooltip="Return for Amendment"
//           onClick={() => onReturnWithdrawalForAmendment(params.row.id, store)}
//         >
//           <AssignmentReturn />
//         </IconButton> */}
//         </>
//       ),
//     },
//   ];

//   const totalFutureDatedTransaction = data.filter((d) => d.description === "Future Dated").length;


//   useEffect(() => {
//     const getData = async () => {
//       await api.withdrawalTransaction.getAll();
//     };
//     getData();
//   }, [api.withdrawalTransaction]);

//   return (
//     <div className="grid">
//       {totalFutureDatedTransaction > 0 &&
//         <div className="future-dated-count" onClick={toggleMessage}>
//           <div className="message">
//             <MessageIcon />
//           </div>
//           <div className={`message-context ${showMessage ? 'show' : ''}`}>
//             {/* Within the dataset, there exists a total of {totalFutureDatedTransaction} transactions scheduled for the future. */}
//             Total Future Dated Transactions: {totalFutureDatedTransaction}
//           </div>
//         </div>
//       }

//       {loader ?
//         <div>
//           <LoadingEllipsis />
//           <div className="uk-width-1-1 uk-margin">
//             <progress
//               className="uk-progress"
//               value={progressPercentage}
//               max={100}></progress>
//             <label className="uk-form-label required">
//               {`Progress: ${progressPercentage}% (${transactionUpdated} / ${selectedTransactions.length} transactions completed)`}{" "}
//             </label>
//           </div>
//         </div> :
//         <div>
//           <Toolbar
//             rightControls={
//               <div className="uk-flex">
//                 <div className="uk-form-controls uk-flex uk-margin-left">
//                   <select
//                     value={filterValue}
//                     className="uk-select uk-form-small"
//                     onChange={(e) =>
//                       handleFilterChange("stringValueB", e.target.value)
//                     }>
//                     <option value="">Click select transaction type</option>
//                     <option value="Normal">Normal</option>
//                     <option value="High Value">High value</option>
//                     <option value="ZAR">ZAR</option>
//                     <option value="Both">All</option>
//                   </select>
//                 </div>

//                 <div className="uk-form-controls uk-flex uk-margin-left">
//                   <button
//                     className="btn btn-danger"
//                     onClick={() => setFilterValue("")}>
//                     Clear Filters
//                   </button>
//                 </div>
//               </div>
//             }
//             leftControls={
//               <>
//                 <h4 className="main-title-sm">Payment Queue</h4>
//               </>
//             }
//           />
//           <hr />
//           <Toolbar
//             rightControls={
//               <h4 className="main-title-sm">
//                 Total Amount:  {(totals)}
//               </h4>
//             }
//             leftControls={
//               <>
//                 <div className="uk-margin-bottom">
//                   {selectedTransactions.length > 0 && me && (
//                     <button
//                       onClick={() =>
//                         batchTransactions(
//                           me.uid,
//                           transactionSelectedForBatching,
//                           filterValue
//                         )
//                       }
//                       className="btn btn-primary">
//                       Batch Selected Transactions({selectedTransactions.length})
//                     </button>
//                   )}
//                 </div>

//                 <div className="uk-margin-bottom">
//                   {selectedTransactions.length === 0 ? (
//                     <button
//                       onClick={selectAllTransactions}
//                       className="btn btn-primary">
//                       Select All Transactions for Batching
//                     </button>
//                   ) : (
//                     <button
//                       onClick={deselectAllTransactions}
//                       className="btn btn-danger">
//                       Deselect All Transactions
//                     </button>
//                   )}
//                 </div>
//               </>
//             }
//           />
//           <Box sx={{ height: 400 }}>
//             <DataGrid
//               loading={!data}
//               slots={{
//                 toolbar: CustomToolbar,
//               }}
//               rows={filteredTransactions}
//               columns={columns}
//               getRowId={(row) => row.id} // Use the appropriate identifier property
//               rowHeight={35}
//             />
//           </Box>
//         </div>
//       }


//     </div>
//   );
// });


import { Box } from '@mui/material'
import { DataGrid, GridColDef, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid'

import { IWithdrawalTransaction } from '../../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionModel';

interface IProp {
  data: IWithdrawalTransaction[];
}

const WithdrawalPaymentQueueGrid = (props: IProp) => {
  const { data } = props;

    const CustomToolbar = () => {
      return (
        <GridToolbarContainer>
          <GridToolbarQuickFilter />
        </GridToolbarContainer>
      );
    };

      const columns: GridColDef[] = []

  return (
    <div className='grid'>
      <Box sx={{ height: 400 }}>
        <DataGrid
          loading={!data}
          slots={{
            toolbar: CustomToolbar,
          }}
          rows={data}
          columns={columns}
          getRowId={(row) => row.id} // Use the appropriate identifier property
          rowHeight={35}
        />
      </Box>
    </div>
  )
}

export default WithdrawalPaymentQueueGrid
