import { Suspense, useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Loading, { LoadingEllipsis } from "./shared/components/loading/Loading";
import SnackbarManager from "./shared/components/snackbar/SnackbarManager";
import { AppContext } from "./shared/functions/Context";
import PrivateRoute from "./shared/functions/PrivateRoute";
import { MainApp } from "./shared/models/App";
import { observer } from "mobx-react-lite";
import useNetwork from "./shared/hooks/useNetwork";
import ScrollToTop from "./shared/components/NavScrollTop/NavScrollTop";

import ClientAccountStatements from "./money-market-management-system/logged-in/system-modules/money-market-account-module/client-statements/ClientAccountStatements";
import DailyPricing from "./money-market-management-system/logged-in/system-modules/daily-pricing-module/DailyPricing";
import Instruments from "./money-market-management-system/logged-in/system-modules/instruments-module/Instruments";
import ViewClientMoneyMarketAccount from "./money-market-management-system/logged-in/system-modules/money-market-account-module/view-client-money-market-account/ViewClientMoneyMarketAccount";
import AssetManagerFlows from "./money-market-management-system/logged-in/system-modules/money-market-transactions-module/asset-manager-flows/AssetManagerFlows";
import MonthEndOverview from "./money-market-management-system/logged-in/system-modules/money-market-transactions-module/month-end/MonthEndOverview";
import SwitchBetweenAccounts from "./money-market-management-system/logged-in/system-modules/money-market-transactions-module/switch-between-accounts/SwitchBetweenAccounts";
import { TransactionsOverview } from "./money-market-management-system/logged-in/system-modules/money-market-transactions-module/transactions-overview/TransactionsOverview";
import LoggedIn from "./money-market-management-system/logged-in/LoggedIn";
import Products from "./money-market-management-system/logged-in/system-modules/products-module/Products";
import CloseOutDistributionReport from "./money-market-management-system/logged-in/system-modules/reports-module/transactions/CloseOutDistributionReport";
import { InstrumentPurchaseCategory } from "./money-market-management-system/logged-in/system-modules/instrument-transactions-module/purchase/InstrumentPurchaseCategory";
import LoggedOut from "./money-market-management-system/logged-out/LoggedOut";
import AdminSettings from "./money-market-management-system/logged-in/system-modules/system-settings-module/AdminSettings";
import Clients from "./money-market-management-system/logged-in/system-modules/entity-management-module/Entities";
import AgentList from "./money-market-management-system/logged-in/system-modules/agent-module/AgentList";
import { ClientOverview } from "./money-market-management-system/logged-in/system-modules/entity-management-module/dashboards/ClientOverview";
import CloseOutDistribution from "./money-market-management-system/logged-in/system-modules/close-outs-module/CloseOutDistribution";
import BondPurchase from "./money-market-management-system/logged-in/system-modules/instrument-transactions-module/purchase/bonds/BondPurchase";
import BondPurchasePage from "./money-market-management-system/logged-in/system-modules/instrument-transactions-module/purchase/bonds/BondPurchasePage";
import CallDepositPurchasePage from "./money-market-management-system/logged-in/system-modules/instrument-transactions-module/purchase/call-deposit/CallDepositPurchasePage";
import EquityPurchasePage from "./money-market-management-system/logged-in/system-modules/instrument-transactions-module/purchase/equity/EquityPurchasePage";
import TreasuryBillPurchase from "./money-market-management-system/logged-in/system-modules/instrument-transactions-module/purchase/fixed-deposit/FixedDepositPurchase";
import FixedDepositPurchasePage from "./money-market-management-system/logged-in/system-modules/instrument-transactions-module/purchase/fixed-deposit/FixedDepositPurchasePage";
import TreasuryBillPurchasePage from "./money-market-management-system/logged-in/system-modules/instrument-transactions-module/purchase/treasury-bills/TreasuryBillPurchasePage";
import UnitTrustPurchasePage from "./money-market-management-system/logged-in/system-modules/instrument-transactions-module/purchase/unit-trust/UnitTrustPurchasePage";
import BankStatementUpload from "./money-market-management-system/logged-in/system-modules/money-market-transactions-module/bank-statement-upload/BankStatementUpload";
import React from "react";
import RecurringWithdrawalOverDraftReport from "./money-market-management-system/logged-in/system-modules/reports-module/transactions/RecurringOverdraftReport";
import RecurringWithdrawalInstructionReport from "./money-market-management-system/logged-in/system-modules/reports-module/transactions/RecurringInstructionReport";
import ClientBankAccountReport from "./money-market-management-system/logged-in/system-modules/reports-module/clients/ClientBankAccountReport";
import NaturalPersonView from "./money-market-management-system/logged-in/system-modules/entity-management-module/entities/natural-person/NaturalPersonView";
import TestBackDating from "./money-market-management-system/logged-out/TestBackDating";
import DailyBalanceReportLiabilities from "./money-market-management-system/logged-in/system-modules/reports-module/transactions/DailyBalanceReportLiabilities";
import DailyBalanceReportAssets from "./money-market-management-system/logged-in/system-modules/reports-module/transactions/DailyBalanceReportAssets";
import SystemCommandCenter from "./money-market-management-system/logged-out/SystemCommandCenter";
import DailyTransactionReport from "./money-market-management-system/logged-in/system-modules/reports-module/transactions/DailyTransactionReport";
import LiabilityProducts from "./money-market-management-system/logged-in/system-modules/products-module/liabilities/LiabilityProducts";
import AssetProducts from "./money-market-management-system/logged-in/system-modules/products-module/assets/AssetProducts";
import Transactions from "./money-market-management-system/logged-in/system-modules/money-market-transactions-module/transactions-overview/transactions/Transactions";
import ClientMoneyMarketAccountReport from "./money-market-management-system/logged-in/system-modules/reports-module/clients/ClientMoneyMarketReport";
import LegalEntityView from "./money-market-management-system/logged-in/system-modules/entity-management-module/entities/legal-entity/LegalEntityView";
import CounterPartyList from "./money-market-management-system/logged-in/system-modules/system-settings-module/CounterPartyList";
import { LockPage } from "./money-market-management-system/logged-out/lock/Lock";
import { Profile } from "./money-market-management-system/logged-in/system-modules/profile-management/ProfilePage";
import { OfflinePage } from "./money-market-management-system/logged-out/offline-page/OfflinePage";
import EntityApprovals from "./money-market-management-system/logged-in/system-modules/entity-management-module/approvals/EntityApprovals";
import TreasuryBillPurchaseSubmitted from "./money-market-management-system/logged-in/system-modules/instrument-transactions-module/purchase/treasury-bills/TreasuryBillPurchaseSubmitted";
import SplitTransactionReport from "./money-market-management-system/logged-in/system-modules/reports-module/transactions/split-transactions-report/SplitTransactionReport";
import { createTheme, ThemeProvider } from "@mui/material";

const PrivateLoggedIn = () => (
  <PrivateRoute>
    <Suspense fallback={<Loading fullHeight={true} />}>
      <LoggedIn />
    </Suspense>
  </PrivateRoute>
);

const Dashboard = React.lazy(
  () =>
    import("./money-market-management-system/logged-in/system-modules/dashboard-module/Dashboard")
);
const MoneyMarketAccounts = React.lazy(
  () =>
    import("./money-market-management-system/logged-in/system-modules/money-market-account-module/MoneyMarketAccounts")
);

// Wrap your lazy-loaded components with Suspense
const LoadingFallback = () => <LoadingEllipsis />;

const MONEY_MARKET_MANAGEMENT_SYSTEM_ROUTES = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="c" element={<PrivateLoggedIn />}>
          <Route path="dashboard" element={
            <React.Suspense fallback={<LoadingFallback />}>
              <Dashboard />
            </React.Suspense>
          }
          />

          <Route path="products" element={<Products />} />
          <Route path="assets" element={<AssetProducts />} />
          <Route path="liabilities" element={<LiabilityProducts />} />
          <Route path="pricing" element={<DailyPricing />} />
          <Route path="instruments" element={<Instruments />} />
          <Route
            path="daily-transaction-report"
            element={<DailyTransactionReport />}
          />

          <Route path="daily-balance-report-assets" element={<DailyBalanceReportAssets />} />
          <Route path="daily-balance-report-liabilities" element={<DailyBalanceReportLiabilities />} />
          <Route path="daily-split-deposits" element={<SplitTransactionReport />} />

          <Route
            path="recurring-overdraft-report"
            element={<RecurringWithdrawalOverDraftReport />}
          />
          <Route
            path="recurring-instruction-report"
            element={<RecurringWithdrawalInstructionReport />}
          />
          <Route
            path="closeout-distribution-report"
            element={<CloseOutDistributionReport />}
          />

          <Route
            path="client-bank-account-report"
            element={<ClientBankAccountReport />}
          />

          <Route
            path="client-money-market-account-report"
            element={<ClientMoneyMarketAccountReport />}
          />

          <Route
            path="transactions-overview"
            element={<TransactionsOverview />}
          />
          <Route
            path="client-deposit-allocation"
            element={<BankStatementUpload />}
          />
          {/* <Route
            path="client-withdrawal-recurring-payment"
            element={
              <RecurringWithdrawal client={undefined} withdrawal={undefined} />
            }
          /> */}

          {/* <Route
            path="client-withdrawal-payment"
            element={<WithdrawalTransaction />}
          /> */}

          <Route
            path="withdrawal-switches"
            element={<Transactions />}
          />

          <Route path="switch" element={<SwitchBetweenAccounts />} />
          <Route path="month-end" element={<MonthEndOverview />} />

          {/* <Route path="purchases" element={<Purchases />} /> */}
          <Route path="purchases" element={<InstrumentPurchaseCategory />} />
          <Route
            path="purchase/instrument/Treasury Bill"
            element={<TreasuryBillPurchasePage />}
          />

          <Route
            path="purchase/instrument/Equity"
            element={<EquityPurchasePage />}
          />
          <Route
            path="purchase/instrument/Bonds"
            element={<BondPurchasePage />}
          />

          <Route
            path="purchase/instrument/Fixed Deposit"
            element={<FixedDepositPurchasePage />}
          />
          <Route
            path="purchase/instrument/Unit Trust"
            element={<UnitTrustPurchasePage />}
          />
          <Route
            path="purchase/instrument/Call Deposit"
            element={<CallDepositPurchasePage />}
          />

          <Route
            path="purchases/allocation-treasury-bill/:purchaseId"
            element={<TreasuryBillPurchase />}
          />

          <Route
            path="purchases/allocation-fixed-deposit/:purchaseId"
            element={<TreasuryBillPurchase />}
          />
          <Route
            path="purchases/allocation-bonds/:purchaseId"
            element={<BondPurchase />}
          />

          <Route
            path="purchases/submitted/:purchaseId"
            element={<TreasuryBillPurchaseSubmitted />}
          />
          <Route path="asset-manager-flows" element={<AssetManagerFlows />} />

          <Route path="counterparty" element={<CounterPartyList />} />

          <Route path="agents" element={<AgentList />} />

          <Route path="close-outs" element={<CloseOutDistribution />} />

          <Route path="client-intelligence" element={<ClientOverview />} />

          <Route path="clients" element={<Clients />} />
          <Route path="profile" element={<Profile />} />
          <Route path="client-approvals" element={<EntityApprovals />} />

          <Route
            path="client-statements"
            element={<ClientAccountStatements />}
          />
          <Route
            path="clients/natural-person/:entityId"
            element={<NaturalPersonView />}
          />
          <Route
            path="clients/legal-entity/:entityId"
            element={<LegalEntityView />}
          />

          {/* <Route path="accounts" element={<MoneyMarketAccounts />} /> */}
          <Route
            path="accounts"
            element={
              <React.Suspense fallback={<LoadingFallback />}>
                <MoneyMarketAccounts />
              </React.Suspense>
            }
          />
          <Route
            path="accounts/:accountId"
            element={<ViewClientMoneyMarketAccount />}
          />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="*" element={<Navigate to="/c" />} />
        </Route>
        <Route path="/" element={<LoggedOut />} />
        <Route path="/lock" element={<LockPage />} />
        <Route path="/command" element={<SystemCommandCenter />} />
        {/* <Route path="/testPDF" element={<StatementPDFComponent />} /> */}
        <Route path="/back-dating" element={<TestBackDating />} />
        <Route path="/*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

const theme = createTheme({
  typography: {
    fontSize: 13,
    fontWeightLight:'lighter',
    fontFamily: 'inherit'
  },
});

const MainRoutes = observer(() => {
  useNetwork();

  return <MONEY_MARKET_MANAGEMENT_SYSTEM_ROUTES />;

});

const App = observer(() => {
  const app = new MainApp();
  const { store, api, ui } = app;


  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);


  return (
    <div className="app">
      <AppContext.Provider value={{ store, api, ui }}>
        {!isOnline && (
          <div className="offline-message" style={{ background: "#051e38" }}>
            <OfflinePage />
          </div>
        )}
        {isOnline && (
          <>
            <ThemeProvider theme={theme}>
              <MainRoutes />
              <SnackbarManager />
             
            </ThemeProvider>
          </>
        )}
      </AppContext.Provider>
    </div>

  );
});

export default App;


