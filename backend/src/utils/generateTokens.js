const jwt = require('jsonwebtoken');

const generateAccessToken = (userId,role) => {
    return jwt.sign(
        {id : userId,role},
        process.env.JWT_ACCESS_SECRET,
        {expiresIn : '15m'}
    );
};

const generateRefreshToken = (userId) => {
    return jwt.sign(
        {userId},
        process.env.JWT_REFRESH_SECRET,
        {expiresIn : '7d'}
    );
};

const sendTokens = (res,user,statusCode,message) => {
    const accessToken = generateAccessToken(user._id,user.role);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie('refreshToken' , refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(statusCode).json({
        success: true,
        message,
        accessToken,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
};

module.exports = { generateAccessToken, generateRefreshToken, sendTokens};