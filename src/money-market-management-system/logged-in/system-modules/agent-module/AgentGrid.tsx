import {
  DataGrid,
  GridColDef,
  GridCheckCircleIcon,
  GridRenderCellParams,
} from "@mui/x-data-grid";

import { observer } from "mobx-react-lite";
import { Box, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";

import MODAL_NAMES from "../../dialogs/ModalName";
import OpenInNew from "@mui/icons-material/ViewCompact";
import EditIcon from "@mui/icons-material/Edit";
import { useAppContext } from "../../../../shared/functions/Context";
import showModalFromId from "../../../../shared/functions/ModalShow";
import { IAgent } from "../../../../shared/models/clients/agent/AgentModel";

interface IProps {
  data: IAgent[];
}

export const AgentGrid = observer(({ data }: IProps) => {
  const { store } = useAppContext();
  const navigate = useNavigate();

  const verified = data.some((agent) => agent.status === "Verified");

  const onVerify = (agentId: string) => {
    const selectedAgent = store.agent.getItemById(agentId);

    if (selectedAgent) {
      store.agent.select(selectedAgent.asJson);
      showModalFromId(MODAL_NAMES.ADMIN.AGENT_MODAL);
    }
  };
  const onView = (agentId: string) => {
    const selectedAgent = store.agent.getItemById(agentId);

    if (selectedAgent) {
      store.agent.select(selectedAgent.asJson);
      showModalFromId(MODAL_NAMES.ADMIN.AGENT_AUDIT_MODAL);
    }
  };
  const onEdit = (agentId: string) => {
    const selectedAgent = store.agent.getItemById(agentId);

    if (selectedAgent) {
      store.agent.select(selectedAgent.asJson);
      showModalFromId(MODAL_NAMES.ADMIN.AGENT_EDIT_MODAL);
    }
  };
  
  const columns: GridColDef[] = [
    {
      field: "agentName",
      headerName: "Name",
      width: 200,
    },
    {
      field: "bankName",
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
    ...(!verified
      ? [
          {
            field: "Options",
            headerName: "Options",
     width:200,
            renderCell: (params: GridRenderCellParams) => (
              <>
                <IconButton
                  onClick={() => onVerify(params.row.id)}
                  data-uk-tooltip="Verify"
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
                  data-uk-tooltip="View"
                  onClick={() => onView(params.row.id)}
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
