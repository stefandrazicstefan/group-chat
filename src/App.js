import "./App.css";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useEffect, useRef, useState } from "react";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
} from "firebase/auth";

firebase.initializeApp({
  apiKey: "AIzaSyARQuq6oVAoHUjnUTyyZz4FnUG0lW_RhLY",
  authDomain: "groupchat-902e7.firebaseapp.com",
  projectId: "groupchat-902e7",
  storageBucket: "groupchat-902e7.appspot.com",
  messagingSenderId: "676538693352",
  appId: "1:676538693352:web:ca0f113b17f153113d7b5d",
  measurementId: "G-5167WQ35HB",
});

const authAnonymous = getAuth();
signInAnonymously(authAnonymous)
  .then(() => {
    // Signed in..
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    // ...
  });

onAuthStateChanged(authAnonymous, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    const uid = user.uid;
    // ...
  } else {
    // User is signed out
    // ...
  }
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };
  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  );
}
function SignOut() {
  return (
    auth.currentUser && (
      <button onClick={() => auth.signOut()}>Sign Out</button>
    )
  );
}
function ChatRoom() {
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(25);
  const [messages] = useCollectionData(query, { idField: "id" });
  const [formMessage, setFormMessage] = useState("");
  const dummy = useRef();

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;
    await messagesRef.add({
      text: formMessage,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });
    setFormMessage("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="container">
      <div>
        {messages &&
          messages.map((message, id) => (
            <ChatMessage
              key={id} // message.id
              message={message}
            />
          ))}
        <div ref={dummy}></div>
      </div>
      <form
        action=""
        onSubmit={sendMessage}
      >
        <input
          type="text"
          value={formMessage}
          onChange={(e) => setFormMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
function ChatMessage({ message }) {
  const messageClass =
    message.uid === auth.currentUser.uid ? "sent" : "recieved";
  return (
    <div className={`message ${messageClass}`}>
      <img
        src={message.photoURL}
        alt=""
      />
      <p>{message.text}</p>
    </div>
  );
}

function App() {
  const [user] = useAuthState(auth);
  console.log(user);
  return (
    <div className="App">
      <header className="App-header">
        <SignOut />
      </header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

export default App;
