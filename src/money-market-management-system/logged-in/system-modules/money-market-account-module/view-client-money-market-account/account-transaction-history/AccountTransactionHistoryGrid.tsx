import { DataGrid, GridColDef } from "@mui/x-data-grid";
import "./AccountTransactionHistory.scss";
import { Box } from "@mui/material";
import { observer } from "mobx-react-lite";
import { dateFormat_YY_MM_DD_NEW } from "../../../../../../shared/utils/utils";
import { useAppContext } from "../../../../../../shared/functions/Context";
import { ICombinedTransaction } from "./AccountTransactionHistory";

interface IProps {
  loading: boolean;
  balance: number;
  data: ICombinedTransaction[];
}

export const AccountTransactionHistoryGrid = observer((props: IProps) => {

  const { store } = useAppContext();

  const { data, balance, loading } = props;

  const columns: GridColDef[] = [
    {
      field: "NOTE",
      headerName: "",
      // width: 200,
      width: 10,
      headerClassName: "grid",
      renderCell: (params) => (
        <>
          {params.row.transaction === "Cancelled" && (
            <span className="badge-acc"></span>
          )}
          {params.row.transaction === "Deposit" && (
            <span className="badge-acc-deposit"></span>
          )}
          {params.row.transaction === "Withdrawal" && (
            <span className="badge-acc-withdrawal"></span>
          )}
          {params.row.transaction !== "Withdrawal" &&
            params.row.transaction !== "Deposit" &&
            params.row.transaction !== "Cancelled" && (
              <span className="badge-acc-else"></span>
            )}
        </>
      ),
    },
    {
      field: "transactionDate",
      headerName: "Transaction Date",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return dateFormat_YY_MM_DD_NEW(params.row.transactionDate);
      },
    },
    {
      field: "valueDate",
      headerName: "Value Date",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        const convertedDate = dateFormat_YY_MM_DD_NEW(params.row.valueDate);
        return convertedDate;
      },
    },
    {
      field: "transaction",
      headerName: "Description",
      width: 200,
      headerClassName: "grid", // Apply the same class for consistency
    },
    {
      field: "pBalance",
      headerName: "Running Balance",
      width: 200,
      renderCell: (params) => {
        const formattedAmount = (params.row.pBalance);
        return formattedAmount;
      },
    },
    {
      field: "amount",
      headerName: "Amount",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => {
        const formattedAmount = (params.row.amount);
        return formattedAmount;
      },
    },
    {
      field: "Current",
      headerName: "Balance",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => params.row.pBalance
    },
  ];

  return (
    <div className="grid">
      <Box sx={{ height: 400 }}>
        <DataGrid
          rows={data}
          columns={columns}
          getRowId={(row) => row.id} // Use the appropriate identifier property
          rowHeight={35}
        />
      </Box>
      <h5>Balance: {(balance)}</h5>
    </div>
  );
});
