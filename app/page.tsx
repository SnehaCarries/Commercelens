"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent, MouseEvent } from "react";
import {
  ArrowRight,
  BadgePercent,
  Bot,
  ChevronUp,
  CreditCard,
  GitCompareArrows,
  Heart,
  Menu,
  MessageCircle,
  Mic,
  Minus,
  Moon,
  Package,
  Plus,
  Search,
  Send,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Star,
  Sun,
  Trash2,
  Truck,
  User,
  X
} from "lucide-react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query as firestoreQuery,
  serverTimestamp,
  setDoc
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";

type Product = {
  id: number;
  name: string;
  category: string;
  subcategory?: string;
  price: number;
  rating: number;
  image: string;
  tag: string;
};

type CartItem = Product & { quantity: number };
type SortOption =
  | "featured"
  | "priceLowHigh"
  | "priceHighLow"
  | "popularity"
  | "newest";
type PriceFilter = "all" | "under25" | "25to50" | "50to100" | "over100";
type RatingFilter = "all" | "4.5" | "4.7" | "4.8";
type DashboardRange = "7d" | "30d" | "90d";
type AppView =
  | "shop"
  | "login"
  | "checkout"
  | "profile"
  | "dashboard"
  | "orders"
  | "payments"
  | "wishlist"
  | "product";

type Customer = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
};

type PaymentMethod = {
  id: number;
  label: string;
  detail: string;
  default: boolean;
};

type CategoryCard = {
  label: string;
  description: string;
  category: string;
  query: string;
  image: string;
};

type ToastMessage = {
  id: number;
  message: string;
};

type ChatMessage = {
  sender: "bot" | "user";
  text: string;
};

type Order = {
  id: string;
  date: string;
  status: string;
  total: number;
  items: CartItem[];
};

type RecentOrder = {
  id: string;
  customer: string;
  product: string;
  quantity: number;
  total: number;
  status: string;
  date: Date | null;
  dateLabel: string;
};

type UserStoreData = {
  cart?: CartItem[];
  wishlist?: number[];
  orders?: Order[];
  orderSummary?: {
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
    couponCode: string;
    estimatedDelivery: string;
    itemCount: number;
  };
};

const products: Product[] = [
  {
    id: 1,
    name: "Everyday Tote",
    category: "Bags",
    subcategory: "Totes",
    price: 58,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=80",
    tag: "Best seller"
  },
  {
    id: 2,
    name: "Weekender Duffel",
    category: "Bags",
    subcategory: "Duffels",
    price: 74,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    tag: "Roomy"
  },
  {
    id: 3,
    name: "Gold Hoop Set",
    category: "Jewelry",
    subcategory: "Earrings",
    price: 34,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80",
    tag: "New"
  },
  {
    id: 4,
    name: "Layered Pendant Necklace",
    category: "Jewelry",
    subcategory: "Necklaces",
    price: 46,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80",
    tag: "Polished"
  },
  {
    id: 5,
    name: "Pearl Stud Earrings",
    category: "Jewelry",
    subcategory: "Earrings",
    price: 28,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80",
    tag: "Classic"
  },
  {
    id: 6,
    name: "Stacking Ring Trio",
    category: "Jewelry",
    subcategory: "Rings",
    price: 39,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80",
    tag: "Set of 3"
  },
  {
    id: 7,
    name: "Charm Bracelet",
    category: "Jewelry",
    subcategory: "Bracelets",
    price: 44,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80",
    tag: "Gift ready"
  },
  {
    id: 8,
    name: "Minimal Anklet",
    category: "Jewelry",
    subcategory: "Anklets",
    price: 22,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?auto=format&fit=crop&w=900&q=80",
    tag: "Delicate"
  },
  {
    id: 40,
    name: "Crystal Drop Earrings",
    category: "Jewelry",
    subcategory: "Earrings",
    price: 52,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=900&q=80",
    tag: "Evening"
  },
  {
    id: 41,
    name: "Signet Ring",
    category: "Jewelry",
    subcategory: "Rings",
    price: 48,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1603561596112-0a132b757442?auto=format&fit=crop&w=900&q=80",
    tag: "Bold"
  },
  {
    id: 42,
    name: "Tennis Bracelet",
    category: "Jewelry",
    subcategory: "Bracelets",
    price: 64,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80",
    tag: "Premium"
  },
  {
    id: 43,
    name: "Birthstone Necklace",
    category: "Jewelry",
    subcategory: "Necklaces",
    price: 55,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=900&q=80",
    tag: "Personalized"
  },
  {
    id: 44,
    name: "Beaded Anklet Set",
    category: "Jewelry",
    subcategory: "Anklets",
    price: 26,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=80",
    tag: "Set"
  },
  {
    id: 9,
    name: "Travel Organizer",
    category: "Travel",
    subcategory: "Packing",
    price: 42,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1581553680321-4fffae59fccd?auto=format&fit=crop&w=900&q=80",
    tag: "Popular"
  },
  {
    id: 10,
    name: "Packing Cube Set",
    category: "Travel",
    subcategory: "Packing",
    price: 36,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1580913428735-bd3c269d6a82?auto=format&fit=crop&w=900&q=80",
    tag: "Set of 4"
  },
  {
    id: 11,
    name: "Toiletry Pouch",
    category: "Travel",
    subcategory: "Toiletry",
    price: 28,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=900&q=80",
    tag: "Water resistant"
  },
  {
    id: 12,
    name: "Clear TSA Bottle Kit",
    category: "Travel",
    subcategory: "Toiletry",
    price: 18,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80",
    tag: "Carry-on"
  },
  {
    id: 13,
    name: "Passport Wallet",
    category: "Travel",
    subcategory: "Documents",
    price: 32,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1522199755839-a2bacb67c546?auto=format&fit=crop&w=900&q=80",
    tag: "Secure"
  },
  {
    id: 14,
    name: "RFID Travel Pouch",
    category: "Travel",
    subcategory: "Documents",
    price: 39,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=900&q=80",
    tag: "RFID"
  },
  {
    id: 15,
    name: "Neck Pillow",
    category: "Travel",
    subcategory: "Comfort",
    price: 31,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80",
    tag: "Soft support"
  },
  {
    id: 16,
    name: "Sleep Mask Set",
    category: "Travel",
    subcategory: "Comfort",
    price: 16,
    rating: 4.4,
    image:
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80",
    tag: "Light blocking"
  },
  {
    id: 17,
    name: "Cable Organizer Roll",
    category: "Travel",
    subcategory: "Tech",
    price: 26,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=900&q=80",
    tag: "Tidy tech"
  },
  {
    id: 18,
    name: "Portable Charger",
    category: "Travel",
    subcategory: "Tech",
    price: 49,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=900&q=80",
    tag: "Fast charge"
  },
  {
    id: 19,
    name: "Luggage Tag Duo",
    category: "Travel",
    subcategory: "Luggage",
    price: 14,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    tag: "Pair"
  },
  {
    id: 20,
    name: "Digital Luggage Scale",
    category: "Travel",
    subcategory: "Luggage",
    price: 22,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?auto=format&fit=crop&w=900&q=80",
    tag: "Compact"
  },
  {
    id: 21,
    name: "Classic Sunglasses",
    category: "Accessories",
    subcategory: "Eyewear",
    price: 29,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80",
    tag: "Limited"
  },
  {
    id: 22,
    name: "Blue Light Glasses",
    category: "Accessories",
    subcategory: "Eyewear",
    price: 35,
    rating: 4.4,
    image:
      "https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=900&q=80",
    tag: "Screen ready"
  },
  {
    id: 23,
    name: "Minimal Wallet",
    category: "Accessories",
    subcategory: "Wallets",
    price: 38,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80",
    tag: "Gift pick"
  },
  {
    id: 24,
    name: "Card Holder",
    category: "Accessories",
    subcategory: "Wallets",
    price: 27,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1589782431746-733ac1b1aee1?auto=format&fit=crop&w=900&q=80",
    tag: "Slim"
  },
  {
    id: 25,
    name: "Keychain Charm",
    category: "Accessories",
    subcategory: "Keychains",
    price: 15,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=900&q=80",
    tag: "Easy gift"
  },
  {
    id: 26,
    name: "Watch Strap",
    category: "Accessories",
    subcategory: "Wearables",
    price: 33,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=900&q=80",
    tag: "Adjustable"
  },
  {
    id: 27,
    name: "Silk Hair Scarf",
    category: "Style",
    subcategory: "Scarves",
    price: 24,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=900&q=80",
    tag: "Soft touch"
  },
  {
    id: 28,
    name: "Travel Wrap Scarf",
    category: "Style",
    subcategory: "Scarves",
    price: 44,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=80",
    tag: "Warm layer"
  },
  {
    id: 29,
    name: "Hair Claw Clip",
    category: "Style",
    subcategory: "Hair Accessories",
    price: 18,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80",
    tag: "Everyday"
  },
  {
    id: 30,
    name: "Makeup Pouch",
    category: "Bags",
    subcategory: "Pouches",
    price: 26,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80",
    tag: "Compact"
  },
  {
    id: 31,
    name: "Crossbody Sling",
    category: "Bags",
    subcategory: "Crossbody",
    price: 64,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80",
    tag: "Hands free"
  },
  {
    id: 52,
    name: "Canvas Market Tote",
    category: "Bags",
    subcategory: "Totes",
    price: 36,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=900&q=80",
    tag: "Lightweight"
  },
  {
    id: 53,
    name: "Structured Work Tote",
    category: "Bags",
    subcategory: "Totes",
    price: 86,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=900&q=80",
    tag: "Laptop fit"
  },
  {
    id: 54,
    name: "Mini Crossbody Bag",
    category: "Bags",
    subcategory: "Crossbody",
    price: 48,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1605733513597-a8f8341084e6?auto=format&fit=crop&w=900&q=80",
    tag: "Compact"
  },
  {
    id: 55,
    name: "Convertible Backpack",
    category: "Bags",
    subcategory: "Backpacks",
    price: 92,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    tag: "2-way carry"
  },
  {
    id: 56,
    name: "Quilted Shoulder Bag",
    category: "Bags",
    subcategory: "Shoulder Bags",
    price: 68,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=80",
    tag: "Dressy"
  },
  {
    id: 57,
    name: "Travel Garment Duffel",
    category: "Bags",
    subcategory: "Duffels",
    price: 118,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    tag: "Weekend"
  },
  {
    id: 58,
    name: "Cosmetic Zip Pouch",
    category: "Bags",
    subcategory: "Pouches",
    price: 22,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=900&q=80",
    tag: "Easy pack"
  },
  {
    id: 59,
    name: "Evening Clutch",
    category: "Bags",
    subcategory: "Clutches",
    price: 54,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=900&q=80",
    tag: "Occasion"
  },
  {
    id: 60,
    name: "Leather Bucket Bag",
    category: "Bags",
    subcategory: "Shoulder Bags",
    price: 78,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
    tag: "Soft shape"
  },
  {
    id: 61,
    name: "City Backpack",
    category: "Bags",
    subcategory: "Backpacks",
    price: 72,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=900&q=80",
    tag: "Daily"
  },
  {
    id: 62,
    name: "Satin Party Clutch",
    category: "Bags",
    subcategory: "Clutches",
    price: 46,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=900&q=80",
    tag: "Party"
  },
  {
    id: 63,
    name: "Huggie Earring Set",
    category: "Jewelry",
    subcategory: "Earrings",
    price: 31,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80",
    tag: "Set"
  },
  {
    id: 64,
    name: "Pearl Pendant Necklace",
    category: "Jewelry",
    subcategory: "Necklaces",
    price: 42,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80",
    tag: "Elegant"
  },
  {
    id: 65,
    name: "Adjustable Band Ring",
    category: "Jewelry",
    subcategory: "Rings",
    price: 29,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80",
    tag: "Adjustable"
  },
  {
    id: 66,
    name: "Cuff Bracelet",
    category: "Jewelry",
    subcategory: "Bracelets",
    price: 37,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80",
    tag: "Modern"
  },
  {
    id: 67,
    name: "Chain Anklet",
    category: "Jewelry",
    subcategory: "Anklets",
    price: 24,
    rating: 4.4,
    image:
      "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?auto=format&fit=crop&w=900&q=80",
    tag: "Layering"
  },
  {
    id: 68,
    name: "Compression Packing Bags",
    category: "Travel",
    subcategory: "Packing",
    price: 34,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1580913428735-bd3c269d6a82?auto=format&fit=crop&w=900&q=80",
    tag: "Space saver"
  },
  {
    id: 69,
    name: "Hanging Toiletry Kit",
    category: "Travel",
    subcategory: "Toiletry",
    price: 33,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=900&q=80",
    tag: "Hangs"
  },
  {
    id: 70,
    name: "Document Folder",
    category: "Travel",
    subcategory: "Documents",
    price: 25,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1522199755839-a2bacb67c546?auto=format&fit=crop&w=900&q=80",
    tag: "Flat pack"
  },
  {
    id: 71,
    name: "Travel Blanket",
    category: "Travel",
    subcategory: "Comfort",
    price: 45,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80",
    tag: "Cozy"
  },
  {
    id: 72,
    name: "Universal Travel Adapter",
    category: "Travel",
    subcategory: "Tech",
    price: 38,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=900&q=80",
    tag: "Global"
  },
  {
    id: 73,
    name: "Luggage Strap",
    category: "Travel",
    subcategory: "Luggage",
    price: 19,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?auto=format&fit=crop&w=900&q=80",
    tag: "Secure"
  },
  {
    id: 74,
    name: "Polarized Aviators",
    category: "Accessories",
    subcategory: "Eyewear",
    price: 43,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80",
    tag: "Polarized"
  },
  {
    id: 75,
    name: "Zip Around Wallet",
    category: "Accessories",
    subcategory: "Wallets",
    price: 44,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80",
    tag: "Secure zip"
  },
  {
    id: 76,
    name: "Leather Key Fob",
    category: "Accessories",
    subcategory: "Keychains",
    price: 18,
    rating: 4.4,
    image:
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=900&q=80",
    tag: "Leather"
  },
  {
    id: 77,
    name: "Metal Watch Band",
    category: "Accessories",
    subcategory: "Wearables",
    price: 41,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=900&q=80",
    tag: "Polished"
  },
  {
    id: 78,
    name: "Printed Square Scarf",
    category: "Style",
    subcategory: "Scarves",
    price: 32,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=900&q=80",
    tag: "Printed"
  },
  {
    id: 79,
    name: "Pearl Hair Pins",
    category: "Style",
    subcategory: "Hair Accessories",
    price: 21,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80",
    tag: "Set"
  },
  {
    id: 80,
    name: "Nesting Side Tables",
    category: "Furniture",
    subcategory: "Tables",
    price: 124,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=900&q=80",
    tag: "Set of 2"
  },
  {
    id: 81,
    name: "Boucle Accent Chair",
    category: "Furniture",
    subcategory: "Chairs",
    price: 218,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=900&q=80",
    tag: "Textured"
  },
  {
    id: 82,
    name: "Platform Bed Frame",
    category: "Furniture",
    subcategory: "Bedroom",
    price: 279,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
    tag: "Bedroom"
  },
  {
    id: 83,
    name: "Arched Floor Lamp",
    category: "Furniture",
    subcategory: "Lighting",
    price: 112,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
    tag: "Statement"
  },
  {
    id: 84,
    name: "Linen Storage Bench",
    category: "Furniture",
    subcategory: "Seating",
    price: 148,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1519947486511-46149fa0a254?auto=format&fit=crop&w=900&q=80",
    tag: "Storage"
  },
  {
    id: 85,
    name: "Decorative Wall Shelf",
    category: "Furniture",
    subcategory: "Decor",
    price: 58,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80",
    tag: "Display"
  },
  {
    id: 86,
    name: "Wireless Earbuds",
    category: "Electronics",
    subcategory: "Audio",
    price: 79,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=80",
    tag: "Bluetooth"
  },
  {
    id: 87,
    name: "Noise Canceling Headphones",
    category: "Electronics",
    subcategory: "Audio",
    price: 149,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    tag: "Premium sound"
  },
  {
    id: 88,
    name: "Smart Watch",
    category: "Electronics",
    subcategory: "Wearables",
    price: 129,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    tag: "Fitness"
  },
  {
    id: 89,
    name: "Portable Bluetooth Speaker",
    category: "Electronics",
    subcategory: "Speakers",
    price: 58,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=80",
    tag: "Portable"
  },
  {
    id: 90,
    name: "Wireless Charging Pad",
    category: "Electronics",
    subcategory: "Chargers",
    price: 29,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1618577608401-2f68174a2f3a?auto=format&fit=crop&w=900&q=80",
    tag: "Fast charge"
  },
  {
    id: 91,
    name: "USB-C Hub",
    category: "Electronics",
    subcategory: "Computer Accessories",
    price: 45,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=900&q=80",
    tag: "Work setup"
  },
  {
    id: 92,
    name: "Running Sneakers",
    category: "Footwear",
    subcategory: "Sneakers",
    price: 84,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    tag: "Active"
  },
  {
    id: 93,
    name: "White Court Sneakers",
    category: "Footwear",
    subcategory: "Sneakers",
    price: 72,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=900&q=80",
    tag: "Everyday"
  },
  {
    id: 94,
    name: "Leather Sandals",
    category: "Footwear",
    subcategory: "Sandals",
    price: 48,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=900&q=80",
    tag: "Summer"
  },
  {
    id: 95,
    name: "Ankle Boots",
    category: "Footwear",
    subcategory: "Boots",
    price: 96,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=900&q=80",
    tag: "Classic"
  },
  {
    id: 96,
    name: "Ballet Flats",
    category: "Footwear",
    subcategory: "Flats",
    price: 52,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?auto=format&fit=crop&w=900&q=80",
    tag: "Comfort"
  },
  {
    id: 97,
    name: "Slide Slippers",
    category: "Footwear",
    subcategory: "Slippers",
    price: 34,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1562273138-f46be4ebdf33?auto=format&fit=crop&w=900&q=80",
    tag: "Cozy"
  },
  {
    id: 98,
    name: "Linen Button Shirt",
    category: "Clothes",
    subcategory: "Tops",
    price: 46,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=900&q=80",
    tag: "Breathable"
  },
  {
    id: 99,
    name: "Ribbed Tank Top",
    category: "Clothes",
    subcategory: "Tops",
    price: 24,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=80",
    tag: "Layering"
  },
  {
    id: 100,
    name: "Straight Leg Jeans",
    category: "Clothes",
    subcategory: "Bottoms",
    price: 68,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80",
    tag: "Denim"
  },
  {
    id: 101,
    name: "Pleated Midi Skirt",
    category: "Clothes",
    subcategory: "Bottoms",
    price: 56,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1583496661160-fb5886a13d27?auto=format&fit=crop&w=900&q=80",
    tag: "Dressy"
  },
  {
    id: 102,
    name: "Wrap Dress",
    category: "Clothes",
    subcategory: "Dresses",
    price: 74,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80",
    tag: "Occasion"
  },
  {
    id: 103,
    name: "Cropped Denim Jacket",
    category: "Clothes",
    subcategory: "Outerwear",
    price: 82,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=900&q=80",
    tag: "Layer"
  },
  {
    id: 104,
    name: "Satin Scrunchie Set",
    category: "Hair Accessories",
    subcategory: "Scrunchies",
    price: 16,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80",
    tag: "Set"
  },
  {
    id: 105,
    name: "Oversized Claw Clip",
    category: "Hair Accessories",
    subcategory: "Clips",
    price: 14,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80",
    tag: "Strong hold"
  },
  {
    id: 106,
    name: "Pearl Barrette Duo",
    category: "Hair Accessories",
    subcategory: "Barrettes",
    price: 19,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=900&q=80",
    tag: "Pearl"
  },
  {
    id: 107,
    name: "Padded Headband",
    category: "Hair Accessories",
    subcategory: "Headbands",
    price: 22,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80",
    tag: "Polished"
  },
  {
    id: 108,
    name: "Silk Hair Wrap",
    category: "Hair Accessories",
    subcategory: "Hair Wraps",
    price: 28,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=900&q=80",
    tag: "Silk"
  },
  {
    id: 32,
    name: "Accent Lounge Chair",
    category: "Furniture",
    subcategory: "Chairs",
    price: 189,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=900&q=80",
    tag: "Comfort pick"
  },
  {
    id: 33,
    name: "Round Coffee Table",
    category: "Furniture",
    subcategory: "Tables",
    price: 145,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=900&q=80",
    tag: "Living room"
  },
  {
    id: 34,
    name: "Open Bookshelf",
    category: "Furniture",
    subcategory: "Storage",
    price: 118,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=900&q=80",
    tag: "Organize"
  },
  {
    id: 35,
    name: "Bedside Nightstand",
    category: "Furniture",
    subcategory: "Bedroom",
    price: 96,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
    tag: "Compact"
  },
  {
    id: 36,
    name: "Floor Lamp",
    category: "Furniture",
    subcategory: "Lighting",
    price: 82,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
    tag: "Warm light"
  },
  {
    id: 37,
    name: "Entryway Bench",
    category: "Furniture",
    subcategory: "Seating",
    price: 132,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1519947486511-46149fa0a254?auto=format&fit=crop&w=900&q=80",
    tag: "Multipurpose"
  },
  {
    id: 38,
    name: "Storage Ottoman",
    category: "Furniture",
    subcategory: "Storage",
    price: 74,
    rating: 4.4,
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80",
    tag: "Hidden storage"
  },
  {
    id: 39,
    name: "Wall Mirror",
    category: "Furniture",
    subcategory: "Decor",
    price: 68,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=900&q=80",
    tag: "Decor"
  },
  {
    id: 45,
    name: "Dining Chair Pair",
    category: "Furniture",
    subcategory: "Chairs",
    price: 164,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=900&q=80",
    tag: "Pair"
  },
  {
    id: 46,
    name: "Console Table",
    category: "Furniture",
    subcategory: "Tables",
    price: 156,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=900&q=80",
    tag: "Entryway"
  },
  {
    id: 47,
    name: "Six Drawer Dresser",
    category: "Furniture",
    subcategory: "Bedroom",
    price: 248,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=900&q=80",
    tag: "Bedroom"
  },
  {
    id: 48,
    name: "Rattan Side Cabinet",
    category: "Furniture",
    subcategory: "Storage",
    price: 138,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
    tag: "Natural"
  },
  {
    id: 49,
    name: "Table Lamp Set",
    category: "Furniture",
    subcategory: "Lighting",
    price: 88,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=900&q=80",
    tag: "Set of 2"
  },
  {
    id: 50,
    name: "Velvet Loveseat",
    category: "Furniture",
    subcategory: "Seating",
    price: 329,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80",
    tag: "Statement"
  },
  {
    id: 51,
    name: "Framed Wall Art",
    category: "Furniture",
    subcategory: "Decor",
    price: 72,
    rating: 4.4,
    image:
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80",
    tag: "Gallery"
  }
];

