import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import { Box } from "@mui/material";
import { useAppContext } from "../../../../../../shared/functions/Context";
import { dateFormat_YY_MM_DD } from "../../../../../../shared/utils/utils";
import { getClientName } from "../../../../../../shared/functions/MyFunctions";

import Toolbar from "../../../../shared/components/toolbar/Toolbar";
import { IRecurringWithdrawalsBalanceReport } from "../../../../../../shared/models/recurring-withdrawal-instruction/RecurringWithdrawalsBalanceReport";
interface IProps {
  data: IRecurringWithdrawalsBalanceReport[];
}

export const RecurringWithdrawalsBalanceReportGrid = observer(
  ({ data }: IProps) => {
    const { store } = useAppContext();

    // const users = store.user.all;

    // const [viewLog, setViewLog] = useState(false);
    //!uncomment for audit trails
    // const handleViewLog = (showHide: boolean, auditId: string) => {
    //     setViewLog(showHide);
    //     const _selectedAudit = store.withdrawalTransactionAudit.getItemById(auditId);
    //     if (_selectedAudit) {
    //         store.withdrawalTransactionAudit.select(_selectedAudit.asJson);
    //         const audit = store.withdrawalTransactionAudit.selected;
    //         if (audit) {
    //             setSelectedAudit(audit);
    //         }
    //     }
    //     displayDetails(showHide);
    // }

    // const getActionUser = (auditTrail: IWithdrawalTransactionAudit) => {
    //     if (users) {
    //         const actionUser = users.find(
    //             (user) => user.asJson.uid === auditTrail.actionUser
    //         );
    //         if (actionUser) {
    //             const actionUserName = actionUser.asJson.displayName;
    //             return actionUserName;
    //         }
    //         return "";
    //     }
    //     return "";
    // };
    // const onVerify = (withdrawalId: string) => {
    //     const selectedWithdrawal = store.recurringWithdrawalInstruction.getItemById(withdrawalId);
    //     if (selectedWithdrawal) {
    //       store.recurringWithdrawalInstruction.select(selectedWithdrawal.asJson);
    //       showModalFromIdProperty(MODAL_NAMES.BACK_OFFICE.VERIFY_WITHDRAWAL_RECURRING_MODAL, selectedWithdrawal.asJson );
    //     }
    //   };

    // const onView = (withdrawalId: string) => {
    //   const selectedWithdrawal =
    //     store.recurringWithdrawalInstruction.getItemById(withdrawalId);
    //   if (selectedWithdrawal) {
    //     store.recurringWithdrawalInstruction.select(selectedWithdrawal.asJson);
    //     showModalFromId(MODAL_NAMES.BACK_OFFICE.RECORD_RECURRING_VIEW_MODAL);
    //   }
    // };
    // const onEdit = (withdrawalId: string) => {
    //   const selectedWithdrawal =
    //     store.recurringWithdrawalInstruction.getItemById(withdrawalId);

    //   if (selectedWithdrawal) {
    //     store.recurringWithdrawalInstruction.select(selectedWithdrawal.asJson);
    //     showModalFromId(
    //       MODAL_NAMES.BACK_OFFICE.RECORD_RECURRING_EDIT_WITHDRAWAL_MODAL
    //     );
    //   }
    // };

    const columns: GridColDef[] = [
      {
        field: "date",
        headerName: "Transaction Date",
 width:200,
        headerClassName: "grid",
        valueGetter: (params) => {
          return `${dateFormat_YY_MM_DD(params.row.transactionDate)}`;
        },
      },
      {
        field: "clientId",
        headerName: "",
 width:200,
        headerClassName: "grid",
        valueGetter: (params) => {
          return getClientName(params.row, store);
        },
      },
      {
        field: "clientName",
        headerName: "Client Account",
 width:200,
        headerClassName: "grid",
        // valueGetter: (params) => {
        //     return getActionUser(params.row);
        // },
      },
      {
        field: "recurringAmount",
        headerName: "Recurring Amount",
 width:200,
        headerClassName: "grid",
      },
      {
        field: "clientBalance",
        headerName: "Client Balance",
        flex: 2,
        headerClassName: "grid", // Apply the same class for consistency
      },
      // {
      //   field: "Options",
      //   headerName: "Options",
      //   width: 200,
      //   renderCell: (params: GridRenderCellParams) => (
      //     <>
      //       <IconButton
      //         data-uk-tooltip="Download Report"
      //         // onClick={() => onViewRecurral(params.row.id, store)}
      //       >
      //         <FileOpenIcon />
      //       </IconButton>
      //       {/* <IconButton
      //               onClick={() => onView(params.row.id)}
      //               data-uk-tooltip="View"
      //             >
      //               <OpenInNew />
      //             </IconButton>
      //             <IconButton
      //               onClick={() => onEdit(params.row.id)}
      //               data-uk-tooltip="Edit"
      //             >
      //               <EditIcon />
      //             </IconButton> */}
      //     </>
      //   ),
      // },
    ];

    return (
      <div className="grid">
        <Toolbar
          rightControls={
            <div className="uk-flex uk-margin-bottom">
              {/* <ExportRecurringReportGridData title="Overdraft Balances" transactions={data} /> */}
              {/* <ExportExcel
                title={"Completed Transaction Report"}
                jsonData={data}
                headers={[
                  "Date/Time Uploaded",
                  "Statement Reference",
                  "Amount",
                  "Transaction Date",
                  "Value Date",
                ]}
              /> */}
              <button className="btn btn-primary">Report</button>
            </div>
          }
        />
        <Box sx={{ height: 380 }}>
          <DataGrid
            rows={data}
            columns={columns}
            getRowId={(row) => row.id} // Use the appropriate identifier property
            rowHeight={35}
          />
        </Box>
      </div>
    );
  }
);
