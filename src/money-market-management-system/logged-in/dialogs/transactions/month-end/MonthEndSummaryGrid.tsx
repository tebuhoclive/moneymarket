import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import { Box, IconButton } from "@mui/material";
import { useAppContext } from "../../../../../shared/functions/Context";
import Toolbar from "../../../shared/components/toolbar/Toolbar";
import { getAccountNumber } from "../../../../../shared/functions/MyFunctions";

interface IMonthEndRunData {
    accountId?: string;
    clientName?: string,
    rate?: number;
    monthTotalInterest?: number;
    days?: number;
    balance?: number;
    totalNewBalance?: number;
}


interface IProps {
    data: IMonthEndRunData[];
}

export const MonthEndSummary = observer(({ data }: IProps) => {

    const { store } = useAppContext();



    const columns: GridColDef[] = [
        {
            field: "accountId",
            headerName: "Account Number",
     width:200,
            headerClassName: "grid",
            valueGetter: (params) => {
                const accountNumber = getAccountNumber(params.row.accountId, store);
                return accountNumber;
            }
        },
        {
            field: "clientName",
            headerName: "Client Name",
     width:200,
            headerClassName: "grid",
        },
        {
            field: "rate",
            headerName: "Client Rate",
     width:200,
            headerClassName: "grid",
            valueGetter: (params) => {
                const $rate = params.row.rate;
                return $rate;
            }
        },
        {
            field: "balance",
            headerName: "Last balance",
     width:200,
            headerClassName: "grid",
            valueGetter: (params) => {
                const $balance = (params.row.balance);
                return $balance
            }

        },
        {
            field: "days",
            headerName: "Days",
     width:200,
            headerClassName: "grid",
        },
        {
            field: "monthTotalInterest",
            headerName: "Accrued Interest",
     width:200,
            headerClassName: "grid",
            valueGetter: (params) => {
                const $monthTotalInterest = params.row.monthTotalInterest;
                return $monthTotalInterest;
            }
        },
        {
            field: "",
            headerName: "Balance After Month End Run",
     width:200,
            headerClassName: "grid",
            valueGetter: (params) => {
                const $totalNewBalance = params.row.totalNewBalance;
                return $totalNewBalance;
            }
        },
    ];

    return (
        <div className="grid">
            <Toolbar
                leftControls={
                    <></>
                }
            />
            <Box sx={{ height: 330 }}>
                <DataGrid
                    rows={data}
                    columns={columns}
                    getRowId={(row) => row.accountId} // Use the appropriate identifier property
                    rowHeight={40}
                />
            </Box>

        </div>
    );
});
