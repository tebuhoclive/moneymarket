import { observer } from "mobx-react-lite";
import { Box } from "@mui/material";

import { DataGrid, GridColDef } from "@mui/x-data-grid";

import { useEffect } from "react";

import { IIndexedTransaction } from "../../../../../../../shared/interfaces/BankStatements";
import { useAppContext } from '../../../../../../../shared/functions/Context';
import { ToolbarNew } from "../../../../../shared/components/toolbar/Toolbar";
import { dateFormat_YY_MM_DD_NEW } from "../../../../../../../shared/utils/utils";
import { currencyFormat, numberFormat } from '../../../../../../../shared/functions/Directives';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

interface IProp {
    indexedTransactions: IIndexedTransaction[];
    selectedIndexedTransactions: IIndexedTransaction[];
    setSelectedIndexedTransactions: React.Dispatch<React.SetStateAction<IIndexedTransaction[]>>;
    selectAllIndexedRef: React.RefObject<HTMLInputElement>
    handleRefreshIndexed: () => void;
}

export const IndexedItemsGrid = observer((props: IProp) => {

    const {
        indexedTransactions,
        selectedIndexedTransactions,
        setSelectedIndexedTransactions,
        selectAllIndexedRef,
        handleRefreshIndexed
    } = props

    const { api } = useAppContext();

    const handleMatchedCheckboxChange = (transaction: IIndexedTransaction) => {
        const isSelected = selectedIndexedTransactions.some(t => t.bankReference === transaction.bankReference);
        const newSelectedTransactions = isSelected
            ? selectedIndexedTransactions.filter(t => t.bankReference !== transaction.bankReference)
            : [...selectedIndexedTransactions, transaction];

        setSelectedIndexedTransactions(newSelectedTransactions);
    };

    const totalIndexed = indexedTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);

    const handleSelectAllMatchedChange = () => {
        const newSelectedTransactions = selectedIndexedTransactions.length === indexedTransactions.length
            ? []
            : indexedTransactions.filter(t => !t.isAlreadyUploaded);
        setSelectedIndexedTransactions(newSelectedTransactions);
    };

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
                            checked={selectedIndexedTransactions.some(t => t.bankReference === params.row.bankReference)}
                            onChange={() => handleMatchedCheckboxChange(params.row)}
                        />
                    }
                </>
            ),
            renderHeader: () => (
                <input
                    className="uk-checkbox uk-margin-small-top"
                    type="checkbox"
                    ref={selectAllIndexedRef}
                    checked={selectedIndexedTransactions.length === indexedTransactions.length}
                    onChange={handleSelectAllMatchedChange}
                />
            ),
        },
        {
            field: "transactionDate",
            headerName: "Transaction Date",
     width:200,
            headerClassName: "grid",
            renderCell: (params) => {
                return (
                    <div className='uk-grid uk-grid-small uk-grid-match' style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }} data-uk-grid>
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
     width:200,
            headerClassName: "grid",
            renderCell: (params) => {
                return (
                    <div className='uk-grid uk-grid-small uk-grid-match' style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }} data-uk-grid>
                        <span>
                            {`${dateFormat_YY_MM_DD_NEW(params.row.transactionDate)}`}
                        </span>
                    </div>
                )
            },
        },
        {
            field: "indexedTransactionsAccount",
            headerName: "Matched Account",
     width:200,
            headerClassName: "grid",
            renderCell: (params) => {
                return (
                    <div className='uk-grid uk-grid-small uk-grid-match' style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }} data-uk-grid>
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
     width:200,
            headerClassName: "grid",
            renderCell: (params) => {
                return (
                    <div className='uk-grid uk-grid-small uk-grid-match' style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }} data-uk-grid>
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
     width:200,
            headerClassName: "grid",
            renderCell: (params) => {
                return (
                    <div className='uk-grid uk-grid-small uk-grid-match' style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }} data-uk-grid>
                        <span>
                            {currencyFormat(params.row.amount)}
                        </span>
                    </div>
                )
            },
        },
        // {
        //     field: "matchType",
        //     headerName: "Match Type",
        //     width: 200,
        //     headerClassName: "grid",
        //     renderCell: (params) => {
        //         return (
        //             <div className='uk-grid uk-grid-small uk-grid-match' style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }} data-uk-grid>
        //                 <span>
        //                     {params.row.matchType}
        //                 </span>
        //             </div>
        //         )
        //     },
        // },
        {
            field: "remark",
            headerName: "Remark",
     width:200,
            headerClassName: "grid",
            renderCell: (params) => {
                return (
                    <div className='uk-grid uk-grid-small uk-grid-match' style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }} data-uk-grid>
                        <span>
                            {params.row.remark}
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
            <div className="uk-margin-small-left uk-grid uk-grid-small uk-width-1-1" data-uk-grid>
                <button className="btn btn-danger" onClick={() => handleRefreshIndexed()}>Refresh ({indexedTransactions.length})</button>
            </div>
            <ToolbarNew
                rightControls={
                    <div className="legend uk-grid uk-grid-small uk-child-width-1-4" data-uk-grid>
                        <div className="legend-item">
                            <span className="color-box accepted"></span>
                            <span>Move to Completed</span>
                        </div>
                        <div className="legend-item">
                            <span className="color-box warning"></span>
                            <span>Move to Unallocated</span>
                        </div>
                    </div>
                }
                title={
                    <h4 className="main-title-sm">Total Amount: {numberFormat(totalIndexed)}</h4>
                }
            />
            <Box sx={{ height: 250 }}>
                <DataGrid
                    loading={!indexedTransactions}
                    // slots={{
                    //     toolbar: CustomToolbar,
                    // }}
                    rows={indexedTransactions}
                    columns={columns}
                    getRowId={(row) => row.statementIdentifier} // Use the appropriate identifier property
                    rowHeight={40}
                />
            </Box>
        </div>
    );
});
