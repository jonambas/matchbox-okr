import _ from 'lodash';
import moment from 'moment';
import data from '../../raw-data/raw.json';
const exclude = ['2018-07-19']

const filtered = data.filter(({ date }) => !exclude.includes(date));

const formatInputDate = (date) => moment(date).format('YYYY-MM-DD');

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

function getData() {
  // Flattens multiple file changes within single commits
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

  // Flattens same day commits into single days
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

  // Fills missing dates for an accurate x domain
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

  // Flattens days into weeks
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

  return byWeek;
}


export default getData;
