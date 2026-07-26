import { db } from "./lib/firebase";
import { collection, addDoc } from "firebase/firestore";

async function uploadProducts() {
  const response = await fetch("https://dummyjson.com/products");
  const data = await response.json();

  for (const product of data.products) {
    await addDoc(collection(db, "products"), product);
  }

  console.log("Products uploaded successfully");
}

uploadProducts();
