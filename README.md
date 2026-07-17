# Commercelens – E-commerce Sales Analysis Dashboard

CommerceLens is an AI-powered e-commerce sales analytics platform designed to help businesses transform raw sales data into meaningful insights. The dashboard enables users to monitor business performance, analyze sales trends, and make data-driven decisions through interactive visualizations and AI-generated recommendations.

## Tech Stack

Frontend: Next.js, React.js
Styling: Tailwind CSS
Backend: Firebase
Database: Firestore
Authentication: Firebase Authentication
Charts: Recharts / Chart.js
Language: JavaScript

## Features

- Interactive analytics dashboard
- Revenue, profit, and sales tracking
- Product performance analysis
- Order and customer insights
- Dynamic charts and visualizations
- AI-powered business recommendations
- Responsive user interface
- Secure Firebase backend integration

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Build for production:

```bash
npm run build
```

Start the production build:

```bash
npm start
```

## Firebase Setup

Create a `.env.local` file in the project root with the Firebase web app config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

The app reads these values from `lib/firebase.ts`.

In Firebase Console:

1. Enable Authentication.
2. Enable the Email/Password sign-in provider.
3. Create a Cloud Firestore database.
4. Publish Firestore rules that protect user data

## Firestore Data

The app writes shopping data to both user-scoped documents and top-level collections for easy viewing in Firebase Console.

User-scoped paths:

```text
users/{uid}
users/{uid}/cart/{productId}
users/{uid}/wishlist/{productId}
users/{uid}/orders/{orderId}
```

Top-level paths:

```text
cart/{uid_productId}
wishlist/{uid_productId}
orders/{orderId}
customerOrders/{orderId}
```

Each order includes customer details, user ID, user email, order items, totals, delivery estimate, and a Firestore timestamp.

## Firestore Rules

Use rules like these for authenticated customer access:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return signedIn() && request.auth.uid == userId;
    }

    match /users/{userId} {
      allow read, write: if isOwner(userId);

      match /cart/{cartId} {
        allow read, write: if isOwner(userId);
      }

      match /wishlist/{wishlistId} {
        allow read, write: if isOwner(userId);
      }

      match /orders/{orderId} {
        allow read, write: if isOwner(userId);
      }
    }

    match /cart/{cartId} {
      allow read, write: if signedIn()
        && request.resource.data.userId == request.auth.uid;
      allow delete: if signedIn()
        && resource.data.userId == request.auth.uid;
    }

    match /wishlist/{wishlistId} {
      allow read, write: if signedIn()
        && request.resource.data.userId == request.auth.uid;
      allow delete: if signedIn()
        && resource.data.userId == request.auth.uid;
    }

    match /orders/{orderId} {
      allow create, read: if signedIn()
        && request.resource.data.userId == request.auth.uid;
      allow update, delete: if false;
    }

    match /customerOrders/{orderId} {
      allow create, read: if signedIn()
        && request.resource.data.userId == request.auth.uid;
      allow update, delete: if false;
    }
  }
}
```

## Project Structure

```text
app/
  globals.css      Global styles
  layout.tsx       Root app layout and metadata
  page.tsx         Main storefront, auth, cart, wishlist, checkout, and dashboard UI
lib/
  firebase.ts      Firebase app, auth, analytics, and Firestore initialization
public/
  homepage-banner.mp4
```

## Overview

The platform collects and organizes sales-related information such as revenue, orders, profit, customer activity, and product performance into a single dashboard.
