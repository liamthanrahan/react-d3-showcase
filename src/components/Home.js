import React, { Component } from 'react'
import { connect } from 'react-redux'
import styled from '@emotion/styled'
import { withRouter, Link } from 'react-router-dom'
import { FaPlus } from 'react-icons/fa'
import PropTypes from 'prop-types'

const Container = styled.div`
  height: 100%;
  position: relative;
  overflow: hidden;
  padding: 20px;
`

const List = styled.ul`
  * {
    &:hover {
      font-weight: bold;
      color: pink;
    }
  }
`

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`

export class Home extends Component {
  static propTypes = {
    count: PropTypes.number,
    test: PropTypes.string,
  }
  submit = () => {
    const { setTest } = this.props
    setTest(this.test.value)
  }
  render() {
    const { count, test, incrementCount } = this.props
    return (
      <Container>
        <List>
          <li>
            <StyledLink to="/linechart">Line Chart</StyledLink>
          </li>
        </List>
      </Container>
    )
  }
}

const mapStateToProps = state => ({})

const mapDispatchToProps = {}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Home)
)
