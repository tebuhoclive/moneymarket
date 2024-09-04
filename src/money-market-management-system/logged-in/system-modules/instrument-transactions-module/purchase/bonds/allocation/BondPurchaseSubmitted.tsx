import { faEyeSlash, faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { runInAction } from "mobx";
import { useState, ChangeEvent, useEffect, Fragment } from "react";
import { useNavigate, useParams } from "react-router";


import swal from "sweetalert";
import React from "react";
import { observer } from "mobx-react-lite";

import { BondTenderSheetItem } from "./BondTenderSheetItem";

import { BondTenderSheetItemDisabled } from "./BondTenderSheetItemDisabled";
import { BondTransactionFileItem } from "./BondTransactionFileItem";

import { CustomOpenAccordion } from "../../../../../../../shared/components/accordion/Accordion";
import ErrorBoundary from "../../../../../../../shared/components/error-boundary/ErrorBoundary";
import { LoadingEllipsis } from "../../../../../../../shared/components/loading/Loading";
import { useAppContext } from "../../../../../../../shared/functions/Context";
import { bondAllocation, bondPurchaseConsideration, tbClientConsideration, bondClientConsideration, } from "../../../../../../../shared/functions/Directives";
import { formatDate } from "../../../../../../../shared/functions/MyFunctions";
import useTitle from "../../../../../../../shared/hooks/useTitle";
import { IBond, defaultBond } from "../../../../../../../shared/models/instruments/BondModel";
import { defaultBondDeskDealingSheet } from "../../../../../../../shared/models/purchases/bonds/BondDeskDealingSheetModel";
import { IBondPurchaseAllocation, defaultBondPurchaseAllocationColumnVisibility, defaultBondPurchaseAllocation, BondColumnNames } from "../../../../../../../shared/models/purchases/bonds/BondPurchaseAllocationModel";
import { IBondPurchaseTransaction, defaultBondPurchaseTransactionColumnVisibility, defaultBondPurchaseTransaction } from "../../../../../../../shared/models/purchases/bonds/BondPurchaseTransactionModel";
import { TreasuryBillColumnNames } from "../../../../../../../shared/models/purchases/treasury-bills/TreasuryBillPurchaseAllocationModel";
import { dateFormat } from "../../../../../../../shared/utils/utils";
import Toolbar from "../../../../../shared/components/toolbar/Toolbar";

const BondPurchaseSubmitted = observer(() => {
  const { api, store } = useAppContext();
  const [loading, setLoading] = useState(false);
  const onNavigate = useNavigate();
  const { purchaseId } = useParams<{ purchaseId: string }>();

  const allocator = store.auth.meJson;
  const saved = store.purchase.bondAllocation.all;
  const savedTransactionFile = store.purchase.bondTransaction.all;

  const [bond, setBond] = useState<IBond>({
    ...defaultBond,
  });
  const [title] = useTitle(
    `Bond Purchase Allocation: ${bond.instrumentName}`
  );

  const bonds = store.instruments.bond.getItemById(
    purchaseId ? purchaseId : ""
  );
  const difference = Math.abs(
    (bond.maturityDate ? bond.maturityDate : 0) -
    (bond.nextCouponDate ? bond.nextCouponDate:0)
  );
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const daysToMaturity = Math.floor(difference / millisecondsPerDay);

  const [clientTenderSheet, setClientTenderSheet] = useState<any[]>([]);
  const [clientTransactionFile, setClientTransactionFile] = useState<any[]>([]);

  const totalsOnClientSheet = bondAllocation(clientTenderSheet);
  const totalsOnTransactionFile = bondAllocation(clientTransactionFile);

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

  const [sortTransactionConfig, setSortTransactionConfig] = useState<{
    key: keyof IBondPurchaseTransaction;
    direction: string;
  } | null>(null);

  const [columnTransactionVisibility, setColumnTransactionVisibility] =
    useState<{ [key in keyof IBondPurchaseTransaction]: boolean }>({
      ...defaultBondPurchaseTransactionColumnVisibility,
    });

  const [searchTransactionQuery, setSearchTransactionQuery] = useState("");

  const allBondInstruments = store.instruments.bond.all;

  const periodReplacementInstrument = allBondInstruments.find(
    (periodReplacementInstrument) =>
      periodReplacementInstrument.asJson.instrumentName ===
      formatDate(bond.instrumentName)
  );

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
        tbClientConsideration(
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

  const onAddItemToTransactionFile = () => {
    const newItem: IBondPurchaseTransaction = {
      ...defaultBondPurchaseTransaction,
    };
    const data = [...clientTransactionFile];
    data.push(newItem);
    setClientTransactionFile(data);
  };

  const onTransactionFileNumberChange = (
    value: string | number,
    index: number,
    fieldName: string
  ) => {
    const inputName = fieldName;
    const data = [...clientTransactionFile];
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
    setClientTransactionFile(data);

  };

  const onTransactionFileNumberOldChange = (
    value: string | number,
    index: number,
    fieldName: string
  ) => {
    runInAction(() => {
      const data = [...clientTransactionFile];
      data[index] = {
        ...data[index],
        [fieldName]: Number(value),
      };
      setClientTransactionFile(data);
    });
  };

  const onTransactionFileClientChange = (value: string, index: number) => {
    runInAction(() => {
      const data = [...clientTransactionFile];
      const clientId = value;
      data[index] = {
        ...data[index],
        clientName: value,
        clientId: clientId, // Assign the clientId to clientId
      };
      setClientTransactionFile(data);
    });
  };

  const onTransactionFileItemChange =
    (index: number) =>
      (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        runInAction(() => {
          const data = [...clientTransactionFile];
          const name = e.target.name;
          const value = e.target.value;
          data[index] = { ...data[index], [name]: value };
          setClientTransactionFile(data);
        });
      };

  const onItemRemoveFromTransactionFile = (index: number) => {
    const data = [...clientTransactionFile];
    data.splice(index, 1);
    setClientTransactionFile(data);
  };

  const handleTransactionSort = (
    key: keyof IBondPurchaseTransaction
  ) => {
    let direction = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortTransactionConfig({ key, direction });
  };

  const handleTransactionColumnVisibilityChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedColumn = event.target
      .value as keyof IBondPurchaseTransaction;
    setColumnTransactionVisibility((prevColumnVisibility) => ({
      ...prevColumnVisibility,
      [selectedColumn]: !event.target.checked,
    }));
  };

  const sortedTransactionData = [...clientTransactionFile];

  if (sortTransactionConfig !== null) {
    sortedTransactionData.sort((a, b) => {
      if (a[sortTransactionConfig?.key] && b[sortTransactionConfig?.key]) {
        if (a[sortTransactionConfig.key] < b[sortTransactionConfig.key]) {
          return sortTransactionConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortTransactionConfig.key] > b[sortTransactionConfig.key]) {
          return sortTransactionConfig.direction === "asc" ? 1 : -1;
        }
      }
      return 0;
    });
  }

  const getTransactionSortIndicator = (
    key: keyof IBondPurchaseTransaction
  ): string => {
    if (sortTransactionConfig && sortTransactionConfig.key === key) {
      return sortTransactionConfig.direction === "asc" ? "▲" : "▼";
    }
    return "";
  };

  /** Search */
  const handleSearchTransactionChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setSearchTransactionQuery(event.target.value);
  };

  const filteredTransactionData = clientTransactionFile.filter((item) => {
    const values = Object.values(item);
    const searchTransactionValue = searchTransactionQuery.toLowerCase();
    return values.some((value) =>
      String(value).toLowerCase().includes(searchTransactionValue)
    );
  });

  const onHandleBack = () => {
    onNavigate(`/c/purchases`);
  };

  const [isButtonsEnabled, setIsButtonsEnabled] = useState(true);//state for the create transection and 

  const onSubmitForTender = async () => {
    swal({
      title: "Are you sure?",
      icon: "warning",
      buttons: ["Cancel", "Submit"],
      dangerMode: true,
    }).then(async (edit) => {
      if (edit) {
        if (purchaseId) {
          try {
            const toEmail: any[] = [];

            try {
              const _tb: IBond = {
                ...bond,
                instrumentStatus: "tendered"
              }

              await api.instruments.bond.update(_tb);

              const deskDealingPromises = dealingDesk.map(async tenderRate => {
                const deskDealingSubmission = {
                  ...defaultBondDeskDealingSheet,
                  tenderRate: Number(tenderRate),
                  nominal: groupedClients[tenderRate].totalNominal,
                  considerationBON: groupedClients[tenderRate].totalConsideration
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
              //   ["peangesheya@yahoo.com", "engdesign@lotsinsights.com"],
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
        if (purchaseId) {
          onNavigate(`/c/purchases/submitted/${purchaseId}`);
        }
      } else {
        swal({
          text: "Dealing Desk Tender Sheet has not been submitted to IJG Securities for bid submission, because the user has cancelled the action!",
          icon: "error",
        });
      }
    });
    setIsButtonsEnabled(true);
  };

  const onReSubmitForTender = async () => {
    swal({
      title: "Are you sure?",
      icon: "warning",
      buttons: ["Cancel", "Submit"],
      dangerMode: true,
    }).then(async (edit) => {
      if (edit) {
        if (purchaseId) {
          try {
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
                    await api.purchase.treasuryBill.createDeskDealingSheet(
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
              //   ["peangesheya@yahoo.com", "engdesign@lotsinsights.com"],
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
        if (purchaseId) {
          onNavigate(`/purchases/submitted/${purchaseId}`);
        }
      } else {
        swal({
          text: "Dealing Desk Tender Sheet has not been submitted to IJG Securities for bid submission, because the user has cancelled the action!",
          icon: "error",
        });
      }
    });
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

          const _bond: IBond = {
            ...periodReplacementInstrument.asJson,
            instrumentStatus: "purchased"
          }

          await api.instruments.bond.update(_bond);

          clientTenderSheet.forEach(async (client: IBondPurchaseAllocation) => {
            if (client.id !== "") {
              await api.purchase.bond.updatePurchaseOldTenderSheet(periodReplacementInstrument.asJson.id, client);
            } else {
              await api.purchase.bond.createPurchaseOldTenderSheet(periodReplacementInstrument.asJson.id, client);
            }
            await api.purchase.bond.createPurchaseExecution(periodReplacementInstrument.asJson.id, client);
          });
        }
        else {
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
    })

  };

  const onSubmitTransactionFileForExecution = async () => {
    swal({
      title: "Are you sure?",
      icon: "warning",
      buttons: ["Cancel", "Submit"],
      dangerMode: true,
    }).then(async (edit) => {
      if (edit) {
        if (periodReplacementInstrument) {
          const bonds: IBond = {
            ...periodReplacementInstrument.asJson,
            instrumentStatus: "purchased"
          }

          api.instruments.bond.update(bonds);

          clientTransactionFile.forEach(
            async (client: IBondPurchaseTransaction) => {
              if (client.id !== "") {
                await api.purchase.bond.updatePurchaseNewTransactionFile(
                  periodReplacementInstrument.asJson.id,
                  client
                );
              } else {
                await api.purchase.bond.createPurchaseNewTransactionFile(
                  periodReplacementInstrument.asJson.id,
                  client
                );
              }
              await api.purchase.bond.createPurchaseExecution(
                periodReplacementInstrument.asJson.id,
                client
              );
            }
          );
        } else {
        }
        swal({
          text: "The transaction file has been submitted to the Back Office for processing!",
          icon: "success",
        });
      } else {
        swal({
          text: "The transaction file has not been submitted to the Back Office for processing,the user has cancelled the action!",
          icon: "error",
        });
      }
    });
  };

  const onUpdate = async () => {
    swal({
      title: "Are you sure?",
      icon: "warning",
      buttons: ["Cancel", "Update this"],
      dangerMode: true,
    }).then(async (edit) => {
      if (edit) {
        if (purchaseId) {
          try {
            clientTenderSheet.forEach(async (client: IBondPurchaseAllocation) => {
              await api.purchase.bond.deleteAllDocumentsInCollection(purchaseId);
              if (client.id !== "") {
                try {
                  await api.purchase.bond.createPurchaseNewTenderSheet(purchaseId, client);
                } catch (error) {
                  console.log(error);
                }
              } else if (client.id === "") {
                try {
                  await api.purchase.bond.updatePurchaseNewTenderSheet(purchaseId, client);
                } catch (error) {
                  console.log(error);
                }
              } else {
                try {
                  await api.purchase.bond.createPurchaseNewTenderSheet(purchaseId, client);
                } catch (error) {
                  console.log(error);
                }
              }
            });
          } catch (error) {
            console.log(error);
          }
        } else {
          swal({
            text: "Cannot save the file if the instrument being Tender for has not yet been created on the system!",
            icon: "error",
          });
        }
        swal({
          text: "File has been saved!",
          icon: "success",
        });
      } else {
        swal({
          text: "File has not been saved, because the user has cancelled the action!",
          icon: "error",
        });
      }
    });
  };

  const onSaveTransactionFile = async () => {
    swal({
      title: "Are you sure?",
      icon: "warning",
      buttons: ["Cancel", "Save"],
      dangerMode: true,
    }).then(async (edit) => {
      if (edit) {
        if (purchaseId) {
          try {
            clientTransactionFile.forEach(
              async (client: IBondPurchaseTransaction) => {
                await api.purchase.bond.createPurchaseNewTransactionFile(
                  purchaseId,
                  client
                );
              }
            );
          } catch (error) {
            console.log(error);
          }
        } else {
          swal({
            text: "Cannot save the file if the instrument being Tender for has not yet been created on the system!",
            icon: "error",
          });
        }
        swal({
          text: "File has been saved!",
          icon: "success",
        });
      } else {
        swal({
          text: "File has not been saved, because the user has cancelled the action!",
          icon: "error",
        });
      }
    });
  };

  const onUpdateTransactionFile = async () => {
    swal({
      title: "Are you sure?",
      icon: "warning",
      buttons: ["Cancel", "Save"],
      dangerMode: true,
    }).then(async (edit) => {
      if (edit) {
        if (purchaseId) {
          try {
            clientTransactionFile.forEach(
              async (client: IBondPurchaseTransaction) => {
                if (client.id !== "") {
                  await api.purchase.bond.updatePurchaseNewTransactionFile(
                    purchaseId,
                    client
                  );
                } else {
                  await api.purchase.bond.createPurchaseNewTransactionFile(
                    purchaseId,
                    client
                  );
                }
              }
            );
          } catch (error) {
            console.log(error);
          }
        } else {
          swal({
            text: "Cannot save the file if the instrument being Tender for has not yet been created on the system!",
            icon: "error",
          });
        }
        swal({
          text: "File has been saved!",
          icon: "success",
        });
      } else {
        swal({
          text: "File has not been saved, because the user has cancelled the action!",
          icon: "error",
        });
      }
    });
  };

  const onCreateTransactionFile = async () => {
    const canCreateTransactionFile = clientTenderSheet.filter(
      (client: IBondPurchaseAllocation) =>
        client.newNominal !== 0 && client.altTreasuryBill === "No"
    );
    if (canCreateTransactionFile) {
      setClientTransactionFile(
        clientTenderSheet.filter(
          (client: IBondPurchaseAllocation) =>
            client.newNominal !== 0 && client.altTreasuryBill === "No"
        )
      );
    } else {
      swal(
        "Please ensure that you have at least one client whose new nominal value is not equal to zero"
      );
    }
  };

  const loadSavedData = () => {
    const data: any[] = [];
    const dataTransactionFile: any[] = [];

    saved.forEach((element) => {
      const newItem = {
        id: element.asJson.id,
        clientId: element.asJson.id,
        maturingNominal: element.asJson.maturingNominal,
        clientName: element.asJson.clientName,
        moneyMarketAccountNumber: element.asJson.moneyMarketAccountNumber,
        moneyMarketBalance: element.asJson.moneyMarketBalance,
        availableBalance: element.asJson.availableBalance,
        netBalance: element.asJson.netBalance,
        newNominal: element.asJson.newNominal,
        altTreasuryBill: element.asJson.altTreasuryBill,
        tenderRate: element.asJson.tenderRate,
        margin: element.asJson.margin,
        clientRate: element.asJson.clientRate,
        counterParty: element.asJson.counterParty,
        considerationBON: element.asJson.considerationBON,
        considerationClient: element.asJson.considerationClient,
        profit: element.asJson.profit,
        notes: element.asJson.notes,
        contactPerson: element.asJson.contactPerson,
        confirmation: element.asJson.confirmation,
      };

      data.push(newItem);
    });

    setClientTenderSheet(data);

    savedTransactionFile.forEach((element) => {
      const newItem = {
        id: element.asJson.id,
        clientId: element.asJson.id,
        clientName: element.asJson.clientName,
        moneyMarketAccountNumber: element.asJson.moneyMarketAccountNumber,
        moneyMarketBalance: element.asJson.moneyMarketBalance,
        availableBalance: element.asJson.availableBalance,
        netBalance: element.asJson.netBalance,
        newNominal: element.asJson.newNominal,
        altTreasuryBill: element.asJson.altTreasuryBill,
        tenderRate: element.asJson.tenderRate,
        margin: element.asJson.margin,
        clientRate: element.asJson.clientRate,
        counterParty: element.asJson.counterParty,
        considerationBON: element.asJson.considerationBON,
        considerationClient: element.asJson.considerationClient,
        profit: element.asJson.profit,
        notes: element.asJson.notes,
        contactPerson: element.asJson.contactPerson,
        confirmation: element.asJson.confirmation,
      };

      dataTransactionFile.push(newItem);
    });

    setClientTransactionFile(dataTransactionFile);
  };



  useEffect(() => {
    setLoading(true);

    loadSavedData();
    setLoading(false);
  }, [saved, savedTransactionFile]);

  useEffect(() => {
    if (bonds) {
      setBond(bonds.asJson);
    } else onNavigate("/c/purchases");
  }, [onNavigate, title]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        if (purchaseId) {
          await api.instruments.bond.getById(purchaseId);
          await api.purchase.bond.getById(purchaseId);
          await api.purchase.bond.getAllNewTenderSheet(purchaseId);
          await api.purchase.bond.getAllPurchaseTransactionClients(
            purchaseId
          );
          await api.purchase.bond.getAllPurchaseHoldings(purchaseId);
        }
        await api.instruments.bond.getAll();
        setLoading(false);
      } catch (error) { }
    };
    loadData();
  }, [
    api.instruments.bond,
    api.purchase.bond,
    purchaseId,
  ]);

  return (
    <div className="purchases-view-page uk-section uk-section-small">
      <div className="uk-container uk-container-expand">
        <button className="btn btn-danger" onClick={onHandleBack}>
          <FontAwesomeIcon
            className="uk-margin-small-right"
            icon={faArrowLeftLong}
          />
          Back to instrument list
        </button>
        {!loading && (
          <ErrorBoundary>
            <div className="page-main-card uk-card uk-padding-small uk-margin">
              <div className="uk-grid" data-uk-grid>
                <div className="uk-width-1-3">
                  <table className="kit-table uk-table uk-table-divider purhase-page-form">
                    <thead>
                      <tr>
                        <th className="uk-text-bold">Instrument(Maturing)</th>
                        <th>{bond.instrumentName}</th>
                      </tr>
                      <tr>
                        <th className="uk-text-bold">Settlement Date</th>
                        <th>{dateFormat(bond.nextCouponDate)}</th>
                      </tr>
                      <tr>
                        <th className="uk-text-bold">Maturity Date</th>
                        <th>{dateFormat(bond.maturityDate)}</th>
                      </tr>
                      <tr>
                        <th className="uk-text-bold">New Instrument</th>
                        <th>{formatDate(bond.instrumentName)}</th>
                      </tr>
                      <tr>
                        <th className="uk-text-bold">DTM</th>
                        <th>{bond.nextCouponDate}</th>
                      </tr>
                    </thead>
                  </table>
                </div>
                <div className="uk-width-expand">
                  <h4>Dealing Desk - Tender Sheet</h4>
                  <table className="kit-table uk-table uk-table-divider purhase-page-form desk-dealing">
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
                        <td colSpan={2}></td>
                        <td>
                          {(totalsOnClientSheet.clientNominal)}
                        </td>
                        <td>
                          {(totalsOnClientSheet.considerationBON)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={3}></td>
                        <td>
                          {clientTransactionFile.length === 0 && (
                            <button
                              className="btn btn-primary"
                              onClick={onSubmitForTender}
                              disabled={bond.instrumentStatus === "tendered"}>
                              Submit for Tender
                            </button>
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
            {clientTransactionFile.length === 0 && (
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
                                              key as keyof IBondPurchaseAllocation
                                              ]
                                            }
                                            onChange={
                                              handleColumnVisibilityChange
                                            }
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
                        <div className="table-container uk-height-medium">
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
                                    //methods
                                    onItemChange={onItemChange}
                                    onItemRemove={onItemRemove}
                                    onNumberChange={onNumberChange}
                                    onNumberOldChange={onNumberOldChange}
                                    onClientChange={onClientChange}
                                    handleColumnVisibilityChange={
                                      handleColumnVisibilityChange
                                    }
                                    //properties
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
                                    considerationClient={
                                      item.considerationClient
                                    }
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
                                      Number(
                                        totalsOnClientSheet.considerationBON
                                      )
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
                                className="btn btn-text"
                                type="button"
                                onClick={onUpdate}
                                disabled={
                                  clientTenderSheet.filter(
                                    (client) => client.clientName === ""
                                  ).length > 0 &&
                                  Number(totalsOnClientSheet.clientNominal) ===
                                  0
                                }>
                                Save
                              </button>
                              <br />
                              <button
                                className="btn btn-primary uk-margin-small-top"
                                type="button"
                                onClick={onCreateTransactionFile}
                                disabled={bond.instrumentStatus !== "tendered"}>
                                Create Transaction File
                              </button>
                              <br />
                              <button
                                className="btn btn-primary uk-margin-small-top"
                                type="button"
                                onClick={onSubmitForExecution}
                                disabled={bond.instrumentStatus !== "tendered"}>
                                Submit for Execution
                              </button>
                            </div>
                          )}
                          {clientTenderSheet.length === 0 && (
                            <div className="uk-text-right">
                              <button
                                className="btn btn-primary"
                                type="button"
                                onClick={onCreateTransactionFile}
                                disabled={true}>
                                Create Transaction File
                              </button>
                              <br />
                              <button
                                className="btn btn-primary uk-margin-small-top"
                                type="button"
                                onClick={onAddItem}
                                disabled={true}>
                                Submit for Execution
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CustomOpenAccordion>
            )}

            {clientTransactionFile.length !== 0 && (
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
                                              key as keyof IBondPurchaseAllocation
                                              ]
                                            }
                                            onChange={
                                              handleColumnVisibilityChange
                                            }
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
                        <div className="table-container uk-height-medium">
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
                                  <BondTenderSheetItemDisabled
                                    index={index}
                                    //methods
                                    onItemChange={onItemChange}
                                    onItemRemove={onItemRemove}
                                    onNumberChange={onNumberChange}
                                    onNumberOldChange={onNumberOldChange}
                                    onClientChange={onClientChange}
                                    handleColumnVisibilityChange={
                                      handleColumnVisibilityChange
                                    }
                                    //properties
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
                                    considerationClient={
                                      item.considerationClient
                                    }
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
                                      Number(
                                        totalsOnClientSheet.considerationBON
                                      )
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
                      </div>
                    </div>
                  </div>
                </div>
              </CustomOpenAccordion>
            )}
            {clientTransactionFile.length !== 0 && (
              <CustomOpenAccordion title={"Clients - Transaction Sheet"}>
                <div className="page-main-card uk-card uk-card-default uk-padding-small">
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
                                  value={searchTransactionQuery}
                                  onChange={handleSearchTransactionChange}
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
                                  {Object.keys(columnTransactionVisibility)
                                    .slice(3, 20)
                                    .map((key) => (
                                      <li key={key}>
                                        <label>
                                          <input
                                            className="uk-input-small uk-checkbox uk-margin-small-right"
                                            type="checkbox"
                                            checked={
                                              !columnTransactionVisibility[
                                              key as keyof IBondPurchaseTransaction
                                              ]
                                            }
                                            onChange={
                                              handleTransactionColumnVisibilityChange
                                            }
                                            value={key}
                                          />
                                          {
                                            TreasuryBillColumnNames[
                                            key as keyof IBondPurchaseTransaction
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
                        <div className="table-container uk-height-medium">
                          <table className="kit-table uk-table uk-table-small uk-table-middle uk-table-responsive purchase-page-table">
                            <colgroup>
                              <col style={{ width: "200px" }} />{" "}
                              {/* Set the width of the first column */}
                            </colgroup>
                            <thead className="header">
                              <tr>
                                {Object.keys(columnTransactionVisibility)
                                  .slice(2, 22)
                                  .map(
                                    (key) =>
                                      columnTransactionVisibility[
                                      key as keyof IBondPurchaseTransaction
                                      ] && (
                                        <th
                                          key={key}
                                          onClick={() =>
                                            handleTransactionSort(
                                              key as keyof IBondPurchaseTransaction
                                            )
                                          }>
                                          {
                                            TreasuryBillColumnNames[
                                            key as keyof IBondPurchaseTransaction
                                            ]
                                          }{" "}
                                          {getTransactionSortIndicator(
                                            key as keyof IBondPurchaseTransaction
                                          )}
                                        </th>
                                      )
                                  )}
                              </tr>
                            </thead>
                            <tbody>
                              {filteredTransactionData.map((item, index) => (
                                <Fragment key={index}>
                                  <BondTransactionFileItem
                                    index={index}
                                    //methods
                                    onItemChange={onTransactionFileItemChange}
                                    onItemRemoveFromTransactionFile={
                                      onItemRemoveFromTransactionFile
                                    }
                                    onNumberChange={
                                      onTransactionFileNumberChange
                                    }
                                    onNumberOldChange={
                                      onTransactionFileNumberOldChange
                                    }
                                    onClientChange={
                                      onTransactionFileClientChange
                                    }
                                    handleColumnVisibilityChange={
                                      handleColumnVisibilityChange
                                    }
                                    //properties
                                    clientName={item.clientName}
                                    clientId={item.clientId}
                                    moneyMarketAccountNumber={
                                      item.moneyMarketAccountNumber
                                    }
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
                                    considerationClient={
                                      item.considerationClient
                                    }
                                    profit={item.profit}
                                    notes={item.notes}
                                    contactPerson={item.contactPerson}
                                    confirmation={item.confirmation}
                                    document={item.document}
                                    dtm={daysToMaturity}
                                    BondColumnNames={
                                      BondColumnNames
                                    }
                                    columnVisibility={
                                      columnTransactionVisibility
                                    }
                                  />
                                </Fragment>
                              ))}
                            </tbody>
                            {filteredTransactionData.length !== 0 && (
                              <tfoot>
                                <tr>
                                  <td></td>
                                  <td></td>
                                  <td></td>
                                  <td></td>
                                  <td></td>
                                  <td>
                                    {(
                                      Number(
                                        totalsOnTransactionFile.clientNominal
                                      )
                                    )}
                                  </td>
                                  <td></td>
                                  <td></td>
                                  <td></td>
                                  <td></td>
                                  <td></td>
                                  <td>
                                    {(
                                      Number(
                                        totalsOnTransactionFile.considerationBON
                                      )
                                    )}
                                  </td>
                                  <td>
                                    {(
                                      Number(
                                        totalsOnTransactionFile.considerationClient
                                      )
                                    )}
                                  </td>
                                  <td>
                                    {(
                                      Number(totalsOnTransactionFile.profit)
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
                              onClick={onAddItemToTransactionFile}>
                              <span data-uk-icon="icon: plus-circle; ratio:.8"></span>{" "}
                              Client
                            </button>
                          </div>
                          {clientTransactionFile.length !== 0 && (
                            <div className="uk-text-right">
                              {savedTransactionFile.length !== 0 && (
                                <button
                                  className="btn btn-text uk-margin-small-top"
                                  type="button"
                                  onClick={onUpdateTransactionFile}>
                                  Update
                                </button>
                              )}
                              {savedTransactionFile.length === 0 && (
                                <button
                                  className="btn btn-text uk-margin-small-top"
                                  type="button"
                                  onClick={onSaveTransactionFile}>
                                  Save
                                </button>
                              )}
                              <button
                                className="btn btn-primary uk-margin-small-top"
                                type="button"
                                onClick={onSubmitTransactionFileForExecution}>
                                Submit for Execution
                              </button>
                            </div>
                          )}
                          {clientTransactionFile.length === 0 && (
                            <div className="uk-text-right">
                              <button
                                className="btn btn-primary uk-margin-small-top"
                                type="button"
                                disabled={true}>
                                Submit for Execution
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CustomOpenAccordion>
            )}
          </ErrorBoundary>
        )}
        {loading && <LoadingEllipsis />}
      </div>
    </div>
  );
});

export default BondPurchaseSubmitted;
