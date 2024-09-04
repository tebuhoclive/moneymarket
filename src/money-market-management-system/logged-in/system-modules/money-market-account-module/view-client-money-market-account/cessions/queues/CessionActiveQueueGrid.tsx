import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { ICessionInstruction } from '../../../../../../../shared/models/cession/CessionInstructionModel';
import { observer } from 'mobx-react-lite';
import DataGridToolbar from '../../../../../shared/components/toolbar/DataGridToolbar';
import DataGridFooter from '../../../../../shared/components/toolbar/DataGridFooter';
import { currencyFormat } from '../../../../../../../shared/functions/Directives';
import { useAppContext } from '../../../../../../../shared/functions/Context';
import { IMoneyMarketAccount } from '../../../../../../../shared/models/money-market-account/MoneyMarketAccount';
import { getUser } from '../../../../../../../shared/functions/MyFunctions';
import { dateFormat_YY_MM_DD } from '../../../../../../../shared/utils/utils';
import { IconButton } from '@mui/material';
import { BorderColor, Visibility } from '@mui/icons-material';

interface IProps {
    account: IMoneyMarketAccount;
    data: ICessionInstruction[]
}

const CessionActiveQueueGrid = observer((props: IProps) => {

    const { store } = useAppContext()
    const { data, account } = props;

    const CustomToolbar = () => {
        return (
            <DataGridToolbar
                rightControls={
                    <>
                        <button className="btn btn-primary"
                        // onClick={onLoadNewCession}
                        >
                            Uplift
                        </button>
                    </>
                }
            />
        );
    };

    const totalValue = data.reduce(
        (sum, transaction) => sum + transaction.amount,
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
                        {/* {selectedTransactions.length > 0 && isVisibleProgressbar && <ProgressBar progress={progressPercentage} />} */}
                    </>
                }
            />
        );
    };

    const columns: GridColDef[] = [
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

export default CessionActiveQueueGrid
