import { Box, IconButton } from '@mui/material';
import { useAppContext } from '../../../../../shared/functions/Context';
import { DataGrid, GridColDef, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';
import { OpenInNew } from '@mui/icons-material';
import Toolbar from '../../../shared/components/toolbar/Toolbar';
import { splitAndTrimString } from '../../../../../shared/functions/StringFunctions';

const ClientMoneyMarketAccountReport = () => {

    const { store } = useAppContext();

    const moneyMarketAccounts = store.mma.all.filter(noAccountHolder => noAccountHolder.asJson.parentEntity === "").map((c) => {
        return c.asJson;
    });

    // const CustomToolbar = () => {
    //     return (
    //         <GridToolbarContainer>
    //             <GridToolbarQuickFilter />
    //         </GridToolbarContainer>
    //     );
    // };

    const clients = [
        ...store.client.naturalPerson.all,
        ...store.client.legalEntity.all,
    ];

    const getParentEntity = (entityOldCPNumber: string) => {
        const client = clients.find(
            (client) => client.asJson.oldCPNumber === entityOldCPNumber
        );
        if (client) {
            return client.asJson.entityId;
        }
        return "";
    };


    // const columns: GridColDef[] = [
    //     {
    //         field: "accountNumber",
    //         headerName: "Account Number",
    //  width:200,
    //         headerClassName: "grid",
    //         valueGetter: (params) => {
    //             return params.row.accountNumber
    //         },
    //     },
    //     {
    //         field: "oldCPNumber",
    //         headerName: "Old CP Number",
    //  width:200,
    //         headerClassName: "grid",
    //         valueGetter: (params) => {
    //             return params.row.oldCPNumber
    //         }
    //     },

    //     {
    //         field: "parentEntity",
    //         headerName: "Matched to Client",
    //  width:200,
    //         headerClassName: "grid",
    //         valueGetter: (params) => {
    //             return getParentEntity(params.row.oldCPNumber) || "Hello"
    //         }
    //     },
    //     {
    //         field: "Options",
    //         headerName: "Options",
    //  width:200,
    //         renderCell: (params) => (
    //             <div>
    //                 <IconButton
    //                     data-uk-tooltip={`View Transaction Details ${params.row.oldCPNumber}`}
    //                 // onClick={() => onViewTransaction(params.row.id, store)}
    //                 >
    //                     <OpenInNew />
    //                 </IconButton>
    //             </div>
    //         ),
    //     },
    // ];

    return (
        <div className="page uk-section uk-section-small">
            <div className="uk-container uk-container-expand">
                <div className="sticky-top">
                    <Toolbar
                        title="Unlinked Client Money Market Report"
                    />
                </div>
                <div className="page-main-card uk-card uk-card-default uk-card-body">
                    <div className="uk-grid uk-grid-small uk-child-width-1-1" data-uk-grid>
                        <table className='uk-table uk-table-divider uk-table-small'>
                            <thead>
                                <tr>
                                    <th>Parent Entity</th>
                                    <th>Old CP Number</th>
                                    <th>Account Number</th>
                                    <th>Account Name</th>
                                    <th>Account Type</th>
                                    <th>Base Rate</th>
                                    <th>Fee Rate</th>
                                    <th>Client Rate</th>
                                    <th>Balance</th>
                                    <th>Status</th>
                                    <th>Month Total Interest</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {moneyMarketAccounts.map(account => (
                                    <tr key={account.id}>
                                        <td>{getParentEntity(account.oldCPNumber || "")}</td>
                                        <td>{account.oldCPNumber}</td>
                                        <td>{account.accountNumber}</td>
                                        <td>
                                            {/* {account.accountName} */}
                                            {splitAndTrimString("-", account.accountName)[1]}
                                        </td>
                                        <td>{account.accountType}</td>
                                        <td>{account.baseRate}</td>
                                        <td>{account.feeRate}</td>
                                        <td>{account.clientRate}</td>
                                        <td>{account.balance}</td>
                                        <td>{account.status}</td>
                                        <td>{account.monthTotalInterest}</td>
                                        <td>{account.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {/* <Box sx={{ height: 450 }}>
                            <DataGrid
                                loading={!moneyMarketAccounts}
                                slots={{
                                    toolbar: CustomToolbar,
                                }}
                                rows={moneyMarketAccounts}
                                columns={columns}
                                getRowId={(row) => row.id} // Use the appropriate identifier property
                                rowHeight={40}
                            />
                        </Box> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientMoneyMarketAccountReport;
