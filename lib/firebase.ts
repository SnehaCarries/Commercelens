import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
 apiKey: "AIzaSyDPK1Fd10iA5X2g4mbdKZ5bn6TzsGwBG6U",
  authDomain: "commercelens-b5ee2.firebaseapp.com",
  projectId: "commercelens-b5ee2",
  storageBucket: "commercelens-b5ee2.firebasestorage.app",
  messagingSenderId: "777750429977",
  appId: "1:777750429977:web:484fb83a5f32907c9e0588",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);