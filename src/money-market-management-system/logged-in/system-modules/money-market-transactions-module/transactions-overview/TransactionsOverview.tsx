import React from "react";
import "./Overview.scss";

import { Grid } from "@mui/material";
import DepositBarChart from "./graphs/deposits/DepositGraph";
import WithdrawalBarChart from "./graphs/withdrawals/WithdrawalGraph";
import RecurringBarChart from "./graphs/recurring/RecurringGraph";
import { OvertimeGraph } from "./graphs/overtime-graph/OvertimeGraph";
import TransactionChart from "./graphs/stats-graph/StatsGraph";
import Toolbar from "../../../shared/components/toolbar/Toolbar";

export const TransactionsOverview = () => {
  return (
    <div className="page uk-section uk-section-small overview">
      <div className="uk-container uk-container-expand">
        <div className="sticky-top">
          <Toolbar title="Transactions Overview" rightControls={<></>} />
          <hr />
        </div>
        <div
          className="uk-child-width-1-3@m uk-grid-small uk-grid-match"
          data-uk-grid
        >
          <div>
            <div className="page-main-card uk-card uk-card-default uk-card-body">
              <h3 className="uk-card-title">Total Deposits</h3>
              <h3 className="value">22</h3>
            </div>
          </div>
          <div>
            <div className="page-main-card uk-card uk-card-default uk-card-body">
              <h3 className="uk-card-title">Total Withdrawals</h3>
              <h3 className="value">22</h3>
            </div>
          </div>
          <div>
            <div className="page-main-card uk-card uk-card-default uk-card-body">
              <h3 className="uk-card-title">Total Recurring Withdrawals</h3>
              <h3 className="value">22</h3>
            </div>
          </div>
        </div>
        <div className="graphs">
          <div className="page-main-card uk-card uk-card-default uk-card-body">
            <div>
              <OvertimeGraph />
            </div>
            <div className="donut-container">
              <Grid container spacing={2}>
                <Grid
                  className="donut-grid"
                  xs={12}
                  sm={12}
                  md={4}
                  lg={4}
                  xl={4}
                >
                  <h5 className="donut-title">DEPOSITS</h5>
                  <DepositBarChart />
                  {/* </div> */}
                </Grid>
                <Grid
                  className="donut-grid"
                  xs={12}
                  sm={12}
                  md={4}
                  lg={4}
                  xl={4}
                >
                  <h5 className="donut-title">WITHDRAWALS</h5>
                  <WithdrawalBarChart />
                  {/* </div> */}
                </Grid>
                <Grid
                  className="donut-grid"
                  xs={12}
                  sm={12}
                  md={4}
                  lg={4}
                  xl={4}
                >
                  <h5 className="donut-title">RECURRING WITHDRAWALS</h5>
                  <RecurringBarChart />
                </Grid>
              </Grid>
            </div>
            {/* <TransactionChart /> */}
          </div>
        </div>
      </div>
    </div>
  );
};
