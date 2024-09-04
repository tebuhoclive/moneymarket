// import "./Batches.scss";
// import { observer } from "mobx-react-lite";
// import { Box, IconButton } from "@mui/material";
// import { useAppContext } from "../../../../../../shared/functions/Context";
// import { DataGrid, GridColDef, GridToolbarContainer, GridToolbarQuickFilter } from "@mui/x-data-grid";

// import FileOpenIcon from "@mui/icons-material/FileOpen";
// import { getTimeAllocated } from "../../../../../../shared/functions/MyFunctions";
// import showModalFromId from "../../../../../../shared/functions/ModalShow";

// import { IWithdrawalPaymentBatch } from "../../../../../../shared/models/batches/BatchesModel";
// import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
// import { useState } from "react";
// import { LoadingEllipsis } from "../../../../../../shared/components/loading/Loading";
// import Toolbar from "../../../../shared/components/toolbar/Toolbar";
// import MODAL_NAMES from "../../../../dialogs/ModalName";

// interface IProp {
//   data: IWithdrawalPaymentBatch[];
// }

// export const Batches = observer(({ data }: IProp) => {
//   const { store, api } = useAppContext();
//   const [loading, setLoading] = useState(false);

//   const onView = (batch: IWithdrawalPaymentBatch) => {
//     store.batches.select(batch);
//     showModalFromId(MODAL_NAMES.ADMIN.VIEW_DETAIL_BATCHES);
//   };

//   const removeBatch = async (batch: IWithdrawalPaymentBatch) => {
//     setLoading(true);
//     try {
//       await api.batches.delete(batch);
//     } catch (error) {
//     } finally {
//       setLoading(false);
//     }
//   };

//   const CustomToolbar = () => {
//     return (
//       <GridToolbarContainer>
//         <GridToolbarQuickFilter />
//       </GridToolbarContainer>
//     );
//   }

//   const getDisplayName = (uid: string) => {
//     const user = store.user.all.find((u) => u.asJson.uid === uid)?.asJson
//       .displayName;
//     return user;
//   };



//   const columns: GridColDef[] = [
//     {
//       field: "timeAuthorised",
//       headerName: "",
//       // width: 200,
//       width: 10,
//       renderCell: (params) => (
//         <>
//           {getTimeAllocated(params.row.timeProcessed) && (
//             <div style={{ padding: "6px", borderRadius: '50%', backgroundColor: 'green' }}></div>
//           )}
//         </>
//       )
//     },
//     {
//       field: "batchNumber",
//       headerName: "Batch Reference",
//       width: 300,
//width:200,
//     },
//     {
//       field: "processedBy",
//       headerName: "Created By",
//       width: 300,
//width:200,
//       headerClassName: "grid",
//       valueGetter: (params) => {
//         return getDisplayName(params.row.processedBy)
//       },
//     },
//     {
//       field: "timeProcessed",
//       headerName: "Date And Time Created",
//       width: 300,
//width:200,
//       headerClassName: "grid",
//       valueGetter: (params) => {
//         const dateAndTime = new Date(params.row.timeProcessed).toLocaleString();
//         return dateAndTime;
//       },
//     },
//     {
//       field: "paymentBatchFileType",
//       headerName: "Batch Type",
//       width: 300,
//width:200,
//       headerClassName: "grid",
//       valueGetter: (params) => {
//         if (params.row.paymentBatchFileType === "High") {
//           return "High";
//         } else if (params.row.paymentBatchFileType === "Low") {
//           return "Normal";
//         } else if (params.row.paymentBatchFileType === "ZAR") {
//           return "ZAR";
//         } else {
//           return "Unknown Type";
//         }
//       },
//     },
//     {
//       field: "#",
//       headerName: "Total Transactions",
//       width: 300,
//width:200,
//       headerClassName: "grid",
//       valueGetter: (params) => {
//         return params.row.paymentBatchFileTransactions.length + " Transactions";
//       },
//     },
//     {
//       field: "Option",
//       headerName: "Options",
//       width: 200,
//width:200,
//       headerClassName: "grid",
//       renderCell: (params) => (
//         <>
//           {loading ? (
//             <LoadingEllipsis />
//           ) : (
//             <>
//               <IconButton
//                 data-uk-tooltip="Open File"
//                 onClick={() => onView(params.row)}
//               >
//                 <FileOpenIcon />
//               </IconButton>
//               {params.row.paymentBatchFileTransactions.length === 0 && (
//                 <IconButton onClick={() => removeBatch(params.row)}>
//                   <DeleteForeverIcon style={{ color: "red" }} />
//                 </IconButton>
//               )}
//             </>
//           )}
//         </>
//       ),
//     },
//   ];

//   return (
//     <div className="grid ">
//       <Toolbar
//         rightControls={<></>}
//         leftControls={<h4 className="main-title-sm">Batch Files</h4>}
//       />
//       <Box sx={{ height: 350 }}>
//         <DataGrid
//           loading={!data}
//           slots={{
//             toolbar: CustomToolbar,
//           }}
//           rows={data}
//           columns={columns}
//           getRowId={(row) => row.id} // Use the appropriate identifier property
//           rowHeight={35}
//         />
//       </Box>
//     </div>
//   );
// });


import React from 'react'

const Batches = () => {
  return (
    <div>
      
    </div>
  )
}

export default Batches
