const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getTransactions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate, category, type, page = 1, limit = 50 } = req.query;

    const where = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    if (category) where.category = category;
    if (type) where.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createTransaction = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { amount, category, type, description, date } = req.body;

    if (!amount || !category || !type || !date) {
      return res.status(400).json({ error: 'Amount, category, type, and date are required' });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'Type must be income or expense' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount: parseFloat(amount),
        category,
        type,
        description: description || null,
        date: new Date(date),
      },
    });

    res.status(201).json(transaction);
  } catch (err) {
    console.error('Create transaction error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { amount, category, type, description, date } = req.body;

    const existing = await prisma.transaction.findUnique({ where: { id } });

    if (!existing) return res.status(404).json({ error: 'Transaction not found' });
    if (existing.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

    if (type && !['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'Type must be income or expense' });
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(category && { category }),
        ...(type && { type }),
        ...(description !== undefined && { description }),
        ...(date && { date: new Date(date) }),
      },
    });

    res.json(transaction);
  } catch (err) {
    console.error('Update transaction error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const existing = await prisma.transaction.findUnique({ where: { id } });

    if (!existing) return res.status(404).json({ error: 'Transaction not found' });
    if (existing.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

    await prisma.transaction.delete({ where: { id } });

    res.json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    console.error('Delete transaction error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getTransactions, createTransaction, updateTransaction, deleteTransaction };
