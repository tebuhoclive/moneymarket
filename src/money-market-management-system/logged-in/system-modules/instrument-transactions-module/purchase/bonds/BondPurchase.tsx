import React, { ChangeEvent, Fragment, useEffect, useState } from "react";
import { runInAction } from "mobx";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

import swal from "sweetalert";
// import { TreasuryBillTenderSheetItem } from "./allocation/TreasuryBillTenderSheetItem";
import { observer } from "mobx-react-lite";

import MODAL_NAMES from "../../../../dialogs/ModalName";
import Toolbar from "../../../../shared/components/toolbar/Toolbar";
import { BondTenderSheetItem } from "./allocation/BondTenderSheetItem";

import { useNavigate } from "react-router-dom";
import { CustomOpenAccordion } from "../../../../../../shared/components/accordion/Accordion";
import ErrorBoundary from "../../../../../../shared/components/error-boundary/ErrorBoundary";
import { useAppContext } from "../../../../../../shared/functions/Context";
import { bondAllocation, bondPurchaseConsideration, bondClientConsideration,  } from "../../../../../../shared/functions/Directives";
import showModalFromId from "../../../../../../shared/functions/ModalShow";
import { formatDate } from "../../../../../../shared/functions/MyFunctions";
import useTitle from "../../../../../../shared/hooks/useTitle";
import { IBond, defaultBond } from "../../../../../../shared/models/instruments/BondModel";
import { defaultBondDeskDealingSheet } from "../../../../../../shared/models/purchases/bonds/BondDeskDealingSheetModel";
import { IBondPurchaseAllocation, defaultBondPurchaseAllocationColumnVisibility, defaultBondPurchaseAllocation, BondColumnNames } from "../../../../../../shared/models/purchases/bonds/BondPurchaseAllocationModel";
import { ITreasuryBillPurchaseAllocation } from "../../../../../../shared/models/purchases/treasury-bills/TreasuryBillPurchaseAllocationModel";
import { dateFormat } from "../../../../../../shared/utils/utils";
import BondReplacementModal from "../../../../dialogs/instruments/replacement-instruments/BondReplacementModal";
import Modal from "../../../../../../shared/components/Modal";

