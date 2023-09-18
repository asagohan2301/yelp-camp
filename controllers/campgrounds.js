const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary'); //自動的にindexを見てくれる
// mapbox
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxToken });

// 一覧 ----
module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
}

// 新規作成 ----
// フォーム
module.exports.renderNewForm = (req, res) => {
  res.render('campgrounds/new');
}
// DBに登録
module.exports.createCampground = async (req, res) => {
  // mapbox 
  const geoData = await geocoder.forwardGeocode({
    query: req.body.campground.location,
    limit: 1
  }).send();

  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.body.features[0].geometry;
  campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
  campground.author = req.user._id;
  console.log(campground);
  await campground.save();
  req.flash('success', '新しいキャンプ場を登録しました');
  res.redirect(`/campgrounds/${campground._id}`);
}

// 詳細 ----
module.exports.showCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate({
      path: 'reviews',
      populate: {
        path: 'author'
      }
    }).populate('author');
  // console.log(campground);
  if (!campground) {
    req.flash('error', 'キャンプ場は見つかりませんでした');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/show', { campground });
}

// 編集 ----
// フォーム
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash('error', 'キャンプ場は見つかりませんでした');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/edit', { campground });
}
// DBに登録
module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
  const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
  campground.images.push(...imgs);
  await campground.save();
  // 画像削除
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({ $pull: {images: {filename: {$in: req.body.deleteImages}}}});
  }
  req.flash('success', 'キャンプ場を編集しました');
  res.redirect(`/campgrounds/${campground._id}`);
}

// 削除 ----
module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash('success', 'キャンプ場を削除しました');
  res.redirect('/campgrounds');
}