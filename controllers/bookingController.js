const Booking = require("../models/Booking");
const Car = require("../models/Car");

const createBooking = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.send(
        '<script>alert("Vui lòng đăng nhập!"); window.location.href="/users/login";</script>',
      );
    }

    const { carId, startDate, endDate, rentalType } = req.body;
    const userId = req.session.user._id;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    // Validate thời gian
    if (start < now) {
      return res.send(
        '<script>alert("Lỗi: Thời gian nhận xe không được ở quá khứ!"); window.history.back();</script>',
      );
    }
    if (end <= start) {
      return res.send(
        '<script>alert("Lỗi: Thời gian trả phải sau thời gian nhận!"); window.history.back();</script>',
      );
    }

    const diffMs = end - start;
    const oneHourMs = 1000 * 60 * 60;

    if (diffMs < oneHourMs) {
      return res.send(
        '<script>alert("Lỗi: Thời gian thuê tối thiểu phải là 1 tiếng!"); window.history.back();</script>',
      );
    }

    // Kiểm tra lịch trùng (Tính cả đơn Đã duyệt và Đang chờ duyệt để giữ chỗ)
    const overlapBooking = await Booking.findOne({
      carId: carId,
      status: { $in: ["CONFIRMED", "PENDING"] },
      $or: [{ startDate: { $lte: end }, endDate: { $gte: start } }],
    });

    if (overlapBooking) {
      return res.send(
        '<script>alert("Xe đã bận (hoặc đang chờ duyệt) trong khung giờ này! Vui lòng chọn giờ khác."); window.history.back();</script>',
      );
    }

    const car = await Car.findById(carId);
    if (!car) return res.send("Xe không tồn tại");

    // Tính tiền
    let totalPrice = 0;
    if (rentalType === "hourly") {
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
      status: "PENDING", 
    });

    res.send(
      '<script>alert("Gửi yêu cầu thành công! Vui lòng chờ Admin duyệt."); window.location.href="/bookings/my-bookings";</script>',
    );
  } catch (error) {
    res.status(500).send("Lỗi server: " + error.message);
  }
};

const getMyBookings = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect("/");

    const bookings = await Booking.find({ userId: req.session.user._id })
      .populate("carId")
      .sort({ createdAt: -1 });

    res.render("bookings/my-bookings", { bookings });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const cancelBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.session.user._id;

        const booking = await Booking.findOne({ _id: bookingId, userId: userId });
        if (!booking) {
            return res.send('<script>alert("Không tìm thấy đơn!"); window.history.back();</script>');
        }

        if (booking.status !== 'PENDING') {
            return res.send('<script>alert("Chỉ có thể hủy đơn đang chờ duyệt!"); window.history.back();</script>');
        }

        booking.status = 'CANCELLED';
        await booking.save();

        res.redirect('/bookings/my-bookings');
    } catch (error) {
        res.status(500).send("Lỗi: " + error.message);
    }
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
};
