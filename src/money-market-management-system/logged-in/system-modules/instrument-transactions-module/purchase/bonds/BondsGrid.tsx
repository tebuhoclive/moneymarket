import { IconButton, Box } from "@mui/material";
import { GridColDef, DataGrid } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";

import { useNavigate } from "react-router-dom";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import OpenInNew from "@mui/icons-material/ViewCompact";
import { useAppContext } from "../../../../../../shared/functions/Context";
import { IBond } from "../../../../../../shared/models/instruments/BondModel";
import { dateFormat_YY_MM_DD } from "../../../../../../shared/utils/utils";

interface IProps {
  data: IBond[];
}

export const BondsGrid = observer(({ data }: IProps) => {
  const { store } = useAppContext();
  const user = store.auth.meJson;
  const onNavigate = useNavigate();

  //onContinue next
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
      store.instruments.bond.getItemById(instrumentId);

    if (selectedInstrument) {
      store.instruments.bond.select(selectedInstrument.asJson);
      onNavigate(`/c/purchases/allocation-bonds/${selectedInstrument.asJson.id}`);
    }
  };

  const hasAllocations = (instrumentId: string) => {
    console.log("Has Allocations: " + instrumentId);

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
    console.log("Can Tender: " + instrumentId);
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

  const hasInstrumentTenderingPurchaseSalesPermission = user?.feature.some(
    (feature) =>
      feature.featureName === "Instrument Tendering/Purchase/Sales" &&
      feature.read === true
  );

  const columns: GridColDef[] = [
    {
      field: "instrumentName",
      headerName: "Description",
      width: 200,
      headerClassName: "grid",
    },
    {
      field: "maturityDate",
      headerName: "Maturity Date",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => {
        const formattedDate = dateFormat_YY_MM_DD(params.row.maturityDate);
        return <span>{formattedDate}</span>;
      },
    },
    {
      field: "couponRate",
      headerName: "Coupon Rate",
      width: 200,
      headerClassName: "grid",
      // Apply the same class for consistency
    },
    {
      field: "couponFrequency",
      headerName: "Coupon Frequency",
      width: 200,
      headerClassName: "grid",
    },
    {
      field: "nextCouponDate",
      headerName: "Next Coupon Date",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => {
        const formattedDate = dateFormat_YY_MM_DD(params.row.maturityDate);
        return <span>{formattedDate}</span>;
      },
    },
    {
      field: "price",
      headerName: "Price",
      width: 200,
      headerClassName: "grid",
    },
    {
      field: "instrumentStatus",
      headerName: "Status",
      width: 200,
      headerClassName: "grid",
      // Apply the same class for consistency
    },
    hasInstrumentTenderingPurchaseSalesPermission
      ? {
        field: "Options",
        headerName: "Options",
 width:200,
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
                  data-uk-tooltip="Tender"
                  onClick={() => onTender(params.row.id)}
                >
                  <OpenInNew />
                </IconButton>
              </>
            )}
          </>
        ),
      }
      : ({} as GridColDef),
  ];

  return (
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
  );
});
