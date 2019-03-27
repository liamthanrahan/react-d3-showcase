import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  select,
  scaleLinear,
  scaleTime,
  axisBottom,
  axisLeft,
  format,
  formatPrefix,
  extent,
  line,
  curveMonotoneX,
  range,
  transition,
  max,
  min,
  scaleOrdinal,
  schemeCategory10,
  bisector,
  mouse,
  timeFormat,
  brushX,
  brush,
  event,
  zoom,
} from 'd3'

const margin = {
  top: 20,
  right: 15,
  bottom: 20,
  left: 50,
}

const colors = {
  predicted: '#5687d1',
  actual: '#7b615c',
  minimum: '#FF0000',
}

const formatTime = timeFormat('%d/%m/%Y %I:%M%p')

// const t = transition().duration(750)

class LineChart extends Component {
  static propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    ticks: PropTypes.number,
    prefixSpec: PropTypes.string,
    prefixVal: PropTypes.number,
    dateRange: PropTypes.array,
    setDateRange: PropTypes.func,
  }
  static defaultProps = {
    ticks: 10,
    prefixSpec: '~s',
    prefixVal: 1e6,
  }
  componentDidMount() {
    const {
      width: containerWidth,
      height: containerHeight,
      ticks,
      prefixSpec,
      prefixVal,
    } = this.props
    // console.log('Mount Line Chart', this.props)

    const width = containerWidth - margin.left - margin.right
    const height = containerHeight - margin.top - margin.bottom

    this.x = scaleTime().range([0, width])

    this.y = scaleLinear()
      .domain([0, 1])
      .range([height, 0])

    this.line = line()
      .x((d, i) => this.x(i))
      .y(d => this.y(d.y))
      .curve(curveMonotoneX)

    this.brush = brush()
      .extent([[0, 0], [width, height]])
      .on('start', this.brushstart)
      .on('brush', this.brushmove)
      .on('end', this.brushended)

    this.idleTimeout
    this.idleDelay = 350

    const svg = select(this.svg)
    this.background = svg
      .append('rect')
      .attr('width', containerWidth)
      .attr('height', containerHeight)
      .style('fill', '#FFF')

    this.clipPath = svg
      .append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', width)
      .attr('height', height)

    svg
      .append('text')
      .attr('class', 'title')
      .attr('x', containerWidth / 2)
      .attr('y', margin.top / 2)
      .attr('text-anchor', 'middle')

    svg
      .append('g')
      .attr('class', 'legend')
      .attr('x', width + margin.left)
      .attr('y', margin.top)
      .attr('text-anchor', 'end')

    svg
      .append('g')
      .attr('class', 'lines')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    this.xAxis = axisBottom(this.x).ticks(ticks)
    this.xAxisEl = svg
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(${margin.left},${height - margin.bottom})`)
    // .call(this.xAxis)

    this.yAxis = axisLeft(this.y)
      .ticks(ticks / 2)
      .tickFormat(formatPrefix(prefixSpec, prefixVal))
    this.yAxisEl = svg
      .append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${margin.left},${margin.top})`)
    // .call(this.yAxis)

    this.yAxisLabel = svg
      .append('text')
      .attr('class', 'y-axis-label')
      .attr('transform', `rotate(-90)`)
      .attr('x', 0 - height / 2)
      .attr('y', margin.left / 2 - 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')

    this.brushEl = svg
      .append('g')
      .attr('class', 'brush')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    this.tooltipSlider = svg
      .append('line')
      .attr('class', 'tooltip-slider')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .style('pointer-events', 'none')
      .style('stroke-dasharray', '4')

    this.tooltip = svg
      .append('g')
      .attr('class', 'tooltip')
      .style('pointer-events', 'none')
      .style('font', '10px sans-serif')
      .style('fill', 'black')
    this.tooltipBack = this.tooltip
      .append('rect')
      .attr('class', 'background')
      .style('fill', 'white')
      .style('stroke', 'black')
      .style('pointer-events', 'none')

    this.tooltipContent = this.tooltip.append('g').attr('class', 'content')
    this.tooltipHeader = this.tooltipContent
      .append('text')
      .attr('class', 'header')
    this.tooltipData = this.tooltipContent.append('g').attr('class', 'data')
    this.brushEl.on('touchmove mousemove', this.showTooltip)
    this.brushEl.on('touchend mouseleave', this.hideTooltip)
  }
  componentDidUpdate(prevProps) {
    const {
      width: containerWidth,
      height: containerHeight,
      data,
      dateRange,
    } = this.props
    // console.log('Update Line Chart', this.props)

    const width = containerWidth - margin.left - margin.right
    const height = containerHeight - margin.top - margin.bottom
    this.x.range([0, width])
    this.y.range([height, 0])

    this.brush.extent([[0, 0], [width, height]])

    const svg = select(this.svg)

    this.background
      .attr('width', containerWidth)
      .attr('height', containerHeight)

    this.clipPath.attr('width', width).attr('height', height)

    if (data) {
      if (dateRange) {
        this.x.domain(dateRange)
      } else {
        this.x.domain(extent(data.dates))
      }

      this.y
        .domain([
          min(data.series, d => min(d.values)),
          max(data.series, d => max(d.values)),
        ])
        .nice()
    }

    this.xAxis.scale(this.x)
    this.xAxisEl
      // .transition(t)
      .attr('transform', `translate(${margin.left},${height + margin.top})`)
      .call(this.xAxis)

    this.yAxis.scale(this.y)
    this.yAxisEl
      // .transition(t)
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .call(this.yAxis)

    if (!data) return
    svg
      .select('.title')
      .attr('x', containerWidth / 2)
      .attr('y', '1em')
      .text(data.title)

    svg
      .select('.y-axis-label')
      .attr('x', -margin.top - height / 2)
      .text(data.yLabel)

    this.color = scaleOrdinal(schemeCategory10)

    // const legend = svg
    //   .select('.legend')
    //   .attr(
    //     'transform',
    //     (d, i) => `translate(${width + margin.left},${i * 15 + margin.top})`
    //   )
    //   .selectAll('text')
    //   .data(data.series)
    //   .text(d => d.name)
    //
    // legend
    //   .enter()
    //   .append('text')
    //   .attr('transform', (d, i) => `translate(${0},${i * 15})`)
    //   .text(d => d.name)
    //   .attr('fill', (d, i) => this.color(i))

    this.line = line()
      .defined(d => !isNaN(d))
      .x((d, i) => this.x(data.dates[i]))
      .y(d => this.y(d))

    const lines = svg
      .select('.lines')
      .selectAll('path')
      .data(data.series)

    lines
      // .transition(t)
      .attr('d', d => this.line(d.values))

    lines
      .enter()
      .append('path')
      .attr('class', 'line')
      .attr('d', d => this.line(d.values))
      .attr('fill', 'none')
      .attr('stroke', (d, i) => this.color(i))
      .style('clip-path', 'url(#clip)')

    lines.exit().remove()

    this.brushEl.call(this.brush)
  }

  showTooltip = () => {
    const { data, width: containerWidth, height: containerHeight } = this.props
    const width = containerWidth - margin.left - margin.right
    const height = containerHeight - margin.top - margin.bottom

    if (!data) return
    let mousePos = mouse(this.brushEl.node())
    const { date, index } = this.bisect(mousePos[0])

    let values = data.series.map(series => series.values[index])
    let maxVal = max(values)
    let displayVals = data.series.map(
      series => `${series.name}: ${format(',~s')(series.values[index])}`
    )

    this.tooltipSlider
      .attr('stroke', 'gray')
      .attr('x1', this.x(date))
      .attr('x2', this.x(date))
      .attr('y1', 0)
      .attr('y2', height)

    let isRight = this.x(date) > width / 2

    this.tooltip
      .attr(
        'transform',
        `translate(${
          isRight ? this.x(date) + 20 : this.x(date) + 80
        },${mousePos[1] + margin.top})`
      )
      .style('display', 'block')
      .style('text-anchor', isRight ? 'end' : 'start')

    this.tooltipHeader.text(formatTime(date))
    this.tooltipData
      .selectAll('text')
      .data(displayVals)
      .join('text')
      .call(text =>
        text
          .style('fill', (d, i) => this.color(i))
          .attr('y', (d, i) => `${(i + 1) * 1.1}em`)
          .text(d => d)
      )

    this.tooltipData.exit().remove()

    const { x, y, width: w, height: h } = this.tooltipContent.node().getBBox()
    // Add padding around tooltip
    this.tooltipBack
      .attr('x', x - 10)
      .attr('y', y - 10)
      .attr('height', h + 20)
      .attr('width', w + 20)
      .attr('rx', 15)
      .attr('ry', 15)
    // .attr("transform", `translate(${-w / 2},${15 - y})`);
  }

  hideTooltip = () => {
    this.tooltip.style('display', 'none')
    this.tooltipSlider.attr('stroke', 'none')
  }

  bisect = mx => {
    const { data } = this.props
    const bisect = bisector(d => d).left
    const date = this.x.invert(mx)
    let index = bisect(data.dates, date, 1)

    let d0 = data.dates[index - 1]
    let d1 = data.dates[index]
    index = date - d0 > d1 - date ? index : index - 1
    return { date: data.dates[index], index }
  }

  brushX = (e, selection) => {
    const { height: containerHeight } = this.props
    const height = containerHeight - margin.top - margin.bottom
    this.movingDirection = 'x'
    e.target.move(this.brushEl, [
      [selection[0][0], 0],
      [selection[1][0], height],
    ])
  }

  brushstart = () => {
    this.startSelection = event.selection
    this.movingDirection = null
    this.hideTooltip()
  }

  brushmove = () => {
    var selection = event.selection
    if (selection == null) return
    const { height: containerHeight } = this.props
    const height = containerHeight - margin.top - margin.bottom

    if (this.movingDirection == null) {
      this.brushX(event, selection)
    } else {
      if (selection[0][1] != 0 && selection[1][1] != height)
        this.brushX(event, selection)
    }
  }

  brushended = () => {
    const { data, dateRange, setDateRange } = this.props
    var s = event.selection

    if (!s) {
      if (!this.idleTimeout) {
        return (this.idleTimeout = setTimeout(this.idled, this.idleDelay))
      }
      if (data) {
        if (setDateRange) {
          setDateRange(extent(data.dates))
        } else {
          this.x.domain(extent(data.dates))
        }
      }
    } else {
      if (setDateRange) {
        setDateRange([s[0][0], s[1][0]].map(this.x.invert, this.x))
      } else {
        this.x.domain([s[0][0], s[1][0]].map(this.x.invert, this.x))
      }
      this.brushEl.call(this.brush.move, null)
    }
    if (!dateRange) {
      this.zoom()
    }
    this.movingDirection = null
  }

  zoom = () => {
    this.xAxisEl
      // .transition(t)
      .call(this.xAxis)
    this.yAxisEl
      // .transition(t)
      .call(this.yAxis)
    select(this.svg)
      .select('.lines')
      .selectAll('path')
      // .transition(t)
      .attr('d', d => this.line(d.values))
  }

  idled = () => {
    this.idleTimeout = null
  }

  render() {
    const { width, height, data } = this.props
    // console.log('Render Line Chart', this.props)
    return <svg width={width} height={height} ref={d => (this.svg = d)} />
  }
}

export default LineChart
