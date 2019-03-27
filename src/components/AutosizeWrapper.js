import React, { Component } from 'react'
import styled from '@emotion/styled'
import AutoSizer from 'react-virtualized/dist/es/AutoSizer'

const StyledAutoSizer = styled(AutoSizer)`
  overflow: inherit !important;
`

export default props => (
  <StyledAutoSizer>
    {autoProps => {
      return props.children
        ? React.cloneElement(props.children, autoProps)
        : null
    }}
  </StyledAutoSizer>
)