const categories = ["All", "Fashion", "Beauty", "Electronics", "Home-Living"];
const categoryCards: CategoryCard[] = [
  {
    label: "Men",
    description: "Wallets, watches, shoes, and everyday tech",
    category: "All",
    query: "men",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80"
  },
  {
    label: "Women",
    description: "Bags, jewelry, beauty, clothes, and hair pieces",
    category: "All",
    query: "women",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80"
  },
  {
    label: "Electronics",
    description: "Audio, charging, wearables, and computer accessories",
    category: "Electronics",
    query: "",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80"
  },
  {
    label: "Beauty",
    description: "Hair clips, scrunchies, barrettes, and styling picks",
    category: "Beauty",
    query: "",
    image:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80"
  },
  {
    label: "Home",
    description: "Furniture, lighting, storage, and decor",
    category: "Home-Living",
    query: "",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80"
  }
];
const subcategoriesByCategory: Record<string, string[]> = {
  Bags: [
    "All Bags",
    "Totes",
    "Duffels",
    "Pouches",
    "Crossbody",
    "Backpacks",
    "Shoulder Bags",
    "Clutches"
  ],
  Jewelry: [
    "All Jewelry",
    "Earrings",
    "Necklaces",
    "Rings",
    "Bracelets",
    "Anklets"
  ],
  Travel: [
    "All Travel",
    "Packing",
    "Toiletry",
    "Documents",
    "Comfort",
    "Tech",
    "Luggage"
  ],
  Accessories: [
    "All Accessories",
    "Wallets",
    "Eyewear",
    "Keychains",
    "Wearables"
  ],
  Style: ["All Style", "Scarves", "Hair Accessories"],
  Furniture: [
    "All Furniture",
    "Chairs",
    "Tables",
    "Storage",
    "Bedroom",
    "Lighting",
    "Seating",
    "Decor"
  ],
  Electronics: [
    "All Electronics",
    "Audio",
    "Wearables",
    "Speakers",
    "Chargers",
    "Computer Accessories"
  ],
  Footwear: [
    "All Footwear",
    "Sneakers",
    "Sandals",
    "Boots",
    "Flats",
    "Slippers"
  ],
  Clothes: [
    "All Clothes",
    "Tops",
    "Bottoms",
    "Dresses",
    "Outerwear"
  ],
  "Hair Accessories": [
    "All Hair Accessories",
    "Scrunchies",
    "Clips",
    "Barrettes",
    "Headbands",
    "Hair Wraps"
  ]
};
const mediumPriceMin = 30;
const mediumPriceMax = 45;

function pricePriority(product: Product) {
  if (product.price >= mediumPriceMin && product.price <= mediumPriceMax) {
    return 0;
  }
  if (product.price < mediumPriceMin) {
    return 1;
  }
  return 2;
}

function defaultSubcategory(category: string) {
  return subcategoriesByCategory[category]?.[0] ?? "All";
}

