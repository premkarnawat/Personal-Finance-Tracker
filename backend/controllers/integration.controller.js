/**
 * integration.controller.js
 *
 * Handles:
 *  1. Bank / UPI connection (connect, disconnect, list)
 *  2. SMS transaction parsing + import
 *  3. Bank transaction sync (via Account Aggregator or direct bank API)
 *  4. Auto-categorization
 *
 * Indian banking context:
 *  - Account Aggregator (AA) framework: RBI-regulated data sharing
 *    Providers: Finvu (finvu.in), OneMoney, Anumati, Perfios
 *  - UPI: no official API for third-parties; we store VPA and parse SMS
 *  - Bank APIs: ICICI, HDFC, Axis, Kotak have open-banking sandbox APIs
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// ─── Auto-categorization ──────────────────────────────────────────────────────

const CATEGORY_RULES = [
  { keywords: ['swiggy', 'zomato', 'dominos', 'mcdonalds', 'kfc', 'pizza', 'restaurant', 'cafe', 'food', 'biryani', 'hotel dining', 'uber eats', 'dunzo food'], category: 'Food & Dining' },
  { keywords: ['uber', 'ola', 'rapido', 'redbus', 'irctc', 'metro', 'bus ticket', 'petrol', 'fuel', 'parking', 'toll', 'namma metro', 'bmtc', 'auto fare'], category: 'Transportation' },
  { keywords: ['rent', 'housing', 'maintenance', 'electricity', 'society fee', 'landlord', 'apartment', 'flat rent', 'pg payment'], category: 'Housing & Rent' },
  { keywords: ['apollo', 'medplus', 'pharmacy', 'hospital', 'clinic', 'doctor', 'medicine', 'health', 'max hospital', 'fortis', 'lab test', 'diagnostic'], category: 'Healthcare' },
  { keywords: ['netflix', 'spotify', 'amazon prime', 'hotstar', 'disney', 'youtube premium', 'gaming', 'movie', 'pvr', 'inox', 'bookmyshow', 'concert'], category: 'Entertainment' },
  { keywords: ['amazon', 'flipkart', 'myntra', 'meesho', 'ajio', 'nykaa', 'shopping', 'reliance mart', 'dmart', 'big bazaar', 'jiomart', 'blinkit', 'zepto', 'swiggy instamart'], category: 'Shopping' },
  { keywords: ['udemy', 'coursera', 'byju', 'unacademy', 'school fee', 'college fee', 'tuition', 'course', 'exam fee', 'upsc', 'coaching'], category: 'Education' },
  { keywords: ['makemytrip', 'goibibo', 'oyo', 'hotel booking', 'airbnb', 'flight', 'cleartrip', 'booking.com', 'holiday', 'resort'], category: 'Travel' },
  { keywords: ['jio recharge', 'airtel', 'bsnl', 'vi recharge', 'broadband', 'internet bill', 'water bill', 'gas bill', 'piped gas'], category: 'Utilities' },
  { keywords: ['salary credited', 'payroll', 'salary from', 'neft credit salary', 'monthly salary', 'stipend'], category: 'Salary' },
  { keywords: ['freelance payment', 'client payment', 'invoice payment', 'upwork', 'fiverr', 'project payment', 'consulting fee'], category: 'Freelance' },
  { keywords: ['mutual fund', 'sip debit', 'zerodha', 'groww', 'stock purchase', 'nse', 'bse', 'dividend', 'demat', 'kuvera', 'paytm money', 'angel broking'], category: 'Investment' },
  { keywords: ['savings transfer', 'fd booking', 'recurring deposit', 'ppf', 'nps contribution', 'fixed deposit'], category: 'Savings' },
]

function autoDetectCategory(description = '', notes = '') {
  const text = (description + ' ' + notes).toLowerCase()
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some(kw => text.includes(kw))) {
      return rule.category
    }
  }
  return 'Other'
}

// ─── SMS Parser ───────────────────────────────────────────────────────────────

function parseBankSMS(smsText = '') {
  const text = smsText.trim()

  // Amount: Rs.1,234.56 | INR 1,234 | ₹1,234.56
  const amountMatch = text.match(/(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i)
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null

  // Type: debit or credit
  const isDebit = /\b(debited|debit|spent|paid|purchase|withdrawn|payment of|deducted)\b/i.test(text)
  const isCredit = /\b(credited|credit|received|deposited|refund|cashback)\b/i.test(text)
  const type = isCredit ? 'income' : isDebit ? 'expense' : null

  // Merchant / description
  const merchantPatterns = [
    /(?:at|to|for)\s+([A-Za-z0-9\s\-&.]{3,40}?)(?:\s+on\s|\s+via\s|\s+ref\s|\s+utr\s|\.|\n|$)/i,
    /(?:using\s+upi\s+to)\s+([A-Za-z0-9\s\-&.]{3,40}?)(?:\s|\.|$)/i,
  ]
  let description = 'Bank Transaction'
  for (const pattern of merchantPatterns) {
    const m = text.match(pattern)
    if (m && m[1].trim().length > 2) {
      description = m[1].trim()
      break
    }
  }

  // External ref (UPI / UTR / Ref no)
  const refMatch = text.match(/(?:UPI[:\s#]*|Ref[:\s#]*|UTR[:\s#]*|RefNo[:\s#]*)([A-Z0-9]{8,22})/i)
  const externalRef = refMatch ? refMatch[1].toUpperCase() : null

  // Bank account hint
  const acMatch = text.match(/[Aa]\/[Cc]\s*(?:no\.?|number)?\s*[xX*]{2,}(\d{2,6})/i)
  const accountHint = acMatch ? `XXXX${acMatch[1]}` : null

  // Date from SMS
  const datePatterns = [
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
    /(\d{2}-[A-Za-z]{3}-\d{2,4})/,
    /(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})/,
  ]
  let date = new Date().toISOString()
  for (const p of datePatterns) {
    const m = text.match(p)
    if (m) {
      const parsed = new Date(m[1])
      if (!isNaN(parsed)) { date = parsed.toISOString(); break }
    }
  }

  if (!amount || amount <= 0 || !type) {
    return { success: false, reason: 'Could not detect amount or transaction type from SMS' }
  }

  const category = autoDetectCategory(description, text)

  return {
    success: true,
    parsed: { amount, type, description, category, date, externalRef, accountHint, source: 'sms' },
  }
}

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /integrations/sms/import
 * Body: { smsText: string }
 * Parses a bank SMS and saves as a transaction
 */
