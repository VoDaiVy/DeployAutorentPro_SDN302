const checkAdminOrOwner = (req, res, next) => {
    if (!req.session.user || (req.session.user.role !== 'ADMIN' && req.session.user.role !== 'OWNER')) {
        return res.send('<script>alert("Bạn không có quyền truy cập trang này!"); window.location.href="/";</script>');
    }
    next();
};

module.exports = { checkAdminOrOwner };