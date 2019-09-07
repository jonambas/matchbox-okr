import React from 'react';
import Button from '../button';
import Graph from '../Graph';

import tokens from '../../raw-data/token-count-js-now.json';

function TokenizableCss(props) {
  const [show, setShow] = React.useState(false);

  return (
    <>
      <h1>Hard Coded JS Colors</h1>

      <Graph xKey='js' />

      <div style={{ textAlign: 'center' }}>
        <div>Total: {tokens.data.length}</div>
        <div>Date: {tokens.date}</div>
        <Button
          onClick={() => setShow(!show)}>
          {show ? 'Hide JS' : 'Show JS'}
        </Button>
      </div>

      {show && (
        <table>
          <thead>
            <tr>
              <th>File</th>
              <th>JS</th>
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
      )}
    </>
  )
}

export default TokenizableCss;
