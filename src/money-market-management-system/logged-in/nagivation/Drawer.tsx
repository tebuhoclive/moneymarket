import {
  faCaretDown,
  faChartLine,
  faExchange,
  faGear,
  faLock,
  faSignOutAlt,
  faThLarge,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavLink } from "react-router-dom";
import ErrorBoundary from "../../../shared/components/error-boundary/ErrorBoundary";
import { useAppContext } from "../../../shared/functions/Context";
import { getEnvironment } from "../../../shared/config/firebase-config";
import { hasFeaturePermission } from "../../../shared/functions/users-management/UserFeaturePermissionFunctions";
import { useState } from "react";
import { observer } from "mobx-react-lite";
import { ACTIVE_ENV } from "../CloudEnv";
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import EventIcon from '@mui/icons-material/Event';
import TimeDisplay from "../shared/components/display-time/TimeDisplay";

export const AccountLogo = () => {
  return (
    <div className="account-settings uk-margin-remove">
      <img src={`${process.env.PUBLIC_URL}/ijg-logo-new.png`} alt="" />
      <span className={`btn btn-primary main-title-md uk-width-1-1 uk-margin-small-bottom ${getEnvironment()?.state}`}>
        {getEnvironment()?.env}
      </span>
      <span className={`btn btn-primary main-title-md uk-width-1-1 uk-margin-small-bottom `}>
        {ACTIVE_ENV.name}
      </span>
      <hr />
    </div>
  );
};

