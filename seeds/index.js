const mongoose = require('mongoose');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', { useNewUrlParser: true, useUnifiedTopology: true, family: 4, useCreateIndex: true })
  .then(() => {
    console.log('mongoDBコネクションOK');
  })
  .catch(err => {
    console.log('mongoDBコネクションエラー');
    console.log(err);
  });

// 配列から1つの値をランダムに返す関数
const returnOneCampground = array => array[Math.floor(Math.random() * array.length)];

// ダミーのオブジェクトをdbに保存する関数
const seedDB = async () => {
  // dbをクリア
  await Campground.deleteMany({});
  // dbにオブジェクトを追加
  for (let i = 0; i < 50; i++) {
    const randomCityIndex = Math.floor(Math.random() * cities.length);
    const price = Math.floor(Math.random() * 2000) + 1000;
    const camp = new Campground({
      author: '64fdc1fbb42c4f4d24b020bb',
      title: `${returnOneCampground(descriptors)}・${returnOneCampground(places)}`,
      location: `${cities[randomCityIndex].prefecture}${cities[randomCityIndex].city}`,
      geometry: {
        type: 'Point',
        coordinates: [
          cities[randomCityIndex].longitude,
          cities[randomCityIndex].latitude
        ]
      },
      images: [
        {
          url: 'https://res.cloudinary.com/dx48fehf6/image/upload/v1694864182/yelpCamp/laf7tsieemt97kawpnwy.jpg',
          filename: 'yelpCamp/laf7tsieemt97kawpnwy'
        },
        {
          url: 'https://res.cloudinary.com/dx48fehf6/image/upload/v1694864182/yelpCamp/wse96sgcjr1blkjlljqo.jpg',
          filename: 'yelpCamp/wse96sgcjr1blkjlljqo'
        },
      ],
      description: '木曾路はすべて山の中である。あるところは岨づたいに行く崖の道であり、あるところは数十間の深さに臨む木曾川の岸であり、あるところは山の尾をめぐる谷の入り口である。一筋の街道はこの深い森林地帯を貫いていた。東ざかいの桜沢から、西の十曲峠まで、木曾十一宿はこの街道に添うて、二十二里余にわたる長い谿谷の間に散在していた。道路の位置も幾たびか改まったもので、古道はいつのまにか深い山間に埋もれた。',
      price
    });
    await camp.save();
  }
}

// ダミーのオブジェクトをdbに保存し終えたら、接続を解除
seedDB()
  .then(() => {
    mongoose.connection.close();
  });