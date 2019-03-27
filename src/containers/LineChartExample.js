import React from 'react'
import { connect } from 'react-redux'
import LineChart from '../components/LineChart'

const mapStateToProps = state => ({
  data: state.linechartExampleData,
  ticks: 10,
  prefixSpec: '~s',
  prefixVal: 0,
})

const mapDispatchToProps = {}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LineChart)
