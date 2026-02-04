const Car = require('../models/Car');
const Booking = require('../models/Booking');

const getDashboard = async (req, res) => {
    try {
        const cars = await Car.find().sort({ createdAt: -1 });
        const bookings = await Booking.find().populate('userId').populate('carId').sort({ createdAt: -1 });
        
        const stats = {
            totalCars: cars.length,
            totalBookings: bookings.length,
            revenue: bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)
        };

        res.render('admin/dashboard', { cars, bookings, stats });
    } catch (error) {
        res.status(500).send("Lỗi: " + error.message);
    }
};

const getAddCarPage = (req, res) => {
    res.render('admin/car-form', { car: null }); 
};

const createCar = async (req, res) => {
    try {
        const newCar = new Car(req.body);
        await newCar.save();
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.status(500).send("Lỗi thêm xe: " + error.message);
    }
};

const getEditCarPage = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        res.render('admin/car-form', { car }); 
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const updateCar = async (req, res) => {
    try {
        await Car.findByIdAndUpdate(req.params.id, req.body);
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.status(500).send("Lỗi cập nhật: " + error.message);
    }
};

const deleteCar = async (req, res) => {
    try {
        await Car.findByIdAndDelete(req.params.id);
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.status(500).send("Lỗi xóa: " + error.message);
    }
};

module.exports = {
    getDashboard,
    getAddCarPage,
    createCar,
    getEditCarPage,
    updateCar,
    deleteCar
};