import { observer } from "mobx-react-lite";
import { Box } from "@mui/material";

import { DataGrid, GridColDef } from "@mui/x-data-grid";

import { useEffect } from "react";

import { CSVRow } from "../../../../../../../shared/interfaces/BankStatements";
import { useAppContext } from '../../../../../../../shared/functions/Context';
import { ToolbarNew } from "../../../../../shared/components/toolbar/Toolbar";
import { numberFormat } from "../../../../../../../shared/functions/Directives";

interface IProp {
    bankName:string;
    transactions: CSVRow[];
    totalUploadedValue: number;
}

export const StatementItemsGrid = observer((props: IProp) => {

    const { bankName, transactions, totalUploadedValue } = props

    const { api } = useAppContext();

    const headers = transactions[bankName === "Standard Bank" ? 0 : 1];

    // const CustomToolbar = () => {
    //     return (
    //         <GridToolbarContainer>
    //             <GridToolbarQuickFilter />
    //         </GridToolbarContainer>
    //     );
    // }

    const columns: GridColDef[] = headers.map((header, index) => ({
        field: `field_${index}`, // Use a unique field name
        headerName: header,
        width: 200, // Adjust the width as needed
        valueGetter: (params) => params.row[index], // Fetch the value from the row
    }));

    useEffect(() => {
        const getData = async () => {
            await api.withdrawalTransaction.getAll();
        };
        getData();
    }, [api.withdrawalTransaction]);

    return (
        <div className="grid">
            <ToolbarNew
                title={
                    <h4 className="main-title-sm">Total Amount: {numberFormat(totalUploadedValue)}</h4>
                }
            />
            <Box sx={{ height: 310 }}>
                <DataGrid
                    loading={!transactions}
                    // slots={{
                    //     toolbar: CustomToolbar,
                    // }}
                    rows={transactions.slice(bankName === "Standard Bank" ? 0 : 2).map((row, id) => ({ id, ...row }))}
                    columns={columns}
                    // getRowId={(row) => row.statementIdentifier} // Use the appropriate identifier property
                    rowHeight={25}
                />
            </Box>
        </div>
    );
});

