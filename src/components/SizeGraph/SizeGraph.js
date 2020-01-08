import React from 'react';
import Button from '../button';
import Graph from './Graph';

import size from '../../raw-data/size.json';

function SizeGraph(props) {
  const [show, setShow] = React.useState(false);
  const [date, setDate] = React.useState('2019-12-01');
  console.log(date)
  const last = React.useMemo(() => {
    return size[date];
  }, [date]);

  return (
    <>
      <h1>JS & CSS Size</h1>

      <Graph onClick={setDate} />

      <div style={{ textAlign: 'center' }}>
        <div>Current Ratio: {((last.css / last.js) * 100).toFixed(2)}%</div>
        <div>JS: {last.js}</div>
        <div>CSS: {last.css}</div>
        <div>Date: {date}</div>
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
