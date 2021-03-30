const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let personSchema = Schema({
    name: String,
    directed: {type: [Schema.Types.ObjectId], ref: "Movie"},
    written: {type: [Schema.Types.ObjectId], ref: "Movie"},
    acted: {type: [Schema.Types.ObjectId], ref: "Movie"},
    freqCollaborators: {type: [Schema.Types.ObjectId], ref: "People"},
    followers: {type: [Schema.Types.ObjectId], ref: "User"}
});

personSchema.query.byName = function(name){
    return this.where({name: new RegExp(name, "i")});
}

module.exports = mongoose.model("Person", personSchema);