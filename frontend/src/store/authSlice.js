import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    accessToken: localStorage.getItem('accessToken') || null,
    isAuthenticated: localStorage.getItem('accessToken') ? true : false,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action) => {
            state.loading = false;
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
            state.isAuthenticated = true;
            localStorage.setItem('accessToken', action.payload.accessToken);
        },
        loginFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.accessToken = null;
            state.isAuthenticated = false;
            localStorage.removeItem('accessToken');
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
    },
});

export const { loginStart, loginSuccess, loginFailure, logout, setUser } = authSlice.actions;
export default authSlice.reducer;