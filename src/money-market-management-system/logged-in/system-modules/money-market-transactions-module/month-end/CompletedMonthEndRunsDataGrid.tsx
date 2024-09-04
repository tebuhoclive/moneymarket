import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import { Box, IconButton } from "@mui/material";
import FlipCameraAndroidIcon from '@mui/icons-material/FlipCameraAndroid';
import { dateFormat_YY_MM_DD } from "../../../../../shared/utils/utils";
import { IMonthEndRun } from '../../../../../shared/models/MonthEndRunModel';
import { useAppContext } from "../../../../../shared/functions/Context";
import { getTimeFromTimestamp } from "../../../../../shared/functions/DateToTimestamp";
import Toolbar from "../../../shared/components/toolbar/Toolbar";
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import showModalFromId from "../../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../../../dialogs/ModalName";
import { rollBackMonthEnd } from "./RollBackFunction";
import { useState } from "react";
import FastRewindIcon from '@mui/icons-material/FastRewind';
import Modal from "../../../../../shared/components/Modal";
import { RollBackSingleAccounts } from "../../../dialogs/transactions/month-end/RollBackSingleAccount";


interface IProps {
  data: IMonthEndRun[];
  setMonthEndRollBack: (show: boolean) => void;
  setStatement: (show: boolean) => void;
  setShowCompletedMonthEndReport: (show: boolean) => void;
}

export const CompletedMonthEndRunsDataGrid = observer(({ data, setMonthEndRollBack, setStatement, setShowCompletedMonthEndReport }: IProps) => {
  const { store, api } = useAppContext();
  const [loading, setLoading] = useState(false);

  const moneyMarketAccounts = store.mma
    .getAllLiabilityAccountsNoZeroBalances()
    .sort((a, b) =>
      a.asJson.accountNumber.localeCompare(b.asJson.accountNumber))
    .map((acc) => { return acc.asJson });

  const viewMonthEndReport = (month: string) => {
    const selectedMonthEnd = store.monthEndRun.getItemById(month);
    if (selectedMonthEnd) {
      store.monthEndRun.select(selectedMonthEnd.asJson);
      setShowCompletedMonthEndReport(true);
      showModalFromId(MODAL_NAMES.BACK_OFFICE.MONTH_END_REPORT_MODAL);
    }
  }

  const onStatementRun = (monthEnd: IMonthEndRun) => {
    store.monthEndRun.select(monthEnd);
    setStatement(true)
    showModalFromId(MODAL_NAMES.BACK_OFFICE.STATEMENT_RUN);
  }
  const onSingleRollBack = (monthEnd: IMonthEndRun) => {
    store.monthEndRun.select(monthEnd);
    showModalFromId(MODAL_NAMES.BACK_OFFICE.VIEW_MONTH_END_ROLL_SINGLE_BACK);
  }





  const columns: GridColDef[] = [
    {
      field: "dateTime",
      headerName: "Date",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return dateFormat_YY_MM_DD(params.row.date);
      },
    },
    {
      field: "productName",
      headerName: "Product Name",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return params.row.productName;
      },
    },
    {
      field: "productCode",
      headerName: "Product Code",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return params.row.productCode;
      },
    },
    {
      field: "processedAccounts",
      headerName: "Total Accounts To be Processed",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return params.row.processedAccounts.length;
      },
    },
    {
      field: "date",
      headerName: "Date/Time Initiated",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return `${dateFormat_YY_MM_DD(params.row.date)} ${getTimeFromTimestamp(params.row.date)}`;
      },
    },
    {
      field: "Options",
      headerName: "Options",
      width: 200,
      renderCell: (params) => (
        <div>
          <IconButton
            data-uk-tooltip="View Report"
            onClick={() => viewMonthEndReport(params.row.id)}
          >
            <RemoveRedEyeIcon />
          </IconButton>
          <IconButton
            data-uk-tooltip="Revert Fund"
            onClick={() => rollBackMonthEnd(
              moneyMarketAccounts,
              params.row.year,
              params.row.id,
              setLoading,
              params.row,
              api
            )}
          >
            <FlipCameraAndroidIcon />
          </IconButton>
          <IconButton
            data-uk-tooltip="Revert Single Account"
            onClick={() => onSingleRollBack(params.row)}
          >
            <FastRewindIcon />
          </IconButton>
          <IconButton
            data-uk-tooltip="Action Statement Run"
            onClick={() => onStatementRun(params.row)}
          >
            <ForwardToInboxIcon />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <div className="grid">
      <Toolbar
        leftControls={
          <h4 className="main-title-sm">Completed Month End</h4>
        }
      />
      <DataGrid
        sx={{
          height: 'auto', width: '100%', maxHeight: 400,
          '& .MuiDataGrid-main': {
            overflow: 'auto',
            '& .MuiDataGrid-cell': {
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            },
            '& .MuiDataGrid-columnHeader': {
              '&:hover .MuiDataGrid-iconButtonContainer': {
                visibility: 'visible',
              },
              '& .MuiDataGrid-iconButtonContainer': {
                visibility: 'visible',
              }
            }
          }
        }}
        rows={data}
        loading={loading}
        columns={columns}
        getRowId={(row) => row.id} // Use the appropriate identifier property
        rowHeight={50}
      />

      <Modal modalId={MODAL_NAMES.BACK_OFFICE.VIEW_MONTH_END_ROLL_SINGLE_BACK}>
        < RollBackSingleAccounts />
      </Modal>

    </div >
  );
});
