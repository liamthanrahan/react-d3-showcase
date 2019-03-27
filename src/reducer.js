const initialState = {
  count: 0,
  test: 'test',
  linechartExampleData: null,
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case 'INCREMENT_COUNT':
      return {
        ...state,
        count: state.count + 1,
      }
    case 'SET_TEST':
      return {
        ...state,
        test: action.test,
      }
    case 'LOAD_LINECHART_EXAMPLE_DATA':
      return {
        ...state,
        linechartExampleData: action.data,
      }
    default:
      return state
  }
}
