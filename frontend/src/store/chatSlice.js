import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [
    {
      role: "assistant",
      text: "Upload a complaint document or paste text above. I will automatically extract the details and populate the form for you.",
    },
  ],
  isLoading: false,
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    sendStarted(state, action) {
      state.isLoading = true;
      state.error = null;
      if (action.payload) {
        state.messages.push({ role: "user", text: action.payload });
      }
    },
    sendSucceeded(state, action) {
      state.isLoading = false;
      state.messages.push({ role: "assistant", text: action.payload });
    },
    sendFailed(state, action) {
      state.isLoading = false;
      state.error = action.payload;
      state.messages.push({
        role: "assistant",
        text: `Sorry, something went wrong: ${action.payload}`,
      });
    },
  },
});

export const { sendStarted, sendSucceeded, sendFailed } = chatSlice.actions;
export default chatSlice.reducer;
