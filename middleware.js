const { campgroundSchema, reviewSchema } = require('./schemas');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

// ログインのチェック
module.exports.isLoggedIn = (req, res, next) => {
  if(!req.isAuthenticated()) {
    // もともとリクエストした場所を保存しておく
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'ログインしてください');
    return res.redirect('/login');
  }
  next();
}

// キャンプグラウンドのバリデーション
module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(detail => detail.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
}

// 更新や削除をする前に、そのcampgroundを作った人が、リクエストしている人と同じかどうかをチェック
module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash('error', 'そのアクションの権限がありません');
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
}

// 削除をする前に、そのreviewを投稿した人が、リクエストしている人と同じかどうかをチェック
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash('error', 'そのアクションの権限がありません');
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
}

// レビューのバリデーション
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(detail => detail.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
}