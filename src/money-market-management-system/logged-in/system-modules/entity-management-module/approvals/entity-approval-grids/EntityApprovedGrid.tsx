import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, IconButton } from "@mui/material";
import { observer } from "mobx-react-lite";
import { ILegalEntity } from "../../../../../../shared/models/clients/LegalEntityModel";
import { INaturalPerson } from "../../../../../../shared/models/clients/NaturalPersonModel";
import { OpenInNew } from "@mui/icons-material";
interface IProps {
    data: (INaturalPerson | ILegalEntity)[];
}

export const EntityApprovedGrid = observer(({ data }: IProps) => {
    const columns: GridColDef[] = [
        {
            field: "entityId",
            headerName: "Client Entity Id",
     width:200,
            headerClassName: "grid",
        },
        {
            field: "oldCPNumber",
            headerName: "CP Code (Tasman)",
     width:200,
            headerClassName: "grid",
        },
        {
            field: "entityDisplayName",
            headerName: "Client Name",
     width:200,
            headerClassName: "grid",
        },
        {
            field: "contactNumber",
            headerName: "Contact Number",
     width:200,
            headerClassName: "grid",
            valueGetter: (params) => {
                return params.row.contactDetail.cellphoneNumber;
            },
            // Apply the same class for consistency
        },
        {
            field: "primary",
            headerName: "Email",
     width:200,
            headerClassName: "grid",
            valueGetter: (params) => {
                return params.row.contactDetail.emailAddress;
            },
        },
        {
            field: "entityType",
            headerName: "Entity Type",
     width:200,
            headerClassName: "grid",
            valueGetter: (params) => {
                return params.row.entityType;
            },
        },
        {
            field: "status",
            headerName: "Client FIA Status",
     width:200,
            headerClassName: "super-app-theme--header",
            renderCell: (params) => (
                <div>
                    {params.row.riskRating === "" &&
                        <span
                            style={{
                                padding: "4px",
                                border: "2px solid red",
                                borderRadius: "4px",
                            }}
                        >
                            Not Risk Rated
                        </span>
                    }

                    {params.row.riskRating === "Low" &&
                        <span
                            style={{
                                padding: "4px",
                                border: "2px solid yellow",
                                borderRadius: "4px",
                                color: "white",
                            }}
                        >
                            Low Risk
                        </span>
                    }

                    {params.row.riskRating === "Medium" &&
                        <span
                            style={{
                                padding: "4px",
                                border: "2px solid orange",
                                borderRadius: "4px",
                                color: "white",
                            }}
                        >
                            Medium Risk
                        </span>
                    }
                    {params.row.riskRating === "High" &&
                        <span
                            style={{
                                padding: "4px",
                                border: "2px solid red",
                                borderRadius: "4px",
                                color: "white",
                            }}
                        >
                            High Risk
                        </span>
                    }
                </div>
            ),
        },
        {
            field: "Options",
            headerName: "Options",
     width:200,
            headerClassName: "grid",
            renderCell: (params) => (
                <div>
                    <>
                        <IconButton
                            data-uk-tooltip="View"
                        >
                            <OpenInNew />
                        </IconButton>
                    </>
                </div>
            ),
        }
    ];
    return (
        <div className="grid">
            <h4 className="main-title-md">Approved Profiles</h4>
            <Box sx={{ height: 300 }}>
                <DataGrid
                    rows={data}
                    columns={columns}
                    getRowId={(row) => row.id}
                    rowHeight={50}
                />
            </Box>
        </div>
    );
});