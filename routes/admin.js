const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { checkAdminOrOwner } = require('../middleware/authMiddleware');

router.use(checkAdminOrOwner);

router.get('/dashboard', adminController.getDashboard);

router.get('/cars/add', adminController.getAddCarPage);
router.post('/cars/add', adminController.createCar);

router.get('/cars/edit/:id', adminController.getEditCarPage);
router.post('/cars/edit/:id', adminController.updateCar);

router.get('/cars/delete/:id', adminController.deleteCar);

module.exports = router;