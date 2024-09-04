import { DataGrid, GridColDef } from "@mui/x-data-grid";
import "./PendingMonth.scss"
import { observer } from "mobx-react-lite";
import { Box, IconButton } from "@mui/material";
import { dateFormat_YY_MM_DD } from "../../../../../shared/utils/utils";
import { IMonthEndRun } from '../../../../../shared/models/MonthEndRunModel';
import { OpenInNew, PlayArrow } from "@mui/icons-material";
import { completeMonthEnd, runMonthEnd, viewMonthEnd, viewMonthEndReport, viewMonthEndRollBack } from "../../../../../shared/functions/transactions/MonthEndRunFunctions";
import { useAppContext } from "../../../../../shared/functions/Context";
import { getTimeFromTimestamp } from "../../../../../shared/functions/DateToTimestamp";
import Toolbar from "../../../shared/components/toolbar/Toolbar";
import { useEffect, useState } from "react";
import { LoadingEllipsis } from "../../../../../shared/components/loading/Loading";
import InfoIcon from '@mui/icons-material/Info';
import FlipCameraIosIcon from '@mui/icons-material/FlipCameraIos';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { getAccountNumber } from "../../../../../shared/functions/MyFunctions";
import showModalFromId from "../../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../../../dialogs/ModalName";

interface IProps {
  data: IMonthEndRun[];
  setMonthEndComplete: (show: boolean) => void;
  setMonthEndReport: (show: boolean) => void;
}



export const PendingMonthEndRunsDataGrid = observer(({ data, setMonthEndComplete, setMonthEndReport }: IProps) => {
  const [isRunningMonthEnd, setIsRunningMonthEnd] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const { api, store } = useAppContext();



  const moneyMarketAccounts = store.mma.getAllLiabilityAccountsNoZeroBalances().sort((a, b) => {
    return a.asJson.accountNumber.localeCompare(b.asJson.accountNumber);
  })
    .map((account) => ({
      id: account.asJson.id,
      account: account.asJson.id,
      accountType: account.asJson.accountType,
      totalInterest: account.asJson.monthTotalInterest || 0,
      days: account.asJson.days,
      lastRate: account.asJson.clientRate,
      lastBalance: account.asJson.balance,
      fee: account.asJson.fees,
    }));

  const $accounts = store.mma.getAllLiabilityAccountsNoZeroBalances()
    .sort((a, b) =>
      a.asJson.accountNumber.localeCompare(b.asJson.accountNumber))
    // .slice(0, 20)
    .map((a) => { return a.asJson })






  const viewMonthEndReport = (month: string) => {
    setIsRunningMonthEnd(true);
    const selectedMonthEnd = store.monthEndRun.getItemById(month);
    if (selectedMonthEnd) {
      store.monthEndRun.select(selectedMonthEnd.asJson);
      setMonthEndReport(true);

      showModalFromId(MODAL_NAMES.BACK_OFFICE.MONTH_END_REPORT_MODAL);
      setIsRunningMonthEnd(false);
    }
  }

  const onViewModal = () => {
    setMonthEndComplete(true);
    showModalFromId(MODAL_NAMES.BACK_OFFICE.MONTH_END_COMPLETE_MODAL)
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
      // renderCell: (params) => (
      //   <div style={{ fontSize: '1.5rem' }}>{params.value}</div> // Adjust font size as needed
      // ),
    },
    {
      field: "productName",
      headerName: "Product Name",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return params.row.productName;
      },
      // renderCell: (params) => (
      //   <div style={{ fontSize: '1.5rem' }}>{params.value}</div> // Adjust font size as needed
      // ),
    },
    {
      field: "productCode",
      headerName: "Product Code",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return params.row.productCode;
      },
      // renderCell: (params) => (
      //   <div style={{ fontSize: '1.5rem' }}>{params.value}</div> // Adjust font size as needed
      // ),
    },
    {
      field: "processedAccounts",
      headerName: "Total Accounts To be Processed",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return params.row.processedAccounts.length;
      },
      // renderCell: (params) => (
      //   <div style={{ fontSize: '1.5rem' }}>{params.value}</div> // Adjust font size as needed
      // ),
    },
    {
      field: "date",
      headerName: "Date/Time Initiated",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return `${dateFormat_YY_MM_DD(params.row.date)} ${getTimeFromTimestamp(params.row.date)}`;
      },
      // renderCell: (params) => (
      //   <div style={{ fontSize: '1.5rem' }}>{params.value}</div> // Adjust font size as needed
      // ),
    },
    {
      field: "Options",
      headerName: "Options",
      width: 200,
      renderCell: (params) => (
        <div >
          <IconButton
            data-uk-tooltip="Run Month End"
            onClick={() => runMonthEnd(params.row, moneyMarketAccounts, api, setIsRunning)}
          >
            <PlayArrow />
          </IconButton>
          <IconButton
            data-uk-tooltip="View Month End Report"
            onClick={() => viewMonthEndReport(params.row.id)}
          >
            <InfoIcon />
          </IconButton>
          <IconButton
            onClick={() => completeMonthEnd($accounts, api, setIsRunningMonthEnd, params.row.year, params.row.id, params.row)}
            data-uk-tooltip="Complete Month End"
          >
            <TaskAltIcon />
          </IconButton>
        </div>
      ),

    },
  ];
  return (
    <div className="grid">
      <Toolbar
        leftControls={
          <h4 className="main-title-sm">In-Progress Month End</h4>
        }
      />
      <Box sx={{ height: 250 }}>
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
          loading={isRunning || isRunningMonthEnd}
          rows={data}
          columns={columns}
          getRowId={(row) => row.id} // Use the appropriate identifier property
          rowHeight={50}
        />
      </Box>
    </div>
  );
});
