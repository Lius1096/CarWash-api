const express = require ('express');
const { sendMessage } = require('../controllers/contactController');

const router = express.Router();

// Route POST /api/contact
router.post('/contact', sendMessage);

module.exports = router;
