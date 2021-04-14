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

personSchema.query.byActor = function(act,dir) { 

    return this.where("acted.0",{$exists: true}).where({name: new RegExp(act,"i")}).populate("acted directed");
                //.where("directed.0",{$exists: true}).where({name: new RegExp(dir,"i")}).populate("acted"); 
} 

personSchema.query.byDirector = function(dir) { 

    return this.where("directed.0",{$exists: true}).where({name:new RegExp(dir,"i")}).populate("acted directed");
}
module.exports = mongoose.model("Person", personSchema);