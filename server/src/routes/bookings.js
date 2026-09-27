const router = require('express').Router();
const ctrl = require('../controllers/bookingsController');
const reviewsCtrl = require('../controllers/reviewsController');
const { requireAuth } = require('../middleware/auth');

router.post('/', requireAuth, ctrl.create);
router.get('/mine', requireAuth, ctrl.mine);
router.get('/incoming', requireAuth, ctrl.incoming);
router.get('/:id', requireAuth, ctrl.getOne);
router.put('/:id', requireAuth, ctrl.update);
router.delete('/:id', requireAuth, ctrl.remove);
router.patch('/:id/status', requireAuth, ctrl.changeStatus);
router.post('/:id/reviews', requireAuth, reviewsCtrl.create);

module.exports = router;
