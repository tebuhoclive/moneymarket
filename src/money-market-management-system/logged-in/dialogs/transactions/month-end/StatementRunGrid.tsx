import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import { Box, IconButton } from "@mui/material";
import { OpenInNew, PlayArrow } from "@mui/icons-material";
import { useAppContext } from "../../../../../shared/functions/Context";
import Toolbar from "../../../shared/components/toolbar/Toolbar";

interface IStatementRunData {
    id: string,
    entityNumber?: string;
    clientName?: string,
    accountNumber?: string;
    product?: string;
    emailAddress?: string;
}


interface IProps {
    data: IStatementRunData[];
}

export const StatementSummaryGrid = observer(({ data }: IProps) => {

    const { store } = useAppContext();



    const columns: GridColDef[] = [
        {
            field: "entityNumber",
            headerName: "Entity Number",
     width:200,
            headerClassName: "grid",
        },
        {
            field: "clientName",
            headerName: "Client Name",
     width:200,
            headerClassName: "grid",
        },
        {
            field: "accountNumber",
            headerName: "Account Number",
     width:200,
            headerClassName: "grid",
        },
        {
            field: "instrumentName",
            headerName: "Instrument Name",
     width:200,
            headerClassName: "grid",
        },
        {
            field: "product",
            headerName: "Product Code",
     width:200,
            headerClassName: "grid",
        },
        {
            field: "emailAddress",
            headerName: "Email Address",
     width:200,
            headerClassName: "grid",
        },
        {
            field: "rate",
            headerName: "Email Address",
     width:200,
            headerClassName: "grid",
        },
        {
            field: "postalAddress",
            headerName: "Email Address",
     width:200,
            headerClassName: "grid",
        },
        {
            field: "Options",
            headerName: "Options",
     width:200,
            renderCell: (params) => (
                <div>
                    <IconButton
                        data-uk-tooltip="View Statement"
                    >
                        <OpenInNew />
                    </IconButton>
                </div>
            ),
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
                    getRowId={(row) => row.id} // Use the appropriate identifier property
                    rowHeight={40}
                />
            </Box>

        </div>
    );
});
