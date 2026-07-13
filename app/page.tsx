"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowRight,
  BadgePercent,
  CreditCard,
  Heart,
  Menu,
  Minus,
  Moon,
  Package,
  Plus,
  Search,
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
type SortOption = "featured" | "priceLowHigh" | "priceHighLow";
type AppView =
  | "shop"
  | "login"
  | "checkout"
  | "orders"
  | "payments"
  | "wishlist"
  | "product";

type Customer = {
  name: string;
  email: string;
};

type PaymentMethod = {
  id: number;
  label: string;
  detail: string;
  default: boolean;
};

type Order = {
  id: string;
  date: string;
  status: string;
  total: number;
  items: CartItem[];
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

function offerLabel(product: Product) {
  return `${Math.round(productDiscountRate(product) * 100)}% off`;
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

export default function Home() {
  const [currentView, setCurrentView] = useState<AppView>("shop");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSubcategory, setActiveSubcategory] = useState("All");
  const [sortOption, setSortOption] = useState<SortOption>("featured");
  const [query, setQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [productQuantities, setProductQuantities] = useState<Record<number, number>>(
    {}
  );
  const [productRatings, setProductRatings] = useState<Record<number, number[]>>(
    {}
  );
  const [couponCode, setCouponCode] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authName, setAuthName] = useState("Sneha Customer");
  const [authEmail, setAuthEmail] = useState("customer@example.com");
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
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [themeAnimating, setThemeAnimating] = useState(false);
  const [flashSaleSecondsLeft, setFlashSaleSecondsLeft] = useState(8 * 60 * 60);

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
        const searchableText = [
          product.name,
          displayCategory(product),
          product.category,
          product.subcategory,
          product.tag
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const queryMatch =
          normalizedQuery === "" || searchableText.includes(normalizedQuery);
        return categoryMatch && subcategoryMatch && queryMatch;
      })
      .sort((a, b) => {
        if (sortOption === "priceLowHigh") {
          return a.price - b.price;
        }

        if (sortOption === "priceHighLow") {
          return b.price - a.price;
        }

        if (activeCategory !== "All") {
          return b.price - a.price;
        }

        return pricePriority(a) - pricePriority(b) || a.price - b.price;
      });
  }, [activeCategory, activeSubcategory, query, sortOption]);

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

  function addToCart(product: Product, quantity = 1) {
    const safeQuantity = Math.max(1, quantity);
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + safeQuantity }
            : item
        );
      }
      return [...current, { ...product, quantity: safeQuantity }];
    });
    setCartOpen(true);
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
    setWishlist((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    );
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
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + amount) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(id: number) {
    setCart((current) => current.filter((item) => item.id !== id));
  }

  function clearFilters() {
    setActiveCategory("All");
    setActiveSubcategory("All");
    setSortOption("featured");
    setQuery("");
  }

  function toggleTheme() {
    setThemeAnimating(true);
    setTheme((current) => (current === "dark" ? "light" : "dark"));
    window.setTimeout(() => setThemeAnimating(false), 620);
  }

  function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCustomer({
      name: authName.trim() || "Sneha Customer",
      email: authEmail.trim() || "customer@example.com"
    });
    setCurrentView("shop");
  }

  function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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

    setOrders((current) => [newOrder, ...current]);
    setCart([]);
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
            onClick={() => setCurrentView(customer ? "orders" : "login")}
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
          <button className="icon-button" data-tooltip="Search" aria-label="Search">
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
                  />
                </label>
                <label>
                  Password
                  <input type="password" placeholder="Enter password" />
                </label>
                <button type="submit" className="wide-button">
                  {authMode === "login" ? "Sign in" : "Create account"}
                </button>
              </form>
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
                          {product.subcategory && <span>{product.subcategory}</span>}
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
                            onClick={() => {
                              setSelectedProduct(product);
                              setCurrentView("product");
                            }}
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
                <div
                  className="product-page-image"
                  style={{ backgroundImage: `url(${selectedProduct.image})` }}
                />
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
                      onClick={() => setSelectedProduct(product)}
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
                onClick={() => {
                  setSelectedProduct(product);
                  setCurrentView("product");
                }}
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
            {(query || activeCategory !== "All" || sortOption !== "featured") && (
              <button onClick={clearFilters}>Clear filters</button>
            )}
          </div>
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
          {filteredProducts.length === 0 && (
            <div className="no-results">
              <Search size={26} />
              <strong>No products found</strong>
              <p>Try another search term or choose a different category.</p>
              <button onClick={clearFilters}>Clear filters</button>
            </div>
          )}

          {filteredProducts.map((product) => (
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
                  {product.subcategory && <span>{product.subcategory}</span>}
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
                    onClick={() => {
                      setSelectedProduct(product);
                      setCurrentView("product");
                    }}
                  >
                    Details
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
        <div>
          <strong>Sneha Carries</strong>
          <p>Accessories, gifts, and everyday products for modern routines.</p>
        </div>
        <div className="footer-links">
          <a href="#">Shipping</a>
          <a href="#">Returns</a>
          <a href="#">Contact</a>
        </div>
      </footer>
        </>
      )}

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
