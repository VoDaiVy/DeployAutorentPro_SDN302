const Car = require('../models/Car');

const getCarsPage = async (req, res) => {
    try {
        const cars = await Car.find({ status: { $in: ['AVAILABLE', 'MAINTENANCE'] } });
        res.render('cars/list', { cars });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const getCarDetailPage = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).send("Car not found");
        }
        res.render('cars/detail', { car });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

module.exports = {
    getCarsPage,
    getCarDetailPage
};