import { observer } from "mobx-react-lite";
import { Box } from "@mui/material";

import { DataGrid, GridColDef } from "@mui/x-data-grid";

import { useEffect } from "react";

import { IUnMatchedTransaction } from "../../../../../../../shared/interfaces/BankStatements";
import { useAppContext } from '../../../../../../../shared/functions/Context';
import Toolbar, { ToolbarNew } from "../../../../../shared/components/toolbar/Toolbar";
import { dateFormat_YY_MM_DD_NEW } from "../../../../../../../shared/utils/utils";
import { currencyFormat, numberCurrencyFormat, numberFormat } from '../../../../../../../shared/functions/Directives';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

interface IProp {
    unmatched: IUnMatchedTransaction[];
    readyUnmatched: IUnMatchedTransaction[];
    setUnmatched: React.Dispatch<React.SetStateAction<IUnMatchedTransaction[]>>;
    selectedUnmatchedTransactions: IUnMatchedTransaction[];
    setSelectedUnmatchedTransactions: React.Dispatch<React.SetStateAction<IUnMatchedTransaction[]>>;
    selectAllUnmatchedRef: React.RefObject<HTMLInputElement>
    handleMarkUnmatchedAsUnallocated: (value: IUnMatchedTransaction[]) => void
    handleMarkUnmatchedAsNonDeposit: (value: IUnMatchedTransaction[]) => void
}

export const UnmatchedItemsGrid = observer((props: IProp) => {

    const {
        unmatched,
        setUnmatched,
        readyUnmatched,
        selectedUnmatchedTransactions,
        setSelectedUnmatchedTransactions,
        selectAllUnmatchedRef,
        handleMarkUnmatchedAsUnallocated,
        handleMarkUnmatchedAsNonDeposit
    } = props

    const { api } = useAppContext();

    const handleUnmatchedCheckboxChange = (transaction: IUnMatchedTransaction) => {
        const isSelected = selectedUnmatchedTransactions.some(t => t.bankReference === transaction.bankReference);
        const newSelectedTransactions = isSelected
            ? selectedUnmatchedTransactions.filter(t => t.bankReference !== transaction.bankReference)
            : [...selectedUnmatchedTransactions, transaction];

        setSelectedUnmatchedTransactions(newSelectedTransactions);
    };

    const totalUnmatchedValue = unmatched.reduce((sum, transaction) => sum + transaction.amount, 0);

    const handleSelectAllUnmatchedChange = () => {
        const newSelectedTransactions = selectedUnmatchedTransactions.length === unmatched.filter(t => !t.isAlreadyUploaded).length
            ? []
            : unmatched.filter(t => !t.isAlreadyUploaded);
        setSelectedUnmatchedTransactions(newSelectedTransactions);
    };


    const moveToUnallocated = () => {

        const updatedTransactions = unmatched.map(transaction =>
            selectedUnmatchedTransactions.some(t => t.bankReference === transaction.bankReference)
                ? { ...transaction, suggestionRemark: 'Rejected' }
                : transaction
        );
        setUnmatched(updatedTransactions);
        setSelectedUnmatchedTransactions([]);
    }


    const markAsNonDeposit = () => {
        const updatedTransactions = unmatched.map(transaction =>
            selectedUnmatchedTransactions.some(t => t.bankReference === transaction.bankReference)
                ? { ...transaction, suggestionRemark: '' }
                : transaction
        );
        setUnmatched(updatedTransactions);
        setSelectedUnmatchedTransactions([]);
    }

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
                        params.row.isAlreadyUploaded && <FontAwesomeIcon className={params.row.isAlreadyUploaded ? 'error' : '' || params.row.suggestionRemark === "" ? "" : params.row.suggestionRemark === "Rejected" ? 'warning' : 'success'} icon={faTriangleExclamation} />
                    }
                    {
                        !params.row.isAlreadyUploaded &&
                        <input
                            className="uk-checkbox"
                            type="checkbox"
                            checked={selectedUnmatchedTransactions.some(t => t.bankReference === params.row.bankReference)}
                            onChange={() => handleUnmatchedCheckboxChange(params.row)}
                        />
                    }
                </>
            ),
            renderHeader: () => (
                <input
                    className="uk-checkbox uk-margin-small-top"
                    type="checkbox"
                    ref={selectAllUnmatchedRef}
                    checked={selectedUnmatchedTransactions.length === unmatched.filter(t => !t.isAlreadyUploaded).length}
                    onChange={handleSelectAllUnmatchedChange}
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
                    <div className={params.row.isAlreadyUploaded ? 'error' : '' || params.row.suggestionRemark === "" ? "" : params.row.suggestionRemark === "Rejected" ? 'success' : ''} style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }} data-uk-grid>
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
                    <div className={params.row.isAlreadyUploaded ? 'error' : '' || params.row.suggestionRemark === "" ? "" : params.row.suggestionRemark === "Rejected" ? 'warning' : 'success'} style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }} data-uk-grid>
                        <span>
                            {`${dateFormat_YY_MM_DD_NEW(params.row.transactionDate)}`}
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
                    <div className={params.row.isAlreadyUploaded ? 'error' : '' || params.row.suggestionRemark === "" ? "" : params.row.suggestionRemark === "Rejected" ? 'warning' : 'success'} style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }} data-uk-grid>
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
                    <div className={params.row.isAlreadyUploaded ? 'error' : '' || params.row.suggestionRemark === "" ? "" : params.row.suggestionRemark === "Rejected" ? 'warning' : 'success'} style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }} data-uk-grid>
                        <span>
                            {currencyFormat(params.row.amount)}
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
                {/* <button className="btn btn-primary" disabled={selectedUnmatchedTransactions.length === 0} onClick={() => handleMarkUnmatchedAsCompetedAllocated(selectedUnmatchedTransactions)}>
                    Index Selected {`(${readyUnmatched.length})`}
                </button> */}
                <button className="btn btn-primary" disabled={selectedUnmatchedTransactions.length === 0} onClick={() => handleMarkUnmatchedAsUnallocated(selectedUnmatchedTransactions)}>Mark as Unallocated  {`(${selectedUnmatchedTransactions.length})`}</button>
                <button className="btn btn-danger" disabled={selectedUnmatchedTransactions.length === 0} onClick={() => handleMarkUnmatchedAsNonDeposit(selectedUnmatchedTransactions)}>Mark as Non-Deposit   {`(${selectedUnmatchedTransactions.length})`}</button>
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
                    <h4 className="main-title-sm">N${numberCurrencyFormat(totalUnmatchedValue)}</h4>
                }
              />
            <Box sx={{ height: 250 }}>
                <DataGrid
                    loading={!unmatched}
                    // slots={{
                    //     toolbar: CustomToolbar,
                    // }}
                    rows={unmatched}
                    columns={columns}
                    getRowId={(row) => row.statementIdentifier} // Use the appropriate identifier property
                    rowHeight={40}
                />
            </Box>
        </div>
    );
});
