"use strict";
const Http = require("http");
const Url = require("url");
const Database = require("./database");
let port = process.env.PORT;
if (port == undefined)
    port = 8100;
let server = Http.createServer();
server.addListener("listening", handleListen);
server.addListener("request", handleRequest);
server.listen(port);
function handleListen() {
    console.log("Listening on port: " + port);
}
function handleRequest(_request, _response) {
    console.log("Request received");
    let query = Url.parse(_request.url, true).query;
    var command = query["command"];
    switch (command) {
        case "insert":
            insert(query, _response);
            respond(_response, "storing data");
            break;
        case "find":
            Database.refresh(function (json) {
                respond(_response, json);
            });
            break;
        case "search":
            if (query["matrikel"] == "") {
                Database.refresh(function (json) {
                    respond(_response, json);
                });
            }
            break;
        default:
            respond(_response, "unknown command: " + command);
            break;
    }
}
function respond(_response, _text) {
    _response.setHeader("Access-Control-Allow-Origin", "*");
    _response.setHeader("content-type", "text/html; charset=utf-8");
    _response.write(_text);
    _response.end();
}
function insert(query, _response) {
    let obj = JSON.parse(query["data"]);
    let _name = obj.name;
    let _firstname = obj.firstname;
    let matrikel = obj.matrikel.toString();
    let _age = obj.age;
    let _gender = obj.gender;
    let _studiengang = obj.studiengang;
    let studi;
    studi = {
        name: _name,
        firstname: _firstname,
        matrikel: parseInt(matrikel),
        age: _age,
        gender: _gender,
        studiengang: _studiengang
    };
    //            studiHomoAssoc[matrikel] = studi;
    _response.write("Daten empfangen");
    Database.insert(studi);
}
//# sourceMappingURL=Server.js.map