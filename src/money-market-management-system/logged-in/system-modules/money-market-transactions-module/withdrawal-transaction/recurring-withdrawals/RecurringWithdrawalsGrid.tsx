import { DataGrid, GridCheckCircleIcon, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import { Box, IconButton } from "@mui/material";
import OpenInNew from "@mui/icons-material/ViewCompact";
import EditIcon from "@mui/icons-material/Edit";
import { IRecurringWithdrawalInstruction } from "../../../../../../shared/models/recurring-withdrawal-instruction/RecurringWithdrawalInstructionModel";
import { ExportRecurringGridData } from "../ExportRecurringGrid";
import showModalFromId from "../../../../../../shared/functions/ModalShow";
import { useAppContext } from "../../../../../../shared/functions/Context";
import { dateFormat_YY_MM_DD } from "../../../../../../shared/utils/utils";
import { getClientName } from "../../../../../../shared/functions/MyFunctions";
import Toolbar from "../../../../shared/components/toolbar/Toolbar";
import MODAL_NAMES from "../../../../dialogs/ModalName";

interface IProps {
  data: IRecurringWithdrawalInstruction[];
  withdrawal: IRecurringWithdrawalInstruction | undefined;
}

export const RecurringWithdrawalsGrid = observer(
  ({ data, withdrawal }: IProps) => {
    const { store } = useAppContext();

    // const users = store.user.all;
    const verified = data.some(
      (instruction) => instruction.transactionStatus === "Verified"
    );
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

    const onView = (withdrawalId: string) => {
      const selectedWithdrawal =
        store.recurringWithdrawalInstruction.getItemById(withdrawalId);
      if (selectedWithdrawal) {
        store.recurringWithdrawalInstruction.select(selectedWithdrawal.asJson);
        showModalFromId(MODAL_NAMES.BACK_OFFICE.RECORD_RECURRING_VIEW_MODAL);
      }
    };
    const onEdit = (withdrawalId: string) => {
      const selectedWithdrawal =
        store.recurringWithdrawalInstruction.getItemById(withdrawalId);

      if (selectedWithdrawal) {
        store.recurringWithdrawalInstruction.select(selectedWithdrawal.asJson);
        showModalFromId(
          MODAL_NAMES.BACK_OFFICE.RECORD_RECURRING_EDIT_WITHDRAWAL_MODAL
        );
      }
    };

    const columns: GridColDef[] = [
      {
        field: "transactionDate",
        headerName: "Transaction Date",
 width:200,
        headerClassName: "grid",
        valueGetter: (params) => {
          return `${dateFormat_YY_MM_DD(params.row.transactionDate)}`;
        },
      },
      {
        field: "entity",
        headerName: "Client Name",
 width:200,
        headerClassName: "grid",
        valueGetter: (params) => {
          return getClientName(params.row, store);
        },
      },
      {
        field: "allocation",
        headerName: "Client Account",
 width:200,
        headerClassName: "grid",
        // valueGetter: (params) => {
        //     return getActionUser(params.row);
        // },
      },
      {
        field: "amount",
        headerName: "Recurring Amount",
 width:200,
        headerClassName: "grid",
      },
      {
        field: "bank",
        headerName: "Bank Name",
        flex: 2,
        headerClassName: "grid", // Apply the same class for consistency
      },
      {
        field: "recurringDay",
        headerName: "Recurring Day",
        flex: 2,
        headerClassName: "grid", // Apply the same class for consistency
      },
      {
        field: "reference",
        headerName: "Reference",
        flex: 2,
        headerClassName: "grid", // Apply the same class for consistency
      },
      ...(!verified
        ? [
          {
            field: "Options",
            headerName: "Options",
     width:200,
            renderCell: (params: GridRenderCellParams) => (
              <>
                <IconButton
                  data-uk-tooltip="Verify"
                // onClick={() => onViewRecurral(params.row.id, store)}
                >
                  <GridCheckCircleIcon />
                </IconButton>
                <IconButton
                  onClick={() => onView(params.row.id)}
                  data-uk-tooltip="View"
                >
                  <OpenInNew />
                </IconButton>
                <IconButton
                  onClick={() => onEdit(params.row.id)}
                  data-uk-tooltip="Edit"
                >
                  <EditIcon />
                </IconButton>
              </>
            ),
          },
        ]
        : [
          {
            field: "Options",
            headerName: "Options",
     width:200,
            renderCell: (params: GridRenderCellParams) => (
              <>
                <IconButton
                  onClick={() => onView(params.row.id)}
                  data-uk-tooltip="View"
                >
                  <OpenInNew />
                </IconButton>
                <IconButton
                  onClick={() => onEdit(params.row.id)}
                  data-uk-tooltip="Edit"
                >
                  <EditIcon />
                </IconButton>
              </>
            ),
          },
        ]),
    ];

    return (
      <div className="grid">
        <Toolbar
          rightControls={
            <div className="uk-flex uk-margin-bottom">
              <ExportRecurringGridData title="Completed" transactions={data} />
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
