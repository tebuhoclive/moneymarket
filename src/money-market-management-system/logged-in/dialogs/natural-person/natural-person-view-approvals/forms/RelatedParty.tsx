import { Box } from "@mui/material";
import { GridColDef, DataGrid } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import ErrorBoundary from "../../../../../../shared/components/error-boundary/ErrorBoundary";
import { useAppContext } from "../../../../../../shared/functions/Context";
import { IClientRelatedPartyDetails } from "../../../../../../shared/models/clients/ClientShared";
import { INaturalPerson } from "../../../../../../shared/models/clients/NaturalPersonModel";

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
                    <div className="grid">
                        <Box sx={{ height: 300 }}>
                            <DataGrid
                                rows={data}
                                columns={columns}
                                getRowId={(row) => row.accountNumber}
                                rowHeight={50}
                            />
                        </Box>
                    </div>

                </div>
            </div>
        </ErrorBoundary >
    );
});