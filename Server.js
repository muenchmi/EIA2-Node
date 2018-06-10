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
            let student = {
                name: query["name"],
                firstname: query["firstname"],
                matrikel: parseInt(query["matrikel"])
            };
            Database.insert(student);
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
var Server;
(function (Server) {
    // Homogenes assoziatives Array zur Speicherung einer Person unter der Matrikelnummer
    let studiHomoAssoc = {};
    let port = process.env.PORT;
    if (port == undefined)
        port = 8200;
    let server = Http.createServer((_request, _response) => {
        _response.setHeader("content-type", "text/html; charset=utf-8");
        _response.setHeader("Access-Control-Allow-Origin", "*");
    });
    server.addListener("request", handleRequest);
    server.listen(port);
    function handleRequest(_request, _response) {
        console.log("Ich höre Stimmen!");
        let query = Url.parse(_request.url, true).query;
        console.log(query["command"]);
        if (query["command"]) {
            switch (query["command"]) {
                case "insert":
                    insert(query, _response);
                    break;
                case "refresh":
                    refresh(_response);
                    break;
                case "search":
                    search(query, _response);
                    break;
                default:
                    error();
            }
        }
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
        studiHomoAssoc[matrikel] = studi;
        _response.write("Daten empfangen");
    }
    function refresh(_response) {
        console.log(studiHomoAssoc);
        for (let matrikel in studiHomoAssoc) {
            let studi = studiHomoAssoc[matrikel];
            let line = matrikel + ": ";
            line += studi.studiengang + ", " + studi.name + ", " + studi.firstname + ", " + studi.age + " Jahre ";
            line += studi.gender ? "(M)" : "(F)";
            _response.write(line + "\n");
        }
    }
    function search(query, _response) {
        let studi = studiHomoAssoc[query["searchFor"]];
        if (studi) {
            let line = query["searchFor"] + ": ";
            line += studi.studiengang + ", " + studi.name + ", " + studi.firstname + ", " + studi.age + " Jahre ";
            line += studi.gender ? "(M)" : "(F)";
            _response.write(line);
        }
        else {
            _response.write("No Match");
        }
    }
    function error() {
        alert("Error");
    }
})(Server || (Server = {}));
//# sourceMappingURL=Server.js.map