function displayCategory(product: Product) {
  if (product.category === "Electronics") {
    return "Electronics";
  }

  if (product.category === "Furniture") {
    return "Home-Living";
  }

  if (product.category === "Hair Accessories") {
    return "Beauty";
  }

  return "Fashion";
}

function productBrand(product: Product) {
  if (product.category === "Electronics") {
    return "NovaTech";
  }

  if (product.category === "Furniture") {
    return "Haven Home";
  }

  if (product.category === "Hair Accessories") {
    return "Glow Edit";
  }

  if (product.category === "Jewelry") {
    return "Lumiere";
  }

  if (product.category === "Footwear") {
    return "Stride Co.";
  }

  if (product.category === "Clothes") {
    return "Mode Studio";
  }

  return "Sneha Carries";
}

function baseReviewCount(product: Product) {
  return Math.round(product.rating * 38 + product.id);
}

function purchaseCount(product: Product) {
  return Math.round(product.rating * 24 + product.id * 3 + product.price);
}

function productDiscountRate(product: Product) {
  if (product.rating >= 4.8) {
    return 0.15;
  }
  if (["Furniture", "Electronics", "Footwear"].includes(product.category)) {
    return 0.12;
  }
  if (product.price >= 75) {
    return 0.1;
  }
  return 0.08;
}

function salePrice(product: Product) {
  return Number((product.price * (1 - productDiscountRate(product))).toFixed(2));
}

function matchesPriceFilter(product: Product, filter: PriceFilter) {
  const price = salePrice(product);

  if (filter === "under25") {
    return price < 25;
  }

  if (filter === "25to50") {
    return price >= 25 && price <= 50;
  }

  if (filter === "50to100") {
    return price > 50 && price <= 100;
  }

  if (filter === "over100") {
    return price > 100;
  }

  return true;
}

function offerLabel(product: Product) {
  return `${Math.round(productDiscountRate(product) * 100)}% off`;
}

function searchKeywords(product: Product) {
  const keywords: string[] = [];

  if (["Accessories", "Clothes", "Electronics", "Footwear"].includes(product.category)) {
    keywords.push("men");
  }

  if (
    ["Bags", "Clothes", "Footwear", "Hair Accessories", "Jewelry", "Style"].includes(
      product.category
    )
  ) {
    keywords.push("women");
  }

  if (product.category === "Hair Accessories") {
    keywords.push("beauty");
  }

  if (product.category === "Furniture") {
    keywords.push("home");
  }

  return keywords.join(" ");
}

function usageImages(product: Product) {
  const categoryImages: Record<string, string[]> = {
    Bags: [
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80"
    ],
    Jewelry: [
      "https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=900&q=80"
    ],
    Travel: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=900&q=80"
    ],
    Accessories: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80"
    ],
    Style: [
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80"
    ],
    Furniture: [
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=900&q=80"
    ],
    Electronics: [
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=900&q=80"
    ],
    Footwear: [
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80"
    ],
    Clothes: [
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80"
    ],
    "Hair Accessories": [
      "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=900&q=80"
    ]
  };

  return [product.image, ...(categoryImages[product.category] ?? categoryImages.Accessories)];
}

function deliveryEstimate(date = new Date()) {
  const earliest = new Date(date);
  const latest = new Date(date);
  earliest.setDate(earliest.getDate() + 3);
  latest.setDate(latest.getDate() + 6);

  return `${earliest.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  })} - ${latest.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  })}`;
}

