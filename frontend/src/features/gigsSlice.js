import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const GIGS_API_URL = '/api/gigs';
const BIDS_API_URL = '/api/bids';

// Async thunks
export const fetchGigs = createAsyncThunk(
  'gigs/fetchGigs',
  async (searchQuery = '', { rejectWithValue }) => {
    try {
      const response = await axios.get(`${GIGS_API_URL}?search=${searchQuery}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const createGig = createAsyncThunk(
  'gigs/createGig',
  async (gigData, { rejectWithValue }) => {
    try {
      const response = await axios.post(GIGS_API_URL, gigData, { withCredentials: true });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const fetchUserGigs = createAsyncThunk(
  'gigs/fetchUserGigs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${GIGS_API_URL}/user`, { withCredentials: true });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const fetchUserBids = createAsyncThunk(
  'gigs/fetchUserBids',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BIDS_API_URL}/user`, { withCredentials: true });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const fetchGigDetails = createAsyncThunk(
  'gigs/fetchGigDetails',
  async (gigId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${GIGS_API_URL}/${gigId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const fetchGigBids = createAsyncThunk(
  'gigs/fetchGigBids',
  async (gigId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BIDS_API_URL}/${gigId}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const placeBid = createAsyncThunk(
  'gigs/placeBid',
  async ({ gigId, message, price }, { rejectWithValue }) => {
    try {
      const response = await axios.post(BIDS_API_URL, { gigId, message, price }, { withCredentials: true });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const updateGig = createAsyncThunk(
  'gigs/updateGig',
  async ({ gigId, gigData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${GIGS_API_URL}/${gigId}`, gigData, { withCredentials: true });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const deleteGig = createAsyncThunk(
  'gigs/deleteGig',
  async (gigId, { rejectWithValue }) => {
    try {
      await axios.delete(`${GIGS_API_URL}/${gigId}`, { withCredentials: true });
      return gigId;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const updateBid = createAsyncThunk(
  'gigs/updateBid',
  async ({ bidId, bidData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${BIDS_API_URL}/${bidId}`, bidData, { withCredentials: true });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const deleteBid = createAsyncThunk(
  'gigs/deleteBid',
  async (bidId, { rejectWithValue }) => {
    try {
      await axios.delete(`${BIDS_API_URL}/${bidId}`, { withCredentials: true });
      return bidId;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const hireFreelancer = createAsyncThunk(
  'gigs/hireFreelancer',
  async (bidId, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${BIDS_API_URL}/${bidId}/hire`, {}, { withCredentials: true });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const gigsSlice = createSlice({
  name: 'gigs',
  initialState: {
    gigs: [],
    userGigs: [],
    userBids: [],
    currentGig: null,
    gigBids: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchGigs
      .addCase(fetchGigs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGigs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.gigs = action.payload;
      })
      .addCase(fetchGigs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // createGig
      .addCase(createGig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createGig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userGigs.push(action.payload);
      })
      .addCase(createGig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // fetchUserGigs
      .addCase(fetchUserGigs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserGigs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userGigs = action.payload;
      })
      .addCase(fetchUserGigs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // fetchUserBids
      .addCase(fetchUserBids.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserBids.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userBids = action.payload;
      })
      .addCase(fetchUserBids.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // fetchGigDetails
      .addCase(fetchGigDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGigDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentGig = action.payload;
      })
      .addCase(fetchGigDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // fetchGigBids
      .addCase(fetchGigBids.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGigBids.fulfilled, (state, action) => {
        state.isLoading = false;
        state.gigBids = action.payload;
      })
      .addCase(fetchGigBids.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // placeBid
      .addCase(placeBid.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(placeBid.fulfilled, (state, action) => {
        state.isLoading = false;
        state.gigBids.push(action.payload);
      })
      .addCase(placeBid.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // hireFreelancer
      .addCase(hireFreelancer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(hireFreelancer.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the current gig status to assigned
        if (state.currentGig) {
          state.currentGig.status = 'assigned';
        }
        // Update the hired bid status
        const hiredBid = state.gigBids.find(bid => bid._id === action.payload.bid._id);
        if (hiredBid) {
          hiredBid.status = 'hired';
        }
      })
      .addCase(hireFreelancer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // updateGig
      .addCase(updateGig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateGig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentGig = action.payload;
        // Update the gig in userGigs list
        const index = state.userGigs.findIndex(gig => gig._id === action.payload._id);
        if (index !== -1) {
          state.userGigs[index] = action.payload;
        }
      })
      .addCase(updateGig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // deleteGig
      .addCase(deleteGig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteGig.fulfilled, (state, action) => {
        state.isLoading = false;
        // Remove the gig from userGigs list
        state.userGigs = state.userGigs.filter(gig => gig._id !== action.payload);
        // Clear currentGig if it's the deleted one
        if (state.currentGig && state.currentGig._id === action.payload) {
          state.currentGig = null;
        }
      })
      .addCase(deleteGig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = gigsSlice.actions;
export default gigsSlice.reducer;
