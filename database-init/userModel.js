const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let userSchema = Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    contributingAccount: {type: Boolean, required: true},
    followingPeople: {type: [Schema.Types.ObjectId], ref: "Person"},
    followingUsers: {type: [Schema.Types.ObjectId], ref: "User"},
    followers: {type: [Schema.Types.ObjectId], ref: "User"},
    watchList: {type: [Schema.Types.ObjectId], ref: "Movie"},
    viewRecMovies: {type: [Schema.Types.ObjectId], ref: "Movie"},
    userNotifications: String,
    userReviews: [{
        "username": String, 
        "rating": Number, 
        "reviewSummary": String,
        "reviewText": String
    }]
});

module.exports = mongoose.model("User", userSchema);