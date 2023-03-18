import {useState} from "react"
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

function Messenger(props) {
  let [recipient, setRecipient] = useState("")
  let [message, setMessage] = useState("")

  function parseInput(event, setter, value) {
    let data = event.nativeEvent.data
    if (data == null) {
      if (value.length > 0) {
        setter(value.slice(0, -1))
      }
    }
    else {
      setter(value + data)
    }
  }

  return (
    <form onSubmit={(event) => {
      event.preventDefault()
      let r = event.nativeEvent.target[0].value
      let m = event.nativeEvent.target[1].value
      props.onSubmit(r, m)
      setMessage("")
    }}>
      <label htmlFor="recipient">Recipient:</label><br />
      <input type="text" id="recipient" name="recipient" value={recipient} onChange={(change) => parseInput(change, setRecipient, recipient)} /><br />
      <label htmlFor="message">Message:</label><br />
      <input type="text" id="message" name="message" value={message} onChange={(change) => parseInput(change, setMessage, message)} />
      <br /><br />
      <input type="submit" value="Submit" />
    </form>
  )
}

export default Messenger
