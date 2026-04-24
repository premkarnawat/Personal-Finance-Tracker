const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate } = req.query;

    const where = { userId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const transactions = await prisma.transaction.findMany({ where });

    // Spending by category (expenses only)
    const categoryMap = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      });

    const spendingByCategory = Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount: parseFloat(amount.toFixed(2)),
    }));

    // Monthly income vs expenses
    const monthlyMap = {};
    transactions.forEach((t) => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap[key]) monthlyMap[key] = { month: key, income: 0, expense: 0 };
      monthlyMap[key][t.type] += t.amount;
    });

    const monthlyData = Object.values(monthlyMap)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((m) => ({
        month: m.month,
        income: parseFloat(m.income.toFixed(2)),
        expense: parseFloat(m.expense.toFixed(2)),
      }));

    // Summary totals
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const savingsRate =
      totalIncome > 0
        ? parseFloat((((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(2))
        : 0;

    res.json({
      spendingByCategory,
      monthlyData,
      summary: {
        totalIncome: parseFloat(totalIncome.toFixed(2)),
        totalExpenses: parseFloat(totalExpenses.toFixed(2)),
        netSavings: parseFloat((totalIncome - totalExpenses).toFixed(2)),
        savingsRate,
        transactionCount: transactions.length,
      },
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getAnalytics };
