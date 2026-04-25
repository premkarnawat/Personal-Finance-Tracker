/**
 * useUPISync — Auto transaction tracking hook
 *
 * Architecture note:
 * True UPI/bank integration in India requires:
 *  - Account Aggregator (AA) framework (RBI-regulated) via a licensed AA like Finvu, OneMoney, Anumati
 *  - Or bank-specific APIs (ICICI, HDFC, Kotak open banking)
 *  - Or screen-scraping via SMS parsing (most practical for personal apps)
 *
 * This hook implements:
 *  1. SMS-based transaction parsing (works TODAY, no bank API needed)
 *  2. Pluggable bank API interface (ready for when you add a backend AA integration)
 *  3. Auto-categorization using keyword matching
 *  4. Polling/sync state management
 */

import { useState, useCallback, useEffect } from 'react'
import api from '../utils/api'
import { CATEGORIES } from '../utils/format'

// ─── Auto-categorization rules ───────────────────────────────────────────────
// Keywords mapped to categories — extend this list freely
const CATEGORY_RULES = [
  { keywords: ['swiggy', 'zomato', 'dominos', 'pizza', 'restaurant', 'cafe', 'food', 'biryani', 'hotel', 'dining', 'eats'], category: 'Food & Dining' },
  { keywords: ['uber', 'ola', 'rapido', 'redbus', 'irctc', 'metro', 'bus', 'petrol', 'fuel', 'parking', 'toll', 'namma metro'], category: 'Transportation' },
  { keywords: ['rent', 'housing', 'maintenance', 'electricity', 'society', 'landlord', 'apartment'], category: 'Housing & Rent' },
  { keywords: ['apollo', 'medplus', 'pharmacy', 'hospital', 'clinic', 'doctor', 'medicine', 'health', 'max hospital'], category: 'Healthcare' },
  { keywords: ['netflix', 'spotify', 'amazon prime', 'hotstar', 'youtube', 'gaming', 'movie', 'pvr', 'inox', 'bookmyshow'], category: 'Entertainment' },
  { keywords: ['amazon', 'flipkart', 'myntra', 'meesho', 'ajio', 'nykaa', 'shopping', 'mart', 'reliance', 'dmart'], category: 'Shopping' },
  { keywords: ['udemy', 'coursera', 'byju', 'unacademy', 'school', 'college', 'tuition', 'course', 'exam'], category: 'Education' },
  { keywords: ['makemytrip', 'goibibo', 'oyo', 'hotel', 'airbnb', 'flight', 'cleartrip', 'booking.com'], category: 'Travel' },
  { keywords: ['jio', 'airtel', 'bsnl', 'vi ', 'broadband', 'internet', 'recharge', 'utility', 'water', 'gas'], category: 'Utilities' },
  { keywords: ['salary', 'payroll', 'credited by employer', 'neft credit', 'salary credited'], category: 'Salary' },
  { keywords: ['freelance', 'client payment', 'invoice', 'upwork', 'fiverr', 'project payment'], category: 'Freelance' },
  { keywords: ['mutual fund', 'sip', 'zerodha', 'groww', 'stocks', 'nse', 'bse', 'dividend', 'demat'], category: 'Investment' },
  { keywords: ['savings', 'fd', 'recurring', 'ppf', 'nps', 'fixed deposit'], category: 'Savings' },
]

/**
 * Auto-detect category from transaction description
 */
export function autoDetectCategory(description = '') {
  const lower = description.toLowerCase()
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some(kw => lower.includes(kw))) {
      return rule.category
    }
  }
  return 'Other'
}

/**
 * Parse Indian bank SMS text into a transaction object
 * Handles formats from SBI, HDFC, ICICI, Axis, Kotak, etc.
 */
