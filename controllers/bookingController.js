const Booking = require('../models/Booking');
const Car = require('../models/Car');

const createBooking = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.send('<script>alert("Vui lòng đăng nhập!"); window.location.href="/users/login";</script>');
        }

        const { carId, startDate, endDate, rentalType } = req.body;
        const userId = req.session.user._id;

        const start = new Date(startDate);
        const end = new Date(endDate);
        const now = new Date();

        if (start < now) {
            return res.send('<script>alert("Lỗi: Thời gian nhận xe không được ở trước hiện tại!"); window.history.back();</script>');
        }
        if (end <= start) {
            return res.send('<script>alert("Lỗi: Thời gian trả phải sau thời gian nhận!"); window.history.back();</script>');
        }

        const diffMs = end - start;
        const oneHourMs = 1000 * 60 * 60;
        
        if (diffMs < oneHourMs) {
             return res.send('<script>alert("Lỗi: Thời gian thuê tối thiểu phải là 1 tiếng!"); window.history.back();</script>');
        }

        const overlapBooking = await Booking.findOne({
            carId: carId,
            status: { $in: ['CONFIRMED', 'PENDING'] },
            $or: [
                { startDate: { $lte: end }, endDate: { $gte: start } }
            ]
        });

        if (overlapBooking) {
            return res.send('<script>alert("Xe đã bận trong khung giờ này! Vui lòng chọn giờ khác."); window.history.back();</script>');
        }

        const car = await Car.findById(carId);
        if (!car) return res.send("Xe không tồn tại");

        let totalPrice = 0;

        if (rentalType === 'hourly') {
            const hours = Math.ceil(diffMs / (1000 * 60 * 30)) / 2;
            totalPrice = hours * car.pricePerHour;
        } else {
            const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            totalPrice = days * car.pricePerDay;
        }

        await Booking.create({
            userId,
            carId,
            startDate,
            endDate,
            totalPrice,
            status: 'CONFIRMED'
        });

        res.send('<script>alert("Đặt xe thành công!"); window.location.href="/bookings/my-bookings";</script>');

    } catch (error) {
        res.status(500).send("Lỗi server: " + error.message);
    }
};

const getMyBookings = async (req, res) => {
    try {
        if (!req.session.user) return res.redirect('/');
        
        const bookings = await Booking.find({ userId: req.session.user._id })
                                      .populate('carId') 
                                      .sort({ createdAt: -1 });

        res.render('bookings/my-bookings', { bookings });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

module.exports = {
    createBooking,
    getMyBookings
};