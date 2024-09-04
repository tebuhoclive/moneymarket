import { IconButton, Box } from "@mui/material";
import { GridColDef, DataGrid } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import RunningWithErrorsIcon from "@mui/icons-material/RunningWithErrors";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../../../../shared/functions/Context";
import showModalFromId from "../../../../../shared/functions/ModalShow";
import { IClientBankingDetails } from "../../../../../shared/models/clients/ClientShared";
import AppStore from "../../../../../shared/stores/AppStore";
import MODAL_NAMES from "../../ModalName";

interface IProps {
  data: IClientBankingDetails[];
}

export const OtherClientFormsGrid = observer(({ data }: IProps) => {
  const { store } = useAppContext();
  const onNavigate = useNavigate();
  const user = store.auth.meJson;

  const onView = (clientId: string, store: AppStore) => {
    const selectedClient = store.client.legalEntity.getItemById(clientId);
    if (selectedClient) {
      store.client.legalEntity.select(selectedClient.asJson);
      onNavigate(`/c/clients/legal-entity/${clientId}`);
    }
  };

  const onEdit = (clientId: string, store: AppStore) => {
    const selectedClient = store.client.legalEntity.getItemById(clientId);
    if (selectedClient) {
      store.client.legalEntity.select(selectedClient.asJson);
      showModalFromId(MODAL_NAMES.ADMIN.LEGAL_ENTITY_MODAL);
    }
  };

  const hasClientProfileManagementPermission = user?.feature.some(
    (feature) =>
      feature.featureName === "Client Profile Management" &&
      feature.read === true
  );
  const hasEditPermission = user?.feature.some(
    (feature) =>
      feature.featureName === "Client Profile Management" && feature.update === true
  );
  const hasVerifyPermission = user?.feature.some(
    (feature) =>
      feature.featureName === "Client Profile Management" && feature.verify === true
  );
  const columns: GridColDef[] = [
    {
      field: "bankName",
      headerName: "Bank Name",
      width: 200,
      headerClassName: "grid",
    },
    {
      field: "branch",
      headerName: "Branch Name",
      width: 200,
      headerClassName: "grid",
    },
    {
      field: "branchNumber",
      headerName: "Branch Number",
      width: 200,
      headerClassName: "grid",
      // Apply the same class for consistency
    },
    {
      field: "accountHolder",
      headerName: "Account Holder",
      width: 200,
      headerClassName: "grid",
    },
    {
      field: "accountNumber",
      headerName: "Account Number",
      width: 200,
      headerClassName: "grid",
      // Apply the same class for consistency
    },
    {
      field: "accountType",
      headerName: "Account Type",
      width: 200,
      headerClassName: "grid",
    },
    {
      field: "accountVerificationStatus",
      headerName: "Account Verification Status",
      width: 200,
      headerClassName: "grid",
    },
    hasClientProfileManagementPermission
      ? {
          field: "Options",
          headerName: "Options",
   width:200,
          headerClassName: "grid",
          renderCell: (params) => (
            <div>
              {hasEditPermission && (
                <>  <IconButton
                data-uk-tooltip="Edit"
                onClick={() => onEdit(params.row.id, store)}
              >
                <EditIcon />
              </IconButton></>
              )}
              {hasVerifyPermission && (
                <>
                  <IconButton
                    data-uk-tooltip="Verify"
                    onClick={() => onView(params.row.id, store)}
                  >
                    <RunningWithErrorsIcon />
                  </IconButton>
                </>
              )}
            </div>
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
          getRowId={(row) => row.key} // Use the appropriate identifier property
          rowHeight={50}
        />
      </Box>
    </div>
  );
});
