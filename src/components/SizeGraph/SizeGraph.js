import React from 'react';
import Button from '../button';
import Graph from './Graph';

import size from '../../raw-data/size.json';

function SizeGraph(props) {
  const [show, setShow] = React.useState(false);
  const last = size['2019-12-01'];
  return (
    <>
      <h1>JS & CSS Size</h1>

      <Graph />

      <div style={{ textAlign: 'center' }}>
        <div>Current Ratio: {((last.css / last.js) * 100).toFixed(2)}%</div>
        <div>JS: {last.js}</div>
        <div>CSS: {last.css}</div>
        <div>Date: 2019-12-01</div>
      </div>

      {/* {show && (
        <table>
          <thead>
            <tr>
              <th>File</th>
              <th>CSS</th>
            </tr>
          </thead>
          <tbody>
            {tokens.data.map((row, i) => {
                return (
                  <tr key={`${row.file}-${row.line}-${i}`}>
                    <td>{row.file} L{row.line}</td>
                    <td>{row.code}</td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      )} */}
    </>
  )
}

export default SizeGraph;
