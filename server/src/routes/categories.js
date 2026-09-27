const router = require('express').Router();
const ctrl = require('../controllers/categoriesController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

router.get('/', ctrl.list);
router.post('/', requireAuth, requireRole('admin'), ctrl.create);
router.put('/:id', requireAuth, requireRole('admin'), ctrl.update);
router.delete('/:id', requireAuth, requireRole('admin'), ctrl.remove);

module.exports = router;
