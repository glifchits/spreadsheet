import React from "react";
import classNames from "classnames";
import "./Spreadsheet.css";

const NUM_ROWS = 40;
const NUM_COLS = 10;

export class Spreadsheet extends React.Component {
  constructor(props) {
    super(props);
    let sheet = [];
    for (let i = 0; i <= NUM_ROWS; i += 1) {
      sheet[i] = [];
      for (let j = 0; j <= NUM_COLS; j += 1) {
        sheet[i].push("");
      }
    }
    this.state = { sheet, focused: null };
  }

  evalFormula = formula => {
    const match = formula.match(/([A-Z]+)([0-9]+)/);
    if (match) {
      const rowID = match[1];
      const colID = match[2];

      const rowNum = rowID.charCodeAt(0) - 65;
      const colNum = parseInt(colID, 10) - 1;
      const raw = this.state.sheet[rowNum][colNum];
      if (raw[0] === "=") {
        return this.evalFormula(raw.slice(1));
      }
      return raw;
    }
    return null;
  };

  getValue = (row, col, doEval = true) => {
    const raw = this.state.sheet[row][col];
    if (doEval && raw[0] === "=") {
      return this.evalFormula(raw.slice(1));
    } else {
      return raw;
    }
  };

  setValue = (row, col) => {
    return e => {
      const newState = [...this.state.sheet];
      newState[row][col] = e.target.value;
      this.setState({ sheet: newState });
    };
  };

  focusCell = (row, col) => {
    return e => this.setState({ focused: [row, col] });
  };

  render() {
    const { focused } = this.state;
    const rows = [];
    for (let i = 0; i <= NUM_ROWS; i += 1) {
      const cols = [];
      for (let j = 0; j <= NUM_COLS; j += 1) {
        const isFocused = focused && i === focused[0] && j === focused[1];
        const shouldEval = !isFocused;
        const cellValue = this.getValue(i, j, shouldEval);
        cols.push(
          <input
            className={classNames("col", {
              isFocused: isFocused,
              formulaError: shouldEval && cellValue === null
            })}
            type="text"
            key={`${i}-${j}`}
            value={cellValue || ""}
            onFocus={this.focusCell(i, j)}
            onChange={this.setValue(i, j)}
          />
        );
      }
      rows.push(
        <div className="row" key={i}>
          {cols}
        </div>
      );
    }
    return <div className="Spreadsheet">{rows}</div>;
  }
}

export default Spreadsheet;
