const Car = require('../models/Car');
const Booking = require('../models/Booking');

// === 1. GET DASHBOARD (CÓ PHÂN QUYỀN) ===
const getDashboard = async (req, res) => {
    try {
        const user = req.session.user;
        
        // Phân quyền lấy Xe: OWNER chỉ lấy xe của mình, ADMIN lấy hết
        const carQuery = user.role === 'OWNER' ? { ownerId: user._id } : {};
        const cars = await Car.find(carQuery);
        
        // Lấy danh sách ID xe thuộc quyền quản lý để lọc Đơn hàng
        const myCarIds = cars.map(car => car._id);
        
        // Phân quyền lấy Đơn hàng
        const bookingQuery = user.role === 'OWNER' ? { carId: { $in: myCarIds } } : {};
        const bookings = await Booking.find(bookingQuery).populate('userId').populate('carId');
        
        // [THÊM MỚI] Lấy danh sách xe đang chờ duyệt (Chỉ Admin mới cần quan tâm)
        let pendingCars = [];
        if (user.role === 'ADMIN') {
            pendingCars = await Car.find({ status: 'PENDING_APPROVAL' }).populate('ownerId');
        }
        
        // Thống kê
        const stats = {
            totalCars: cars.length,
            totalBookings: bookings.length,
            revenue: bookings.reduce((sum, b) => {
                if(b.status === 'CONFIRMED' || b.status === 'COMPLETED') {
                    return sum + (b.totalPrice || 0);
                }
                return sum;
            }, 0),
            pendingCount: bookings.filter(b => b.status === 'PENDING').length
        };

        // Lấy 5 đơn hàng mới nhất
        const recentBookings = await Booking.find(bookingQuery)
            .populate('userId')
            .populate('carId')
            .sort({ createdAt: -1 })
            .limit(5);

        res.render('admin/dashboard', { 
            cars, 
            recentBookings, 
            pendingCars, // [THÊM MỚI] Trả biến này ra View để hiển thị bảng duyệt xe
            stats,
            currentPath: '/admin/dashboard'
        });

    } catch (error) {
        res.status(500).send("Lỗi: " + error.message);
    }
};

// === 2. QUẢN LÝ XE (THÊM, SỬA, XÓA) ===
const getAddCarPage = (req, res) => { 
    res.render('admin/car-form', { car: null }); 
};

const createCar = async (req, res) => { 
    try {
        const carData = req.body;
        // Bắt buộc: Gán xe mới tạo cho người đang đăng nhập (Admin hoặc Owner)
        carData.ownerId = req.session.user._id; 

        // Nếu Admin tự thêm xe thì duyệt luôn (AVAILABLE), nếu không thì PENDING_APPROVAL
        carData.status = req.session.user.role === 'ADMIN' ? 'AVAILABLE' : 'PENDING_APPROVAL';

        const newCar = new Car(carData); 
        await newCar.save(); 
        res.redirect('/admin/dashboard'); 
    } catch (error) {
        res.status(500).send("Lỗi thêm xe: " + error.message);
    }
};

