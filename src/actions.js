import { csv, timeParse } from 'd3'
import LineChartExampleData from '../data/Line Chart Example Data.csv'

const parseTime = timeParse('%Y-%m-%d %H:%M:%S')

const formatData = data => {
  let valueRows = data.columns.slice(1)
  let dates = data.map(d => d['Date & Time'])
  let formatted = valueRows.map((value, i) => ({ name: value, values: [] }))

  formatted['columns'] = ['name', ...dates]
  data.forEach(row => {
    valueRows.forEach((value, i) => {
      formatted[i].values.push(+row[value])
    })
  })

  return { formatted, dates }
}

export const loadLineChartExampleData = () => (dispatch, getState) => {
  csv(LineChartExampleData).then(csvData => {
    let { formatted, dates } = formatData(csvData)

    let data = {
      title: 'Remaining Strain Creep Shrinkage',
      yLabel: 'Microstrain',
      series: formatted,
      dates: dates.map(parseTime),
    }
    dispatch({
      type: 'LOAD_LINECHART_EXAMPLE_DATA',
      data,
    })
  })
}

export function incrementCount() {
  return {
    type: 'INCREMENT_COUNT',
  }
}

export const setTest = test => (dispatch, getState) => {
  dispatch({
    type: 'SET_TEST',
    test,
  })
}
