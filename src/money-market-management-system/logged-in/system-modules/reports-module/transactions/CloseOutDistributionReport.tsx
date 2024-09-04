import { useEffect, useState } from "react";

import { observer } from "mobx-react-lite";

import pdfMake from "pdfmake/build/pdfmake";
import { LoadingEllipsis } from "../../../../../shared/components/loading/Loading";
import { useAppContext } from "../../../../../shared/functions/Context";

import { getBase64ImageFromURL, getClientName, getPersonNameMMA } from "../../../../../shared/functions/MyFunctions";
import { dateFormat_YY_MM_DD } from "../../../../../shared/utils/utils";
import { initiateInActiveAccount } from "./InitiateInActiveAccount";
import { getProductCode } from "./GetProductCode";
import Toolbar from "../../../shared/components/toolbar/Toolbar";

const CloseOutDistributionReport = observer(() => {
  const { api, store } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [_loading, _setLoading] = useState(false);

  const todaysDate = Date.now();
  const [reportDate, setReportDate] = useState(todaysDate);

  const [logo, setLogo] = useState<any>(null);
  const allCloseOutDistribution = store.closeOutStore.all.filter(
    (t) => t.asJson.isPaymentProcessed === true
  );

  const closeOutDistribution = store.closeOutStore.all.sort((a, b) => {
    if (a.asJson.entity && b.asJson.entity) {
      return a.asJson.entity.localeCompare(b.asJson.entity);
    } else {
      const accountNumberA = parseInt(a.asJson.accountNumber.slice(1), 10);
      const accountNumberB = parseInt(b.asJson.accountNumber.slice(1), 10);

      return accountNumberA - accountNumberB;
    }
  });

  const totalCapitalisedAmount = closeOutDistribution.reduce(
    (acc, closeOut) => acc + closeOut.asJson.capitalisedAmount,
    0
  );
  const totalCloseOutAmount = closeOutDistribution.reduce(
    (acc, closeOut) => acc + closeOut.asJson.closeOutAmount,
    0
  );
  console.log("all", allCloseOutDistribution);

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
        text: `\n Close Out Distribution Report`,
        fontSize: 16,
        bold: true,
        margin: [0, 10, 0, 10],
      },
      {
        table: {
          headerRows: 1,
          widths: ["auto", "auto", "auto", "auto", "auto", "auto"],
          body: [
            [
              { text: "Client Name", style: "tableHeader", alignment: "left" },
              {
                text: "Account Number",
                style: "tableHeader",
                alignment: "left",
              },
              { text: "Fund", style: "tableHeader", alignment: "left" },
              {
                text: "Capitalized Interest Amount(Before Closeout)",
                style: "tableHeader",
                alignment: "left",
              },
              { text: "Close Amount", style: "tableHeader", alignment: "left" },
              { text: "Last Rate", style: "tableHeader", alignment: "left" },
            ],
            ...allCloseOutDistribution.map((closeOut) => [
              {
                text: getPersonNameMMA(closeOut.asJson.entity, store), // Add the function to get the client name
                style: "tableRow",
                alignment: "left",
              },
              {
                text: closeOut.asJson.accountNumber,
                style: "tableRow",
                alignment: "right",
              },
              {
                text: getProductCode(store, closeOut.asJson.accountNumber),
                style: "tableRow",
                alignment: "right",
              },
              {
                text: closeOut.asJson.capitalisedAmount || "",
                style: "tableRow",
                alignment: "right",
              },
              {
                text: closeOut.asJson.closeOutAmount || "",
                style: "tableRow",
                alignment: "right",
              },
              {
                text: closeOut.asJson.lastRate || "",
                style: "tableRow",
                alignment: "right",
              },
            ]),
            [
              { text: "Totals", style: "tableHeader", alignment: "right" },
              { text: "-", style: "tableHeader", alignment: "right" },
              { text: "-", style: "tableHeader", alignment: "right" },
              {
                text: `${(totalCapitalisedAmount)}`,
                style: "tableHeader",
                alignment: "right",
              },
              {
                text: `${(totalCloseOutAmount)}`,
                style: "tableHeader",
                alignment: "right",
              },
              { text: ``, style: "tableHeader", alignment: "right" },
            ],
          ],
          layout: {
            fillColor: "#fff", // Background color for the table cells
            hLineWidth: 0.01, // Adjust the thickness of horizontal lines
            vLineWidth: () => 0.01, // Adjust the thickness of vertical lines
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
      .download(`Daily Balance Report ${dateFormat_YY_MM_DD(Date.now())} .pdf`);
  };

  const onInitiate = async (
    accountNumber: string,
    productCode: string,
    amount: number,
    cid: string
  ) => {
    try {
      setLoading(true);
      await initiateInActiveAccount(
        api,
        store,
        accountNumber,
        productCode,
        amount,
        cid
      );
    } catch (error) {
    } finally {
      try {
        await api.closeOutApi.getAll();
      } catch (error) { }
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      const logo = await getBase64ImageFromURL(
        `${process.env.PUBLIC_URL}/ijg-header.jpg`
      );
      if (logo) {
        setLogo(logo);
      }
      await api.closeOutApi.getAll();
    };
    loadAll();
  }, [api.closeOutApi]);

  useEffect(() => {
    const getData = async () => {
      await api.earlyDistribution.getAll();
    };
    getData();
  }, [api.earlyDistribution]);

  return (
    <div className="page uk-section uk-section-small">
      <div className="uk-container uk-container-expand">
        <div className="sticky-top">
          <Toolbar
            title="Close Out Distribution Report"
            rightControls={
              <form>
                <div className="uk-form-controls uk-flex">
                  <label className="uk-form-label uk-text-white" htmlFor="">
                    Report Date
                  </label>
                  <input
                    id="date"
                    value={dateFormat_YY_MM_DD(reportDate)}
                    className="uk-input uk-form-small"
                    type="date"
                    onChange={(e) => setReportDate(e.target.valueAsNumber)}
                  />
                  <button
                    type="button"
                    onClick={() => setReportDate(Date.now())}
                    className="btn btn-danger">
                    Clear
                  </button>
                </div>
              </form>
            }
          />
          <Toolbar
            rightControls={
              <div className="uk-form-controls uk-flex">
                {!loading && (
                  <button className="btn btn-primary" onClick={handleExport}>
                    Export (PDF)
                  </button>
                )}
              </div>
            }
          />
          <hr />
        </div>
        {!loading && (
          <div className="page-main-card uk-card uk-card-default uk-card-body">
            <table className="uk-table">
              <thead>
                <tr>
                  {/* <th>Client Name</th> */}
                  <th>Account Number</th>
                  <th>Fund</th>
                  <th>Capitalized Interest Amount(Before Closeout)</th>
                  <th>Closeout Amount</th>
                  <th>Client Last Balance</th>
                  <th>Last Rate</th>
                  <th> Accrued Days</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {allCloseOutDistribution.map((closeOut) => (
                  <tr key={closeOut.asJson.id}>
                    {/* <td>{closeOut.asJson.clientName}</td> */}
                    <td>{closeOut.asJson.accountNumber}</td>
                    <td>
                      {getProductCode(store, closeOut.asJson.accountNumber)}
                    </td>
                    <td>{(closeOut.asJson.capitalisedAmount)}</td>
                    <td>{(closeOut.asJson.closeOutAmount)}</td>
                    <td>
                      {(
                        closeOut.asJson.closeOutAmount -
                        closeOut.asJson.capitalisedAmount
                      )}
                    </td>
                    <td>{closeOut.asJson.lastRate}</td>
                    <td></td>
                    <td>
                      {closeOut.asJson.completeActive === true ? (
                        <p>Process Completed</p>
                      ) : (
                        <button
                          onClick={() =>
                            onInitiate(
                              closeOut.asJson.accountNumber,
                              getProductCode(
                                store,
                                closeOut.asJson.accountNumber
                              ), // product
                              closeOut.asJson.capitalisedAmount,
                              closeOut.asJson.id
                            )
                          }
                          className="btn btn-danger">
                          Mark Account as Inactive
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {loading && <LoadingEllipsis />}
      </div>
    </div>
  );
});

export default CloseOutDistributionReport;
