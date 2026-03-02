const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

const { checkAdmin } = require('../middleware/authMiddleware');

router.use(checkAdmin);

router.get('/dashboard', adminController.getDashboard);

router.get('/cars', adminController.getCars);                    
router.post('/cars/approve/:id', adminController.approveCar);    
router.post('/cars/reject/:id', adminController.rejectCar);    

router.get('/cars/add', adminController.getAddCarPage);
router.post('/cars/add', adminController.createCar);
router.get('/cars/edit/:id', adminController.getEditCarPage);
router.post('/cars/edit/:id', adminController.updateCar);
router.get('/cars/delete/:id', adminController.deleteCar);

router.get('/bookings', adminController.getBookings);   
router.post('/bookings/:id', adminController.updateBookingStatus);

module.exports = router;