const getEditCarPage = async (req, res) => { 
    try {
        const car = await Car.findById(req.params.id); 
        // BẢO MẬT: Nếu là OWNER, chỉ được sửa xe của chính mình
        if (req.session.user.role === 'OWNER' && car.ownerId.toString() !== req.session.user._id) {
            return res.send('<script>alert("Bạn không có quyền sửa xe này!"); window.location.href="/admin/dashboard";</script>');
        }
        res.render('admin/car-form', { car }); 
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const updateCar = async (req, res) => { 
    try {
        const car = await Car.findById(req.params.id);
        if (req.session.user.role === 'OWNER' && car.ownerId.toString() !== req.session.user._id) {
            return res.send('<script>alert("Lỗi quyền truy cập!"); window.location.href="/admin/dashboard";</script>');
        }
        await Car.findByIdAndUpdate(req.params.id, req.body); 
        res.redirect('/admin/dashboard'); 
    } catch (error) {
        res.status(500).send("Lỗi cập nhật: " + error.message);
    }
};

const deleteCar = async (req, res) => { 
    try {
        const car = await Car.findById(req.params.id);
        if (req.session.user.role === 'OWNER' && car.ownerId.toString() !== req.session.user._id) {
            return res.send('<script>alert("Lỗi quyền truy cập!"); window.location.href="/admin/dashboard";</script>');
        }
        await Car.findByIdAndDelete(req.params.id); 
        res.redirect('/admin/dashboard'); 
    } catch (error) {
        res.status(500).send("Lỗi xóa xe: " + error.message);
    }
};

// === [THÊM MỚI] HÀM DUYỆT XE CỦA ADMIN ===
const approveCar = async (req, res) => {
    try {
        // Chuyển trạng thái xe thành Sẵn sàng (AVAILABLE)
        await Car.findByIdAndUpdate(req.params.id, { status: 'AVAILABLE' });
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.status(500).send('Lỗi duyệt xe: ' + error.message);
    }
};

// === 3. QUẢN LÝ ĐƠN HÀNG (CÓ PHÂN QUYỀN & PHÂN TRANG) ===
const getBookings = async (req, res) => {
    try {
        const user = req.session.user;
        let bookingQuery = {};

        // Phân quyền: Lọc đơn hàng theo xe của OWNER
        if (user.role === 'OWNER') {
            const myCars = await Car.find({ ownerId: user._id });
            const myCarIds = myCars.map(car => car._id);
            bookingQuery = { carId: { $in: myCarIds } };
        }

        const PAGE_SIZE = 10; 
        const page = parseInt(req.query.page) || 1; 
        const skip = (page - 1) * PAGE_SIZE;

        const totalBookings = await Booking.countDocuments(bookingQuery);
        const totalPages = Math.ceil(totalBookings / PAGE_SIZE);

        const bookings = await Booking.find(bookingQuery)
            .populate('userId')
            .populate('carId')
            .sort({ createdAt: -1 }) 
            .skip(skip)
            .limit(PAGE_SIZE);

        res.render('admin/bookings', { 
            bookings,
            currentPage: page,
            totalPages
        });

    } catch (error) {
        res.status(500).send('Lỗi lấy danh sách: ' + error.message);
    }
};

const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 

        const booking = await Booking.findById(id);
        if (!booking) return res.status(404).send('Không tìm thấy đơn!');

        // Phân quyền: Kiểm tra xem đơn này có đặt xe của OWNER đang thao tác không
        if (req.session.user.role === 'OWNER') {
            const car = await Car.findById(booking.carId);
            if (car && car.ownerId.toString() !== req.session.user._id) {
                return res.send('<script>alert("Bạn không có quyền duyệt đơn này!"); window.history.back();</script>');
            }
        }

        booking.status = status;
        await booking.save();

        if (status === 'CONFIRMED') {
            await Car.findByIdAndUpdate(booking.carId, { status: 'RENTED' });
        } 
        else if (status === 'COMPLETED' || status === 'CANCELLED' || status === 'REJECTED') {
            await Car.findByIdAndUpdate(booking.carId, { status: 'AVAILABLE' });
        }

        res.redirect('/admin/bookings');
    } catch (error) {
        res.status(500).send('Lỗi cập nhật: ' + error.message);
    }
};

const rejectCar = async (req, res) => {
    try {
        await Car.findByIdAndDelete(req.params.id);
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.status(500).send('Lỗi từ chối xe: ' + error.message);
    }
};

// Lấy toàn bộ danh sách xe cho trang Quản lý xe của Admin
const getCars = async (req, res) => {
    try {
        const cars = await Car.find().populate('ownerId').sort({ createdAt: -1 });
        res.render('admin/cars', { cars, currentPath: '/admin/cars' });
    } catch (error) {
        res.status(500).send("Lỗi: " + error.message);
    }
};

module.exports = {
    getDashboard,
    getAddCarPage,
    createCar,
    getEditCarPage,
    updateCar,
    deleteCar,
    approveCar,
    rejectCar, 
    getCars,
    getBookings,
    updateBookingStatus
};