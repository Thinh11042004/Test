const express = require('express');
const employeeController = require('../controllers/employeeController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', employeeController.list.bind(employeeController));
router.get('/:id', employeeController.get.bind(employeeController));
router.post('/', requireAuth, employeeController.create.bind(employeeController));
router.put('/:id', requireAuth, employeeController.update.bind(employeeController));
router.delete('/:id', requireAuth, employeeController.remove.bind(employeeController));
router.get('/:id/performance', employeeController.performance.bind(employeeController));

module.exports = router;