const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.get('/my-bookings', bookingController.getMyBookings);
router.post('/', bookingController.createBooking);

module.exports = router;