import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { IconButton } from "@mui/material";
import { observer } from "mobx-react-lite";
import { OpenInNew } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../../../shared/functions/Context";
import { ILegalEntity } from "../../../../shared/models/clients/LegalEntityModel";
import { INaturalPerson } from "../../../../shared/models/clients/NaturalPersonModel";
import { IRelatedParty } from "../../../../shared/models/stakeholders/RelatedPartyModel";
import AppStore from "../../../../shared/stores/AppStore";
import DataGridFooter from "../../shared/components/toolbar/DataGridFooter";
import DataGridToolbar from "../../shared/components/toolbar/DataGridToolbar";


interface IProps {
  data: (INaturalPerson | ILegalEntity | IRelatedParty)[];
}

export const AllEntitiesGrid = observer(({ data }: IProps) => {

  const onNavigate = useNavigate();

  const { store } = useAppContext();

  const onViewClient = (clientType: string, clientId: string, store: AppStore) => {

    if (clientType === "Individual" || clientType === "Individual") {
      const selectedClient = store.client.naturalPerson.getItemById(clientId);

      if (selectedClient) {
        store.client.naturalPerson.select(selectedClient.asJson);
        onNavigate(`/c/clients/natural-person/${clientId}`);
      }
    } else {
      const selectedClient = store.client.legalEntity.getItemById(clientId);

      if (selectedClient) {
        store.client.legalEntity.select(selectedClient.asJson);
        onNavigate(`/c/clients/legal-entity/${clientId}`);
      }
    }
  };

  const CustomToolbar = () => {
    return (
      <DataGridToolbar
        rightControls={
          <>
            <button className="btn btn-primary" type="button">
              <span data-uk-icon="icon: user-plus-circle; ratio:.8"></span>{" "}
              New Entity Profile
            </button>
          </>
        }
      />
    );
  };

  const CustomFooter = () => {
    return (
      <DataGridFooter
        rightControls={
          <h4 className="main-title-md">
            {/* Total Amount: {currencyFormat(totalValue)} */}
          </h4>
        }
        centerControls={
          <>
            {/* {selectedTransactions.length > 0 && isVisibleProgressbar && <ProgressBar progress={progressPercentage} />} */}
          </>
        }
      />
    );
  };

  const columns: GridColDef[] = [
    {
      field: "entityId",
      headerName: "Entity Id",
      width: 200,
      headerClassName: "grid",
    },
    {
      field: "oldCPNumber",
      headerName: "CP Code (Tasman)",
      width: 200,
      headerClassName: "grid",
    },
    {
      field: "entityDisplayName",
      headerName: "Client Name",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return params.row.entityDisplayName || params.row.stakeholderDisplayName;
      },
    },
    {
      field: "contactNumber",
      headerName: "Contact Number",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return params.row.contactDetail.cellphoneNumber;
      },
      // Apply the same class for consistency
    },
    {
      field: "primary",
      headerName: "Email",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return params.row.contactDetail.emailAddress;
      },
    },
    {
      field: "entityType",
      headerName: "Entity Type",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return params.row.entityType;
      },
    },
    {
      field: "Options",
      headerName: "Options",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => (
        <div>
          <>
            <IconButton
              data-uk-tooltip="View"
              onClick={() => onViewClient(params.row.entityType, params.row.id, store)}
            >
              <OpenInNew />
            </IconButton>
          </>
        </div>
      ),
    }
  ];
  return (
    <div className="grid">
      <DataGrid
        sx={{ height: 430 }}
        loading={!data}
        slots={{
          toolbar: CustomToolbar,
          footer: CustomFooter
        }}
        rows={data}
        columns={columns}
        getRowId={(row) => row.id}
        rowHeight={35}
      />
    </div>
  );
});