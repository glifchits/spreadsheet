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

  dereferenceCell = cellID => {
    const match = cellID.match(/([A-Z]+)([0-9]+)/);
    if (match) {
      const rowID = match[1];
      const colID = match[2];
      const rowNum = rowID.charCodeAt(0) - 65;
      const colNum = parseInt(colID, 10) - 1;
      return this.state.sheet[rowNum][colNum];
    }
    return null;
  };

  evalFormula = rawFormula => {
    const matches = rawFormula.match(/([A-Z]+[0-9]+)/g) || [];
    const replacedFormula = matches.reduce((formula, cellID) => {
      let cellValue = this.dereferenceCell(cellID);
      if (cellValue[0] === "=") {
        cellValue = this.evalFormula(cellValue.slice(1)).value;
      }
      return formula.replace(cellID, cellValue);
    }, rawFormula);

    try {
      return {
        computed: true,
        value: eval(replacedFormula) // eslint-disable-line no-eval
      };
    } catch (e) {
      console.warn(e);
      return { error: true, value: e.toString() };
    }
  };

  getValue = (row, col, doEval = true) => {
    const raw = this.state.sheet[row][col];
    if (doEval && raw[0] === "=") {
      return this.evalFormula(raw.slice(1));
    } else {
      return { raw: true, value: raw };
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
              formulaError: !!cellValue.error
            })}
            type="text"
            key={`${i}-${j}`}
            value={cellValue.value}
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
