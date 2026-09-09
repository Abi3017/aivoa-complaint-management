import { configureStore } from "@reduxjs/toolkit";
import complaintReducer from "./complaintSlice.js";
import chatReducer from "./chatSlice.js";

export const store = configureStore({
  reducer: {
    complaint: complaintReducer,
    chat: chatReducer,
  },
});
