import { observer } from "mobx-react-lite";
import { Box } from "@mui/material";

import { DataGrid, GridColDef } from "@mui/x-data-grid";

import { useEffect } from "react";

import { IIndexedTransaction } from "../../../../../../../shared/interfaces/BankStatements";
import { useAppContext } from '../../../../../../../shared/functions/Context';
import Toolbar, { ToolbarNew } from "../../../../../shared/components/toolbar/Toolbar";
import { dateFormat_YY_MM_DD_NEW } from "../../../../../../../shared/utils/utils";
import { currencyFormat, numberFormat } from '../../../../../../../shared/functions/Directives';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

interface IProp {
    indexedTransactions: IIndexedTransaction[];
    selectedIndexedTransactions: IIndexedTransaction[];
   
    setSelectedIndexedTransactions: React.Dispatch<React.SetStateAction<IIndexedTransaction[]>>;
    selectAllIndexedRef: React.RefObject<HTMLInputElement>
    handleRefreshIndexed:  (value: IIndexedTransaction[]) => void
}


export const IndexedItemsGrid = observer((props: IProp) => {

    const {
        indexedTransactions,
        selectedIndexedTransactions,
        setSelectedIndexedTransactions,
        selectAllIndexedRef,
        handleRefreshIndexed,
       
    } = props

    const { api } = useAppContext();

    const handleCheckboxChange = (transaction: IIndexedTransaction) => {
        const isSelected = selectedIndexedTransactions.some(t => t.bankReference === transaction.bankReference);
        const newSelectedTransactions = isSelected
            ? selectedIndexedTransactions.filter(t => t.bankReference !== transaction.bankReference && !t.isAlreadyUploaded)
            : [...selectedIndexedTransactions, transaction];

            console.log("Checked trn", newSelectedTransactions);
            
        // setSelectedSuggestedTransactions(newSelectedTransactions);
    };
    
    const totalIndexed = indexedTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);

    const handleSelectAllMatchedChange = () => {
        const newSelectedTransactions = selectedIndexedTransactions.length === indexedTransactions.length
            ? []
            : indexedTransactions.filter(t => !t.isAlreadyUploaded);
        setSelectedIndexedTransactions(newSelectedTransactions);
    };

  

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
                        // checked={}
                        onChange={() => handleCheckboxChange(params.row)}
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
            flex: 1,
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
            flex: 1,
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
            flex: 1,
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
            flex: 1,
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
            flex: 1,
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
        //     flex: 1,
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
            flex: 1,
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
                {/* <button className="btn btn-danger" onClick={() => handleRefreshIndexed()}>Return to Matched ({indexedTransactions.length})</button> */}
                <button className="btn btn-primary" disabled={selectedIndexedTransactions.length === 0} onClick={() => handleRefreshIndexed(selectedIndexedTransactions)}>
                Restore to Queue ({selectedIndexedTransactions.length})
                </button>
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
                    <h4 className="main-title-sm">N${numberFormat(totalIndexed)}</h4>
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
