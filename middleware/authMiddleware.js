const checkLogin = (req, res, next) => {
    if (!req.session.user) {
        return res.send('<script>alert("Vui lòng đăng nhập để tiếp tục!"); window.location.href="/?login=true";</script>');
    }
    next();
};

const checkAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'ADMIN') {
        return res.send('<script>alert("Chỉ Admin mới có quyền truy cập!"); window.location.href="/";</script>');
    }
    next();
};

const checkOwner = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'OWNER') {
        return res.send('<script>alert("Chỉ Chủ xe mới có quyền truy cập!"); window.location.href="/";</script>');
    }
    next();
};

module.exports = { checkLogin, checkAdmin, checkOwner };