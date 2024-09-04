import React, { useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { INaturalPerson } from '../../../../../shared/models/clients/NaturalPersonModel';
import { IClientBankingDetails } from '../../../../../shared/models/clients/ClientShared';
import { useAppContext } from '../../../../../shared/functions/Context';
import Toolbar from '../../../shared/components/toolbar/Toolbar';
import { Box } from '@mui/material';
import ErrorBoundary from '../../../../../shared/components/error-boundary/ErrorBoundary';
import ClientBankAccountReportTabs from './ClientBankAccountReportTabs';
import { ILegalEntity } from '../../../../../shared/models/clients/LegalEntityModel';
import BackButton from '../../../../../shared/components/back-button/BackButton';

// Define combined interface for client and banking details
interface NaturalPersonWithBankingDetails extends INaturalPerson {
    bankingDetails: IClientBankingDetails | IClientBankingDetails[];
}

interface LegalEntityWithBankingDetails extends ILegalEntity {
    bankingDetails: IClientBankingDetails | IClientBankingDetails[];
}

// Define columns for Data Grid
const columns: GridColDef[] = [
    { field: 'oldCPNumber', headerName: 'CP Number (Tasman/LOTS)', width: 200, },
    { field: 'entityId', headerName: 'Entity Number (LOTS)', width: 200, },
    { field: 'entityDisplayName', headerName: 'Client Name', width: 200, },
    {
        field: 'bankName', headerName: 'Bank Name', width: 200,
        valueGetter: (params) => {
            return (params.row.bankingDetail.bankName && params.row.bankingDetail.bankName) || "";
        },
    },
    {
        field: 'branchNumber', headerName: 'Branch Number', width: 200, valueGetter: (params) => {
            return (params.row.bankingDetail.branchNumber && params.row.bankingDetail.branchNumber) || "";
        },
    },
    {
        field: 'accountNumber', headerName: 'Account Number', width: 200,
        valueGetter: (params) => {
            return (params.row.bankingDetail.accountNumber && params.row.bankingDetail.accountNumber) || "";
        },
    },
    {
        field: 'accountHolder', headerName: 'Account Holder', width: 200,
        valueGetter: (params) => {
            return (params.row.bankingDetail.accountHolder && params.row.bankingDetail.accountHolder) || "";
        },
    },

    {
        field: 'country', headerName: 'Type', width: 200,
        valueGetter: (params) => {
            const branchCode = params.row.bankingDetail.branchNumber;
            const namibianUniversalBranchCodes = ['280172', '483772', '461609', '087373'];

            if (branchCode && namibianUniversalBranchCodes.includes(branchCode)) {
                return 'NAD';
            } else {
                return `ZAR`;
            }
        },
    },
];

const ClientBankAccountReport: React.FC = () => {

    const { store } = useAppContext();

    const [selectedTab, setSelectedTab] = useState(
        "natural-person-tab"
    );

    const naturalPersonWithBankingDetails = store.client.naturalPerson.all;
    const legalEntityWithBankingDetails = store.client.legalEntity.all;

    // Format data to display banking details for each client
    const naturalPerson = naturalPersonWithBankingDetails.map(client => {
        // If client has multiple banking accounts, flatten the array
        const bankingDetails = Array.isArray(client.asJson.bankingDetail) ?
            client.asJson.bankingDetail.map((account, index) => ({
                ...account, id: `${client.asJson.id}-${index}` || "",
                entityDisplayName: client.asJson.entityDisplayName || "",
                bankName: client.asJson.bankingDetail[index].bankName || "",
                branch: client.asJson.bankingDetail[index].branch || "",
            })) :
            [{
                ...client.asJson,
                id: client.asJson.id,
            }];

        return bankingDetails.sort((a, b) => {
            const nameA = a.entityDisplayName;
            const nameB = b.entityDisplayName;
            return nameA.localeCompare(nameB);
        }).map(details => ({ ...client, ...details }));
    }).flat();

    const legalEntity = legalEntityWithBankingDetails.map(client => {
        // If client has multiple banking accounts, flatten the array
        const bankingDetails = Array.isArray(client.asJson.bankingDetail) ?
            client.asJson.bankingDetail.map((account, index) => ({
                ...account, id: `${client.asJson.id}-${index}` || "",
                entityDisplayName: client.asJson.entityDisplayName || "",
                bankName: client.asJson.bankingDetail[index].bankName || "",
                branch: client.asJson.bankingDetail[index].branch || "",
            })) :
            [{
                ...client.asJson,
                id: client.asJson.id,
            }];

        return bankingDetails.sort((a, b) => {
            const nameA = a.entityDisplayName;
            const nameB = b.entityDisplayName;

            return nameA.localeCompare(nameB);
        }).map(details => ({ ...client, ...details }));

    }).flat();

    return (
        <ErrorBoundary>
            <div className="page uk-section uk-section-small">
                <div className="uk-container uk-container-expand">
                    <div className="sticky-top">
                        <Toolbar
                            title="Client Bank Accounts"
                        />
                        <hr />
                        <Toolbar
                            rightControls={
                                <>
                                    <ClientBankAccountReportTabs
                                        selectedTab={selectedTab}
                                        setSelectedTab={setSelectedTab}
                                    />
                                    <BackButton />
                                </>
                            }
                        />
                    </div>
                    <ErrorBoundary>
                        <div className="page-main-card uk-card uk-card-default uk-card-body uk-margin-top">
                            <div className="grid">
                                <Toolbar
                                    leftControls={
                                        <>
                                            <h4 className="main-title-sm">Natural Person Client Bank Accounts</h4>
                                        </>
                                    }
                                />
                                < hr />
                                {
                                    selectedTab === 'natural-person-tab' &&
                                    <Box sx={{ height: 500 }}>
                                        <DataGrid
                                            rows={naturalPerson}
                                            columns={columns}
                                            getRowId={(row) => row.id}
                                            rowHeight={50}
                                        />
                                    </Box>
                                }
                                {
                                    selectedTab === 'legal-entity-tab' &&
                                    <Box sx={{ height: 500 }}>
                                        <DataGrid
                                            rows={legalEntity}
                                            columns={columns}
                                            getRowId={(row) => row.id}
                                            rowHeight={50}
                                        />
                                    </Box>

                                }
                            </div>
                        </div>
                    </ErrorBoundary>
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default ClientBankAccountReport;
