import swal from "sweetalert";

import MODAL_NAMES from "../../ModalName";
import { observer } from "mobx-react-lite";

import { FormEvent, useState } from "react";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import shikongo from "./images/Shikongo.png";
import other from "./images/other_signature.jpg";
import TransactionInflowModel, { ITransactionInflow } from "../../../../../shared/models/TransactionInflowModel";
import { IAssetManagerFlowAsset } from "../../../../../shared/models/AssetManagerFlowAssetModel";

import NumberInput from "../../../shared/components/number-input/NumberInput";
import { IAssetManagerFlowLiability, defaultAssetManagerFlowLiability } from "../../../../../shared/models/AssetManagerFlowLiabilityModel";
import { useAppContext } from "../../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";

interface IProps {
  transactions: TransactionInflowModel[];
  inflows: number;
  outflows: number;
  netflow: number;
}
const DepositIndividualCorporateModal = observer((props: IProps) => {
  const { api } = useAppContext();
  const { transactions, netflow } = props;

  const [loading, setLoading] = useState(false);

  const image = `${process.env.PUBLIC_URL}/ijg-header.jpg`;

  const [deposit, setDeposit] = useState<IAssetManagerFlowLiability>({
    ...defaultAssetManagerFlowLiability,
  });

  const onCancel = () => {
    hideModalFromId(
      MODAL_NAMES.BACK_OFFICE.DEPOSIT_TO_ASSET_MANAGER
        .INDIVIDUAL_CORPORATE_MODAL
    );
  };

  // Register fonts
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
  // Import your image file

  // Function to get base64 image from URL
  const getBase64ImageFromURL = (url: string) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute("crossOrigin", "anonymous");

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);

        const dataURL = canvas.toDataURL("image/png");

        resolve(dataURL);
      };

      img.onerror = (error) => {
        reject(error);
      };

      img.src = url;
    });
  };

  async function generatePDF1() {
    const dataURL = await getBase64ImageFromURL(image);
    const dataURL1 = await getBase64ImageFromURL(image);
    const shikongoURL = await getBase64ImageFromURL(shikongo);
    const otherURL = await getBase64ImageFromURL(other);

    const docDefinition: any = {
      content: [
        {
          columns: [
            {
              image: dataURL,
              fit: [500, 600],
            },
          ],
        },
        {
          text: "Prescient IJG Unit Trust Management Company\n P O Box 186 \n Windhoek\nNamibia",
          style: "header",
        },

        "Attention: Brent Petersen\nFax: +264 61 304 671",

        { text: "9/25/2023 ,", style: "subheader" },
        "Dear Brent,",
        { text: "REDEMPTION REQUEST", style: "subheader" },
        {
          style: "tableExample",
          table: {
            widths: ["50%", "50%"], // Adjust the widths as needed (e.g., 50% for each column)
            body: [
              // [{ text: "Client Number", bold: true }, `${de}`],
              [{ text: "Entity Name", bold: true }, `${deposit.toAccount}`],
              [{ text: "Registered Number", bold: true }, "T366/07"],
              [
                { text: "From Unit Trust Fund", bold: true },
                "IJG Income Provider Fund – B1",
              ],
              [
                { text: "Value of Units", bold: true },
                `N$ ${deposit.netflows}`,
              ],
            ],
          },
        },
        "Our banking details are as follows:",
        {
          style: "tableExample",
          table: {
            widths: ["50%", "50%"], // Adjust the widths as needed (e.g., 50% for each column)
            body: [
              [
                { text: "Name of Account Holder", bold: true },
                "IJG Securities Money Market Trust",
              ],
              [{ text: "Bank", bold: true }, "Standard Bank Namibia"],
              [{ text: "Branch Code", bold: true }, "082772"],
              [{ text: "Account Number", bold: true }, "042739330"],
              [{ text: "Account Type", bold: true }, "Current"],
            ],
          },
        },

        "Yours sincerely",
        {
          columns: [
            {
              width: "*",
              stack: [
                {
                  image: shikongoURL,
                  fit: [120, 120], // Increase width and height
                  alignment: "center",
                  margin: [60, 10, 0, 0], // Adjust the margin for spacing
                },
                {
                  text: "H N Shikongo",
                  style: "subheader",
                  alignment: "center",
                },
              ],
              margin: [1, 10, 0, 0], // Adjust the margin for spacing
            },
            {
              width: "*",
              stack: [
                {
                  image: otherURL,
                  fit: [120, 100], // Increase width and height
                  alignment: "center",
                  margin: [50, 10, 0, 0], // Adjust the margin for spacing
                },

                {
                  text: "M Spath",
                  style: "subheader",
                  alignment: "center",
                },
              ],
              margin: [60, 10, 0, 0], // Adjust the margin for spacing
            },
          ],
        },
        {
          columns: [
            {
              image: dataURL1,
              fit: [500, 600],
            },
          ],
        },
      ],
      styles: {
        coloredText: {
          background: "#f0f0f0", // Replace with your desired background color in hex or any CSS-compatible color value
          color: "black", // Set the text color to black for better contrast
        },
        greyText: {
          color: "grey",
        },
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 20, 0, 10],
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5],
        },
        tableExample: {
          margin: [0, 5, 0, 15],
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: "black",
        },
      },
      defaultStyle: {
        // alignment: 'justify'
      },
    };

    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    pdfDocGenerator.download("Deposit-to-Asset-manager.pdf");
  }



  const generateAndSendPDF = async () => {
    const dataURL = await getBase64ImageFromURL(image);
    const dataURL1 = await getBase64ImageFromURL(image);
    const shikongoURL = await getBase64ImageFromURL(shikongo);
    const otherURL = await getBase64ImageFromURL(other);

    const docDefinition: any = {
      content: [
        {
          columns: [
            {
              image: dataURL,
              fit: [500, 600],
            },
          ],
        },
        {
          text: "Prescient IJG Unit Trust Management Company\n P O Box 186 \n Windhoek\nNamibia",
          style: "header",
        },

        "Attention: Brent Petersen\nFax: +264 61 304 671",

        { text: "9/25/2023 ,", style: "subheader" },
        "Dear Brent,",
        { text: "REDEMPTION REQUEST", style: "subheader" },
        {
          style: "tableExample",
          table: {
            widths: ["50%", "50%"], // Adjust the widths as needed (e.g., 50% for each column)
            body: [
              // [{ text: "Client Number", bold: true }, `${de}`],
              [{ text: "Entity Name", bold: true }, `${deposit.toAccount}`],
              [{ text: "Registered Number", bold: true }, "T366/07"],
              [
                { text: "From Unit Trust Fund", bold: true },
                "IJG Income Provider Fund – B1",
              ],
              [
                { text: "Value of Units", bold: true },
                `N$ ${deposit.netflows}`,
              ],
            ],
          },
        },
        "Our banking details are as follows:",
        {
          style: "tableExample",
          table: {
            widths: ["50%", "50%"], // Adjust the widths as needed (e.g., 50% for each column)
            body: [
              [
                { text: "Name of Account Holder", bold: true },
                "IJG Securities Money Market Trust",
              ],
              [{ text: "Bank", bold: true }, "Standard Bank Namibia"],
              [{ text: "Branch Code", bold: true }, "082772"],
              [{ text: "Account Number", bold: true }, "042739330"],
              [{ text: "Account Type", bold: true }, "Current"],
            ],
          },
        },

        "Yours sincerely",
        {
          columns: [
            {
              width: "*",
              stack: [
                {
                  image: shikongoURL,
                  fit: [120, 120], // Increase width and height
                  alignment: "center",
                  margin: [60, 10, 0, 0], // Adjust the margin for spacing
                },
                {
                  text: "H N Shikongo",
                  style: "subheader",
                  alignment: "center",
                },
              ],
              margin: [1, 10, 0, 0], // Adjust the margin for spacing
            },
            {
              width: "*",
              stack: [
                {
                  image: otherURL,
                  fit: [120, 100], // Increase width and height
                  alignment: "center",
                  margin: [50, 10, 0, 0], // Adjust the margin for spacing
                },

                {
                  text: "M Spath",
                  style: "subheader",
                  alignment: "center",
                },
              ],
              margin: [60, 10, 0, 0], // Adjust the margin for spacing
            },
          ],
        },
        {
          columns: [
            {
              image: dataURL1,
              fit: [500, 600],
            },
          ],
        },
      ],
      styles: {
        coloredText: {
          background: "#f0f0f0", // Replace with your desired background color in hex or any CSS-compatible color value
          color: "black", // Set the text color to black for better contrast
        },
        greyText: {
          color: "grey",
        },
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 20, 0, 10],
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5],
        },
        tableExample: {
          margin: [0, 5, 0, 15],
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: "black",
        },
      },
      defaultStyle: {
        // alignment: 'justify'
      },
    };

    // const docDefinition = {
    //   content: [
    //     { text: "Hello, this is your PDF content!", fontSize: 16 },
    //     // Add more content as needed
    //   ],
    // };

    // Generate PDF
    const pdfDoc = pdfMake.createPdf(docDefinition);

    // Get Base64 encoded PDF content
    pdfDoc.getBase64(async (data) => {
      try {
        const imageUrl =
          "https://firebasestorage.googleapis.com/v0/b/ijgmms-development.appspot.com/o/ijg-header.jpg?alt=media&token=e7143bea-34a3-4a72-8e22-9b9bd73c80f3";

        const htmlContent = `
 <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0;">
  <div style="max-width: 1200px; margin: 20px auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); padding: 20px; text-align: left;">
    <h2 style="color: #333333; margin-bottom: 10px;"></h2>
    <p style="color: #666666; font-size: 14px;">Here is your statement for :</p>
    
    <!-- Add your simple text content here -->
    <p style="color: #666666; font-size: 14px; margin-top: 10px;">
     Please see the attached statement
    </p>
    <p>Please contact us if you have any queries or require further information.</p>
  
    <p style="color: #666666; font-size: 14px;">Thank you for your business.</p>
    <div style="margin-top: 10px; font-style: italic; color: #999999;">
      <p style="font-size: 12px;">Kind regards,<br />IJG</p>
    </div>
    <div style="margin-top: 10px; height: 50px;">
      <img src="${imageUrl}" alt="Footer Image" style="max-width: 100%;">
    </div>
  </div>
</body>


`;
        const to = "tebuhoclive14@gmail.com";
        const from = "tebuhoclive14@gmail.com";
        // Send PDF content to Cloud Function
        const response = await fetch(
          "https://us-central1-functions-918c1.cloudfunctions.net/sendEmailToAssetManager",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              pdfContent: data,
              htmlContent: htmlContent,
              to: to,
              from: from,
            }),
          }
        );

        if (response.ok) {
        } else {
          throw new Error("Failed to send PDF");
        }
      } catch (error) {
      }
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    swal({
      title: "Are you sure?",
      icon: "warning",
      buttons: ["Cancel", "Submit"],
      dangerMode: true,
    }).then(async (edit) => {
      if (edit) {
        //create date
        const _dailyFlowDayLiability: IAssetManagerFlowLiability = {
          id: "",
          productId: "oU2sIjtXHAJnslqFqw8Y",
          // openingBalance: 0,
          toAccount: deposit.toAccount,
          netflows: netflow,
          depositAmount: 0,
          numberOfDepositUnits: deposit.numberOfDepositUnits || 0,
          withdrawalAmount: -netflow,
          numberOfWithdrawalUnits: deposit.numberOfWithdrawalUnits || 0,
          flowDate: Date.now(),
        };

        const _dailyFlowDayAsset: IAssetManagerFlowAsset = {
          id: "",
          productId: "oU2sIjtXHAJnslqFqw8Y",
          toFromAccount: deposit.toAccount,
          netflows: netflow,
          depositAmount: netflow,
          numberOfDepositUnits: deposit.numberOfDepositUnits || 0,
          withdrawalAmount: 0,
          numberOfWithdrawalUnits: deposit.numberOfWithdrawalUnits || 0,
          flowDate: Date.now(),
          openingUnits: 0,
          closingUnits: 0,
        };

        try {
          await api.assetManager.asset.create(_dailyFlowDayAsset);
          await api.assetManager.liability.create(_dailyFlowDayLiability);
          generateAndSendPDF();
          for (let index = 0; index < transactions.length; index++) {
            const transaction = transactions[index];
            const _transaction: ITransactionInflow = {
              ...transaction.asJson,
              status: "deposited",
            };
            try {
              await api.inflow.update(_transaction);
            } catch (error) {}
          }
        } catch (error) {}
        onCancel();
      } else {
        swal({
          icon: "error",
          text: "Operation cancelled!",
        });
        onCancel();
      }
    });
  };

  return (
    <ErrorBoundary>
      <div className="custom-modal-style uk-modal-dialog uk-modal-body uk-width-1-3">
        <button
          className="uk-modal-close-default"
          onClick={onCancel}
          type="button"
          data-uk-close></button>
        <h3 className="uk-modal-title">Deposit to Asset Manager</h3>
        <div className="dialog-content uk-position-relative uk-padding-small">
          <form className="uk-grid" data-uk-grid onSubmit={handleSubmit}>
            <div className="uk-form-controls uk-width-1-1">
              <label className="uk-form-label required" htmlFor="">
                To Unit Trust Fund
              </label>
              <select
                className="uk-select uk-form-small"
                name=""
                id=""
                onChange={(e) =>
                  setDeposit({ ...deposit, toAccount: e.target.value })
                }
                required>
                <option value=""> -- select account --</option>
                <option value="IJG Income Provider Fund – B3">
                  IJG Income Provider Fund – B3
                </option>
                <option value="IJG Income Provider Fund – A2">
                  IJG Money Market Fund - A2
                </option>
              </select>
            </div>

            <div className="uk-form-controls uk-width-1-1">
              <label className="uk-form-label required" htmlFor="">
                Amount (NAD)
              </label>
              <NumberInput
                className="uk-input uk-form-small"
                value={netflow}
                onChange={(value) =>
                  setDeposit({ ...deposit, netflows: Number(value) })
                }
              />
              <small>Net Flow {(netflow)}</small>
            </div>

            <div>
              {deposit.toAccount !== "" ? (
                <button
                  className="kit-dropdown-btn"
                  onClick={() => generatePDF1()}
                  title="Export your as PDF.">
                  <FontAwesomeIcon
                    icon={faFilePdf}
                    size="lg"
                    className="icon uk-margin-small-right"
                  />
                  Export PDF
                </button>
              ) : null}

              <button className="btn btn-primary uk-margin-top">Submit</button>
            </div>
          </form>
        </div>
      </div>
    </ErrorBoundary>
  );
});

export default DepositIndividualCorporateModal;
