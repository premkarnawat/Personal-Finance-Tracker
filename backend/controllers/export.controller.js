const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const exportCSV = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate, category, type } = req.query;

    const where = { userId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    if (category) where.category = category;
    if (type) where.type = type;

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    const headers = ['ID', 'Date', 'Type', 'Category', 'Amount', 'Description', 'Created At'];
    const rows = transactions.map((t) => [
      t.id,
      new Date(t.date).toISOString().split('T')[0],
      t.type,
      t.category,
      t.amount.toFixed(2),
      t.description ? `"${t.description.replace(/"/g, '""')}"` : '',
      new Date(t.createdAt).toISOString(),
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="transactions-${new Date().toISOString().split('T')[0]}.csv"`
    );
    res.send(csv);
  } catch (err) {
    console.error('Export CSV error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { exportCSV };
