import { observer } from "mobx-react-lite";
import { Box } from "@mui/material";

import { DataGrid, GridColDef } from "@mui/x-data-grid";

import { useEffect } from "react";

import { ISuggestedMatchedTransaction } from "../../../../../../../shared/interfaces/BankStatements";
import { useAppContext } from '../../../../../../../shared/functions/Context';
import Toolbar, { ToolbarNew } from "../../../../../shared/components/toolbar/Toolbar";
import { dateFormat_YY_MM_DD_NEW } from "../../../../../../../shared/utils/utils";
import { currencyFormat, numberFormat } from '../../../../../../../shared/functions/Directives';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

interface IProp {
    suggestedMatch: ISuggestedMatchedTransaction[];
    selectedSuggestedTransactions: ISuggestedMatchedTransaction[];
    readySuggested: ISuggestedMatchedTransaction[];
    setSuggestedMatch: React.Dispatch<React.SetStateAction<ISuggestedMatchedTransaction[]>>;
    setSelectedSuggestedTransactions: React.Dispatch<React.SetStateAction<ISuggestedMatchedTransaction[]>>;
    selectAllSuggestedRef: React.RefObject<HTMLInputElement>
    handleMarkAsUnallocated: (value: ISuggestedMatchedTransaction[]) => void
    handleMarkAsCompetedAllocated: (value: ISuggestedMatchedTransaction[]) => void
    handleMarkAsNonDeposit: (value: ISuggestedMatchedTransaction[]) => void
    
}

