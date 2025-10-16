const express = require('express');
const { getUserModules, createModule, updateModule } = require('../controllers/moduleController');
const router = express.Router();

router.get('/user/:userId', getUserModules);
router.post('/create', createModule);
router.put('/update/:moduleId', updateModule);

module.exports = router;
