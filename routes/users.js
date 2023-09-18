const express = require('express');
const router = express.Router();
const users = require('../controllers/users');
const passport = require('passport');

// ユーザー登録 ----
router.route('/register')
  // フォーム
  .get(users.renderRegister)
  // DBに登録
  .post(users.register);

// ログイン ----
router.route('/login')
  // フォーム
  .get(users.renderLogin)
  // ログイン処理
  .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }), users.login);

// ログアウト ----
router.get('/logout', users.logout);

module.exports = router;