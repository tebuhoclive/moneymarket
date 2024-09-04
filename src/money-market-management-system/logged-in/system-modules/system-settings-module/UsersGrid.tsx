import { IconButton } from "@mui/material";
import { GridColDef, DataGrid } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import EditIcon from "@mui/icons-material/Edit";
import { useAppContext } from "../../../../shared/functions/Context";
import showModalFromId from "../../../../shared/functions/ModalShow";
import { IUser } from "../../../../shared/models/User";
import MODAL_NAMES from "../../dialogs/ModalName";
import UserModal from "../../dialogs/user/UserModal";
import Modal from "../../../../shared/components/Modal";
import DeleteIcon from '@mui/icons-material/Delete';
import DataGridToolbar from "../../shared/components/toolbar/DataGridToolbar";
import DataGridFooter from "../../shared/components/toolbar/DataGridFooter";

interface IProps {
  data: IUser[];
}

export const UsersGrid = observer(({ data }: IProps) => {
  const { store } = useAppContext();

  const onAddNewUser = () => {
    store.user.clearSelected();
    showModalFromId(MODAL_NAMES.ADMIN.USER_MODAL);
  }

  const onEdit = (userId: string) => {
    const selectedUser = store.user.getItemById(userId);
    if (selectedUser) {
      store.user.select(selectedUser.asJson);
      showModalFromId(MODAL_NAMES.ADMIN.USER_MODAL);
    }
  }

  const onDisable = async (userId: string) => {
    const selectedUser = store.user.getItemById(userId);

    if (selectedUser) {
      // await api.user.delete(selectedUser.asJson)
    }
  }

  const CustomToolbar = () => {
    return (
      <DataGridToolbar
        rightControls={
          <button className="btn btn-primary" onClick={onAddNewUser}>
            Add New User
          </button>
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
      field: "displayName",
      headerName: "Name",
      width: 200,
      headerClassName: "grid",
    },
    {
      field: "email",
      headerName: "Email",
      width: 200,
      headerClassName: "grid",
    },
    {
      field: "role",
      headerName: "Role",
      width: 200,
      headerClassName: "grid",
    },
    {
      field: "department",
      headerName: "Department",
      width: 200,
      headerClassName: "grid",
    },
    {
      field: "jobTitle",
      headerName: "Job Title",
      width: 200,
      headerClassName: "grid",
    }, {
      field: "Options",
      headerName: "Options",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => (
        <div>
          <IconButton
            data-uk-tooltip="Edit"
            onClick={() => onEdit(params.row.id)}
          >
            <EditIcon />
          </IconButton>

          <IconButton
            data-uk-tooltip="Disable"
            onClick={() => onDisable(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
        </div>
      ),
    }
  ];

  return (
    <>
      <div className="grid">
        <DataGrid
          sx={{ height: 'auto', maxHeight: 560, marginTop: 1 }}
          slots={{
            toolbar: CustomToolbar,
            footer: CustomFooter
          }}
          rows={data}
          columns={columns}
          getRowId={(row) => row.uid} // Use the appropriate identifier property
          rowHeight={30}
        />
      </div>
      <div>
        <Modal modalId={MODAL_NAMES.ADMIN.USER_MODAL}>
          <UserModal />
        </Modal>
      </div>
    </>
  );
});

