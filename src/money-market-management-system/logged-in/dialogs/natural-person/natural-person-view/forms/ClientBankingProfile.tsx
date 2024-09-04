import { GridColDef, DataGrid } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import { useState, useEffect } from "react";
import ErrorBoundary from "../../../../../../shared/components/error-boundary/ErrorBoundary";
import { useAppContext } from "../../../../../../shared/functions/Context";
import { IClientBankingDetails } from "../../../../../../shared/models/clients/ClientShared";
import { INaturalPerson } from "../../../../../../shared/models/clients/NaturalPersonModel";
import DataGridToolbar from "../../../../shared/components/toolbar/DataGridToolbar";
import DataGridFooter from "../../../../shared/components/toolbar/DataGridFooter";

interface IBankAccountDetailProps {
    client: INaturalPerson;
}

export const ClientBankingProfile = observer((props: IBankAccountDetailProps) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const accounts = clientBankAccounts.sort((a, b) => {
        const nameA = a.accountHolder;
        const nameB = b.accountHolder;

        return nameA.localeCompare(nameB);
    }).map((accounts) => {
        return accounts;
    });

    const CustomToolbar = () => {
        return (
            <DataGridToolbar
                rightControls={
                    <>
                        {hasCreatePermission &&
                            <>
                                {
                                    bankAccounts.length! < 3 &&
                                    <button className="btn btn-primary uk-margin-bottom-small">Add New Account</button>
                                }
                            </>
                        }
                    </>
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

    return (
        <ErrorBoundary>
            <div className="grid">
                <DataGrid
                    sx={{ height: 'auto', maxHeight: 300 }}
                    slots={{
                        toolbar: CustomToolbar,
                        footer: CustomFooter
                    }}
                    rows={accounts}
                    columns={columns}
                    getRowId={(row) => row.accountNumber} // Use the appropriate identifier property
                    rowHeight={50}
                />
            </div>
        </ErrorBoundary >
    );
});