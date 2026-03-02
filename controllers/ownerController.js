const Car = require('../models/Car');
const Booking = require('../models/Booking');

const getDashboard = async (req, res) => {
    try {
        const userId = req.session.user._id;
        
        // Chỉ lấy xe của chủ này
        const cars = await Car.find({ ownerId: userId });
        const myCarIds = cars.map(car => car._id);
        
        // Chỉ lấy đơn hàng đặt xe của chủ này
        const bookings = await Booking.find({ carId: { $in: myCarIds } })
            .populate('userId')
            .populate('carId')
            .sort({ createdAt: -1 });
        
        // Thống kê riêng cho chủ xe
        const stats = {
            totalCars: cars.length,
            totalBookings: bookings.length,
            revenue: bookings.reduce((sum, b) => {
                if(b.status === 'CONFIRMED' || b.status === 'COMPLETED') return sum + (b.totalPrice || 0);
                return sum;
            }, 0),
            pendingCount: bookings.filter(b => b.status === 'PENDING').length
        };

        const recentBookings = bookings.slice(0, 5); // Lấy 5 đơn mới nhất

        res.render('owner/dashboard', { 
            cars, 
            recentBookings, 
            stats,
            currentPath: '/owner/dashboard'
        });

    } catch (error) {
        res.status(500).send("Lỗi Owner Dashboard: " + error.message);
    }
};

const getCars = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const cars = await Car.find({ ownerId: userId }).sort({ createdAt: -1 });
        res.render('owner/cars', { cars, currentPath: '/owner/cars' });
    } catch (error) {
        res.status(500).send("Lỗi: " + error.message);
    }
};

// 2. Hiển thị form thêm xe
const getAddCarPage = (req, res) => {
    res.render('owner/car-form', { car: null, currentPath: '/owner/cars' });
};

// 3. Xử lý thêm xe mới
const createCar = async (req, res) => {
    try {
        const carData = req.body;
        carData.ownerId = req.session.user._id; // Tự động gán xe này cho Owner đang đăng nhập
        carData.status = 'PENDING_APPROVAL'; 

        const newCar = new Car(carData);
        await newCar.save();
        res.redirect('/owner/cars');
    } catch (error) {
        res.status(500).send("Lỗi thêm xe: " + error.message);
    }
};

// 4. Hiển thị form sửa xe (Chỉ được sửa xe của mình)
const getEditCarPage = async (req, res) => {
    try {
        const car = await Car.findOne({ _id: req.params.id, ownerId: req.session.user._id });
        if (!car) return res.send('<script>alert("Xe không tồn tại hoặc bạn không có quyền!"); window.location.href="/owner/cars";</script>');
        res.render('owner/car-form', { car, currentPath: '/owner/cars' });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// 5. Xử lý cập nhật xe
const updateCar = async (req, res) => {
    try {
        await Car.findOneAndUpdate(
            { _id: req.params.id, ownerId: req.session.user._id },
            req.body
        );
        res.redirect('/owner/cars');
    } catch (error) {
        res.status(500).send("Lỗi cập nhật: " + error.message);
    }
};

// 6. Xử lý xóa xe
const deleteCar = async (req, res) => {
    try {
        await Car.findOneAndDelete({ _id: req.params.id, ownerId: req.session.user._id });
        res.redirect('/owner/cars');
    } catch (error) {
        res.status(500).send("Lỗi xóa xe: " + error.message);
    }
};

module.exports = { 
    getDashboard, 
    getCars, 
    getAddCarPage, 
    createCar, 
    getEditCarPage, 
    updateCar, 
    deleteCar 
};