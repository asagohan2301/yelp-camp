const Campground = require('../models/campground');
const Review = require('../models/review');

// 新規作成 ----
module.exports.createReview = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash('success', 'レビューを投稿しました');
  res.redirect(`/campgrounds/${campground._id}`);
}

// 削除 ----
module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash('success', 'レビューを削除しました');
  res.redirect(`/campgrounds/${id}`);
}