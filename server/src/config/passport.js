import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 从Google profile中提取信息
        const googleId = profile.id;
        const email = profile.emails[0].value;
        const displayName = profile.displayName;
        const avatarUrl = profile.photos[0]?.value;

        // 首先通过Google ID查找用户
        let user = await User.findByGoogleId(googleId);

        if (user) {
          // 用户已存在，直接返回
          return done(null, user);
        }

        // 检查是否存在相同邮箱的用户
        user = await User.findByEmail(email);

        if (user) {
          // 用户存在但没有绑定Google账号，进行绑定
          await User.linkGoogleAccount(user.id, googleId);
          // 重新获取用户信息
          user = await User.findById(user.id);
          return done(null, user);
        }

        // 创建新用户
        const userId = await User.createFromGoogle({
          googleId,
          email,
          displayName,
          avatarUrl
        });

        // 获取新创建的用户信息
        user = await User.findById(userId);
        return done(null, user);

      } catch (error) {
        console.error('Google OAuth错误:', error);
        return done(error, null);
      }
    }
  )
);

// 序列化用户信息到session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// 从session反序列化用户信息
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
