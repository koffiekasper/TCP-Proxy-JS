const net = require('net');

const rsPort = 43594;
const rsIp = 'vidyascape.org';

// Een (slordige) implementatie van een TCP proxy
// rsPort en rsIp zijn specifiek voor de server waar ik naar connect.

class proxyClient {
    constructor(port, ip){
        this.port = port;
        this.ip = ip;
        this.server;
        this.client = new net.Socket();
    }
    send(message) {
        this.client.write(message);
    }
    makeConnection() {
        this.client.connect({ port: this.port, host: this.ip});
        this.client.on('data', (data) => {
            console.log('Destination -> Proxy', data)
            this.server.send(data);
        })
    }
}

class proxyServer {
    constructor(port, ip, game){
        this.port = port;
        this.ip = ip;
        this.game = game;
        this.game.server = this;
        this.socket;
        this.server = net.createServer((socket) => {
            this.socket = socket;
            console.log('Connection from', socket.remoteAddress, 'port', socket.remotePort);
            socket.on('data', (buffer) => {
                console.log('Proxy -> Destination', buffer);
                this.game.send(buffer);
            });
        })
    }
    runServer() {
        this.server.maxConnections = 1;
        this.server.listen(this.port);
        this.game.makeConnection();
    }
    send(message){
        this.socket.write(message);
    }
}
var client = new proxyClient(rsPort, rsIp);
var server = new proxyServer(rsPort, rsIp, client);
server.runServer();