const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Google OAuth 2.0 Strategy - FAIL if not configured
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET ||
    GOOGLE_CLIENT_ID === 'placeholder_client_id' ||
    GOOGLE_CLIENT_SECRET === 'placeholder_client_secret') {
    console.error('❌ FATAL: Google OAuth 2.0 is not properly configured');
    console.error('🔧 Required environment variables:');
    console.error('   - GOOGLE_CLIENT_ID (currently:', GOOGLE_CLIENT_ID || 'undefined', ')');
    console.error('   - GOOGLE_CLIENT_SECRET (currently:', GOOGLE_CLIENT_SECRET || 'undefined', ')');
    console.error('📝 Get these from: https://console.developers.google.com/');
    process.exit(1); // Exit the application - no fallback
}

console.log('✅ Google OAuth configured successfully');

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists with this Google ID
        let existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
            return done(null, existingUser);
        }

        // Check if user exists with same email
        existingUser = await User.findOne({ email: profile.emails[0].value });

        if (existingUser) {
            // Link Google account to existing user
            existingUser.googleId = profile.id;
            existingUser.avatar = profile.photos[0].value;
            await existingUser.save();
            return done(null, existingUser);
        }

        // Create new user
        const newUser = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
            provider: 'google',
            emailVerified: true // Google emails are already verified
        });

        return done(null, newUser);

    } catch (error) {
        console.error('Google OAuth Error:', error);
        return done(error, null);
    }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;