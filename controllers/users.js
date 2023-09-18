const User = require('../models/user');

// ユーザー登録 ----
// フォーム
module.exports.renderRegister = (req, res) => {
  res.render('users/register');
}
// DBに登録
module.exports.register = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const resisteredUser = await User.register(user, password);
    req.login(resisteredUser, err => {
      if(err) return next(err);
      req.flash('success', 'Yelp Campへようこそ!');
      res.redirect('/campgrounds');
    });
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/register');
  }
}

// ログイン ----
// フォーム
module.exports.renderLogin = (req, res) => {
  res.render('users/login');
}
// ログイン処理
module.exports.login = (req, res) => {
  // ミドルウェア(passport.authenticate)の処理によって、この{}内に入っているときにはすでにユーザーの認証が終わっている
  req.flash('success', 'おかえりなさい');
  const redirectUrl = req.session.returnTo || '/campgrounds';
  delete req.session.returnTo;
  res.redirect(redirectUrl);
}

// ログアウト ----
module.exports.logout = (req, res) => {
  req.logout(() => {
    req.flash('success', 'ログアウトしました');
    res.redirect('/campgrounds');
  });
}