const express = require('express');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const InstagramStrategy = require('passport-instagram').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Configuração do Passport para Facebook
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: `${process.env.CALLBACK_URL}/facebook`
  },
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }
));

// Configuração do Passport para Instagram
passport.use(new InstagramStrategy({
    clientID: process.env.INSTAGRAM_CLIENT_ID,
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
    callbackURL: `${process.env.CALLBACK_URL}/instagram`
  },
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }
));

// Configuração do Passport para Google (Gmail)
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.CALLBACK_URL}/google`
  },
  (token, tokenSecret, profile, done) => {
    return done(null, profile);
  }
));

// Configuração de sessão
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Rotas de autenticação
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/instagram', passport.authenticate('instagram'));
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Rotas de callback
app.get('/auth/callback/facebook', passport.authenticate('facebook', {
    successRedirect: '/profile',
    failureRedirect: '/'
}));

app.get('/auth/callback/instagram', passport.authenticate('instagram', {
    successRedirect: '/profile',
    failureRedirect: '/'
}));

app.get('/auth/callback/google', passport.authenticate('google', {
    successRedirect: '/profile',
    failureRedirect: '/'
}));

// Rota para exibir o perfil do usuário autenticado
app.get('/profile', (req, res) => {
    if (!req.user) {
        res.redirect('/');
    } else {
        res.send(`Bem-vindo, ${req.user.displayName}!`);
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});


