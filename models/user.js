const mongoose = require('mongoose');
const { Schema } = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
  // ユーザー名 & ハッシュ化されたパスワード & ソルト値 は、passport-local-mongooseが自動で作ってくれる
  email: {
    type: String,
    required: true,
    unique: true
  }
});

// passport-local-mongoose との連携
// pluginメソッドを使って、passport-local-mongoose の機能を userSchema に組み込む
userSchema.plugin(passportLocalMongoose, {
  errorMessages: {
    UserExistsError: 'そのユーザー名はすでに使われています。',
    MissingPasswordError: 'パスワードを入力してください。',
    AttemptTooSoonError: 'アカウントがロックされてます。時間をあけて再度試してください。',
    TooManyAttemptsError: 'ログインの失敗が続いたため、アカウントをロックしました。',
    NoSaltValueStoredError: '認証ができませんでした。',
    IncorrectPasswordError: 'パスワードまたはユーザー名が間違っています。',
    IncorrectUsernameError: 'パスワードまたはユーザー名が間違っています。',
  }
});

module.exports = mongoose.model('User', userSchema);