function orderDate(value: unknown): Date | null {
  if (value && typeof value === "object") {
    const toMillis = (value as { toMillis?: () => unknown }).toMillis;
    if (typeof toMillis === "function") {
      const milliseconds = Number(toMillis.call(value));
      return Number.isFinite(milliseconds) ? new Date(milliseconds) : null;
    }
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

function formatOrderDate(date: Date | null, fallback = "-") {
  if (!date || Number.isNaN(date.getTime())) {
    return fallback;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function orderText(value: unknown, fallback = "-") {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return fallback;
}

function orderNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export default function Home() {
  const [currentView, setCurrentView] = useState<AppView>("shop");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSubcategory, setActiveSubcategory] = useState("All");
  const [sortOption, setSortOption] = useState<SortOption>("featured");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");
  const [brandFilter, setBrandFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<number[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: "bot",
      text: "Hi, I can help with orders, coupons, delivery, returns, and product picks."
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [productQuantities, setProductQuantities] = useState<Record<number, number>>(
    {}
  );
  const [productRatings, setProductRatings] = useState<Record<number, number[]>>(
    {}
  );
  const [couponCode, setCouponCode] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageZoomed, setImageZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState("50% 50%");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authName, setAuthName] = useState("Sneha Customer");
  const [authEmail, setAuthEmail] = useState("customer@example.com");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [profileName, setProfileName] = useState("Sneha Customer");
  const [profileEmail, setProfileEmail] = useState("customer@example.com");
  const [profilePhone, setProfilePhone] = useState("+1 555 010 1488");
  const [profileAddress, setProfileAddress] = useState("42 Market Street");
  const [profileCity, setProfileCity] = useState("San Francisco, CA");
  const [dashboardRange, setDashboardRange] = useState<DashboardRange>("30d");
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "SC-1048",
      date: "July 3, 2026",
      status: "Delivered",
      total: 126.42,
      items: [
        { ...products[0], quantity: 1 },
        { ...products[2], quantity: 2 }
      ]
    }
  ]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentOrdersLoading, setRecentOrdersLoading] = useState(true);
  const [recentOrdersError, setRecentOrdersError] = useState("");
  const [paymentMethods] = useState<PaymentMethod[]>([
    {
      id: 1,
      label: "Visa ending 4242",
      detail: "Expires 08/29",
      default: true
    },
    {
      id: 2,
      label: "PayPal",
      detail: "customer@example.com",
      default: false
    },
    {
      id: 3,
      label: "Store gift card",
      detail: "$50.00 available",
      default: false
    }
  ]);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [themeAnimating, setThemeAnimating] = useState(false);
  const [flashSaleSecondsLeft, setFlashSaleSecondsLeft] = useState(8 * 60 * 60);


  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCustomer(null);
        setCart([]);
        setWishlist([]);
        return;
      }

      const nextCustomer = {
        name: user.displayName || "Sneha Customer",
        email: user.email || "customer@example.com",
        phone: "+1 555 010 1488",
        address: "42 Market Street",
        city: "San Francisco, CA"
      };
      setCustomer(nextCustomer);
      setProfileName(nextCustomer.name);
      setProfileEmail(nextCustomer.email);
      setAuthName(nextCustomer.name);
      setAuthEmail(nextCustomer.email);

      try {
        const storeSnapshot = await getDoc(doc(db, "users", user.uid));
        if (!storeSnapshot.exists()) {
          return;
        }

        const storeData = storeSnapshot.data() as UserStoreData;
        if (Array.isArray(storeData.cart)) {
          setCart(storeData.cart);
        }
        if (Array.isArray(storeData.wishlist)) {
          setWishlist(storeData.wishlist);
        }
        if (Array.isArray(storeData.orders)) {
          setOrders(storeData.orders);
        }
      } catch (error) {
        console.error("Failed to load Firestore user store", error);
        showToast("Could not load Firestore data");
      }
    });
  }, []);

  useEffect(() => {
    setRecentOrdersLoading(true);
    setRecentOrdersError("");
    const recentOrdersQuery = firestoreQuery(
      collection(db, "orders"),
      orderBy("date", "desc"),
      limit(10)
    );

    return onSnapshot(
      recentOrdersQuery,
      (snapshot) => {
        const nextOrders = snapshot.docs.map((snapshotDocument) => {
          const data = snapshotDocument.data() as Record<string, unknown>;
          const items = Array.isArray(data.items) ? data.items : [];
          const productNames = items
            .map((item) =>
              item && typeof item === "object" && "name" in item
                ? String((item as { name?: unknown }).name ?? "Product")
                : "Product"
            )
            .filter(Boolean);
          const quantity = items.reduce((total, item) => {
            const itemQuantity =
              item && typeof item === "object" && "quantity" in item
                ? Number((item as { quantity?: unknown }).quantity)
                : 0;
            return total + (Number.isFinite(itemQuantity) ? itemQuantity : 0);
          }, 0);
          const customerData = data.customer as { name?: unknown } | undefined;
          const date = orderDate(data.date) ?? orderDate(data.placedAt);

          return {
            id: String(data.orderId ?? data.id ?? snapshotDocument.id),
            customer: String(data.customerName ?? customerData?.name ?? data.userEmail ?? "Guest customer"),
            product: String(data.productName ?? (productNames.join(", ") || "—")),
            quantity: Number(data.quantity ?? quantity),
            total: Number(data.price ?? data.total ?? (data.orderSummary as { total?: unknown } | undefined)?.total ?? 0),
            status: String(data.status ?? "Processing"),
            date,
            dateLabel: formatOrderDate(date, typeof data.date === "string" ? data.date : "Pending")
          };
        });

        setRecentOrders(nextOrders);
        setRecentOrdersLoading(false);
      },
      (error) => {
        console.error("Failed to load recent orders", error);
        setRecentOrdersError("Recent orders are unavailable.");
        setRecentOrdersLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("sneha-theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("sneha-theme", theme);
  }, [theme]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setFlashSaleSecondsLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoadingProducts(false), 700);

    return () => window.clearTimeout(timer);
  }, []);

  const filteredProducts = useMemo(() => {
    const categorySubcategories = subcategoriesByCategory[activeCategory];
    const allSubcategory = categorySubcategories?.[0];
    const normalizedQuery = query.trim().toLowerCase();

    return products
      .filter((product) => {
        const categoryMatch =
          activeCategory === "All" || displayCategory(product) === activeCategory;
        const subcategoryMatch =
          !categorySubcategories ||
          activeSubcategory === allSubcategory ||
          product.subcategory === activeSubcategory;
        const priceMatch = matchesPriceFilter(product, priceFilter);
        const ratingMatch =
          ratingFilter === "all" || displayRating(product) >= Number(ratingFilter);
        const brandMatch =
          brandFilter === "All" || productBrand(product) === brandFilter;
        const searchableText = [
          product.name,
          displayCategory(product),
          product.category,
          product.subcategory,
          product.tag,
          productBrand(product),
          searchKeywords(product)
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const queryMatch =
          normalizedQuery === "" || searchableText.includes(normalizedQuery);
        return (
          categoryMatch &&
          subcategoryMatch &&
          priceMatch &&
          ratingMatch &&
          brandMatch &&
          queryMatch
        );
      })
      .sort((a, b) => {
        if (sortOption === "priceLowHigh") {
          return salePrice(a) - salePrice(b);
        }

        if (sortOption === "priceHighLow") {
          return salePrice(b) - salePrice(a);
        }

        if (sortOption === "popularity") {
          return purchaseCount(b) - purchaseCount(a);
        }

        if (sortOption === "newest") {
          return b.id - a.id;
        }

        if (activeCategory !== "All") {
          return b.price - a.price;
        }

        return pricePriority(a) - pricePriority(b) || a.price - b.price;
      });
  }, [
    activeCategory,
    activeSubcategory,
    brandFilter,
    priceFilter,
    productRatings,
    query,
    ratingFilter,
    sortOption
  ]);

  const suggestedProducts = useMemo(() => {
    if (!selectedProduct) {
      return [];
    }

    return products
      .filter(
        (product) =>
          product.id !== selectedProduct.id &&
          (product.category === selectedProduct.category ||
            product.subcategory === selectedProduct.subcategory)
      )
      .sort((a, b) => displayRating(b) - displayRating(a))
      .slice(0, 3);
  }, [selectedProduct, productRatings]);

  const highestRatedProducts = useMemo(
    () =>
      [...products]
        .sort((a, b) => displayRating(b) - displayRating(a))
        .slice(0, 3),
    [productRatings]
  );

  const highestPurchasedProducts = useMemo(
    () => [...products].sort((a, b) => purchaseCount(b) - purchaseCount(a)).slice(0, 3),
    []
  );

  const flashSaleProducts = useMemo(
    () =>
      products
        .filter((product) => product.price >= 30)
        .sort((a, b) => salePrice(b) - salePrice(a))
        .slice(0, 10),
    []
  );

  const trendingProducts = useMemo(
    () =>
      [...products]
        .sort(
          (a, b) =>
            purchaseCount(b) - purchaseCount(a) ||
            displayRating(b) - displayRating(a)
        )
        .slice(0, 8),
    [productRatings]
  );

  const newArrivalProducts = useMemo(
    () => [...products].sort((a, b) => b.id - a.id).slice(0, 8),
    []
  );

  const brands = useMemo(
    () => ["All", ...Array.from(new Set(products.map((product) => productBrand(product))))],
    []
  );

  const compareProducts = useMemo(
    () => products.filter((product) => compareIds.includes(product.id)),
    [compareIds]
  );

  const recentlyViewedProducts = useMemo(
    () => recentlyViewedIds
      .map((id) => products.find((product) => product.id === id))
      .filter((product): product is Product => Boolean(product)),
    [recentlyViewedIds]
  );

  const aiRecommendedProducts = useMemo(() => {
    const interestProducts = [
      ...cart,
      ...products.filter((product) => wishlist.includes(product.id)),
      ...recentlyViewedProducts
    ];
    const interestCategories = new Set(interestProducts.map((product) => product.category));
    const interestBrands = new Set(interestProducts.map((product) => productBrand(product)));

    return [...products]
      .filter(
        (product) =>
          !cart.some((item) => item.id === product.id) &&
          !wishlist.includes(product.id)
      )
      .sort((a, b) => {
        const score = (product: Product) =>
          displayRating(product) * 20 +
          purchaseCount(product) / 12 +
          (interestCategories.has(product.category) ? 30 : 0) +
          (interestBrands.has(productBrand(product)) ? 12 : 0) +
          (recentlyViewedIds.includes(product.id) ? 10 : 0);

        return score(b) - score(a);
      })
      .slice(0, 8);
  }, [cart, productRatings, recentlyViewedIds, recentlyViewedProducts, wishlist]);

  const selectedProductImages = selectedProduct ? usageImages(selectedProduct) : [];
  const selectedProductImage =
    selectedProductImages[selectedImageIndex] ?? selectedProduct?.image ?? "";
  const estimatedDelivery = deliveryEstimate();

  const flashSaleHours = Math.floor(flashSaleSecondsLeft / 3600);
  const flashSaleMinutes = Math.floor((flashSaleSecondsLeft % 3600) / 60);
  const flashSaleSeconds = flashSaleSecondsLeft % 60;
  const flashSaleCountdown = [flashSaleHours, flashSaleMinutes, flashSaleSeconds].map(
    (unit) => unit.toString().padStart(2, "0")
  );

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce(
    (total, item) => total + salePrice(item) * item.quantity,
    0
  );
  const normalizedCoupon = couponCode.trim().toUpperCase();
  const discountRate =
    normalizedCoupon === "SAVE15" ? 0.15 : normalizedCoupon === "WELCOME10" ? 0.1 : 0;
  const discount = subtotal * discountRate;
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const shipping = discountedSubtotal >= 75 || discountedSubtotal === 0 ? 0 : 8;
  const tax = discountedSubtotal * 0.0825;
  const orderTotal = discountedSubtotal + shipping + tax;
  const dashboardMultiplier =
    dashboardRange === "7d" ? 0.35 : dashboardRange === "90d" ? 2.65 : 1;
  const dashboardRevenue =
    orders.reduce((total, order) => total + order.total, 0) * dashboardMultiplier +
    orderTotal * 0.42;
  const dashboardOrders = Math.max(1, Math.round(orders.length * dashboardMultiplier));
  const dashboardConversion = Math.min(
    18,
    Number((6.2 + wishlist.length * 0.4 + cartCount * 0.25).toFixed(1))
  );
  const dashboardAverageOrder = dashboardRevenue / dashboardOrders;
  const dashboardRevenueBars = [
    { label: "Mon", value: 42 },
    { label: "Tue", value: 64 },
    { label: "Wed", value: 52 },
    { label: "Thu", value: 78 },
    { label: "Fri", value: 91 },
    { label: "Sat", value: 86 },
    { label: "Sun", value: 68 }
  ].map((item) => ({
    ...item,
    value: Math.round(item.value * dashboardMultiplier)
  }));
  const dashboardMaxRevenue = Math.max(...dashboardRevenueBars.map((item) => item.value));
  const dashboardTopCategories = useMemo(
    () =>
      Object.entries(
        products.reduce<Record<string, number>>((totals, product) => {
          const category = displayCategory(product);
          totals[category] =
            (totals[category] ?? 0) + purchaseCount(product) * salePrice(product);
          return totals;
        }, {})
      )
        .map(([label, value]) => ({
          label,
          value: Math.round(value * dashboardMultiplier)
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5),
    [dashboardMultiplier]
  );
  const dashboardCategoryMax = Math.max(
    ...dashboardTopCategories.map((category) => category.value)
  );
  const dashboardTopProducts = useMemo(
    () => [...products].sort((a, b) => purchaseCount(b) - purchaseCount(a)).slice(0, 5),
    []
  );

  function showToast(message: string) {
    const id = Date.now();
    setToasts((current) => [...current, { id, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 2600);
  }

  async function saveUserStore(data: UserStoreData) {
    const user = auth.currentUser;
    if (!user) {
      return false;
    }

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          ...data,
          email: user.email,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
      return true;
    } catch (error) {
      console.error("Failed to save Firestore user store", error);
      showToast("Could not sync with Firestore");
      return false;
    }
  }

  async function saveCartItem(item: CartItem) {
    const user = auth.currentUser;
    if (!user) {
      return;
    }

    try {
      await setDoc(
        doc(db, "users", user.uid, "cart", String(item.id)),
        {
          ...item,
          userId: user.uid,
          userEmail: user.email,
          salePrice: Number(salePrice(item).toFixed(2)),
          lineTotal: Number((salePrice(item) * item.quantity).toFixed(2)),
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
      await setDoc(
        doc(db, "cart", `${user.uid}_${item.id}`),
        {
          ...item,
          userId: user.uid,
          userEmail: user.email,
          salePrice: Number(salePrice(item).toFixed(2)),
          lineTotal: Number((salePrice(item) * item.quantity).toFixed(2)),
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Failed to save cart item", error);
      showToast("Could not sync cart item");
    }
  }

  async function removeCartItemDocument(id: number) {
    const user = auth.currentUser;
    if (!user) {
      return;
    }

    try {
      await deleteDoc(doc(db, "users", user.uid, "cart", String(id)));
      await deleteDoc(doc(db, "cart", `${user.uid}_${id}`));
    } catch (error) {
      console.error("Failed to remove cart item", error);
      showToast("Could not sync cart item");
    }
  }

  async function saveWishlistItem(product: Product) {
    const user = auth.currentUser;
    if (!user) {
      return;
    }

    try {
      await setDoc(
        doc(db, "users", user.uid, "wishlist", String(product.id)),
        {
          ...product,
          userId: user.uid,
          userEmail: user.email,
          salePrice: Number(salePrice(product).toFixed(2)),
          savedAt: serverTimestamp()
        },
        { merge: true }
      );
      await setDoc(
        doc(db, "wishlist", `${user.uid}_${product.id}`),
        {
          ...product,
          userId: user.uid,
          userEmail: user.email,
          salePrice: Number(salePrice(product).toFixed(2)),
          savedAt: serverTimestamp()
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Failed to save wishlist item", error);
      showToast("Could not sync wishlist item");
    }
  }

  async function removeWishlistItemDocument(id: number) {
    const user = auth.currentUser;
    if (!user) {
      return;
    }

    try {
      await deleteDoc(doc(db, "users", user.uid, "wishlist", String(id)));
      await deleteDoc(doc(db, "wishlist", `${user.uid}_${id}`));
    } catch (error) {
      console.error("Failed to remove wishlist item", error);
      showToast("Could not sync wishlist item");
    }
  }

  async function saveOrderDocument(order: Order, orderSummary: UserStoreData["orderSummary"]) {
    const user = auth.currentUser;
    if (!user) {
      return false;
    }

    const orderData = {
      ...order,
      customer: {
        id: user.uid,
        email: user.email,
        name: customer?.name ?? user.displayName ?? "Sneha Customer",
        phone: customer?.phone ?? profilePhone,
        address: customer?.address ?? profileAddress,
        city: customer?.city ?? profileCity
      },
      userId: user.uid,
      userEmail: user.email,
      orderSummary,
      placedAt: serverTimestamp()
    };

    try {
      await setDoc(doc(db, "users", user.uid, "orders", order.id), orderData);
      await setDoc(doc(db, "orders", order.id), orderData);
      return true;
    } catch (error) {
      console.error("Failed to save order", error);
      showToast("Could not sync order");
      return false;
    }
  }

  function requireSignedInForStore(action: string) {
    if (auth.currentUser) {
      return true;
    }

    showToast(`Sign in to ${action}`);
    setCurrentView("login");
    return false;
  }

  function addToCart(product: Product, quantity = 1) {
    if (!requireSignedInForStore("add items to cart")) {
      return;
    }

    const safeQuantity = Math.max(1, quantity);
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        const nextCart = current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + safeQuantity }
            : item
        );
        const updatedItem = nextCart.find((item) => item.id === product.id);
        void saveUserStore({ cart: nextCart });
        if (updatedItem) {
          void saveCartItem(updatedItem);
        }
        return nextCart;
      }
      const nextCart = [...current, { ...product, quantity: safeQuantity }];
      const addedItem = nextCart.find((item) => item.id === product.id);
      void saveUserStore({ cart: nextCart });
      if (addedItem) {
        void saveCartItem(addedItem);
      }
      return nextCart;
    });
    setCartOpen(true);
    showToast(`${product.name} added to cart`);
  }

  function selectedQuantity(productId: number) {
    return productQuantities[productId] ?? 1;
  }

  function setSelectedQuantity(productId: number, quantity: number) {
    setProductQuantities((current) => ({
      ...current,
      [productId]: quantity
    }));
  }

  function toggleWishlist(productId: number) {
    if (!requireSignedInForStore("use your wishlist")) {
      return;
    }

    const product = products.find((item) => item.id === productId);
    setWishlist((current) => {
      const isSaved = current.includes(productId);
      const nextWishlist = current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId];
      void saveUserStore({ wishlist: nextWishlist });
      if (product) {
        void (isSaved
          ? removeWishlistItemDocument(productId)
          : saveWishlistItem(product));
      }
      return nextWishlist;
    });
    if (product) {
      showToast(
        wishlist.includes(productId)
          ? `${product.name} removed from wishlist`
          : `${product.name} saved to wishlist`
      );
    }
  }

  function toggleCompare(productId: number) {
    const product = products.find((item) => item.id === productId);
    setCompareIds((current) => {
      if (current.includes(productId)) {
        return current.filter((id) => id !== productId);
      }

      if (current.length >= 3) {
        showToast("Compare supports up to 3 products");
        return current;
      }

      return [...current, productId];
    });

    if (product && !compareIds.includes(productId) && compareIds.length < 3) {
      showToast(`${product.name} added to compare`);
    }
  }

  function displayRating(product: Product) {
    const ratings = productRatings[product.id] ?? [];
    if (ratings.length === 0) {
      return product.rating;
    }

    const total = ratings.reduce((sum, rating) => sum + rating, product.rating);
    return total / (ratings.length + 1);
  }

  function displayReviewCount(product: Product) {
    return baseReviewCount(product) + (productRatings[product.id]?.length ?? 0);
  }

  function rateProduct(productId: number, rating: number) {
    setProductRatings((current) => ({
      ...current,
      [productId]: [...(current[productId] ?? []), rating]
    }));
  }

  function updateQuantity(id: number, amount: number) {
    setCart((current) => {
      const nextCart = current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + amount) }
            : item
        )
        .filter((item) => item.quantity > 0);
      const updatedItem = nextCart.find((item) => item.id === id);
      void saveUserStore({ cart: nextCart });
      void (updatedItem ? saveCartItem(updatedItem) : removeCartItemDocument(id));
      return nextCart;
    });
  }

  function removeFromCart(id: number) {
    setCart((current) => {
      const nextCart = current.filter((item) => item.id !== id);
      void saveUserStore({ cart: nextCart });
      void removeCartItemDocument(id);
      return nextCart;
    });
  }

  function clearFilters() {
    setActiveCategory("All");
    setActiveSubcategory("All");
    setSortOption("featured");
    setPriceFilter("all");
    setRatingFilter("all");
    setBrandFilter("All");
    setQuery("");
  }

  function selectCategoryCard(card: CategoryCard) {
    setActiveCategory(card.category);
    setActiveSubcategory(defaultSubcategory(card.category));
    setSortOption("featured");
    setPriceFilter("all");
    setRatingFilter("all");
    setBrandFilter("All");
    setQuery(card.query);
  }

  function openProduct(product: Product) {
    setSelectedProduct(product);
    setSelectedImageIndex(0);
    setImageZoomed(false);
    setZoomPosition("50% 50%");
    setRecentlyViewedIds((current) => [
      product.id,
      ...current.filter((id) => id !== product.id)
    ].slice(0, 6));
    setCurrentView("product");
  }

  function handleProductImageMove(event: MouseEvent<HTMLButtonElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    setZoomPosition(`${x}% ${y}%`);
  }

  function startVoiceSearch() {
    const SpeechRecognition =
      (window as typeof window & {
        SpeechRecognition?: new () => {
          continuous: boolean;
          interimResults: boolean;
          lang: string;
          start: () => void;
          onresult: ((event: {
            results: { [key: number]: { [key: number]: { transcript: string } } };
          }) => void) | null;
          onend: (() => void) | null;
          onerror: (() => void) | null;
        };
        webkitSpeechRecognition?: new () => {
          continuous: boolean;
          interimResults: boolean;
          lang: string;
          start: () => void;
          onresult: ((event: {
            results: { [key: number]: { [key: number]: { transcript: string } } };
          }) => void) | null;
          onend: (() => void) | null;
          onerror: (() => void) | null;
        };
      }).SpeechRecognition ||
      (window as typeof window & {
        webkitSpeechRecognition?: new () => {
          continuous: boolean;
          interimResults: boolean;
          lang: string;
          start: () => void;
          onresult: ((event: {
            results: { [key: number]: { [key: number]: { transcript: string } } };
          }) => void) | null;
          onend: (() => void) | null;
          onerror: (() => void) | null;
        };
      }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast("Voice search is not available in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setCurrentView("shop");
      window.location.hash = "shop";
      showToast(`Searching for "${transcript}"`);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setIsListening(false);
      showToast("Voice search could not hear that");
    };
    setIsListening(true);
    recognition.start();
  }

  function sendChatMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = chatInput.trim();
    if (!message) {
      return;
    }

    const lower = message.toLowerCase();
    const response = lower.includes("coupon") || lower.includes("promo")
      ? "Try SAVE15 for 15% off or WELCOME10 for 10% off at checkout."
      : lower.includes("delivery") || lower.includes("shipping")
        ? `Orders over $75 ship free. Your estimated delivery window is ${estimatedDelivery}.`
        : lower.includes("return")
          ? "Returns are accepted within 30 days when items are unused and in original packaging."
          : lower.includes("recommend")
            ? "I recommend checking the AI picks section, which updates from your wishlist, cart, and recently viewed items."
            : "I can help with coupons, delivery, returns, checkout, and product recommendations.";

    setChatMessages((current) => [
      ...current,
      { sender: "user", text: message },
      { sender: "bot", text: response }
    ]);
    setChatInput("");
  }

  function toggleTheme() {
    setThemeAnimating(true);
    setTheme((current) => (current === "dark" ? "light" : "dark"));
    window.setTimeout(() => setThemeAnimating(false), 620);
  }

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError("");

    const email = authEmail.trim();
    const password = authPassword.trim();
    if (!email || !password) {
      setAuthError("Enter your email and password.");
      return;
    }

    setAuthLoading(true);
    try {
      const credential =
        authMode === "signup"
          ? await createUserWithEmailAndPassword(auth, email, password)
          : await signInWithEmailAndPassword(auth, email, password);

      if (authMode === "signup" && authName.trim()) {
        await updateProfile(credential.user, {
          displayName: authName.trim()
        });
      }

      const displayName =
        authMode === "signup"
          ? authName.trim() || "Sneha Customer"
          : credential.user.displayName || authName.trim() || "Sneha Customer";

      await credential.user.reload();

      const nextCustomer = {
        name: displayName,
        email: credential.user.email || email,
        phone: profilePhone,
        address: profileAddress,
        city: profileCity
      };
      setCustomer(nextCustomer);
      setProfileName(nextCustomer.name);
      setProfileEmail(nextCustomer.email);
      setAuthPassword("");
      setCurrentView("shop");
      showToast(authMode === "login" ? "Signed in" : "Account created");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message.replace("Firebase: ", "").replace(/\s*\(auth\/.*\)\.?$/, ".")
          : "Authentication failed.";
      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  }

  function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextCustomer = {
      name: profileName.trim() || "Sneha Customer",
      email: profileEmail.trim() || "customer@example.com",
      phone: profilePhone.trim() || "+1 555 010 1488",
      address: profileAddress.trim() || "42 Market Street",
      city: profileCity.trim() || "San Francisco, CA"
    };
    setCustomer(nextCustomer);
    setAuthName(nextCustomer.name);
    setAuthEmail(nextCustomer.email);
    showToast("Profile updated");
  }

  async function handleSignOut() {
    await signOut(auth);
    setAuthPassword("");
    setCurrentView("shop");
    showToast("Signed out");
  }

  async function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!requireSignedInForStore("place orders")) {
      return;
    }

    if (cart.length === 0) {
      return;
    }

    const newOrder: Order = {
      id: `SC-${Math.floor(1100 + Math.random() * 8900)}`,
      date: "July 8, 2026",
      status: "Processing",
      total: orderTotal,
      items: cart
    };

    const nextOrders = [newOrder, ...orders];
    const orderSummary = {
      subtotal: Number(subtotal.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      shipping: Number(shipping.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      total: Number(orderTotal.toFixed(2)),
      couponCode: normalizedCoupon,
      estimatedDelivery,
      itemCount: cartCount
    };

    const orderSaved = await saveOrderDocument(newOrder, orderSummary);
    if (!orderSaved) {
      return;
    }

    const storeSaved = await saveUserStore({
      cart: [],
      orders: nextOrders,
      orderSummary
    });
    if (!storeSaved) {
      return;
    }

    setOrders(nextOrders);
    setCart([]);
    await Promise.all(cart.map((item) => removeCartItemDocument(item.id)));
    showToast("Order saved to Firebase");
    setCurrentView("orders");
  }

  return (
    <main
      className={`${theme === "dark" ? "theme-dark" : "theme-light"} ${
        themeAnimating ? "theme-animating" : ""
      }`}
    >
      <header className="site-header">
        <a className="brand" href="#">
          <span>S</span>
          Sneha Carries
        </a>
        <nav className={menuOpen ? "nav nav-open" : "nav"}>
          <button onClick={() => setCurrentView("shop")}>Shop</button>
          <button onClick={() => setCurrentView(customer ? "profile" : "login")}>Profile</button>
          <button onClick={() => setCurrentView("dashboard")}>Dashboard</button>
          <button onClick={() => setCurrentView("wishlist")}>
            Wishlist ({wishlist.length})
          </button>
          <button onClick={() => setCurrentView("orders")}>Orders</button>
          <button onClick={() => setCurrentView("payments")}>Payments</button>
          <a href="#support" onClick={() => setCurrentView("shop")}>
            Support
          </a>
        </nav>
        <div className="header-actions">
          <button
            className="account-button"
            onClick={() => setCurrentView(customer ? "profile" : "login")}
          >
            <User size={17} />
            <span>{customer ? customer.name.split(" ")[0] : "Sign in"}</span>
          </button>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            data-tooltip={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            <span className={theme === "dark" ? "active" : ""}>
              <Moon size={16} />
            </span>
            <span className={theme === "light" ? "active" : ""}>
              <Sun size={16} />
            </span>
          </button>
          <button
            className="icon-button"
            data-tooltip="Search"
            aria-label="Search"
            onClick={() => {
              setCurrentView("shop");
              window.location.hash = "shop";
            }}
          >
            <Search size={19} />
          </button>
          <button
            className="cart-button"
            onClick={() => setCartOpen(true)}
            data-tooltip="Shopping cart"
            aria-label="Open cart"
          >
            <ShoppingBag size={19} />
            <span>{cartCount}</span>
          </button>
          <button
            className="icon-button mobile-only"
            onClick={() => setMenuOpen((open) => !open)}
            data-tooltip="Menu"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {currentView !== "shop" ? (
        <section className="account-page">
          {currentView === "login" && (
            <div className="account-layout">
              <div className="account-copy">
                <span>Account access</span>
                <h1>{authMode === "login" ? "Sign in to your account." : "Create your account."}</h1>
                <p>
                  Save payment methods, review order history, and move through
                  checkout faster.
                </p>
              </div>
              <form className="account-card" onSubmit={handleAuthSubmit}>
                <div className="form-tabs">
                  <button
                    type="button"
                    className={authMode === "login" ? "active" : ""}
                    onClick={() => setAuthMode("login")}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    className={authMode === "signup" ? "active" : ""}
                    onClick={() => setAuthMode("signup")}
                  >
                    Sign up
                  </button>
                </div>
                {authMode === "signup" && (
                  <label>
                    Full name
                    <input
                      value={authName}
                      onChange={(event) => setAuthName(event.target.value)}
                      placeholder="Your name"
                    />
                  </label>
                )}
                <label>
                  Email address
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(event) => setAuthEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(event) => setAuthPassword(event.target.value)}
                    placeholder="Enter password"
                    minLength={6}
                    required
                  />
                </label>
                {authError && <p className="form-error">{authError}</p>}
                <button type="submit" className="wide-button" disabled={authLoading}>
                  {authLoading
                    ? "Please wait..."
                    : authMode === "login"
                      ? "Sign in"
                      : "Create account"}
                </button>
              </form>
            </div>
          )}

          {currentView === "profile" && (
            <div className="profile-layout">
              <section className="profile-hero">
                <div className="profile-avatar" aria-hidden="true">
                  {customer?.name?.charAt(0).toUpperCase() ?? "S"}
                </div>
                <div>
                  <span>User profile</span>
                  <h1>{customer?.name ?? "Sneha Customer"}</h1>
                  <p>{customer?.email ?? "customer@example.com"}</p>
                </div>
              </section>

              <section className="profile-stats" aria-label="Account overview">
                <article>
                  <Package size={20} />
                  <span>Orders</span>
                  <strong>{orders.length}</strong>
                </article>
                <article>
                  <Heart size={20} />
                  <span>Wishlist</span>
                  <strong>{wishlist.length}</strong>
                </article>
                <article>
                  <CreditCard size={20} />
                  <span>Payments</span>
                  <strong>{paymentMethods.length}</strong>
                </article>
                <article>
                  <ShoppingBag size={20} />
                  <span>Cart items</span>
                  <strong>{cartCount}</strong>
                </article>
              </section>

              <div className="profile-content">
                <form className="profile-card" onSubmit={handleProfileSubmit}>
                  <div className="section-heading">
                    <span>Personal details</span>
                    <h2>Manage your account information.</h2>
                  </div>
                  <div className="form-grid">
                    <label>
                      Full name
                      <input
                        value={profileName}
                        onChange={(event) => setProfileName(event.target.value)}
                        placeholder="Full name"
                      />
                    </label>
                    <label>
                      Email address
                      <input
                        type="email"
                        value={profileEmail}
                        onChange={(event) => setProfileEmail(event.target.value)}
                        placeholder="Email address"
                      />
                    </label>
                    <label>
                      Phone
                      <input
                        value={profilePhone}
                        onChange={(event) => setProfilePhone(event.target.value)}
                        placeholder="Phone number"
                      />
                    </label>
                    <label>
                      City
                      <input
                        value={profileCity}
                        onChange={(event) => setProfileCity(event.target.value)}
                        placeholder="City"
                      />
                    </label>
                    <label>
                      Delivery address
                      <input
                        value={profileAddress}
                        onChange={(event) => setProfileAddress(event.target.value)}
                        placeholder="Street address"
                      />
                    </label>
                  </div>
                  <button className="wide-button">Save profile</button>
                </form>

                <aside className="profile-card profile-summary">
                  <div className="section-heading">
                    <span>Account shortcuts</span>
                    <h2>Review saved activity.</h2>
                  </div>
                  <button onClick={() => setCurrentView("orders")}>
                    <Package size={18} />
                    View orders
                  </button>
                  <button onClick={() => setCurrentView("wishlist")}>
                    <Heart size={18} />
                    Open wishlist
                  </button>
                  <button onClick={() => setCurrentView("payments")}>
                    <CreditCard size={18} />
                    Payment methods
                  </button>
                  <button className="sign-out-button" onClick={handleSignOut}>
                    <User size={18} />
                    Sign out
                  </button>
                  <div className="profile-delivery">
                    <span>Default delivery</span>
                    <strong>{profileAddress}</strong>
                    <p>{profileCity}</p>
                  </div>
                </aside>
              </div>
            </div>
          )}

          {currentView === "dashboard" && (
            <div className="dashboard-layout">
              <div className="dashboard-head">
                <div className="section-heading">
                  <span>Interactive dashboard</span>
                  <h2>Track store activity and customer intent.</h2>
                </div>
                <div className="dashboard-controls" aria-label="Dashboard time range">
                  {(["7d", "30d", "90d"] as DashboardRange[]).map((range) => (
                    <button
                      type="button"
                      className={dashboardRange === range ? "active" : ""}
                      onClick={() => setDashboardRange(range)}
                      key={range}
                    >
                      {range === "7d" ? "7 days" : range === "30d" ? "30 days" : "90 days"}
                    </button>
                  ))}
                </div>
              </div>

              <section className="dashboard-kpis" aria-label="Dashboard metrics">
                <article>
                  <ShoppingBag size={20} />
                  <span>Revenue</span>
                  <strong>${dashboardRevenue.toFixed(0)}</strong>
                  <em>Live cart included</em>
                </article>
                <article>
                  <Package size={20} />
                  <span>Orders</span>
                  <strong>{dashboardOrders}</strong>
                  <em>{orders[0]?.status ?? "No recent status"}</em>
                </article>
                <article>
                  <BadgePercent size={20} />
                  <span>Conversion</span>
                  <strong>{dashboardConversion}%</strong>
                  <em>{wishlist.length} saved products</em>
                </article>
                <article>
                  <CreditCard size={20} />
                  <span>Avg. order</span>
                  <strong>${dashboardAverageOrder.toFixed(0)}</strong>
                  <em>{paymentMethods.length} payment options</em>
                </article>
              </section>

              <div className="dashboard-grid">
                <section className="dashboard-panel revenue-panel">
                  <div>
                    <span>Revenue trend</span>
                    <strong>{dashboardRange === "7d" ? "This week" : dashboardRange === "30d" ? "This month" : "This quarter"}</strong>
                  </div>
                  <div className="bar-chart" aria-label="Revenue by day">
                    {dashboardRevenueBars.map((item) => (
                      <button
                        type="button"
                        key={item.label}
                        style={{ height: `${Math.max(18, (item.value / dashboardMaxRevenue) * 100)}%` }}
                        onClick={() => showToast(`${item.label}: $${item.value * 18} revenue`)}
                        aria-label={`${item.label} revenue`}
                      >
                        <span>${item.value * 18}</span>
                        <em>{item.label}</em>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="dashboard-panel">
                  <div>
                    <span>Category performance</span>
                    <strong>Top departments</strong>
                  </div>
                  <div className="category-bars">
                    {dashboardTopCategories.map((category) => (
                      <button
                        type="button"
                        key={category.label}
                        onClick={() => {
                          setActiveCategory(category.label);
                          setCurrentView("shop");
                          window.location.hash = "shop";
                        }}
                      >
                        <span>{category.label}</span>
                        <strong>${category.value.toLocaleString()}</strong>
                        <i
                          style={{
                            width: `${Math.max(12, (category.value / dashboardCategoryMax) * 100)}%`
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </section>

                <section className="dashboard-panel">
                  <div>
                    <span>Product signals</span>
                    <strong>Most purchased</strong>
                  </div>
                  <div className="dashboard-products">
                    {dashboardTopProducts.map((product, index) => (
                      <button
                        type="button"
                        onClick={() => openProduct(product)}
                        key={product.id}
                      >
                        <span>{index + 1}</span>
                        <div>
                          <strong>{product.name}</strong>
                          <em>{purchaseCount(product)} purchases</em>
                        </div>
                        <Star size={16} fill="currentColor" />
                      </button>
                    ))}
                  </div>
                </section>

                <section className="dashboard-panel dashboard-actions">
                  <div>
                    <span>Quick actions</span>
                    <strong>Move from insight to action.</strong>
                  </div>
                  <button onClick={() => setCurrentView("orders")}>
                    <Package size={18} />
                    Review orders
                  </button>
                  <button onClick={() => setCurrentView("payments")}>
                    <CreditCard size={18} />
                    Audit payments
                  </button>
                  <button onClick={() => setCurrentView("wishlist")}>
                    <Heart size={18} />
                    Check wishlist demand
                  </button>
                </section>
              </div>

              <section className="dashboard-panel recent-orders-panel" aria-labelledby="recent-orders-title">
                <div>
                  <span>Order activity</span>
                  <strong id="recent-orders-title">Recent orders</strong>
                </div>
                <div className="recent-orders-table-wrap">
                  <table className="recent-orders-table">
                    <thead>
                      <tr>
                        <th scope="col">Order ID</th>
                        <th scope="col">Customer</th>
                        <th scope="col">Product</th>
                        <th scope="col">Quantity</th>
                        <th scope="col">Total Price</th>
                        <th scope="col">Order Status</th>
                        <th scope="col">Order Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrdersLoading && (
                        <tr>
                          <td colSpan={7} className="recent-orders-message">Loading recent orders…</td>
                        </tr>
                      )}
                      {!recentOrdersLoading && recentOrdersError && (
                        <tr>
                          <td colSpan={7} className="recent-orders-message">{recentOrdersError}</td>
                        </tr>
                      )}
                      {!recentOrdersLoading && !recentOrdersError && recentOrders.length === 0 && (
                        <tr>
                          <td colSpan={7} className="recent-orders-message">No orders have been placed yet.</td>
                        </tr>
                      )}
                      {recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td data-label="Order ID">{order.id}</td>
                          <td data-label="Customer">{order.customer}</td>
                          <td data-label="Product" className="recent-order-product">{order.product}</td>
                          <td data-label="Quantity">{order.quantity}</td>
                          <td data-label="Total Price">${order.total.toFixed(2)}</td>
                          <td data-label="Order Status"><span className="order-status">{order.status}</span></td>
                          <td data-label="Order Date">{order.dateLabel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {currentView === "checkout" && (
            <div className="checkout-layout">
              <form className="checkout-form" onSubmit={placeOrder}>
                <span>Secure checkout</span>
                <h1>Delivery and payment</h1>
                <div className="form-grid">
                  <label>
                    Full name
                    <input defaultValue={customer?.name ?? ""} placeholder="Full name" />
                  </label>
                  <label>
                    Email
                    <input
                      type="email"
                      defaultValue={customer?.email ?? ""}
                      placeholder="Email address"
                    />
                  </label>
                  <label>
                    Address
                    <input placeholder="Street address" />
                  </label>
                  <label>
                    City
                    <input placeholder="City" />
                  </label>
                </div>
                <div className="payment-choice">
                  <CreditCard size={20} />
                  <div>
                    <strong>{paymentMethods[0].label}</strong>
                    <span>{paymentMethods[0].detail}</span>
                  </div>
                  <button type="button" onClick={() => setCurrentView("payments")}>
                    Change
                  </button>
                </div>
                <button className="wide-button" disabled={cart.length === 0}>
                  Place order
                </button>
              </form>
              <aside className="checkout-summary">
                <span>Order summary</span>
                <h2>{cartCount} items</h2>
                {cart.length === 0 ? (
                  <p>Your cart is empty.</p>
                ) : (
                  cart.map((item) => (
                    <div className="summary-item" key={item.id}>
                      <span>{item.name} x {item.quantity}</span>
                      <strong>${(salePrice(item) * item.quantity).toFixed(2)}</strong>
                    </div>
                  ))
                )}
                <div className="summary-total">
                  <span>Total</span>
                  <strong>${orderTotal.toFixed(2)}</strong>
                </div>
                <div className="summary-delivery">
                  <span>Estimated delivery</span>
                  <strong>{estimatedDelivery}</strong>
                </div>
                {discount > 0 && (
                  <div className="summary-discount">
                    <span>Coupon {normalizedCoupon}</span>
                    <strong>-${discount.toFixed(2)}</strong>
                  </div>
                )}
              </aside>
            </div>
          )}

          {currentView === "orders" && (
            <div className="account-stack">
              <div className="section-heading">
                <span>Order history</span>
                <h2>{customer ? `${customer.name}'s orders` : "Recent orders"}</h2>
              </div>
              <div className="history-list">
                {orders.map((order) => (
                  <article className="history-card" key={order.id}>
                    <div>
                      <Package size={22} />
                      <strong>{order.id}</strong>
                      <span>{order.date}</span>
                    </div>
                    <div>
                      <span>{order.status}</span>
                      <strong>${order.total.toFixed(2)}</strong>
                    </div>
                    <p>{order.items.map((item) => item.name).join(", ")}</p>
                  </article>
                ))}
              </div>
            </div>
          )}

          {currentView === "payments" && (
            <div className="account-stack">
              <div className="section-heading">
                <span>Payment methods</span>
                <h2>Saved payment options for checkout.</h2>
              </div>
              <div className="payment-grid">
                {paymentMethods.map((method) => (
                  <article className="payment-card" key={method.id}>
                    <CreditCard size={24} />
                    <strong>{method.label}</strong>
                    <span>{method.detail}</span>
                    {method.default && <em>Default</em>}
                  </article>
                ))}
                <article className="payment-card add-card">
                  <Plus size={24} />
                  <strong>Add payment method</strong>
                  <span>Card, wallet, or gift card</span>
                </article>
              </div>
            </div>
          )}

          {currentView === "wishlist" && (
            <div className="account-stack">
              <div className="section-heading">
                <span>Wishlist</span>
                <h2>Saved products for later.</h2>
              </div>
              <div className="product-grid">
                {wishlist.length === 0 && (
                  <div className="no-results">
                    <Heart size={26} />
                    <strong>Your wishlist is empty</strong>
                    <p>Save products from the shop to compare or buy later.</p>
                    <button onClick={() => setCurrentView("shop")}>Browse products</button>
                  </div>
                )}
                {products
                  .filter((product) => wishlist.includes(product.id))
                  .map((product) => (
                    <article className="product-card" key={product.id}>
                      <div
                        className="product-image"
                        style={{ backgroundImage: `url(${product.image})` }}
                      >
                        <span>{product.tag}</span>
                        <button
                          className="saved"
                          onClick={() => toggleWishlist(product.id)}
                          data-tooltip="Remove from wishlist"
                          aria-label={`Remove ${product.name} from wishlist`}
                        >
                          <Heart size={18} fill="currentColor" />
                        </button>
                      </div>
                      <div className="product-info">
                        <div>
                          <p>{displayCategory(product)}</p>
                          <span>
                            {productBrand(product)}
                            {product.subcategory ? ` / ${product.subcategory}` : ""}
                          </span>
                          <h3>{product.name}</h3>
                        </div>
                        <div className="rating">
                          <Star size={15} fill="currentColor" />
                          {displayRating(product).toFixed(1)}
                        </div>
                      </div>
                      <div className="product-footer">
                        <div className="price-stack">
                          <span>{offerLabel(product)}</span>
                          <strong>${salePrice(product).toFixed(2)}</strong>
                          <del>${product.price.toFixed(2)}</del>
                        </div>
                        <div className="product-actions">
                          <button
                            onClick={() => openProduct(product)}
                          >
                            Details
                          </button>
                          <button onClick={() => addToCart(product)}>
                            Add to cart
                          </button>
                        </div>
                      </div>
                    </article>
                ))}
              </div>
            </div>
          )}

          {currentView === "product" && selectedProduct && (
            <div className="product-page">
              <button className="back-button" onClick={() => setCurrentView("shop")}>
                Back to shop
              </button>
              <div className="product-page-layout">
                <div className="product-gallery">
                  <button
                    className={
                      imageZoomed
                        ? "product-page-image zoomed"
                        : "product-page-image"
                    }
                    style={{
                      backgroundImage: `url(${selectedProductImage})`,
                      backgroundPosition: imageZoomed ? zoomPosition : "center",
                      backgroundSize: imageZoomed ? "190%" : "cover"
                    }}
                    onClick={() => setImageZoomed((zoomed) => !zoomed)}
                    onMouseMove={handleProductImageMove}
                    onMouseLeave={() => setZoomPosition("50% 50%")}
                    aria-label={`Zoom ${selectedProduct.name} image`}
                  >
                    <span>{imageZoomed ? "Click to reset" : "Click to zoom"}</span>
                  </button>
                  <div className="product-thumbnails" aria-label="Product images">
                    {selectedProductImages.map((image, index) => (
                      <button
                        key={`${selectedProduct.id}-${image}`}
                        className={selectedImageIndex === index ? "active" : ""}
                        style={{ backgroundImage: `url(${image})` }}
                        onClick={() => {
                          setSelectedImageIndex(index);
                          setImageZoomed(false);
                          setZoomPosition("50% 50%");
                        }}
                        aria-label={`View image ${index + 1} for ${selectedProduct.name}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="product-page-info">
                  <span>
                    {displayCategory(selectedProduct)} / {selectedProduct.subcategory}
                  </span>
                  <h1>{selectedProduct.name}</h1>
                  <div className="product-rating-large">
                    <div>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={20}
                          fill={
                            star <= Math.round(displayRating(selectedProduct))
                              ? "currentColor"
                              : "none"
                          }
                        />
                      ))}
                    </div>
                    <strong>{displayRating(selectedProduct).toFixed(1)}</strong>
                    <span>{displayReviewCount(selectedProduct)} reviews</span>
                  </div>
                  <p>
                    A curated {displayCategory(selectedProduct).toLowerCase()} pick with
                    everyday styling, reliable quality, and gift-ready
                    presentation. Selected for easy pairing, useful function,
                    and everyday wear or home use.
                  </p>
                  <div className="detail-meta-grid">
                    <div>
                      <span>Category</span>
                      <strong>{displayCategory(selectedProduct)}</strong>
                    </div>
                    <div>
                      <span>Brand</span>
                      <strong>{productBrand(selectedProduct)}</strong>
                    </div>
                    <div>
                      <span>Type</span>
                      <strong>{selectedProduct.subcategory}</strong>
                    </div>
                    <div>
                      <span>Shipping</span>
                      <strong>Free over $75</strong>
                    </div>
                    <div>
                      <span>Returns</span>
                      <strong>30 days</strong>
                    </div>
                  </div>
                  <div className="rate-product">
                    <span>Rate this product</span>
                    <div>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => rateProduct(selectedProduct.id, rating)}
                          aria-label={`Rate ${selectedProduct.name} ${rating} stars`}
                        >
                          <Star size={20} fill="currentColor" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="detail-footer product-page-buy">
                    <div className="price-stack detail-price">
                      <span>{offerLabel(selectedProduct)} today</span>
                      <strong>${salePrice(selectedProduct).toFixed(2)}</strong>
                      <del>${selectedProduct.price.toFixed(2)}</del>
                    </div>
                    <label className="quantity-select">
                      Qty
                      <select
                        value={selectedQuantity(selectedProduct.id)}
                        onChange={(event) =>
                          setSelectedQuantity(
                            selectedProduct.id,
                            Number(event.target.value)
                          )
                        }
                      >
                        {[1, 2, 3, 4, 5].map((quantity) => (
                          <option value={quantity} key={quantity}>
                            {quantity}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      onClick={() =>
                        addToCart(
                          selectedProduct,
                          selectedQuantity(selectedProduct.id)
                        )
                      }
                    >
                      Add to cart
                    </button>
                    <button
                      className="wishlist-action"
                      onClick={() => toggleWishlist(selectedProduct.id)}
                    >
                      {wishlist.includes(selectedProduct.id)
                        ? "Saved"
                        : "Add to wishlist"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="reviews-section">
                <div className="rating-summary-card">
                  <span>Customer rating</span>
                  <strong>{displayRating(selectedProduct).toFixed(1)}</strong>
                  <p>{displayReviewCount(selectedProduct)} verified reviews</p>
                </div>
                <div className="rating-breakdown">
                  {[5, 4, 3, 2, 1].map((score) => {
                    const width = Math.max(
                      8,
                      Math.min(
                        96,
                        displayRating(selectedProduct) * 18 - (5 - score) * 14
                      )
                    );
                    return (
                      <div key={score}>
                        <span>{score} star</span>
                        <div>
                          <i style={{ width: `${width}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <article className="review-card">
                  <strong>Great quality for daily use.</strong>
                  <p>
                    The product feels polished, arrived quickly, and matched the
                    photos well.
                  </p>
                  <span>Verified buyer</span>
                </article>
                <article className="review-card">
                  <strong>Easy to style and gift.</strong>
                  <p>
                    Packaging was clean and the item worked exactly as expected.
                  </p>
                  <span>Repeat customer</span>
                </article>
              </div>

              <div className="usage-gallery-section">
                <div className="section-heading">
                  <span>Wearing and using</span>
                  <h2>See {selectedProduct.name} in real-life moments.</h2>
                </div>
                <div className="usage-gallery">
                  {usageImages(selectedProduct).map((image, index) => (
                    <figure key={image}>
                      <span style={{ backgroundImage: `url(${image})` }} />
                      <figcaption>
                        {index === 0
                          ? "Product close-up"
                          : index === 1
                            ? "Styled for daily use"
                            : index === 2
                              ? "Worn or used on the go"
                              : "Lifestyle pairing"}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>

              {suggestedProducts.length > 0 && (
                <div className="bundle-section">
                  <div className="section-heading">
                    <span>Frequently bought together</span>
                    <h2>Build a set around {selectedProduct.name}.</h2>
                  </div>
                  <div className="bundle-card">
                    {[selectedProduct, ...suggestedProducts.slice(0, 2)].map(
                      (product) => (
                        <article key={product.id}>
                          <span style={{ backgroundImage: `url(${product.image})` }} />
                          <strong>{product.name}</strong>
                          <em>${salePrice(product).toFixed(2)}</em>
                        </article>
                      )
                    )}
                    <div className="bundle-total">
                      <span>Bundle total</span>
                      <strong>
                        $
                        {[selectedProduct, ...suggestedProducts.slice(0, 2)]
                          .reduce((total, product) => total + salePrice(product), 0)
                          .toFixed(2)}
                      </strong>
                      <button
                        onClick={() =>
                          [selectedProduct, ...suggestedProducts.slice(0, 2)].forEach(
                            (product) => addToCart(product)
                          )
                        }
                      >
                        Add bundle
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="suggestion-section">
                <div className="section-heading">
                  <span>Suggestions</span>
                  <h2>Recommended with {selectedProduct.name}.</h2>
                </div>
                <div className="suggestion-grid">
                  {suggestedProducts.map((product) => (
                    <button
                      className="suggestion-card"
                      key={product.id}
                      onClick={() => {
                        setSelectedProduct(product);
                        setSelectedImageIndex(0);
                        setImageZoomed(false);
                        setZoomPosition("50% 50%");
                      }}
                    >
                      <span
                        style={{ backgroundImage: `url(${product.image})` }}
                      />
                      <strong>{product.name}</strong>
                      <em>{offerLabel(product)}</em>
                      <b>${salePrice(product).toFixed(2)}</b>
                    </button>
                  ))}
                </div>
              </div>

              <div className="analytics-section">
                <article>
                  <span>Highest purchase analysis</span>
                  <h3>Most purchased products</h3>
                  {highestPurchasedProducts.map((product, index) => (
                    <div className="analysis-row" key={product.id}>
                      <strong>{index + 1}. {product.name}</strong>
                      <span>{purchaseCount(product)} purchases</span>
                    </div>
                  ))}
                </article>
                <article>
                  <span>Highest rating analysis</span>
                  <h3>Top rated products</h3>
                  {highestRatedProducts.map((product, index) => (
                    <div className="analysis-row" key={product.id}>
                      <strong>{index + 1}. {product.name}</strong>
                      <span>{displayRating(product).toFixed(1)} rating</span>
                    </div>
                  ))}
                </article>
              </div>
            </div>
          )}
        </section>
      ) : (
        <>
      <section className="hero">
        <div className="hero-video-bg" aria-hidden="true">
          <video
            src="/homepage-banner.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        </div>
        <div className="hero-brand-film" aria-hidden="true">
          <span>Sneha Carries</span>
          <strong>Style in motion</strong>
        </div>
        <div className="hero-content">
          <p className="eyebrow">
            <Sparkles size={16} />
            Fresh arrivals for daily carry
          </p>
          <h1>Accessories and essentials made for everyday style.</h1>
          <p>
            Shop handbags, jewelry, electronics, footwear, clothes, hair
            accessories, travel goods, furniture, and useful products selected
            for easy gifting and daily use.
          </p>
          <div className="hero-actions">
            <a href="#shop" className="primary-button">
              Shop collection
              <ArrowRight size={18} />
            </a>
            <a href="#offers" className="secondary-button">
              View offers
            </a>
          </div>
        </div>
      </section>

      <section className="benefits" aria-label="Store benefits">
        <div>
          <Truck size={22} />
          <span>Free shipping over $75</span>
        </div>
        <div>
          <BadgePercent size={22} />
          <span>Seasonal bundles</span>
        </div>
        <div>
          <Heart size={22} />
          <span>Gift-ready packaging</span>
        </div>
      </section>

      <section className="quick-search" aria-labelledby="quick-search-title">
        <div className="section-heading">
          <span>Live search</span>
          <h2 id="quick-search-title">Find products as you type.</h2>
        </div>
        <label className="quick-search-box">
          <Search size={22} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search bags, electronics, beauty, men, women..."
          />
          <button
            type="button"
            className={isListening ? "voice-active" : ""}
            onClick={startVoiceSearch}
            aria-label={isListening ? "Listening for voice search" : "Voice search"}
          >
            <Mic size={16} />
          </button>
          {query && (
            <button type="button" onClick={() => setQuery("")}>
              Clear
            </button>
          )}
        </label>
        <div className="live-search-meta">
          <span>
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "product" : "products"} matching
          </span>
          <a href="#shop">View results</a>
        </div>
      </section>

      <section className="category-cards" aria-labelledby="category-cards-title">
        <div className="section-heading">
          <span>Shop by category</span>
          <h2 id="category-cards-title">Start with the department you need.</h2>
        </div>
        <div className="category-card-grid">
          {categoryCards.map((card) => (
            <a
              className="category-card"
              href="#shop"
              key={card.label}
              onClick={() => selectCategoryCard(card)}
              style={{ backgroundImage: `url(${card.image})` }}
            >
              <span>{card.label}</span>
              <strong>{card.description}</strong>
            </a>
          ))}
        </div>
      </section>

      <section className="flash-sale" aria-labelledby="flash-sale-title">
        <div className="flash-sale-top">
          <div className="section-heading">
            <span>Flash sale</span>
            <h2 id="flash-sale-title">Limited-time deals across every category.</h2>
          </div>
          <div className="countdown-timer" aria-label="Flash sale countdown">
            {flashSaleCountdown.map((unit, index) => (
              <div key={index === 0 ? "hours" : index === 1 ? "minutes" : "seconds"}>
                <strong>{unit}</strong>
                <span>{index === 0 ? "Hours" : index === 1 ? "Minutes" : "Seconds"}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flash-sale-rail" aria-label="Flash sale products">
          {flashSaleProducts.map((product) => (
            <article className="flash-sale-card" key={product.id}>
              <button
                className="flash-sale-image"
                style={{ backgroundImage: `url(${product.image})` }}
                onClick={() => openProduct(product)}
                aria-label={`View ${product.name}`}
              >
                <span>{offerLabel(product)}</span>
              </button>
              <div className="flash-sale-info">
                <p>{displayCategory(product)}</p>
                <h3>{product.name}</h3>
                <div>
                  <strong>${salePrice(product).toFixed(2)}</strong>
                  <del>${product.price.toFixed(2)}</del>
                </div>
              </div>
              <button
                className="flash-sale-button"
                onClick={() => addToCart(product, selectedQuantity(product.id))}
              >
                Add to cart
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="product-showcase" aria-labelledby="trending-title">
        <div className="section-heading">
          <span>Trending products</span>
          <h2 id="trending-title">Popular picks shoppers are buying now.</h2>
        </div>
        <div className="product-rail" aria-label="Trending products">
          {trendingProducts.map((product) => (
            <article className="rail-product-card" key={product.id}>
              <button
                className="rail-product-image"
                style={{ backgroundImage: `url(${product.image})` }}
                onClick={() => openProduct(product)}
                aria-label={`View ${product.name}`}
              >
                <span>{purchaseCount(product)} bought</span>
              </button>
              <div className="rail-product-info">
                <p>{displayCategory(product)}</p>
                <h3>{product.name}</h3>
                <div>
                  <strong>${salePrice(product).toFixed(2)}</strong>
                  <span>
                    <Star size={14} fill="currentColor" />
                    {displayRating(product).toFixed(1)}
                  </span>
                </div>
              </div>
              <button
                className="rail-product-button"
                onClick={() => addToCart(product, selectedQuantity(product.id))}
              >
                Add to cart
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="collections" id="collections">
        <div className="section-heading">
          <span>Featured collections</span>
          <h2>Designed for workdays, weekends, and travel.</h2>
        </div>
        <div className="collection-grid">
          <article className="collection-large">
            <div>
              <p>Carry edit</p>
              <h3>Bags that organize the day</h3>
            </div>
          </article>
          <article className="collection-small jewelry">
            <p>Jewelry</p>
            <h3>Small pieces, polished finish</h3>
          </article>
          <article className="collection-small travel">
            <p>Travel</p>
            <h3>Pouches, wallets, and organizers</h3>
          </article>
        </div>
      </section>

      <section className="product-showcase arrivals" aria-labelledby="arrivals-title">
        <div className="section-heading">
          <span>New arrivals</span>
          <h2 id="arrivals-title">Latest additions across fashion, tech, and home.</h2>
        </div>
        <div className="product-rail" aria-label="New arrival products">
          {newArrivalProducts.map((product) => (
            <article className="rail-product-card" key={product.id}>
              <button
                className="rail-product-image"
                style={{ backgroundImage: `url(${product.image})` }}
                onClick={() => openProduct(product)}
                aria-label={`View ${product.name}`}
              >
                <span>{product.tag}</span>
              </button>
              <div className="rail-product-info">
                <p>{displayCategory(product)}</p>
                <h3>{product.name}</h3>
                <div>
                  <strong>${salePrice(product).toFixed(2)}</strong>
                  <span>
                    <Star size={14} fill="currentColor" />
                    {displayRating(product).toFixed(1)}
                  </span>
                </div>
              </div>
              <button
                className="rail-product-button"
                onClick={() => addToCart(product, selectedQuantity(product.id))}
              >
                Add to cart
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="product-showcase ai-recommendations" aria-labelledby="ai-title">
        <div className="section-heading">
          <span>AI recommendations</span>
          <h2 id="ai-title">Smart picks based on what you browse and save.</h2>
        </div>
        <div className="product-rail" aria-label="AI recommended products">
          {aiRecommendedProducts.map((product) => (
            <article className="rail-product-card" key={product.id}>
              <button
                className="rail-product-image"
                style={{ backgroundImage: `url(${product.image})` }}
                onClick={() => openProduct(product)}
                aria-label={`View ${product.name}`}
              >
                <span>Recommended</span>
              </button>
              <div className="rail-product-info">
                <p>{productBrand(product)}</p>
                <h3>{product.name}</h3>
                <div>
                  <strong>${salePrice(product).toFixed(2)}</strong>
                  <span>
                    <Star size={14} fill="currentColor" />
                    {displayRating(product).toFixed(1)}
                  </span>
                </div>
              </div>
              <button
                className="rail-product-button"
                onClick={() => addToCart(product, selectedQuantity(product.id))}
              >
                Add to cart
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="shop" id="shop">
        <div className="shop-top">
          <div className="section-heading">
            <span>Shop products</span>
            <h2>Browse accessories and other essentials.</h2>
          </div>
          <label className="search-box">
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products"
            />
            <button
              type="button"
              className={isListening ? "voice-active" : ""}
              onClick={startVoiceSearch}
              aria-label="Voice search"
            >
              <Mic size={16} />
            </button>
          </label>
          <label className="sort-box">
            <span>Sort</span>
            <select
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value as SortOption)}
            >
              <option value="featured">Featured</option>
              <option value="priceLowHigh">Price: Low to high</option>
              <option value="priceHighLow">Price: High to low</option>
              <option value="popularity">Popularity</option>
              <option value="newest">Newest</option>
            </select>
          </label>
        </div>

        <div className="filter-panel">
          <div className="filter-row" aria-label="Product category filters">
            <SlidersHorizontal size={18} />
            {categories.map((category) => (
              <button
                key={category}
                className={activeCategory === category ? "active" : ""}
                onClick={() => {
                  setActiveCategory(category);
                  setActiveSubcategory(defaultSubcategory(category));
                }}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="filter-summary">
            <span>
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "product" : "products"} found
            </span>
            {(query ||
              activeCategory !== "All" ||
              sortOption !== "featured" ||
              priceFilter !== "all" ||
              ratingFilter !== "all" ||
              brandFilter !== "All") && (
              <button onClick={clearFilters}>Clear filters</button>
            )}
          </div>
        </div>

        <div className="advanced-filters" aria-label="Product filters">
          <label>
            <span>Price</span>
            <select
              value={priceFilter}
              onChange={(event) => setPriceFilter(event.target.value as PriceFilter)}
            >
              <option value="all">All prices</option>
              <option value="under25">Under $25</option>
              <option value="25to50">$25 to $50</option>
              <option value="50to100">$50 to $100</option>
              <option value="over100">Over $100</option>
            </select>
          </label>
          <label>
            <span>Rating</span>
            <select
              value={ratingFilter}
              onChange={(event) => setRatingFilter(event.target.value as RatingFilter)}
            >
              <option value="all">All ratings</option>
              <option value="4.5">4.5 stars & up</option>
              <option value="4.7">4.7 stars & up</option>
              <option value="4.8">4.8 stars & up</option>
            </select>
          </label>
          <label>
            <span>Brand</span>
            <select
              value={brandFilter}
              onChange={(event) => setBrandFilter(event.target.value)}
            >
              {brands.map((brand) => (
                <option value={brand} key={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </label>
        </div>

        {subcategoriesByCategory[activeCategory] && (
          <div
            className="subcategory-row"
            aria-label={`${activeCategory} subcategories`}
          >
            {subcategoriesByCategory[activeCategory].map((subcategory) => (
              <button
                key={subcategory}
                className={activeSubcategory === subcategory ? "active" : ""}
                onClick={() => setActiveSubcategory(subcategory)}
              >
                {subcategory}
              </button>
            ))}
          </div>
        )}

        <div className="product-grid">
          {isLoadingProducts &&
            [1, 2, 3, 4, 5, 6].map((item) => (
              <article className="product-card skeleton-card" key={item}>
                <span />
                <div />
                <div />
              </article>
            ))}

          {!isLoadingProducts && filteredProducts.length === 0 && (
            <div className="no-results">
              <Search size={26} />
              <strong>No products found</strong>
              <p>Try another search term or choose a different category.</p>
              <button onClick={clearFilters}>Clear filters</button>
            </div>
          )}

          {!isLoadingProducts && filteredProducts.map((product) => (
            <article className="product-card" key={product.id}>
              <div
                className="product-image"
                style={{ backgroundImage: `url(${product.image})` }}
              >
                <span>{product.tag}</span>
                <button
                  className={wishlist.includes(product.id) ? "saved" : ""}
                  onClick={() => toggleWishlist(product.id)}
                  data-tooltip={
                    wishlist.includes(product.id)
                      ? "Remove from wishlist"
                      : "Add to wishlist"
                  }
                  aria-label={`Save ${product.name}`}
                >
                  <Heart
                    size={18}
                    fill={wishlist.includes(product.id) ? "currentColor" : "none"}
                  />
                </button>
              </div>
              <div className="product-info">
                <div>
                  <p>{displayCategory(product)}</p>
                  <span>
                    {productBrand(product)}
                    {product.subcategory ? ` / ${product.subcategory}` : ""}
                  </span>
                  <h3>{product.name}</h3>
                </div>
                <div className="rating">
                  <Star size={15} fill="currentColor" />
                  {displayRating(product).toFixed(1)}
                </div>
              </div>
              <div className="product-footer">
                <div className="price-stack">
                  <span>{offerLabel(product)}</span>
                  <strong>${salePrice(product).toFixed(2)}</strong>
                  <del>${product.price.toFixed(2)}</del>
                </div>
                <label className="quantity-select">
                  Qty
                  <select
                    value={selectedQuantity(product.id)}
                    onChange={(event) =>
                      setSelectedQuantity(product.id, Number(event.target.value))
                    }
                  >
                    {[1, 2, 3, 4, 5].map((quantity) => (
                      <option value={quantity} key={quantity}>
                        {quantity}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="product-actions">
                  <button
                    onClick={() => openProduct(product)}
                  >
                    Details
                  </button>
                  <button
                    className={compareIds.includes(product.id) ? "compare-active" : ""}
                    onClick={() => toggleCompare(product.id)}
                  >
                    <GitCompareArrows size={15} />
                    Compare
                  </button>
                  <button onClick={() => addToCart(product, selectedQuantity(product.id))}>
                    Add to cart
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {compareProducts.length > 0 && (
        <section className="compare-section" aria-labelledby="compare-title">
          <div className="section-heading">
            <span>Compare products</span>
            <h2 id="compare-title">Review selected products side by side.</h2>
          </div>
          <div className="compare-grid">
            {compareProducts.map((product) => (
              <article className="compare-card" key={product.id}>
                <button
                  className="compare-remove"
                  onClick={() => toggleCompare(product.id)}
                  aria-label={`Remove ${product.name} from compare`}
                >
                  <X size={16} />
                </button>
                <span style={{ backgroundImage: `url(${product.image})` }} />
                <h3>{product.name}</h3>
                <p>{productBrand(product)} / {displayCategory(product)}</p>
                <strong>${salePrice(product).toFixed(2)}</strong>
                <em>
                  <Star size={14} fill="currentColor" />
                  {displayRating(product).toFixed(1)} rating
                </em>
              </article>
            ))}
          </div>
        </section>
      )}

      {recentlyViewedProducts.length > 0 && (
        <section className="product-showcase" aria-labelledby="recent-title">
          <div className="section-heading">
            <span>Recently viewed</span>
            <h2 id="recent-title">Continue from products you opened.</h2>
          </div>
          <div className="product-rail" aria-label="Recently viewed products">
            {recentlyViewedProducts.map((product) => (
              <article className="rail-product-card" key={product.id}>
                <button
                  className="rail-product-image"
                  style={{ backgroundImage: `url(${product.image})` }}
                  onClick={() => openProduct(product)}
                  aria-label={`View ${product.name}`}
                >
                  <span>Viewed</span>
                </button>
                <div className="rail-product-info">
                  <p>{productBrand(product)}</p>
                  <h3>{product.name}</h3>
                  <div>
                    <strong>${salePrice(product).toFixed(2)}</strong>
                    <span>
                      <Star size={14} fill="currentColor" />
                      {displayRating(product).toFixed(1)}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="offer-band" id="offers">
        <div>
          <span>Weekend offer</span>
          <h2>Buy any 2 accessories and save 15% at checkout.</h2>
        </div>
        <a href="#shop" className="primary-button">
          Start shopping
          <ArrowRight size={18} />
        </a>
      </section>

      <section className="advantage-showcase">
        <div className="advantage-copy">
          <span>Product advantage</span>
          <h2>One shop for wearing, carrying, gifting, styling, and home use.</h2>
          <p>
            Every product is selected for practical daily value, easy pairing,
            gift-ready presentation, and clear savings through sale pricing.
          </p>
        </div>
        <div className="advantage-collage" aria-label="Products in use">
          <span className="collage-main" />
          <span className="collage-small one" />
          <span className="collage-small two" />
        </div>
      </section>

      <footer id="support">
        <div className="footer-brand">
          <strong>Sneha Carries</strong>
          <p>Accessories, gifts, and everyday products for modern routines.</p>
          <div className="social-links" aria-label="Social media">
            <a href="#" aria-label="Instagram">IG</a>
            <a href="#" aria-label="Facebook">f</a>
            <a href="#" aria-label="Twitter">X</a>
          </div>
        </div>
        <div className="footer-columns">
          <div>
            <h3>About Us</h3>
            <p>Curated products for carrying, styling, gifting, tech, and home use.</p>
          </div>
          <div>
            <h3>Contact</h3>
            <a href="mailto:support@snehacarries.example">support@snehacarries.example</a>
            <a href="tel:+15550101488">+1 555 010 1488</a>
          </div>
          <div>
            <h3>FAQ</h3>
            <a href="#shop">Shipping and delivery</a>
            <a href="#offers">Coupons and offers</a>
          </div>
          <div>
            <h3>Policies</h3>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms & Conditions</a>
          </div>
        </div>
      </footer>
        </>
      )}

      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <div className="toast" key={toast.id}>
            {toast.message}
          </div>
        ))}
      </div>

      <button
        className="back-to-top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
      >
        <ChevronUp size={20} />
      </button>

      <div className={chatOpen ? "support-chat open" : "support-chat"}>
        <button
          className="chat-launcher"
          onClick={() => setChatOpen((open) => !open)}
          aria-label="Customer support chat"
        >
          {chatOpen ? <X size={20} /> : <MessageCircle size={20} />}
        </button>
        {chatOpen && (
          <section className="chat-panel" aria-label="Customer support chatbot">
            <div className="chat-header">
              <Bot size={20} />
              <div>
                <strong>Sneha Support</strong>
                <span>Online assistant</span>
              </div>
            </div>
            <div className="chat-messages">
              {chatMessages.map((message, index) => (
                <p className={message.sender} key={`${message.sender}-${index}`}>
                  {message.text}
                </p>
              ))}
            </div>
            <form className="chat-input" onSubmit={sendChatMessage}>
              <input
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Ask about delivery, coupons, returns..."
              />
              <button type="submit" aria-label="Send message">
                <Send size={17} />
              </button>
            </form>
          </section>
        )}
      </div>

      <aside className={cartOpen ? "cart-drawer open" : "cart-drawer"}>
        <div className="cart-header">
          <div>
            <span>Your cart</span>
            <strong>{cartCount} items</strong>
          </div>
          <button onClick={() => setCartOpen(false)} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>
        {cart.length === 0 ? (
          <div className="empty-cart">
            <ShoppingBag size={36} />
            <p>Your cart is empty.</p>
          </div>
        ) : (
          <div className="cart-items">
            {cart.map((item) => (
              <div className="cart-item" key={item.id}>
                <div
                  className="cart-image"
                  style={{ backgroundImage: `url(${item.image})` }}
                />
                <div>
                  <div className="cart-item-top">
                    <strong>{item.name}</strong>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      data-tooltip="Remove item"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <span>
                    ${salePrice(item).toFixed(2)} each | ${(salePrice(item) * item.quantity).toFixed(2)}
                  </span>
                  <div className="quantity">
                    <button onClick={() => updateQuantity(item.id, -1)}>
                      <Minus size={14} />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)}>
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="cart-footer">
          <div className="cart-totals">
            <div>
              <span>Subtotal</span>
              <strong>${subtotal.toFixed(2)}</strong>
            </div>
            {discount > 0 && (
              <div>
                <span>Discount</span>
                <strong>-${discount.toFixed(2)}</strong>
              </div>
            )}
            <div>
              <span>Shipping</span>
              <strong>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</strong>
            </div>
            <div>
              <span>Estimated delivery</span>
              <strong>{estimatedDelivery}</strong>
            </div>
            <div>
              <span>Estimated tax</span>
              <strong>${tax.toFixed(2)}</strong>
            </div>
            <div className="grand-total">
              <span>Total</span>
              <strong>${orderTotal.toFixed(2)}</strong>
            </div>
          </div>
          <label className="coupon-box">
            Discount coupon
            <div>
              <input
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
                placeholder="SAVE15 or WELCOME10"
              />
              {couponCode && (
                <button type="button" onClick={() => setCouponCode("")}>
                  Clear
                </button>
              )}
            </div>
            {couponCode && discount === 0 && (
              <span>Try SAVE15 or WELCOME10.</span>
            )}
          </label>
          <button
            disabled={cart.length === 0}
            onClick={() => {
              setCartOpen(false);
              setCurrentView("checkout");
            }}
          >
            Checkout now
          </button>
        </div>
      </aside>
      {cartOpen && <button className="overlay" onClick={() => setCartOpen(false)} />}
    </main>
  );
}
