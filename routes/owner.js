const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const { checkOwner } = require('../middleware/authMiddleware');

router.use(checkOwner);

router.get('/dashboard', ownerController.getDashboard);

router.get('/cars', ownerController.getCars);
router.get('/cars/add', ownerController.getAddCarPage);
router.post('/cars/add', ownerController.createCar);
router.get('/cars/edit/:id', ownerController.getEditCarPage);
router.post('/cars/edit/:id', ownerController.updateCar);
router.get('/cars/delete/:id', ownerController.deleteCar);

module.exports = router;