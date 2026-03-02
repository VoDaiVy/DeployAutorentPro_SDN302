const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { checkLogin } = require('../middleware/authMiddleware');

router.use(checkLogin);

router.get('/my-bookings', bookingController.getMyBookings);
router.post('/', bookingController.createBooking);
router.post('/cancel/:id', bookingController.cancelBooking);

module.exports = router;