import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { sendAuthNotification } from "../config/mq.js";
const router = Router();

// GET /api/auth/me — check if user is logged in (reads JWT from cookie)
router.get("/me", (req, res) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ loggedIn: false, user: null });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey123');
        return res.status(200).json({ loggedIn: true, user: decoded });
    } catch (err) {
        return res.status(401).json({ loggedIn: false, user: null });
    }
});

// POST /api/auth/logout — clear the auth cookie
router.post("/logout", (req, res) => {
    res.clearCookie('token', { path: '/' });
    return res.status(200).json({ message: "Logged out successfully" });
});

router.get("/google", passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/', session: false }), async (req, res) => {
    try {
        const { id, displayName, emails, photos } = req.user;
        let user = await User.findOne({ googleId: id });
        if (!user) {
            user = new User({
                googleId: id,
                email: emails[0].value,
                name: displayName,
                avatar: photos[0].value
            });
            await user.save();
            await sendAuthNotification({
                type: 'USER_CREATED',
                data: { name: user.name, email: user.email, avatar: user.avatar },
                userId: user._id
            });
        } else {
            await sendAuthNotification({
                type: 'USER_LOGGED_IN',
                data: { name: user.name, email: user.email, avatar: user.avatar },
                userId: user._id
            });
        }
        const payload = {
            id: user._id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'supersecretkey123', {
            expiresIn: '7d'
        });
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.redirect(process.env.CLIENT_URL || 'http://localhost:5173/');
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});

export default router;