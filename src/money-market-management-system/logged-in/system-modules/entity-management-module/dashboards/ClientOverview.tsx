import React from "react";
import Toolbar from "../../../shared/components/toolbar/Toolbar";
import "./Overview.scss";
import { BanksGraph } from "../graphs/banks/BankGraph";
import { Fica60Days } from "../entities/fica-grids/fica-more-60-days/Fica60Days";
import { FincaWeek } from "../entities/fica-grids/fica-less-than-a-week/FincaWeek";
import { Grid } from "@mui/material";

export const ClientOverview = () => {
  return (
    <div
      className="page uk-section uk-section-small overview"
      style={{ overflow: "auto" }}
    >
      <div className="uk-container uk-container-expand">
        <Toolbar title="Clients Overview" />
        <hr />
        <div
          className="uk-child-width-1-3@m uk-grid-small uk-grid-match"
          data-uk-grid
        >
          <div>
            <div className="page-main-card uk-card uk-card-default uk-card-body">
              <h3 className="uk-card-title">Clients (Risk: LOW)</h3>
              <h3 className="value">30</h3>
            </div>
          </div>
          <div>
            <div className="page-main-card uk-card uk-card-default uk-card-body">
              <h3 className="uk-card-title">Clients (Risk: MEDIUM)</h3>
              <h3 className="value">20</h3>
            </div>
          </div>
          <div>
            <div className="page-main-card uk-card uk-card-default uk-card-body">
              <h3 className="uk-card-title">Clients (Risk: HIGH)</h3>
              <h3 className="value">14</h3>
            </div>
          </div>
        </div>
        <div className="graphs">
          <div className="page-main-card uk-card uk-card-default uk-card-body">
            <BanksGraph />
          </div>
          <hr />
          <div className="page-main-card uk-card uk-card-default uk-card-body">
            <div style={{ padding: "2rem" }}>
              <Grid container spacing={4}>
                <Grid item lg={6} xs={6}>
                  <Fica60Days data={[]} />
                </Grid>
                <Grid item lg={6} xs={6}>
                  <FincaWeek data={[]} />
                </Grid>
              </Grid>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
