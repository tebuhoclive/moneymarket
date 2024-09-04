import { useEffect, useState } from "react";
import { useAppContext } from "../../../../../shared/functions/Context";
import { LoadingEllipsis } from "../../../../../shared/components/loading/Loading";

import "./AssetManagerFlows.scss";
import Toolbar from "../../../shared/components/toolbar/Toolbar";


const AssetManagerFlows = () => {
  const { api, store } = useAppContext();
  const [loading, setLoading] = useState(false);

  // Get the current date and time as a timestamp (in milliseconds)
  const currentTimeStamp = Date.now();

  // Get the start of the current day (midnight) as a timestamp
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startOfDayTimeStamp = startOfDay.getTime();

  // Get the end of the current day (11:59:59.999 PM) as a timestamp
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  const endOfDayTimeStamp = endOfDay.getTime();

  const individual = store.assetManager.liability.all.filter(
    (today) =>
      today.asJson.flowDate >= startOfDayTimeStamp &&
      currentTimeStamp <= endOfDayTimeStamp &&
      today.asJson.productId === "oU2sIjtXHAJnslqFqw8Y"
  );
  const corporate = store.assetManager.liability.all.filter(
    (today) =>
      today.asJson.flowDate >= startOfDayTimeStamp &&
      currentTimeStamp <= endOfDayTimeStamp &&
      today.asJson.productId === "1AxqDiOAwMf0WPKjMib8"
  );
  const taxFree = store.assetManager.liability.all.filter(
    (today) =>
      today.asJson.flowDate >= startOfDayTimeStamp &&
      currentTimeStamp <= endOfDayTimeStamp &&
      today.asJson.productId === "lLgaoiwKyYlJPfnCE0nD"
  );

  const ijgMoneyMarketFund = store.assetManager.asset.all.filter(
    (today) =>
      today.asJson.flowDate >= startOfDayTimeStamp &&
      currentTimeStamp <= endOfDayTimeStamp &&
      (today.asJson.toFromAccount === "IJG Income Provider Fund – B3" ||
        today.asJson.toFromAccount === "IJG Income Provider Fund – A2")
  );

  const ijgIncomeProviderFund = store.assetManager.asset.all.filter(
    (today) =>
      today.asJson.flowDate >= startOfDayTimeStamp &&
      currentTimeStamp <= endOfDayTimeStamp &&
      today.asJson.productId === "IJG Income Provider Fund"
  );

  const ijgCorporateFund = store.assetManager.asset.all.filter(
    (today) =>
      today.asJson.flowDate >= startOfDayTimeStamp &&
      currentTimeStamp <= endOfDayTimeStamp &&
      today.asJson.productId === "IJG Corporate Fund"
  );

  const ijgIncomeProviderFundNominees = store.assetManager.asset.all.filter(
    (today) =>
      today.asJson.flowDate >= startOfDayTimeStamp &&
      currentTimeStamp <= endOfDayTimeStamp &&
      today.asJson.productId === "IJG Income Provider Fund (Nominees)"
  );

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await api.assetManager.asset.getAll();
        await api.assetManager.liability.getAll();
      } catch (error) {}
      setLoading(false);
    };
    loadData();
  }, [api.assetManager.asset, api.assetManager.liability]);

  return (
    <div className="page uk-section uk-section-small">
      <div className="uk-container uk-container-expand">
        <div className="sticky-top">
          <Toolbar title="Daily Asset Manager Flows" />
          <hr />
        </div>
        {/** Data table to display the day*/}

        <div className="uk-grid uk-grid-small">
          <div className="uk-width-expand">
            <div className="page-main-card uk-card uk-card-default uk-card-body">
              {/* <DaysDataTable /> */}
              {!loading && (
                <table className="uk-table uk-table-small uk-table-divider table-kit">
                  <thead>
                    <tr>
                      <th>Client (Liabilities)</th>
                      <th>Opening Bank Balance</th>
                      <th>Net Flows</th>
                      <th>Deposit Amount</th>
                      <th>Withdrawal Amount</th>
                      <th>Closing Bank Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="uk-text-white">
                        IJG Individual MM Solution
                      </td>
                      <td>{(individual[0]?.asJson.netflows)}</td>
                      <td>
                        {(individual[0]?.asJson.depositAmount)}
                      </td>
                      <td>
                        {(individual[0]?.asJson.withdrawalAmount)}
                      </td>
                    </tr>
                    <tr>
                      <td>IJG Corporate MM Solution</td>
                      <td>{corporate[0]?.asJson.netflows}</td>
                      <td>{corporate[0]?.asJson.depositAmount}</td>
                      <td>{corporate[0]?.asJson.withdrawalAmount}</td>
                    </tr>
                    <tr>
                      <td>IJG Tax Free MM Solution</td>
                      <td>{taxFree[0]?.asJson.netflows}</td>
                      <td>{taxFree[0]?.asJson.depositAmount}</td>
                      <td>{taxFree[0]?.asJson.withdrawalAmount}</td>
                    </tr>
                  </tbody>
                </table>
              )}
              {loading && <LoadingEllipsis />}
            </div>

            <div className="page-main-card uk-card uk-card-default uk-card-body uk-margin-top">
              {/* <DaysDataTable /> */}
              {!loading && (
                <table className="uk-table uk-table-small uk-table-divider table-kit">
                  <thead>
                    <tr>
                      <th>IJG (Assets)</th>
                      <th>Opening Units</th>
                      <th>Net Flows</th>
                      <th>Deposit Amount</th>
                      <th># of Units</th>
                      <th>Withdrawal Amount</th>
                      <th># of Units</th>
                      <th>Closing Units</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>IJG Money Market Fund</td>
                      <td>
                        {(ijgMoneyMarketFund[0]?.asJson.netflows)}
                      </td>
                      <td>
                        {(
                          ijgMoneyMarketFund[0]?.asJson.depositAmount
                        )}
                      </td>
                      <td>
                        {(
                          ijgMoneyMarketFund[0]?.asJson.numberOfDepositUnits
                        )}
                      </td>
                      <td>
                        {(
                          ijgMoneyMarketFund[0]?.asJson.withdrawalAmount
                        )}
                      </td>
                      <td>
                        {(
                          ijgMoneyMarketFund[0]?.asJson.numberOfWithdrawalUnits
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>IJG Income Provider Fund</td>
                      <td>{ijgIncomeProviderFund[0]?.asJson.netflows}</td>
                      <td>{ijgIncomeProviderFund[0]?.asJson.depositAmount}</td>
                      <td>
                        {ijgIncomeProviderFund[0]?.asJson.numberOfDepositUnits}
                      </td>
                      <td>
                        {ijgIncomeProviderFund[0]?.asJson.withdrawalAmount}
                      </td>
                      <td>
                        {
                          ijgIncomeProviderFund[0]?.asJson
                            .numberOfWithdrawalUnits
                        }
                      </td>
                    </tr>
                    <tr>
                      <td>IJG Corporate Fund</td>
                      <td>{ijgCorporateFund[0]?.asJson.netflows}</td>
                      <td>{ijgCorporateFund[0]?.asJson.depositAmount}</td>
                      <td>
                        {ijgCorporateFund[0]?.asJson.numberOfDepositUnits}
                      </td>
                      <td>{ijgCorporateFund[0]?.asJson.withdrawalAmount}</td>
                      <td>
                        {ijgCorporateFund[0]?.asJson.numberOfWithdrawalUnits}
                      </td>
                    </tr>
                    <tr>
                      <td>IJG Income Provider Fund (Nominees)</td>
                      <td>
                        {ijgIncomeProviderFundNominees[0]?.asJson.netflows}
                      </td>
                      <td>
                        {ijgIncomeProviderFundNominees[0]?.asJson.depositAmount}
                      </td>
                      <td>
                        {
                          ijgIncomeProviderFundNominees[0]?.asJson
                            .numberOfDepositUnits
                        }
                      </td>
                      <td>
                        {
                          ijgIncomeProviderFundNominees[0]?.asJson
                            .withdrawalAmount
                        }
                      </td>
                      <td>
                        {
                          ijgIncomeProviderFundNominees[0]?.asJson
                            .numberOfWithdrawalUnits
                        }
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
              {loading && <LoadingEllipsis />}
            </div>
          </div>
          <div className="uk-width-1-4">
            <div className="uk-grid uk-grid-small" data-uk-grid>
              <div className="uk-width-1-1">
                <div className="page-main-card uk-card uk-card-default uk-card-body">
                  <h4 className="main-title-sm">
                    Previous Day (Liabilities)
                  </h4>
                  <table className="uk-table uk-table-small uk-table-divider table-kit">
                    <thead>
                      <tr>
                        <th>Client (Liabilities)</th>
                        <th>NET FLOW</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="uk-text-white">
                          IJG Individual MM Solution
                        </td>
                        <td>{(individual[0]?.asJson.netflows)}</td>
                      </tr>
                      <tr>
                        <td>IJG Corporate MM Solution</td>
                        <td>{corporate[0]?.asJson.netflows}</td>
                      </tr>
                      <tr>
                        <td>IJG Tax Free MM Solution</td>
                        <td>{taxFree[0]?.asJson.netflows}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="uk-grid uk-grid-small" data-uk-grid>
              <div className="uk-width-1-1">
                <div className="page-main-card uk-card uk-card-default uk-card-body">
                  <h4 className="main-title-sm">Previous Day (Assets)</h4>
                  <table className="uk-table uk-table-small uk-table-divider table-kit">
                    <thead>
                      <tr>
                        <th>IJG (Assets)</th>
                        <th>Price/Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>IJG Money Market Fund</td>
                        <td>
                          {(ijgMoneyMarketFund[0]?.asJson.netflows)}
                        </td>
                      </tr>
                      <tr>
                        <td>IJG Income Provider Fund</td>
                        <td>{ijgIncomeProviderFund[0]?.asJson.netflows}</td>
                      </tr>
                      <tr>
                        <td>IJG Corporate Fund</td>
                        <td>{ijgCorporateFund[0]?.asJson.netflows}</td>
                      </tr>
                      <tr>
                        <td>IJG Income Provider Fund (Nominees)</td>
                        <td>
                          {ijgIncomeProviderFundNominees[0]?.asJson.netflows}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetManagerFlows;
