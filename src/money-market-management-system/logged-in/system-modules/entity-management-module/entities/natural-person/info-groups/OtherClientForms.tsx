import { observer } from "mobx-react-lite";
import ErrorBoundary from "../../../../../../../shared/components/error-boundary/ErrorBoundary";
import { useAppContext } from "../../../../../../../shared/functions/Context";
import { IClientRelatedPartyDetails, IClientBankingDetails } from "../../../../../../../shared/models/clients/ClientShared";
import { INaturalPerson } from "../../../../../../../shared/models/clients/NaturalPersonModel";
import { Box } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import Toolbar from "../../../../../shared/components/toolbar/Toolbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import showModalFromId from "../../../../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../../../../../dialogs/ModalName";
import { faPencil } from "@fortawesome/free-solid-svg-icons";

interface IClientAddressProps {
    client: INaturalPerson;
}

export const ClientAddressContactDetail = observer((props: IClientAddressProps) => {
    const { client } = props;

    const { store } = useAppContext();

    const updateClientInformation = () => {
        store.client.naturalPerson.select(client);
        showModalFromId(MODAL_NAMES.ADMIN.UPDATE_NATURAL_PERSON_CLIENT_INFORMATION_MODAL);
    }

    return (
        <ErrorBoundary>
            <Toolbar
                leftControls={<h4 className="main-title-sm">Client Financial Profile</h4>}
                rightControls={
                    <button onClick={updateClientInformation} className="btn btn-primary"><FontAwesomeIcon icon={faPencil} /> Edit</button>
                }
            />
            <hr />
            <div className="uk-grid uk-grid-small uk-child-width-1-2" data-uk-grid>
                <div>
                    <div className="uk-grid uk-grid-small" data-uk-grid>
                        <div className="uk-width-1-3">
                            <p className="uk-text-bold">Date Of Last FIA:</p>
                        </div>
                        <div className="uk-width-2-3">
                            <p>{client.dateOfLastFIA}</p>
                        </div>
                        <div className="uk-width-1-3">
                            <p className="uk-text-bold">Date Of Next FIA:</p>
                        </div>
                        <div className="uk-width-2-3">
                            <p>{client.dateOfNextFIA}</p>
                        </div>
                        <div className="uk-width-1-3">
                            <p className="uk-text-bold">Source of Wealth:</p>
                        </div>
                        <div className="uk-width-2-3">
                            <p>{client.sourceOfWealth}</p>
                        </div>
                        <div className="uk-width-1-3">
                            <p className="uk-text-bold">Annual Income:</p>
                        </div>
                        <div className="uk-width-2-3">
                            <p>{client.annualIncome}</p>
                        </div>
                        <div className="uk-width-1-3">
                            <p className="uk-text-bold">Annual Investment Limit:</p>
                        </div>
                        <div className="uk-width-2-3">
                            <p>{client.annualInvestmentLimit}</p>
                        </div>
                        <div className="uk-width-1-3">
                            <p className="uk-text-bold">Single Transaction Limit</p>
                        </div>
                        <div className="uk-width-2-3">
                            <p>{client.singleTransactionLimit}</p>
                        </div>
                    </div>
                </div>
            </div>
        </ErrorBoundary >
    );
});

interface IRelatedPartyProps {
    client: INaturalPerson;
}

