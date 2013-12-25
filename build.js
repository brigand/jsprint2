var fs = require("fs");
var path = require("path");

var templates = readDirectory("./src/templates/");
var jsprint = read("./src/jsprint.js");

jsprint += "jsprint.templates = " + JSON.stringify(templates) + ";";
write("./build/jsprint.js", jsprint);


function write(path, data){
    fs.writeFileSync(path, data);
}

function read(path){
    return fs.readFileSync(path);
}

function readDirectory(directoryPath, ext){
    var paths = fs.readdirSync(directoryPath);

    var results = {};

    for ( var i = 0; i < paths.length; i++ ) {
        var p = paths[i];
        if (!ext || p.indexOf(ext) === p.length - ext.length ) {
            results[p] = fs.readFileSync(path.join(directoryPath, p))
                .toString()
                .replace(/\s\s+/g, " ");
        }
    }

    return results;
}

module.exports = {
    rd: readDirectory
};
