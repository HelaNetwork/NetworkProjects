module.exports = function (req, res, next) {
    if (req.user.role !== 'hr') {
        return res.status(403).json({ msg: 'Access denied. HR role required.' });
    }
    next();
};
