import { IconButton, Box } from "@mui/material";
import { GridColDef, DataGrid } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { ITreasuryBill } from "../../../../../../shared/models/instruments/TreasuryBillModel";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import {OpenInNew} from "@mui/icons-material";
import { dateFormat_YY_MM_DD } from "../../../../../../shared/utils/utils";
import { History } from "@mui/icons-material";
import { useAppContext } from "../../../../../../shared/functions/Context";

interface IProps {
  data: ITreasuryBill[];
}

export const PurchaseTBGrid = observer(({ data }: IProps) => {
  const { store } = useAppContext();
  const onNavigate = useNavigate();

  const onContinue = (instrumentId: string) => {
    const selectedInstrument =
      store.instruments.treasuryBill.getItemById(instrumentId);
    console.log(selectedInstrument);

    if (selectedInstrument) {
      store.instruments.treasuryBill.select(selectedInstrument.asJson);
      onNavigate(`/c/purchases/submitted/${selectedInstrument.asJson.id}`);
    }
  };

  const onTender = (instrumentId: string) => {
    const selectedInstrument =
      store.instruments.treasuryBill.getItemById(instrumentId);

    if (selectedInstrument) {
      store.instruments.treasuryBill.select(selectedInstrument.asJson);
      onNavigate(`/c/purchases/allocation-treasury-bill/${selectedInstrument.asJson.id}`);
    }
  };

  const hasAllocations = (instrumentId: string) => {
    const selectedInstrument =
      store.instruments.treasuryBill.getItemById(instrumentId);

    if (selectedInstrument) {
      if (
        selectedInstrument.asJson.instrumentStatus === "allocated" ||
        selectedInstrument.asJson.instrumentStatus === "tendered"
      ) {
        return true;
      }
      return false;
    }
  };

  const canTender = (instrumentId: string) => {
    const selectedInstrument =
      store.instruments.treasuryBill.getItemById(instrumentId);
    const today = Date.now();
    if (selectedInstrument) {
      if (selectedInstrument.asJson.maturityDate) {
        const difference = selectedInstrument?.asJson.maturityDate - today;
        const millisecondsPerDay = 24 * 60 * 60 * 1000;
        const dtm = Math.floor(difference / millisecondsPerDay);

        if (dtm >= 0 && dtm <= 14) {
          return true;
        } else {
          return false;
        }
      }
    }
  };

  const columns: GridColDef[] = [
    {
      field: "instrumentName",
      headerName: "Description",
      width: 200,
      headerClassName: "grid",
    },
    {
      field: "issueDate",
      headerName: "Issue Date",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return `${dateFormat_YY_MM_DD(params.row.issueDate)}`;
      },
    },
    {
      field: "maturityDate",
      headerName: "Maturity Date",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return `${dateFormat_YY_MM_DD(params.row.maturityDate)}`;
      },
      // Apply the same class for consistency
    },
    {
      field: "daysToMaturity",
      headerName: "Period",
      width: 200,
      headerClassName: "grid",
    },
    // {
    //   field: "dtm",
    //   headerName: "DTM",
    //   width: 200,
    //   headerClassName: "grid",
    //   // Apply the same class for consistency
    // },
    // {
    //   field: "instrumentStatus",
    //   headerName: "Status",
    //   width: 200,
    //   headerClassName: "grid",
    //   // Apply the same class for consistency
    // },
    {
      field: "Options",
      headerName: "Options",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => (
        <>
          {canTender(params.row.id) && (
            <>
              <IconButton
                data-uk-tooltip="Tender"
                onClick={() => onTender(params.row.id)}
              >
                <OpenInNew />
              </IconButton>
            </>
          )}
          {hasAllocations(params.row.id) && (
            <>
              <IconButton
                data-uk-tooltip="Continue"
                onClick={() => onContinue(params.row.id)}
              >
                <AssignmentReturnIcon />
              </IconButton>
            </>
          )}
          {!hasAllocations(params.row.id) && (
            <>
              <IconButton
                data-uk-tooltip="View Allocation"
                onClick={() => onTender(params.row.id)}
              >
                <History />
              </IconButton>
            </>
          )}
        </>
      ),
    },
  ];

  return (
    <>
      <div className="grid">
        <Box sx={{ height: 500 }}>
          <DataGrid
            rows={data}
            columns={columns}
            getRowId={(row) => row.id} // Use the appropriate identifier property
            rowHeight={50}
          />
        </Box>
      </div>
    </>
  );
});
