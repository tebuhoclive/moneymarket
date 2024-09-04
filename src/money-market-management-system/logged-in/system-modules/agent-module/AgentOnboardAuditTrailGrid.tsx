import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import { Box } from "@mui/material";
import { useAppContext } from "../../../../shared/functions/Context";
import { getTimeFromTimestamp } from "../../../../shared/functions/DateToTimestamp";
import { IAgentOnboardAudit } from "../../../../shared/models/clients/agent/AgentOnboardAuditModel";
import { dateFormat_YY_MM_DD } from "../../../../shared/utils/utils";

interface IProps {
    data: IAgentOnboardAudit[];
}

export const AgentOnboardAuditTrailGrid = observer(({ data }: IProps) => {
    const { store } = useAppContext();

    const users = store.user.all;

    const getActionUser = (auditTrail: IAgentOnboardAudit) => {
        if (users) {
            const actionUser = users.find(
                (user) => user.asJson.uid === auditTrail.actionUser
            );
            if (actionUser) {
                const actionUserName = actionUser.asJson.displayName;
                return actionUserName;
            }
            return "";
        }
        return "";
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
            headerName: "User",
     width:200,
            headerClassName: "grid",
            valueGetter: (params) => {
                return getActionUser(params.row);
            },
        }
    ];

    return (
        <div className="grid">
            <Box sx={{ height: 500 }}>
                <DataGrid
                    rows={data}
                    columns={columns}
                    getRowId={(row) => row.id} // Use the appropriate identifier property
                    rowHeight={50}
                />
            </Box>
        </div>
    );
});
