// import {
//   DataGrid,
//   GridCheckCircleIcon,
//   GridColDef,
//   GridRenderCellParams,
// } from "@mui/x-data-grid";
// import { observer } from "mobx-react-lite";
// import { Box, IconButton } from "@mui/material";
// import { useAppContext } from "../../../../../../../shared/functions/Context";
// import { onViewRecurringWithdrawalTransaction, onEditRecurringWithdrawal } from "../../../../../../../shared/functions/transactions/WithdrawalTransactionsFunctions";
// import { IRecurringWithdrawalInstruction } from "../../../../../../../shared/models/recurring-withdrawal-instruction/RecurringWithdrawalInstructionModel";
// import { dateFormat_YY_MM_DD } from "../../../../../../../shared/utils/utils";
// import { ExportRecurringGridData } from "../../../../money-market-transactions-module/withdrawal-transaction/ExportRecurringGrid";
// import { getClientName } from "../../../../../../../shared/functions/MyFunctions";
// import EditIcon from '@mui/icons-material/Edit';
// import Toolbar from "../../../../../shared/components/toolbar/Toolbar";

// interface IProps {
//   data: IRecurringWithdrawalInstruction[];
// }

// export const RecurringGrid = observer(
//   ({ data }: IProps) => {
//     const { store } = useAppContext();

//     const verified = data.some(
//       (instruction) => instruction.transactionStatus === "Verified"
//     );

//     const columns: GridColDef[] = [
//       {
//         field: "transactionDate",
//         headerName: "Transaction Date",
//  width:200,
//         headerClassName: "grid",
//         valueGetter: (params) => {
//           return `${dateFormat_YY_MM_DD(params.row.transactionDate)}`;
//         },
//       },
//       {
//         field: "entity",
//         headerName: "Client Name",
//  width:200,
//         headerClassName: "grid",
//         valueGetter: (params) => {
//           return getClientName(params.row, store);
//         },
//       },
//       {
//         field: "allocation",
//         headerName: "Client Account",
//  width:200,
//         headerClassName: "grid",
//       },
//       {
//         field: "amount",
//         headerName: "Recurring Amount",
//  width:200,
//         headerClassName: "grid",
//       },
//       {
//         field: "bank",
//         headerName: "Bank Name",
//         flex: 2,
//         headerClassName: "grid", // Apply the same class for consistency
//       },
//       {
//         field: "recurringDay",
//         headerName: "Recurring Day",
//         flex: 2,
//         headerClassName: "grid", // Apply the same class for consistency
//       },
//       {
//         field: "reference",
//         headerName: "Reference",
//         flex: 2,
//         headerClassName: "grid", // Apply the same class for consistency
//       },
//       ...(!verified
//         ? [
//           {
//             field: "Options",
//             headerName: "Options",
//      width:200,
//             renderCell: (params: GridRenderCellParams) => (
//               <>
//                 <IconButton
//                   data-uk-tooltip="Verify"
//                   onClick={() =>
//                     onViewRecurringWithdrawalTransaction(params.row.id, store)
//                   }>
//                   <GridCheckCircleIcon />
//                 </IconButton>
//                 <IconButton
//                   data-uk-tooltip="Amend Transaction"
//                   onClick={() => onEditRecurringWithdrawal(params.row.id, store)}>
//                   <EditIcon />
//                 </IconButton>
//                 <IconButton
//                   onClick={() => params.row.id}
//                   data-uk-tooltip="Stop Recurring Transaction">
//                   <EditIcon />
//                 </IconButton>
//               </>
//             ),
//           },
//         ]
//         : [
//           {
//             field: "Options",
//             headerName: "Options",
//      width:200,
//             renderCell: (params: GridRenderCellParams) => (
//               <>
//                 <IconButton
//                   onClick={() =>
//                     onEditRecurringWithdrawal(params.row.id, store)
//                   }
//                   data-uk-tooltip="Amend Transaction">
//                   <EditIcon />
//                 </IconButton>
//               </>
//             ),
//           },
//         ]),
//     ];

//     return (
//       <div className="grid">
//         <Toolbar
//           rightControls={
//             <div className="uk-flex uk-margin-bottom">
//               <ExportRecurringGridData title="Completed" transactions={data} />
//               {/* <ExportExcel
//                   title={"Completed Transaction Report"}
//                   jsonData={data}
//                   headers={[
//                     "Date/Time Uploaded",
//                     "Statement Reference",
//                     "Amount",
//                     "Transaction Date",
//                     "Value Date",
//                   ]}
//                 /> */}
//             </div>
//           }
//         />
//         <Box sx={{ height: 380 }}>
//           <DataGrid
//             rows={data}
//             columns={columns}
//             getRowId={(row) => row.id} // Use the appropriate identifier property
//             rowHeight={35}
//           />
//         </Box>
//       </div>
//     );
//   }
// );

import React from 'react'

const RecurringGrid = () => {
  return (
    <div>
      
    </div>
  )
}

export default RecurringGrid
