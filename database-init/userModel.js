const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let userSchema = Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    contributingAccount: {type: Boolean, required: true},
    followingPeople: [Schema.Types.ObjectId],
    followingUsers: [Schema.Types.ObjectId],
    followers: [Schema.Types.ObjectId],
    watchList: [Schema.Types.ObjectId],
    viewRecMovies: [Schema.Types.ObjectId],
    userNotifications: [Schema.Types.ObjectId],
    userReviews: [Schema.Types.ObjectId]
});

module.exports = mongoose.model("Movie", userSchema);