const importSMS = async (req, res) => {
  try {
    const userId = req.user.userId
    const { smsText } = req.body
    if (!smsText) return res.status(400).json({ error: 'smsText is required' })

    const result = parseBankSMS(smsText)
    if (!result.success) return res.status(422).json({ error: result.reason })

    const { amount, type, description, category, date, externalRef, source } = result.parsed

    // Check for duplicate via externalRef
    if (externalRef) {
      const existing = await prisma.transaction.findUnique({
        where: { userId_externalRef: { userId, externalRef } },
      })
      if (existing) {
        return res.status(409).json({ error: 'Duplicate transaction — already imported', transaction: existing })
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId, amount, type, category, description,
        date: new Date(date),
        source, externalRef,
        notes: `Auto-imported via SMS. Ref: ${externalRef || 'N/A'}`,
      },
    })

    res.status(201).json({ transaction, parsed: result.parsed })
  } catch (err) {
    console.error('SMS import error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * POST /integrations/sms/bulk
 * Body: { smsArray: string[] }
 * Bulk import from SMS array
 */
const bulkImportSMS = async (req, res) => {
  try {
    const userId = req.user.userId
    const { smsArray } = req.body
    if (!Array.isArray(smsArray) || smsArray.length === 0) {
      return res.status(400).json({ error: 'smsArray must be a non-empty array' })
    }

    const results = { imported: 0, skipped: 0, failed: 0, transactions: [] }

    for (const smsText of smsArray) {
      const result = parseBankSMS(smsText)
      if (!result.success) { results.failed++; continue }

      const { amount, type, description, category, date, externalRef, source } = result.parsed

      // Dedup check
      if (externalRef) {
        const existing = await prisma.transaction.findUnique({
          where: { userId_externalRef: { userId, externalRef } },
        })
        if (existing) { results.skipped++; continue }
      }

      try {
        const tx = await prisma.transaction.create({
          data: {
            userId, amount, type, category, description,
            date: new Date(date), source, externalRef,
            notes: `Bulk SMS import. Ref: ${externalRef || 'N/A'}`,
          },
        })
        results.imported++
        results.transactions.push(tx)
      } catch (e) {
        if (e.code === 'P2002') results.skipped++ // unique constraint
        else results.failed++
      }
    }

    res.json(results)
  } catch (err) {
    console.error('Bulk SMS import error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * POST /integrations/bank/connect
 * Body: { bankId, vpa?, consentId?, accessToken? }
 * Saves bank connection. In production, accessToken comes from AA OAuth flow.
 */
const connectBank = async (req, res) => {
  try {
    const userId = req.user.userId
    const { bankId, vpa, consentId, accessToken, accountNo } = req.body

    if (!bankId) return res.status(400).json({ error: 'bankId is required' })

    const BANK_NAMES = {
      gpay: 'Google Pay', phonepe: 'PhonePe', paytm: 'Paytm',
      sbi: 'State Bank of India', hdfc: 'HDFC Bank',
      icici: 'ICICI Bank', axis: 'Axis Bank', kotak: 'Kotak Mahindra',
    }

    const bankName = BANK_NAMES[bankId] || bankId

    const connection = await prisma.bankConnection.upsert({
      where: { userId_bankId: { userId, bankId } },
      update: {
        status: 'active',
        vpa: vpa || undefined,
        consentId: consentId || undefined,
        accessToken: accessToken || undefined,
        accountNo: accountNo || undefined,
        connectedAt: new Date(),
      },
      create: {
        userId, bankId, bankName,
        vpa, consentId, accessToken, accountNo,
        status: 'active',
      },
    })

    res.json({ connection, message: `${bankName} connected successfully` })
  } catch (err) {
    console.error('Connect bank error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * POST /integrations/bank/disconnect
 * Body: { bankId }
 */
const disconnectBank = async (req, res) => {
  try {
    const userId = req.user.userId
    const { bankId } = req.body
    if (!bankId) return res.status(400).json({ error: 'bankId is required' })

    await prisma.bankConnection.delete({
      where: { userId_bankId: { userId, bankId } },
    })

    res.json({ message: 'Bank disconnected' })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Connection not found' })
    console.error('Disconnect bank error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * GET /integrations/bank/connections
 * Returns all bank connections for current user
 */
const listConnections = async (req, res) => {
  try {
    const userId = req.user.userId
    const connections = await prisma.bankConnection.findMany({
      where: { userId },
      select: {
        bankId: true, bankName: true, vpa: true,
        accountNo: true, status: true, lastSyncedAt: true, connectedAt: true,
      },
    })
    res.json({ connections })
  } catch (err) {
    console.error('List connections error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * POST /integrations/bank/sync
 * Body: { bankId }
 *
 * In PRODUCTION: call the AA API or bank's open-banking API here.
 * This stub logs the intent and returns 501 with instructions if no real token.
 *
 * To wire a real bank:
 *  1. Get an AA account: https://finvu.in/fip-fiu or https://onemoney.in
 *  2. Complete FI consent flow → receive consentId + accessToken
 *  3. Call AA data-request API: POST /FI/request with consentId
 *  4. Parse FI data response and map to Transaction schema
 */
const syncBank = async (req, res) => {
  try {
    const userId = req.user.userId
    const { bankId } = req.body
    if (!bankId) return res.status(400).json({ error: 'bankId is required' })

    const connection = await prisma.bankConnection.findUnique({
      where: { userId_bankId: { userId, bankId } },
    })

    if (!connection) return res.status(404).json({ error: 'Bank not connected' })
    if (connection.status !== 'active') return res.status(400).json({ error: 'Bank connection is not active' })

    // If no access token — AA integration not set up yet
    if (!connection.accessToken && !connection.consentId) {
      return res.status(501).json({
        error: 'Bank API sync requires Account Aggregator setup',
        instructions: {
          step1: 'Register at https://finvu.in or https://onemoney.in as an FIU',
          step2: 'Complete KYC and get sandbox credentials',
          step3: 'Implement consent flow: user logs in via AA, approves data sharing',
          step4: 'Store consentId + accessToken in BankConnection',
          step5: 'Call this endpoint again — it will use AA FI fetch API',
          docs: 'https://developer.finvu.in/docs',
          alternative: 'Use SMS import (/integrations/sms/import) which works right now',
        },
      })
    }

    // ── REAL AA sync would go here ────────────────────────────────────────────
    // const aaResponse = await fetchAATransactions(connection.consentId, connection.accessToken)
    // const parsed = aaResponse.fiObjects.map(fi => parseAATransaction(fi, userId))
    // const imported = await bulkInsertTransactions(parsed, userId)
    // ─────────────────────────────────────────────────────────────────────────

    // Update last synced time
    await prisma.bankConnection.update({
      where: { userId_bankId: { userId, bankId } },
      data: { lastSyncedAt: new Date() },
    })

    res.json({ imported: 0, message: 'Sync complete (AA integration pending setup)' })
  } catch (err) {
    console.error('Bank sync error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = {
  importSMS,
  bulkImportSMS,
  connectBank,
  disconnectBank,
  listConnections,
  syncBank,
  autoDetectCategory,
  parseBankSMS,
}