export function parseBankSMS(smsText = '') {
  const text = smsText.trim()

  // Amount patterns: Rs.1,234.56 | INR 1234 | ₹1,234
  const amountMatch = text.match(/(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i)
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null

  // Determine type: debit or credit
  const isDebit = /debited|debit|spent|paid|withdrawn|payment of|purchase/i.test(text)
  const isCredit = /credited|credit|received|deposited|refund/i.test(text)
  const type = isCredit ? 'income' : isDebit ? 'expense' : null

  // Merchant/description: extract after "at", "to", "from", "for"
  const merchantMatch = text.match(/(?:at|to|from|for)\s+([A-Za-z0-9\s\-&.]{3,40}?)(?:\s+on|\s+via|\s+ref|\.|\n|$)/i)
  const description = merchantMatch ? merchantMatch[1].trim() : 'Bank Transaction'

  // UPI ref number
  const upiRefMatch = text.match(/(?:UPI|Ref|RefNo|UTR)[:\s#]*([A-Z0-9]{10,22})/i)
  const upiRef = upiRefMatch ? upiRefMatch[1] : null

  // Date
  const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{2}-[A-Za-z]{3}-\d{2,4})/)
  const date = dateMatch ? new Date(dateMatch[1]).toISOString() : new Date().toISOString()

  if (!amount || !type) return null

  return {
    amount,
    type,
    description,
    category: autoDetectCategory(description + ' ' + text),
    date,
    source: 'sms',
    externalRef: upiRef,
    raw: text,
  }
}

// ─── Main hook ───────────────────────────────────────────────────────────────

export function useUPISync() {
  const [syncing, setSyncing] = useState(false)
  const [lastSynced, setLastSynced] = useState(() => {
    const stored = localStorage.getItem('fintra_last_synced')
    return stored ? new Date(stored) : null
  })
  const [syncedCount, setSyncedCount] = useState(0)
  const [error, setError] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState(() => {
    return JSON.parse(localStorage.getItem('fintra_connections') || '{}')
  })

  /**
   * Submit a parsed SMS transaction to the backend
   */
  const submitSMSTransaction = useCallback(async (parsed) => {
    try {
      await api.post('/transactions', {
        amount: parsed.amount,
        type: parsed.type,
        category: parsed.category,
        description: parsed.description,
        date: parsed.date,
        notes: `Auto-imported via SMS. Ref: ${parsed.externalRef || 'N/A'}`,
      })
      return true
    } catch {
      return false
    }
  }, [])

  /**
   * Process a raw SMS string — parse + submit + return result
   */
  const processSMS = useCallback(async (smsText) => {
    const parsed = parseBankSMS(smsText)
    if (!parsed) return { success: false, reason: 'Could not parse SMS format' }
    const ok = await submitSMSTransaction(parsed)
    return { success: ok, transaction: parsed }
  }, [submitSMSTransaction])

  /**
   * Bulk import from SMS array (e.g. from Android SMS reader)
   */
  const bulkImportSMS = useCallback(async (smsArray = []) => {
    setSyncing(true)
    setError(null)
    let count = 0
    for (const sms of smsArray) {
      const result = await processSMS(sms)
      if (result.success) count++
    }
    setSyncedCount(count)
    const now = new Date()
    setLastSynced(now)
    localStorage.setItem('fintra_last_synced', now.toISOString())
    setSyncing(false)
    return count
  }, [processSMS])

  /**
   * Connect a bank via Account Aggregator
   * NOTE: Requires backend AA integration (Finvu/OneMoney endpoint)
   * The UI calls this; if backend returns 401/404 it gracefully shows "coming soon"
   */
  const connectBank = useCallback(async (bankId) => {
    setSyncing(true)
    setError(null)
    try {
      const res = await api.post('/integrations/bank/connect', { bankId })
      const updated = { ...connectionStatus, [bankId]: { connected: true, connectedAt: new Date().toISOString(), ...res.data } }
      setConnectionStatus(updated)
      localStorage.setItem('fintra_connections', JSON.stringify(updated))
      return { success: true }
    } catch (err) {
      const msg = err.response?.status === 404
        ? 'Bank API integration coming soon. Use SMS import for now.'
        : err.response?.data?.error || 'Connection failed'
      setError(msg)
      return { success: false, message: msg }
    } finally {
      setSyncing(false)
    }
  }, [connectionStatus])

  /**
   * Fetch + sync latest transactions from a connected bank
   */
  const syncBankTransactions = useCallback(async (bankId) => {
    if (!connectionStatus[bankId]?.connected) {
      return { success: false, message: 'Bank not connected' }
    }
    setSyncing(true)
    try {
      const res = await api.post('/integrations/bank/sync', { bankId })
      const count = res.data?.imported || 0
      setSyncedCount(count)
      const now = new Date()
      setLastSynced(now)
      localStorage.setItem('fintra_last_synced', now.toISOString())
      return { success: true, count }
    } catch (err) {
      const msg = err.response?.data?.error || 'Sync failed'
      setError(msg)
      return { success: false, message: msg }
    } finally {
      setSyncing(false)
    }
  }, [connectionStatus])

  /**
   * Disconnect a bank
   */
  const disconnectBank = useCallback(async (bankId) => {
    try {
      await api.post('/integrations/bank/disconnect', { bankId })
    } catch { /* best effort */ }
    const updated = { ...connectionStatus }
    delete updated[bankId]
    setConnectionStatus(updated)
    localStorage.setItem('fintra_connections', JSON.stringify(updated))
  }, [connectionStatus])

  return {
    syncing,
    lastSynced,
    syncedCount,
    error,
    connectionStatus,
    processSMS,
    bulkImportSMS,
    connectBank,
    syncBankTransactions,
    disconnectBank,
    autoDetectCategory,
  }
}

// Available UPI / Bank options shown in the UI
export const SUPPORTED_BANKS = [
  { id: 'gpay', name: 'Google Pay', icon: '🟦', type: 'upi', description: 'Link via UPI VPA' },
  { id: 'phonepe', name: 'PhonePe', icon: '🟣', type: 'upi', description: 'Link via UPI VPA' },
  { id: 'paytm', name: 'Paytm', icon: '🔵', type: 'upi', description: 'Link via UPI VPA' },
  { id: 'sbi', name: 'State Bank of India', icon: '🏦', type: 'bank', description: 'YONO / Account Aggregator' },
  { id: 'hdfc', name: 'HDFC Bank', icon: '🏦', type: 'bank', description: 'NetBanking / Open API' },
  { id: 'icici', name: 'ICICI Bank', icon: '🏦', type: 'bank', description: 'iMobile / Open API' },
  { id: 'axis', name: 'Axis Bank', icon: '🏦', type: 'bank', description: 'Open Banking API' },
  { id: 'kotak', name: 'Kotak Mahindra', icon: '🏦', type: 'bank', description: 'Open Banking API' },
]
