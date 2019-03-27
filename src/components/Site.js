import React, { Component } from 'react'
import { connect } from 'react-redux'
import { injectGlobal } from 'emotion'
import styled from '@emotion/styled'
import { Route, Link, Switch, withRouter } from 'react-router-dom'
import { FaHome, FaInfo } from 'react-icons/fa'
import Home from './Home'
import AutosizeWrapper from './AutosizeWrapper'
import LineChartExample from '../containers/LineChartExample'
import { loadLineChartExampleData } from '../actions'

const Container = styled.div`
  height: 100%;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`

const Header = styled.h1`
  text-align: center;
  padding-bottom: 20px;
  border-bottom: 1px solid black;
`

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`

const Page = styled.div`
  flex: 1;
  padding: 20px;
`

injectGlobal`
  * {
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
  }

  body {
    margin: 0;
    font-family: Verdana, Geneva, sans-serif;
    font-weight: 400;
  }

  html,
  body,
  #root {
    height: 100%;
    position: relative;
    background: #E0E6EA;
  }
`

export class Site extends Component {
  componentDidMount() {
    this.props.loadLineChartExampleData()
  }
  render() {
    return (
      <Container>
        <StyledLink to="/">
          <Header>React D3 Showcase</Header>
        </StyledLink>
        <Page>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route
              path="/linechart"
              render={() => (
                <AutosizeWrapper>
                  <LineChartExample />
                </AutosizeWrapper>
              )}
            />
          </Switch>
        </Page>
      </Container>
    )
  }
}

const mapStateToProps = state => ({})

const mapDispatchToProps = {
  loadLineChartExampleData,
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Site)
)
