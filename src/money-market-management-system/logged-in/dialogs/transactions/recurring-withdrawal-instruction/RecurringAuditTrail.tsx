// import { DataGrid, GridColDef } from "@mui/x-data-grid";
// import { observer } from "mobx-react-lite";
// import { Box, IconButton } from "@mui/material";
// import OpenInNew from '@mui/icons-material/ViewCompact';
// import { useState } from "react";
// import { useAppContext } from "../../../../../shared/functions/Context";
// import { getTimeFromTimestamp } from "../../../../../shared/functions/DateToTimestamp";
// import { IWithdrawalTransactionAudit } from "../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionAuditModel";
// import { dateFormat_YY_MM_DD } from "../../../../../shared/utils/utils";
// import { IRecurringWithdrawalInstruction } from "../../../../../shared/models/recurring-withdrawal-instruction/RecurringWithdrawalInstructionModel";
// import { IRecurringWithdrawalInstructionAudit } from "../../../../../shared/models/recurring-withdrawal-instruction/RecurringWithdrawalInstructionAuditModel";


// interface IProps {

//     data: IRecurringWithdrawalInstructionAudit[];
// }

// export const RecurringAuditTrailGrid = observer(({ data}: IProps) => {
//     const { store } = useAppContext();

//     const users = store.user.all;

//     const [viewLog, setViewLog] = useState(false);

//     // const handleViewLog = (showHide: boolean, auditId: string) => {
//     //     setViewLog(showHide);
//     //     const _selectedAudit = store.recurringWithdrawalAuditStore.getItemById(auditId);
//     //     if (_selectedAudit) {
//     //         store.recurringWithdrawalAuditStore.select(_selectedAudit.asJson);
//     //         const audit = store.recurringWithdrawalAuditStore.selected;
//     //         if (audit) {
//     //             setSelectedAudit(audit);
//     //         }
//     //     }
//     //     displayDetails(showHide);
//     // }

//     const getActionUser = (auditTrail: IRecurringWithdrawalInstructionAudit) => {
//         if (users) {
//             const actionUser = users.find(
//                 (user) => user.asJson.uid === auditTrail.actionUser
//             );
//             if (actionUser) {
//                 const actionUserName = actionUser.asJson.displayName;
//                 return actionUserName;
//             }
//             return "";
//         }
//         return "";
//     };

//     const columns: GridColDef[] = [
//         {
//             field: "auditDateTime",
//             headerName: "Date/Time",
//      width:200,
//             headerClassName: "grid",
//             valueGetter: (params) => {
//                 return `${dateFormat_YY_MM_DD(params.row.auditDateTime)} ${getTimeFromTimestamp(params.row.auditDateTime)}`;
//             },
//         },
//         {
//             field: "action",
//             headerName: "Action",
//      width:200,
//             headerClassName: "grid",
//         },
//         {
//             field: "actionDescription",
//             headerName: "Description",
//             flex: 2,
//             headerClassName: "grid", // Apply the same class for consistency
//         },
//         {
//             field: "actionUser",
//             headerName: "User",
//      width:200,
//             headerClassName: "grid",
//             valueGetter: (params) => {
//                 return getActionUser(params.row);
//             },
//         },
//         {
//             field: "Option",
//             headerName: "Option",
//      width:200,
//             headerClassName: "grid",
//             renderCell: (params) => (
//                 <>
//                     {
//                         viewLog &&
//                         <IconButton
//                             data-uk-tooltip="View Log Details"
//                             // onClick={() => handleViewLog(false, params.row.id)}
//                         >
//                             <OpenInNew />
//                         </IconButton>
//                     }

//                     {
//                         !viewLog &&
//                         <IconButton
//                             data-uk-tooltip="Hide Log Details"
//                             // onClick={() => handleViewLog(true, params.row.id)}
//                         >
//                             <OpenInNew />
//                         </IconButton>
//                     }

//                 </>
//             )
//         }
//     ];

//     return (
//         <div className="grid">
//             <Box sx={{ height: 380 }}>
//                 <DataGrid
//                     rows={data}
//                     columns={columns}
//                     getRowId={(row) => row.id} // Use the appropriate identifier property
//                     rowHeight={35}
//                 />
//             </Box>
//         </div>
//     );
// });

import React from 'react'

const RecurringAuditTrail = () => {
  return (
    <div>
      
    </div>
  )
}

export default RecurringAuditTrail

