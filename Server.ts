import * as Http from "http";
import * as Url from "url";
import Database = require("./database");


let port: number = process.env.PORT;
if (port == undefined)
    port = 8100;

let server: Http.Server = Http.createServer();
server.addListener("listening", handleListen);
server.addListener("request", handleRequest);
server.listen(port);



function handleListen(): void {
    console.log("Listening on port: " + port);
}

function handleRequest(_request: Http.IncomingMessage, _response: Http.ServerResponse): void {
    console.log("Request received");
    let query: AssocStringString = Url.parse(_request.url, true).query;
    var command: string = query["command"];
    
    
    
    switch (command) { 
        case "insert":
            let student: StudentData = {
                name: query["name"],
                firstname: query["firstname"],
                matrikel: parseInt(query["matrikel"])
            };
            Database.insert(student); 
            respond(_response, "storing data");
            break;
        case "find":
            Database.refresh(function(json: string): void { 
                respond(_response, json);
            });
            break;
            case "search":
             if (query["matrikel"] == "") {
                Database.refresh(function(json: string): void {
                    respond(_response, json);
                });
                 }
            break;
        default:
            respond(_response, "unknown command: " + command);
            break;
    }
}

function respond(_response: Http.ServerResponse, _text: string): void {
    _response.setHeader("Access-Control-Allow-Origin", "*");
    _response.setHeader("content-type", "text/html; charset=utf-8");
    _response.write(_text);
    _response.end();
}
namespace Server {

    interface AssocStringString {
        [key: string]: string;
    }

    interface Studi {
        name: string;
        firstname: string;
        matrikel: number;
        age: number;
        gender: boolean;
        studiengang: string;
    }

    // Struktur des homogenen assoziativen Arrays, bei dem ein Datensatz der Matrikelnummer zugeordnet 
    interface Studis {
        [matrikel: string]: Studi;
    }
    

    // Homogenes assoziatives Array zur Speicherung einer Person unter der Matrikelnummer
    let studiHomoAssoc: Studis = {};
    let port: number = process.env.PORT;
    if (port == undefined)
        port = 8200;

    let server: Http.Server = Http.createServer((_request: Http.IncomingMessage, _response: Http.ServerResponse) => {
        _response.setHeader("content-type", "text/html; charset=utf-8");
        _response.setHeader("Access-Control-Allow-Origin", "*");
    });
    server.addListener("request", handleRequest);
    server.listen(port);

    function handleRequest(_request: Http.IncomingMessage, _response: Http.ServerResponse): void {
        console.log("Ich höre Stimmen!");
        let query: AssocStringString = Url.parse(_request.url, true).query;
        console.log(query["command"]);
        if (query["command"] ) {
            switch (query["command"] ) {
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
        
        function insert(query: AssocStringString, _response: Http.ServerResponse): void {
            let obj: Studi = JSON.parse(query["data"]);
            let _name: string = obj.name;
            let _firstname: string = obj.firstname;  
            let matrikel: string = obj.matrikel.toString(); 
            let _age: number = obj.age;
            let _gender: boolean = obj.gender;
            let _studiengang: string = obj.studiengang;  
            let studi: Studi;
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

        function refresh(_response: Http.ServerResponse): void {
            console.log(studiHomoAssoc);
            for (let matrikel in studiHomoAssoc) {  
            let studi: Studi = studiHomoAssoc[matrikel];
            let line: string = matrikel + ": ";
            line += studi.studiengang + ", " + studi.name + ", " + studi.firstname + ", " + studi.age + " Jahre ";
            line += studi.gender ? "(M)" : "(F)"; 
            _response.write(line + "\n");                                          
            }
        } 
        
        function search(query: AssocStringString, _response: Http.ServerResponse): void {
            let studi: Studi = studiHomoAssoc[query["searchFor"]];
            if (studi) {
                let line: string = query["searchFor"] + ": ";
                line += studi.studiengang + ", " + studi.name + ", " + studi.firstname + ", " + studi.age + " Jahre ";
                line += studi.gender ? "(M)" : "(F)";
                _response.write(line);
            } else {
                _response.write("No Match");    
            }    
        }
        
        function error(): void {
            alert("Error"); 
        }
    }