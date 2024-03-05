const jwt = require('jsonwebtoken');

const JWT_SECRET = "03guAqathDv03AQiuGRSM1SZ9bTNz9xe9eKQGAJUSLHXSHNW2fL8Tqa1MWGKathARE"

const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');

        const decoded = jwt.verify(token, JWT_SECRET)
        if (!decoded) {
            throw new Error();
        }
        req.user = decoded;
        req.url = req.protocol + '://' + req.get('host');
        next()
    } catch (error) {
        res.status(403).send({ success: false, message: 'Unauthorized access!!' })
    }
}

module.exports = authenticate