export const ClientRelatedParty = observer((props: IRelatedPartyProps) => {
    const { client } = props;
    const { store } = useAppContext();
    const user = store.auth.meJson;
    const hasCreatePermission = user?.feature.some((feature) => feature.featureName === "Client Profile Management" && feature.create === true);

    const relatedParties: IClientRelatedPartyDetails[] = client.relatedParty;

    const data = relatedParties.map((accounts) => {
        return accounts;
    });

    const columns: GridColDef[] = [
        {
            field: 'firstName', headerName: 'First Name', width: 200,
            valueGetter: (params) => {
                return params.row.firstName;
            },
        },
        {
            field: 'lastName', headerName: 'Last Name', width: 200, valueGetter: (params) => {
                return params.row.lastName;
            },
        },
        {
            field: 'relationship', headerName: 'Relationship', width: 200,
            valueGetter: (params) => {
                return params.row.relationship;
            },
        },
        {
            field: 'riskRating', headerName: 'Risk Rating', width: 200,
            valueGetter: (params) => {
                return params.row.accountHolder;
            },
        }
    ];

    return (
        <ErrorBoundary>
            <div className="uk-card">
                <div className="uk-card-body">
                    <h4 className="main-title-md">Related Parties</h4>
                    {hasCreatePermission && <Toolbar
                        rightControls={
                            <>
                                {
                                    relatedParties.length! < 3 &&
                                    <button className="btn btn-primary uk-margin-small-bottom">Add New Related Party</button>
                                }
                            </>
                        }
                    />
                    }
                    <div className="grid">
                        <Box sx={{ height: 300 }}>
                            <DataGrid
                                rows={data}
                                columns={columns}
                                getRowId={(row) => row.accountNumber} // Use the appropriate identifier property
                                rowHeight={50}
                            />
                        </Box>
                    </div>

                </div>
            </div>
        </ErrorBoundary >
    );
});

interface IBankAccountDetailProps {
    client: INaturalPerson;
}

export const BankAccountDetails = observer((props: IBankAccountDetailProps) => {
    const { client } = props;
    const bankAccounts: IClientBankingDetails[] = client.bankingDetail
    const { store } = useAppContext();
    const user = store.auth.meJson;
    const hasCreatePermission = user?.feature.some((feature) => feature.featureName === "Client Profile Management" && feature.create === true);

    const [clientBankAccounts, setClientBankAccount] = useState<IClientBankingDetails[]>([])

    const columns: GridColDef[] = [
        {
            field: 'bankName', headerName: 'Bank Name', width: 200,
            valueGetter: (params) => {
                return params.row.bankName;
            },
        },
        {
            field: 'branchNumber', headerName: 'Branch Number', width: 200, valueGetter: (params) => {
                return params.row.branchNumber;
            },
        },
        {
            field: 'accountNumber', headerName: 'Account Number', width: 200,
            valueGetter: (params) => {
                return params.row.accountNumber;
            },
        },
        {
            field: 'accountHolder', headerName: 'Account Holder', width: 200,
            valueGetter: (params) => {
                return params.row.accountHolder;
            },
        },

        {
            field: 'country', headerName: 'Type', width: 200,
            valueGetter: (params) => {
                const branchCode = params.row.branchNumber;
                const namibianUniversalBranchCodes = ['280172', '483772', '461609', '087373'];

                if (namibianUniversalBranchCodes.includes(branchCode)) {
                    return 'NAD';
                } else {
                    return `ZAR`;
                }
            },
        },
    ];

    useEffect(() => {

        const loadAccounts = () => {
            if (Array.isArray(bankAccounts)) {
                setClientBankAccount(bankAccounts);
            } else if (typeof bankAccounts === "object") {
                const { bankName, accountHolder, accountNumber, branchNumber, accountVerificationStatus } = bankAccounts;
                setClientBankAccount([{
                    bankName: bankName,
                    branch: "",
                    branchNumber: branchNumber,
                    accountNumber: accountNumber,
                    accountHolder: accountHolder,
                    accountType: "",
                    accountVerificationStatus: accountVerificationStatus,
                    country: ""
                }])
            }
        }
        loadAccounts();
    }, []);

    const accounts = clientBankAccounts.sort((a, b) => {
        const nameA = a.accountHolder;
        const nameB = b.accountHolder;

        return nameA.localeCompare(nameB);
    }).map((accounts) => {
        return accounts;
    });

    return (
        <ErrorBoundary>
            <div className="uk-card">
                <div className="uk-card-body">
                    <h4 className="main-title-md">Bank Account(s)</h4>
                    {hasCreatePermission && <>
                        {
                            bankAccounts.length! < 3 &&
                            <button className="btn btn-primary uk-margin-bottom-small">Add New Account</button>
                        }
                    </>
                    }
                    <div className="grid">
                        <Box sx={{ height: 300 }}>
                            <DataGrid
                                rows={accounts}
                                columns={columns}
                                getRowId={(row) => row.accountNumber} // Use the appropriate identifier property
                                rowHeight={50}
                            />
                        </Box>
                    </div>

                </div>
            </div>
        </ErrorBoundary >
    );
});