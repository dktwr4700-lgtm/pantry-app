import React from "react";
import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

// ---- Firebase-backed replacement for window.storage ----
const firebaseConfig = {
  apiKey: "AIzaSyCxpS_TMBc9mpJPjwK-TcRDfge-uCaO2Cc",
  authDomain: "pantry-app-148a7.firebaseapp.com",
  projectId: "pantry-app-148a7",
  storageBucket: "pantry-app-148a7.firebasestorage.app",
  messagingSenderId: "334881660819",
  appId: "1:334881660819:web:a4500ab3eefb7570a11266",
  measurementId: "G-B38FS40YJQ",
};

const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp);

function safeDocId(key) {
  return key.replace(/\//g, "_");
}

window.storage = {
  async get(key, shared) {
    if (!shared) {
      const value = localStorage.getItem(key);
      if (value === null) throw new Error("not found");
      return { key, value, shared: false };
    }
    const snap = await getDoc(doc(db, "shared", safeDocId(key)));
    if (!snap.exists()) throw new Error("not found");
    return { key, value: snap.data().value, shared: true };
  },
  async set(key, value, shared) {
    if (!shared) {
      localStorage.setItem(key, value);
      return { key, value, shared: false };
    }
    await setDoc(doc(db, "shared", safeDocId(key)), {
      value,
      updatedAt: Date.now(),
    });
    return { key, value, shared: true };
  },
  // Live subscription for shared keys only — calls callback(value) every
  // time the document changes (including this device's own writes).
  // Returns an unsubscribe function.
  listenShared(key, callback) {
    return onSnapshot(doc(db, "shared", safeDocId(key)), (snap) => {
      if (snap.exists()) callback(snap.data().value);
    });
  },
};

// ---- Design tokens ----
const LIGHT_COLORS = {
  ink: "#1B4332",
  paper: "#F7F1E3",
  paperAlt: "#EFE6D0",
  card: "#FFFDF7",
  saffron: "#C9A227",
  saffronDeep: "#A6841C",
  sage: "#2D6A4F",
  sageDeep: "#1B4332",
  rust: "#B5482F",
  charcoal: "#1F2A22",
  line: "#E3D9BE",
};

const DARK_COLORS = {
  ink: "#F3ECD8",
  paper: "#0E2419",
  paperAlt: "#15301F",
  card: "#122A1C",
  saffron: "#C9A227",
  saffronDeep: "#E0BB3E",
  sage: "#6FA98A",
  sageDeep: "#8FC3A6",
  rust: "#DD6A48",
  charcoal: "#EDE4D3",
  line: "#2E4A38",
};

const COLORS = { ...LIGHT_COLORS };

// Soft, low-contrast shadows so cards lift off the paper background
// without looking heavy — used across section cards, pills, and the
// search bar. Kept subtle on purpose (green-tinted, low opacity).
const SHADOWS = {
  card: "0 2px 10px rgba(27,67,50,0.07), 0 1px 2px rgba(27,67,50,0.05)",
  pill: "0 1px 4px rgba(27,67,50,0.06)",
  raised: "0 6px 18px rgba(27,67,50,0.12)",
  floating: "0 10px 28px rgba(27,67,50,0.22)",
};

// Small hand-drawn line-icon set (stroke-based, 24x24 viewBox) so the
// app doesn't lean on emoji for its core chrome — nav, header, quick
// tools, and category headers all pull from here. No new dependency
// needed since these are plain inline SVGs.
function Icon({ name, size = 20, color = "currentColor", strokeWidth = 2, filled = false }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: filled ? color : "none",
    stroke: color,
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5.5 10v9a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-9" />
          <path d="M9.5 20v-6h5v6" />
        </svg>
      );
    case "list":
      return (
        <svg {...common}>
          <rect x="4" y="3.5" width="16" height="17" rx="2.5" />
          <path d="M8 8.5h8M8 12.5h8M8 16.5h5" />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.8L12 3.5z" />
        </svg>
      );
    case "utensils":
      return (
        <svg {...common}>
          <path d="M6.5 3.5v7a2 2 0 0 0 2 2v8" />
          <path d="M6.5 3.5v4.5M9 3.5v4.5" />
          <path d="M17 3.5c-1.4 0-2.5 1.6-2.5 5.5S15.6 12.5 17 12.5" />
          <path d="M17 3.5v17" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V19.5a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H4.5a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H10a1.7 1.7 0 0 0 1-1.55V4.5a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V10c.1.44.5.86 1.55 1H19.5a2 2 0 1 1 0 4h-.09c-.6.14-1.06.51-1 1.5z" />
        </svg>
      );
    case "moon":
      return (
        <svg {...common}>
          <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" />
        </svg>
      );
    case "sun":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
      );
    case "template":
      return (
        <svg {...common}>
          <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.5" />
          <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.5" />
          <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.5" />
          <rect x="13" y="13" width="7.5" height="7.5" rx="1.5" />
        </svg>
      );
    case "chef":
      return (
        <svg {...common}>
          <path d="M4 12.5h16l-1.4 7a1 1 0 0 1-1 .8H6.4a1 1 0 0 1-1-.8L4 12.5z" />
          <path d="M4 12.5a8 8 0 0 1 16 0" />
        </svg>
      );
    case "camera":
      return (
        <svg {...common}>
          <path d="M4 8.5a1.5 1.5 0 0 1 1.5-1.5H8l1.2-2h5.6l1.2 2h2.5A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9z" />
          <circle cx="12" cy="13" r="3.3" />
        </svg>
      );
    case "tap":
      return (
        <svg {...common}>
          <path d="M13 3 5 14h5l-1 7 8-11h-5l1-7z" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="M5 12.5l4.5 4.5L19 7" />
        </svg>
      );
    case "leaf":
      return (
        <svg {...common}>
          <path d="M20 4c0 9-6 14-15 15C5.5 10.5 11 4.5 20 4z" />
          <path d="M6 19c2-3 5-6 10-10" />
        </svg>
      );
    case "bread":
      return (
        <svg {...common}>
          <path d="M4.5 11c0-4 3.4-7 7.5-7s7.5 3 7.5 7v6a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 4.5 17v-6z" />
          <path d="M9 15v-3M12 15v-4M15 15v-3" />
        </svg>
      );
    case "milk":
      return (
        <svg {...common}>
          <path d="M9 3h6l1 4-1.8 2v9.5A1.5 1.5 0 0 1 12.7 20h-1.4a1.5 1.5 0 0 1-1.5-1.5V9l-1.8-2 1-4z" />
          <path d="M9 3h6" />
        </svg>
      );
    case "jar":
      return (
        <svg {...common}>
          <path d="M9 3.5h6v3H9z" />
          <path d="M7.5 6.5h9l1 3v11a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-11l1-3z" />
          <path d="M6.7 12h10.6" />
        </svg>
      );
    case "snowflake":
      return (
        <svg {...common}>
          <path d="M12 2.5v19M4.5 7l15 10M19.5 7l-15 10" />
        </svg>
      );
    case "basket":
      return (
        <svg {...common}>
          <path d="M3.5 10h17l-1.8 9.3a1.5 1.5 0 0 1-1.5 1.2H6.8a1.5 1.5 0 0 1-1.5-1.2L3.5 10z" />
          <path d="M8 10 9.5 4M16 10 14.5 4M7.5 13.5v4M12 13.5v4M16.5 13.5v4" />
        </svg>
      );
    case "drop":
      return (
        <svg {...common}>
          <path d="M12 3.5c3.5 4.2 6 7.6 6 10.8a6 6 0 1 1-12 0c0-3.2 2.5-6.6 6-10.8z" />
        </svg>
      );
    case "folder":
      return (
        <svg {...common}>
          <path d="M3.5 6.5A1.5 1.5 0 0 1 5 5h4l2 2.5h8A1.5 1.5 0 0 1 20.5 9v9A1.5 1.5 0 0 1 19 19.5H5A1.5 1.5 0 0 1 3.5 18V6.5z" />
        </svg>
      );
    default:
      return null;
  }
}

const STRINGS = {
  appName: { ar: "مونة", en: "Monah" },
  tagline: { ar: "بيت واحد، قائمة واحدة — محد ينسى شي بعد اليوم", en: "One home, one list — never forget anything again" },
  tabPantry: { ar: "المخزون", en: "Pantry" },
  tabShopping: { ar: "قائمة الشراء", en: "Shopping List" },
  tabFavorites: { ar: "المفضلة", en: "Favorites" },
  tabNutrition: { ar: "تغذية", en: "Nutrition" },
  onlyMine: { ar: "قائمتي بس", en: "Just mine" },
  searchPlaceholder: { ar: "ابحث عن غرض...", en: "Search for an item..." },
  noResults: { ar: "ما فيه نتائج مطابقة", en: "No matching results" },
  emptyShelf: { ar: "لا توجد أغراض هنا بعد — أضف أول غرض للرف", en: "No items here yet — add the first one" },
  addItemBtn: { ar: "إضافة غرض", en: "Add Item" },
  editItemTitle: { ar: "تعديل الغرض", en: "Edit Item" },
  newItemTitle: { ar: "غرض جديد", en: "New Item" },
  nameFieldPlaceholder: { ar: "اسم الغرض، مثال: معجون طماطم", en: "Item name, e.g. Tomato paste" },
  scanBarcodeBtn: { ar: "امسح الباركود بدل الكتابة", en: "Scan barcode instead of typing" },
  optionalPhoto: { ar: "أضف صورة اختيارية (تفيد لو فيه أنواع متشابهة)", en: "Add an optional photo (helpful for similar-looking items)" },
  photoAttached: { ar: "صورة مرفقة — اضغط عليها لتغييرها", en: "Photo attached — tap to change it" },
  expiryLabel: { ar: "تاريخ الانتهاء (اختياري — للأشياء الطازجة)", en: "Expiry date (optional — for fresh items)" },
  priceLabel: { ar: "السعر التقريبي بالريال (اختياري)", en: "Approx. price in OMR (optional)" },
  assignedLabel: { ar: "مسؤوليّة (اختياري)", en: "Assigned to (optional)" },
  occasionLabel: { ar: "لمناسبة (اختياري)", en: "For an occasion (optional)" },
  urgentToggle: { ar: "عاجل — يظهر أول شي بالقائمة", en: "Urgent — shows first in the list" },
  favoriteToggle: { ar: "أضف للمفضلة (أغراض تشتريها كل مرة)", en: "Add to favorites (items you always buy)" },
  cancel: { ar: "إلغاء", en: "Cancel" },
  save: { ar: "حفظ التعديلات", en: "Save Changes" },
  addToPantry: { ar: "إضافة للمونة", en: "Add to Mona" },
  delete: { ar: "حذف", en: "Delete" },
  settingsTitle: { ar: "أرقام واتساب أهل البيت", en: "Household WhatsApp Numbers" },
  done: { ar: "تم", en: "Done" },
  yourHouseholdCode: { ar: "كود بيتك — شاركه مع أهل البيت عشان يدخلوا لنفس القائمة", en: "Your household code — share it so others join the same list" },
  copy: { ar: "نسخ", en: "Copy" },
  switchHousehold: { ar: "تبديل البيت", en: "Switch Household" },
  createHousehold: { ar: "🏠 إنشاء بيت جديد", en: "🏠 Create New Household" },
  haveCode: { ar: "عندك كود بيت؟", en: "Have a household code?" },
  join: { ar: "دخول", en: "Join" },
  or: { ar: "أو", en: "or" },
  whatsYourName: { ar: "وش اسمك؟", en: "What's your name?" },
  nameHelper: { ar: "عشان أهل البيت يعرفون مين أضاف كل غرض", en: "So the household knows who added each item" },
  letsStart: { ar: "يلا نبدأ", en: "Let's start" },
  templatesBtn: { ar: "قوالب جاهزة (رمضان، عزيمة، وغيرها)", en: "Ready-made templates (Ramadan, guests, etc.)" },
  recipesBtn: { ar: "وش أطبخ اليوم؟ (حسب اللي عندك)", en: "What to cook today? (based on your stock)" },
};

function useT(lang) {
  return (key) => (STRINGS[key] ? STRINGS[key][lang] || STRINGS[key].ar : key);
}

const CATEGORIES = [
  { id: "produce", label: "خضار وفواكه", labelEn: "Produce", icon: "🥬", svgIcon: "leaf" },
  { id: "bakery", label: "مخبوزات", labelEn: "Bakery", icon: "🍞", svgIcon: "bread" },
  { id: "dairy", label: "ألبان وبيض", labelEn: "Dairy & Eggs", icon: "🥛", svgIcon: "milk" },
  { id: "kitchen", label: "بقالة وجاف", labelEn: "Pantry & Dry Goods", icon: "🫙", svgIcon: "jar" },
  { id: "frozen", label: "مجمدات", labelEn: "Frozen", icon: "🧊", svgIcon: "snowflake" },
  { id: "cleaning", label: "التنظيف", labelEn: "Cleaning", icon: "🧺", svgIcon: "basket" },
  { id: "care", label: "العناية الشخصية", labelEn: "Personal Care", icon: "🧴", svgIcon: "drop" },
  { id: "other", label: "أخرى", labelEn: "Other", icon: "🗂️", svgIcon: "folder" },
];

const TEMPLATES = [
  {
    id: "ramadan",
    name: "رمضان",
    icon: "🌙",
    items: [
      { name: "تمر", category: "produce" },
      { name: "حليب", category: "dairy" },
      { name: "لبنة", category: "dairy" },
      { name: "شعيرية", category: "kitchen" },
      { name: "عدس", category: "kitchen" },
      { name: "دقيق", category: "kitchen" },
      { name: "بهارات شوربة", category: "kitchen" },
      { name: "زيت", category: "kitchen" },
      { name: "عصير رمضان", category: "kitchen" },
    ],
  },
  {
    id: "guests",
    name: "عزيمة ضيوف",
    icon: "🎉",
    items: [
      { name: "أرز", category: "kitchen" },
      { name: "لحم / دجاج", category: "frozen" },
      { name: "مشروبات غازية", category: "kitchen" },
      { name: "عصائر", category: "kitchen" },
      { name: "حلا", category: "bakery" },
      { name: "مناديل", category: "cleaning" },
      { name: "أكواب ورقية", category: "cleaning" },
      { name: "صحون ورقية", category: "cleaning" },
    ],
  },
  {
    id: "school",
    name: "بداية المدرسة",
    icon: "🎒",
    items: [
      { name: "وجبات خفيفة", category: "kitchen" },
      { name: "عصائر صغيرة", category: "kitchen" },
      { name: "خبز صغير", category: "bakery" },
      { name: "جبن شرائح", category: "dairy" },
      { name: "أكياس ساندويش", category: "cleaning" },
    ],
  },
  {
    id: "camping",
    name: "رحلة / تخييم",
    icon: "🏕️",
    items: [
      { name: "ماء", category: "kitchen" },
      { name: "فحم", category: "other" },
      { name: "معلبات", category: "kitchen" },
      { name: "خبز", category: "bakery" },
      { name: "أكياس قمامة", category: "cleaning" },
      { name: "مناديل مبللة", category: "care" },
    ],
  },
  {
    id: "weight-gain",
    name: "زيادة الوزن",
    icon: "💪",
    items: [
      { name: "حليب كامل الدسم", category: "dairy" },
      { name: "تمر", category: "kitchen" },
      { name: "موز", category: "produce" },
      { name: "عسل", category: "kitchen" },
      { name: "مكسرات مشكلة", category: "kitchen" },
      { name: "أفوكادو", category: "produce" },
      { name: "زبادي كامل الدسم", category: "dairy" },
      { name: "بيض", category: "dairy" },
      { name: "خبز أسمر", category: "bakery" },
      { name: "جبن", category: "dairy" },
      { name: "جبن حلوم", category: "dairy" },
      { name: "لبنة", category: "dairy" },
      { name: "برتقال", category: "produce" },
      { name: "رز", category: "kitchen" },
      { name: "لحم / دجاج", category: "frozen" },
      { name: "سمك", category: "frozen" },
      { name: "خيار وطماطم", category: "produce" },
      { name: "بطاطا", category: "produce" },
      { name: "زيت زيتون", category: "kitchen" },
      { name: "عدس", category: "kitchen" },
      { name: "تونة معلبة", category: "kitchen" },
      { name: "شوفان", category: "kitchen" },
      { name: "حمص وطحينة", category: "kitchen" },
      { name: "زعتر", category: "kitchen" },
    ],
  },
  {
    id: "weight-loss",
    name: "نقصان الوزن",
    icon: "🥗",
    items: [
      { name: "صدور دجاج", category: "frozen" },
      { name: "سمك", category: "frozen" },
      { name: "بيض", category: "dairy" },
      { name: "زبادي قليل الدسم", category: "dairy" },
      { name: "جبن قليل الدسم", category: "dairy" },
      { name: "خضار ورقية (سبانخ/جرجير)", category: "produce" },
      { name: "خضار مشكلة", category: "produce" },
      { name: "خيار وطماطم", category: "produce" },
      { name: "تفاح", category: "produce" },
      { name: "توت", category: "produce" },
      { name: "ليمون", category: "produce" },
      { name: "شوفان", category: "kitchen" },
      { name: "كينوا أو رز بني", category: "kitchen" },
      { name: "عدس", category: "kitchen" },
      { name: "حمص", category: "kitchen" },
      { name: "خبز أسمر", category: "bakery" },
      { name: "زيت زيتون", category: "kitchen" },
      { name: "مكسرات (حصص صغيرة)", category: "kitchen" },
      { name: "شاي أخضر", category: "kitchen" },
      { name: "ماء", category: "kitchen" },
    ],
  },
];

const DIET_PLANS = {
  gain: {
    label: "زيادة الوزن",
    icon: "💪",
    templateId: "weight-gain",
    days: [
      { day: "السبت", meals: { فطور: "بيض مقلي (3 حبات) + خبز أسمر + جبن + عصير برتقال طازج", غداء: "رز مع لحم/دجاج + خضار مشوية + سلطة بزيت زيتون", عشاء: "شوربة عدس + خبز + جبن", سناك: "موز + حفنة لوز" } },
      { day: "الأحد", meals: { فطور: "شوفان بالحليب + عسل + موز + مكسرات", غداء: "مكرونة باللحم المفروم + سلطة", عشاء: "سندويش تونة بالخبز الأسمر + بيضة مسلوقة", سناك: "مخفوق حليب بالتمر" } },
      { day: "الاثنين", meals: { فطور: "فول + بيض + خبز + زيت زيتون", غداء: "رز بخاري + دجاج + سلطة", عشاء: "جبن + زيتون + خبز + طماطم", سناك: "تمر + مكسرات مشكلة" } },
      { day: "الثلاثاء", meals: { فطور: "بان كيك بالعسل والموز + حليب", غداء: "سمك مشوي + رز + خضار", عشاء: "شوربة خضار + خبز + جبن", سناك: "زبادي بالعسل والمكسرات" } },
      { day: "الأربعاء", meals: { فطور: "أومليت بالجبن والخضار + خبز", غداء: "كبسة لحم + سلطة يوغرت", عشاء: "حمص بالطحينة + خبز", سناك: "موز + حليب" } },
      { day: "الخميس", meals: { فطور: "لبنة + زيت زيتون + خبز + زعتر", غداء: "دجاج مشوي + بطاطا + سلطة", عشاء: "فول + بيض + خبز", سناك: "مخفوق أفوكادو بالحليب" } },
      { day: "الجمعة", meals: { فطور: "بيض + جبن حلوم + خبز + عصير", غداء: "لحم مع رز أو برياني + سلطة", عشاء: "شوربة دجاج + خبز", سناك: "تمر + حليب دافئ" } },
    ],
  },
  loss: {
    label: "نقصان الوزن",
    icon: "🥗",
    templateId: "weight-loss",
    days: [
      { day: "السبت", meals: { فطور: "بيضتين مسلوقة + خيار وطماطم + خبز أسمر (شريحة)", غداء: "صدر دجاج مشوي + خضار سوتيه + كينوا", عشاء: "سلطة خضار كبيرة + قطعة جبن قليل الدسم", سناك: "تفاح" } },
      { day: "الأحد", meals: { فطور: "شوفان بالحليب قليل الدسم + توت", غداء: "سمك مشوي + رز بني + سلطة", عشاء: "زبادي قليل الدسم + خيار", سناك: "حفنة مكسرات صغيرة" } },
      { day: "الاثنين", meals: { فطور: "زبادي يوناني + توت وعسل قليل", غداء: "عدس + سلطة خضار ورقية", عشاء: "صدر دجاج مشوي + خضار مشكلة", سناك: "خيار وجزر" } },
      { day: "الثلاثاء", meals: { فطور: "بيض مسلوق + خبز أسمر + طماطم", غداء: "سمك + كينوا + سلطة جرجير", عشاء: "شوربة خضار خفيفة", سناك: "تفاح" } },
      { day: "الأربعاء", meals: { فطور: "شوفان + قرفة + تفاح مبشور", غداء: "حمص + سلطة خضار ورقية + زيت زيتون", عشاء: "دجاج مشوي + خضار سوتيه", سناك: "حفنة لوز" } },
      { day: "الخميس", meals: { فطور: "بيض + سبانخ سوتيه + خبز أسمر", غداء: "سمك + رز بني + سلطة خيار وطماطم", عشاء: "زبادي قليل الدسم + توت", سناك: "خيار" } },
      { day: "الجمعة", meals: { فطور: "زبادي يوناني + شوفان + عسل قليل", غداء: "دجاج مشوي + خضار مشكلة + سلطة", عشاء: "شوربة عدس خفيفة", سناك: "تفاح أو توت" } },
    ],
  },
};

const MEAL_BANK = {
  low: {
    فطور: ["بيضتين مسلوقة + خيار وطماطم + خبز أسمر", "شوفان بالحليب قليل الدسم + قرفة", "أومليت خضار + خبز أسمر شريحة", "زبادي يوناني + توت + ملعقة عسل", "جبنة قليلة الدسم + خبز أسمر + خيار", "نص أفوكادو + بيضة مسلوقة + خبز", "بيضة + خبز أسمر + طماطم مشوية"],
    غداء: ["صدر دجاج مشوي + سلطة خضار + زيت زيتون", "سمك مشوي + خضار سوتيه", "شوربة عدس + سلطة جانبية", "تونة + خس وطماطم + خبز أسمر", "دجاج مسلوق + خضار مشكلة", "لفة دجاج بخبز أسمر + سلطة", "صدر دجاج + كينوا + خضار"],
    عشاء: ["شوربة خضار + خبز أسمر قطعة", "سلطة تونة خفيفة", "بيضة مسلوقة + خضار سوتيه", "زبادي + خيار + نعناع", "جبنة قليلة الدسم + خبز أسمر", "شوربة عدس خفيفة", "سلطة خضار + بيضة"],
  },
  mid: {
    فطور: ["بيض + جبنة + خبز أسمر + حبة فاكهة", "شوفان بالحليب كامل الدسم + موز", "ساندويش جبن وبيض + عصير طبيعي", "زبادي + مكسرات + عسل + فواكه", "أومليت جبن وخضار + خبز", "أفوكادو + بيض + خبز أسمر", "فطائر شوفان + عسل + موز"],
    غداء: ["صدر دجاج + رز بسمتي + سلطة", "سمك + رز + خضار مشوية", "مكرونة بصلصة دجاج وخضار", "دجاج مشوي + بطاطا + سلطة", "لحم مفروم + رز + خضار", "دجاج كاري + رز بني", "كبسة دجاج خفيفة + سلطة"],
    عشاء: ["أفوكادو + جبن + خبز أسمر", "ساندويش تونة + سلطة جانبية", "شوربة دجاج + خبز", "سلطة دجاج مشوي", "جبن + بيض + خبز أسمر", "زبادي + مكسرات + فواكه", "لفة جبن وخضار"],
  },
  high: {
    فطور: ["بيض + تمر + حليب كامل الدسم + مكسرات", "فطائر + عسل + موز + حليب", "ساندويش جبن وبيض دبل + عصير", "شوفان بالحليب + موز + مكسرات + عسل", "أومليت جبن ولحم مفروم + خبز", "أفوكادو + بيضتين + جبن + خبز", "فطائر بروتين + زبدة فول سوداني"],
    غداء: ["لحم/دجاج + رز + خضار + زيت زيتون", "مكرونة باللحم المفروم والجبن", "كبسة لحم + سلطة + لبن", "دجاج مقلي بالفرن + بطاطا + رز", "سمك + رز + خضار + زيت زيتون", "ستيك لحم + بطاطا مهروسة", "برياني دجاج + سلطة"],
    عشاء: ["ساندويش تونة/جبن + موز + حليب", "أفوكادو + جبن + بيض + خبز", "شوربة دجاج دسمة + خبز", "جبن + مكسرات + تمر + حليب", "لفة لحم/دجاج + جبن", "زبادي كامل الدسم + مكسرات + عسل", "بيض + جبن + خبز + عصير"],
  },
};
const NUTRITION_DAY_NAMES = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

function calcTargetCalories(profile) {
  const { weight, height, age, gender, activity, goalAdj } = profile;
  const bmr =
    gender === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
  const tdee = bmr * activity;
  return Math.round((tdee + goalAdj) / 10) * 10;
}

function buildSmartPlan(profile) {
  const target = calcTargetCalories(profile);
  const tier = target < 1800 ? "low" : target > 2600 ? "high" : "mid";
  const bank = MEAL_BANK[tier];
  const days = NUTRITION_DAY_NAMES.map((day, i) => ({
    day,
    meals: {
      فطور: bank["فطور"][i],
      غداء: bank["غداء"][i],
      عشاء: bank["عشاء"][i],
    },
  }));
  return {
    label: "خطتي الشخصية",
    icon: "🧮",
    templateId: null,
    days,
    targetCalories: target,
  };
}