const USER_DRAWER = observer(() => {
  const { store, api } = useAppContext();
  const me = store.auth.meJson;
  const [locking, setLocking] = useState<boolean>(false);

  const handleLock = async () => {
    try {
      setLocking(true);
      const email = me?.email || "";
      localStorage.setItem('userEmail', email);
      await api.auth.onSignedOut();

    } catch (error) {
    }
    finally {
      setLocking(false);
    }
  };


  const handleLogOut = async () => {
    try {
      setLocking(true);
      await api.auth.onSignedOut();

    } catch (error) {
    }
    finally {
      setLocking(false);
    }
  };

  return (
    <div className="drawer-list">

      {hasFeaturePermission(store, "Dashboard", "read") &&
        <ul className="main-list uk-nav-default" data-uk-nav>
          <li className="list-item">
            <NavLink to={"dashboard"} className="navlink">
              Dashboard
            </NavLink>
          </li>
        </ul>
      }

      {hasFeaturePermission(store, "Client Profile Management", "read") &&
        <ul className="main-list uk-nav-default" data-uk-nav>
          <li className="list-item uk-parent">
            <NavLink to={"clients/view"} className="navlink">
              <FontAwesomeIcon
                icon={faUsers}
                className="icon uk-margin-small-right"
              />
              Entity Management
              <FontAwesomeIcon icon={faCaretDown} className="down-arrow" />
            </NavLink>
            <ul className="uk-nav-sub">
              {/* <li>
                <NavLink to={"client-intelligence"} className="navlink">
                  <FontAwesomeIcon
                    icon={faChartLine}
                    className="icon uk-margin-small-right"
                  />
                  Client Intelligence
                </NavLink>
              </li> */}
              <li>
                <NavLink to={"clients"} className="navlink">
                  Entities Profiles
                </NavLink>
              </li>
              <li>
                <NavLink to={"client-approvals"} className="navlink">
                  Entity Approvals
                </NavLink>
              </li>
              <li>
                <NavLink to={"accounts"} className="navlink">
                  Accounts
                </NavLink>
              </li>
              <li>
                <NavLink to={"client-statements"} className="navlink">
                  Client Statements
                </NavLink>
              </li>
            </ul>
          </li>
        </ul>
      }

      <ul className="main-list uk-nav-default" data-uk-nav>
        <li className="list-item uk-parent">
          <NavLink to={"products"} className="navlink">
            <FontAwesomeIcon
              icon={faThLarge}
              className="icon uk-margin-small-right"
            />
            Products
            <FontAwesomeIcon icon={faCaretDown} className="down-arrow" />
          </NavLink>
          <ul className="uk-nav-sub">
            <li>
              <NavLink to={"assets"} className="navlink">
                Assets
              </NavLink>
            </li>
            <li>
              <NavLink to={"liabilities"} className="navlink">
                Liabilities
              </NavLink>
            </li>
          </ul>
        </li>
      </ul>

      <ul className="main-list uk-nav-default" data-uk-nav>
        {/* <li className="list-item uk-parent">
          <NavLink to={"instruments"} className="navlink">
            <AccountBalanceIcon
              style={{ fontSize: "14px" }}
              className="icon uk-margin-small-right"
            />

            Instruments
            <FontAwesomeIcon icon={faCaretDown} className="down-arrow" />
          </NavLink>
          <ul className="uk-nav-sub">
            <li className="list-item">
              <NavLink to={"instruments"} className="navlink">
                Instrument Management
              </NavLink>
            </li>
            <li className="list-item">
              <NavLink to={"instruments"} className="navlink">
                Instrument Transactions
              </NavLink>
            </li>
          </ul>
        </li> */}


        <ul className="main-list uk-nav-default" data-uk-nav>
          <li className="list-item uk-parent">
            <NavLink to={"/transactions"} className="navlink">
              <FontAwesomeIcon
                icon={faExchange}
                className="icon uk-margin-small-right"
              />
              Transactions
              <FontAwesomeIcon icon={faCaretDown} className="down-arrow" />
            </NavLink>
            <ul className="uk-nav-sub">
              {/* <li className="list-item">
                <NavLink to={"transactions-overview"} className="navlink">
                  <FontAwesomeIcon
                    icon={faCaretRight}
                    className="icon uk-margin-small-right"
                  />
                  Transactions Intelligence
                </NavLink>
              </li> */}
              <li className="list-item">
                <NavLink
                  to={"client-deposit-allocation"}
                  className="navlink">
                  Deposits
                </NavLink>
              </li>
              <li className="list-item">
                <NavLink
                  to={"withdrawal-switches"}
                  className="navlink">
                  Withdrawals
                </NavLink>
              </li>
              <li className="list-item">
                <NavLink
                  to={"switch"}
                  className="navlink">
                  Switches
                </NavLink>
              </li>
              {/* <li className="list-item">
                <NavLink to={"month-end"} className="navlink">

                  Month-End
                </NavLink>
              </li> */}
            </ul>
          </li>
        </ul>

        <li className="list-item">
          <NavLink to={"month-end"} className="navlink">
            <EventIcon
              style={{ fontSize: "14px" }}
              className="icon uk-margin-small-right"
            />
            Month-End
          </NavLink>
        </li>
        <ul className="main-list uk-nav-default" data-uk-nav>
          <li className="list-item uk-parent">
            <NavLink to={"/transactions"} className="navlink">
              <FontAwesomeIcon
                icon={faChartLine}
                className="icon uk-margin-small-right"
              />
              Reports
              <FontAwesomeIcon icon={faCaretDown} className="down-arrow" />
            </NavLink>
            <ul className="uk-nav-sub">
              <li className="list-item">
                <NavLink to={"daily-transaction-report"} className="navlink">
                  Daily Transactions
                </NavLink>
              </li>
              <li className="list-item">
                <NavLink
                  to={"client-bank-account-report"}
                  className="navlink">
                  Client Bank Accounts
                </NavLink>
              </li>

              <li className="list-item">
                <NavLink
                  to={"client-money-market-account-report"}
                  className="navlink">
                  Money Market Accounts
                </NavLink>
              </li>
              <li className="list-item">
                <NavLink
                  to={"recurring-overdraft-report"}
                  className="navlink">
                  Recurring Overdrafts
                </NavLink>
              </li>
              <li className="list-item">
                <NavLink
                  to={"recurring-instruction-report"}
                  className="navlink">
                  Recurring Instructions
                </NavLink>
              </li>
              <li className="list-item">
                <NavLink to={"daily-balance-report-assets"} className="navlink">
                  Daily Balance (Assets)
                </NavLink>
              </li>
              <li className="list-item">
                <NavLink to={"daily-balance-report-liabilities"} className="navlink">
                  Daily Balance (Liabilities)
                </NavLink>
              </li>
              <li className="list-item">
                <NavLink
                  to={"closeout-distribution-report"}
                  className="navlink">
                  Close Out Distribution
                </NavLink>
              </li>
              <li className="list-item">
                <NavLink
                  to={"daily-split-deposits"}
                  className="navlink">
                  Daily Split Deposits
                </NavLink>
              </li>
            </ul>
          </li>
        </ul>
        <li className="list-item">
          <NavLink to={"settings"} className="navlink">
            <FontAwesomeIcon
              icon={faGear}
              className="icon uk-margin-small-right"
            />
            Settings
          </NavLink>
        </li>
        <li className="list-item">
          <NavLink
            onClick={handleLock}
            to={"/lock"}
            className="navlink btn btn-secondary uk-text-center">
            <FontAwesomeIcon
              icon={faLock}
              className="icon uk-margin-small-right"
            />
            Lock
          </NavLink>
          <NavLink to={"/logout"} onClick={handleLogOut} className="navlink btn btn-danger uk-text-center">
            <FontAwesomeIcon
              icon={faSignOutAlt}
              className="icon uk-margin-small-right"
            />
            Logout
          </NavLink>
        </li>
      </ul >
      <TimeDisplay />
    </div >
  );
});

const DrawerContent = () => {
  return (
    <div className="drawer-content ">
      <div className="drawer-split-view-visible-scrollbar">
        <AccountLogo />
        <USER_DRAWER />
      </div>
    </div>
  );
};

const OverlayDrawer = () => {
  return (
    <div id="navbar-drawer" data-uk-offcanvas="overlay: true">
      <div className="uk-offcanvas-bar">
        <button
          className="uk-offcanvas-close"
          type="button"
          data-uk-close
        ></button>
        <DrawerContent />
      </div>
    </div>
  );
};

const FixedDrawer = () => {
  return (
    <div className="drawer-layout uk-visible@s">
      <DrawerContent />

    </div>
  );
};

const Drawer = () => {
  return (
    <ErrorBoundary>
      <OverlayDrawer />
      <FixedDrawer />

    </ErrorBoundary>
  );
};

export default Drawer;
