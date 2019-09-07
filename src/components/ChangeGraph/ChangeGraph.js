import React from 'react';
import { Bar } from '@vx/shape';
import { Group } from '@vx/group';
import { scaleBand, scaleLinear } from '@vx/scale';
import Button from "../button"
import _ from 'lodash';
import moment from 'moment';

import getData from './data'

const USE_WEEK = true;

function ChangeGraph(props) {
  const [selected, setSelected] = React.useState({});
  const [view, setView] = React.useState('insertions');
  const [show, setShow] = React.useState(false);

  const SET = getData();

  const x = (d) => d.week;
  const y = (d) => {
    return view === 'delta' ? d.insertions - d.deletions : d[view];
  }

  const width = 1000;
  const height = 400;

  const xMax = width;
  const yMax = height - 90;
  const yMin = 0;

  // scales
  const xScale = scaleBand({
    rangeRound: [0, xMax],
    domain: SET.map(x),
    padding: 0.2,
  });
  const yScale = scaleLinear({
    rangeRound: [yMax, yMin],
    domain: [0, view === 'delta' ? Math.max(...SET.map(y)) * 2 : Math.max(...SET.map(y))]
  });

  return (
    <>
      <h1>UI CSS Changes</h1>

      <div style={{ margin: '0 14px', display: 'flex' }}>
        <Button onClick={() => setView('insertions')}>+</Button>
        <Button onClick={() => setView('deletions')}>–</Button>
        <Button onClick={() => setView('delta')}>Δ</Button>
      </div>

      <svg width={width} height={height}>
        <Group top={40}>
          {SET.map((d, i) => {
            const letter = x(d);
            const barWidth = xScale.bandwidth();
            const barHeight = yMax - yScale(y(d));

            const barX = xScale(letter);
            let barY = yMax - barHeight;

            if (view === 'delta' && barHeight < 0) {
              barY = (yMax - barHeight) / 2 + (barHeight / 2)
            }

            if (view === 'delta' && barHeight > 0) {
              barY = (yMax - barHeight) / 2 - (barHeight / 2)
            }

            return (
              <Group key={`fbar-${letter}`}>
                <rect
                  x={barX}
                  y={yMax - height}
                  width={barWidth}
                  height={height}
                  fill={moment(d.date).isBefore('2018-5-20') ? "rgba(235, 225, 225, 1)" : "rgba(235, 235, 245, 1)"}
                  onClick={event => {
                    setSelected(d)
                  }}
                  style={{
                    cursor: 'pointer'
                  }}/>
                <Bar
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={Math.abs(barHeight)}
                  fill="rgba(90, 90, 250, 1)"
                  style={{ pointerEvents: 'none' }}
                />
              </Group>
            );
          })}
        </Group>
        <Group left={20} top={yMax + 60}>
          <rect fill="rgba(235, 225, 225, 1)"  width={10} height={12}/>
          <text dx={20} dy={12}>Beta</text>
          <rect x={80} fill="rgba(235, 235, 245, 1)"  width={10} height={12}/>
          <text dx={100} dy={12}>Public</text>
        </Group>
      </svg>

      <div style={{
        position: 'relative',
        textAlign: 'right',
        top: '-45px',
        right: '10px'
      }}>
        <Button
          onClick={() => setShow(!show)}>
          {show ? 'Hide Details' : 'Show Details'}
        </Button>
      </div>

      {show && (
        <div>
          <div>Week: {selected.date}</div>
          <div>Insertions: {selected.insertions}</div>
          <div>Deletions: {selected.deletions}</div>
          <div style={{ display: 'flex' }}>
            <ul>Files: {selected.files ? selected.files.map((file = '', i) => {
              return (
                <li key={`${selected.week}-${file}-${i}`}>{file.replace('src/', '')}</li>
              )
            }) : null}</ul>
            <ul>Commits: {selected.commits ? selected.commits.map((commit = '', i) => {
              return (
                <li key={`${selected.week}-${commit}-${i}`}>{commit}</li>
              )
            }) : null}</ul>
          </div>
        </div>
      )}
    </>
  );
}

export default ChangeGraph;
