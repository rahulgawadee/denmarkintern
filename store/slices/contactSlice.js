import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for submitting contact form
export const submitContactForm = createAsyncThunk(
  'contact/submitForm',
  async ({ type, formData }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, formData }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to submit form');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error occurred');
    }
  }
);

const contactSlice = createSlice({
  name: 'contact',
  initialState: {
    quick: {
      loading: false,
      success: false,
      error: null,
    },
    full: {
      loading: false,
      success: false,
      error: null,
    },
  },
  reducers: {
    resetQuickForm: (state) => {
      state.quick = {
        loading: false,
        success: false,
        error: null,
      };
    },
    resetFullForm: (state) => {
      state.full = {
        loading: false,
        success: false,
        error: null,
      };
    },
    clearErrors: (state) => {
      state.quick.error = null;
      state.full.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Quick form
      .addCase(submitContactForm.pending, (state, action) => {
        const formType = action.meta.arg.type;
        state[formType].loading = true;
        state[formType].error = null;
        state[formType].success = false;
      })
      .addCase(submitContactForm.fulfilled, (state, action) => {
        const formType = action.meta.arg.type;
        state[formType].loading = false;
        state[formType].success = true;
        state[formType].error = null;
      })
      .addCase(submitContactForm.rejected, (state, action) => {
        const formType = action.meta.arg.type;
        state[formType].loading = false;
        state[formType].success = false;
        state[formType].error = action.payload || 'An error occurred';
      });
  },
});

export const { resetQuickForm, resetFullForm, clearErrors } = contactSlice.actions;
export default contactSlice.reducer;
