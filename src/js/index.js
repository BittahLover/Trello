import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.4/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword
} from 'https://www.gstatic.com/firebasejs/9.9.4/firebase-auth.js';
import {
  getDatabase,
  ref, set, onValue,
} from 'https://www.gstatic.com/firebasejs/9.9.4/firebase-database.js';

const firebaseConfig = {
  apiKey: "AIzaSyC298rmwvlBfxie5szhXmL1gXnOtK4I_uw",
  authDomain: "trelloapp-like.firebaseapp.com",
  databaseURL: "https://trelloapp-like-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "trelloapp-like",
  appId: "1:713561130898:web:b079048033227fdbdaa34b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Realtime Database and get a reference to the service
const db = getDatabase();

function writeUserData(userId, name, email) {
  const reference = ref(db, 'users/' + userId);
  set(reference, {
    username: name,
    email: email,
  });
}


const login_page = document.getElementById("#login-page");
if (login_page) {
  document.querySelector('.auth-form').addEventListener('submit', loginFormHandler, { once: true });

  function loginFormHandler(event) {
    event.preventDefault()

    var email = document.querySelector(".email").value;
    var password = document.querySelector(".password").value;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        var user = userCredential.user;
        document.location.href = '../../index.html';
        console.log(user);
        // ...
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        alert("Invalid login or password");
        console.log(errorCode, errorMessage);
        // ..
      });
  }
}

const register_page = document.getElementById("register-page");
if (register_page) {
  document.querySelector('.auth-form').addEventListener('submit', registerFormHandler, { once: true });

  function registerFormHandler(event) {
    event.preventDefault()

    var username = document.querySelector(".username").value;
    var email = document.querySelector(".email").value;
    var password = document.querySelector(".password").value;


    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        var user = userCredential.user;

        writeUserData(user.uid, username, user.email)
        ocument.location.href = '../../index.html';
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(errorMessage);
        // ..
      });
  }
}


const log_out = document.getElementById("logout-button");
if (log_out) {
  log_out.addEventListener('click', function () {
    signOut(auth);
    document.location.href = '../../index.html';
  });
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById('#login_link').style.display = 'none';
    document.getElementById('#logout_menu').style.display = 'block';

    localStorage.setItem('user_id', JSON.stringify(user.uid));
    onValue(ref(db, '/users/' + user.uid), (snapshot) => {
      const username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
      document.getElementById('user_email').textContent = username;
    }, {
      onlyOnce: true
    });

    console.log("You entered your account");
  }
  else {
    // document.getElementById('#logout_menu').style.display = 'none';
    // document.getElementById('#login_link').style.display = 'block';
    console.log("You not entered your account");
  }
})
