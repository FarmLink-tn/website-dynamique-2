const express = require('express');
const { sendMessage, getHistory } = require('../controllers/chatController');
const router = express.Router();

router.post('/send', sendMessage);
router.get('/history/:userId', getHistory);

module.exports = router;
