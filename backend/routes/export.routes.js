const express = require('express');
const router = express.Router();
const { exportCSV } = require('../controllers/export.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate);
router.get('/csv', exportCSV);

module.exports = router;
