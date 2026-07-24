import { db } from "./lib/firebase";
import { collection, addDoc } from "firebase/firestore";

const users = [
  {
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    phone: "9876543210",
    city: "Bangalore"
  },
  {
    name: "Priya Kumar",
    email: "priya@gmail.com",
    phone: "9876543211",
    city: "Hyderabad"
  },
  {
    name: "Sneha Patel",
    email: "sneha@gmail.com",
    phone: "9876543212",
    city: "Mumbai"
  }
];

async function uploadUsers() {
  for (const user of users) {
    await addDoc(collection(db, "users"), user);
  }

  console.log("Users uploaded successfully");
}

uploadUsers();