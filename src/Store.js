import { createSlice } from '@reduxjs/toolkit'

export const slice = createSlice({
  name: 'data',
  initialState: {
    embeddings: null,
    data: null,
    labels: null
  },
  reducers: {
    renameLabel: (state, action) => {
      state.labels?.forEach(
        (label) => (label === action.payload.oldLabel)
          ? label
          : action.payload.newLabel
      )
    },
    setLabelOfId: (state, action) => {
      state.labels[action.payload.id] = action.payload.label
    },
    setState: (state, action) => {
      state = action.payload.state
    }
  }
}
)

export const { renameLabel, setLabelOfId, setState } = slice.actions // auto-generated action creators for all reducers

export const selectEmbeddings = state => state.embeddings
export const selectData = state => state.data
export const selectLabels = state => state.labels

export default slice.reducer
