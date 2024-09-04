import { observer } from "mobx-react-lite";
import { Box } from "@mui/material";

import { DataGrid, GridColDef } from "@mui/x-data-grid";

import { useEffect } from "react";

import { IMatchedTransaction } from "../../../../../../../shared/interfaces/BankStatements";
import { useAppContext } from '../../../../../../../shared/functions/Context';
import Toolbar, { ToolbarNew } from "../../../../../shared/components/toolbar/Toolbar";
import { dateFormat_YY_MM_DD_NEW } from "../../../../../../../shared/utils/utils";
import { currencyFormat, numberCurrencyFormat, numberFormat } from '../../../../../../../shared/functions/Directives';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

interface IProp {
    matched: IMatchedTransaction[];
    selectedMatchedTransactions: IMatchedTransaction[];
    setSelectedMatchedTransactions: React.Dispatch<React.SetStateAction<IMatchedTransaction[]>>;
    selectAllMatchedRef: React.RefObject<HTMLInputElement>
    handleIndexAutoAllocated: (value: IMatchedTransaction[]) => void
}

export const MatchedItemsGrid = observer((props: IProp) => {

    const {
        matched,
        selectedMatchedTransactions,
        setSelectedMatchedTransactions,
        selectAllMatchedRef,
        handleIndexAutoAllocated
    } = props

    const { api } = useAppContext();

    const handleMatchedCheckboxChange = (transaction: IMatchedTransaction) => {
        const isSelected = selectedMatchedTransactions.some(t => t.bankReference === transaction.bankReference);
        const newSelectedTransactions = isSelected
            ? selectedMatchedTransactions.filter(t => t.bankReference !== transaction.bankReference)
            : [...selectedMatchedTransactions, transaction];

        setSelectedMatchedTransactions(newSelectedTransactions);
      
    };

    

    const totalMatchedValue = matched.reduce((sum, transaction) => sum + transaction.amount, 0);

    const handleSelectAllMatchedChange = () => {
        const newSelectedTransactions = selectedMatchedTransactions.length === matched.filter(t => !t.isAlreadyUploaded).length
            ? []
            : matched.filter(t => !t.isAlreadyUploaded);
        setSelectedMatchedTransactions(newSelectedTransactions);
         // Reset the transactions array to an empty array
       
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
                        params.row.isAlreadyUploaded && <FontAwesomeIcon className={params.row.isAlreadyUploaded ? 'error' : 'success'} icon={faTriangleExclamation} />
                    }
                    {
                        !params.row.isAlreadyUploaded &&
                        <input
                            className="uk-checkbox"
                            type="checkbox"
                            checked={selectedMatchedTransactions.some(t => t.bankReference === params.row.bankReference)}
                            onChange={() => handleMatchedCheckboxChange(params.row)}
                        />
                    }
                </>
            ),
            renderHeader: () => (
                <input
                    className="uk-checkbox uk-margin-small-top"
                    type="checkbox"
                    ref={selectAllMatchedRef}
                    checked={selectedMatchedTransactions.length === matched.filter(t => !t.isAlreadyUploaded).length}
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
                    <div className={params.row.isAlreadyUploaded ? 'error' : 'success'} style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }} data-uk-grid>
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
                    <div className={params.row.isAlreadyUploaded ? 'error' : 'success'} style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }} data-uk-grid>
                        <span>
                            {`${dateFormat_YY_MM_DD_NEW(params.row.transactionDate)}`}
                        </span>
                    </div>
                )
            },
        },
        {
            field: "matchedAccount",
            headerName: "Matched Account",
            flex: 1,
            headerClassName: "grid",
            renderCell: (params) => {
                return (
                    <div className={params.row.isAlreadyUploaded ? 'error' : 'success'} style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }} data-uk-grid>
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
                    <div className={params.row.isAlreadyUploaded ? 'error' : 'success'} style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }} data-uk-grid>
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
                    <div className={params.row.isAlreadyUploaded ? 'error' : 'success'} style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }} data-uk-grid>
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
            <div className="uk-grid uk-grid-small uk-margin-small-left" data-uk-grid>
                <button className="btn btn-primary" disabled={selectedMatchedTransactions.length === 0} onClick={() => handleIndexAutoAllocated(selectedMatchedTransactions)}>
                    Index Selected ({selectedMatchedTransactions.length})
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
                    <h4 className="main-title-sm">N${numberFormat(totalMatchedValue)}</h4>
                }
              />
            <Box sx={{ height: 250 }}>
                <DataGrid
                    loading={!matched}
                    // slots={{
                    //     toolbar: CustomToolbar,
                    // }}
                    rows={matched}
                    columns={columns}
                    getRowId={(row) => row.statementIdentifier} // Use the appropriate identifier property
                    rowHeight={40}
                />
            </Box>
        </div>
    );
});
