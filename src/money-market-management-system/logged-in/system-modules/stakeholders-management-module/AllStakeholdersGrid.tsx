import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {  IconButton } from "@mui/material";
import { observer } from "mobx-react-lite";
import { OpenInNew } from "@mui/icons-material";
import { IRelatedParty } from "../../../../shared/models/stakeholders/RelatedPartyModel";
import DataGridFooter from '../../shared/components/toolbar/DataGridFooter';
import DataGridToolbar from "../../shared/components/toolbar/DataGridToolbar";

interface IProps {
    data: IRelatedParty[];
}

export const AllStakeholdersGrid = observer(({ data }: IProps) => {

    const CustomToolbar = () => {
        return (
            <DataGridToolbar
                rightControls={
                    <>
                        <button className="btn btn-primary">On-Boarding (Offline)</button>
                        <button className="btn btn-primary" disabled>On-Boarding (DocFox)</button>
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
            field: "dateCreated",
            headerName: "Date Created",
     width:200,
            headerClassName: "grid",
            valueGetter: (params) => params.row.dateCreated
        },
        {
            field: "lastUpdated",
            headerName: "Last Updated",
     width:200,
            headerClassName: "grid",
            valueGetter: (params) => params.row.lastUpdated
        },
        {
            field: "entityId",
            headerName: "Stakeholder Id",
     width:200,
            headerClassName: "grid",
        },
        {
            field: "stakeholderDisplayName",
            headerName: "Stakeholder Name",
     width:200,
            headerClassName: "grid",
        },
        {
            field: "emailAddress",
            headerName: "Email",
     width:200,
            headerClassName: "grid",
            valueGetter: (params) => params.row.emailAddress
        },
        {
            field: "riskRating",
            headerName: "Risk Rating",
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
                <>
                    <IconButton data-uk-tooltip="View">
                        <OpenInNew />
                    </IconButton>
                </>
            ),
        }
    ];

    return (
        <div className="grid">
            <DataGrid
                sx={{ height: 300, marginTop:1 }}
                slots={{
                    toolbar: CustomToolbar,
                    footer: CustomFooter
                }}
                rows={data}
                columns={columns}
                getRowId={(row) => row.id}
                rowHeight={50}
            />
        </div>
    );
});