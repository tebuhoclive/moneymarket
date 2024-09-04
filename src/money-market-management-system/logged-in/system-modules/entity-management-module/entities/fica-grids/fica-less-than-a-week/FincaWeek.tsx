import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { observer } from "mobx-react-lite";
import { INaturalPerson } from "../../../../../../../shared/models/clients/NaturalPersonModel";

interface IProps {
  data: INaturalPerson[];
}

export const FincaWeek = observer(({ data }: IProps) => {
  const columns: GridColDef[] = [
    {
      field: "entity",
      headerName: "Client EntityId",
      width: 200,
      headerClassName: "grid",
    },
    {
      field: "dateOfNextFIA",
      headerName: "Date of Next FIA",
      width: 200,
      headerClassName: "grid",
    },
  ];
  return (
    <div className="grid">
      <h5 style={{ fontSize: "14px", fontWeight: "600" }}>Overdue FIA</h5>
      <Box sx={{ height: 300 }}>
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
