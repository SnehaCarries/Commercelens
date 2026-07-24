import { db } from "./lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { faker } from "@faker-js/faker";

async function uploadDummyData() {

  // Create Users
  for (let i = 0; i < 500; i++) {
    await addDoc(collection(db, "users"), {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      city: faker.location.city(),
      createdAt: new Date()
    });
  }

  // Create Customers
  for (let i = 0; i < 500; i++) {
    await addDoc(collection(db, "customers"), {
      name: faker.person.fullName(),
      totalOrders: faker.number.int({ min: 1, max: 20 }),
      totalSpent: faker.number.int({ min: 500, max: 50000 }),
      city: faker.location.city()
    });
  }

  // Create Orders
  for (let i = 0; i < 1000; i++) {
    await addDoc(collection(db, "orders"), {
      orderId: faker.string.uuid(),
      customerName: faker.person.fullName(),
      productName: faker.commerce.productName(),
      quantity: faker.number.int({ min: 1, max: 5 }),
      price: faker.number.int({ min: 100, max: 10000 }),
      status: faker.helpers.arrayElement([
        "Delivered",
        "Pending",
        "Cancelled"
      ]),
      date: faker.date.recent()
    });
  }

  console.log("Dummy data uploaded successfully");
}

uploadDummyData();