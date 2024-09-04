import { IconButton, Box } from "@mui/material";
import { GridColDef, DataGrid } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";

import { useNavigate } from "react-router-dom";
import MODAL_NAMES from "../../../../dialogs/ModalName";
import { getEnvironment } from "../../../../../../shared/config/firebase-config";
import { useAppContext } from "../../../../../../shared/functions/Context";
import showModalFromId from "../../../../../../shared/functions/ModalShow";
import { INaturalPerson } from "../../../../../../shared/models/clients/NaturalPersonModel";
import AppStore from "../../../../../../shared/stores/AppStore";
import Modal from "../../../../../../shared/components/Modal";
import { OpenInNew } from "@mui/icons-material";
import Money from "@mui/icons-material/Money";
import { hasFeaturePermission } from "../../../../../../shared/functions/users-management/UserFeaturePermissionFunctions";
import DataGridFooter from "../../../../shared/components/toolbar/DataGridFooter";
import DataGridToolbar from "../../../../shared/components/toolbar/DataGridToolbar";

interface IProps {
  data: INaturalPerson[];
}

export const NaturalPersonGrid = observer(({ data }: IProps) => {
  const { store } = useAppContext();
  const onNavigate = useNavigate();

  const onView = (clientId: string, store: AppStore) => {

    const selectedClient = store.client.naturalPerson.getItemById(clientId);

    if (selectedClient) {
      store.client.naturalPerson.select(selectedClient.asJson);
      onNavigate(`/c/clients/natural-person/${clientId}`);
    }
  };

  const newEntity = () => {
    showModalFromId(MODAL_NAMES.ADMIN.NATURAL_PERSON_MODAL);
  };

  const newDocFoxEntity = () => {
    showModalFromId(MODAL_NAMES.BACK_OFFICE.DOC_FOX_ENTITY_TYPE_MODAL);
  };

  // const importEntities = () => {
  //   showModalFromId(MODAL_NAMES.DATA_MIGRATION.IMPORT_CLIENT_ENTITY_MODAL);
  // };

  // const importBank = () => {
  //   showModalFromId(
  //     MODAL_NAMES.DATA_MIGRATION.IMPORT_NATURAL_CLIENT_BANK_ACCOUNTS_MODAL
  //   );
  // };

  const onAddBankAccount = (clientId: string, store: AppStore) => {
    const selectedClient = store.client.naturalPerson.getItemById(clientId);
    if (selectedClient) {
      store.client.naturalPerson.select(selectedClient.asJson);
      showModalFromId(MODAL_NAMES.ADMIN.UPDATE_NATURAL_PERSON_BANK_MODAL);
    }
  };

  const user = store.auth.meJson;

  const hasClientOnBoardingPermission = user?.feature.some(
    (feature) =>
      feature.featureName === "Client On-Boarding" && feature.create === true
  );

  const CustomToolbar = () => {
    return (
      <DataGridToolbar
        rightControls={
          <>
            {hasClientOnBoardingPermission &&
              <>
                <button
                  className="btn btn-primary"
                  onClick={newEntity}
                  type="button"
                >
                  <span data-uk-icon="icon: user-plus-circle; ratio:.8"></span>{" "}
                  On-Boarding (Offline)
                </button>
                <button
                  className="btn btn-primary"
                  onClick={newDocFoxEntity}
                  type="button"
                  disabled
                >
                  <span data-uk-icon="icon: user-plus-circle; ratio:.8"></span>{" "}
                  On-Boarding (DocFox)
                </button>
                {
                  getEnvironment()?.env !== "Live" &&
                  <>
                    {/* <button
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
                </button> */}
                  </>
                }
              </>
            }
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
    {
      field: "oldCPNumber",
      headerName: "CP Code",
      width: 200,
      headerClassName: "grid",
    },
    {
      field: "clientName",
      headerName: "First Name",
      width: 200,
      headerClassName: "grid",
    },
    {
      field: "clientSurname",
      headerName: "Last Name",
      width: 200,
      headerClassName: "grid",
      // Apply the same class for consistency
    },
    {
      field: "idNumber",
      headerName: "ID Number",
      width: 200,
      headerClassName: "grid",
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
      field: "Options",
      headerName: "Options",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => (
        <>
          {/* {hasFeaturePermission(store, "Client Profile Management", "update") && ( */}
          <>
            {" "}
            <IconButton
              data-uk-tooltip="Add Bank Account"
              onClick={() => onAddBankAccount(params.row.id, store)}
            >
              <Money />
            </IconButton>
          </>
          {/* )} */}
          {hasFeaturePermission(store, "Client Profile Management", "read") && (
            <>
              <IconButton
                data-uk-tooltip="View"
                onClick={() => onView(params.row.id, store)}
              >
                <OpenInNew />
              </IconButton>
            </>
          )}
        </>
      ),
    }
  ];


  return (
    <div className="grid">
      <Box sx={{ height: 430 }}>
        <DataGrid
          loading={!data}
          slots={{
            toolbar: CustomToolbar,
            footer: CustomFooter
          }}
          rows={data}
          columns={columns}
          getRowId={(row) => row.id} // Use the appropriate identifier property
          rowHeight={35}
        />
      </Box>

      <Modal modalId={MODAL_NAMES.BACK_OFFICE.EXPORT_REPORT_DATA}>
        <div
          className="custom-modal-style uk-modal-dialog uk-modal-body uk-margin-auto-vertical"
          style={{ width: "50%" }}
        >
          <button
            className="uk-modal-close-default"
            type="button"
            data-uk-close
          ></button>
        </div>
      </Modal>
    </div>
  );
});
