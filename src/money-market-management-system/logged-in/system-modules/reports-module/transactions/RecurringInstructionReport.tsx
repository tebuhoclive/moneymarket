import { useEffect, useState } from "react";
import Toolbar from "../../../shared/components/toolbar/Toolbar";
import { observer } from "mobx-react-lite";
import { useAppContext } from "../../../../../shared/functions/Context";
import { getBase64ImageFromURL, } from "../../../../../shared/functions/MyFunctions";
import { dateFormat_YY_MM_DD } from "../../../../../shared/utils/utils";
import pdfMake from "pdfmake/build/pdfmake";
import { LoadingEllipsis } from "../../../../../shared/components/loading/Loading";



const RecurringWithdrawalInstructionReport = observer(() => {
    const { api, store } = useAppContext();
    const [loading, setLoading] = useState(false);
    const [_loading, _setLoading] = useState(false);
  
    const todaysDate = Date.now();
    const [reportDate, setReportDate] = useState(todaysDate);
    
    const [logo, setLogo] = useState<any>(null);
  
  const recuralInstructions = store.recurringWithdrawalInstruction.all.sort(
    (a, b) => {
      if (a.asJson.entity && b.asJson.entity) {
        return a.asJson.entity.localeCompare(b.asJson.entity);
      } else {
        const accountNumberA = parseInt(a.asJson.allocation.slice(1), 10);
        const accountNumberB = parseInt(b.asJson.allocation.slice(1), 10);
        return accountNumberA - accountNumberB;
      }
    }
  );

  const clients = [
    ...store.client.naturalPerson.all,
    ...store.client.legalEntity.all,
  ];


  // used to check for names in using the entity
  // const displayNames = recuralInstructions.map((instruction) => {
  //   const client = clients.find(
  //     (client) => client.asJson.entityId === instruction.asJson.entity
  //   );
  //   return client ? client.asJson.entityDisplayName : null;
  // });

  
const updatedRecurringInstructions = recuralInstructions.map((instruction) => {
  const client = clients.find(
    (client) => client.asJson.entityId === instruction.asJson.entity
  );
  const displayName = client ? client.asJson.entityDisplayName : null;

  // Create new data containing recurringInstruction data plus the displayName
  return {
    ...instruction,
    id: instruction.asJson.id,
    displayName: displayName,
    amount: instruction.asJson.amount,
    transactionDate: instruction.asJson.transactionDate,
    allocation: instruction.asJson.allocation,
    recurringDay: instruction.asJson.recurringDay,
    reference: instruction.asJson.reference,
   
  };
});



    const totalRecurringAmount = recuralInstructions.reduce(
      (acc, recurral) => acc + recurral.asJson.amount,
      0
    );


  
  const content :any = {
    content: [
      // Your logo and other content before the table
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
        text: `\n Recurring Instruction Report`,
        fontSize: 16,
        bold: true,
        margin: [0, 10, 0, 10],
      },
      {
        table: {
          headerRows: 1,
          widths: ["auto", "auto", "auto", "auto", "auto"],
          body: [
            [
              { text: "Client", style: "tableHeader", alignment: "left" },
              {
                text: "Transaction Date",
                style: "tableHeader",
                alignment: "left",
              },
              { text: "Account", style: "tableHeader", alignment: "left" },
              {
                text: "Recurring Amount",
                style: "tableHeader",
                alignment: "left",
              },
              {
                text: "Recurring Day",
                style: "tableHeader",
                alignment: "left",
              },
            ],
            ...updatedRecurringInstructions.map((recurral) => [
              recurral.displayName,
              dateFormat_YY_MM_DD(recurral.transactionDate),
              recurral.allocation,
              (recurral.amount),
              recurral.recurringDay,
            ]),
          ],
          layout: {
            fillColor: "#fff",
            hLineWidth: 0.01,
            vLineWidth: () => 0.01,
          },
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
    },
  };

  
  
  // Use pdfMake to create and download the PDF
  const pdfDocGenerator = pdfMake.createPdf(content);

  
    const handleExport = () => {
      pdfDocGenerator.download(
        `Recurring_Instruction_Report_${dateFormat_YY_MM_DD(Date.now())}.pdf`
      );

    };
  
    // const onInitiate = async (
    //   accountNumber: string,
    //   productCode: string,
    //   amount: number,
    //   cid: string
    // ) => {
    //   try {
    //     setLoading(true);
    //     await initiateInActiveAccount(
    //       api,
    //       store,
    //       accountNumber,
    //       productCode,
    //       amount,
    //       cid
    //     );
    //   } catch (error) {
    //   } finally {
    //     setLoading(false);
    //   }
    // };
  
    useEffect(() => {
      const loadAll = async () => {
        const logo = await getBase64ImageFromURL(
          `${process.env.PUBLIC_URL}/ijg-header.jpg`
        );
        if (logo) {
          setLogo(logo);
        }
        await api.recurringWithdrawalInstruction.getAll();
        // try {
        //     setLoading(true)
        //     if (store.closeOutStore.isEmpty) {
        //         await api.closeOutApi.getAll();
        //     }
        //     setLoading(false)
        // } catch (error) { }
      };
      loadAll();
    }, [api.recurringWithdrawalInstruction]);
  
    return (
      <div className="page uk-section uk-section-small">
        <div className="uk-container uk-container-expand">
          <div className="sticky-top">
            <Toolbar
              title="Recurring Instruction Report"
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
                    <th>Client Name</th>
                    <th>Transaction Date</th>
                    <th>Account</th>
                    <th>Recurring Amount</th>
                    <th>Recurring Day</th>
                    <th>Reference</th>
                   
                  </tr>
                </thead>
                <tbody>
                  {updatedRecurringInstructions.map((recurral) => (
                    <tr key={recurral.id}>
                      <td>{recurral.displayName}</td>
                      <td>{dateFormat_YY_MM_DD(recurral.transactionDate)}</td>
                      <td>{recurral.allocation}</td>
                      <td>{(recurral.amount)}</td>
                      <td>{recurral.recurringDay}</td>
                      <td>{recurral.reference}</td>
                      <td></td>
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
  
export default RecurringWithdrawalInstructionReport;
