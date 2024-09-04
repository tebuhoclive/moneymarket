import { GridColDef, DataGrid } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import ErrorBoundary from "../../../../../../shared/components/error-boundary/ErrorBoundary";
import { useAppContext } from "../../../../../../shared/functions/Context";
import { IClientRelatedPartyDetails } from "../../../../../../shared/models/clients/ClientShared";
import { INaturalPerson } from "../../../../../../shared/models/clients/NaturalPersonModel";
import DataGridToolbar from "../../../../shared/components/toolbar/DataGridToolbar";
import DataGridFooter from "../../../../shared/components/toolbar/DataGridFooter";

interface IRelatedPartyProps {
    client: INaturalPerson;
}

export const RelatedParty = observer((props: IRelatedPartyProps) => {
    const { client } = props;
    const { store } = useAppContext();
    const user = store.auth.meJson;
    const hasCreatePermission = user?.feature.some((feature) => feature.featureName === "Client Profile Management" && feature.create === true);

    const relatedParties: IClientRelatedPartyDetails[] = client.relatedParty;

    const data = relatedParties.map((accounts) => {
        return accounts;
    });

    const CustomToolbar = () => {
        return (
            <DataGridToolbar
                rightControls={
                    <>
                        {
                            hasCreatePermission &&
                            <button className="btn btn-primary" type="button" disabled>
                                <span data-uk-icon="icon: user-plus-circle; ratio:.8"></span>{" "}
                                Add Related Party
                            </button>
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
            <div className="grid">
                <DataGrid
                    sx={{ height: 'auto', maxHeight: 300 }}
                    slots={{
                        toolbar: CustomToolbar,
                        footer: CustomFooter
                    }}
                    rows={data}
                    columns={columns}
                    getRowId={(row) => row.accountNumber}
                    rowHeight={50}
                />
            </div>
        </ErrorBoundary >
    );
});