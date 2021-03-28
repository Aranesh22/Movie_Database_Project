const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let peopleSchema = Schema({
    name: {type: String, required: true},
    directed: {type: [Schema.Types.ObjectId], required: true},
    written: {type: [Schema.Types.ObjectId], required: true},
    acted: {type: [Schema.Types.ObjectId], required: true},
    freqCollaborators: [Schema.Types.ObjectId],
    followers: [Schema.Types.ObjectId]
});

module.exports = mongoose.model("Movie", peopleSchema);