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
        res.send('<script>alert("Đăng ký thành công! Hãy đăng nhập."); window.location.href="/users/login";</script>');
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
            return res.send('<script>alert("Sai mật khẩu!"); window.history.back();</script>');
        }
        
        req.session.user = user;

        if (user.role === 'ADMIN' || user.role === 'OWNER') {
            console.log('Admin logged in -> Redirecting to Dashboard'); 
            return res.redirect('/admin/dashboard');
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