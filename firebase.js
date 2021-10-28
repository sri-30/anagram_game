import firebase from 'firebase'

  const firebaseApp = firebase.initializeApp({
      apiKey: "AIzaSyA2WsGE9v7F4DjVsOgKqUSVxUG12H840J8",
      authDomain: "anagram-22e27.firebaseapp.com",
      projectId: "anagram-22e27",
      storageBucket: "anagram-22e27.appspot.com",
      messagingSenderId: "1053501230631",
      appId: "1:1053501230631:web:08a77bc0063c204faf4802",
      measurementId: "G-NDEG4VNY13"
    
    })

const db = firebaseApp.firestore()

const auth = firebase.auth()

export {db, auth}