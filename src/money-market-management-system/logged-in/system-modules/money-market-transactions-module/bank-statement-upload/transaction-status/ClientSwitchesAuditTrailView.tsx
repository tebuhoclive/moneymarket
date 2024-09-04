import { useEffect } from 'react';
import { IWithdrawalTransactionAudit } from '../../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionAuditModel';
import { splitAndTrimString } from '../../../../../../shared/functions/StringFunctions';
import { getClientName } from '../../../../../../shared/functions/MyFunctions';
import { useAppContext } from '../../../../../../shared/functions/Context';
import { dateFormat_YY_MM_DD, dateFormat_YY_MM_DD_NEW } from '../../../../../../shared/utils/utils';
import { observer } from 'mobx-react-lite';
import { DataGrid, GridColDef, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import { getTimeFromTimestamp } from '../../../../../../shared/functions/DateToTimestamp';
import { ISwitchAudit } from '../../../../../../shared/models/SwitchAuditModel';

interface IProps {
    data: ISwitchAudit[];
}

export const ClientSwitchAuditTrailView = observer(({ data }: IProps) => {
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
            flex: 1,
            headerClassName: "grid",
            valueGetter: (params) => {
                return `${dateFormat_YY_MM_DD(params.row.auditDateTime)} ${getTimeFromTimestamp(params.row.auditDateTime)}`;
            },
        },
        {
            field: "action",
            headerName: "Action",
            flex: 1,
            headerClassName: "grid",
        },
        {
            field: "actionDescription",
            headerName: "Description",
            flex: 1,
            headerClassName: "grid", // Apply the same class for consistency
        },
        {
            field: "actionUser",
            headerName: "Actioned By",
            flex: 1,
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
                        height: 350,
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
                    rowHeight={40}
                />
            </Box>
        </div>
    );
});
