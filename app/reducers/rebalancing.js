import { combineReducers } from 'redux';
import * as types from '../types';
import { getValuesForInvesting, getValuesForDisvesting, getValueAdjustmentsPerSecurity, getUnitsForInvesting, getUnitsForDisvesting, getUnitsForAdjusting, getUpdatedValuePerSecurity, getPartialUnits } from '../algorithms/PortfolioAlgorithms';

const rebalancingSteps = (state = {},
  action
) => {
  switch (action.type) {
    case types.GENERATE_STEPS: {
      let portfolio = [];
      let investmentAmount = 0;
      let valueAdjustmentsPerSecurity = [];
      let valueAdditionPerSecurity = [];
      let valueReductionPerSecurity = [];
      let balanceByAdjusting = [];
      let balanceByInvesting = [];
      let balanceByDisvesting = [];
      let balanceByAdjustingPartial = [];
      let balanceByInvestingPartial = [];
      let balanceByDisvestingPartial = [];
      let cashStillMissing = 0;
      let extraCash = 0;
      /* Compute portfolio statistics */
      if (action.portfolio.length > 0) {
        portfolio = action.portfolio;
        investmentAmount = action.investmentAmount;
        let equityFromPortfolio = 0;
        for (const security of portfolio) {
          equityFromPortfolio += security.price * security.units;
        }
        const totalEquity = Number((investmentAmount + equityFromPortfolio)).toFixed(4);
        let valuePerSecurityCurrent = [];
        for (const security of portfolio) {
          valuePerSecurityCurrent.push(security.price * security.units);
        }
        const valuePerSecurityTotal = [];
        for (const security of portfolio) {
          const allocationPercentage = security.allocation / 100;
          valuePerSecurityTotal.push(Number((allocationPercentage * totalEquity).toFixed(4)));
        }
        /* Compute balancing steps */
        if (totalEquity < 0) {
          const negativeInvestmentAmount = -1 * investmentAmount;
          cashStillMissing = negativeInvestmentAmount - equityFromPortfolio;
        } else if (investmentAmount === 0) {
          valueAdjustmentsPerSecurity = getValueAdjustmentsPerSecurity(valuePerSecurityCurrent, valuePerSecurityTotal);
          const balanceByAdjustingAndExtraCash = getUnitsForAdjusting(valueAdjustmentsPerSecurity, portfolio, 0);
          balanceByAdjusting = balanceByAdjustingAndExtraCash.unitsAdjustmentsPerSecurity;
          balanceByAdjustingPartial = getPartialUnits(valueAdjustmentsPerSecurity, portfolio);
        } else if (investmentAmount > 0) {
          valueAdditionPerSecurity = getValuesForInvesting(investmentAmount, valuePerSecurityCurrent, valuePerSecurityTotal);
          const balanceByInvestingAndExtraCash = getUnitsForInvesting(valueAdditionPerSecurity, portfolio, investmentAmount);
          balanceByInvesting = balanceByInvestingAndExtraCash.unitsAdditionPerSecurity;
          extraCash = balanceByInvestingAndExtraCash.extraCash;
          balanceByInvestingPartial = getPartialUnits(valueAdditionPerSecurity, portfolio);

          valuePerSecurityCurrent = getUpdatedValuePerSecurity(valuePerSecurityCurrent, balanceByInvesting, portfolio);
          valueAdjustmentsPerSecurity = getValueAdjustmentsPerSecurity(valuePerSecurityCurrent, valuePerSecurityTotal);
          const balanceByAdjustingAndExtraCash = getUnitsForAdjusting(valueAdjustmentsPerSecurity, portfolio, extraCash);
          balanceByAdjusting = balanceByAdjustingAndExtraCash.unitsAdjustmentsPerSecurity;
          balanceByAdjustingPartial = getPartialUnits(valueAdjustmentsPerSecurity, portfolio);
        } else if (investmentAmount < 0) {
          valueReductionPerSecurity = getValuesForDisvesting(investmentAmount, valuePerSecurityCurrent, valuePerSecurityTotal);
          const balanceByDisvestingAndExtraCash = getUnitsForDisvesting(valueReductionPerSecurity, portfolio, investmentAmount);
          balanceByDisvesting = balanceByDisvestingAndExtraCash.unitsReductionPerSecurity;
          extraCash = balanceByDisvestingAndExtraCash.extraCash;
          balanceByDisvestingPartial = getPartialUnits(valueReductionPerSecurity, portfolio);

          valuePerSecurityCurrent = getUpdatedValuePerSecurity(valuePerSecurityCurrent, balanceByDisvesting, portfolio);
          valueAdjustmentsPerSecurity = getValueAdjustmentsPerSecurity(valuePerSecurityCurrent, valuePerSecurityTotal);
          const balanceByAdjustingAndExtraCash = getUnitsForAdjusting(valueAdjustmentsPerSecurity, portfolio, extraCash);
          balanceByAdjusting = balanceByAdjustingAndExtraCash.unitsAdjustmentsPerSecurity;
          balanceByAdjustingPartial = getPartialUnits(valueAdjustmentsPerSecurity, portfolio);
        }
      }
      return {
        portfolio,
        cashStillMissing,
        balanceByInvesting,
        balanceByDisvesting,
        balanceByAdjusting,
        balanceByInvestingPartial,
        balanceByDisvestingPartial,
        balanceByAdjustingPartial,
        valueAdditionPerSecurity,
        valueReductionPerSecurity,
        valueAdjustmentsPerSecurity,
      };
    }
    case types.SELECT_MODEL_PORTFOLIO:
    case types.CREATE_NEW_PORTFOLIO:
      return {};
    default:
      return state;
  }
};

const showWholeUnits = (state = true,
  action
) => {
  switch (action.type) {
    case types.CHANGE_SHOW_WHOLE_UNITS:
      return !state;
    default:
      return state;
  }
};

const showPartialUnits = (state = false,
  action
) => {
  switch (action.type) {
    case types.CHANGE_SHOW_PARTIAL_UNITS:
      return !state;
    default:
      return state;
  }
};

const showCashAmounts = (state = false,
  action
) => {
  switch (action.type) {
    case types.CHANGE_SHOW_CASH_AMOUNTS:
      return !state;
    default:
      return state;
  }
};

const rebalancingReducer = combineReducers({
  rebalancingSteps,
  showWholeUnits,
  showPartialUnits,
  showCashAmounts
});

export default rebalancingReducer;
