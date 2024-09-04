import { IWithdrawalTransactionAudit } from '../../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionAuditModel';
import { useAppContext } from '../../../../../../shared/functions/Context';
import { dateFormat_YY_MM_DD } from '../../../../../../shared/utils/utils';
import { observer } from 'mobx-react-lite';
import { DataGrid, GridColDef, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import { getTimeFromTimestamp } from '../../../../../../shared/functions/DateToTimestamp';

interface IProps {
    data: IWithdrawalTransactionAudit[];
}

export const ClientWithdrawalAuditTrailView = observer(({ data }: IProps) => {
    const { store } = useAppContext();
    const users = store.user.all;
    const getActionUser = (auditTrail: IWithdrawalTransactionAudit) => {
        if (users) {
            const actionUser = users.find(
                (user) => user.asJson.uid === auditTrail.actionUser
            );
            if (actionUser) {
                const actionUserName = `${actionUser.asJson.firstName} ${actionUser.asJson.lastName}`;
                return actionUserName;
            }
        }
    };
    const columns: GridColDef[] = [
        {
            field: "auditDateTime",
            headerName: "Date/Time",
            width: 200,
            headerClassName: "grid",
            renderCell: (params) => {
                return (
                    <div style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                    {dateFormat_YY_MM_DD(params.row.auditDateTime)} {getTimeFromTimestamp(params.row.auditDateTime)}
                    </div>
                )
            },
        },
        {
            field: "action",
            headerName: "Action",
            width: 200,
            headerClassName: "grid",
            renderCell: (params) => {
                return (
                    <div style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                    {params.row.action}
                    </div>
                )
            },
        },
        {
            field: "actionDescription",
            headerName: "Description/Note",
            width: 400,
            headerClassName: "grid", // Apply the same class for consistency
            renderCell: (params) => {
                return (
                    <div style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                    {params.row.actionDescription}
                    </div>
                )
            },
        },
        {
            field: "actionUser",
            headerName: "Actioned By",
            width: 200,
            headerClassName: "grid",
            valueGetter: (params) => {
                return getActionUser(params.row);
            },
        }
    ];
    const CustomToolbar = () => {
        return (
            <GridToolbarContainer>
                <GridToolbarQuickFilter />
            </GridToolbarContainer>
        );
    }
    return (
        <div className="grid">
            <Box sx={{ height: 500 }}>
                <DataGrid
                    sx={{
                        height: 'auto',
                        maxHeight: 350,
                        width: '100%',
                        '& .MuiDataGrid-cell': {
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                        },
                        '& .MuiDataGrid-columnHeader': {
                            '&:hover .MuiDataGrid-iconButtonContainer': {
                                visibility: 'visible',
                            },
                            '& .MuiDataGrid-iconButtonContainer': {
                                visibility: 'visible',
                            }
                        }
                    }}
                    loading={!data}
                    slots={{
                        toolbar: CustomToolbar
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