const RECIPES = [
  { name: "مجبوس لحم", icon: "🍛", meal: "lunch", ingredients: ["رز", "لحم", "بهارات مشكلة"] },
  { name: "عرسية", icon: "🍚", meal: "lunch", ingredients: ["رز", "لحم"] },
  { name: "هريس", icon: "🥘", meal: "dinner", ingredients: ["قمح", "لحم"] },
  { name: "مطبق مسقطي", icon: "🥞", meal: "dinner", ingredients: ["بيض", "لحم مفروم"] },
  { name: "شوري (لحم مشوي بالبهارات)", icon: "🍖", meal: "lunch", ingredients: ["لحم", "بهارات مشكلة"] },
  { name: "خبيص", icon: "🍯", meal: "breakfast", ingredients: ["دقيق", "سكر"] },
  { name: "لقيمات", icon: "🍩", meal: "dinner", ingredients: ["دقيق", "عسل"] },
  { name: "قهوة عمانية بالتمر", icon: "☕", meal: "breakfast", ingredients: ["قهوة", "تمر"] },
  { name: "مكرونة بالجبن", icon: "🍝", meal: "dinner", ingredients: ["معكرونة", "جبن"] },
  { name: "بيض بالطماطم", icon: "🍳", meal: "breakfast", ingredients: ["بيض", "طماطم"] },
  { name: "شكشوكة", icon: "🍳", meal: "breakfast", ingredients: ["بيض", "طماطم", "بصل"] },
  { name: "بيض مسلوق بالخبز", icon: "🥚", meal: "breakfast", ingredients: ["بيض", "خبز"] },
  { name: "لبنة بزيت الزيتون", icon: "🥣", meal: "breakfast", ingredients: ["لبنة", "زيت طبخ"] },
  { name: "توست بالزبدة والعسل", icon: "🍯", meal: "breakfast", ingredients: ["خبز", "عسل"] },
  { name: "شوفان بالحليب", icon: "🥣", meal: "breakfast", ingredients: ["حليب", "سكر"] },
  { name: "توست بالجبن", icon: "🥪", meal: "breakfast", ingredients: ["خبز", "جبن"] },
  { name: "أومليت", icon: "🍳", meal: "breakfast", ingredients: ["بيض", "جبن"] },
  { name: "حمص بالطحينة", icon: "🥙", meal: "breakfast", ingredients: ["حمص", "طحينة"] },
  { name: "فول بالبيض", icon: "🫘", meal: "breakfast", ingredients: ["فول", "بيض"] },
  { name: "زبادي بالعسل والمكسرات", icon: "🥣", meal: "breakfast", ingredients: ["زبادي", "عسل"] },
  { name: "خبز بالجبن والزيتون", icon: "🫒", meal: "breakfast", ingredients: ["خبز", "جبن"] },
  { name: "فطيرة بيض وجبن", icon: "🥧", meal: "breakfast", ingredients: ["بيض", "جبن", "دقيق"] },
  { name: "سلطة خضار", icon: "🥗", meal: "lunch", ingredients: ["خيار", "طماطم"] },
  { name: "رز بالدجاج", icon: "🍛", meal: "lunch", ingredients: ["رز", "دجاج مجمد"] },
  { name: "سمك مشوي مع رز", icon: "🐟", meal: "lunch", ingredients: ["سمك مجمد", "رز"] },
  { name: "دجاج مشوي بالبطاطا", icon: "🍗", meal: "lunch", ingredients: ["دجاج مجمد", "بطاطا"] },
  { name: "سمك مقلي", icon: "🐟", meal: "lunch", ingredients: ["سمك مجمد", "دقيق"] },
  { name: "معكرونة باللحم", icon: "🍝", meal: "lunch", ingredients: ["معكرونة", "لحم مفروم"] },
  { name: "سلطة تونة", icon: "🥗", meal: "lunch", ingredients: ["تونة معلبة", "خس"] },
  { name: "عدس بالرز", icon: "🍚", meal: "lunch", ingredients: ["عدس", "رز"] },
  { name: "رز بالخضار", icon: "🍚", meal: "lunch", ingredients: ["رز", "جزر"] },
  { name: "بطاطا محمرة", icon: "🍟", meal: "lunch", ingredients: ["بطاطا", "زيت طبخ"] },
  { name: "شوربة خضار", icon: "🍲", meal: "lunch", ingredients: ["جزر", "بطاطا"] },
  { name: "شاورما / راب دجاج", icon: "🌯", meal: "dinner", ingredients: ["دجاج مجمد", "خبز"] },
  { name: "شوربة عدس", icon: "🍲", meal: "dinner", ingredients: ["عدس", "بصل"] },
  { name: "ساندويش جبن وخيار", icon: "🥪", meal: "dinner", ingredients: ["خبز", "جبن", "خيار"] },
  { name: "توست تونة", icon: "🥪", meal: "dinner", ingredients: ["خبز", "تونة معلبة"] },
  { name: "شوربة دجاج خفيفة", icon: "🍲", meal: "dinner", ingredients: ["دجاج مجمد", "بصل"] },
  { name: "سلطة خيار وزبادي", icon: "🥗", meal: "dinner", ingredients: ["خيار", "زبادي"] },
  { name: "بطاطا مهروسة", icon: "🥔", meal: "dinner", ingredients: ["بطاطا", "حليب"] },
  { name: "خبز بالزعتر (منقوشة)", icon: "🫓", meal: "dinner", ingredients: ["دقيق", "زيت طبخ"] },
  { name: "حساء الثوم والبصل", icon: "🍲", meal: "dinner", ingredients: ["ثوم", "بصل"] },
];

const MEAL_TYPES = [
  { id: "breakfast", label: "فطور", icon: "🌅" },
  { id: "lunch", label: "غداء", icon: "☀️" },
  { id: "dinner", label: "عشاء", icon: "🌙" },
];

const COMMON_ITEMS = [
  { name: "طماطم", icon: "🍅", category: "produce" },
  { name: "خيار", icon: "🥒", category: "produce" },
  { name: "بصل", icon: "🧅", category: "produce" },
  { name: "ثوم", icon: "🧄", category: "produce" },
  { name: "ليمون", icon: "🍋", category: "produce" },
  { name: "تفاح", icon: "🍎", category: "produce" },
  { name: "موز", icon: "🍌", category: "produce" },
  { name: "بطاطا", icon: "🥔", category: "produce" },
  { name: "جزر", icon: "🥕", category: "produce" },
  { name: "خس", icon: "🥬", category: "produce" },
  { name: "خبز", icon: "🍞", category: "bakery" },
  { name: "خبز أسمر", icon: "🍞", category: "bakery" },
  { name: "حليب", icon: "🥛", category: "dairy" },
  { name: "لبن", icon: "🥛", category: "dairy" },
  { name: "جبن", icon: "🧀", category: "dairy" },
  { name: "زبدة", icon: "🧈", category: "dairy" },
  { name: "بيض", icon: "🥚", category: "dairy" },
  { name: "لبنة", icon: "🥣", category: "dairy" },
  { name: "زبادي", icon: "🥣", category: "dairy" },
  { name: "رز", icon: "🍚", category: "kitchen" },
  { name: "سكر", icon: "🍬", category: "kitchen" },
  { name: "ملح", icon: "🧂", category: "kitchen" },
  { name: "شاي", icon: "🍵", category: "kitchen" },
  { name: "قهوة", icon: "☕", category: "kitchen" },
  { name: "زيت طبخ", icon: "🫙", category: "kitchen" },
  { name: "دقيق", icon: "🌾", category: "kitchen" },
  { name: "عدس", icon: "🥘", category: "kitchen" },
  { name: "معكرونة", icon: "🍝", category: "kitchen" },
  { name: "تونة معلبة", icon: "🐟", category: "kitchen" },
  { name: "عسل", icon: "🍯", category: "kitchen" },
  { name: "تمر", icon: "🌴", category: "kitchen" },
  { name: "بهارات مشكلة", icon: "🌶️", category: "kitchen" },
  { name: "دجاج مجمد", icon: "🍗", category: "frozen" },
  { name: "لحم مفروم", icon: "🥩", category: "frozen" },
  { name: "سمك مجمد", icon: "🐟", category: "frozen" },
  { name: "صابون غسيل", icon: "🧴", category: "cleaning" },
  { name: "منظف أرضيات", icon: "🧴", category: "cleaning" },
  { name: "مناديل ورقية", icon: "🧻", category: "cleaning" },
  { name: "أكياس قمامة", icon: "🗑️", category: "cleaning" },
  { name: "شامبو", icon: "🧴", category: "care" },
  { name: "معجون أسنان", icon: "🪥", category: "care" },
  { name: "صابون استحمام", icon: "🧼", category: "care" },
  { name: "مناديل مبللة", icon: "🧻", category: "care" },
  { name: "بطاريات", icon: "🔋", category: "other" },
  { name: "أكياس تسوق", icon: "🛍️", category: "other" },
];

function dayNumber(offset = 0) {
  const key = new Date().toDateString();
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return hash + offset;
}

const FONTS_LINK =
  "https://fonts.googleapis.com/css2?family=Cairo:wght@600;700;800&family=Tajawal:wght@400;500;700&display=swap";

function useFonts() {
  useEffect(() => {
    if (document.getElementById("pantry-fonts")) return;
    const link = document.createElement("link");
    link.id = "pantry-fonts";
    link.rel = "stylesheet";
    link.href = FONTS_LINK;
    document.head.appendChild(link);
  }, []);
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function generateHouseholdCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

function expiryLabel(days) {
  if (days < 0) return `منتهي منذ ${Math.abs(days)} يوم`;
  if (days === 0) return "ينتهي اليوم";
  if (days === 1) return "ينتهي غداً";
  return `ينتهي خلال ${days} أيام`;
}

function loadQuaggaScript() {
  return new Promise((resolve, reject) => {
    if (window.Quagga) {
      resolve(window.Quagga);
      return;
    }
    const existing = document.getElementById("quagga-script");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.Quagga));
      existing.addEventListener("error", () => reject(new Error("load failed")));
      return;
    }
    const script = document.createElement("script");
    script.id = "quagga-script";
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/quagga/0.12.1/quagga.min.js";
    script.onload = () => resolve(window.Quagga);
    script.onerror = () => reject(new Error("load failed"));
    document.body.appendChild(script);
  });
}

function loadTesseractScript() {
  return new Promise((resolve, reject) => {
    if (window.Tesseract) {
      resolve(window.Tesseract);
      return;
    }
    const existing = document.getElementById("tesseract-script");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.Tesseract));
      existing.addEventListener("error", () => reject(new Error("load failed")));
      return;
    }
    const script = document.createElement("script");
    script.id = "tesseract-script";
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/5.0.4/tesseract.min.js";
    script.onload = () => resolve(window.Tesseract);
    script.onerror = () => reject(new Error("load failed"));
    document.body.appendChild(script);
  });
}

function resizeImageFile(file, maxDim = 240, quality = 0.6) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode failed"));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

const SEED_ITEMS = [
  { id: uid(), name: "أرز بسمتي", category: "kitchen", needed: false, urgent: false },
  { id: uid(), name: "زيت طبخ", category: "kitchen", needed: true, urgent: true },
  { id: uid(), name: "سكر", category: "kitchen", needed: false, urgent: false },
  { id: uid(), name: "شاي", category: "kitchen", needed: false, urgent: false },
  { id: uid(), name: "منظف أطباق", category: "cleaning", needed: false, urgent: false },
  { id: uid(), name: "مناديل ورقية", category: "cleaning", needed: true, urgent: false },
  { id: uid(), name: "معجون أسنان", category: "care", needed: false, urgent: false },
  { id: uid(), name: "شامبو", category: "care", needed: false, urgent: false },
];

