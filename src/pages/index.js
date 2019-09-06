import React from "react"
import { Bar } from '@vx/shape';
import { Group } from '@vx/group';
import { scaleBand, scaleLinear } from '@vx/scale';
import _ from 'lodash';
import moment from 'moment';
import Layout from "../components/layout"
import SEO from "../components/seo"

import data from '../raw-data/raw.json';
import tokens from '../raw-data/token-count-2019-09-06.json';
const exclude = ['2018-07-19']

export const formatInputDate = (date) => moment(date).format('YYYY-MM-DD');

const fillByDate = ({ dataSet, fill = {}, from, to } = {}) => {
  const orderedData = dataSet.sort((a, b) => new Date(a.date) - new Date(b.date));
  let filledDataSet = [];

  for (let time = moment(from), index = 0; time.isBefore(moment(to)); time.add(1, 'day')) {
    const dataEntry = orderedData[index];
    const fillData = { ...fill, date: formatInputDate(time) };
    const week = moment(fillData.date).year()+'-'+moment(fillData.date).week();

    if (!dataEntry || dataEntry.date !== fillData.date) {
      filledDataSet = [...filledDataSet, { ...fillData, week }];
    } else {
      filledDataSet = [...filledDataSet, { ...dataEntry, week}];
      index++;
    }
  }

  return filledDataSet;
};

const IndexPage = () => {
  const filtered = data.filter(({ date }) => !exclude.includes(date));

  const formatted = filtered.map((item) => {
    const changes = item.changes.reduce((acc, change) => {
      return {
        insertions: acc.insertions + change.insertions,
        deletions: acc.deletions + change.deletions,
        files: [...acc.files, change.path]
      };
    }, { insertions: 0, deletions: 0, files: [] })

    return { date: item.date, ...changes, commits: [item.commit] }
  });

  const byDay = formatted.reduce((acc, item, i, src) => {
    const dupeIdx = _.findIndex(acc, ['date', item.date])

    if (dupeIdx > -1) {
      acc.splice(dupeIdx, 1, {
        ...acc[dupeIdx],
        insertions: acc[dupeIdx].insertions + item.insertions,
        deletions: acc[dupeIdx].deletions + item.deletions,
        files: [...acc[dupeIdx].files, ...item.files],
        commits: [...acc[dupeIdx].commits, ...item.commits]
      });

      return acc;
    }

    acc.push(item);
    return acc;
  }, []);

  const min = byDay.reduce((a, b) => {
    return moment(a).isBefore(moment(b.date)) ? a : b.date;
  });

  const max = byDay.reduce((a, b) => {
    return moment(a).isAfter(moment(b.date)) ? a : b.date;
  }, moment('1990-01-01'));

  const filled = fillByDate({
      dataSet: byDay,
      fill: {
        insertions: 0,
        deletions: 0,
        files: [],
        commits: []
      },
      from: min,
      to: max
  });

  const byWeek = filled.reduce((acc, item, i, src) => {
    const dupeIdx = _.findIndex(acc, ['week', item.week])

    if (dupeIdx > -1) {
      acc.splice(dupeIdx, 1, {
        ...acc[dupeIdx],
        insertions: acc[dupeIdx].insertions + item.insertions,
        deletions: acc[dupeIdx].deletions + item.deletions,
        files: [...acc[dupeIdx].files, ...item.files],
        commits: [...acc[dupeIdx].commits, ...item.commits]
      });

      return acc;
    }

    acc.push(item);
    return acc;
  }, []);

  const [selected, setSelected] = React.useState({});
  const [view, setView] = React.useState('insertions');

  const USE_WEEK = true;
  const SET = USE_WEEK ? byWeek : filled;
  const x = (d) => USE_WEEK ? d.week : d.date;
  const y = (d) => {
    return view === 'delta' ? d.insertions - d.deletions : d[view];
  }

  const width = 1000;
  const height = 500;

  const xMax = width;
  const yMax = height - 120;
  const yMin = 0;

  // scales
  const xScale = scaleBand({
    rangeRound: [0, xMax],
    domain: filled.map(x),
    padding: 0,
  });
  const yScale = scaleLinear({
    rangeRound: [yMax, yMin],
    domain: [0, Math.max(...formatted.map(y))]
  });

  return (
    <Layout>
      <SEO title="Home" />

      <h1>UI CSS Changes</h1>

      <div style={{ marginLeft: '16px' }}>
        <button onClick={() => setView('insertions')}>+</button>
        <button onClick={() => setView('deletions')}>–</button>
        <button onClick={() => setView('delta')}>Δ</button>
      </div>

      <svg width={width} height={height}>
        <Group top={40}>
          {SET.map((d, i) => {
            const letter = x(d);
            const barWidth = 5;
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

      <h1>Tokenizables</h1>

      <div style={{ textAlign: 'center' }}>
        <div>Tokenizable CSS values: {tokens.data.length}</div>
        <div>Date: {tokens.date}</div>
      </div>

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
                  <td>{row.css}</td>
                </tr>
              )
            })}
        </tbody>
      </table>

    </Layout>
  )
}

export default IndexPage