export const SuggestedMatchedItemsGrid = observer((props: IProp) => {

    const {
        suggestedMatch,
        selectedSuggestedTransactions,
        selectAllSuggestedRef,
        readySuggested,
        setSelectedSuggestedTransactions,
        setSuggestedMatch,
        handleMarkAsCompetedAllocated,
        handleMarkAsUnallocated,
        handleMarkAsNonDeposit
    } = props

    const { api } = useAppContext();

    const handleSuggestedCheckboxChange = (transaction: ISuggestedMatchedTransaction) => {
        const isSelected = selectedSuggestedTransactions.some(t => t.bankReference === transaction.bankReference);
        const newSelectedTransactions = isSelected
            ? selectedSuggestedTransactions.filter(t => t.bankReference !== transaction.bankReference && !t.isAlreadyUploaded)
            : [...selectedSuggestedTransactions, transaction];

        setSelectedSuggestedTransactions(newSelectedTransactions);
    };

    const totalSuggestedValue = suggestedMatch.reduce((sum, transaction) => sum + transaction.amount, 0);

    const handleSelectAllSuggestedChange = () => {
        const newSelectedTransactions = selectedSuggestedTransactions.length === suggestedMatch.filter(t => !t.isAlreadyUploaded).length
            ? []
            : suggestedMatch.filter(t => !t.isAlreadyUploaded);
        setSelectedSuggestedTransactions(newSelectedTransactions);
    };

    // const acceptSuggestions = () => {
    //     //update the remark to suggestion accepted
    //     const updatedTransactions = suggestedMatch.map(transaction =>
    //         selectedSuggestedTransactions.some(t => t.bankReference === transaction.bankReference)
    //             ? { ...transaction, suggestionRemark: 'Accepted' }
    //             : transaction
    //     );
    //     setSuggestedMatch(updatedTransactions);
    //     setSelectedSuggestedTransactions([]);
    // }

    // const rejectSuggestions = () => {
    //     //update the remark to suggestion accepted
    //     const updatedTransactions = suggestedMatch.map(transaction =>
    //         selectedSuggestedTransactions.some(t => t.bankReference === transaction.bankReference)
    //             ? { ...transaction, suggestionRemark: 'Rejected' }
    //             : transaction
    //     );
    //     setSuggestedMatch(updatedTransactions);
    //     setSelectedSuggestedTransactions([]);
        
    // }

    // const skipSuggestions = () => {
    //     //update the remark to suggestion accepted
    //     const updatedTransactions = suggestedMatch.map(transaction =>
    //         selectedSuggestedTransactions.some(t => t.bankReference === transaction.bankReference)
    //             ? { ...transaction, suggestionRemark: '' }
    //             : transaction
    //     );
    //     setSuggestedMatch(updatedTransactions);
    //     setSelectedSuggestedTransactions([]);
    // }
    // const CustomToolbar = () => {
    //     return (
    //         <GridToolbarContainer>
    //             <GridToolbarQuickFilter />
    //         </GridToolbarContainer>
    //     );
    // }

    const columns: GridColDef[] = [
        {
            field: "check",
            headerName: "Option",
            width: 2,
            headerClassName: "grid",
            disableColumnMenu: true,
            sortable: false,
            renderCell: (params) => (
                <>
                    {
                        params.row.isAlreadyUploaded && <FontAwesomeIcon icon={faTriangleExclamation} />
                    }
                    {
                        !params.row.isAlreadyUploaded &&
                        <input
                            className="uk-checkbox"
                            type="checkbox"
                            checked={selectedSuggestedTransactions.some(t => t.bankReference === params.row.bankReference && !t.isAlreadyUploaded)}
                            onChange={() => handleSuggestedCheckboxChange(params.row)}
                        />
                    }
                </>
            ),
            renderHeader: () => (
                <input
                    className="uk-checkbox uk-margin-small-top"
                    type="checkbox"
                    ref={selectAllSuggestedRef}
                    checked={selectedSuggestedTransactions.length === suggestedMatch.filter(t=>!t.isAlreadyUploaded).length}
                    onChange={handleSelectAllSuggestedChange}
                />
            ),
        },
        {
            field: "transactionDate",
            headerName: "Transaction Date",
            flex: 1,
            headerClassName: "grid",
            renderCell: (params) => {
                return (
                    <div className={params.row.isAlreadyUploaded ? 'error' : '' || params.row.suggestionRemark === "" ? "" : params.row.suggestionRemark === "Rejected" ? 'warning' : 'success'} style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }} data-uk-grid>
                        <span>
                            {`${dateFormat_YY_MM_DD_NEW(params.row.transactionDate)}`}
                        </span>
                    </div>
                )
            },
        },
        {
            field: "valueDate",
            headerName: "Value Date",
            flex: 1,
            headerClassName: "grid",
            renderCell: (params) => {
                return (
                    <div className={params.row.isAlreadyUploaded ? 'error' : '' || params.row.suggestionRemark === "" ? "" : params.row.suggestionRemark === "Rejected" ? 'warning' : 'success'}  style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }} data-uk-grid>
                        <span>
                            {`${dateFormat_YY_MM_DD_NEW(params.row.transactionDate)}`}
                        </span>
                    </div>
                )
            },
        },
        {
            field: "suggestedMatchAccount",
            headerName: "Matched Account",
            flex: 1,
            headerClassName: "grid",
            renderCell: (params) => {
                return (
                    <div className={params.row.isAlreadyUploaded ? 'error' : '' || params.row.suggestionRemark === "" ? "" : params.row.suggestionRemark === "Rejected" ? 'warning' : 'success'}  style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }} data-uk-grid>
                        <span>
                            {params.row.matchedAccount}
                        </span>
                    </div>
                )
            },
        },
        {
            field: "clientReference",
            headerName: "Client Reference",
            flex: 1,
            headerClassName: "grid",
            renderCell: (params) => {
                return (
                    <div className={params.row.isAlreadyUploaded ? 'error' : '' || params.row.suggestionRemark === "" ? "" : params.row.suggestionRemark === "Rejected" ? 'warning' : 'success'}  style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }} data-uk-grid>
                        <span>
                            {params.row.bankReference}
                        </span>
                    </div>
                )
            },
        },
        {
            field: "amount",
            headerName: "Amount",
            flex: 1,
            headerClassName: "grid",
            renderCell: (params) => {
                return (
                    <div className={params.row.isAlreadyUploaded ? 'error' : '' || params.row.suggestionRemark === "" ? "" : params.row.suggestionRemark === "Rejected" ? 'warning' : 'success'}  style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }} data-uk-grid>
                        <span>
                            {currencyFormat(params.row.amount)}
                        </span>
                    </div>
                )
            },
        },
        {
            field: "suggestion",
            headerName: "Suggestion",
            flex: 1,
            headerClassName: "grid",
            renderCell: (params) => {
                return (
                    <div className={params.row.isAlreadyUploaded ? 'error' : '' || params.row.suggestionRemark === "" ? "" : params.row.suggestionRemark === "Rejected" ? 'warning' : 'success'}  style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }} data-uk-grid>
                        <span>
                            {params.row.suggestionRemark}
                        </span>
                    </div>
                )
            },
        },
    ];

    useEffect(() => {
        const getData = async () => {
            await api.withdrawalTransaction.getAll();
        };
        getData();
    }, [api.withdrawalTransaction]);

    return (
        <div className="grid">
            <hr />
            <div className="uk-grid uk-grid-small uk-width-1-1 uk-margin-small-left" data-uk-grid>
                <button className="btn btn-primary" disabled={selectedSuggestedTransactions.length === 0} onClick={() => handleMarkAsCompetedAllocated(selectedSuggestedTransactions)}>
                Mark as Completed ({selectedSuggestedTransactions.length})
                </button>
                {/* <button className="btn btn-primary" disabled={selectedSuggestedTransactions.length === 0} onClick={() => acceptSuggestions()}>Mark as Completed</button> */}
                <button className="btn btn-primary" disabled={selectedSuggestedTransactions.length === 0} onClick={() => handleMarkAsUnallocated(selectedSuggestedTransactions)}>Mark as Unallocated ({selectedSuggestedTransactions.length})</button>
                <button className="btn btn-danger" disabled={selectedSuggestedTransactions.length === 0} onClick={() => handleMarkAsNonDeposit(selectedSuggestedTransactions)}>Mark as Non-Deposit({selectedSuggestedTransactions.length})</button>

            </div>
            <ToolbarNew
                title={
                   <div></div>
                }
                rightControls={
                    <div className="legend uk-grid uk-grid-small uk-child-width-1-4" data-uk-grid>
                      
                    </div>
                }
            />
             <Toolbar
              leftControls={  <h4 className="main-title-sm">Total Amount:</h4>}
                rightControls={
                    <h4 className="main-title-sm">N${numberFormat(totalSuggestedValue)}</h4>
                }
              />
            <Box sx={{ height: 220 }}>
                <DataGrid
                    loading={!suggestedMatch}
                    // slots={{
                    //     toolbar: CustomToolbar,
                    // }}
                    rows={suggestedMatch}
                    columns={columns}
                    getRowId={(row) => row.statementIdentifier} // Use the appropriate identifier property
                    rowHeight={40}
                />
            </Box>
        </div>
    );
});
