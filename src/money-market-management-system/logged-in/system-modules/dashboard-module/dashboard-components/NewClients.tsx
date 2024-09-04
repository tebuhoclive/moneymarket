import { Box } from "@mui/material";
import { GridColDef, DataGrid } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import { ILegalEntity } from "../../../../../shared/models/clients/LegalEntityModel";

interface IProps {
  data: ILegalEntity[];
}

export const LegalEntityTable = observer(({ data }: IProps) => {

  const columns: GridColDef[] = [
    {
      field: "entityDisplayName",
      headerName: "Client Name",
      width: 200,
      headerClassName: "grid",
    },
    {
      field: "dateCreated",
      headerName: "Date Registered",
      width: 200,
      headerClassName: "grid",
    },
    {
      field: "riskRating",
      headerName: "Risk Rating",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) =>
        params.row.relatedParty?.[0]?.riskRating || "N/A",
    },
  ];

  return (
    <div className="grid">
      <Box sx={{ height: 200 }}>
        <DataGrid
          rows={data}
          columns={columns}
          getRowId={(row) => row.id} // Use the appropriate identifier property
          rowHeight={50}
        />
      </Box>
    </div>
  );
});
