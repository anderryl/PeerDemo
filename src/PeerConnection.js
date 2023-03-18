import { Peer } from "peerjs";
import { stun, all } from "./Servers.js"

class PeerConnection {
  constructor(type = "/local") {
    function makeid(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
          counter += 1;
        }
        return result;
    }

    this.id = makeid(6)

    this.peer = new Peer(this.id, {
      config: {'iceServers' : type == "/" ? all : (type == "/stun" ? stun : [])},
      debug: 3
    })

    this.connections = {}
    this.subscriptions = {}
    this.universals = {}

    this.peer.on("connection", (conn) => {
    	conn.on("data", (data) => {
        console.log("Recieved ", data, " from ", conn.peer)
        this.notify(conn.peer, data)
    	})
    	conn.on("open", () => {
    		this.connections[conn.peer] = conn
    	})
      conn.on("close", () => {
        if (this.subscriptions[conn.peer]) {
          for (var key in this.subscriptions[conn.peer]) {
            this.subscriptions[key].close()
          }
        }
        delete this.connections[conn.peer]
      })
    })
  }

  notify(peer, data) {
    console.log("Notified of ", data, " from ", peer)
    if (this.subscriptions[peer]) {
      for (var key in this.subscriptions[peer]) {
        this.subscriptions[key].data(peer, data)
      }
    }

    for (var key in this.universals) {
      this.universals[key].data(peer, data)
    }
  }

  listen(id, datacall, closecall = () => {}) {
    this.universals[id] = {data: datacall, close: closecall}
  }

  unlisten(id) {
    delete this.universals[id]
  }

  establish(remote, onOpen) {
    const conn = this.peer.connect(remote)
    conn.on("open", () => {
      console.log("opened")
    	this.connections[remote] = conn
      onOpen(conn)
    });
    conn.on("close", () => {
      delete this.connections[remote]
    })
    conn.on("data", (data) => {
      this.notify(remote, data)
    })
    conn.on("error", (error) => {
      console.error(error)
    })
  }

  send(remote, data) {
    console.log("Attempting to send to ", remote)
    if (this.connections[remote]) {
      this.connections[remote].send(data)
    }
    else {
      this.establish(remote, (conn) => {
        console.log("Sent ", data, " to ", remote)
        conn.send(data)
      })
    }
  }

  close(remote) {
    if (this.connections[remote]) {
      this.connections[remote].close()
      delete this.connections[remote]
    }
    if (this.subscriptions[remote]) {
      for (var key in this.subscriptions[remote]) {
        this.subscriptions[key].close()
      }
    }
  }

  subscribe(remote, id, datacall, closecall = () => {}) {
    if (this.subscriptions[remote]) {
      this.subscriptions[remote][id] = {data: datacall, close: closecall}
    }
    else {
      this.subscriptions[remote] = {}
      this.subscriptions[remote][id] = {data: datacall, close: closecall}
    }
  }

  unsubscribe(remote, id) {
    if (this.subscriptions[remote]) {
      delete this.subscriptions[remote][id]
    }
  }

  destroy() {
    for (var key of this.connections) {
      this.connections[key].close()
    }
    this.peer.destroy()
  }
}

export default PeerConnection
