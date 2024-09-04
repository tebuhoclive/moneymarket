import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { DataGrid, GridAlignment, GridColDef, GridFooter, GridFooterContainer } from '@mui/x-data-grid';
import pdfMake from "pdfmake/build/pdfmake";
import { LoadingEllipsis } from "../../../../../shared/components/loading/Loading";
import { useAppContext } from "../../../../../shared/functions/Context";
import { getBase64ImageFromURL } from "../../../../../shared/functions/MyFunctions";
import MoneyMarketAccountModel from "../../../../../shared/models/money-market-account/MoneyMarketAccount";
import { dateFormat_YY_MM_DD } from "../../../../../shared/utils/utils";
import Toolbar from "../../../shared/components/toolbar/Toolbar";
import DataGridToolbar from "../../../shared/components/toolbar/DataGridToolbar";
import ProductModel from "../../../../../shared/models/ProductModel";

const DailyBalanceReportLiabilitiesNew = observer(() => {
  const { api, store } = useAppContext();
  const todaysDate = Date.now();
  const [reportDate, setReportDate] = useState(todaysDate);
  const [loading, setLoading] = useState(false);
  const [logo, setLogo] = useState<any>(null);
  const moneyMarketAccounts = store.mma.all;

  const products = store.product.all.filter(liabilities => liabilities.asJson.assetLiability === "Liability")
    .sort((a, b) => {
      const nameA = a.asJson.productName;
      const nameB = b.asJson.productName;

      return nameA.localeCompare(nameB);
    });
  const groupByParentId = (accounts: MoneyMarketAccountModel[]): Record<string, MoneyMarketAccountModel[]> => {
    const groupedAccounts: Record<string, MoneyMarketAccountModel[]> = {};

    for (const account of accounts) {
      const parentId = account.asJson.parentEntity;

      if (parentId in groupedAccounts) {
        groupedAccounts[parentId].push(account);
      } else {
        groupedAccounts[parentId] = [account];
      }
    }
    return groupedAccounts;
  };

  const accounts = groupByParentId(moneyMarketAccounts);

  const sortedAccounts = Object.keys(accounts)
    .flatMap((parentId) =>
      accounts[parentId].map((account) => ({
        id: account.asJson.id,
        parentId,
        entityDisplayName: account.getEntityDisplayName(parentId),
        accountNumber: account.asJson.accountNumber,
        ...products.reduce((acc, product) => {
          acc[product.asJson.productCode] =
            account.asJson.accountType === product.asJson.productCode
              ? account.asJson.balance
              : "";
          return acc;
        }, {} as Record<string, any>),
      }))
    )
    .sort((a, b) => {
      if (a.entityDisplayName && b.entityDisplayName) {
        return a.entityDisplayName.localeCompare(b.entityDisplayName);
      } else {
        const accountNumberA = parseInt(a.parentId.slice(1), 10);
        const accountNumberB = parseInt(b.parentId.slice(1), 10);
        return accountNumberA - accountNumberB;
      }
    });

  const columns: GridColDef[] = [
    { field: 'entityDisplayName', headerName: 'Client Name', width: 150 },
    { field: 'accountNumber', headerName: 'Account Number', width: 150 },
    ...products.map((product) => ({
      field: product.asJson.productCode,
      headerName: product.asJson.productName,
      width: 200,
      type: 'number', // Specify type as 'number' for numeric columns
      align: 'right' as GridAlignment, // Explicitly cast to GridAlignment
      headerAlign: 'right' as GridAlignment, // Explicitly cast to GridAlignment,
    })),
  ];

  const totalBalances: Record<string, number> = {};

  products.forEach((product) => {
    const filteredAccounts = moneyMarketAccounts.filter(
      (acc) => acc.asJson.accountType === product.asJson.productCode
    );

    totalBalances[product.asJson.productCode] = filteredAccounts.reduce(
      (acc, account) => acc + account.asJson.balance,
      0
    );
  });

  const CustomToolbar = () => {
    return (
      <DataGridToolbar
      />
    );
  };

  // const CustomFooter = (products: ProductModel[], totalBalances: Record<string, number>) => {
  //   return (
  //     <GridFooterContainer>
  //       <GridFooter />
  //       <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px' }}>
  //         {columns.map((column, index) => {
  //           if (index === 0) {
  //             return (
  //               <div key={column.field} style={{ flex: column.width }}>
  //                 Total
  //               </div>
  //             );
  //           } else if (index === 1) {
  //             return (
  //               <div key={column.field} style={{ flex: column.width }}>
  //                 -
  //               </div>
  //             );
  //           } else {
  //             const product = products.find(p => p.asJson.productCode === column.field);

  //             if (product) {
  //               return (
  //                 <div key={column.field} style={{ flex: column.width, textAlign: column.headerAlign }}>
  //                   {totalBalances[product.asJson.productCode]}
  //                 </div>
  //               );
  //             } else {
  //               return (
  //                 <div key={column.field} style={{ flex: column.width, textAlign: column.headerAlign }}>
  //                 </div>
  //               );
  //             }
  //           }
  //         })}
  //       </div>
  //     </GridFooterContainer>
  //   );
  // };

  // const handleExport = () => {
  //   // Define the content for PDF generation using pdfMake here
  //   pdfMake
  //     .createPdf(content)
  //     .download(`Daily Balance Report ${dateFormat_YY_MM_DD(Date.now())}.pdf`);
  // };

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        const logo = await getBase64ImageFromURL(
          `${process.env.PUBLIC_URL}/ijg-header.jpg`
        );

        if (logo) {
          setLogo(logo);
        }

        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  return (
    <div className="page uk-section uk-section-small">
      <div className="uk-container uk-container-expand">
        <div className="sticky-top">
          <Toolbar
            title="Daily Balance Report (Assets)"
            rightControls={
              <button
                className="btn btn-primary"
                // onClick={handleExport}
                disabled={loading}
              >
                Export (PDF)
              </button>
            }
          />
          <hr />
        </div>
        {!loading && (
          <div className="page-main-card grid">
            <div style={{ height: 400, width: '100%' }}>
              <DataGrid
                slots={{
                  toolbar: CustomToolbar,
                  // footer: () => CustomFooter(products, totalBalances)
                }}
                rows={sortedAccounts}
                columns={columns}
                // pageSize={10}
                // rowsPerPageOptions={[10]}
                getRowId={(row) => row.id}
                loading={loading}
              />
            </div>
          </div>
        )}
      </div>
      {loading && <LoadingEllipsis />}
    </div>
  );
});

export default DailyBalanceReportLiabilitiesNew;
