import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import pdfMake from "pdfmake/build/pdfmake";
import { LoadingEllipsis } from "../../../../../shared/components/loading/Loading";
import { useAppContext } from "../../../../../shared/functions/Context";
import { getBase64ImageFromURL } from "../../../../../shared/functions/MyFunctions";
import MoneyMarketAccountModel from "../../../../../shared/models/money-market-account/MoneyMarketAccount";
import { dateFormat_YY_MM_DD } from "../../../../../shared/utils/utils";
import Toolbar from "../../../shared/components/toolbar/Toolbar";

const DailyBalanceReportAssets = observer(() => {
  const { api, store } = useAppContext();
  const todaysDate = Date.now();
  const [reportDate, setReportDate] = useState(todaysDate);
  const [loading, setLoading] = useState(false);
  const [logo, setLogo] = useState<any>(null);
  const moneyMarketAccounts = store.mma.all;

  const products = store.product.all.filter(liabilities => liabilities.asJson.assetLiability === "Asset");

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
        parentId,
        entityDisplayName: account.getEntityDisplayName(parentId),
        account,
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

  const renderSorted = () => {
    return sortedAccounts.map(({ entityDisplayName, account }) => (
      <tr key={account.asJson.id}>
        <td className="uk-table-expand">{entityDisplayName}</td>
        <td className="uk-table-expand">{account.asJson.accountNumber}</td>
        {products.map((product) => (
          <td key={product.asJson.productCode}>
            {account.asJson.accountType === product.asJson.productCode
              ? (account.asJson.balance)
              : ""}
          </td>
        ))}
      </tr>
    ));
  };

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

  const content: any = {
    content: [
      {
        image: `${logo}`,
        width: 600,
        margin: [0, -50, 0, 0],
        alignment: "center",
      },
      {
        text: "_______________________________________________________________________________________________",
      },
      {
        text: `\n Daily Balance Report`,
        fontSize: 16,
        bold: true,
        margin: [0, 10, 0, 10],
      },
      {
        table: {
          headerRows: 1,
          widths: ["auto", "auto", ...products.map(() => "auto")],
          body: [
            [
              { text: "Client Name", style: "tableHeader", alignment: "left" },
              { text: "Account Number", style: "tableHeader", alignment: "left" },
              ...products.map((product) => ({
                text: product.asJson.productName,
                style: "tableHeader",
                alignment: "left",
              })),
            ],
            ...renderSorted(),
            [
              { text: "Totals", style: "tableHeader", alignment: "right" },
              { text: "-", style: "tableHeader", alignment: "right" },
              ...products.map((product) => ({
                text: `${(totalBalances[product.asJson.productCode])}`,
                style: "tableHeader",
                alignment: "right",
              })),
            ],
          ],
          layout: {
            fillColor: "#fff",
            hLineWidth: 0.01,
            vLineWidth: () => 0.01,
          },
          margin: [0, 20, 0, 10],
          fontSize: 7,
          style: "table",
        },
      },
      {
        text: `\n Exported Date: ${dateFormat_YY_MM_DD(Date.now())}`,
        fontSize: 8,
        bold: false,
      },
    ],
    styles: {
      tableHeader: {
        bold: true,
        fontSize: 9,
        color: "black",
      },
      tableRow: {
        bold: false,
        fontSize: 8,
        color: "black",
      },
    },
  };

  const handleExport = () => {
    pdfMake
      .createPdf(content)
      .download(
        `Daily Balance Report ${dateFormat_YY_MM_DD(Date.now())} .pdf`
      );
  };

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
  });

  return (
    <div className="page uk-section uk-section-small">
      <div className="uk-container uk-container-expand">
        <div className="sticky-top">
        <Toolbar
            title="Daily Balance Report(Assets)"
            rightControls={
              <button
                className="btn btn-primary"
                onClick={handleExport}
                disabled={loading}
              >
                Export (PDF)
              </button>
            }
          />
          <hr />
        </div>
        {!loading && (
          <div className="page-main-card uk-card uk-card-default uk-card-body">
            <div className="uk-grid uk-grid-small" data-uk-grid>
              <div className="scrollable-container uk-width-1-1">
                <table className="uk-table uk-table-small uk-table-divider scrollable-table">
                  <colgroup>
                    <col style={{ width: "200px" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th className="uk-table-expand">Client Name</th>
                      <th className="uk-table-expand">Account Number</th>
                      {products.map((product) => (
                        <th key={product.asJson.id} className="uk-table-expand">
                          {product.asJson.productName}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="uk-height-large">{renderSorted()}</tbody>
                  <tfoot>
                    <tr>
                      <th className="uk-table-expand">
                        <h2 className="main-title-sm">Total</h2>
                      </th>
                      <th className="uk-table-expand">
                        <h2 className="main-title-sm">-</h2>
                      </th>
                      {products.map((product) => (
                        <th key={product.asJson.id} className="uk-table-expand">
                          <h2 className="main-title-sm">
                            {(totalBalances[product.asJson.productCode])}
                          </h2>
                        </th>
                      ))}
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
      {loading && <LoadingEllipsis />}
    </div>
  );
});

export default DailyBalanceReportAssets;