export default function App() {
  // A shared interactive link opens this dedicated, minimal shopping
  // view instead of the full app — no tabs, no settings, just the
  // list. This check is stable for the lifetime of the mounted page
  // (the URL doesn't change without a reload), so returning early
  // here before any hooks run doesn't break the rules of hooks.
  const shareParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
  if (shareParams.get("mode") === "share" && shareParams.get("code")) {
    return (
      <ShareView
        code={shareParams.get("code")}
        fromPhone={shareParams.get("from") || ""}
      />
    );
  }

  useFonts();
  const [items, setItems] = useState(null); // null = loading
  const [loadError, setLoadError] = useState(false);
  const [tab, setTab] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const view = params.get("view");
      if (view === "shopping" || view === "favorites" || view === "nutrition") {
        return view;
      }
    } catch (e) {
      // ignore — fall back to default tab
    }
    return "pantry";
  }); // pantry | shopping | favorites | nutrition

  // Interactive-link support: when someone opens the app via a shared
  // "?code=XXXX&from=968xxxxxxx" link, we auto-join that household and
  // remember the sender's number so a "all bought" confirmation can be
  // sent straight back to them later, even after the tab is closed and
  // reopened (kept in localStorage, not shared — it's a per-device hint).
  const [reportToPhone, setReportToPhone] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const fromParam = params.get("from");
      if (fromParam) {
        localStorage.setItem("report-to-phone", fromParam);
        return fromParam;
      }
      return localStorage.getItem("report-to-phone") || "";
    } catch (e) {
      return "";
    }
  });
  const linkedHouseholdCode = (() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("code") || "";
    } catch (e) {
      return "";
    }
  })();
  const [myPhone, setMyPhone] = useState(""); // this device's own number, for the interactive link
  const [showMyPhonePrompt, setShowMyPhonePrompt] = useState(false);
  const [myPhoneInput, setMyPhoneInput] = useState("");
  const [completionBanner, setCompletionBanner] = useState(false);
  const prevNeededRef = useRef(null);

  const [dietPlanKey, setDietPlanKey] = useState(null); // null | "gain" | "loss" | "smart"
  const [activeDietDay, setActiveDietDay] = useState(0);
  const [nutritionProfile, setNutritionProfile] = useState(null); // saved calculator inputs
  const [profileForm, setProfileForm] = useState({
    weight: "", height: "", age: "", gender: "male", activity: "1.55", goalAdj: "0",
  });
  const [activeCategory, setActiveCategory] = useState("kitchen");
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = adding new
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("kitchen");
  const [newImage, setNewImage] = useState(null);
  const [newUrgent, setNewUrgent] = useState(false);
  const [newBarcode, setNewBarcode] = useState(null);
  const [newExpiry, setNewExpiry] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newNote, setNewNote] = useState("");
  const [openHelp, setOpenHelp] = useState(null);
  const toggleHelp = (key) => setOpenHelp(openHelp === key ? null : key);

  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickQueue, setQuickQueue] = useState([]);
  const [quickIndex, setQuickIndex] = useState(0);
  const [quickAddedCount, setQuickAddedCount] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStartX = useRef(0);
  const [showFieldInfo, setShowFieldInfo] = useState(null);
  const [newFavorite, setNewFavorite] = useState(false);
  const [newAssignedTo, setNewAssignedTo] = useState("");
  const [newOccasion, setNewOccasion] = useState("");
  const [onlyMine, setOnlyMine] = useState(false);

  const [showTemplates, setShowTemplates] = useState(false);
  const [pickedTemplate, setPickedTemplate] = useState(null);
  const [templateLabel, setTemplateLabel] = useState("");
  const [templateItems, setTemplateItems] = useState([]);
  const [newTemplateItemName, setNewTemplateItemName] = useState("");
  const [newTemplateItemCategory, setNewTemplateItemCategory] = useState("kitchen");
  const [imageBusy, setImageBusy] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [lang, setLang] = useState("ar");
  const t = useT(lang);
  const toastTimer = useRef(null);

  const [householdCode, setHouseholdCode] = useState(null); // null = checking, "" = needs onboarding
  const [codeInput, setCodeInput] = useState("");
  const [householdBusy, setHouseholdBusy] = useState(false);
  const [householdErr, setHouseholdErr] = useState(null);

  const [showScanner, setShowScanner] = useState(false);
  const [scannerLoading, setScannerLoading] = useState(false);
  const [scannerError, setScannerError] = useState(null);
  const [manualBarcode, setManualBarcode] = useState("");
  const scannerTargetRef = useRef(null);

  const [userName, setUserName] = useState(null);
  const [askName, setAskName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const [waContacts, setWaContacts] = useState(null);
  const [showWaSettings, setShowWaSettings] = useState(false);
  const [waNameInput, setWaNameInput] = useState("");
  const [waPhoneInput, setWaPhoneInput] = useState("");
  const [showRecipientPicker, setShowRecipientPicker] = useState(false);
  const [pendingWaText, setPendingWaText] = useState(null);
  const [pendingWaIsLink, setPendingWaIsLink] = useState(false);

  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showRecipes, setShowRecipes] = useState(false);
  const [recipeCycle, setRecipeCycle] = useState({ breakfast: 0, lunch: 0, dinner: 0 });
  const [isListening, setIsListening] = useState(false);
  const [showHouseholdQr, setShowHouseholdQr] = useState(false);

  const [showOcrScan, setShowOcrScan] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState(null);
  const [ocrItems, setOcrItems] = useState(null);
  const [newOcrItemName, setNewOcrItemName] = useState("");

  const [showSplit, setShowSplit] = useState(false);
  const [showMonthCard, setShowMonthCard] = useState(false);
  const [monthCardAuto, setMonthCardAuto] = useState(false);
  const [monthCardDate, setMonthCardDate] = useState(null);

  const [welcomeBack, setWelcomeBack] = useState(null);
  const [showWelcomeBack, setShowWelcomeBack] = useState(true);
  const [notifPermissionAsked, setNotifPermissionAsked] = useState(false);

  const [monthlyBudget, setMonthlyBudget] = useState(null);
  const [showBudget, setShowBudget] = useState(false);
  const [newBudgetInput, setNewBudgetInput] = useState("");

  // Step 1: figure out which household this device belongs to,
  // and load the person's own name (name is per-person, not per-household).
  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get("dark-mode", false);
        if (result && result.value === "1") {
          Object.assign(COLORS, DARK_COLORS);
          setDarkMode(true);
        }
      } catch (e) {
        // default stays light
      }
    })();

    (async () => {
      try {
        const result = await window.storage.get("my-phone", false);
        if (result && result.value) setMyPhone(result.value);
      } catch (e) {
        // not set yet — fine
      }
    })();

    (async () => {
      // A shared interactive link (?code=XXXX) always wins over whatever
      // household this device was previously on — that's the point of
      // sharing a link: it takes you straight to that specific list.
      if (linkedHouseholdCode) {
        setHouseholdCode(linkedHouseholdCode);
        try {
          await window.storage.set("household-code", linkedHouseholdCode, false);
        } catch (e) {
          // non-fatal
        }
        return;
      }
      try {
        const result = await window.storage.get("household-code", false);
        if (result && result.value) {
          setHouseholdCode(result.value);
        } else {
          setHouseholdCode("");
        }
      } catch (e) {
        setHouseholdCode("");
      }
    })();

    (async () => {
      try {
        const result = await window.storage.get("user-name", false);
        if (result && result.value) {
          setUserName(result.value);
        } else {
          setUserName("");
          setAskName(true);
        }
      } catch (e) {
        setUserName("");
        setAskName(true);
      }
    })();
  }, []);

  // Step 2: once we know the household code, subscribe LIVE to that
  // household's pantry list (instead of loading it once) so any change
  // made on any device — checking an item off, adding something — shows
  // up here immediately without a manual refresh. This is what makes
  // the shared shopping list actually feel "live" between phones.
  useEffect(() => {
    if (!householdCode) return;

    setItems(null); // show loading state while the first snapshot arrives
    prevNeededRef.current = null;
    const unsubscribe = window.storage.listenShared(
      `pantry-items:${householdCode}`,
      (value) => {
        let parsed;
        try {
          parsed = value ? JSON.parse(value) : SEED_ITEMS;
        } catch (e) {
          parsed = SEED_ITEMS;
        }
        const neededCount = parsed.filter((i) => i.needed).length;
        // Fired every time the shared list changes on ANY device. If we
        // had at least one item needed before and now there are none,
        // the household just finished shopping — show the completion
        // banner (only meaningful on a device that opened via a shared
        // link, since that's the only one with somewhere to report to).
        if (
          prevNeededRef.current !== null &&
          prevNeededRef.current > 0 &&
          neededCount === 0 &&
          reportToPhone
        ) {
          setCompletionBanner(true);
        }
        prevNeededRef.current = neededCount;
        setItems(parsed);
      }
    );

    return () => unsubscribe();
  }, [householdCode, reportToPhone]);

  useEffect(() => {
    if (!householdCode) return;

    (async () => {
      try {
        const result = await window.storage.get(`whatsapp-settings:${householdCode}`, true);
        if (result && result.value) {
          const parsed = JSON.parse(result.value);
          if (Array.isArray(parsed.contacts)) {
            setWaContacts(parsed.contacts);
          } else if (parsed.phone) {
            setWaContacts([{ id: uid(), name: "الأب", phone: parsed.phone }]);
          } else {
            setWaContacts([]);
          }
        } else {
          setWaContacts([]);
        }
      } catch (e) {
        setWaContacts([]);
      }
    })();

    (async () => {
      try {
        const result = await window.storage.get(`purchase-history:${householdCode}`, true);
        if (result && result.value) {
          setPurchaseHistory(JSON.parse(result.value));
        } else {
          setPurchaseHistory([]);
        }
      } catch (e) {
        setPurchaseHistory([]);
      }
    })();

    (async () => {
      try {
        const result = await window.storage.get(`budget:${householdCode}`, true);
        if (result && result.value) {
          setMonthlyBudget(parseFloat(result.value));
        } else {
          setMonthlyBudget("");
        }
      } catch (e) {
        setMonthlyBudget("");
      }
    })();

    (async () => {
      try {
        const result = await window.storage.get(`nutrition-profile:${householdCode}`, true);
        if (result && result.value) {
          setNutritionProfile(JSON.parse(result.value));
        } else {
          setNutritionProfile(null);
        }
      } catch (e) {
        setNutritionProfile(null);
      }
    })();
  }, [householdCode]);

  const saveNutritionProfile = async (profile) => {
    setNutritionProfile(profile);
    try {
      await window.storage.set(`nutrition-profile:${householdCode}`, JSON.stringify(profile), true);
    } catch (e) {
      // non-fatal — still usable this session
    }
  };

  // ---- Retention layer: "welcome back" summary + auto month recap + ----
  // ---- best-effort browser notification for urgent expiring items. ----
  // Everything here is derived from data we already have (items,
  // purchaseHistory) — no new backend, no push infrastructure. Runs
  // once the household's items and purchase history have both loaded.
  useEffect(() => {
    if (!householdCode || !items) return;

    const lastVisitKey = `last-visit:${householdCode}`;
    const monthCardKey = `month-card-shown:${householdCode}`;
    const notifDateKey = `notif-sent-date:${householdCode}`;

    (async () => {
      // 1) Welcome-back summary — only if the person was gone 3+ days.
      let lastVisitISO = null;
      try {
        const r = await window.storage.get(lastVisitKey, false);
        lastVisitISO = r && r.value ? r.value : null;
      } catch (e) {
        lastVisitISO = null;
      }

      if (lastVisitISO) {
        const daysGone = Math.floor((Date.now() - new Date(lastVisitISO).getTime()) / 86400000);
        if (daysGone >= 3) {
          const boughtSince = purchaseHistory.filter(
            (h) => new Date(h.boughtAt).getTime() > new Date(lastVisitISO).getTime()
          ).length;
          const neededNow = items.filter((i) => i.needed).length;
          const expiringNow = items
            .filter((i) => i.expiry)
            .map((i) => ({ ...i, _days: daysUntil(i.expiry) }))
            .filter((i) => i._days <= 3).length;

          if (boughtSince > 0 || neededNow > 0 || expiringNow > 0) {
            setWelcomeBack({ daysGone, boughtSince, neededNow, expiringNow });
            setShowWelcomeBack(true);
          }
        }
      }

      try {
        await window.storage.set(lastVisitKey, new Date().toISOString(), false);
      } catch (e) {
        // non-fatal
      }

      // 2) Auto-open last month's recap once, early in a new month —
      // same data buildMonthCardData() already computes, just surfaced
      // proactively instead of waiting for someone to dig for it in
      // settings.
      const now = new Date();
      if (now.getDate() <= 7) {
        const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevKey = `${prevMonthDate.getFullYear()}-${prevMonthDate.getMonth()}`;
        let alreadyShown = null;
        try {
          const r = await window.storage.get(monthCardKey, false);
          alreadyShown = r && r.value ? r.value : null;
        } catch (e) {
          alreadyShown = null;
        }
        const hasPrevMonthData = purchaseHistory.some((h) => {
          const d = new Date(h.boughtAt);
          return `${d.getFullYear()}-${d.getMonth()}` === prevKey;
        });
        if (alreadyShown !== prevKey && hasPrevMonthData) {
          setMonthCardAuto(true);
          setMonthCardDate(prevMonthDate);
          setShowMonthCard(true);
          try {
            await window.storage.set(monthCardKey, prevKey, false);
          } catch (e) {
            // non-fatal
          }
        }
      }

      // 3) Best-effort native notification for items expiring within a
      // day. Only fires while the app/tab is actually open — this is
      // NOT push (won't reach a closed app) — and only once per day so
      // it doesn't nag. Silently skipped if the browser or the person
      // doesn't support/allow notifications.
      if (typeof Notification !== "undefined") {
        const urgent = items
          .filter((i) => i.expiry)
          .map((i) => ({ ...i, _days: daysUntil(i.expiry) }))
          .filter((i) => i._days <= 1);

        if (urgent.length > 0) {
          let sentDate = null;
          try {
            const r = await window.storage.get(notifDateKey, false);
            sentDate = r && r.value ? r.value : null;
          } catch (e) {
            sentDate = null;
          }
          const todayKey = now.toDateString();
          if (sentDate !== todayKey) {
            const fire = () => {
              try {
                const body =
                  urgent.length === 1
                    ? `${urgent[0].name} قارب على الانتهاء`
                    : `${urgent.length} أغراض قاربت على الانتهاء`;
                new Notification("مونة", { body, icon: "/icon-192.png" });
              } catch (e) {
                // non-fatal — notification just won't show
              }
            };
            if (Notification.permission === "granted") {
              fire();
              window.storage.set(notifDateKey, todayKey, false).catch(() => {});
            } else if (Notification.permission === "default" && !notifPermissionAsked) {
              setNotifPermissionAsked(true);
              Notification.requestPermission().then((perm) => {
                if (perm === "granted") {
                  fire();
                  window.storage.set(notifDateKey, todayKey, false).catch(() => {});
                }
              });
            }
          }
        }
      }
    })();
  }, [householdCode, items, purchaseHistory]);

  const createHousehold = () => {
    const code = generateHouseholdCode();
    setHouseholdErr(null);
    setHouseholdCode(code);
    (async () => {
      try {
        await window.storage.set("household-code", code, false);
      } catch (e) {
        // non-fatal — code still works this session
      }
      try {
        await window.storage.set(
          `pantry-items:${code}`,
          JSON.stringify(SEED_ITEMS),
          true
        );
      } catch (e) {
        // non-fatal
      }
    })();
  };

  const joinHousehold = async () => {
    const code = codeInput.trim().toUpperCase();
    if (!code) return;
    setHouseholdErr(null);
    setHouseholdBusy(true);
    try {
      const result = await window.storage.get(`pantry-items:${code}`, true);
      if (!result || !result.value) {
        setHouseholdErr("ما لقينا بيت بهذا الكود — تأكد منه مع اللي أرسله لك");
        setHouseholdBusy(false);
        return;
      }
    } catch (e) {
      setHouseholdErr("ما لقينا بيت بهذا الكود — تأكد منه مع اللي أرسله لك");
      setHouseholdBusy(false);
      return;
    }
    setHouseholdCode(code);
    try {
      await window.storage.set("household-code", code, false);
    } catch (e) {
      // non-fatal
    }
    setHouseholdBusy(false);
  };

  const leaveHousehold = async () => {
    try {
      await window.storage.set("household-code", "", false);
    } catch (e) {
      // non-fatal
    }
    setHouseholdCode("");
    setItems(null);
    setWaContacts(null);
    setCodeInput("");
    setShowWaSettings(false);
  };

  const saveName = async () => {
    const name = nameInput.trim();
    if (!name) return;
    setUserName(name);
    setAskName(false);
    try {
      await window.storage.set("user-name", name, false);
    } catch (e) {
      // non-fatal — name still works for this session
    }
  };

  const saveMyPhone = async () => {
    const phone = myPhoneInput.trim();
    if (!phone) return;
    setMyPhone(phone);
    setShowMyPhonePrompt(false);
    try {
      await window.storage.set("my-phone", phone, false);
    } catch (e) {
      // non-fatal — still usable this session
    }
  };

  const persistWaContacts = async (next) => {
    setWaContacts(next);
    try {
      await window.storage.set(
        `whatsapp-settings:${householdCode}`,
        JSON.stringify({ contacts: next }),
        true
      );
    } catch (e) {
      setLoadError(true);
    }
  };

  const addWaContact = () => {
    const name = waNameInput.trim();
    const phone = waPhoneInput.trim();
    if (!name || !phone) return;
    persistWaContacts([...waContacts, { id: uid(), name, phone }]);
    setWaNameInput("");
    setWaPhoneInput("");
    showToast(`تم حفظ رقم ${name}`);
  };

  const removeWaContact = (id) => {
    persistWaContacts(waContacts.filter((c) => c.id !== id));
  };

  const buildShoppingText = () => {
    const neededItems = items.filter((i) => i.needed);
    const lines = CATEGORIES.map((c) => {
      const catItems = neededItems.filter((i) => i.category === c.id);
      if (catItems.length === 0) return null;
      const rows = catItems
        .map((i) => {
          const priceTag = i.price != null ? ` — ${i.price.toFixed(2)} ر.ع` : "";
          const urgentTag = i.urgent ? " 🔴" : "";
          const noteTag = i.note ? ` (📝 ${i.note})` : "";
          return `• ${i.name}${priceTag}${urgentTag}${noteTag}`;
        })
        .join("\n");
      return `${c.icon} ${c.label}\n${rows}`;
    }).filter(Boolean);
    const header = userName
      ? `قائمة الراشن من ${userName}:`
      : "قائمة الراشن:";
    const priced = neededItems.filter((i) => i.price != null);
    const total = priced.reduce((sum, i) => sum + i.price, 0);
    const totalLine =
      priced.length > 0
        ? `\n\n💰 التكلفة التقريبية: ${total.toFixed(2)} ر.ع${
            priced.length < neededItems.length
              ? ` (${neededItems.length - priced.length} أغراض بدون سعر)`
              : ""
          }`
        : "";
    return {
      text: `${header}\n\n${lines.join("\n\n")}${totalLine}`,
      neededItems,
    };
  };

  // Builds the shareable interactive link — opening it takes whoever
  // taps it straight into the live shopping list for this household,
  // and remembers "myPhone" as who to report back to once it's done.
  const buildInteractiveLink = () => {
    const base = `${window.location.origin}${window.location.pathname}`;
    const params = new URLSearchParams();
    // "mode=share" routes to the dedicated, minimal ShareView instead
    // of the full app — see the top of App() and the ShareView
    // component near the bottom of this file.
    params.set("mode", "share");
    params.set("code", householdCode);
    if (myPhone) params.set("from", myPhone);
    return `${base}?${params.toString()}`;
  };

  const buildInteractiveText = () => {
    const neededCount = items.filter((i) => i.needed).length;
    const header = userName
      ? `قائمة الراشن من ${userName} 🫙`
      : "قائمة الراشن 🫙";
    const link = buildInteractiveLink();
    return `${header}\n\n${neededCount} غرض بانتظارك — افتح الرابط وحدد كل غرض تشتريه، وبنعرف أول ما تخلص:\n\n${link}`;
  };

  const openWaLink = (phone, text) => {
    const phoneDigits = (phone || "").replace(/[^0-9]/g, "");
    const url = phoneDigits
      ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const sendToWhatsApp = () => {
    const { text, neededItems } = buildShoppingText();
    if (neededItems.length === 0) return;
    if (waContacts && waContacts.length > 1) {
      setPendingWaText(text);
      setPendingWaIsLink(false);
      setShowRecipientPicker(true);
      return;
    }
    const phone = waContacts && waContacts[0] ? waContacts[0].phone : "";
    openWaLink(phone, text);
  };

  // The "special" interactive send — shares a link instead of plain
  // text. Asks for the sender's own number once (so the recipient's
  // "all done" confirmation has somewhere to go), then reuses it.
  const sendInteractiveLink = () => {
    const neededItems = items.filter((i) => i.needed);
    if (neededItems.length === 0) return;
    if (!myPhone) {
      setShowMyPhonePrompt(true);
      return;
    }
    const text = buildInteractiveText();
    if (waContacts && waContacts.length > 1) {
      setPendingWaText(text);
      setPendingWaIsLink(true);
      setShowRecipientPicker(true);
      return;
    }
    const phone = waContacts && waContacts[0] ? waContacts[0].phone : "";
    openWaLink(phone, text);
  };

  const pickRecipientAndSend = (phone) => {
    setShowRecipientPicker(false);
    if (pendingWaText) openWaLink(phone, pendingWaText);
    setPendingWaText(null);
    setPendingWaIsLink(false);
  };

  const sendCompletionConfirmation = () => {
    const text = userName
      ? `✅ تم شراء كل النواقص — بواسطة ${userName}`
      : "✅ تم شراء كل النواقص";
    openWaLink(reportToPhone, text);
    setCompletionBanner(false);
  };

  const buildMonthCardData = (targetDate) => {
    const now = targetDate || new Date();
    const key = `${now.getFullYear()}-${now.getMonth()}`;
    const monthLabel = now.toLocaleDateString("ar", { month: "long", year: "numeric" });
    const monthEntries = purchaseHistory.filter((h) => {
      const d = new Date(h.boughtAt);
      return `${d.getFullYear()}-${d.getMonth()}` === key;
    });
    if (monthEntries.length === 0) return null;

    const itemFreq = {};
    const contributorFreq = {};
    let totalSpend = 0;
    monthEntries.forEach((h) => {
      itemFreq[h.name] = (itemFreq[h.name] || 0) + 1;
      if (h.boughtBy) contributorFreq[h.boughtBy] = (contributorFreq[h.boughtBy] || 0) + 1;
      if (h.price != null) totalSpend += h.price;
    });
    const topItem = Object.entries(itemFreq).sort((a, b) => b[1] - a[1])[0];
    const topContributor = Object.entries(contributorFreq).sort((a, b) => b[1] - a[1])[0];

    const activeDays = [
      ...new Set(monthEntries.map((h) => new Date(h.boughtAt).getDate())),
    ].sort((a, b) => a - b);
    let longestStreak = 1;
    let currentStreak = 1;
    for (let i = 1; i < activeDays.length; i++) {
      if (activeDays[i] === activeDays[i - 1] + 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return {
      monthLabel,
      itemCount: monthEntries.length,
      topItem: topItem ? topItem[0] : null,
      topItemCount: topItem ? topItem[1] : 0,
      topContributor: topContributor ? topContributor[0] : null,
      totalSpend,
      longestStreak,
    };
  };

  const shareMonthCard = () => {
    const card = buildMonthCardData();
    if (!card) return;
    const text = `📊 بطاقة شهر ${card.monthLabel}\n\n🏆 أكثر غرض: ${card.topItem} (${card.topItemCount} مرات)${
      card.topContributor ? `\n👑 أكثر مساهم: ${card.topContributor}` : ""
    }\n📦 عدد المشتريات: ${card.itemCount} غرض${
      card.totalSpend > 0 ? `\n💰 إجمالي المصروف: ${card.totalSpend.toFixed(2)} ر.ع` : ""
    }${
      card.longestStreak > 1 ? `\n🔥 أطول سلسلة نشاط: ${card.longestStreak} أيام متتالية` : ""
    }\n\nصنعناها بتطبيق مونة 🫙`;
    if (waContacts && waContacts.length > 1) {
      setPendingWaText(text);
      setPendingWaIsLink(false);
      setShowRecipientPicker(true);
      return;
    }
    const phone = waContacts && waContacts[0] ? waContacts[0].phone : "";
    openWaLink(phone, text);
  };

  const dataUrlToFile = async (dataUrl, filename) => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type || "image/jpeg" });
  };

  const shareWithPhotos = async () => {
    const { text, neededItems } = buildShoppingText();
    const withPhotos = neededItems.filter((i) => i.image);
    if (neededItems.length === 0) return;

    if (withPhotos.length === 0) {
      sendToWhatsApp();
      return;
    }

    try {
      const files = await Promise.all(
        withPhotos.map((item, idx) =>
          dataUrlToFile(item.image, `${idx + 1}-${item.name}.jpg`)
        )
      );
      const canShareFiles =
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files });
      if (canShareFiles) {
        await navigator.share({ text, files });
      } else {
        showToast("جوالك ما يدعم مشاركة الصور مباشرة — نزّلها يدوياً");
        downloadImages(withPhotos);
        sendToWhatsApp();
      }
    } catch (e) {
      if (e && e.name === "AbortError") return;
      showToast("تعذّرت المشاركة المباشرة — نزّلنا الصور بدلها");
      downloadImages(withPhotos);
      sendToWhatsApp();
    }
  };

  const downloadImages = (itemsWithImages) => {
    itemsWithImages.forEach((item, idx) => {
      const a = document.createElement("a");
      a.href = item.image;
      a.download = `${idx + 1}-${item.name}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  // Writes the change to Firestore and updates local state optimistically;
  // the live listener set up above will receive this same write back
  // and confirm it (and is what propagates it to every OTHER open device).
  const persist = async (next) => {
    setItems(next);
    try {
      await window.storage.set(`pantry-items:${householdCode}`, JSON.stringify(next), true);
    } catch (e) {
      setLoadError(true);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  const toggleDarkMode = async () => {
    const next = !darkMode;
    Object.assign(COLORS, next ? DARK_COLORS : LIGHT_COLORS);
    setDarkMode(next);
    try {
      await window.storage.set("dark-mode", next ? "1" : "0", false);
    } catch (e) {
      // non-fatal — preference just won't persist across sessions
    }
  };

  const toggleLang = () => {
    setLang(lang === "ar" ? "en" : "ar");
  };

  const toggleNeeded = (id) => {
    const next = items.map((it) =>
      it.id === id ? { ...it, needed: !it.needed } : it
    );
    persist(next);
    const item = items.find((i) => i.id === id);
    if (item) showToast(item.needed ? `${item.name} رجعت للمخزون` : `أُضيفت ${item.name} لقائمة الشراء`);
  };

  const toggleFavorite = (id) => {
    const next = items.map((it) =>
      it.id === id ? { ...it, favorite: !it.favorite } : it
    );
    persist(next);
    const item = items.find((i) => i.id === id);
    if (item)
      showToast(
        item.favorite ? `أُزيل ${item.name} من المفضلة` : `أُضيف ${item.name} للمفضلة ⭐`
      );
  };

  const addAllFavoritesToShopping = () => {
    const favs = items.filter((i) => i.favorite && !i.needed);
    if (favs.length === 0) {
      showToast("كل المفضلة موجودة بقائمة الشراء أصلاً");
      return;
    }
    const next = items.map((it) =>
      it.favorite ? { ...it, needed: true } : it
    );
    persist(next);
    showToast(`أُضيفت ${favs.length} أغراض لقائمة الشراء`);
  };

  const finishOccasion = (occasionName) => {
    const next = items.map((it) =>
      it.occasion === occasionName ? { ...it, occasion: null } : it
    );
    persist(next);
    showToast(`تم إنهاء "${occasionName}"`);
  };

  const openQuickAdd = () => {
    const existingNames = items.map((i) => i.name.trim().toLowerCase());
    const pool = COMMON_ITEMS.filter(
      (c) => !existingNames.includes(c.name.trim().toLowerCase())
    );
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setQuickQueue(shuffled);
    setQuickIndex(0);
    setQuickAddedCount(0);
    setDragX(0);
    setShowQuickAdd(true);
  };

  const quickAccept = () => {
    const card = quickQueue[quickIndex];
    if (card) {
      const next = [
        ...items,
        {
          id: uid(),
          name: card.name,
          category: card.category,
          needed: true,
          urgent: false,
          addedBy: userName || "",
          image: null,
          barcode: null,
          expiry: null,
          favorite: false,
          assignedTo: null,
          occasion: null,
          price: null,
          note: null,
        },
      ];
      persist(next);
      setQuickAddedCount((c) => c + 1);
    }
    setDragX(0);
    setQuickIndex((i) => i + 1);
  };

  const quickReject = () => {
    setDragX(0);
    setQuickIndex((i) => i + 1);
  };

  const handleCardPointerDown = (e) => {
    setDragging(true);
    dragStartX.current = (e.touches ? e.touches[0].clientX : e.clientX) - dragX;
  };

  const handleCardPointerMove = (e) => {
    if (!dragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setDragX(clientX - dragStartX.current);
  };

  const handleCardPointerUp = () => {
    setDragging(false);
    if (dragX > 90) {
      quickAccept();
    } else if (dragX < -90) {
      quickReject();
    } else {
      setDragX(0);
    }
  };

  const openTemplate = (template) => {
    setPickedTemplate(template);
    setTemplateLabel(template.name);
    setTemplateItems(template.items.map((it) => ({ ...it })));
    setNewTemplateItemName("");
    setNewTemplateItemCategory("kitchen");
  };

  const addTemplateItem = () => {
    const name = newTemplateItemName.trim();
    if (!name) return;
    setTemplateItems([...templateItems, { name, category: newTemplateItemCategory }]);
    setNewTemplateItemName("");
  };

  const removeTemplateItem = (idx) => {
    setTemplateItems(templateItems.filter((_, i) => i !== idx));
  };

  const applyTemplate = () => {
    if (!pickedTemplate || templateItems.length === 0) return;
    const label = templateLabel.trim() || pickedTemplate.name;
    const newItems = templateItems.map((it) => ({
      id: uid(),
      name: it.name,
      category: it.category,
      needed: true,
      urgent: false,
      addedBy: userName || "",
      image: null,
      barcode: null,
      expiry: null,
      favorite: false,
      assignedTo: null,
      occasion: label,
      price: null,
    }));
    persist([...items, ...newItems]);
    showToast(`أُضيف قالب "${pickedTemplate.name}" (${newItems.length} أغراض) ✓`);
    setPickedTemplate(null);
    setShowTemplates(false);
    setTab("shopping");
  };

  const handleImagePick = async (file) => {
    if (!file) return;
    setImageBusy(true);
    try {
      const dataUrl = await resizeImageFile(file);
      setNewImage(dataUrl);
    } catch (e) {
      showToast("تعذّر تحميل الصورة");
    } finally {
      setImageBusy(false);
    }
  };

  const runOcrScan = async (file) => {
    if (!file) return;
    setOcrError(null);
    setOcrItems(null);
    setOcrLoading(true);
    try {
      const Tesseract = await loadTesseractScript();
      const { data } = await Tesseract.recognize(file, "ara+eng");
      const rawText = (data && data.text) || "";
      const lines = rawText
        .split(/\n+/)
        .map((l) => l.trim())
        .filter((l) => l.length > 1 && l.length < 60);
      if (lines.length === 0) {
        setOcrError("ما قدرنا نقرأ أي نص واضح — جرب صورة أوضح أو إضاءة أفضل");
      } else {
        setOcrItems(lines);
      }
    } catch (e) {
      setOcrError("تعذّرت القراءة — تأكد من اتصالك بالإنترنت وجرب مرة ثانية");
    } finally {
      setOcrLoading(false);
    }
  };

  const removeOcrItem = (idx) => {
    setOcrItems(ocrItems.filter((_, i) => i !== idx));
  };

  const addOcrItem = () => {
    const name = newOcrItemName.trim();
    if (!name) return;
    setOcrItems([...(ocrItems || []), name]);
    setNewOcrItemName("");
  };

  const confirmOcrItems = () => {
    if (!ocrItems || ocrItems.length === 0) return;
    const newItems = ocrItems.map((name) => ({
      id: uid(),
      name,
      category: "other",
      needed: true,
      urgent: false,
      addedBy: userName || "",
      image: null,
      barcode: null,
      expiry: null,
      favorite: false,
      assignedTo: null,
      occasion: null,
      price: null,
    }));
    persist([...items, ...newItems]);
    showToast(`أُضيف ${newItems.length} أغراض من القائمة الورقية ✓`);
    setShowOcrScan(false);
    setOcrItems(null);
    setOcrError(null);
    setTab("shopping");
  };

  const startVoiceInput = () => {
    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      showToast("الميزة مو مدعومة بهذا المتصفح");
      return;
    }
    try {
      const recognition = new SpeechRecognitionCtor();
      recognition.lang = "ar-SA";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => {
        setIsListening(false);
        showToast("تعذّر التعرف على الصوت — جرب مرة ثانية");
      };
      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript.trim();
        if (transcript) setNewName(transcript);
      };
      recognition.start();
    } catch (e) {
      setIsListening(false);
      showToast("تعذّر تشغيل التعرف الصوتي");
    }
  };

  const printShoppingList = () => {
    const { text } = buildShoppingText();
    const w = window.open("", "_blank");
    if (!w) {
      showToast("تعذّر فتح نافذة الطباعة — تأكد إن المتصفح ما يحجب النوافذ المنبثقة");
      return;
    }
    const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8">
      <title>قائمة الراشن</title>
      <style>
        body{font-family:'Tajawal',Arial,sans-serif;direction:rtl;padding:24px;white-space:pre-wrap;font-size:16px;line-height:1.9;color:#2B2420}
        h1{font-size:20px;margin-bottom:16px}
      </style></head>
      <body><h1>🫙 قائمة الراشن</h1>${text.replace(/\n/g, "<br>")}</body></html>`;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  const handleDetected = (result) => {
    const code = result && result.codeResult && result.codeResult.code;
    if (!code) return;
    closeScanner();
    lookupBarcode(code);
  };

  const closeScanner = () => {
    try {
      if (window.Quagga) {
        window.Quagga.offDetected(handleDetected);
        window.Quagga.stop();
      }
    } catch (e) {
      // ignore — scanner may not have started yet
    }
    setShowScanner(false);
    setScannerLoading(false);
  };

  const openScanner = async () => {
    setScannerError(null);
    setScannerLoading(true);
    setShowScanner(true);
    try {
      const Quagga = await loadQuaggaScript();
      Quagga.init(
        {
          inputStream: {
            type: "LiveStream",
            target: scannerTargetRef.current,
            constraints: { facingMode: "environment" },
          },
          decoder: {
            readers: [
              "ean_reader",
              "ean_8_reader",
              "upc_reader",
              "upc_e_reader",
              "code_128_reader",
            ],
          },
          locate: true,
        },
        (err) => {
          setScannerLoading(false);
          if (err) {
            setScannerError(
              "تعذّر تشغيل الكاميرا — تأكد إنك سمحت للمتصفح بالوصول لها"
            );
            return;
          }
          Quagga.start();
          Quagga.onDetected(handleDetected);
        }
      );
    } catch (e) {
      setScannerLoading(false);
      setScannerError("تعذّر تحميل الماسح — تأكد من اتصالك بالإنترنت");
    }
  };

  const lookupBarcode = async (code) => {
    setNewBarcode(code);
    try {
      const res = await window.storage.get(`barcode:${code}`, true);
      if (res && res.value) {
        const data = JSON.parse(res.value);
        setNewName(data.name || "");
        setNewCategory(data.category || "kitchen");
        setNewImage(data.image || null);
        showToast("لقينا المنتج بالقاعدة المشتركة ✓");
      } else {
        showToast("منتج جديد — اكتب اسمه وبيصير معروف للجميع بعدين");
      }
    } catch (e) {
      showToast("منتج جديد — اكتب اسمه");
    }
    setShowAdd(true);
  };

  const submitManualBarcode = () => {
    const code = manualBarcode.trim();
    if (!code) return;
    closeScanner();
    setManualBarcode("");
    lookupBarcode(code);
  };

  const resetModalFields = () => {
    setNewName("");
    setNewCategory("kitchen");
    setNewImage(null);
    setNewUrgent(false);
    setNewBarcode(null);
    setNewExpiry("");
    setNewFavorite(false);
    setNewAssignedTo("");
    setNewOccasion("");
    setNewPrice("");
    setNewNote("");
    setEditingId(null);
  };

  const openAddModal = () => {
    resetModalFields();
    setShowAdd(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setNewName(item.name);
    setNewCategory(item.category);
    setNewImage(item.image || null);
    setNewUrgent(!!item.urgent);
    setNewBarcode(item.barcode || null);
    setNewExpiry(item.expiry || "");
    setNewFavorite(!!item.favorite);
    setNewAssignedTo(item.assignedTo || "");
    setNewOccasion(item.occasion || "");
    setNewPrice(item.price != null ? String(item.price) : "");
    setNewNote(item.note || "");
    setShowAdd(true);
  };

  const saveItem = async () => {
    const name = newName.trim();
    if (!name) return;
    const priceNum = newPrice.trim() ? parseFloat(newPrice) : null;
    const price = priceNum != null && !isNaN(priceNum) ? priceNum : null;

    if (editingId) {
      const next = items.map((it) =>
        it.id === editingId
          ? {
              ...it,
              name,
              category: newCategory,
              image: newImage || null,
              urgent: newUrgent,
              barcode: newBarcode || it.barcode || null,
              expiry: newExpiry || null,
              favorite: newFavorite,
              assignedTo: newAssignedTo.trim() || null,
              occasion: newOccasion.trim() || null,
              price,
              note: newNote.trim() || null,
            }
          : it
      );
      persist(next);
      showToast(`تم تحديث "${name}"`);
    } else {
      const next = [
        ...items,
        {
          id: uid(),
          name,
          category: newCategory,
          needed: true,
          urgent: newUrgent,
          addedBy: userName || "",
          image: newImage || null,
          barcode: newBarcode || null,
          expiry: newExpiry || null,
          favorite: newFavorite,
          assignedTo: newAssignedTo.trim() || null,
          occasion: newOccasion.trim() || null,
          price,
          note: newNote.trim() || null,
        },
      ];
      persist(next);
      showToast(`أُضيف "${name}" لقائمة الشراء`);
    }

    if (newBarcode) {
      try {
        await window.storage.set(
          `barcode:${newBarcode}`,
          JSON.stringify({ name, category: newCategory, image: newImage || null }),
          true
        );
      } catch (e) {
        // non-fatal — item is still saved locally
      }
    }

    resetModalFields();
    setShowAdd(false);
  };

  const removeItem = (id) => {
    const item = items.find((i) => i.id === id);
    persist(items.filter((i) => i.id !== id));
    if (item) showToast(`حُذف ${item.name}`);
    setShowAdd(false);
    resetModalFields();
  };

  const persistHistory = async (next) => {
    setPurchaseHistory(next);
    try {
      await window.storage.set(
        `purchase-history:${householdCode}`,
        JSON.stringify(next),
        true
      );
    } catch (e) {
      // non-fatal — history is a nice-to-have, not critical
    }
  };

  const saveBudget = () => {
    const num = parseFloat(newBudgetInput);
    const value = !isNaN(num) && num > 0 ? num : "";
    setMonthlyBudget(value);
    setNewBudgetInput("");
    (async () => {
      try {
        await window.storage.set(`budget:${householdCode}`, value === "" ? "" : String(value), true);
      } catch (e) {
        // non-fatal
      }
    })();
    if (value !== "") showToast("تم حفظ الميزانية الشهرية");
  };

  const markBought = (id) => {
    const next = items.map((it) =>
      it.id === id ? { ...it, needed: false } : it
    );
    persist(next);
    const item = items.find((i) => i.id === id);
    if (item) {
      showToast(`تمّ شراء ${item.name} ✓`);
      const entry = {
        id: uid(),
        name: item.name,
        category: item.category,
        price: item.price != null ? item.price : null,
        boughtBy: userName || "",
        boughtAt: new Date().toISOString(),
      };
      const nextHistory = [entry, ...purchaseHistory].slice(0, 300);
      persistHistory(nextHistory);
    }
  };

  useEffect(() => {
    const anyOverlayOpen =
      showAdd ||
      showScanner ||
      showTemplates ||
      showWaSettings ||
      showHistory ||
      showStats ||
      showRecipes ||
      showOcrScan ||
      showSplit ||
      showMonthCard ||
      showBudget ||
      showQuickAdd ||
      showRecipientPicker ||
      showMyPhonePrompt;
    if (anyOverlayOpen || tab !== "pantry") {
      window.history.pushState({ pantryAppNav: true }, "");
    }
  }, [showAdd, showScanner, showTemplates, showWaSettings, showHistory, showStats, showRecipes, showOcrScan, showSplit, showMonthCard, showBudget, showQuickAdd, showRecipientPicker, showMyPhonePrompt, tab]);

  useEffect(() => {
    const handlePopState = () => {
      if (showScanner) {
        closeScanner();
        return;
      }
      if (showTemplates) {
        setShowTemplates(false);
        setPickedTemplate(null);
        return;
      }
      if (showWaSettings) {
        setShowWaSettings(false);
        return;
      }
      if (showHistory) {
        setShowHistory(false);
        return;
      }
      if (showStats) {
        setShowStats(false);
        return;
      }
      if (showRecipes) {
        setShowRecipes(false);
        return;
      }
      if (showOcrScan) {
        setShowOcrScan(false);
        setOcrItems(null);
        setOcrError(null);
        return;
      }
      if (showSplit) {
        setShowSplit(false);
        return;
      }
      if (showMonthCard) {
        setShowMonthCard(false);
        return;
      }
      if (showBudget) {
        setShowBudget(false);
        return;
      }
      if (showQuickAdd) {
        setShowQuickAdd(false);
        return;
      }
      if (showMyPhonePrompt) {
        setShowMyPhonePrompt(false);
        return;
      }
      if (showRecipientPicker) {
        setShowRecipientPicker(false);
        setPendingWaText(null);
        setPendingWaIsLink(false);
        return;
      }
      if (showAdd) {
        setShowAdd(false);
        resetModalFields();
        return;
      }
      if (tab !== "pantry") {
        setTab("pantry");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [showAdd, showScanner, showTemplates, showWaSettings, showHistory, showStats, showRecipes, showOcrScan, showSplit, showMonthCard, showBudget, showQuickAdd, showRecipientPicker, showMyPhonePrompt, tab]);

  // Still checking if this device already belongs to a household
  if (householdCode === null) {
    return (
      <div
        dir="rtl"
        style={{
          fontFamily: "'Tajawal', sans-serif",
          background: COLORS.paper,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: COLORS.ink,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🫙</div>
          <div>جارٍ التحقق…</div>
        </div>
      </div>
    );
  }

  // No household yet — onboarding screen
  if (householdCode === "") {
    return (
      <div
        dir={lang === "ar" ? "rtl" : "ltr"}
        style={{
          fontFamily: "'Tajawal', sans-serif",
          background: COLORS.paper,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          color: COLORS.charcoal,
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 10 }}>🫙</div>
        <h1
          style={{
            fontFamily: "'Cairo', sans-serif",
            fontWeight: 800,
            fontSize: 24,
            color: COLORS.ink,
            margin: "0 0 6px",
          }}
        >
          {t("appName")}
        </h1>
        <p
          style={{
            opacity: 0.65,
            fontSize: 14,
            margin: "0 0 28px",
            textAlign: "center",
          }}
        >
          {t("tagline")}
        </p>

        <div
          style={{
            width: "100%",
            maxWidth: 360,
            background: COLORS.card,
            border: `1px solid ${COLORS.line}`,
            boxShadow: SHADOWS.card,
            borderRadius: 18,
            padding: 20,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontFamily: "'Cairo', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              marginBottom: 10,
            }}
          >
            {t("haveCode")}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && joinHousehold()}
              placeholder="e.g. K3F9Q"
              maxLength={8}
              dir="ltr"
              style={{
                flex: 1,
                boxSizing: "border-box",
                padding: "12px 14px",
                borderRadius: 12,
                border: `1.5px solid ${COLORS.line}`,
                background: COLORS.paper,
                fontSize: 16,
                letterSpacing: 2,
                textAlign: "center",
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 700,
                outline: "none",
              }}
            />
            <button
              onClick={joinHousehold}
              disabled={!codeInput.trim() || householdBusy}
              style={{
                padding: "0 18px",
                borderRadius: 12,
                border: "none",
                background: codeInput.trim() ? COLORS.ink : COLORS.line,
                color: COLORS.paper,
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 800,
                fontSize: 14,
                cursor: codeInput.trim() ? "pointer" : "not-allowed",
              }}
            >
              {householdBusy ? "..." : t("join")}
            </button>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            maxWidth: 360,
            marginBottom: 14,
            opacity: 0.5,
          }}
        >
          <div style={{ flex: 1, height: 1, background: COLORS.line }} />
          <span style={{ fontSize: 12 }}>{t("or")}</span>
          <div style={{ flex: 1, height: 1, background: COLORS.line }} />
        </div>

        <button
          onClick={createHousehold}
          disabled={householdBusy}
          style={{
            width: "100%",
            maxWidth: 360,
            boxSizing: "border-box",
            padding: "14px",
            borderRadius: 14,
            border: `1.5px dashed ${COLORS.sageDeep}`,
            background: "rgba(110,127,92,0.08)",
            color: COLORS.sageDeep,
            fontFamily: "'Cairo', sans-serif",
            fontWeight: 800,
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          {householdBusy
            ? lang === "ar" ? "جارٍ الإنشاء…" : "Creating…"
            : t("createHousehold")}
        </button>

        {householdErr && (
          <div style={{ color: COLORS.rust, fontSize: 12.5, marginTop: 12 }}>
            {householdErr}
          </div>
        )}
      </div>
    );
  }

  if (items === null) {
    return (
      <div
        dir="rtl"
        style={{
          fontFamily: "'Tajawal', sans-serif",
          background: COLORS.paper,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: COLORS.ink,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🫙</div>
          <div>جارٍ تحميل مونة…</div>
        </div>
      </div>
    );
  }

  const byUrgentThenName = (a, b) => {
    if (!!a.urgent !== !!b.urgent) return a.urgent ? -1 : 1;
    return 0;
  };

  const mineFilter = (i) => !onlyMine || !userName || i.assignedTo === userName;

  const neededCount = items.filter((i) => i.needed).length;
  const neededHasPhotos = items.some((i) => i.needed && i.image);
  const query = searchQuery.trim().toLowerCase();
  const categoryItems = items
    .filter((i) => i.category === activeCategory)
    .filter((i) => !query || i.name.toLowerCase().includes(query))
    .filter(mineFilter)
    .sort(byUrgentThenName);

  // All items grouped by category (search + "only mine" applied),
  // used to render the pantry tab as stacked category cards instead
  // of a single chip-filtered list.
  const searchedItems = items
    .filter((i) => !query || i.name.toLowerCase().includes(query))
    .filter(mineFilter);
  const allByCategory = CATEGORIES.map((c) => ({
    ...c,
    items: searchedItems.filter((i) => i.category === c.id).sort(byUrgentThenName),
  })).filter((c) => c.items.length > 0);

  const neededNoOccasion = items.filter((i) => i.needed && !i.occasion && mineFilter(i));
  const shoppingByCategory = CATEGORIES.map((c) => ({
    ...c,
    items: neededNoOccasion.filter((i) => i.category === c.id).sort(byUrgentThenName),
  })).filter((c) => c.items.length > 0);

  const occasionNames = [
    ...new Set(items.filter((i) => i.needed && i.occasion).map((i) => i.occasion)),
  ];
  const occasionGroups = occasionNames.map((name) => ({
    name,
    items: items.filter((i) => i.needed && i.occasion === name && mineFilter(i)),
  })).filter((g) => g.items.length > 0);

  const favoriteItems = items.filter((i) => i.favorite);

  const allNeeded = items.filter((i) => i.needed);
  const pricedNeeded = allNeeded.filter((i) => i.price != null);
  const totalCost = pricedNeeded.reduce((sum, i) => sum + i.price, 0);
  const unpricedCount = allNeeded.length - pricedNeeded.length;

  const spentThisMonth = (() => {
    const now = new Date();
    return purchaseHistory
      .filter((h) => {
        const d = new Date(h.boughtAt);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .reduce((sum, h) => sum + (h.price || 0), 0);
  })();
  const projectedMonthTotal = spentThisMonth + totalCost;

  const expiringSoon = items
    .filter((i) => i.expiry)
    .map((i) => ({ ...i, _days: daysUntil(i.expiry) }))
    .filter((i) => i._days <= 3)
    .sort((a, b) => a._days - b._days);

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      style={{
        fontFamily: "'Tajawal', sans-serif",
        background: COLORS.paper,
        minHeight: "100vh",
        color: COLORS.charcoal,
        paddingBottom: 150,
      }}
    >
      {/* Texture header */}
      <header
        style={{
          background: COLORS.ink,
          color: COLORS.paper,
          padding: "28px 20px 22px",
          borderBottom: `4px solid ${COLORS.saffron}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 15% 20%, rgba(232,163,61,0.15) 0, transparent 35%), radial-gradient(circle at 85% 80%, rgba(110,127,92,0.18) 0, transparent 40%)",
          }}
        />
        <div style={{ position: "relative", maxWidth: 560, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 26 }}>🫙</span>
            <h1
              style={{
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 800,
                fontSize: 26,
                margin: 0,
                letterSpacing: "0.5px",
              }}
            >
              {t("appName")}
            </h1>
          </div>
          <p style={{ margin: 0, opacity: 0.75, fontSize: 14 }}>
            {t("tagline")}
          </p>
        </div>
        <button
          onClick={() => setShowWaSettings(true)}
          aria-label="إعدادات واتساب"
          style={{
            position: "absolute",
            top: 24,
            [lang === "ar" ? "left" : "right"]: 20,
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 10,
            color: COLORS.paper,
            padding: "8px 10px",
            fontSize: 16,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="settings" size={18} />
        </button>
        <button
          onClick={toggleDarkMode}
          aria-label="الوضع الليلي"
          style={{
            position: "absolute",
            top: 24,
            [lang === "ar" ? "left" : "right"]: 68,
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 10,
            color: COLORS.paper,
            padding: "8px 10px",
            fontSize: 16,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name={darkMode ? "sun" : "moon"} size={18} />
        </button>
      </header>

      {/* Just-mine filter — tab switching moved to the bottom nav bar
          (near the end of this component), matching the icon-based
          bottom navigation direction. */}
      {userName ? (
        <div
          style={{
            maxWidth: 560,
            margin: "14px auto 0",
            padding: "0 20px",
          }}
        >
          <button
            onClick={() => setOnlyMine(!onlyMine)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 12px",
              borderRadius: 999,
              border: `1.5px solid ${onlyMine ? COLORS.sage : COLORS.line}`,
              background: onlyMine ? COLORS.sage : "transparent",
              color: onlyMine ? COLORS.paper : COLORS.ink,
              fontSize: 12.5,
              fontFamily: "'Cairo', sans-serif",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <span>{onlyMine ? "✓" : "👤"}</span>
            <span>{t("onlyMine")} ({userName})</span>
          </button>
        </div>
      ) : null}

      {/* Pantry tab */}
      {tab === "pantry" && (
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "18px 20px" }}>
          {/* Search */}
          <div style={{ position: "relative", marginBottom: 14 }}>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 42px 12px 14px",
                borderRadius: 14,
                border: `1.5px solid ${COLORS.line}`,
                background: COLORS.card,
                boxShadow: SHADOWS.pill,
                fontSize: 14,
                fontFamily: "'Tajawal', sans-serif",
                outline: "none",
              }}
            />
            <span
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                opacity: 0.45,
                display: "flex",
              }}
            >
              <Icon name="search" size={16} />
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="مسح البحث"
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "transparent",
                  opacity: 0.5,
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            )}
          </div>

          {/* Quick tools — compact single-row of icon pills instead of four
              stacked full-width buttons, so the pantry screen opens on the
              actual shelf items rather than a wall of buttons. */}
          <div
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              paddingBottom: 4,
              marginBottom: 16,
            }}
          >
            {[
              { svgIcon: "template", label: t("templatesBtn").split(" ")[0], onClick: () => setShowTemplates(true) },
              { svgIcon: "chef", label: "أطبخ اليوم", onClick: () => setShowRecipes(true) },
              { svgIcon: "camera", label: "مسح ورقي", onClick: () => setShowOcrScan(true) },
              { svgIcon: "tap", label: "إضافة سريعة", onClick: openQuickAdd },
            ].map((tool) => (
              <button
                key={tool.label}
                onClick={tool.onClick}
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "9px 14px",
                  borderRadius: 999,
                  border: `1.5px solid ${COLORS.line}`,
                  background: COLORS.card,
                  boxShadow: SHADOWS.pill,
                  color: COLORS.ink,
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 700,
                  fontSize: 12.5,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "transform 0.12s ease, box-shadow 0.12s ease",
                }}
              >
                <span style={{ display: "flex", color: COLORS.sageDeep }}>
                  <Icon name={tool.svgIcon} size={15} />
                </span>
                <span>{tool.label}</span>
              </button>
            ))}
          </div>

          {/* Welcome-back summary — shown only after a 3+ day gap, and
              only if there's something worth reporting. Dismissible. */}
          {welcomeBack && showWelcomeBack && (
            <div
              style={{
                background: "rgba(45,106,79,0.09)",
                border: `1.5px solid rgba(45,106,79,0.25)`,
                borderRadius: 14,
                padding: "12px 14px",
                marginBottom: 16,
                position: "relative",
              }}
            >
              <button
                onClick={() => setShowWelcomeBack(false)}
                aria-label="إغلاق"
                style={{
                  position: "absolute",
                  top: 8,
                  left: 10,
                  border: "none",
                  background: "transparent",
                  opacity: 0.5,
                  fontSize: 16,
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 6,
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 800,
                  fontSize: 13,
                  color: COLORS.sageDeep,
                }}
              >
                <Icon name="home" size={15} />
                <span>مرحبًا بعودتك 👋</span>
              </div>
              <div style={{ fontSize: 12.5, color: COLORS.ink, lineHeight: 1.7 }}>
                من آخر زيارة ({welcomeBack.daysGone} يوم){welcomeBack.boughtSince > 0 ? ` — تم شراء ${welcomeBack.boughtSince} غرض` : ""}.
                {welcomeBack.neededNow > 0 ? ` عندك الحين ${welcomeBack.neededNow} غرض ناقص.` : ""}
                {welcomeBack.expiringNow > 0 ? ` و${welcomeBack.expiringNow} قارب على الانتهاء.` : ""}
              </div>
            </div>
          )}

          {/* Expiring soon banner */}
          {expiringSoon.length > 0 && (
            <div
              style={{
                background: "rgba(181,72,47,0.08)",
                border: `1.5px solid rgba(181,72,47,0.3)`,
                borderRadius: 14,
                padding: "12px 14px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 8,
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 700,
                  fontSize: 13.5,
                  color: COLORS.rust,
                }}
              >
                <span>⏰</span>
                <span>قارب على الانتهاء</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {expiringSoon.map((it) => (
                  <button
                    key={it.id}
                    onClick={() => openEditModal(it)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "transparent",
                      border: "none",
                      padding: "4px 2px",
                      cursor: "pointer",
                      textAlign: "right",
                    }}
                  >
                    <span style={{ fontSize: 13.5, color: COLORS.charcoal }}>
                      {it.name}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: COLORS.rust,
                      }}
                    >
                      {expiryLabel(it._days)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Grouped-by-category shelf — every category shown as its
              own card with a light-green header bar, matching the
              grouped-list design direction, instead of chip-filtering
              down to one category at a time. */}
          {allByCategory.length === 0 ? (
            <div
              style={{
                background: COLORS.card,
                borderRadius: 18,
                border: `1px solid ${COLORS.line}`,
                boxShadow: SHADOWS.card,
                padding: "44px 16px",
                textAlign: "center",
                color: COLORS.ink,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "rgba(45,106,79,0.1)",
                  color: COLORS.sageDeep,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                }}
              >
                <Icon name={query ? "search" : "jar"} size={26} strokeWidth={1.6} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.65 }}>
                {query ? t("noResults") : t("emptyShelf")}
              </div>
            </div>
          ) : (
            allByCategory.map((c) => (
              <div
                key={c.id}
                style={{
                  marginBottom: 16,
                  borderRadius: 16,
                  overflow: "hidden",
                  border: `1px solid ${COLORS.line}`,
                  boxShadow: SHADOWS.card,
                  background: COLORS.card,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 14px",
                    background: "rgba(45,106,79,0.12)",
                  }}
                >
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 9,
                      background: "rgba(45,106,79,0.16)",
                      color: COLORS.sageDeep,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon name={c.svgIcon} size={14} strokeWidth={2.2} />
                  </span>
                  <span
                    style={{
                      fontFamily: "'Cairo', sans-serif",
                      fontWeight: 800,
                      fontSize: 13.5,
                      color: COLORS.sageDeep,
                    }}
                  >
                    {lang === "en" ? c.labelEn : c.label}
                  </span>
                  <span style={{ fontSize: 11, opacity: 0.6, marginRight: "auto" }}>
                    {c.items.length}
                  </span>
                </div>
                {c.items.map((item, idx) => (
                  <ShelfRow
                    key={item.id}
                    item={item}
                    isLast={idx === c.items.length - 1}
                    onToggle={() => toggleNeeded(item.id)}
                    onEdit={() => openEditModal(item)}
                    onToggleFavorite={() => toggleFavorite(item.id)}
                  />
                ))}
              </div>
            ))
          )}
        </div>
      )}

      {/* Shopping tab */}
      {tab === "shopping" && (
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "18px 20px" }}>
          {/* Completion banner — appears when the last item on a shared
              interactive list just got checked off, on the device that
              opened the list via that link. */}
          {completionBanner && reportToPhone && (
            <div
              style={{
                background: `linear-gradient(135deg, ${COLORS.sage}, ${COLORS.sageDeep})`,
                borderRadius: 18,
                padding: "18px 18px",
                marginBottom: 16,
                color: COLORS.paper,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 30, marginBottom: 6 }}>🎉</div>
              <div
                style={{
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 800,
                  fontSize: 15,
                  marginBottom: 4,
                }}
              >
                خلصت كل النواقص!
              </div>
              <div style={{ fontSize: 12.5, opacity: 0.9, marginBottom: 14 }}>
                أرسل تأكيد عشان يعرفون إنك خلصت
              </div>
              <button
                onClick={sendCompletionConfirmation}
                style={{
                  background: "#25D366",
                  color: "#0B3B23",
                  border: "none",
                  borderRadius: 12,
                  padding: "11px 20px",
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 800,
                  fontSize: 13.5,
                  cursor: "pointer",
                }}
              >
                📲 إرسال تأكيد الاكتمال
              </button>
              <button
                onClick={() => setCompletionBanner(false)}
                style={{
                  display: "block",
                  margin: "10px auto 0",
                  background: "transparent",
                  border: "none",
                  color: COLORS.paper,
                  opacity: 0.75,
                  fontSize: 11.5,
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                إخفاء
              </button>
            </div>
          )}

          {allNeeded.length > 0 && (
            <div
              style={{
                background: COLORS.card,
                border: `1px solid ${COLORS.line}`,
                boxShadow: SHADOWS.card,
                borderRadius: 14,
                padding: "12px 16px",
                marginBottom: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11.5,
                    opacity: 0.6,
                    marginBottom: 2,
                  }}
                >
                  التكلفة التقريبية
                </div>
                <div
                  style={{
                    fontFamily: "'Cairo', sans-serif",
                    fontWeight: 800,
                    fontSize: 20,
                    color: COLORS.ink,
                  }}
                >
                  {totalCost.toFixed(2)} ر.ع
                </div>
              </div>
              {unpricedCount > 0 && (
                <div
                  style={{
                    fontSize: 11.5,
                    color: COLORS.sageDeep,
                    opacity: 0.85,
                    textAlign: "left",
                    maxWidth: 140,
                  }}
                >
                  {unpricedCount} أغراض بدون سعر — أضف السعر من التعديل
                </div>
              )}
            </div>
          )}

          {/* Monthly budget progress */}
          {monthlyBudget && monthlyBudget !== "" && (
            (() => {
              const pct = Math.min(100, (projectedMonthTotal / monthlyBudget) * 100);
              const over = projectedMonthTotal > monthlyBudget;
              const barColor = over ? COLORS.rust : pct > 80 ? COLORS.saffronDeep : COLORS.sage;
              return (
                <div
                  onClick={() => {
                    setNewBudgetInput(String(monthlyBudget));
                    setShowBudget(true);
                  }}
                  style={{
                    background: COLORS.card,
                    border: `1px solid ${COLORS.line}`,
                    boxShadow: SHADOWS.card,
                    borderRadius: 14,
                    padding: "12px 16px",
                    marginBottom: 14,
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ fontSize: 11.5, opacity: 0.6 }}>
                      🎯 التوفير الشهري
                    </span>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: barColor }}>
                      {projectedMonthTotal.toFixed(1)} / {monthlyBudget.toFixed
                        ? monthlyBudget.toFixed(1)
                        : monthlyBudget} ر.ع
                    </span>
                  </div>
                  <div
                    style={{
                      height: 9,
                      background: COLORS.paperAlt,
                      borderRadius: 999,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: barColor,
                        borderRadius: 999,
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                  {over && (
                    <div style={{ fontSize: 11, color: COLORS.rust, marginTop: 5 }}>
                      تجاوزت الميزانية بـ {(projectedMonthTotal - monthlyBudget).toFixed(1)} ر.ع
                    </div>
                  )}
                </div>
              );
            })()
          )}

          {(shoppingByCategory.length > 0 || occasionGroups.length > 0) && (
            <button
              onClick={sendInteractiveLink}
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "#25D366",
                color: "#0B3B23",
                border: "none",
                borderRadius: 14,
                padding: "14px 16px",
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 800,
                fontSize: 15,
                marginBottom: 8,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "0 4px 12px rgba(37,211,102,0.35)",
              }}
            >
              <span style={{ fontSize: 18 }}>🔗</span>
              <span>
                {waContacts && waContacts.length === 1
                  ? `إرسال رابط تفاعلي إلى ${waContacts[0].name}`
                  : "إرسال رابط تفاعلي عبر واتساب"}
              </span>
            </button>
          )}
          {(shoppingByCategory.length > 0 || occasionGroups.length > 0) && (
            <button
              onClick={neededHasPhotos ? shareWithPhotos : sendToWhatsApp}
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "transparent",
                border: `1.5px solid ${COLORS.line}`,
                color: COLORS.ink,
                borderRadius: 14,
                padding: "11px 16px",
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 700,
                fontSize: 13,
                marginBottom: 16,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <span>{neededHasPhotos ? "📸" : "📄"}</span>
              <span>{neededHasPhotos ? "مشاركة القائمة مع الصور" : "أو إرسال نص عادي بدل الرابط"}</span>
            </button>
          )}
          {(!waContacts || waContacts.length === 0) && (shoppingByCategory.length > 0 || occasionGroups.length > 0) && (
            <div
              style={{
                fontSize: 12.5,
                opacity: 0.65,
                marginTop: -8,
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              ما ضبطت أي رقم بعد — اضغط ⚙️ بالأعلى لإضافة رقم، أو أرسل الآن وتختار الرقم من واتساب مباشرة
            </div>
          )}
          {(shoppingByCategory.length > 0 || occasionGroups.length > 0) && (
            <button
              onClick={printShoppingList}
              style={{
                width: "100%",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "10px",
                borderRadius: 12,
                border: `1.5px solid ${COLORS.line}`,
                background: COLORS.card,
                color: COLORS.ink,
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                marginBottom: 16,
              }}
            >
              <span>🖨️</span>
              <span>طباعة القائمة</span>
            </button>
          )}
          {occasionGroups.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              {occasionGroups.map((g) => (
                <div
                  key={g.name}
                  style={{
                    background: "rgba(232,163,61,0.12)",
                    border: `1.5px solid ${COLORS.saffronDeep}`,
                    borderRadius: 16,
                    padding: "12px 14px",
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Cairo', sans-serif",
                        fontWeight: 800,
                        fontSize: 14,
                        color: COLORS.saffronDeep,
                      }}
                    >
                      🎉 {g.name}
                    </div>
                    <button
                      onClick={() => finishOccasion(g.name)}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: COLORS.saffronDeep,
                        fontSize: 11.5,
                        fontFamily: "'Tajawal', sans-serif",
                        textDecoration: "underline",
                        cursor: "pointer",
                      }}
                    >
                      إنهاء المناسبة
                    </button>
                  </div>
                  {g.items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "6px 0",
                        fontSize: 14,
                      }}
                    >
                      <span>{item.name}</span>
                      <button
                        onClick={() => markBought(item.id)}
                        style={{
                          border: `1.5px solid ${COLORS.sage}`,
                          background: "transparent",
                          color: COLORS.sageDeep,
                          borderRadius: 8,
                          padding: "4px 10px",
                          fontSize: 11.5,
                          fontFamily: "'Cairo', sans-serif",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        تم ✓
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
          {shoppingByCategory.length === 0 && occasionGroups.length === 0 ? (
            <div
              style={{
                background: COLORS.card,
                borderRadius: 18,
                border: `1px dashed ${COLORS.line}`,
                padding: "48px 20px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 34, marginBottom: 10 }}>✅</div>
              <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, marginBottom: 4 }}>
                القائمة فاضية
              </div>
              <div style={{ opacity: 0.65, fontSize: 14 }}>
                لما شي يخلص بالبيت، اضغط "خلص" من تبويب المخزون وبيظهر هنا
              </div>
            </div>
          ) : (
            shoppingByCategory.map((c) => (
              <div key={c.id} style={{ marginBottom: 18 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                    paddingRight: 4,
                  }}
                >
                  <span style={{ display: "flex", color: COLORS.sageDeep }}>
                    <Icon name={c.svgIcon} size={16} strokeWidth={2.2} />
                  </span>
                  <span
                    style={{
                      fontFamily: "'Cairo', sans-serif",
                      fontWeight: 700,
                      fontSize: 15,
                      color: COLORS.ink,
                    }}
                  >
                    {c.label}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      background: COLORS.saffron,
                      color: COLORS.ink,
                      borderRadius: 999,
                      padding: "1px 8px",
                      fontWeight: 700,
                    }}
                  >
                    {c.items.length}
                  </span>
                </div>
                <div
                  style={{
                    background: COLORS.card,
                    borderRadius: 16,
                    border: `1px solid ${COLORS.line}`,
                    boxShadow: SHADOWS.card,
                    overflow: "hidden",
                  }}
                >
                  {c.items.map((item, idx) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "13px 16px",
                        borderBottom:
                          idx === c.items.length - 1
                            ? "none"
                            : `1px solid ${COLORS.line}`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt=""
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 9,
                              objectFit: "cover",
                              flexShrink: 0,
                              border: `1px solid ${COLORS.line}`,
                            }}
                          />
                        ) : null}
                        <div>
                          <div style={{ fontSize: 15, display: "flex", alignItems: "center", gap: 6 }}>
                            {item.urgent ? <span style={{ fontSize: 12 }}>🔴</span> : null}
                            <span>{item.name}</span>
                            {item.price != null ? (
                              <span
                                style={{
                                  fontSize: 11,
                                  color: COLORS.sageDeep,
                                  opacity: 0.8,
                                }}
                              >
                                ({item.price.toFixed(2)} ر.ع)
                              </span>
                            ) : null}
                          </div>
                          {item.addedBy ? (
                            <div
                              style={{
                                fontSize: 11.5,
                                opacity: 0.55,
                                marginTop: 2,
                              }}
                            >
                              أضافها {item.addedBy}
                            </div>
                          ) : null}
                          {item.expiry
                            ? (() => {
                                const d = daysUntil(item.expiry);
                                const soon = d <= 3;
                                return (
                                  <div
                                    style={{
                                      fontSize: 11.5,
                                      marginTop: 2,
                                      color: soon ? COLORS.rust : COLORS.sageDeep,
                                      fontWeight: soon ? 700 : 400,
                                    }}
                                  >
                                    ⏰ {expiryLabel(d)}
                                  </div>
                                );
                              })()
                            : null}
                          {item.note ? (
                            <div
                              style={{
                                fontSize: 11.5,
                                marginTop: 2,
                                color: COLORS.saffronDeep,
                                fontStyle: "italic",
                              }}
                            >
                              📝 {item.note}
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <button
                        onClick={() => markBought(item.id)}
                        style={{
                          border: `1.5px solid ${COLORS.sage}`,
                          background: "transparent",
                          color: COLORS.sageDeep,
                          borderRadius: 10,
                          padding: "6px 12px",
                          fontSize: 13,
                          fontWeight: 700,
                          fontFamily: "'Cairo', sans-serif",
                          cursor: "pointer",
                        }}
                      >
                        اشتريته ✓
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Favorites tab */}
      {tab === "favorites" && (
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "18px 20px" }}>
          {favoriteItems.length === 0 ? (
            <div
              style={{
                background: COLORS.card,
                borderRadius: 18,
                border: `1px dashed ${COLORS.line}`,
                padding: "48px 20px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 34, marginBottom: 10 }}>⭐</div>
              <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, marginBottom: 4 }}>
                ما فيه أغراض مفضلة بعد
              </div>
              <div style={{ opacity: 0.65, fontSize: 14 }}>
                اضغط على النجمة ⭐ بجانب أي غرض بالمخزون لإضافته هنا — أغراض تشتريها كل شهر
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={addAllFavoritesToShopping}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  background: COLORS.ink,
                  color: COLORS.paper,
                  border: "none",
                  borderRadius: 14,
                  padding: "13px 16px",
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 800,
                  fontSize: 14,
                  marginBottom: 14,
                  cursor: "pointer",
                }}
              >
                ➕ أضف كل المفضلة لقائمة الشراء
              </button>
              <div
                style={{
                  background: COLORS.card,
                  borderRadius: 18,
                  border: `1px solid ${COLORS.line}`,
                  boxShadow: SHADOWS.card,
                  padding: "6px 6px 14px",
                }}
              >
                {favoriteItems.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "13px 14px",
                      borderBottom:
                        idx === favoriteItems.length - 1
                          ? "none"
                          : `1px solid ${COLORS.line}`,
                    }}
                  >
                    <div
                      onClick={() => openEditModal(item)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        cursor: "pointer",
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt=""
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 8,
                            objectFit: "cover",
                            flexShrink: 0,
                            border: `1px solid ${COLORS.line}`,
                          }}
                        />
                      ) : null}
                      <span style={{ fontSize: 15 }}>{item.name}</span>
                    </div>
                    {item.needed ? (
                      <span
                        style={{
                          fontSize: 11.5,
                          color: COLORS.rust,
                          fontWeight: 700,
                          fontFamily: "'Cairo', sans-serif",
                        }}
                      >
                        بالقائمة ✓
                      </span>
                    ) : (
                      <button
                        onClick={() => toggleNeeded(item.id)}
                        style={{
                          border: `1.5px solid ${COLORS.line}`,
                          background: COLORS.paperAlt,
                          color: COLORS.ink,
                          borderRadius: 10,
                          padding: "6px 12px",
                          fontSize: 12,
                          fontFamily: "'Cairo', sans-serif",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        + أضف
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Nutrition tab */}
      {tab === "nutrition" && (
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "18px 20px" }}>
          {!dietPlanKey ? (
            <div>
              <div
                style={{
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  color: COLORS.ink,
                  marginBottom: 12,
                  textAlign: "center",
                }}
              >
                اختر جدول التغذية
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                  onClick={() => {
                    setDietPlanKey("smart");
                    setActiveDietDay(0);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "16px 18px",
                    borderRadius: 16,
                    border: `1.5px solid ${COLORS.saffron}`,
                    background: "rgba(232,163,61,0.1)",
                    cursor: "pointer",
                    textAlign: "right",
                  }}
                >
                  <span style={{ fontSize: 28 }}>🧮</span>
                  <div>
                    <div
                      style={{
                        fontFamily: "'Cairo', sans-serif",
                        fontWeight: 700,
                        fontSize: 15,
                        color: COLORS.ink,
                      }}
                    >
                      خطتي الشخصية
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>
                      نحسب سعراتك ووجباتك حسب وزنك وطولك وهدفك
                    </div>
                  </div>
                </button>
                {Object.entries(DIET_PLANS).map(([key, plan]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setDietPlanKey(key);
                      setActiveDietDay(0);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "16px 18px",
                      borderRadius: 16,
                      border: `1.5px solid ${COLORS.line}`,
                      background: COLORS.card,
                      cursor: "pointer",
                      textAlign: "right",
                    }}
                  >
                    <span style={{ fontSize: 28 }}>{plan.icon}</span>
                    <div>
                      <div
                        style={{
                          fontFamily: "'Cairo', sans-serif",
                          fontWeight: 700,
                          fontSize: 15,
                          color: COLORS.ink,
                        }}
                      >
                        {plan.label}
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>
                        جدول أسبوعي متغيّر الأصناف
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  opacity: 0.55,
                  marginTop: 16,
                  textAlign: "center",
                  lineHeight: 1.6,
                }}
              >
                جدول عام للاسترشاد، مو خطة طبية شخصية — لو عندك حالة صحية معينة راجع أخصائي تغذية
              </div>
            </div>
          ) : dietPlanKey === "smart" && !nutritionProfile ? (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    fontFamily: "'Cairo', sans-serif",
                    fontWeight: 800,
                    fontSize: 16,
                    color: COLORS.ink,
                  }}
                >
                  🧮 بياناتك
                </div>
                <button
                  onClick={() => setDietPlanKey(null)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: COLORS.sageDeep,
                    fontSize: 12.5,
                    fontFamily: "'Tajawal', sans-serif",
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  رجوع
                </button>
              </div>

              <div
                style={{
                  background: COLORS.card,
                  borderRadius: 18,
                  border: `1px solid ${COLORS.line}`,
                  boxShadow: SHADOWS.card,
                  padding: 16,
                  marginBottom: 12,
                }}
              >
                <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11.5, opacity: 0.6, marginBottom: 4 }}>الوزن (كجم)</div>
                    <input
                      type="number"
                      value={profileForm.weight}
                      onChange={(e) => setProfileForm({ ...profileForm, weight: e.target.value })}
                      placeholder="65"
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "9px 10px",
                        borderRadius: 9,
                        border: `1px solid ${COLORS.line}`,
                        background: COLORS.paper,
                        fontFamily: "'Tajawal', sans-serif",
                        fontSize: 13,
                        color: COLORS.charcoal,
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11.5, opacity: 0.6, marginBottom: 4 }}>الطول (سم)</div>
                    <input
                      type="number"
                      value={profileForm.height}
                      onChange={(e) => setProfileForm({ ...profileForm, height: e.target.value })}
                      placeholder="170"
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "9px 10px",
                        borderRadius: 9,
                        border: `1px solid ${COLORS.line}`,
                        background: COLORS.paper,
                        fontFamily: "'Tajawal', sans-serif",
                        fontSize: 13,
                        color: COLORS.charcoal,
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11.5, opacity: 0.6, marginBottom: 4 }}>العمر</div>
                    <input
                      type="number"
                      value={profileForm.age}
                      onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                      placeholder="28"
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "9px 10px",
                        borderRadius: 9,
                        border: `1px solid ${COLORS.line}`,
                        background: COLORS.paper,
                        fontFamily: "'Tajawal', sans-serif",
                        fontSize: 13,
                        color: COLORS.charcoal,
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11.5, opacity: 0.6, marginBottom: 4 }}>الجنس</div>
                    <select
                      value={profileForm.gender}
                      onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "9px 10px",
                        borderRadius: 9,
                        border: `1px solid ${COLORS.line}`,
                        background: COLORS.paper,
                        fontFamily: "'Tajawal', sans-serif",
                        fontSize: 13,
                        color: COLORS.charcoal,
                      }}
                    >
                      <option value="male">ذكر</option>
                      <option value="female">أنثى</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11.5, opacity: 0.6, marginBottom: 6 }}>مستوى النشاط اليومي</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {[
                      { v: "1.2", l: "قاعد غالباً" },
                      { v: "1.375", l: "نشاط خفيف" },
                      { v: "1.55", l: "متوسط" },
                      { v: "1.725", l: "نشيط" },
                    ].map((opt) => (
                      <button
                        key={opt.v}
                        onClick={() => setProfileForm({ ...profileForm, activity: opt.v })}
                        style={{
                          flex: 1,
                          minWidth: 72,
                          padding: "8px 6px",
                          borderRadius: 9,
                          border: `1px solid ${profileForm.activity === opt.v ? COLORS.saffron : COLORS.line}`,
                          background: profileForm.activity === opt.v ? COLORS.saffron : COLORS.paper,
                          color: profileForm.activity === opt.v ? COLORS.ink : COLORS.sageDeep,
                          fontFamily: "'Tajawal', sans-serif",
                          fontSize: 11.5,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11.5, opacity: 0.6, marginBottom: 6 }}>هدفك</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {[
                      { v: "-500", l: "نقصان وزن" },
                      { v: "0", l: "ثبات الوزن" },
                      { v: "500", l: "زيادة وزن" },
                    ].map((opt) => (
                      <button
                        key={opt.v}
                        onClick={() => setProfileForm({ ...profileForm, goalAdj: opt.v })}
                        style={{
                          flex: 1,
                          minWidth: 72,
                          padding: "8px 6px",
                          borderRadius: 9,
                          border: `1px solid ${profileForm.goalAdj === opt.v ? COLORS.saffron : COLORS.line}`,
                          background: profileForm.goalAdj === opt.v ? COLORS.saffron : COLORS.paper,
                          color: profileForm.goalAdj === opt.v ? COLORS.ink : COLORS.sageDeep,
                          fontFamily: "'Tajawal', sans-serif",
                          fontSize: 11.5,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  const weight = parseFloat(profileForm.weight);
                  const height = parseFloat(profileForm.height);
                  const age = parseFloat(profileForm.age);
                  if (!weight || !height || !age) {
                    alert("عبّي الوزن والطول والعمر أول");
                    return;
                  }
                  saveNutritionProfile({
                    weight,
                    height,
                    age,
                    gender: profileForm.gender,
                    activity: parseFloat(profileForm.activity),
                    goalAdj: parseFloat(profileForm.goalAdj),
                  });
                  setActiveDietDay(0);
                }}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  background: COLORS.ink,
                  color: COLORS.paper,
                  border: "none",
                  borderRadius: 14,
                  padding: "13px 16px",
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                احسب خطتي الأسبوعية
              </button>
            </div>
          ) : (
            (() => {
              const plan = dietPlanKey === "smart" ? buildSmartPlan(nutritionProfile) : DIET_PLANS[dietPlanKey];
              const dayData = plan.days[activeDietDay];
              const template = TEMPLATES.find((tp) => tp.id === plan.templateId);
              return (
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Cairo', sans-serif",
                        fontWeight: 800,
                        fontSize: 16,
                        color: COLORS.ink,
                      }}
                    >
                      {plan.icon} {plan.label}
                    </div>
                    <button
                      onClick={() => setDietPlanKey(null)}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: COLORS.sageDeep,
                        fontSize: 12.5,
                        fontFamily: "'Tajawal', sans-serif",
                        textDecoration: "underline",
                        cursor: "pointer",
                      }}
                    >
                      تغيير الجدول
                    </button>
                  </div>

                  {dietPlanKey === "smart" && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 14,
                      }}
                    >
                      <div style={{ fontSize: 12.5, color: COLORS.sageDeep, fontWeight: 700 }}>
                        هدفك اليومي: {plan.targetCalories} سعرة
                      </div>
                      <button
                        onClick={() => {
                          setProfileForm({
                            weight: String(nutritionProfile.weight),
                            height: String(nutritionProfile.height),
                            age: String(nutritionProfile.age),
                            gender: nutritionProfile.gender,
                            activity: String(nutritionProfile.activity),
                            goalAdj: String(nutritionProfile.goalAdj),
                          });
                          setNutritionProfile(null);
                        }}
                        style={{
                          border: "none",
                          background: "transparent",
                          color: COLORS.saffronDeep,
                          fontSize: 12,
                          fontFamily: "'Tajawal', sans-serif",
                          textDecoration: "underline",
                          cursor: "pointer",
                        }}
                      >
                        عدّل بياناتي
                      </button>
                    </div>
                  )}
                  {dietPlanKey !== "smart" && <div style={{ marginBottom: 14 }} />}

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      overflowX: "auto",
                      paddingBottom: 4,
                      marginBottom: 14,
                    }}
                  >
                    {plan.days.map((d, idx) => (
                      <button
                        key={d.day}
                        onClick={() => setActiveDietDay(idx)}
                        style={{
                          flexShrink: 0,
                          padding: "8px 16px",
                          borderRadius: 999,
                          border: `1.5px solid ${activeDietDay === idx ? COLORS.sage : COLORS.line}`,
                          background: activeDietDay === idx ? COLORS.sage : COLORS.card,
                          color: activeDietDay === idx ? COLORS.paper : COLORS.charcoal,
                          fontFamily: "'Cairo', sans-serif",
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {d.day}
                      </button>
                    ))}
                  </div>

                  <div
                    style={{
                      background: COLORS.card,
                      borderRadius: 18,
                      border: `1px solid ${COLORS.line}`,
                      boxShadow: SHADOWS.card,
                      overflow: "hidden",
                      marginBottom: 16,
                    }}
                  >
                    {Object.entries(dayData.meals).map(([mealName, desc], idx, arr) => (
                      <div
                        key={mealName}
                        style={{
                          padding: "14px 16px",
                          borderBottom:
                            idx === arr.length - 1 ? "none" : `1px solid ${COLORS.line}`,
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "'Cairo', sans-serif",
                            fontWeight: 700,
                            fontSize: 13,
                            color: COLORS.saffronDeep,
                            marginBottom: 4,
                          }}
                        >
                          {mealName}
                        </div>
                        <div style={{ fontSize: 14, lineHeight: 1.6 }}>{desc}</div>
                      </div>
                    ))}
                  </div>

                  {template && (
                    <button
                      onClick={() => {
                        setShowTemplates(true);
                        openTemplate(template);
                      }}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        background: COLORS.ink,
                        color: COLORS.paper,
                        border: "none",
                        borderRadius: 14,
                        padding: "13px 16px",
                        fontFamily: "'Cairo', sans-serif",
                        fontWeight: 800,
                        fontSize: 14,
                        cursor: "pointer",
                      }}
                    >
                      🛒 أضف مقادير الأسبوع لقائمة الشراء
                    </button>
                  )}
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* Floating add button — full-width dark pill, sits just above
          the bottom nav bar. */}
      <button
        onClick={openAddModal}
        aria-label="إضافة غرض"
        style={{
          position: "fixed",
          bottom: 82,
          left: "50%",
          transform: "translateX(-50%)",
          width: "calc(100% - 40px)",
          maxWidth: 520,
          boxSizing: "border-box",
          background: COLORS.ink,
          color: COLORS.paper,
          border: "none",
          borderRadius: 999,
          padding: "14px 26px",
          fontFamily: "'Cairo', sans-serif",
          fontWeight: 800,
          fontSize: 15,
          boxShadow: "0 8px 20px rgba(27,67,50,0.3)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <Icon name="plus" size={17} />
        <span>{t("addItemBtn")}</span>
      </button>

      {/* Bottom navigation bar — icon-based, replaces the old top tab
          strip. Settings opens the WhatsApp/settings sheet directly
          rather than switching tabs. */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: COLORS.card,
          borderTop: `1px solid ${COLORS.line}`,
          boxShadow: "0 -6px 20px rgba(27,67,50,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          padding: "8px 6px calc(8px + env(safe-area-inset-bottom))",
          zIndex: 40,
        }}
      >
        {[
          { id: "pantry", svgIcon: "home", label: "الرئيسية" },
          { id: "shopping", svgIcon: "list", label: "القوائم" },
          { id: "favorites", svgIcon: "star", label: "المفضلة" },
          { id: "nutrition", svgIcon: "utensils", label: "تغذية" },
        ].map((nb) => {
          const active = tab === nb.id;
          const badgeCount =
            nb.id === "shopping" ? neededCount : nb.id === "favorites" ? favoriteItems.length : 0;
          return (
            <button
              key={nb.id}
              onClick={() => setTab(nb.id)}
              style={{
                background: "none",
                border: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                padding: "4px 8px",
                cursor: "pointer",
                position: "relative",
                color: active ? COLORS.sage : COLORS.charcoal,
                opacity: active ? 1 : 0.55,
                transition: "opacity 0.15s ease, transform 0.15s ease",
                transform: active ? "translateY(-1px)" : "none",
              }}
            >
              <Icon name={nb.svgIcon} size={20} strokeWidth={active ? 2.3 : 2} />
              <span
                style={{
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 700,
                  fontSize: 10.5,
                }}
              >
                {nb.label}
              </span>
              {badgeCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -2,
                    left: 2,
                    background: COLORS.rust,
                    color: "#fff",
                    borderRadius: 999,
                    fontSize: 9,
                    fontWeight: 800,
                    padding: "1px 5px",
                  }}
                >
                  {badgeCount}
                </span>
              )}
            </button>
          );
        })}
        <button
          onClick={() => setShowWaSettings(true)}
          style={{
            background: "none",
            border: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            padding: "4px 8px",
            cursor: "pointer",
            color: COLORS.charcoal,
            opacity: 0.55,
          }}
        >
          <Icon name="settings" size={20} />
          <span style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 10.5 }}>
            الإعدادات
          </span>
        </button>
      </div>

      {/* Add / Edit modal */}
      {showAdd && (
        <div
          onClick={() => {
            setShowAdd(false);
            resetModalFields();
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(27,42,65,0.45)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: COLORS.paper,
              width: "100%",
              maxWidth: 560,
              maxHeight: "88vh",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
              borderRadius: "22px 22px 0 0",
              padding: "22px 20px 28px",
              boxShadow: "0 -10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                width: 40,
                height: 4,
                background: COLORS.line,
                borderRadius: 999,
                margin: "0 auto 18px",
              }}
            />
            <h2
              style={{
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 800,
                fontSize: 18,
                margin: "0 0 16px",
                color: COLORS.ink,
              }}
            >
              {editingId ? t("editItemTitle") : t("newItemTitle")}
            </h2>
            {!editingId && (
              <button
                onClick={openScanner}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "12px",
                  borderRadius: 12,
                  border: `1.5px dashed ${COLORS.sageDeep}`,
                  background: "rgba(110,127,92,0.08)",
                  color: COLORS.sageDeep,
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  marginBottom: 12,
                }}
              >
                <span style={{ fontSize: 17 }}>📷</span>
                <span>{t("scanBarcodeBtn")}</span>
              </button>
            )}
            {newBarcode && (
              <div
                style={{
                  fontSize: 11.5,
                  opacity: 0.6,
                  marginBottom: 10,
                  textAlign: "center",
                }}
              >
                باركود مربوط: {newBarcode}
              </div>
            )}
            <div style={{ position: "relative", marginBottom: 14 }}>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveItem()}
                placeholder={t("nameFieldPlaceholder")}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "13px 46px 13px 14px",
                  borderRadius: 12,
                  border: `1.5px solid ${COLORS.line}`,
                  background: COLORS.card,
                  fontSize: 15,
                  fontFamily: "'Tajawal', sans-serif",
                  outline: "none",
                }}
              />
              <button
                onClick={startVoiceInput}
                aria-label="إدخال صوتي"
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: isListening ? COLORS.rust : "transparent",
                  color: isListening ? COLORS.paper : COLORS.ink,
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  fontSize: 16,
                  cursor: "pointer",
                  opacity: isListening ? 1 : 0.55,
                }}
              >
                🎙️
              </button>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <label
                htmlFor="item-photo-input"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 14,
                  border: `1.5px dashed ${COLORS.line}`,
                  background: COLORS.card,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  flexShrink: 0,
                  cursor: "pointer",
                }}
              >
                {imageBusy ? (
                  <span style={{ fontSize: 11, opacity: 0.6 }}>...</span>
                ) : newImage ? (
                  <img
                    src={newImage}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 22, opacity: 0.5 }}>📷</span>
                )}
                <input
                  id="item-photo-input"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handleImagePick(e.target.files?.[0])}
                  style={{ display: "none" }}
                />
              </label>
              <div style={{ fontSize: 12.5, opacity: 0.65, lineHeight: 1.5 }}>
                {newImage
                  ? t("photoAttached")
                  : t("optionalPhoto")}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 14,
              }}
            >
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setNewCategory(c.id)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 999,
                    border: `1.5px solid ${
                      newCategory === c.id ? COLORS.sage : COLORS.line
                    }`,
                    background: newCategory === c.id ? COLORS.sage : COLORS.card,
                    color: newCategory === c.id ? COLORS.paper : COLORS.charcoal,
                    fontSize: 13,
                    fontFamily: "'Cairo', sans-serif",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {c.icon} {lang === "en" ? c.labelEn : c.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setNewUrgent(!newUrgent)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                borderRadius: 12,
                border: `1.5px solid ${newUrgent ? COLORS.rust : COLORS.line}`,
                background: newUrgent ? "rgba(181,72,47,0.08)" : COLORS.card,
                color: newUrgent ? COLORS.rust : COLORS.charcoal,
                fontSize: 13.5,
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 700,
                cursor: "pointer",
                marginBottom: 20,
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <span>{newUrgent ? "🔴" : "⚪"}</span>
              <span>{t("urgentToggle")}</span>
            </button>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <label
                  style={{
                    fontSize: 12.5,
                    color: COLORS.ink,
                    opacity: 0.7,
                    fontFamily: "'Tajawal', sans-serif",
                  }}
                >
                  {t("expiryLabel")}
                </label>
                <button
                  type="button"
                  onClick={() => toggleHelp("expiry")}
                  aria-label="مساعدة"
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    border: `1.5px solid ${COLORS.saffronDeep}`,
                    background: "rgba(232,163,61,0.15)",
                    color: COLORS.saffronDeep,
                    fontSize: 12,
                    fontWeight: 800,
                    lineHeight: "17px",
                    padding: 0,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  ؟
                </button>
              </div>
              {openHelp === "expiry" && (
                <div
                  style={{
                    fontSize: 11.5,
                    color: COLORS.sageDeep,
                    background: "rgba(110,127,92,0.08)",
                    border: `1px solid ${COLORS.line}`,
                    borderRadius: 10,
                    padding: "8px 10px",
                    marginBottom: 8,
                  }}
                >
                  لو حطيت تاريخ الانتهاء، بيظهر لك تنبيه قبل ما الغرض ينتهي بكم يوم، عشان تستخدمه أو تشتري بدل عنه بوقت
                </div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="date"
                  value={newExpiry}
                  onChange={(e) => setNewExpiry(e.target.value)}
                  style={{
                    flex: 1,
                    boxSizing: "border-box",
                    padding: "11px 14px",
                    borderRadius: 12,
                    border: `1.5px solid ${COLORS.line}`,
                    background: COLORS.card,
                    fontSize: 14,
                    fontFamily: "'Tajawal', sans-serif",
                    outline: "none",
                    color: COLORS.charcoal,
                  }}
                />
                {newExpiry && (
                  <button
                    onClick={() => setNewExpiry("")}
                    style={{
                      border: `1.5px solid ${COLORS.line}`,
                      background: "transparent",
                      borderRadius: 12,
                      padding: "0 14px",
                      color: COLORS.ink,
                      opacity: 0.6,
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                  >
                    مسح
                  </button>
                )}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <label
                  style={{
                    fontSize: 12.5,
                    color: COLORS.ink,
                    opacity: 0.7,
                    fontFamily: "'Tajawal', sans-serif",
                  }}
                >
                  {t("priceLabel")}
                </label>
                <button
                  type="button"
                  onClick={() => toggleHelp("price")}
                  aria-label="مساعدة"
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    border: `1.5px solid ${COLORS.saffronDeep}`,
                    background: "rgba(232,163,61,0.15)",
                    color: COLORS.saffronDeep,
                    fontSize: 12,
                    fontWeight: 800,
                    lineHeight: "17px",
                    padding: 0,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  ؟
                </button>
              </div>
              {openHelp === "price" && (
                <div
                  style={{
                    fontSize: 11.5,
                    color: COLORS.sageDeep,
                    background: "rgba(110,127,92,0.08)",
                    border: `1px solid ${COLORS.line}`,
                    borderRadius: 10,
                    padding: "8px 10px",
                    marginBottom: 8,
                  }}
                >
                  يُستخدم لحساب التكلفة التقريبية لقائمتك، ولتفعيل "تحدي التوفير الشهري" — لو ما تعرف السعر بالضبط، اتركه فاضي وأضفه بعدين
                </div>
              )}
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="مثال: 1.5"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "11px 14px",
                  borderRadius: 12,
                  border: `1.5px solid ${COLORS.line}`,
                  background: COLORS.card,
                  fontSize: 14,
                  fontFamily: "'Tajawal', sans-serif",
                  outline: "none",
                }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12.5,
                  color: COLORS.ink,
                  opacity: 0.7,
                  marginBottom: 6,
                  fontFamily: "'Tajawal', sans-serif",
                }}
              >
                ملاحظة (اختياري) — مثال: خذ النوع الأحمر
              </label>
              <input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="مثال: خذ العلبة الكبيرة"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "11px 14px",
                  borderRadius: 12,
                  border: `1.5px solid ${COLORS.line}`,
                  background: COLORS.card,
                  fontSize: 14,
                  fontFamily: "'Tajawal', sans-serif",
                  outline: "none",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <label
                    style={{
                      fontSize: 12.5,
                      color: COLORS.ink,
                      opacity: 0.7,
                      fontFamily: "'Tajawal', sans-serif",
                    }}
                  >
                    {t("assignedLabel")}
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleHelp("assigned")}
                    aria-label="مساعدة"
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: `1.5px solid ${COLORS.saffronDeep}`,
                      background: "rgba(232,163,61,0.15)",
                      color: COLORS.saffronDeep,
                      fontSize: 12,
                      fontWeight: 800,
                      lineHeight: "17px",
                      padding: 0,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    ؟
                  </button>
                </div>
                {openHelp === "assigned" && (
                  <div
                    style={{
                      fontSize: 11,
                      color: COLORS.sageDeep,
                      background: "rgba(110,127,92,0.08)",
                      border: `1px solid ${COLORS.line}`,
                      borderRadius: 10,
                      padding: "7px 9px",
                      marginBottom: 8,
                    }}
                  >
                    حدد مين المسؤول عن هذا الغرض — تقدر بعدين تفعّل "قائمتي بس" وتشوف أغراضك أنت بس
                  </div>
                )}
                <input
                  value={newAssignedTo}
                  onChange={(e) => setNewAssignedTo(e.target.value)}
                  placeholder="مثال: الأب"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "11px 14px",
                    borderRadius: 12,
                    border: `1.5px solid ${COLORS.line}`,
                    background: COLORS.card,
                    fontSize: 14,
                    fontFamily: "'Tajawal', sans-serif",
                    outline: "none",
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <label
                    style={{
                      fontSize: 12.5,
                      color: COLORS.ink,
                      opacity: 0.7,
                      fontFamily: "'Tajawal', sans-serif",
                    }}
                  >
                    {t("occasionLabel")}
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleHelp("occasion")}
                    aria-label="مساعدة"
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: `1.5px solid ${COLORS.saffronDeep}`,
                      background: "rgba(232,163,61,0.15)",
                      color: COLORS.saffronDeep,
                      fontSize: 12,
                      fontWeight: 800,
                      lineHeight: "17px",
                      padding: 0,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    ؟
                  </button>
                </div>
                {openHelp === "occasion" && (
                  <div
                    style={{
                      fontSize: 11,
                      color: COLORS.sageDeep,
                      background: "rgba(110,127,92,0.08)",
                      border: `1px solid ${COLORS.line}`,
                      borderRadius: 10,
                      padding: "7px 9px",
                      marginBottom: 8,
                    }}
                  >
                    اربطه بمناسبة زي "رمضان" — يظهر بقسم منفصل بقائمة الشراء، وتنهيها بضغطة وحدة بعدين
                  </div>
                )}
                <input
                  value={newOccasion}
                  onChange={(e) => setNewOccasion(e.target.value)}
                  placeholder="مثال: رمضان"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "11px 14px",
                    borderRadius: 12,
                    border: `1.5px solid ${COLORS.line}`,
                    background: COLORS.card,
                    fontSize: 14,
                    fontFamily: "'Tajawal', sans-serif",
                    outline: "none",
                  }}
                />
              </div>
            </div>
            <button
              onClick={() => setNewFavorite(!newFavorite)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                borderRadius: 12,
                border: `1.5px solid ${newFavorite ? COLORS.saffronDeep : COLORS.line}`,
                background: newFavorite ? "rgba(232,163,61,0.1)" : COLORS.card,
                color: newFavorite ? COLORS.saffronDeep : COLORS.charcoal,
                fontSize: 13.5,
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 700,
                cursor: "pointer",
                marginBottom: 20,
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <span>{newFavorite ? "⭐" : "☆"}</span>
              <span>{t("favoriteToggle")}</span>
            </button>
            <div style={{ display: "flex", gap: 10 }}>
              {editingId ? (
                <button
                  onClick={() => removeItem(editingId)}
                  style={{
                    padding: "13px 16px",
                    borderRadius: 12,
                    border: `1.5px solid ${COLORS.rust}`,
                    background: "transparent",
                    color: COLORS.rust,
                    fontFamily: "'Cairo', sans-serif",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {t("delete")}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowAdd(false);
                    resetModalFields();
                  }}
                  style={{
                    flex: 1,
                    padding: "13px",
                    borderRadius: 12,
                    border: `1.5px solid ${COLORS.line}`,
                    background: "transparent",
                    color: COLORS.ink,
                    fontFamily: "'Cairo', sans-serif",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {t("cancel")}
                </button>
              )}
              <button
                onClick={saveItem}
                disabled={!newName.trim()}
                style={{
                  flex: 2,
                  padding: "13px",
                  borderRadius: 12,
                  border: "none",
                  background: newName.trim() ? COLORS.ink : COLORS.line,
                  color: COLORS.paper,
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 800,
                  cursor: newName.trim() ? "pointer" : "not-allowed",
                }}
              >
                {editingId ? t("save") : t("addToPantry")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* First-time name prompt */}
      {askName && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(27,42,65,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 70,
            padding: 20,
          }}
        >
          <div
            style={{
              background: COLORS.paper,
              borderRadius: 20,
              padding: "26px 22px",
              maxWidth: 360,
              width: "100%",
              textAlign: "center",
              boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ fontSize: 34, marginBottom: 10 }}>👋</div>
            <h2
              style={{
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 800,
                fontSize: 18,
                margin: "0 0 6px",
                color: COLORS.ink,
              }}
            >
              {t("whatsYourName")}
            </h2>
            <p style={{ fontSize: 13, opacity: 0.65, margin: "0 0 16px" }}>
              {t("nameHelper")}
            </p>
            <input
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveName()}
              placeholder={lang === "ar" ? "مثال: أم سالم" : "e.g. Sarah"}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 14px",
                borderRadius: 12,
                border: `1.5px solid ${COLORS.line}`,
                background: COLORS.card,
                fontSize: 15,
                fontFamily: "'Tajawal', sans-serif",
                marginBottom: 14,
                outline: "none",
                textAlign: "center",
              }}
            />
            <button
              onClick={saveName}
              disabled={!nameInput.trim()}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 12,
                border: "none",
                background: nameInput.trim() ? COLORS.ink : COLORS.line,
                color: COLORS.paper,
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 800,
                cursor: nameInput.trim() ? "pointer" : "not-allowed",
              }}
            >
              {t("letsStart")}
            </button>
          </div>
        </div>
      )}

      {/* One-time prompt for the sender's own number, shown the first
          time "إرسال رابط تفاعلي" is tapped — saved locally so it's
          never asked again on this device. */}
      {showMyPhonePrompt && (
        <div
          onClick={() => setShowMyPhonePrompt(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(27,42,65,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 70,
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: COLORS.paper,
              borderRadius: 20,
              padding: "26px 22px",
              maxWidth: 360,
              width: "100%",
              textAlign: "center",
              boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ fontSize: 34, marginBottom: 10 }}>📱</div>
            <h2
              style={{
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 800,
                fontSize: 17,
                margin: "0 0 6px",
                color: COLORS.ink,
              }}
            >
              رقمك عشان يردون عليك
            </h2>
            <p style={{ fontSize: 13, opacity: 0.65, margin: "0 0 16px", lineHeight: 1.7 }}>
              لما اللي يستلم الرابط يخلص التسوق، بيقدر يرسلك تأكيد اكتمال — لازم رقمك عشان الرسالة توصلك
            </p>
            <input
              autoFocus
              value={myPhoneInput}
              onChange={(e) => setMyPhoneInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveMyPhone()}
              placeholder="96891234567"
              dir="ltr"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 14px",
                borderRadius: 12,
                border: `1.5px solid ${COLORS.line}`,
                background: COLORS.card,
                fontSize: 15,
                fontFamily: "'Tajawal', sans-serif",
                marginBottom: 14,
                outline: "none",
                textAlign: "center",
              }}
            />
            <button
              onClick={saveMyPhone}
              disabled={!myPhoneInput.trim()}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 12,
                border: "none",
                background: myPhoneInput.trim() ? COLORS.ink : COLORS.line,
                color: COLORS.paper,
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 800,
                cursor: myPhoneInput.trim() ? "pointer" : "not-allowed",
              }}
            >
              حفظ ومتابعة
            </button>
          </div>
        </div>
      )}

      {/* WhatsApp settings modal */}
      {showWaSettings && (
        <div
          onClick={() => setShowWaSettings(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(27,42,65,0.45)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 70,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: COLORS.paper,
              width: "100%",
              maxWidth: 560,
              maxHeight: "88vh",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
              borderRadius: "22px 22px 0 0",
              padding: "22px 20px 28px",
              boxShadow: "0 -10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                width: 40,
                height: 4,
                background: COLORS.line,
                borderRadius: 999,
                margin: "0 auto 18px",
              }}
            />
            <div
              style={{
                background: COLORS.paperAlt,
                borderRadius: 14,
                padding: "14px 16px",
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  opacity: 0.65,
                  marginBottom: 6,
                }}
              >
                {t("yourHouseholdCode")}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Cairo', sans-serif",
                    fontWeight: 800,
                    fontSize: 20,
                    letterSpacing: 3,
                    color: COLORS.ink,
                  }}
                >
                  {householdCode}
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => {
                      try {
                        navigator.clipboard.writeText(householdCode);
                        showToast("تم نسخ الكود");
                      } catch (e) {
                        showToast("تعذّر النسخ — انسخه يدوياً");
                      }
                    }}
                    style={{
                      border: `1.5px solid ${COLORS.line}`,
                      background: COLORS.card,
                      borderRadius: 10,
                      padding: "6px 12px",
                      fontSize: 12.5,
                      fontFamily: "'Cairo', sans-serif",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {t("copy")}
                  </button>
                  <button
                    onClick={leaveHousehold}
                    style={{
                      border: `1.5px solid ${COLORS.rust}`,
                      background: "transparent",
                      color: COLORS.rust,
                      borderRadius: 10,
                      padding: "6px 12px",
                      fontSize: 12.5,
                      fontFamily: "'Cairo', sans-serif",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {t("switchHousehold")}
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowHouseholdQr(!showHouseholdQr)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: COLORS.sageDeep,
                  fontSize: 12,
                  fontFamily: "'Tajawal', sans-serif",
                  textDecoration: "underline",
                  cursor: "pointer",
                  marginTop: 10,
                  padding: 0,
                }}
              >
                {showHouseholdQr ? "إخفاء رمز QR" : "📷 أو أظهر رمز QR للمسح"}
              </button>
              {showHouseholdQr && (
                <div style={{ textAlign: "center", marginTop: 12 }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(householdCode)}`}
                    alt="QR code لكود البيت"
                    style={{
                      width: 160,
                      height: 160,
                      borderRadius: 12,
                      border: `1px solid ${COLORS.line}`,
                      background: "#fff",
                      padding: 8,
                    }}
                  />
                  <div style={{ fontSize: 11, opacity: 0.55, marginTop: 6 }}>
                    مسحه بكاميرا الجوال بيطلع نص الكود — انسخه وأدخله بالتطبيق
                  </div>
                </div>
              )}
            </div>
            <h2
              style={{
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 800,
                fontSize: 18,
                margin: "0 0 6px",
                color: COLORS.ink,
              }}
            >
              {t("settingsTitle")}
            </h2>
            <p style={{ fontSize: 13, opacity: 0.65, margin: "0 0 14px" }}>
              أضف رقم لكل شخص تبي ترسله القائمة. لو أضفت أكثر من رقم، وقت الإرسال
              تختار مين ترسله له.
            </p>

            {waContacts && waContacts.length > 0 && (
              <div
                style={{
                  background: COLORS.paperAlt,
                  borderRadius: 12,
                  marginBottom: 14,
                  overflow: "hidden",
                }}
              >
                {waContacts.map((c, idx) => (
                  <div
                    key={c.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderBottom:
                        idx === waContacts.length - 1 ? "none" : `1px solid ${COLORS.line}`,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Cairo', sans-serif" }}>
                        {c.name}
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.6, direction: "ltr", textAlign: "right" }}>
                        {c.phone}
                      </div>
                    </div>
                    <button
                      onClick={() => removeWaContact(c.id)}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: COLORS.rust,
                        fontSize: 18,
                        cursor: "pointer",
                        padding: "0 6px",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input
                value={waNameInput}
                onChange={(e) => setWaNameInput(e.target.value)}
                placeholder="الاسم (مثال: الأب)"
                style={{
                  flex: 1,
                  boxSizing: "border-box",
                  padding: "11px 12px",
                  borderRadius: 12,
                  border: `1.5px solid ${COLORS.line}`,
                  background: COLORS.card,
                  fontSize: 13.5,
                  fontFamily: "'Tajawal', sans-serif",
                  outline: "none",
                }}
              />
              <input
                value={waPhoneInput}
                onChange={(e) => setWaPhoneInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addWaContact()}
                placeholder="96891234567"
                dir="ltr"
                style={{
                  flex: 1,
                  boxSizing: "border-box",
                  padding: "11px 12px",
                  borderRadius: 12,
                  border: `1.5px solid ${COLORS.line}`,
                  background: COLORS.card,
                  fontSize: 13.5,
                  fontFamily: "'Tajawal', sans-serif",
                  outline: "none",
                  textAlign: "left",
                }}
              />
              <button
                onClick={addWaContact}
                disabled={!waNameInput.trim() || !waPhoneInput.trim()}
                style={{
                  padding: "0 16px",
                  borderRadius: 12,
                  border: "none",
                  background:
                    waNameInput.trim() && waPhoneInput.trim() ? COLORS.sage : COLORS.line,
                  color: COLORS.paper,
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 800,
                  cursor:
                    waNameInput.trim() && waPhoneInput.trim() ? "pointer" : "not-allowed",
                }}
              >
                +
              </button>
            </div>

            <button
              onClick={() => {
                setShowWaSettings(false);
                setShowHistory(true);
              }}
              style={{
                width: "100%",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "12px",
                borderRadius: 12,
                border: `1.5px solid ${COLORS.line}`,
                background: COLORS.card,
                color: COLORS.ink,
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 700,
                fontSize: 13.5,
                cursor: "pointer",
                marginBottom: 16,
              }}
            >
              <span>📜</span>
              <span>سجل المشتريات السابقة</span>
            </button>

            <button
              onClick={() => {
                setShowWaSettings(false);
                setShowStats(true);
              }}
              style={{
                width: "100%",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "12px",
                borderRadius: 12,
                border: `1.5px solid ${COLORS.line}`,
                background: COLORS.card,
                color: COLORS.ink,
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 700,
                fontSize: 13.5,
                cursor: "pointer",
                marginBottom: 16,
              }}
            >
              <span>📊</span>
              <span>إحصائيات المصروف</span>
            </button>

            <button
              onClick={() => {
                setShowWaSettings(false);
                setShowSplit(true);
              }}
              style={{
                width: "100%",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "12px",
                borderRadius: 12,
                border: `1.5px solid ${COLORS.line}`,
                background: COLORS.card,
                color: COLORS.ink,
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 700,
                fontSize: 13.5,
                cursor: "pointer",
                marginBottom: 16,
              }}
            >
              <span>💰</span>
              <span>تقسيم التكلفة بين البيت</span>
            </button>

            <button
              onClick={() => {
                setShowWaSettings(false);
                setMonthCardAuto(false);
                setMonthCardDate(null);
                setShowMonthCard(true);
              }}
              style={{
                width: "100%",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "12px",
                borderRadius: 12,
                border: `1.5px solid ${COLORS.line}`,
                background: COLORS.card,
                color: COLORS.ink,
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 700,
                fontSize: 13.5,
                cursor: "pointer",
                marginBottom: 16,
              }}
            >
              <span>🎬</span>
              <span>بطاقة الشهر</span>
            </button>

            <button
              onClick={() => {
                setShowWaSettings(false);
                setNewBudgetInput(monthlyBudget ? String(monthlyBudget) : "");
                setShowBudget(true);
              }}
              style={{
                width: "100%",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "12px",
                borderRadius: 12,
                border: `1.5px solid ${COLORS.line}`,
                background: COLORS.card,
                color: COLORS.ink,
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 700,
                fontSize: 13.5,
                cursor: "pointer",
                marginBottom: 16,
              }}
            >
              <span>🎯</span>
              <span>تحدي التوفير الشهري</span>
            </button>

            <button
              onClick={() => {
                setShowWaSettings(false);
                setMyPhoneInput(myPhone || "");
                setShowMyPhonePrompt(true);
              }}
              style={{
                width: "100%",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "12px",
                borderRadius: 12,
                border: `1.5px solid ${COLORS.line}`,
                background: COLORS.card,
                color: COLORS.ink,
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 700,
                fontSize: 13.5,
                cursor: "pointer",
                marginBottom: 16,
              }}
            >
              <span>📱</span>
              <span>{myPhone ? `رقمك: ${myPhone}` : "أضف رقمك (للرابط التفاعلي)"}</span>
            </button>

            <button
              onClick={() => setShowWaSettings(false)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "13px",
                borderRadius: 12,
                border: "none",
                background: COLORS.ink,
                color: COLORS.paper,
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              {t("done")}
            </button>
          </div>
        </div>
      )}

      {/* Recipient picker (when more than one WhatsApp contact exists) */}
      {showRecipientPicker && (
        <div
          onClick={() => {
            setShowRecipientPicker(false);
            setPendingWaText(null);
            setPendingWaIsLink(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(27,42,65,0.45)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 75,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: COLORS.paper,
              width: "100%",
              maxWidth: 560,
              borderRadius: "22px 22px 0 0",
              padding: "22px 20px 28px",
              boxShadow: "0 -10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                width: 40,
                height: 4,
                background: COLORS.line,
                borderRadius: 999,
                margin: "0 auto 18px",
              }}
            />
            <h2
              style={{
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 800,
                fontSize: 16,
                margin: "0 0 14px",
                color: COLORS.ink,
                textAlign: "center",
              }}
            >
              أرسل القائمة لمين؟
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(waContacts || []).map((c) => (
                <button
                  key={c.id}
                  onClick={() => pickRecipientAndSend(c.phone)}
                  style={{
                    padding: "13px 16px",
                    borderRadius: 12,
                    border: `1.5px solid ${COLORS.line}`,
                    background: COLORS.card,
                    color: COLORS.charcoal,
                    fontFamily: "'Cairo', sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    textAlign: "right",
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Purchase history modal */}
      {showHistory && (
        <div
          onClick={() => setShowHistory(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(27,42,65,0.45)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 75,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: COLORS.paper,
              width: "100%",
              maxWidth: 560,
              maxHeight: "85vh",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
              borderRadius: "22px 22px 0 0",
              padding: "22px 20px 28px",
              boxShadow: "0 -10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                width: 40,
                height: 4,
                background: COLORS.line,
                borderRadius: 999,
                margin: "0 auto 18px",
              }}
            />
            <h2
              style={{
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 800,
                fontSize: 18,
                margin: "0 0 16px",
                color: COLORS.ink,
              }}
            >
              📜 سجل المشتريات
            </h2>
            {purchaseHistory.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 10px", opacity: 0.6, fontSize: 13.5 }}>
                لسا ما فيه مشتريات مسجلة — أول ما تعلّم غرض "تم الشراء" بيظهر هنا
              </div>
            ) : (
              (() => {
                const groups = {};
                purchaseHistory.forEach((h) => {
                  const d = new Date(h.boughtAt);
                  const key = `${d.getFullYear()}-${d.getMonth()}`;
                  if (!groups[key]) {
                    groups[key] = {
                      label: d.toLocaleDateString("ar", { month: "long", year: "numeric" }),
                      entries: [],
                    };
                  }
                  groups[key].entries.push(h);
                });
                return Object.values(groups).map((g, gi) => {
                  const total = g.entries.reduce((s, e) => s + (e.price || 0), 0);
                  return (
                    <div key={gi} style={{ marginBottom: 18 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "'Cairo', sans-serif",
                            fontWeight: 700,
                            fontSize: 14,
                            color: COLORS.ink,
                          }}
                        >
                          {g.label}
                        </div>
                        {total > 0 && (
                          <div style={{ fontSize: 12.5, color: COLORS.sageDeep, fontWeight: 700 }}>
                            {total.toFixed(2)} ر.ع
                          </div>
                        )}
                      </div>
                      <div
                        style={{
                          background: COLORS.card,
                          border: `1px solid ${COLORS.line}`,
                          boxShadow: SHADOWS.card,
                          borderRadius: 14,
                          overflow: "hidden",
                        }}
                      >
                        {g.entries.map((e, idx) => (
                          <div
                            key={e.id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "10px 14px",
                              borderBottom:
                                idx === g.entries.length - 1 ? "none" : `1px solid ${COLORS.line}`,
                              fontSize: 13.5,
                            }}
                          >
                            <span>{e.name}</span>
                            <span style={{ opacity: 0.55, fontSize: 12 }}>
                              {new Date(e.boughtAt).toLocaleDateString("ar", { day: "numeric", month: "short" })}
                              {e.price != null ? ` · ${e.price.toFixed(2)} ر.ع` : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                });
              })()
            )}
          </div>
        </div>
      )}

      {/* Recipe suggestions modal */}
      {showRecipes && (
        <div
          onClick={() => setShowRecipes(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(27,42,65,0.45)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 75,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: COLORS.paper,
              width: "100%",
              maxWidth: 560,
              maxHeight: "85vh",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
              borderRadius: "22px 22px 0 0",
              padding: "22px 20px 28px",
              boxShadow: "0 -10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                width: 40,
                height: 4,
                background: COLORS.line,
                borderRadius: 999,
                margin: "0 auto 18px",
              }}
            />
            <h2
              style={{
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 800,
                fontSize: 18,
                margin: "0 0 4px",
                color: COLORS.ink,
              }}
            >
              🍳 وش أطبخ اليوم؟
            </h2>
            <p style={{ fontSize: 12.5, opacity: 0.65, margin: "0 0 16px" }}>
              اقتراح يومي مبني على الأغراض الموجودة عندك حالياً — يتغيّر تلقائياً كل يوم
            </p>
            {(() => {
              const inStockNames = items
                .filter((i) => !i.needed)
                .map((i) => i.name.toLowerCase());

              const allMatched = RECIPES.map((r) => {
                const matched = r.ingredients.filter((ing) =>
                  inStockNames.some((n) => n.includes(ing) || ing.includes(n))
                );
                return { ...r, matchCount: matched.length, total: r.ingredients.length };
              }).filter((r) => r.matchCount > 0);

              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {MEAL_TYPES.map((mt) => {
                    const mealMatches = allMatched
                      .filter((r) => r.meal === mt.id)
                      .sort((a, b) => b.matchCount / b.total - a.matchCount / a.total);

                    if (mealMatches.length === 0) {
                      return (
                        <div key={mt.id}>
                          <div
                            style={{
                              fontFamily: "'Cairo', sans-serif",
                              fontWeight: 700,
                              fontSize: 14,
                              marginBottom: 8,
                              color: COLORS.ink,
                            }}
                          >
                            {mt.icon} {mt.label}
                          </div>
                          <div
                            style={{
                              fontSize: 12.5,
                              opacity: 0.6,
                              padding: "12px 14px",
                              background: COLORS.card,
                              borderRadius: 12,
                              border: `1px dashed ${COLORS.line}`,
                            }}
                          >
                            ما لقينا اقتراح — أضف أغراض متوفرة تناسب {mt.label}
                          </div>
                        </div>
                      );
                    }

                    const idx = dayNumber(recipeCycle[mt.id]) % mealMatches.length;
                    const pick = mealMatches[idx];
                    const ready = pick.matchCount === pick.total;

                    return (
                      <div key={mt.id}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 8,
                          }}
                        >
                          <div
                            style={{
                              fontFamily: "'Cairo', sans-serif",
                              fontWeight: 700,
                              fontSize: 14,
                              color: COLORS.ink,
                            }}
                          >
                            {mt.icon} {mt.label}
                          </div>
                          {mealMatches.length > 1 && (
                            <button
                              onClick={() =>
                                setRecipeCycle((c) => ({ ...c, [mt.id]: c[mt.id] + 1 }))
                              }
                              style={{
                                border: "none",
                                background: "transparent",
                                color: COLORS.sageDeep,
                                fontSize: 11.5,
                                fontFamily: "'Tajawal', sans-serif",
                                textDecoration: "underline",
                                cursor: "pointer",
                              }}
                            >
                              🔄 اقتراح ثاني
                            </button>
                          )}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "13px 16px",
                            borderRadius: 14,
                            border: `1.5px solid ${ready ? COLORS.sage : COLORS.line}`,
                            background: ready ? "rgba(110,127,92,0.08)" : COLORS.card,
                          }}
                        >
                          <span style={{ fontSize: 26 }}>{pick.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontFamily: "'Cairo', sans-serif",
                                fontWeight: 700,
                                fontSize: 14.5,
                                color: COLORS.ink,
                              }}
                            >
                              {pick.name}
                            </div>
                            <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>
                              {ready
                                ? "🎉 جاهز تسويه الحين"
                                : `عندك ${pick.matchCount} من ${pick.total} مكونات`}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Stats modal */}
      {showStats && (
        <div
          onClick={() => setShowStats(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(27,42,65,0.45)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 75,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: COLORS.paper,
              width: "100%",
              maxWidth: 560,
              maxHeight: "85vh",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
              borderRadius: "22px 22px 0 0",
              padding: "22px 20px 28px",
              boxShadow: "0 -10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                width: 40,
                height: 4,
                background: COLORS.line,
                borderRadius: 999,
                margin: "0 auto 18px",
              }}
            />
            <h2
              style={{
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 800,
                fontSize: 18,
                margin: "0 0 16px",
                color: COLORS.ink,
              }}
            >
              📊 إحصائيات المصروف
            </h2>
            {purchaseHistory.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 10px", opacity: 0.6, fontSize: 13.5 }}>
                لسا ما فيه بيانات كافية — أول ما تشتري أغراض بتظهر الإحصائيات هنا
              </div>
            ) : (
              (() => {
                const freq = {};
                purchaseHistory.forEach((h) => {
                  freq[h.name] = (freq[h.name] || 0) + 1;
                });
                const topItem = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];

                const monthTotals = {};
                purchaseHistory.forEach((h) => {
                  if (h.price == null) return;
                  const d = new Date(h.boughtAt);
                  const key = `${d.getFullYear()}-${d.getMonth()}`;
                  monthTotals[key] = (monthTotals[key] || 0) + h.price;
                });
                const monthValues = Object.values(monthTotals);
                const avgMonthly =
                  monthValues.length > 0
                    ? monthValues.reduce((s, v) => s + v, 0) / monthValues.length
                    : 0;

                const catTotals = {};
                let grandTotal = 0;
                purchaseHistory.forEach((h) => {
                  if (h.price == null) return;
                  catTotals[h.category] = (catTotals[h.category] || 0) + h.price;
                  grandTotal += h.price;
                });
                const catRows = CATEGORIES.map((c) => ({
                  ...c,
                  total: catTotals[c.id] || 0,
                }))
                  .filter((c) => c.total > 0)
                  .sort((a, b) => b.total - a.total);

                return (
                  <div>
                    <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
                      <div
                        style={{
                          flex: 1,
                          background: COLORS.card,
                          border: `1px solid ${COLORS.line}`,
                          boxShadow: SHADOWS.card,
                          borderRadius: 14,
                          padding: "14px",
                          textAlign: "center",
                        }}
                      >
                        <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 4 }}>
                          أكثر غرض تشتريه
                        </div>
                        <div
                          style={{
                            fontFamily: "'Cairo', sans-serif",
                            fontWeight: 800,
                            fontSize: 15,
                            color: COLORS.ink,
                          }}
                        >
                          {topItem ? topItem[0] : "—"}
                        </div>
                        {topItem && (
                          <div style={{ fontSize: 11, opacity: 0.55, marginTop: 2 }}>
                            {topItem[1]} مرات
                          </div>
                        )}
                      </div>
                      <div
                        style={{
                          flex: 1,
                          background: COLORS.card,
                          border: `1px solid ${COLORS.line}`,
                          boxShadow: SHADOWS.card,
                          borderRadius: 14,
                          padding: "14px",
                          textAlign: "center",
                        }}
                      >
                        <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 4 }}>
                          متوسط المصروف الشهري
                        </div>
                        <div
                          style={{
                            fontFamily: "'Cairo', sans-serif",
                            fontWeight: 800,
                            fontSize: 15,
                            color: COLORS.ink,
                          }}
                        >
                          {avgMonthly.toFixed(1)} ر.ع
                        </div>
                      </div>
                    </div>

                    {catRows.length > 0 && (
                      <div>
                        <div
                          style={{
                            fontFamily: "'Cairo', sans-serif",
                            fontWeight: 700,
                            fontSize: 13.5,
                            marginBottom: 10,
                            color: COLORS.ink,
                          }}
                        >
                          توزيع المصروف حسب الفئة
                        </div>
                        {catRows.map((c) => {
                          const pct = grandTotal > 0 ? (c.total / grandTotal) * 100 : 0;
                          return (
                            <div key={c.id} style={{ marginBottom: 10 }}>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  fontSize: 12.5,
                                  marginBottom: 4,
                                }}
                              >
                                <span>{c.icon} {c.label}</span>
                                <span style={{ opacity: 0.65 }}>{c.total.toFixed(2)} ر.ع</span>
                              </div>
                              <div
                                style={{
                                  height: 8,
                                  background: COLORS.paperAlt,
                                  borderRadius: 999,
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    height: "100%",
                                    width: `${pct}%`,
                                    background: COLORS.sage,
                                    borderRadius: 999,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()
            )}
          </div>
        </div>
      )}

      {/* Barcode scanner overlay */}
      {showScanner && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#000",
            zIndex: 80,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              position: "relative",
              flex: 1,
              overflow: "hidden",
            }}
          >
            <div
              ref={scannerTargetRef}
              style={{
                position: "absolute",
                inset: 0,
              }}
            />
            {!scannerLoading && !scannerError && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "70%",
                  maxWidth: 320,
                  height: 120,
                  border: `2.5px solid ${COLORS.saffron}`,
                  borderRadius: 14,
                  boxShadow: "0 0 0 2000px rgba(0,0,0,0.35)",
                  pointerEvents: "none",
                }}
              />
            )}
            {scannerLoading && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: COLORS.paper,
                  fontFamily: "'Tajawal', sans-serif",
                }}
              >
                جارٍ تشغيل الكاميرا…
              </div>
            )}
            {scannerError && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 30,
                  textAlign: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: 30, marginBottom: 10 }}>🚫</div>
                  <div
                    style={{
                      color: COLORS.paper,
                      fontFamily: "'Tajawal', sans-serif",
                      fontSize: 14,
                      lineHeight: 1.6,
                    }}
                  >
                    {scannerError}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div
            style={{
              padding: "18px 20px 28px",
              background: COLORS.ink,
              textAlign: "center",
            }}
          >
            {scannerError ? (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <input
                  autoFocus
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitManualBarcode()}
                  placeholder="أدخل رقم الباركود يدوياً"
                  dir="ltr"
                  style={{
                    flex: 1,
                    boxSizing: "border-box",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "none",
                    background: "rgba(255,255,255,0.1)",
                    color: COLORS.paper,
                    fontSize: 14,
                    fontFamily: "'Tajawal', sans-serif",
                    outline: "none",
                    textAlign: "left",
                  }}
                />
                <button
                  onClick={submitManualBarcode}
                  disabled={!manualBarcode.trim()}
                  style={{
                    padding: "0 18px",
                    borderRadius: 12,
                    border: "none",
                    background: manualBarcode.trim() ? COLORS.saffron : "rgba(255,255,255,0.15)",
                    color: manualBarcode.trim() ? COLORS.ink : "rgba(255,255,255,0.4)",
                    fontFamily: "'Cairo', sans-serif",
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: manualBarcode.trim() ? "pointer" : "not-allowed",
                  }}
                >
                  بحث
                </button>
              </div>
            ) : (
              <div
                style={{
                  color: COLORS.paper,
                  opacity: 0.75,
                  fontSize: 13,
                  marginBottom: 14,
                  fontFamily: "'Tajawal', sans-serif",
                }}
              >
                وجّه الكاميرا نحو الباركود داخل الإطار
              </div>
            )}
            <button
              onClick={closeScanner}
              style={{
                padding: "12px 28px",
                borderRadius: 999,
                border: scannerError ? `1.5px solid rgba(255,255,255,0.3)` : "none",
                background: scannerError ? "transparent" : COLORS.saffron,
                color: scannerError ? COLORS.paper : COLORS.ink,
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Templates modal */}
      {showTemplates && (
        <div
          onClick={() => {
            setShowTemplates(false);
            setPickedTemplate(null);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(27,42,65,0.45)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 60,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: COLORS.paper,
              width: "100%",
              maxWidth: 560,
              maxHeight: "88vh",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
              borderRadius: "22px 22px 0 0",
              padding: "22px 20px 28px",
              boxShadow: "0 -10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                width: 40,
                height: 4,
                background: COLORS.line,
                borderRadius: 999,
                margin: "0 auto 18px",
              }}
            />

            {!pickedTemplate ? (
              <>
                <h2
                  style={{
                    fontFamily: "'Cairo', sans-serif",
                    fontWeight: 800,
                    fontSize: 18,
                    margin: "0 0 4px",
                    color: COLORS.ink,
                  }}
                >
                  قوالب جاهزة
                </h2>
                <p style={{ fontSize: 12.5, opacity: 0.65, margin: "0 0 16px" }}>
                  تضيف كل أغراض المناسبة دفعة وحدة، وتلقاها بقسم منفصل بقائمة الشراء
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => openTemplate(tpl)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "14px 16px",
                        borderRadius: 14,
                        border: `1.5px solid ${COLORS.line}`,
                        background: COLORS.card,
                        cursor: "pointer",
                        textAlign: "right",
                      }}
                    >
                      <span style={{ fontSize: 26 }}>{tpl.icon}</span>
                      <div>
                        <div
                          style={{
                            fontFamily: "'Cairo', sans-serif",
                            fontWeight: 700,
                            fontSize: 14.5,
                            color: COLORS.ink,
                          }}
                        >
                          {tpl.name}
                        </div>
                        <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>
                          {tpl.items.length} أغراض
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2
                  style={{
                    fontFamily: "'Cairo', sans-serif",
                    fontWeight: 800,
                    fontSize: 18,
                    margin: "0 0 4px",
                    color: COLORS.ink,
                  }}
                >
                  {pickedTemplate.icon} {pickedTemplate.name}
                </h2>
                <p style={{ fontSize: 12.5, opacity: 0.65, margin: "0 0 14px" }}>
                  بيتم إضافة {templateItems.length} غرض لقائمة الشراء — تقدر تشيل أو تزيد
                </p>
                <div
                  style={{
                    background: COLORS.card,
                    border: `1px solid ${COLORS.line}`,
                    boxShadow: SHADOWS.card,
                    borderRadius: 14,
                    padding: "6px 10px",
                    marginBottom: 10,
                    maxHeight: 180,
                    overflowY: "auto",
                  }}
                >
                  {templateItems.length === 0 ? (
                    <div
                      style={{
                        fontSize: 12.5,
                        opacity: 0.6,
                        padding: "10px 4px",
                        textAlign: "center",
                      }}
                    >
                      ما فيه أغراض — ضيف واحد بالأسفل
                    </div>
                  ) : (
                    templateItems.map((it, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          fontSize: 13.5,
                          padding: "7px 4px",
                          borderBottom:
                            idx === templateItems.length - 1
                              ? "none"
                              : `1px solid ${COLORS.line}`,
                        }}
                      >
                        <span>{it.name}</span>
                        <button
                          onClick={() => removeTemplateItem(idx)}
                          aria-label="حذف"
                          style={{
                            border: "none",
                            background: "transparent",
                            color: COLORS.ink,
                            opacity: 0.4,
                            fontSize: 16,
                            cursor: "pointer",
                            padding: "0 6px",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <input
                    value={newTemplateItemName}
                    onChange={(e) => setNewTemplateItemName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTemplateItem()}
                    placeholder="أضف غرض ثاني للقالب..."
                    style={{
                      flex: 1,
                      boxSizing: "border-box",
                      padding: "10px 14px",
                      borderRadius: 12,
                      border: `1.5px solid ${COLORS.line}`,
                      background: COLORS.card,
                      fontSize: 13.5,
                      fontFamily: "'Tajawal', sans-serif",
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={addTemplateItem}
                    disabled={!newTemplateItemName.trim()}
                    style={{
                      padding: "0 16px",
                      borderRadius: 12,
                      border: "none",
                      background: newTemplateItemName.trim() ? COLORS.sage : COLORS.line,
                      color: COLORS.paper,
                      fontFamily: "'Cairo', sans-serif",
                      fontWeight: 800,
                      fontSize: 14,
                      cursor: newTemplateItemName.trim() ? "pointer" : "not-allowed",
                    }}
                  >
                    +
                  </button>
                </div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12.5,
                    color: COLORS.ink,
                    opacity: 0.7,
                    marginBottom: 6,
                    fontFamily: "'Tajawal', sans-serif",
                  }}
                >
                  اسم المناسبة (تقدر تغيّره)
                </label>
                <input
                  value={templateLabel}
                  onChange={(e) => setTemplateLabel(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: `1.5px solid ${COLORS.line}`,
                    background: COLORS.card,
                    fontSize: 14,
                    fontFamily: "'Tajawal', sans-serif",
                    marginBottom: 18,
                    outline: "none",
                  }}
                />
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => setPickedTemplate(null)}
                    style={{
                      flex: 1,
                      padding: "13px",
                      borderRadius: 12,
                      border: `1.5px solid ${COLORS.line}`,
                      background: "transparent",
                      color: COLORS.ink,
                      fontFamily: "'Cairo', sans-serif",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    رجوع
                  </button>
                  <button
                    onClick={applyTemplate}
                    disabled={templateItems.length === 0}
                    style={{
                      flex: 2,
                      padding: "13px",
                      borderRadius: 12,
                      border: "none",
                      background: templateItems.length > 0 ? COLORS.ink : COLORS.line,
                      color: COLORS.paper,
                      fontFamily: "'Cairo', sans-serif",
                      fontWeight: 800,
                      cursor: templateItems.length > 0 ? "pointer" : "not-allowed",
                    }}
                  >
                    أضف {templateItems.length > 0 ? `كل الأغراض (${templateItems.length})` : "الأغراض"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Paper list OCR scan modal */}
      {showOcrScan && (
        <div
          onClick={() => {
            setShowOcrScan(false);
            setOcrItems(null);
            setOcrError(null);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(27,42,65,0.45)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 75,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: COLORS.paper,
              width: "100%",
              maxWidth: 560,
              maxHeight: "88vh",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
              borderRadius: "22px 22px 0 0",
              padding: "22px 20px 28px",
              boxShadow: "0 -10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                width: 40,
                height: 4,
                background: COLORS.line,
                borderRadius: 999,
                margin: "0 auto 18px",
              }}
            />
            <h2
              style={{
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 800,
                fontSize: 18,
                margin: "0 0 4px",
                color: COLORS.ink,
              }}
            >
              📸 امسح قائمة ورقية
            </h2>
            <p style={{ fontSize: 12.5, opacity: 0.65, margin: "0 0 16px" }}>
              صوّر القائمة (مطبوعة أو مكتوبة بخط واضح) وبنحاول نقرأ الأسماء تلقائياً
            </p>

            {!ocrItems && !ocrLoading && !ocrError && (
              <label
                htmlFor="ocr-photo-input"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "40px 20px",
                  borderRadius: 16,
                  border: `1.5px dashed ${COLORS.line}`,
                  background: COLORS.card,
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: 32 }}>📷</span>
                <span style={{ fontSize: 13.5, fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}>
                  اضغط لتصوير القائمة
                </span>
                <input
                  id="ocr-photo-input"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => runOcrScan(e.target.files && e.target.files[0])}
                  style={{ display: "none" }}
                />
              </label>
            )}

            {ocrLoading && (
              <div style={{ textAlign: "center", padding: "40px 10px" }}>
                <div style={{ fontSize: 30, marginBottom: 10 }}>⏳</div>
                <div style={{ fontSize: 13.5, opacity: 0.7 }}>جاري قراءة القائمة…</div>
              </div>
            )}

            {ocrError && (
              <div>
                <div
                  style={{
                    fontSize: 13,
                    color: COLORS.rust,
                    background: "rgba(181,72,47,0.08)",
                    border: `1px solid rgba(181,72,47,0.3)`,
                    borderRadius: 12,
                    padding: "12px 14px",
                    marginBottom: 14,
                  }}
                >
                  {ocrError}
                </div>
                <label
                  htmlFor="ocr-photo-retry"
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "12px",
                    borderRadius: 12,
                    border: `1.5px solid ${COLORS.line}`,
                    background: COLORS.card,
                    color: COLORS.ink,
                    fontFamily: "'Cairo', sans-serif",
                    fontWeight: 700,
                    fontSize: 13.5,
                    cursor: "pointer",
                  }}
                >
                  🔄 جرب صورة ثانية
                  <input
                    id="ocr-photo-retry"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => runOcrScan(e.target.files && e.target.files[0])}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            )}

            {ocrItems && (
              <div>
                <p style={{ fontSize: 12.5, opacity: 0.65, margin: "0 0 10px" }}>
                  راجع الأسماء وعدّل أو احذف اللي مو صحيح، وضيف أي شي فاتنا
                </p>
                <div
                  style={{
                    background: COLORS.card,
                    border: `1px solid ${COLORS.line}`,
                    boxShadow: SHADOWS.card,
                    borderRadius: 14,
                    padding: "6px 10px",
                    marginBottom: 10,
                    maxHeight: 220,
                    overflowY: "auto",
                  }}
                >
                  {ocrItems.length === 0 ? (
                    <div style={{ fontSize: 12.5, opacity: 0.6, padding: "10px 4px", textAlign: "center" }}>
                      ما تبقى أي غرض — ضيف واحد بالأسفل
                    </div>
                  ) : (
                    ocrItems.map((name, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          fontSize: 13.5,
                          padding: "7px 4px",
                          borderBottom: idx === ocrItems.length - 1 ? "none" : `1px solid ${COLORS.line}`,
                        }}
                      >
                        <span>{name}</span>
                        <button
                          onClick={() => removeOcrItem(idx)}
                          style={{
                            border: "none",
                            background: "transparent",
                            color: COLORS.ink,
                            opacity: 0.4,
                            fontSize: 16,
                            cursor: "pointer",
                            padding: "0 6px",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
                  <input
                    value={newOcrItemName}
                    onChange={(e) => setNewOcrItemName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addOcrItem()}
                    placeholder="أضف غرض فاتنا..."
                    style={{
                      flex: 1,
                      boxSizing: "border-box",
                      padding: "10px 14px",
                      borderRadius: 12,
                      border: `1.5px solid ${COLORS.line}`,
                      background: COLORS.card,
                      fontSize: 13.5,
                      fontFamily: "'Tajawal', sans-serif",
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={addOcrItem}
                    disabled={!newOcrItemName.trim()}
                    style={{
                      padding: "0 16px",
                      borderRadius: 12,
                      border: "none",
                      background: newOcrItemName.trim() ? COLORS.sage : COLORS.line,
                      color: COLORS.paper,
                      fontFamily: "'Cairo', sans-serif",
                      fontWeight: 800,
                      fontSize: 14,
                      cursor: newOcrItemName.trim() ? "pointer" : "not-allowed",
                    }}
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={confirmOcrItems}
                  disabled={ocrItems.length === 0}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "13px",
                    borderRadius: 12,
                    border: "none",
                    background: ocrItems.length > 0 ? COLORS.ink : COLORS.line,
                    color: COLORS.paper,
                    fontFamily: "'Cairo', sans-serif",
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: ocrItems.length > 0 ? "pointer" : "not-allowed",
                  }}
                >
                  أضف {ocrItems.length > 0 ? `الكل (${ocrItems.length})` : "الأغراض"} لقائمة الشراء
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cost split modal */}
      {showSplit && (
        <div
          onClick={() => setShowSplit(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(27,42,65,0.45)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 75,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: COLORS.paper,
              width: "100%",
              maxWidth: 560,
              maxHeight: "85vh",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
              borderRadius: "22px 22px 0 0",
              padding: "22px 20px 28px",
              boxShadow: "0 -10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                width: 40,
                height: 4,
                background: COLORS.line,
                borderRadius: 999,
                margin: "0 auto 18px",
              }}
            />
            <h2
              style={{
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 800,
                fontSize: 18,
                margin: "0 0 16px",
                color: COLORS.ink,
              }}
            >
              💰 تقسيم التكلفة بين البيت
            </h2>
            {(() => {
              const totals = {};
              purchaseHistory.forEach((h) => {
                if (h.price == null || !h.boughtBy) return;
                totals[h.boughtBy] = (totals[h.boughtBy] || 0) + h.price;
              });
              const people = Object.keys(totals);
              if (people.length < 2) {
                return (
                  <div style={{ textAlign: "center", padding: "30px 10px", opacity: 0.6, fontSize: 13.5 }}>
                    تحتاج شخصين على الأقل سجّلوا مشتريات بأسعار عشان نقدر نقسّم التكلفة
                  </div>
                );
              }

              const grandTotal = Object.values(totals).reduce((s, v) => s + v, 0);
              const fairShare = grandTotal / people.length;
              const balances = people.map((p) => ({ name: p, paid: totals[p], balance: totals[p] - fairShare }));

              const debtors = balances.filter((b) => b.balance < -0.01).map((b) => ({ ...b }));
              const creditors = balances.filter((b) => b.balance > 0.01).map((b) => ({ ...b }));
              const settlements = [];
              let di = 0, ci = 0;
              while (di < debtors.length && ci < creditors.length) {
                const debt = -debtors[di].balance;
                const credit = creditors[ci].balance;
                const amount = Math.min(debt, credit);
                settlements.push({ from: debtors[di].name, to: creditors[ci].name, amount });
                debtors[di].balance += amount;
                creditors[ci].balance -= amount;
                if (Math.abs(debtors[di].balance) < 0.01) di++;
                if (Math.abs(creditors[ci].balance) < 0.01) ci++;
              }

              return (
                <div>
                  <div
                    style={{
                      background: COLORS.card,
                      border: `1px solid ${COLORS.line}`,
                      boxShadow: SHADOWS.card,
                      borderRadius: 14,
                      padding: "14px 16px",
                      marginBottom: 16,
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 4 }}>
                      إجمالي المصروف / النصيب العادل لكل شخص
                    </div>
                    <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 16, color: COLORS.ink }}>
                      {grandTotal.toFixed(2)} ر.ع / {fairShare.toFixed(2)} ر.ع
                    </div>
                  </div>

                  <div
                    style={{
                      fontFamily: "'Cairo', sans-serif",
                      fontWeight: 700,
                      fontSize: 13.5,
                      marginBottom: 8,
                      color: COLORS.ink,
                    }}
                  >
                    كم دفع كل شخص
                  </div>
                  <div
                    style={{
                      background: COLORS.card,
                      border: `1px solid ${COLORS.line}`,
                      boxShadow: SHADOWS.card,
                      borderRadius: 14,
                      overflow: "hidden",
                      marginBottom: 18,
                    }}
                  >
                    {balances.map((b, idx) => (
                      <div
                        key={b.name}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "10px 14px",
                          borderBottom: idx === balances.length - 1 ? "none" : `1px solid ${COLORS.line}`,
                          fontSize: 13.5,
                        }}
                      >
                        <span>{b.name}</span>
                        <span style={{ opacity: 0.7 }}>{b.paid.toFixed(2)} ر.ع</span>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      fontFamily: "'Cairo', sans-serif",
                      fontWeight: 700,
                      fontSize: 13.5,
                      marginBottom: 8,
                      color: COLORS.ink,
                    }}
                  >
                    التسوية
                  </div>
                  {settlements.length === 0 ? (
                    <div style={{ fontSize: 13, opacity: 0.6, textAlign: "center", padding: "12px 0" }}>
                      كل شي متوازن — محد لازم يرجع لحد شي 🎉
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {settlements.map((s, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 14px",
                            borderRadius: 12,
                            background: "rgba(232,163,61,0.1)",
                            border: `1px solid ${COLORS.saffronDeep}`,
                            fontSize: 13.5,
                          }}
                        >
                          <span>
                            🔁 <b>{s.from}</b> يرجع لـ <b>{s.to}</b>
                          </span>
                          <span style={{ fontWeight: 700, color: COLORS.saffronDeep }}>
                            {s.amount.toFixed(2)} ر.ع
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Month card modal */}
      {showMonthCard && (
        <div
          onClick={() => setShowMonthCard(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(27,42,65,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 75,
            padding: 20,
          }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 380 }}>
            {(() => {
              const card = buildMonthCardData(monthCardDate);
              if (!card) {
                return (
                  <div
                    style={{
                      background: COLORS.paper,
                      borderRadius: 22,
                      padding: "40px 24px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 34, marginBottom: 10 }}>📊</div>
                    <div
                      style={{
                        fontFamily: "'Cairo', sans-serif",
                        fontWeight: 700,
                        fontSize: 15,
                        color: COLORS.ink,
                        marginBottom: 6,
                      }}
                    >
                      لسا ما فيه بيانات كافية لهالشهر
                    </div>
                    <div style={{ fontSize: 12.5, opacity: 0.6 }}>
                      أول ما تشتري أغراض هالشهر، بتطلع لك بطاقة ملخص جميلة هنا
                    </div>
                  </div>
                );
              }
              return (
                <div>
                  <div
                    style={{
                      background: `linear-gradient(160deg, ${COLORS.ink} 0%, #2d4a6b 100%)`,
                      borderRadius: 24,
                      padding: "32px 26px",
                      color: COLORS.paper,
                      position: "relative",
                      overflow: "hidden",
                      boxShadow: "0 16px 40px rgba(0,0,0,0.3)",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: -30,
                        right: -30,
                        fontSize: 140,
                        opacity: 0.08,
                      }}
                    >
                      🫙
                    </div>
                    <div style={{ position: "relative" }}>
                      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>
                        {monthCardAuto ? "✨ ملخص جاهز — من آخر شهر" : "بطاقة شهر"}
                      </div>
                      <div
                        style={{
                          fontFamily: "'Cairo', sans-serif",
                          fontWeight: 800,
                          fontSize: 22,
                          marginBottom: 24,
                        }}
                      >
                        {card.monthLabel}
                      </div>

                      <div style={{ marginBottom: 18 }}>
                        <div style={{ fontSize: 11, opacity: 0.65, marginBottom: 4 }}>
                          🏆 أكثر غرض اشتريته
                        </div>
                        <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 19 }}>
                          {card.topItem}
                        </div>
                        <div style={{ fontSize: 11.5, opacity: 0.6 }}>{card.topItemCount} مرات</div>
                      </div>

                      {card.topContributor && (
                        <div style={{ marginBottom: 18 }}>
                          <div style={{ fontSize: 11, opacity: 0.65, marginBottom: 4 }}>
                            👑 أكثر مساهم بالبيت
                          </div>
                          <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 19 }}>
                            {card.topContributor}
                          </div>
                        </div>
                      )}

                      <div style={{ display: "flex", gap: 20 }}>
                        <div>
                          <div style={{ fontSize: 11, opacity: 0.65, marginBottom: 4 }}>
                            📦 عدد المشتريات
                          </div>
                          <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 19 }}>
                            {card.itemCount}
                          </div>
                        </div>
                        {card.totalSpend > 0 && (
                          <div>
                            <div style={{ fontSize: 11, opacity: 0.65, marginBottom: 4 }}>
                              💰 المصروف
                            </div>
                            <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 19 }}>
                              {card.totalSpend.toFixed(2)} ر.ع
                            </div>
                          </div>
                        )}
                        {card.longestStreak > 1 && (
                          <div>
                            <div style={{ fontSize: 11, opacity: 0.65, marginBottom: 4 }}>
                              🔥 أطول سلسلة
                            </div>
                            <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 19 }}>
                              {card.longestStreak} أيام
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={shareMonthCard}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      marginTop: 14,
                      background: "#25D366",
                      color: "#0B3B23",
                      border: "none",
                      borderRadius: 14,
                      padding: "13px 16px",
                      fontFamily: "'Cairo', sans-serif",
                      fontWeight: 800,
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    📲 مشاركة البطاقة عبر واتساب
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Monthly budget modal */}
      {showBudget && (
        <div
          onClick={() => setShowBudget(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(27,42,65,0.45)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 75,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: COLORS.paper,
              width: "100%",
              maxWidth: 560,
              borderRadius: "22px 22px 0 0",
              padding: "22px 20px 28px",
              boxShadow: "0 -10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                width: 40,
                height: 4,
                background: COLORS.line,
                borderRadius: 999,
                margin: "0 auto 18px",
              }}
            />
            <h2
              style={{
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 800,
                fontSize: 18,
                margin: "0 0 6px",
                color: COLORS.ink,
              }}
            >
              🎯 تحدي التوفير الشهري
            </h2>
            <p style={{ fontSize: 13, opacity: 0.65, margin: "0 0 16px" }}>
              حدد ميزانية الراشن الشهرية، وبنوريك عداد حي كل ما تضيف سعر لغرض
            </p>

            {monthlyBudget && monthlyBudget !== "" && (
              <div
                style={{
                  background: COLORS.card,
                  border: `1px solid ${COLORS.line}`,
                  boxShadow: SHADOWS.card,
                  borderRadius: 14,
                  padding: "16px",
                  marginBottom: 16,
                  textAlign: "center",
                }}
              >
                {(() => {
                  const pct = Math.min(100, (projectedMonthTotal / monthlyBudget) * 100);
                  const over = projectedMonthTotal > monthlyBudget;
                  const barColor = over ? COLORS.rust : pct > 80 ? COLORS.saffronDeep : COLORS.sage;
                  const remaining = monthlyBudget - projectedMonthTotal;
                  return (
                    <>
                      <div
                        style={{
                          width: 120,
                          height: 120,
                          borderRadius: "50%",
                          margin: "0 auto 12px",
                          background: `conic-gradient(${barColor} ${pct * 3.6}deg, ${COLORS.paperAlt} 0deg)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          style={{
                            width: 96,
                            height: 96,
                            borderRadius: "50%",
                            background: COLORS.card,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 18, color: COLORS.ink }}>
                            {pct.toFixed(0)}%
                          </div>
                          <div style={{ fontSize: 10, opacity: 0.6 }}>مصروف</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 13.5, marginBottom: 4 }}>
                        {projectedMonthTotal.toFixed(2)} من {monthlyBudget.toFixed(2)} ر.ع
                      </div>
                      {over ? (
                        <div style={{ fontSize: 12.5, color: COLORS.rust, fontWeight: 700 }}>
                          تجاوزت الميزانية بـ {Math.abs(remaining).toFixed(2)} ر.ع
                        </div>
                      ) : (
                        <div style={{ fontSize: 12.5, color: COLORS.sageDeep, fontWeight: 700 }}>
                          باقي لك {remaining.toFixed(2)} ر.ع 🎉
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            <label
              style={{
                display: "block",
                fontSize: 12.5,
                color: COLORS.ink,
                opacity: 0.7,
                marginBottom: 6,
                fontFamily: "'Tajawal', sans-serif",
              }}
            >
              الميزانية الشهرية بالريال
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                value={newBudgetInput}
                onChange={(e) => setNewBudgetInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveBudget()}
                placeholder="مثال: 150"
                style={{
                  flex: 1,
                  boxSizing: "border-box",
                  padding: "13px 14px",
                  borderRadius: 12,
                  border: `1.5px solid ${COLORS.line}`,
                  background: COLORS.card,
                  fontSize: 15,
                  fontFamily: "'Tajawal', sans-serif",
                  outline: "none",
                }}
              />
              <button
                onClick={saveBudget}
                style={{
                  padding: "0 20px",
                  borderRadius: 12,
                  border: "none",
                  background: COLORS.ink,
                  color: COLORS.paper,
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Swipe-based quick add screen */}
      {showQuickAdd && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: COLORS.paper,
            zIndex: 80,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 20px 10px",
            }}
          >
            <button
              onClick={() => setShowQuickAdd(false)}
              aria-label="إغلاق"
              style={{
                border: "none",
                background: "transparent",
                fontSize: 20,
                color: COLORS.ink,
                cursor: "pointer",
                padding: 4,
              }}
            >
              ×
            </button>
            <div
              style={{
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 700,
                fontSize: 13,
                color: COLORS.ink,
                opacity: 0.7,
              }}
            >
              {Math.min(quickIndex + 1, quickQueue.length)} / {quickQueue.length}
            </div>
            <div style={{ width: 28 }} />
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 24px",
              position: "relative",
            }}
          >
            {quickQueue.length === 0 ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
                <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: 15 }}>
                  كل الأغراض الشائعة موجودة عندك بالفعل
                </div>
              </div>
            ) : quickIndex >= quickQueue.length ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
                <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 17, marginBottom: 6 }}>
                  خلصنا!
                </div>
                <div style={{ fontSize: 14, opacity: 0.7, marginBottom: 20 }}>
                  أضفنا {quickAddedCount} غرض لقائمة الشراء
                </div>
                <button
                  onClick={() => setShowQuickAdd(false)}
                  style={{
                    padding: "12px 28px",
                    borderRadius: 999,
                    border: "none",
                    background: COLORS.ink,
                    color: COLORS.paper,
                    fontFamily: "'Cairo', sans-serif",
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  تم
                </button>
              </div>
            ) : (
              <>
                <div
                  onMouseDown={handleCardPointerDown}
                  onMouseMove={handleCardPointerMove}
                  onMouseUp={handleCardPointerUp}
                  onMouseLeave={() => dragging && handleCardPointerUp()}
                  onTouchStart={handleCardPointerDown}
                  onTouchMove={handleCardPointerMove}
                  onTouchEnd={handleCardPointerUp}
                  style={{
                    width: "100%",
                    maxWidth: 300,
                    height: 340,
                    background: COLORS.card,
                    border: `1.5px solid ${COLORS.line}`,
                    borderRadius: 24,
                    boxShadow: "0 12px 30px rgba(27,42,65,0.15)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: dragging ? "grabbing" : "grab",
                    userSelect: "none",
                    touchAction: "none",
                    transform: `translateX(${dragX}px) rotate(${dragX / 18}deg)`,
                    transition: dragging ? "none" : "transform 0.25s ease",
                    position: "relative",
                  }}
                >
                  {dragX > 30 && (
                    <div
                      style={{
                        position: "absolute",
                        top: 20,
                        right: 20,
                        border: `3px solid ${COLORS.sage}`,
                        color: COLORS.sage,
                        borderRadius: 10,
                        padding: "4px 10px",
                        fontWeight: 800,
                        fontFamily: "'Cairo', sans-serif",
                        transform: "rotate(-12deg)",
                        opacity: Math.min(1, dragX / 90),
                      }}
                    >
                      أضف
                    </div>
                  )}
                  {dragX < -30 && (
                    <div
                      style={{
                        position: "absolute",
                        top: 20,
                        left: 20,
                        border: `3px solid ${COLORS.rust}`,
                        color: COLORS.rust,
                        borderRadius: 10,
                        padding: "4px 10px",
                        fontWeight: 800,
                        fontFamily: "'Cairo', sans-serif",
                        transform: "rotate(12deg)",
                        opacity: Math.min(1, -dragX / 90),
                      }}
                    >
                      تجاهل
                    </div>
                  )}
                  <div style={{ fontSize: 64, marginBottom: 16 }}>
                    {quickQueue[quickIndex].icon}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Cairo', sans-serif",
                      fontWeight: 800,
                      fontSize: 22,
                      color: COLORS.ink,
                      marginBottom: 8,
                    }}
                  >
                    {quickQueue[quickIndex].name}
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: COLORS.sageDeep,
                      background: "rgba(110,127,92,0.1)",
                      borderRadius: 999,
                      padding: "3px 12px",
                    }}
                  >
                    {CATEGORIES.find((c) => c.id === quickQueue[quickIndex].category)?.icon}{" "}
                    {CATEGORIES.find((c) => c.id === quickQueue[quickIndex].category)?.label}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 24,
                    marginTop: 28,
                  }}
                >
                  <button
                    onClick={quickReject}
                    aria-label="تجاهل"
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: "50%",
                      border: `2px solid ${COLORS.rust}`,
                      background: COLORS.card,
                      color: COLORS.rust,
                      fontSize: 24,
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                  <button
                    onClick={quickAccept}
                    aria-label="أضف"
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: "50%",
                      border: `2px solid ${COLORS.sage}`,
                      background: COLORS.card,
                      color: COLORS.sage,
                      fontSize: 24,
                      cursor: "pointer",
                    }}
                  >
                    ✓
                  </button>
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    opacity: 0.5,
                    marginTop: 14,
                    textAlign: "center",
                  }}
                >
                  اسحب البطاقة يمين للإضافة، يسار للتجاهل — أو استخدم الأزرار
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 18,
            left: "50%",
            transform: "translateX(-50%)",
            background: COLORS.ink,
            color: COLORS.paper,
            padding: "10px 20px",
            borderRadius: 999,
            fontSize: 13,
            fontFamily: "'Tajawal', sans-serif",
            boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
            zIndex: 60,
          }}
        >
          {toast}
        </div>
      )}

      {loadError && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            left: "50%",
            transform: "translateX(-50%)",
            background: COLORS.rust,
            color: COLORS.paper,
            padding: "8px 16px",
            borderRadius: 10,
            fontSize: 12,
          }}
        >
          تعذّر الحفظ التلقائي — التغييرات محفوظة بهذه الجلسة فقط
        </div>
      )}
    </div>
  );
}

// ---- ShareView ----
// The dedicated, minimal page a shared interactive link opens: no
// tabs, no settings, just this household's shopping list with live
// checkboxes. Anyone with the link can check items off as they shop,
// and everyone else with the link (or the main app) sees it update
// immediately, since it reads/writes the exact same Firestore doc
// the main app uses.
function ShareView({ code, fromPhone }) {
  useFonts();
  const [items, setItems] = useState(null); // null = loading
  const [justCompleted, setJustCompleted] = useState(false);
  const prevNeededRef = useRef(null);
  // Snapshot of which item IDs were actually needed the moment this
  // link was opened — this is "this shopping trip's list". We only
  // ever show items from that snapshot (so items nobody flagged as
  // missing never show up here), and an item stays visible even after
  // it's checked off, so nothing disappears mid-review. Taken once.
  const tripItemIdsRef = useRef(null);

  useEffect(() => {
    const unsubscribe = window.storage.listenShared(
      `pantry-items:${code}`,
      (value) => {
        let parsed;
        try {
          parsed = value ? JSON.parse(value) : [];
        } catch (e) {
          parsed = [];
        }
        if (tripItemIdsRef.current === null) {
          tripItemIdsRef.current = new Set(
            parsed.filter((i) => i.needed).map((i) => i.id)
          );
        }
        const neededCount = parsed.filter((i) => i.needed).length;
        if (
          prevNeededRef.current !== null &&
          prevNeededRef.current > 0 &&
          neededCount === 0
        ) {
          setJustCompleted(true);
        }
        prevNeededRef.current = neededCount;
        setItems(parsed);
      }
    );
    return () => unsubscribe();
  }, [code]);

  const toggleBought = (id) => {
    if (!items) return;
    const next = items.map((it) =>
      it.id === id ? { ...it, needed: !it.needed } : it
    );
    setItems(next);
    window.storage
      .set(`pantry-items:${code}`, JSON.stringify(next), true)
      .catch(() => {});
  };

  // One tap marks every still-needed item as bought, no WhatsApp step
  // required — for when someone bought everything on the list and
  // doesn't want to check items off one by one.
  const markAllBought = () => {
    if (!items) return;
    const next = items.map((it) => (it.needed ? { ...it, needed: false } : it));
    setItems(next);
    window.storage
      .set(`pantry-items:${code}`, JSON.stringify(next), true)
      .catch(() => {});
  };

  const openFullApp = () => {
    window.location.href = `${window.location.origin}${window.location.pathname}?view=shopping`;
  };

  const sendConfirmation = () => {
    const phoneDigits = (fromPhone || "").replace(/[^0-9]/g, "");
    const text = "✅ تم شراء كل النواقص";
    const url = phoneDigits
      ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    setJustCompleted(false);
  };

  if (items === null) {
    return (
      <div
        dir="rtl"
        style={{
          fontFamily: "'Tajawal', sans-serif",
          background: "#F6EFE1",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#1B2A41",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🫙</div>
          <div>جارٍ التحميل…</div>
        </div>
      </div>
    );
  }

  const totalNeeded = items.filter((i) => i.needed && tripItemIdsRef.current.has(i.id)).length;
  // Only show items that were actually needed when this link was
  // opened — never the whole household inventory. An item stays
  // visible even after it's checked off (struck through, not
  // removed), so the shopper can scroll back and review/undo, but
  // things nobody flagged as missing never appear here at all.
  const tripItems = items.filter((i) => tripItemIdsRef.current.has(i.id));
  const groups = CATEGORIES.map((c) => {
    const catItems = tripItems.filter((i) => i.category === c.id);
    const needed = catItems.filter((i) => i.needed);
    const bought = catItems.filter((i) => !i.needed);
    return { ...c, items: [...needed, ...bought], neededCount: needed.length };
  }).filter((g) => g.items.length > 0);

  const green = "#2E7D32";
  const greenDark = "#1F4D2E";
  const cream = "#FBF8F1";

  return (
    <div
      dir="rtl"
      style={{
        fontFamily: "'Tajawal', sans-serif",
        background: cream,
        minHeight: "100vh",
        color: "#22301F",
        paddingBottom: 110,
      }}
    >
      <div
        style={{
          background: `linear-gradient(160deg, ${greenDark}, ${green} 70%)`,
          color: "#fff",
          padding: "22px 20px 26px",
        }}
      >
        <div style={{ fontSize: 11, opacity: 0.75, letterSpacing: 1 }}>
          قائمة مشتركة 🫙 مونة
        </div>
        <div
          style={{
            fontFamily: "'Cairo', sans-serif",
            fontWeight: 900,
            fontSize: 22,
            margin: "6px 0 14px",
          }}
        >
          نواقص البيت
        </div>
        <div
          style={{
            height: 8,
            background: "rgba(255,255,255,0.22)",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: totalNeeded === 0 ? "100%" : "0%",
              background: "#E8A33D",
              borderRadius: 999,
              transition: "width 0.4s ease",
            }}
          />
        </div>
        <div style={{ fontSize: 12, opacity: 0.85, marginTop: 8 }}>
          {totalNeeded === 0 ? "خلصتوا كل شي 🎉" : `${totalNeeded} غرض باقي`}
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "18px 16px" }}>
        {totalNeeded > 0 && (
          <button
            onClick={markAllBought}
            style={{
              width: "100%",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "#fff",
              border: `1.5px solid ${green}`,
              color: greenDark,
              borderRadius: 12,
              padding: "12px 14px",
              fontFamily: "'Cairo', sans-serif",
              fontWeight: 800,
              fontSize: 13.5,
              cursor: "pointer",
              marginBottom: 14,
            }}
          >
            ✅ تم شراء الكل — علّم كل الأغراض دفعة وحدة
          </button>
        )}

        {justCompleted && fromPhone && (
          <div
            style={{
              background: `linear-gradient(135deg, #6E7F5C, #546343)`,
              borderRadius: 16,
              padding: "18px",
              marginBottom: 16,
              color: "#fff",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 6 }}>🎉</div>
            <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, fontSize: 15, marginBottom: 4 }}>
              خلصتوا كل النواقص!
            </div>
            <button
              onClick={sendConfirmation}
              style={{
                background: "#25D366",
                color: "#0B3B23",
                border: "none",
                borderRadius: 12,
                padding: "11px 20px",
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 800,
                fontSize: 13.5,
                cursor: "pointer",
                marginTop: 10,
              }}
            >
              📲 إرسال تأكيد
            </button>
          </div>
        )}

        {groups.length === 0 ? (
          <div
            style={{
              background: "#fff",
              borderRadius: 18,
              border: "1px dashed #DDD0B3",
              padding: "48px 20px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 34, marginBottom: 10 }}>✅</div>
            <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}>
              خلصتوا كل النواقص!
            </div>
          </div>
        ) : (
          groups.map((g) => (
            <div key={g.id} style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 800,
                  fontSize: 13,
                  color: greenDark,
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>{g.icon}</span>
                <span>{g.label}</span>
              </div>
              {g.items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleBought(item.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "#fff",
                    border: "1.5px solid #DDD0B3",
                    borderRadius: 12,
                    padding: "11px 12px",
                    marginBottom: 8,
                    cursor: "pointer",
                    opacity: item.needed ? 1 : 0.55,
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 8,
                      border: `2px solid ${item.needed ? green : "#DDD0B3"}`,
                      background: item.needed ? green : "transparent",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {item.needed ? "✓" : null}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        textDecoration: item.needed ? "none" : "line-through",
                      }}
                    >
                      {item.name}
                    </div>
                    {item.note ? (
                      <div style={{ fontSize: 11.5, color: "#C97F1E", marginTop: 2 }}>
                        📝 {item.note}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#fff",
          borderTop: "1px solid #DDD0B3",
          padding: "14px 16px 18px",
        }}
      >
        <button
          onClick={openFullApp}
          style={{
            width: "100%",
            maxWidth: 480,
            margin: "0 auto",
            display: "block",
            boxSizing: "border-box",
            background: greenDark,
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "13px",
            fontFamily: "'Cairo', sans-serif",
            fontWeight: 800,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          فتح تطبيق مونة كامل
        </button>
      </div>
    </div>
  );
}

function ShelfRow({ item, isLast, onToggle, onEdit, onToggleFavorite }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 15px",
        borderBottom: isLast ? "none" : `1px solid ${COLORS.line}`,
        transition: "background 0.15s ease",
      }}
    >
      <button
        onClick={onToggleFavorite}
        aria-label="مفضلة"
        style={{
          border: "none",
          background: "transparent",
          color: item.favorite ? COLORS.saffron : COLORS.charcoal,
          cursor: "pointer",
          padding: "4px 6px 4px 0",
          flexShrink: 0,
          opacity: item.favorite ? 1 : 0.28,
          display: "flex",
          transition: "opacity 0.15s ease, transform 0.15s ease",
        }}
      >
        <Icon
          name="star"
          size={17}
          strokeWidth={1.8}
          color={item.favorite ? COLORS.saffron : "currentColor"}
          filled={item.favorite}
        />
      </button>
      <div
        onClick={onEdit}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          cursor: "pointer",
          flex: 1,
          minWidth: 0,
        }}
      >
        {item.image ? (
          <img
            src={item.image}
            alt=""
            style={{
              width: 38,
              height: 38,
              borderRadius: 9,
              objectFit: "cover",
              flexShrink: 0,
              border: `1px solid ${COLORS.line}`,
            }}
          />
        ) : null}
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              color: item.needed ? COLORS.rust : COLORS.charcoal,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {item.urgent ? <span style={{ fontSize: 12 }}>🔴</span> : null}
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.name}
            </span>
            {item.occasion ? (
              <span
                style={{
                  fontSize: 10.5,
                  background: "rgba(232,163,61,0.18)",
                  color: COLORS.saffronDeep,
                  borderRadius: 999,
                  padding: "1px 7px",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                🎉 {item.occasion}
              </span>
            ) : null}
          </div>
          {item.addedBy ? (
            <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>
              أضافها {item.addedBy}
              {item.assignedTo ? ` · 👤 ${item.assignedTo}` : ""}
            </div>
          ) : item.assignedTo ? (
            <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>
              👤 {item.assignedTo}
            </div>
          ) : null}
          {item.expiry
            ? (() => {
                const d = daysUntil(item.expiry);
                const soon = d <= 3;
                return (
                  <div
                    style={{
                      fontSize: 11,
                      marginTop: 2,
                      color: soon ? COLORS.rust : COLORS.sageDeep,
                      fontWeight: soon ? 700 : 400,
                    }}
                  >
                    ⏰ {expiryLabel(d)}
                  </div>
                );
              })()
            : null}
          {item.note ? (
            <div
              style={{
                fontSize: 11,
                marginTop: 2,
                color: COLORS.saffronDeep,
                fontStyle: "italic",
              }}
            >
              📝 {item.note}
            </div>
          ) : null}
        </div>
      </div>
      <button
        onClick={onToggle}
        style={{
          flexShrink: 0,
          border: "none",
          background: "transparent",
          padding: "4px 6px",
          marginRight: 4,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-label={item.needed ? "ناقص — اضغط لو خلص عندك (بيتحط بقائمة النواقص)" : "عندك — اضغط لو صار ناقص"}
      >
        <span
          style={{
            width: 25,
            height: 25,
            borderRadius: 8,
            border: `2px solid ${item.needed ? COLORS.sage : COLORS.line}`,
            background: item.needed ? COLORS.sage : "transparent",
            color: COLORS.paper,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.18s ease, transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)",
            transform: item.needed ? "scale(1)" : "scale(0.94)",
          }}
        >
          {item.needed ? <Icon name="check" size={13} strokeWidth={3} color={COLORS.paper} /> : null}
        </span>
      </button>
    </div>
  );
}
