import { DataGrid, GridColDef, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';
import { observer } from "mobx-react-lite";
import { useAppContext } from "../../../../../shared/functions/Context";

import { dateFormat_YY_MM_DD } from "../../../../../shared/utils/utils";
import { IDepositTransactionAudit } from "../../../../../shared/models/deposit-transaction/DepositTransactionAuditModel";
import { getTimeFromTimestamp } from "../../../../../shared/functions/DateToTimestamp";
import { Box } from "@mui/material";

interface IProps {
    data: IDepositTransactionAudit[];
}

export const ClientDepositAllocationAuditTrailGrid = observer(({ data }: IProps) => {
    const { store } = useAppContext();
    const users = store.user.all;
    const getActionUser = (auditTrail: IDepositTransactionAudit) => {
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
     width:200,
            headerClassName: "grid",
            valueGetter: (params) => {
                return `${dateFormat_YY_MM_DD(params.row.auditDateTime)} ${getTimeFromTimestamp(params.row.auditDateTime)}`;
            },
        },
        {
            field: "action",
            headerName: "Action",
     width:200,
            headerClassName: "grid",
        },
        {
            field: "actionDescription",
            headerName: "Description",
     width:200,
            headerClassName: "grid", // Apply the same class for consistency
        },
        {
            field: "actionUser",
            headerName: "Actioned By",
     width:200,
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
