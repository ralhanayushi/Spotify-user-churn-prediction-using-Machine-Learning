import axios from 'axios'

const API = axios.create({ baseURL: '/api' })

// Existing
export const predictChurn   = (data) => API.post('/predict/', data)
export const getAnalytics   = ()     => API.get('/analytics/summary')

// New MongoDB endpoints
export const getPredictionHistory = (limit = 20) =>
    API.get(`/predict/history?limit=${limit}`)

export const getPredictionStats = () =>
    API.get('/predict/stats')

export const submitUserData = (data) =>
    API.post('/users/submit', data)