import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { ICessionInstruction } from '../../../../../../../shared/models/cession/CessionInstructionModel';
import { observer } from 'mobx-react-lite';
import DataGridToolbar from '../../../../../shared/components/toolbar/DataGridToolbar';
import DataGridFooter from '../../../../../shared/components/toolbar/DataGridFooter';
import { currencyFormat } from '../../../../../../../shared/functions/Directives';
import MODAL_NAMES from '../../../../../dialogs/ModalName';
import showModalFromId from '../../../../../../../shared/functions/ModalShow';
import { useAppContext } from '../../../../../../../shared/functions/Context';
import { IMoneyMarketAccount } from '../../../../../../../shared/models/money-market-account/MoneyMarketAccount';
import { getUser } from '../../../../../../../shared/functions/MyFunctions';
import { dateFormat_YY_MM_DD } from '../../../../../../../shared/utils/utils';
import { IconButton } from '@mui/material';
import { BorderColor, Visibility } from '@mui/icons-material';
import { useEffect, useRef, useState } from 'react';
import ProgressBar from '../../../../../../../shared/components/progress/Progress';
import { ICessionInstructionAuditTrail } from '../../../../../../../shared/models/cession/CessionInstructionAuditTrailModel';

interface IProps {
  account: IMoneyMarketAccount;
  data: ICessionInstruction[]
}

const CessionPendingQueueGrid = observer((props: IProps) => {

  const { api, store } = useAppContext()
  const { data, account } = props;

  const user = store.user.me?.asJson.uid;

  const [selectedCessions, setSelectedCessions] = useState<ICessionInstruction[]>([]);
  const selectAllCessionsRef = useRef<HTMLInputElement>(null);

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [cessionsUpdated, setCessionsUpdated] = useState(0);

  const [isVisibleProgressbar, setVisibleProgressbar] = useState(false);

  const handleTransactionCheckboxChange = (cession: ICessionInstruction) => {
    const isSelected = selectedCessions.some(t => t.id === cession.id);
    const newSelectedCessions = isSelected
      ? selectedCessions.filter(t => t.id !== cession.id)
      : [...selectedCessions, cession];
    setSelectedCessions(newSelectedCessions);
  };

  const handleSelectAllTransactionChange = () => {
    const newSelectedCessions = selectedCessions.length === data.length
      ? []
      : data;
    setSelectedCessions(newSelectedCessions);
  };

  useEffect(() => {
    if (selectAllCessionsRef.current) {
      selectAllCessionsRef.current.indeterminate = selectedCessions.length > 0 && selectedCessions.length < data.length;
    }
  }, [selectedCessions, data.length]);

  const onLoadNewCession = () => {
    store.mma.select(account);
    if (store.mma.selected) {
      showModalFromId(MODAL_NAMES.ADMIN.CESSION_LOADING);
    }
  }

  const onSubmitSelectedForApproval = async () => {
    setLoadingSubmit(true);
    setVisibleProgressbar(true);
    let completedCount = 0;
    const totalCessions = selectedCessions.length;

    for (const cession of selectedCessions) {
      if (cession.amount !== 0) {
        const cessionToUpdate: ICessionInstruction = {
          ...cession,
          cessionStatus: 'First Level',
          firstLevelApprover: user,
          dateApprovedFirstLevel: Date.now(),
        };

        const audit: ICessionInstructionAuditTrail = {
          action: "Submitted for Approval",
          actionDescription: "Cession Instruction has been submitted for approval",
          dataStateBeforeAudit: {
            ...cession
          },
          dataStateAfterAudit: {
            ...cessionToUpdate
          },
          id: '',
          auditDateTime: Date.now(),
          actionUser: user || ""
        }

        try {
          await api.cessionInstruction.update(account.id, audit, cessionToUpdate);
          completedCount++;
          const progress = ((completedCount / totalCessions) * 100).toFixed(2); // Calculate progress percentage
          setCessionsUpdated(completedCount);
          setProgressPercentage(Number(progress));
        } catch (error) {
          // Handle error if needed
        }
      } else {
        // Handle case where cession.accountNumber is empty if needed
      }
    }

    setLoadingSubmit(false);
    setVisibleProgressbar(false);
  };

  const CustomToolbar = () => {
    return (
      <DataGridToolbar
        rightControls={
          <>
            <button disabled={selectedCessions.length !== 0} onClick={onLoadNewCession} className="btn btn-primary">
              Load New Cession
            </button>
            <button disabled={selectedCessions.length === 0} onClick={onSubmitSelectedForApproval} className="btn btn-primary">
              Submit for Approval
            </button>
          </>
        }
      />
    );
  };

  const totalValue = data.reduce(
    (sum, cession) => sum + cession.amount,
    0
  );

  const CustomFooter = () => {
    return (
      <DataGridFooter
        rightControls={
          <h4 className="main-title-md">
            Total Cessed Amount: {currencyFormat(totalValue)}
          </h4>
        }
        centerControls={
          <>
            {selectedCessions.length > 0 && isVisibleProgressbar && <ProgressBar progress={progressPercentage} />}
          </>
        }
      />
    );
  };

  const columns: GridColDef[] = [
    {
      field: "checked",
      headerName: "",
      width: 2,
      headerClassName: "grid",
      disableColumnMenu: true,
      sortable: false,
      renderHeader: () => {
        return (
          <div>
            <input
              className="uk-checkbox uk-margin-top-small"
              type="checkbox"
              ref={selectAllCessionsRef}
              checked={selectedCessions.length === data.length}
              onChange={handleSelectAllTransactionChange}
            />
          </div>

        )
      },
      renderCell: (params) => {
        return (
          <input
            className="uk-checkbox"
            type="checkbox"
            checked={selectedCessions.some(t => t.id === params.row.id)}
            onChange={() => handleTransactionCheckboxChange(params.row)}
          />
        )
      },
    },
    {
      field: "institution",
      headerName: "Institution",
      width: 200,
    },
    {
      field: "cessionDescription",
      headerName: "Title",
      width: 200,
    },
    {
      field: "amount",
      headerName: "Amount",
      width: 200,
      valueGetter: (params) => currencyFormat(params.row.amount)
    },
    {
      field: "cessionStatus",
      headerName: "Status",
      width: 200,
    },
    {
      field: "dateLoaded",
      headerName: "Date Loaded",
      width: 200,
      valueGetter: (params) => dateFormat_YY_MM_DD(params.row.dateLoaded)
    },
    {
      field: "loadedBy",
      headerName: "Loaded By",
      width: 200,
      renderCell: (params) => {
        const user = getUser(params.row.loadedBy, store)
        return (
          <div style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {user}
          </div>
        )
      },
    },
    {
      field: "options",
      headerName: "Options",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => {
        return (
          <>
            <IconButton data-uk-tooltip="Edit Transaction"
            // onClick={() => onAmendDepositTransaction(params.row, store, setShowOnAmendModal)}
            >
              <BorderColor />
            </IconButton>
            <IconButton
              data-uk-tooltip="Restore"
            // onClick={() => onAmendCession(params.row)}
            >
              <Visibility />
            </IconButton>
          </>
        )
      },
    },
  ];

  return (
    <div className="grid">
      <DataGrid
        loading={loadingSubmit}
        sx={{ height: 'auto', maxHeight: 480 }}
        slots={{
          toolbar: CustomToolbar,
          footer: CustomFooter
        }}
        rows={data}
        columns={columns}
        getRowId={(row) => row.id}
        rowHeight={50}
      />
    </div>
  )
});

export default CessionPendingQueueGrid