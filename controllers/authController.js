const User = require('../models/User');
const bcrypt = require('bcryptjs');

const getRegisterPage = (req, res) => {
    res.render('users/register');
};

const getLoginPage = (req, res) => {
    res.render('users/login');
};

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.send('<script>alert("Email này đã được sử dụng!"); window.history.back();</script>');
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await User.create({ name, email, password: hashedPassword });
        res.send(`
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Chuyển hướng...</title>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
                <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
                <style>
                    body { font-family: 'Poppins', sans-serif; background-color: #f8f9fa; }
                    /* Chỉnh màu nút bấm cho hợp tông Vàng/Đen của web */
                    .swal2-confirm { border-radius: 50rem !important; font-weight: bold !important; padding: 10px 30px !important; }
                </style>
            </head>
            <body>
                <script>
                    Swal.fire({
                        title: 'Chào mừng thành viên mới!',
                        text: 'Bạn đã đăng ký tài khoản thành công.',
                        icon: 'success',
                        iconColor: '#ffc107',
                        confirmButtonText: 'Đăng nhập ngay',
                        confirmButtonColor: '#111111' // Nút màu đen giống giao diện
                    }).then((result) => {
                        // Chờ người dùng bấm nút OK rồi mới chuyển hướng để bật Modal
                        window.location.href = "/?login=true";
                    });
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        res.status(500).send('Lỗi đăng ký: ' + error.message);
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.send('<script>alert("Email không tồn tại!"); window.history.back();</script>');
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.send(`
            <html>
            <head><script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script></head>
            <body>
                <script>
                    Swal.fire({
                        title: 'Lỗi đăng nhập!',
                        text: 'Mật khẩu của bạn không chính xác.',
                        icon: 'error',
                        confirmButtonColor: '#dc3545'
                    }).then(() => { window.history.back(); });
                </script>
            </body>
            </html>
        `);
        }
        
        req.session.user = user;

        if (user.role === 'ADMIN') {
            return res.redirect('/admin/dashboard');
        } else if (user.role === 'OWNER') {
            return res.redirect('/owner/dashboard');
        }
        
        res.redirect('/');

    } catch (error) {
        res.status(500).send('Lỗi đăng nhập: ' + error.message);
    }
};

const logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};

module.exports = { 
    getRegisterPage, 
    getLoginPage, 
    register, 
    login, 
    logout 
};