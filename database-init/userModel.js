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
    recMovies: {type: [Schema.Types.ObjectId], ref: "Movie"},
    userNotifications: [String],
    userReviews: [{
        "username": String, 
        "rating": Number, 
        "reviewSummary": String,
        "reviewText": String, 
        "movieName" : String, 
    }]
});

userSchema.query.byName = function(username){
    return this.where({username: new RegExp(username, "i")});
}

module.exports = mongoose.model("User", userSchema);