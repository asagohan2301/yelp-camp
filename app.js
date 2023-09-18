if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');

const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');

const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user');

// セキュリティ関連
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

// ルーター
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

const MongoStore = require('connect-mongo');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    family: 4,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log('mongoDBコネクションOK');
  })
  .catch(err => {
    console.log('mongoDBコネクションエラー');
    console.log(err);
  });

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ミドルウェア ----------------

// フォームで送られてきたデータをパースできるようにする
app.use(express.urlencoded({ extended: true }));

// ミドルウェア設定 override with POST having ?_method=DELETE
app.use(methodOverride('_method'))

// 公開するディレクトリを設定
app.use(express.static(path.join(__dirname, 'public')));

// monogoDBインジェクション対策用
app.use(mongoSanitize({
  replaceWith: '_',
}));

const secret = process.env.SECRET || 'mysecret';

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret
  },
  touchAfter: 24 * 3600 // time period in seconds
});

store.on('error', e => {
  console.log('セッションストアエラー', e);
});

// セッション
const sessionConfig = {
  store,
  name: 'session',
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
      httpOnly: true,
      // secure: true,
      maxAge: 1000 * 60 * 60 * 24 * 7
  }
};
app.use(session(sessionConfig));

// passport
app.use(passport.initialize());
app.use(passport.session());
// パスポートに対して、localStrategy というログインの方法を使うことを宣言
// また認証では User.authenticate(passport-local-mongooseが自動で追加したスタティックメソッド) という方法を使うことを宣言
passport.use(new localStrategy(User.authenticate()));
// セッションの中にユーザーの情報をどうやって入れるか(取り出すか)を指定
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// フラッシュ
app.use(flash());

app.use(helmet());

const scriptSrcUrls = [
  'https://api.mapbox.com',
  'https://cdn.jsdelivr.net'
];
const styleSrcUrls = [
  'https://api.mapbox.com',
  'https://cdn.jsdelivr.net'
];
const connectSrcUrls = [
  'https://api.mapbox.com',
  'https://*.tiles.mapbox.com',
  'https://events.mapbox.com'
];
const fontSrcUrls = [];
const imgSrcUrls = [
  `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`,
  'https://images.unsplash.com'
];

app.use(helmet.contentSecurityPolicy({
  directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["blob:"],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:', ...imgSrcUrls],
      fontSrc: ["'self'", ...fontSrcUrls]
  }
}));

// locals
app.use((req, res, next) => {
  // ユーザー情報
  res.locals.currentUser = req.user;
  // フラッシュ
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// ルーティング ----------------
// ホーム ----
app.get('/', (req, res) => {
  res.render('home');
});

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

// エラーハンドル ----------------
// GETやPUTなど全てのリクエストで、今までのルーティングに当てはまらないパス全て
// てことかな?
app.all('*', (req, res, next) => {
  // 次のエラーハンドルにまかせる
  next(new ExpressError('ページが見つかりませんでした', 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) {
    err.message = '問題が起きました';
  }
  res.status(statusCode).render('error', { err });
});

// 接続 ----------------
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`ポート${port}でリクエスト待ち受け中...`);
});