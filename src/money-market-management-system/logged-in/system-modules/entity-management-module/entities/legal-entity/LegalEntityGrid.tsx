import { IconButton, Box } from "@mui/material";
import { GridColDef, DataGrid } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import MODAL_NAMES from "../../../../dialogs/ModalName";
import { useAppContext } from "../../../../../../shared/functions/Context";
import showModalFromId from "../../../../../../shared/functions/ModalShow";
import { ILegalEntity } from "../../../../../../shared/models/clients/LegalEntityModel";
import AppStore from "../../../../../../shared/stores/AppStore";
import { OpenInNew } from "@mui/icons-material";
import Money from "@mui/icons-material/Money";
import DataGridToolbar from "../../../../shared/components/toolbar/DataGridToolbar";
import DataGridFooter from "../../../../shared/components/toolbar/DataGridFooter";



interface IProps {
  data: ILegalEntity[];
}

export const LegalEntityGrid = observer(({ data }: IProps) => {
  const { store } = useAppContext();
  const user = store.auth.meJson;
  const onNavigate = useNavigate();

  const onView = (clientId: string, store: AppStore) => {
    const selectedClient = store.client.legalEntity.getItemById(clientId);

    if (selectedClient) {
      store.client.legalEntity.select(selectedClient.asJson);
      onNavigate(`/c/clients/legal-entity/${clientId}`); //not yet implemented
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
      feature.featureName === "Client Profile Management" &&
      feature.update === true
  );
  const hasViewPermission = user?.feature.some(
    (feature) =>
      feature.featureName === "Client Profile Management" &&
      feature.read === true
  );

  const onAddBankAccount = (clientId: string, store: AppStore) => {
    const selectedClient = store.client.legalEntity.getItemById(clientId);
    if (selectedClient) {
      store.client.legalEntity.select(selectedClient.asJson);
      showModalFromId(MODAL_NAMES.ADMIN.UPDATE_LEGAL_BANK_MODAL);
    }
  };


  const hasClientOnBoardingPermission = user?.feature.some(
    (feature) =>
      feature.featureName === "Client On-Boarding" && feature.create === true
  );

  const newEntity = () => {
    showModalFromId(MODAL_NAMES.ADMIN.LEGAL_ENTITY_MODAL);
  };

  // const importEntities = () => {
  //   showModalFromId(MODAL_NAMES.DATA_MIGRATION.IMPORT_LEGAL_ENTITY_MODAL);
  // };

  // const importBank = () => {
  //   showModalFromId(
  //     MODAL_NAMES.DATA_MIGRATION.IMPORT_NATURAL_CLIENT_BANK_ACCOUNTS_MODAL
  //   );
  // };

  const CustomToolbar = () => {
    return (
      <DataGridToolbar
        rightControls={
          <>
            {hasClientOnBoardingPermission && (
              <>
                {" "}
                <button
                  className="btn btn-primary"
                  onClick={newEntity}
                  type="button"
                >
                  <span data-uk-icon="icon: user-plus-circle; ratio:.8"></span>{" "}
                  On-Boarding (Offline)
                </button>
                <button className="btn btn-primary" type="button" disabled>
                  <span data-uk-icon="icon: user-plus-circle; ratio:.8"></span>{" "}
                  On-Boarding (DocFox)
                </button>

                {/* <button
                  className="btn btn-text"
                  onClick={importEntities}
                  type="button"
                >
                  <span data-uk-icon="icon: user-plus-circle; ratio:.8"></span>{" "}
                  Import
                </button> */}
                {/* {
                  getEnvironment()?.env !== "Live" &&
                  <>
                    <button
                      className="btn btn-text"
                      onClick={importEntities}
                      type="button"
                    >
                      <span data-uk-icon="icon: user-plus-circle; ratio:.8"></span>{" "}
                      Import
                    </button>

                    <button className="btn btn-text" onClick={importBank} type="button" >
                      <span data-uk-icon="icon: user-plus-circle; ratio:.8"></span>{" "}
                      Import Bank Accounts
                    </button>
                  </>
                } */}

              </>
            )}
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
      headerName: "Entity ID",
      width: 200,
      headerClassName: "grid",
    },
    // {
    //   field: "clientRegisteredName",
    //   headerName: "Registered Name",
    //   width: 200,
    //   headerClassName: "grid",
    // },
    {
      field: "oldCPNumber",
      headerName: "Tasman CP Code",
      width: 200,
      headerClassName: "grid",
      // Apply the same class for consistency
    },
    {
      field: "clientTradingName",
      headerName: "Trading Name",
      width: 200,
      headerClassName: "grid",
      // Apply the same class for consistency
    },
    {
      field: "registrationNumber",
      headerName: "Registration No.",
      width: 200,
      headerClassName: "grid",
    },
    {
      field: "cellphoneNumber",
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
      field: "secondary",
      headerName: "Secondary Email",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return params.row.contactDetail.emailAddressSecondary;
      },
    },
    {
      field: "address",
      headerName: "Postal Address",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return params.row.contactDetail.postalAddress;
      },
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
              <>
                <IconButton
                  data-uk-tooltip="Edit"
                  onClick={() => onEdit(params.row.id, store)}
                >
                  <EditIcon />
                </IconButton>
              </>
            )}
            <IconButton
              data-uk-tooltip="Add Bank Account"
              onClick={() => onAddBankAccount(params.row.id, store)}
            >
              <Money />
            </IconButton>
            {hasViewPermission && (
              <>
                {" "}
                <IconButton
                  data-uk-tooltip="View"
                  onClick={() => onView(params.row.id, store)}
                >
                  <OpenInNew />
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
          loading={!data}
          slots={{
            toolbar: CustomToolbar,
            footer: CustomFooter
          }}
          rows={data}
          columns={columns}
          getRowId={(row) => row.id} // Use the appropriate identifier property
          rowHeight={50}
        />
      </Box>
    </div>
  );
});
