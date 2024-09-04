import { Box } from "@mui/material";
import { GridToolbarContainer, GridToolbarQuickFilter, GridCsvExportMenuItem, GridColDef, DataGrid } from "@mui/x-data-grid";

const ProductRateDropHistoryGrid = () => {

    const data: any[] = [];

    const CustomToolbar = () => {
        return (
            <GridToolbarContainer>
                <GridToolbarQuickFilter />
                <GridCsvExportMenuItem />
            </GridToolbarContainer>
        );
    }

    const columns: GridColDef[] = [
        {
            field: "dateTimeChanged",
            headerName: "Date/Time Changed",
     width:200,
            headerClassName: "grid",
        },
        {
            field: "effectiveDate",
            headerName: "Effective Date",
     width:200,
            headerClassName: "grid",
        },
        {
            field: "basisPoints",
            headerName: "Basis Points",
     width:200,
            headerClassName: "grid",
        },
        {
            field: "createdBy",
            headerName: "Created By",
     width:200,
            headerClassName: "grid",
        }
    ];

    return (
        <div className="grid">
            <Box sx={{ height: 400 }}>
                <DataGrid
                    loading={!data}
                    slots={{
                        toolbar: CustomToolbar,
                    }}
                    rows={data}
                    columns={columns}
                    getRowId={(row) => row.id} // Use the appropriate identifier property
                    rowHeight={35}
                />
            </Box>
        </div>
    );
}

export default ProductRateDropHistoryGrid
