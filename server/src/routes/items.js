const router = require('express').Router();
const ctrl = require('../controllers/itemsController');
const { requireAuth } = require('../middleware/auth');

router.get('/', ctrl.list);
router.get('/mine', requireAuth, ctrl.mine);
router.get('/:id/availability', ctrl.availability);
router.get('/:id', ctrl.getOne);
router.post('/', requireAuth, ctrl.create);
router.put('/:id', requireAuth, ctrl.update);
router.delete('/:id', requireAuth, ctrl.remove);

module.exports = router;
