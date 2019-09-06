import React from "react"
import { Link } from "gatsby"
import { Bar } from '@vx/shape';
import { Group } from '@vx/group';
import { scaleBand, scaleLinear } from '@vx/scale';
import _ from 'lodash';
import moment from 'moment';
import Layout from "../components/layout"
import SEO from "../components/seo"

import data from '../raw-data/scss.json';
const exclude = ['2018-07-19']

export const formatInputDate = (date) => moment(date).format('YYYY-MM-DD');

const fillByDate = ({ dataSet, fill = {}, from, to } = {}) => {
  const orderedData = dataSet.sort((a, b) => new Date(a.date) - new Date(b.date));
  let filledDataSet = [];

  for (let time = moment(from), index = 0; time.isBefore(moment(to)); time.add(1, 'day')) {
    const data = orderedData[index];
    const fillData = { ...fill, date: formatInputDate(time) };
    const week = moment(fillData.date).year()+'-'+moment(fillData.date).week();

    if (!data || data.date !== fillData.date) {
      filledDataSet = [...filledDataSet, { ...fillData, week }];
    } else {
      filledDataSet = [...filledDataSet, { ...data, week}];
      index++;
    }
  }

  return filledDataSet;
};

// console.log(min, max)
const IndexPage = () => {
  const filtered = data.filter(({ date }) => !exclude.includes(date));

  const formatted = filtered.map((item) => {
    const changes = item.changes.reduce((acc, change) => {
      return {
        insertions: acc.insertions + Number(change.insertions),
        deletions: acc.deletions + Number(change.deletions),
        files: [...acc.files, change.path]
      };
    }, { insertions: 0, deletions: 0, files: [] })

    return { date: item.date, ...changes }
  });

  const byDay = formatted.reduce((acc, item, i, src) => {
    const dupeIdx = _.findIndex(acc, ['date', item.date])

    if (dupeIdx > -1) {
      acc.splice(dupeIdx, 1, {
        ...acc[dupeIdx],
        insertions: acc[dupeIdx].insertions + item.insertions,
        deletions: acc[dupeIdx].deletions + item.deletions,
        files: [...acc[dupeIdx].files, ...item.files]
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
        files: []
      },
      from: min,
      to: max
  });


  const byWeek = filled.reduce((acc, item, i, src) => {
    const dupeIdx = _.findIndex(acc, ['week', item.week])

    if (dupeIdx > -1) {
      // console.log(dupeIdx, item.week, item.insertions)
      acc.splice(dupeIdx, 1, {
        ...acc[dupeIdx],
        insertions: acc[dupeIdx].insertions + item.insertions,
        deletions: acc[dupeIdx].deletions + item.deletions,
        files: [...acc[dupeIdx].files, ...item.files]
      });

      return acc;
    }

    acc.push(item);
    return acc;
  }, []);
  // console.log(byWeek, filled)

  const USE_WEEK = true;
  const SET = USE_WEEK ? byWeek : filled;
  const x = d => USE_WEEK ? d.week : d.date;
  const y = d => d.insertions;

  const width = 1000;
  const height = 500;

  const xMax = width;
  const yMax = height - 120;
  // console.log(xMax)
  // scales
  const xScale = scaleBand({
    rangeRound: [0, xMax],
    domain: filled.map(x),
    // padding: 0,
    innerPadding: 0.1,
    outerPadding: 0
  });
  const yScale = scaleLinear({
    rangeRound: [yMax, 0],
    domain: [0, Math.max(...formatted.map(y))]
  });

  const [selected, setSelected] = React.useState({});

  return (
    <Layout>
      <SEO title="Home" />

      <svg width={width} height={height}>
        {/* <GradientTealBlue id="teal" /> */}
        {/* <rect width={width} height={height} fill={"url(#teal)"} rx={14} /> */}
        <Group top={40}>
          {SET.map((d, i) => {
            const letter = x(d);
            const barWidth = 5;
            const barHeight = yMax - yScale(y(d));
            const barX = xScale(letter);
            const barY = yMax - barHeight;
            return (
              <>
              <rect
                key={`bar-${letter}-bg`}
                x={barX}
                y={yMax - height}
                width={barWidth}
                height={height}
                fill="rgba(245, 245, 255, 1)"
                onClick={event => {
                  setSelected(d)
                }} />
              <Bar
                key={`bar-${letter}`}
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill="rgba(23, 100, 217, 1)"
                onClick={event => {
                  setSelected(d)
                }}
              />
              </>
            );
          })}
        </Group>
      </svg>
      <div>
        <div>Week: {selected.date}</div>
        <div>Insertions: {selected.insertions}</div>
        <div>Deletions: {selected.deletions}</div>
        <ul>Files: {selected.files && selected.files.map((file = '') => {
          return (
            <li key={file}>{file.replace('/src/', '')}</li>
          )
        })}</ul>
      </div>

      {/* {data.map((item) => {
        const changes = item.changes.reduce((acc, change) => {
          return {
            insertions: acc.insertions + Number(change.insertions),
            deletions: acc.deletions + Number(change.deletions),
            files: acc.files + 1
          };
        }, { insertions: 0, deletions: 0, files: 0 })
        return (
          <div key={item.date}>
            <span>{item.date}</span>,{' '}
            <span>{changes.insertions}</span>, {' '}
            <span>{changes.deletions}</span>, {' '}
            <span>{changes.files}</span>, {' '}
          </div>
        )
      })} */}


    </Layout>
  )
}

export default IndexPage
