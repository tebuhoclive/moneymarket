import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import pdfMake from "pdfmake/build/pdfmake";
import { LoadingEllipsis } from "../../../../../shared/components/loading/Loading";
import { useAppContext } from "../../../../../shared/functions/Context";
import { getBase64ImageFromURL } from "../../../../../shared/functions/MyFunctions";
import MoneyMarketAccountModel from "../../../../../shared/models/money-market-account/MoneyMarketAccount";
import { dateFormat_YY_MM_DD } from "../../../../../shared/utils/utils";
import Toolbar from "../../../shared/components/toolbar/Toolbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel } from "@fortawesome/free-solid-svg-icons";
import { ExportAsExcel } from "react-export-table";

const DailyBalanceReportLiabilities = observer(() => {
  const { store } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [logo, setLogo] = useState<any>(null);

  const moneyMarketAccounts = store.mma.getAllLiabilityAccountsNoZeroBalances().filter(a => a.asJson.status === "Active");

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

      if (parentId in groupedAccounts && account.asJson.balance !== 0) {
        groupedAccounts[parentId].push(account);
      } else {
        if (account.asJson.balance !== 0) {
          groupedAccounts[parentId] = [account];
        }
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
        text: `\n Daily Balance Report (Liabilities)`,
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


  const renderExcel = ({ onClick }: { onClick: () => void }) => {
    return (
      <button className="btn btn-primary" onClick={onClick}>
        <FontAwesomeIcon
          icon={faFileExcel}
          size="lg"
          className="icon uk-margin-small-right"
        />
        Export Excel
      </button>
    )
  }


  const getProductTotal = (productCode: string) => {
    let balance = 0;
    products.forEach((product) => {
      const filteredAccounts = moneyMarketAccounts.filter(
        (acc) => acc.asJson.accountType === productCode
      );
      const totalBalance = filteredAccounts.reduce((accumulator, item) => {
        return accumulator + item.asJson.balance;
      }, 0);
      balance = totalBalance
    });
    return balance;
  }

  const getProductTotalAccounts = (productCode: string) => {
    let totalAccounts = 0;
    products.forEach((product) => {
      const filteredAccounts = moneyMarketAccounts.filter(
        (acc) => acc.asJson.accountType === productCode
      ).length;

      totalAccounts = filteredAccounts;

    });
    return totalAccounts;
  }

  const formattedData = products
    .map((d) => {

      const $productName = d.asJson.productName;
      const $productCode = d.asJson.productCode;
      const $total = getProductTotal(d.asJson.productCode);
      const $totalAccounts = getProductTotalAccounts(d.asJson.productCode);


      return (
        {
          productName: $productName,
          productCode: $productCode,
          total: $total,
          totalAccounts: $totalAccounts,

        }
      )
    })

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        const logo = await getBase64ImageFromURL(`${process.env.PUBLIC_URL}/ijg-header.jpg`);

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
          {/* Toolbar component and other UI elements */}
          <Toolbar
            title="Daily Balance Report(Liabilities)"
            rightControls={
              <>
                <ExportAsExcel
                  fileName="Daily balance summary"
                  name="Daily"
                  data={formattedData}
                  headers={["Product Name", "Product Code", "Total Balance", "Total Accounts"]}
                >{renderExcel}
                </ExportAsExcel>
              </>
            }
          />
          <hr />
        </div>
        {!loading && (
          <div className="page-main-card">
            <div className="uk-grid uk-grid-small" data-uk-grid>
              <div className="uk-overflow-auto uk-height-large" data-uk-overflow-auto>
                <table className="kit-table-bordered">
                  <colgroup>
                    <col style={{ width: "200px" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th className="uk-width-small">Client Name</th>
                      <th className="uk-table-shrink">Account</th>
                      {products.map((product) => (
                        <th key={product.asJson.id} className="">
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

export default DailyBalanceReportLiabilities;
