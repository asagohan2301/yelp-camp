const express = require('express');
const router = express.Router({ mergeParams: true });
const reviews = require('../controllers/reviews');
const { isLoggedIn, isReviewAuthor, validateReview } = require('../middleware');
const catchAsync = require('../utils/catchAsync');

// 新規作成 ----
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

// 削除 ----
/*
isLoggedInで、ログインしていない人が削除しようとしたときの処理
isReviewAuthorで、ログインしているけど、コメント投稿者とは違う人が削除しようとしたときの処理
を実装している
*/
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;