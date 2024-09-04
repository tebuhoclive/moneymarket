import {
  DataGrid,
  GridColDef,
  GridCheckCircleIcon,
  GridRenderCellParams,
} from "@mui/x-data-grid";

import { observer } from "mobx-react-lite";
import { Box, IconButton } from "@mui/material";
import MODAL_NAMES from "../../dialogs/ModalName";
import EditIcon from "@mui/icons-material/Edit";
import OpenInNew from "@mui/icons-material/ViewCompact";
import { useAppContext } from "../../../../shared/functions/Context";
import showModalFromId from "../../../../shared/functions/ModalShow";
import { ICounterParty } from "../../../../shared/models/clients/counter-party/CounterPartyModel";

interface IProps {
  data: ICounterParty[];
}

export const CounterPartyGrid = observer(({ data }: IProps) => {
  const { store } = useAppContext();

  const verified = data.some((party) => party.status === "Verified");

  const onVerify = (partyId: string) => {
    const selectedCounterParty = store.counterParty.getItemById(partyId);

    if (selectedCounterParty) {
      store.counterParty.select(selectedCounterParty.asJson);
      showModalFromId(MODAL_NAMES.ADMIN.COUNTER_PARTY_MODAL);
    }
  };

  const onView = (partyId: string) => {
    const selectedCounterParty = store.counterParty.getItemById(partyId);

    if (selectedCounterParty) {
      store.counterParty.select(selectedCounterParty.asJson);
      showModalFromId(MODAL_NAMES.ADMIN.COUNTER_PARTY_AUDIT_MODAL);
    }
  };
  const onEdit = (partyId: string) => {
    const selectedCounterParty = store.counterParty.getItemById(partyId);

    if (selectedCounterParty) {
      store.counterParty.select(selectedCounterParty.asJson);
      showModalFromId(MODAL_NAMES.ADMIN.COUNTER_PARTY_EDIT_MODAL);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "counterpartyName",
      headerName: "Name",
      width: 200,
    },
    {
      field: "bank",
      headerName: "Bank Name",
      width: 200,
    },
    {
      field: "branch",
      headerName: "Branch",
      width: 200,
    },
    {
      field: "accountNumber",
      headerName: "Account Number",
      width: 200,
    },
    {
      field: "accountHolder",
      headerName: "Account Holder",
      width: 200,
    },
    ...(!verified
      ? [
          {
            field: "Options",
            headerName: "Options",
     width:200,
            renderCell: (params: GridRenderCellParams) => (
              <>
                <IconButton
                  data-uk-tooltip="Verify"
                  onClick={() => onVerify(params.row.id)}
                >
                  <GridCheckCircleIcon />
                </IconButton>
                <IconButton
                  onClick={() => onView(params.row.id)}
                  data-uk-tooltip="View"

                >
                    <OpenInNew />
                </IconButton>
                <IconButton
                  onClick={() => onEdit(params.row.id)}
                  data-uk-tooltip="Edit"
                >
                  <EditIcon />
                </IconButton>
              </>
            ),
          },
        ]
      : [
          {
            field: "Options",
            headerName: "Options",
     width:200,
            renderCell: (params: GridRenderCellParams) => (
              <>
                <IconButton
                  onClick={() => onView(params.row.id)}
                  data-uk-tooltip="View"

                >
                  <OpenInNew/>
                </IconButton>
                <IconButton
                  onClick={() => onEdit(params.row.id)}
                  data-uk-tooltip="Edit"
                >
                  <EditIcon />
                </IconButton>
              </>
            ),
          },
        ]),
  ];

  return (
    <div className="grid">
      <Box sx={{ height: 400 }}>
        <DataGrid
          rows={data}
          columns={columns}
          getRowId={(row) => row.id}
          rowHeight={50}
        />
      </Box>
    </div>
  );
});
