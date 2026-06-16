const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const googleId = profile.id;

       
        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            name,
            email,
            googleId,
            role: 'buyer', 
          });
        } else if (!user.googleId) {
          user.googleId = googleId;
          await user.save();
        }
        const token = jwt.sign(
          { id: user._id, role: user.role },
          process.env.JWT_ACCESS_SECRET,
          { expiresIn: '15m' } 
        );
        return done(null, { user, token });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;