const BondPurchase = observer(() => {
  const { api, store } = useAppContext();

  const [loading, setLoading] = useState(false);

  const allBondInstruments = store.instruments.bond.all;
  const maturities = store.purchase.bondHolding.all;

  const [clientTenderSheet, setClientTenderSheet] = useState<any[]>([]);
  const [clientTransactionFile, setClientTransactionFile] = useState<any[]>([]);

  const [toEmail, setToEmail] = useState<any[]>([]);

  const [bond, setBond] = useState<IBond>({
    ...defaultBond,
  });

  const [tenderButton, setTenderButton] = useState(false);
  const [title] = useTitle(
    `Bond Purchase Allocation: ${bond.instrumentName}`
  );
  const navigate = useNavigate();

  const periodReplacementInstrument = allBondInstruments.find(
    (periodReplacementInstrument) =>
      periodReplacementInstrument.asJson.instrumentName ===
      formatDate(bond.instrumentName)
  );

  const [sortConfig, setSortConfig] = useState<{
    key: keyof IBondPurchaseAllocation;
    direction: string;
  } | null>(null);

  const [columnVisibility, setColumnVisibility] = useState<{
    [key in keyof IBondPurchaseAllocation]: boolean;
  }>({
    ...defaultBondPurchaseAllocationColumnVisibility,
  });

  const [searchQuery, setSearchQuery] = useState("");

  const difference = Math.abs(
    (bond.maturityDate ? bond.maturityDate : 0) -
    (bond.nextCouponDate ? bond.nextCouponDate:0)
  );
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const daysToMaturity = Math.floor(difference / millisecondsPerDay);
  const allocator = store.auth.meJson;

  const totalsOnClientSheet =bondAllocation(clientTenderSheet);

  const groupedClients = clientTenderSheet.reduce(
    (grouped, client: IBondPurchaseAllocation) => {
      const { tenderRate, newNominal, considerationBON } = client;

      if (!grouped[tenderRate]) {
        grouped[tenderRate] = {
          totalConsideration: 0,
          totalNominal: 0,
          clientTenderSheet: [],
        };
      }
      grouped[tenderRate].totalNominal += newNominal;
      grouped[tenderRate].totalConsideration += considerationBON;
      grouped[tenderRate].clientTenderSheet.push(client);
      return grouped;
    },
    {}
  );

  const dealingDesk = Object.keys(groupedClients);

  const onAddItem = () => {
    const newItem: IBondPurchaseAllocation = {
      ...defaultBondPurchaseAllocation,
    };
    const data = [...clientTenderSheet];
    data.push(newItem);
    setClientTenderSheet(data);
  };

  const onItemChange =
    (index: number) =>
      (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        runInAction(() => {
          const data = [...clientTenderSheet];
          const name = e.target.name;
          const value = e.target.value;
          data[index] = { ...data[index], [name]: value };
          setClientTenderSheet(data);
        });
      };

  const onItemRemove = (index: number) => {
    const data = [...clientTenderSheet];
    data.splice(index, 1);
    setClientTenderSheet(data);
  };

  const onClientChange = (value: string, index: number) => {
    runInAction(() => {
      const data = [...clientTenderSheet];
      const clientId = value;
      data[index] = {
        ...data[index],
        clientName: value,
        clientId: clientId, // Assign the clientId to clientId
      };
      setClientTenderSheet(data);
    });
  };

  const onNumberChange = (
    value: string | number,
    index: number,
    fieldName: string
  ) => {
    const inputName = fieldName;
    const data = [...clientTenderSheet];

    if (inputName === "newNominal") {
      data[index][inputName] = Number(value);
      data[index]["considerationBON"] = Number(
        bondPurchaseConsideration(
          data[index]["tenderRate"],
          data[index]["newNominal"],
          daysToMaturity
        )
      );
      data[index]["considerationClient"] = Number(
        bondClientConsideration(
          data[index]["clientRate"],
          data[index]["newNominal"],
          daysToMaturity
        )
      );
    }

    if (inputName === "tenderRate") {
      data[index][inputName] = Number(value);
      data[index]["considerationBON"] = Number(
      bondPurchaseConsideration(
          data[index]["tenderRate"],
          data[index]["newNominal"],
          daysToMaturity
        )
      );
      data[index]["considerationClient"] = Number(
        bondClientConsideration(
          data[index]["clientRate"],
          data[index]["newNominal"],
          daysToMaturity
        )
      );
    }

    if (inputName === "margin") {
      data[index][inputName] = Number(value);
    }

    if (inputName === "clientRate") {
      data[index][inputName] = Number(value);
      data[index]["considerationClient"] = Number(
        bondClientConsideration(
          data[index]["clientRate"],
          data[index]["newNominal"],
          daysToMaturity
        )
      );
    }
    setClientTenderSheet(data);
    setIsButtonDisabled(!areInputsValid());
  };

  const onNumberOldChange = (
    value: string | number,
    index: number,
    fieldName: string
  ) => {
    runInAction(() => {
      const data = [...clientTenderSheet];
      data[index] = {
        ...data[index],
        [fieldName]: Number(value),
      };
      setClientTenderSheet(data);
    });
  };

  const handleSort = (key: keyof IBondPurchaseAllocation) => {
    let direction = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleColumnVisibilityChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedColumn = event.target
      .value as keyof IBondPurchaseAllocation;
    setColumnVisibility((prevColumnVisibility) => ({
      ...prevColumnVisibility,
      [selectedColumn]: !event.target.checked,
    }));
  };

  const sortedData = [...clientTenderSheet];

  if (sortConfig !== null) {
    sortedData.sort((a, b) => {
      if (a[sortConfig?.key] && b[sortConfig?.key]) {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
      }
      return 0;
    });
  }
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const areInputsValid = () => {
    // Assuming you have access to the necessary state variables for validation
    // Modify this based on your actual state structure
    for (const client of clientTenderSheet) {
      if (
        client.newNominal < 10000 ||
        client.tenderRate <= 0 ||
        client.margin <= 0 ||
        client.netBalance < 0
      ) {
        return false;
      }
    }

    return true;
  };

  const getSortIndicator = (
    key: keyof IBondPurchaseAllocation
  ): string => {
    if (sortConfig && sortConfig.key === key) {
      return sortConfig.direction === "asc" ? "▲" : "▼";
    }
    return "";
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredData = clientTenderSheet.filter((item) => {
    const values = Object.values(item);
    const searchValue = searchQuery.toLowerCase();
    return values.some((value) =>
      String(value).toLowerCase().includes(searchValue)
    );
  });

  const createNewInstrument = () => {
    const newBond: IBond = {
      ...defaultBond,
      instrumentName: formatDate(bond.instrumentName),
    };
    store.instruments.bond.select(newBond);
    showModalFromId(MODAL_NAMES.ADMIN.BOND_REPLACEMENT_MODAL);
  };

  const onNavigate = useNavigate();

  const canSubmitForTender = () => {
    if (
      clientTenderSheet.filter((client) => client.clientName === "").length >
      0 &&
      Number(totalsOnClientSheet.clientNominal) !== 0
    ) {
      return true;
    }
  };

  const canSubmitForExecution = () => {
    if (
      clientTenderSheet.filter(
        (client: IBondPurchaseAllocation) => client.netBalance < 0
      ).length === 0
    ) {
      return true;
    }
  };

  const onSubmitForTender = async () => {
    swal({
      title: "Are you sure?",
      icon: "warning",
      buttons: ["Cancel", "Submit"],
      dangerMode: true,
    }).then(async (edit) => {
      if (edit) {
        if (periodReplacementInstrument) {
          try {
            const _bond: IBond = {
              ...bond,
              instrumentStatus: "tendered"
            }

            api.instruments.bond.update(_bond);
            try {
              clientTenderSheet.forEach(
                async (client: IBondPurchaseAllocation) => {
                  await api.purchase.bond.createPurchaseNewTenderSheet(
                    bond.id,
                    client
                  );
                }
              );
            } catch (error) {
              console.log(error);
            }

            const toEmail: any[] = [];

            try {
              const deskDealingPromises = dealingDesk.map(
                async (tenderRate) => {
                  const deskDealingSubmission = {
                    ...defaultBondDeskDealingSheet,
                    tenderRate: Number(tenderRate),
                    nominal: groupedClients[tenderRate].totalNominal,
                    considerationBON:
                      groupedClients[tenderRate].totalConsideration,
                  };

                  try {
                    await api.purchase.bond.createDeskDealingSheet(
                      bond.id,
                      deskDealingSubmission
                    );
                    toEmail.push(deskDealingSubmission);
                  } catch (error) {
                    console.error("Error saving dealing desk sheet:", error);
                  }
                }
              );

              await Promise.all(deskDealingPromises);

              // const email = MAIL_TB_DESK_DEALING_SHEET(
              //   allocator?.displayName,
              //   bond.instrumentName,
              //   toEmail
              // );
              // await api.mail.sendMail(
              //   [
              //     "wim@ijg.net",
              //     "dylan@ijg.net",
              //     "devops@lotsinsights.com",
              //     "peangesheya@yahoo.com",
              //     "engdesign@lotsinsights.com",
              //   ],
              //   "no-reply@ijgmms.net",
              //   "TB Tender Submission",
              //   email.BODY
              // );
            } catch (error) {
              console.error("Error processing dealing desk:", error);
            }
          } catch (error) { }
        } else {
          swal({
            text: "Cannot submit Dealing Desk Tender Sheet if the instrument being Tender for has not yet been created on the system!",
            icon: "error",
          });
        }
        swal({
          text: "Dealing Desk Tender Sheet has been submitted to IJG Securities for bid submission!",
          icon: "success",
        });

        onNavigate(`/c/purchases/submitted/${bond.id}`);
      } else {
        swal({
          text: "Dealing Desk Tender Sheet has not been submitted to IJG Securities for bid submission, because the user has cancelled the action!",
          icon: "error",
        });
      }
    });
  };

  const onSave = async () => {
    swal({
      title: "Are you sure?",
      icon: "warning",
      buttons: ["Cancel", "Save"],
      dangerMode: true,
    }).then(async (edit) => {
      if (edit) {
        const _bond: IBond = {
          ...bond,
          instrumentStatus: "allocated",
        };

        api.instruments.bond.update(_bond);
        try {
          clientTenderSheet.forEach(
            async (client: IBondPurchaseAllocation) => {
              await api.purchase.bond.createPurchaseNewTenderSheet(
                bond.id,
                client
              );
            }
          );
        } catch (error) {
          console.log(error);
        }
        try {
          const deskDealingPromises = dealingDesk.map(async (tenderRate) => {
            const deskDealingSubmission = {
              ...defaultBondDeskDealingSheet,
              tenderRate: Number(tenderRate),
              nominal: groupedClients[tenderRate].totalNominal,
              considerationBON: groupedClients[tenderRate].totalConsideration,
            };

            try {
              await api.purchase.bond.createDeskDealingSheet(
                bond.id,
                deskDealingSubmission
              );
            } catch (error) {
              console.error("Error saving dealing desk sheet:", error);
            }
          });

          await Promise.all(deskDealingPromises);
        } catch (error) {
          console.error("Error processing dealing desk:", error);
        }
        swal({
          text: "File has been saved!",
          icon: "success",
        });

        onNavigate(`/c/purchases/submitted/${bond.id}`);
      }
    });
  };

  const onCreateTransactionFile = async () => {
    setClientTransactionFile(
      clientTenderSheet.filter(
        (client: IBondPurchaseAllocation) =>
          client.newNominal !== 0 && client.altTreasuryBill !== "No"
      )
    );
  };

  const onSubmitForExecution = async () => {
    swal({
      title: "Are you sure?",
      icon: "warning",
      buttons: ["Cancel", "Submit"],
      dangerMode: true,
    }).then(async (edit) => {
      if (edit) {
        if (periodReplacementInstrument) {
          clientTenderSheet.forEach(
            async (client: IBondPurchaseAllocation) => {
              if (client.id !== "") {
                await api.purchase.bond.updatePurchaseNewTenderSheet(
                  bond.id,
                  client
                );
              } else {
                await api.purchase.bond.createPurchaseNewTenderSheet(
                  bond.id,
                  client
                );
              }
              await api.purchase.bond.createPurchaseExecution(
                bond.id,
                client
              );
            }
          );
        } else {
        }
        swal({
          text: "The client tender sheet has been submitted to the Back Office for processing!",
          icon: "success",
        });
      } else {
        swal({
          text: "The client tender sheet has not been submitted to the Back Office for processing,the user has cancelled the action!",
          icon: "error",
        });
      }
    });
  };

  const handleBack = () => {
    onNavigate(`/c/purchase/instrument/Bonds`);
  };

  useEffect(() => {
    if (store.instruments.bond.selected) {
      setBond(store.instruments.bond.selected);
    } else navigate("purchases");
    document.title = title;
  }, [navigate, store.instruments.bond.selected, title]);

  useEffect(() => {
    const loadData = async () => {
      try {

        if (periodReplacementInstrument) {
          await api.purchase.bond.getAllPurchaseHoldings(
            periodReplacementInstrument.asJson.id
          );
        }
        await api.instruments.bond.getAll();
      } catch (error) { }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    api.instruments.bond,
    api.purchase.bond,
  ]);

  return (
    <div className="purchases-view-page uk-section uk-section-small" style={{overflowY:"auto", height:"100vh"}}>
      <div className="uk-container uk-container-expand">

        <div className="sticky-top uk-margin-bottom">
          <h4 className="main-title-sm">Check Bond Purchase Allocation (New)</h4>
          <button className="btn btn-danger" onClick={handleBack}>
            <FontAwesomeIcon className="uk-margin-small-right" icon={faArrowLeft} />
            Back to Instrument List
          </button>
        </div>

        <ErrorBoundary>
          <div className="uk-grid uk-grid-medium" data-uk-grid>
            <div className="page-main-card uk-card uk-card-body uk-width-1-3 uk-margin-small-right uk-margin-left" style={{overflowY:"auto", width:"50%"}}>
              <table className="kit-table uk-table uk-table-small uk-table-responsive uk-table-divider">
                <tbody>
                  <tr>
                    <td className="uk-text-bold">Instrument(Maturing)</td>
                    <td>{bond.instrumentName}</td>
                  </tr>
                  <tr>
                    <td className="uk-text-bold">Settlement Date</td>
                    <td>{dateFormat(bond.nextCouponDate)}</td>
                  </tr>
                  <tr>
                    <td className="uk-text-bold">Maturity Date</td>
                    <td>{dateFormat(bond.maturityDate)}</td>
                  </tr>
                  <tr>
                    <td className="uk-text-bold">New Instrument</td>
                    <td>
                      {formatDate(bond.instrumentName)}{" "}
                      <span className="uk-text-danger">
                        {periodReplacementInstrument ? (
                          ""
                        ) : (
                          <button
                            className="btn btn-primary"
                            onClick={createNewInstrument}>
                            Not in the System(create)
                          </button>
                        )}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="uk-text-bold">DTM</td>
                    <td>{bond.nextCouponDate}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="page-main-card uk-card uk-card-body uk-width-expand">
              <h4 className="main-title-sm">Dealing Desk - Tender Sheet</h4>
              <table className="kit-table uk-table uk-table-divider desk-dealing">
                <thead>
                  <tr>
                    <th>Instrument</th>
                    <th>Tender Rate</th>
                    <th>Nominal</th>
                    <th>Consideration</th>
                  </tr>
                </thead>
                <tbody className="uk-text-white">
                  {Object.keys(groupedClients).map((tenderRate) => (
                    <tr className="uk-text-white" key={tenderRate}>
                      <td>{formatDate(bond.instrumentName)}</td>
                      <td>{tenderRate}</td>
                      <td>
                        {(
                          groupedClients[tenderRate].totalNominal
                        )}
                      </td>
                      <td>
                        {(
                          groupedClients[tenderRate].totalConsideration
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="uk-text-white" key="grandTotal">
                    <td></td>
                    <td></td>
                    <td>
                      {(totalsOnClientSheet.clientNominal)}
                    </td>
                    <td>
                      {(totalsOnClientSheet.considerationBON)}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={onSubmitForTender}
                        disabled={isButtonDisabled} // Use the disabled state here
                      >
                        Submit For Tender
                      </button>
                    </td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <CustomOpenAccordion title={"Clients - Tender Sheet"}>
            <div className="page-main-card uk-card uk-padding-small">
              <div className="uk-margin">
                <div className="purhase-page-table">
                  <div className="uk-width-1-1 uk-padding-small">
                    <Toolbar
                      rightControls={
                        <form className="uk-form">
                          <div className="uk-form-controls">
                            <input
                              type="text"
                              className="uk-input uk-form-small"
                              placeholder="Search"
                              value={searchQuery}
                              onChange={handleSearchChange}
                            />
                          </div>
                        </form>
                      }
                      leftControls={
                        <div className="uk-flex">
                          <button className="btn btn-primary" type="button">
                            <FontAwesomeIcon
                              className="uk-margin-small-right"
                              icon={faEyeSlash}
                            />
                            Hidden Columns
                          </button>
                          <div data-uk-dropdown="mode: click; pos: bottom-left">
                            <ul className="uk-nav uk-dropdown-nav">
                              {Object.keys(columnVisibility)
                                .slice(3, 20)
                                .map((key) => (
                                  <li key={key}>
                                    <label>
                                      <input
                                        className="uk-input-small uk-checkbox uk-margin-small-right"
                                        type="checkbox"
                                        checked={
                                          !columnVisibility[
                                          key as keyof ITreasuryBillPurchaseAllocation
                                          ]
                                        }
                                        onChange={handleColumnVisibilityChange}
                                        value={key}
                                      />
                                      {
                                        BondColumnNames[
                                        key as keyof IBondPurchaseAllocation
                                        ]
                                      }
                                    </label>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        </div>
                      }
                    />
                    <div className="table-container">
                      <table className="kit-table uk-table uk-table-small uk-table-middle uk-table-responsive purchase-page-table">
                        <colgroup>
                          <col style={{ width: "200px" }} />
                        </colgroup>
                        <thead className="header">
                          <tr>
                            {Object.keys(columnVisibility)
                              .slice(2, 22)
                              .map(
                                (key) =>
                                  columnVisibility[
                                  key as keyof IBondPurchaseAllocation
                                  ] && (
                                    <th
                                      key={key}
                                      onClick={() =>
                                        handleSort(
                                          key as keyof IBondPurchaseAllocation
                                        )
                                      }>
                                      {
                                        BondColumnNames[
                                        key as keyof IBondPurchaseAllocation
                                        ]
                                      }{" "}
                                      {getSortIndicator(
                                        key as keyof IBondPurchaseAllocation
                                      )}
                                    </th>
                                  )
                              )}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData.map((item, index) => (
                            <Fragment key={index}>
                              <BondTenderSheetItem
                                index={index}
                                onItemChange={onItemChange}
                                onItemRemove={onItemRemove}
                                onNumberChange={onNumberChange}
                                onNumberOldChange={onNumberOldChange}
                                onClientChange={onClientChange}
                                handleColumnVisibilityChange={
                                  handleColumnVisibilityChange
                                }
                                clientName={item.clientName}
                                clientId={item.clientId}
                                moneyMarketAccountNumber={
                                  item.moneyMarketAccountNumber
                                }
                                maturingNominal={item.maturingNominal}
                                moneyMarketBalance={item.moneyMarketBalance}
                                availableBalance={item.availableBalance}
                                netBalance={item.netBalance}
                                newNominal={item.newNominal}
                                altTreasuryBill={item.altTreasuryBill}
                                tenderRate={item.tenderRate}
                                margin={item.margin}
                                counterParty={item.counterParty}
                                clientRate={item.clientRate}
                                considerationBON={item.considerationBON}
                                considerationClient={item.considerationClient}
                                profit={item.profit}
                                notes={item.notes}
                                contactPerson={item.contactPerson}
                                confirmation={item.confirmation}
                                dtm={daysToMaturity}
                                BondColumnNames={
                                BondColumnNames
                                }
                                columnVisibility={columnVisibility}
                              />
                            </Fragment>
                          ))}
                        </tbody>
                        {filteredData.length !== 0 && (
                          <tfoot>
                            <tr>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td>
                                {(
                                  Number(totalsOnClientSheet.clientNominal)
                                )}
                              </td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td>
                                {(
                                  Number(totalsOnClientSheet.considerationBON)
                                )}
                              </td>
                              <td>
                                {(
                                  Number(
                                    totalsOnClientSheet.considerationClient
                                  )
                                )}
                              </td>
                              <td>
                                {(
                                  Number(totalsOnClientSheet.profit)
                                )}
                              </td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>

                    <div
                      className="uk-grid uk-child-width-1-2 uk-margin-top"
                      data-uk-grid>
                      <div>
                        <button
                          className="btn btn-primary"
                          type="button"
                          onClick={onAddItem}>
                          <span data-uk-icon="icon: plus-circle; ratio:.8"></span>{" "}
                          Client
                        </button>
                      </div>
                      {clientTenderSheet.length !== 0 && (
                        <div className="uk-text-right">
                          <button
                            className="btn btn-primary"
                            type="button"
                            onClick={onSave}
                            disabled={canSubmitForTender()}>
                            Save
                          </button>
                          <br />
                          {/* <button className="btn btn-primary uk-margin-small-top" type="button" onClick={onSubmitForExecution}
                            disabled={canSubmitForExecution()}>
                            Submit for Execution
                          </button> */}
                        </div>
                      )}
                      {clientTenderSheet.length === 0 && (
                        <div className="uk-text-right">
                          <button
                            className="btn btn-primary"
                            type="button"
                            disabled={true}>
                            Save
                          </button>
                          {/* <br />
                          <button className="btn btn-primary uk-margin-small-top" type="button" disabled={true}>
                            Submit for Execution
                          </button> */}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CustomOpenAccordion>

          <Modal modalId={MODAL_NAMES.ADMIN.BOND_REPLACEMENT_MODAL}>
            <BondReplacementModal />
          </Modal>
        </ErrorBoundary>
      </div>
    </div>
  );
});

export default BondPurchase;
