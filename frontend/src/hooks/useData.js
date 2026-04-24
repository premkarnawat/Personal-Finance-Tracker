import { useState, useEffect, useCallback } from 'react'
import api from '../utils/api'

export function useTransactions(filters = {}) {
  const [data, setData] = useState({ transactions: [], pagination: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate
      if (filters.category) params.category = filters.category
      if (filters.type) params.type = filters.type
      if (filters.page) params.page = filters.page
      if (filters.limit) params.limit = filters.limit

      const res = await api.get('/transactions', { params })
      setData(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => { fetchTransactions() }, [fetchTransactions])

  return { ...data, loading, error, refetch: fetchTransactions }
}

export function useAnalytics(filters = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate
      const res = await api.get('/analytics', { params })
      setData(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => { fetchAnalytics() }, [fetchAnalytics])

  return { data, loading, error, refetch: fetchAnalytics }
}
