import logo from './logo.svg';
import './App.css';
import {useEffect, useState, useContext} from "react"
import ConnectionContext from "./ConnectionContext"
import Messenger from "./Messenger"

function App(props) {
  const connection = useContext(ConnectionContext)

  let [messages, setMessages] = useState([])

  useEffect(() => {
    connection.listen("main", (peer, data) => {
      setMessages([(peer + ":\t" + data)].concat(messages))
    })

    return () => connection.unlisten("main")
  })

  let reciepts = []

  var i = 0
  for (var message of messages) {
    reciepts.push(<p>{message}</p>)
  }

  let loc = window.location.pathname

  return (
    <div>
      {loc == "/local" ? <h2>Local Mode</h2> : (loc == "/" ? <h2>Online Mode</h2> : <h2>Stun Mode</h2>)}
      <button onClick={() => window.location.pathname = loc == "/" ? "/stun" : (loc == "/stun" ? "/local" : "/")}>Toggle Mode</button>
      <h3>ID: {connection.id}</h3>
      <Messenger onSubmit={(r, m) => {
        console.log(r, m)
        connection.send(r, m)
      }} />
      <h3>Messages</h3>
      {reciepts}
    </div>
  );
}

export default App;
