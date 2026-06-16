const jwt = require('jsonwebtoken');

const protect = (req,res,next) => {
    try{
        let token;

       if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
       } 
       if(!token){
        return res.status(401).json({
            success: false,
            message: 'Access denied. Please login.',
        });
       }
       const decoded = jwt.verify(token,process.env.JWT_ACCESS_SECRET);
       req.user = decoded;
       next();
    } catch(error){
        if(error.name === 'TokenExpiredError'){
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please refresh.',
                code: 'TOKEN_EXPIRED',
            });
        }
        res.status(401).json({ success:false,message:'Invalid token.'});
    }
};

module.exports = {protect};