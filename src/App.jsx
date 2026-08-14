import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// ---- Firebase-backed replacement for window.storage ----
// Keeps the exact same get/set(key, value, shared) interface the whole
// app already uses, so nothing below this block needs to change.
// - shared === false  -> personal, per-device data -> localStorage
//   (dark mode, which household this device belongs to, this person's name)
// - shared === true   -> data shared across a household (or global, like
//   the barcode lookup table) -> Firestore, one document per key
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

// Firestore document IDs can't contain "/" — the app never produces one
// in practice, but this keeps things safe if it ever does.
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
};

// ---- Design tokens ----
// "ink" doubles as both a dark accent (buttons/header backgrounds) and
// heading-text color throughout the app, and "paper"/"charcoal" double
// as page background and body text. Dark mode swaps these roles rather
// than inverting each usage individually, which keeps every existing
// inline style correct without touching them one by one.
const LIGHT_COLORS = {
  ink: "#1B2A41",
  paper: "#F6EFE1",
  paperAlt: "#EFE4CD",
  card: "#FFFCF5",
  saffron: "#E8A33D",
  saffronDeep: "#C97F1E",
  sage: "#6E7F5C",
  sageDeep: "#546343",
  rust: "#B5482F",
  charcoal: "#2B2420",
  line: "#DDD0B3",
};

const DARK_COLORS = {
  ink: "#F2E9D8",
  paper: "#15120D",
  paperAlt: "#20190F",
  card: "#1B150E",
  saffron: "#E8A33D",
  saffronDeep: "#F0B65C",
  sage: "#87996F",
  sageDeep: "#A6BB8F",
  rust: "#DD6A48",
  charcoal: "#EDE4D3",
  line: "#3A3226",
};

// Mutable on purpose — toggleDarkMode() reassigns these values in place
// so every inline style referencing COLORS.xxx picks up the new theme
// on the next render without threading a theme prop through the tree.
const COLORS = { ...LIGHT_COLORS };

// Ordered to roughly follow a typical supermarket walking route,
// so the shopping-list groups naturally match the aisles you pass.
// ---- Translations ----
// Covers the primary day-to-day screens (header, tabs, add/edit item,
// settings, household onboarding). Deeper feature modals (templates,
// nutrition, recipes, stats) are still Arabic-only for now.
const STRINGS = {
  appName: { ar: "المونة", en: "Mona" },
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
  { id: "produce", label: "خضار وفواكه", labelEn: "Produce", icon: "🥬" },
  { id: "bakery", label: "مخبوزات", labelEn: "Bakery", icon: "🍞" },
  { id: "dairy", label: "ألبان وبيض", labelEn: "Dairy & Eggs", icon: "🥛" },
  { id: "kitchen", label: "بقالة وجاف", labelEn: "Pantry & Dry Goods", icon: "🫙" },
  { id: "frozen", label: "مجمدات", labelEn: "Frozen", icon: "🧊" },
  { id: "cleaning", label: "التنظيف", labelEn: "Cleaning", icon: "🧺" },
  { id: "care", label: "العناية الشخصية", labelEn: "Personal Care", icon: "🧴" },
  { id: "other", label: "أخرى", labelEn: "Other", icon: "🗂️" },
];

// Ready-made shopping templates. Adding one tags every item with the
// same "occasion" name, reusing the existing occasion-mode grouping.
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

// Weekly meal schedules for the nutrition tab. Each plan links to a
// TEMPLATES entry so its ingredients can be added to the shopping
// list in one tap.
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

// Simple recipe suggestions matched against what's already in stock
// (items marked as NOT needed, i.e. you still have them at home).
const RECIPES = [
  // أطباق عمانية
  { name: "مجبوس لحم", icon: "🍛", meal: "lunch", ingredients: ["رز", "لحم", "بهارات مشكلة"] },
  { name: "عرسية", icon: "🍚", meal: "lunch", ingredients: ["رز", "لحم"] },
  { name: "هريس", icon: "🥘", meal: "dinner", ingredients: ["قمح", "لحم"] },
  { name: "مطبق مسقطي", icon: "🥞", meal: "dinner", ingredients: ["بيض", "لحم مفروم"] },
  { name: "شوري (لحم مشوي بالبهارات)", icon: "🍖", meal: "lunch", ingredients: ["لحم", "بهارات مشكلة"] },
  { name: "خبيص", icon: "🍯", meal: "breakfast", ingredients: ["دقيق", "سكر"] },
  { name: "لقيمات", icon: "🍩", meal: "dinner", ingredients: ["دقيق", "عسل"] },
  { name: "قهوة عمانية بالتمر", icon: "☕", meal: "breakfast", ingredients: ["قهوة", "تمر"] },
  // فطور
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
  // غداء
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
  // عشاء
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

// Common household items for the swipe-based quick-add screen.
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

// Deterministic day-based number so "today's pick" is stable all day
// but naturally rotates to something different tomorrow.
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

// Short, easy-to-read household code (avoids ambiguous characters like 0/O, 1/I).
function generateHouseholdCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Days between today and an item's expiry date (negative = already expired).
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

// Lazily loads the QuaggaJS barcode-scanning library from a CDN,
// only when the user actually opens the scanner.
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

// Lazily loads Tesseract.js for on-device OCR (reading a photographed
// paper shopping list). Works best on printed text; handwriting
// accuracy varies a lot.
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

// Resize an image file down to a small JPEG data URL so it stays
// well within the storage size limit even with many products.
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
  useFonts();
  const [items, setItems] = useState(null); // null = loading
  const [loadError, setLoadError] = useState(false);
  const [tab, setTab] = useState("pantry"); // pantry | shopping | favorites | nutrition
  const [dietPlanKey, setDietPlanKey] = useState(null); // null | "gain" | "loss"
  const [activeDietDay, setActiveDietDay] = useState(0);
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

  // Swipe-based quick add
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickQueue, setQuickQueue] = useState([]);
  const [quickIndex, setQuickIndex] = useState(0);
  const [quickAddedCount, setQuickAddedCount] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStartX = useRef(0);
  const [showFieldInfo, setShowFieldInfo] = useState(null); // null or a FIELD_INFO key
  const [newFavorite, setNewFavorite] = useState(false);
  const [newAssignedTo, setNewAssignedTo] = useState("");
  const [newOccasion, setNewOccasion] = useState("");
  const [onlyMine, setOnlyMine] = useState(false);

  // Ready-made templates
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

  // Household code — scopes all shared data to this specific home
  const [householdCode, setHouseholdCode] = useState(null); // null = checking, "" = needs onboarding
  const [codeInput, setCodeInput] = useState("");
  const [householdBusy, setHouseholdBusy] = useState(false);
  const [householdErr, setHouseholdErr] = useState(null);

  // Barcode scanner
  const [showScanner, setShowScanner] = useState(false);
  const [scannerLoading, setScannerLoading] = useState(false);
  const [scannerError, setScannerError] = useState(null);
  const [manualBarcode, setManualBarcode] = useState("");
  const scannerTargetRef = useRef(null);

  // Who's using the app
  const [userName, setUserName] = useState(null); // null = not loaded yet
  const [askName, setAskName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  // WhatsApp recipients (shared across the household — can be more than one)
  const [waContacts, setWaContacts] = useState(null); // null = not loaded yet
  const [showWaSettings, setShowWaSettings] = useState(false);
  const [waNameInput, setWaNameInput] = useState("");
  const [waPhoneInput, setWaPhoneInput] = useState("");
  const [showRecipientPicker, setShowRecipientPicker] = useState(false);
  const [pendingWaText, setPendingWaText] = useState(null);

  // Purchase history
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showRecipes, setShowRecipes] = useState(false);
  const [recipeCycle, setRecipeCycle] = useState({ breakfast: 0, lunch: 0, dinner: 0 });
  const [isListening, setIsListening] = useState(false);
  const [showHouseholdQr, setShowHouseholdQr] = useState(false);

  // Paper list OCR scan
  const [showOcrScan, setShowOcrScan] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState(null);
  const [ocrItems, setOcrItems] = useState(null); // null = not scanned yet
  const [newOcrItemName, setNewOcrItemName] = useState("");

  // Cost split between household members
  const [showSplit, setShowSplit] = useState(false);
  const [showMonthCard, setShowMonthCard] = useState(false);

  // Monthly budget challenge
  const [monthlyBudget, setMonthlyBudget] = useState(null); // null = not loaded, "" = not set
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

    // Language always starts Arabic on load — no auto-restore from
    // storage, since a stale/failed save could otherwise re-open the
    // app in English unexpectedly. The toggle button still works live.

    (async () => {
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

  // Step 2: once we know the household code, load that household's
  // own pantry list and WhatsApp settings (scoped by the code so
  // different households never see each other's data).
  useEffect(() => {
    if (!householdCode) return;

    (async () => {
      try {
        const result = await window.storage.get(`pantry-items:${householdCode}`, true);
        if (result && result.value) {
          setItems(JSON.parse(result.value));
        } else {
          setItems(SEED_ITEMS);
        }
      } catch (e) {
        setItems(SEED_ITEMS);
        setLoadError(false);
      }
    })();

    (async () => {
      try {
        const result = await window.storage.get(`whatsapp-settings:${householdCode}`, true);
        if (result && result.value) {
          const parsed = JSON.parse(result.value);
          if (Array.isArray(parsed.contacts)) {
            setWaContacts(parsed.contacts);
          } else if (parsed.phone) {
            // migrate old single-phone format
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
  }, [householdCode]);

  const createHousehold = () => {
    const code = generateHouseholdCode();
    // Show the household immediately — don't make the UI wait on storage.
    setHouseholdErr(null);
    setHouseholdCode(code);
    // Persist in the background, best-effort.
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
    setWaPhone(null);
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
  };

  const buildMonthCardData = () => {
    const now = new Date();
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

    // Longest streak of consecutive calendar days with at least one
    // purchase logged this month — a sign the household stayed on top
    // of restocking instead of running out and scrambling.
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
    }\n\nصنعناها بتطبيق المونة 🫙`;
    if (waContacts && waContacts.length > 1) {
      setPendingWaText(text);
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
      // nothing to attach — just do the normal text send
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
      if (e && e.name === "AbortError") return; // user cancelled share sheet
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
    // Shuffle for variety each time you open it.
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

    // Teach the shared barcode database so the next person who
    // scans this same product gets it filled in automatically.
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
      // Keep the log from growing unbounded.
      const nextHistory = [entry, ...purchaseHistory].slice(0, 300);
      persistHistory(nextHistory);
    }
  };

  // Make the device's native back gesture/button close whichever modal
  // or overlay is open (instead of leaving the app or doing nothing).
  // We push a history entry the moment something opens, so the back
  // action has somewhere to "land" and fires a popstate event we can
  // intercept — this only works on a real deployed URL, not inside a
  // sandboxed preview iframe.
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
      showRecipientPicker;
    if (anyOverlayOpen || tab !== "pantry") {
      window.history.pushState({ pantryAppNav: true }, "");
    }
  }, [showAdd, showScanner, showTemplates, showWaSettings, showHistory, showStats, showRecipes, showOcrScan, showSplit, showMonthCard, showBudget, showQuickAdd, showRecipientPicker, tab]);

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
      if (showRecipientPicker) {
        setShowRecipientPicker(false);
        setPendingWaText(null);
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
  }, [showAdd, showScanner, showTemplates, showWaSettings, showHistory, showStats, showRecipes, showOcrScan, showSplit, showMonthCard, showBudget, showQuickAdd, showRecipientPicker, tab]);

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
          <div>جارٍ تحميل المونة…</div>
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
        paddingBottom: 100,
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
          }}
        >
          ⚙️
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
          }}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
        {/* Language toggle hidden for now — re-enable after deploying to
            real hosting, where the preference will save reliably.
        <button
          onClick={toggleLang}
          aria-label="Language"
          style={{
            position: "absolute",
            top: 24,
            [lang === "ar" ? "left" : "right"]: 116,
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 10,
            color: COLORS.paper,
            padding: "8px 10px",
            fontSize: 12,
            fontFamily: "'Cairo', sans-serif",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {lang === "ar" ? "EN" : "عربي"}
        </button>
        */}
      </header>

      {/* Tabs */}
      <div
        style={{
          maxWidth: 560,
          margin: "18px auto 0",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            background: COLORS.paperAlt,
            borderRadius: 14,
            padding: 5,
            border: `1px solid ${COLORS.line}`,
          }}
        >
          {[
            { id: "pantry", label: t("tabPantry") },
            { id: "shopping", label: `${t("tabShopping")}${neededCount ? ` (${neededCount})` : ""}` },
            { id: "favorites", label: `⭐ ${t("tabFavorites")}${favoriteItems.length ? ` (${favoriteItems.length})` : ""}` },
            { id: "nutrition", label: `🍽️ ${t("tabNutrition")}` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                border: "none",
                cursor: "pointer",
                padding: "10px 6px",
                borderRadius: 10,
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 700,
                fontSize: 13,
                transition: "all 0.2s",
                background: tab === t.id ? COLORS.ink : "transparent",
                color: tab === t.id ? COLORS.paper : COLORS.ink,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        {userName ? (
          <button
            onClick={() => setOnlyMine(!onlyMine)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 10,
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
        ) : null}
      </div>

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
                padding: "11px 40px 11px 14px",
                borderRadius: 12,
                border: `1.5px solid ${COLORS.line}`,
                background: COLORS.card,
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
                opacity: 0.5,
                fontSize: 15,
              }}
            >
              🔍
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

          {/* Templates entry point */}
          <button
            onClick={() => setShowTemplates(true)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "10px",
              borderRadius: 12,
              border: `1.5px dashed ${COLORS.saffronDeep}`,
              background: "rgba(232,163,61,0.08)",
              color: COLORS.saffronDeep,
              fontFamily: "'Cairo', sans-serif",
              fontWeight: 700,
              fontSize: 13.5,
              cursor: "pointer",
              marginBottom: 14,
            }}
          >
            <span>📋</span>
            <span>{t("templatesBtn")}</span>
          </button>

          {/* Recipe suggestions entry point */}
          <button
            onClick={() => setShowRecipes(true)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "10px",
              borderRadius: 12,
              border: `1.5px dashed ${COLORS.sageDeep}`,
              background: "rgba(110,127,92,0.08)",
              color: COLORS.sageDeep,
              fontFamily: "'Cairo', sans-serif",
              fontWeight: 700,
              fontSize: 13.5,
              cursor: "pointer",
              marginBottom: 14,
            }}
          >
            <span>🍳</span>
            <span>{t("recipesBtn")}</span>
          </button>

          {/* Paper list OCR scan entry point */}
          <button
            onClick={() => setShowOcrScan(true)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "10px",
              borderRadius: 12,
              border: `1.5px dashed ${COLORS.line}`,
              background: COLORS.card,
              color: COLORS.ink,
              fontFamily: "'Cairo', sans-serif",
              fontWeight: 700,
              fontSize: 13.5,
              cursor: "pointer",
              marginBottom: 14,
            }}
          >
            <span>📸</span>
            <span>امسح قائمة ورقية</span>
          </button>

          {/* Swipe-based quick add entry point */}
          <button
            onClick={openQuickAdd}
            style={{
              width: "100%",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "10px",
              borderRadius: 12,
              border: `1.5px dashed ${COLORS.line}`,
              background: COLORS.card,
              color: COLORS.ink,
              fontFamily: "'Cairo', sans-serif",
              fontWeight: 700,
              fontSize: 13.5,
              cursor: "pointer",
              marginBottom: 14,
            }}
          >
            <span>👆</span>
            <span>إضافة سريعة بالسحب</span>
          </button>

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

          {/* Category chips */}
          <div
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              paddingBottom: 4,
              marginBottom: 16,
            }}
          >
            {CATEGORIES.map((c) => {
              const count = items.filter((i) => i.category === c.id).length;
              const active = activeCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  style={{
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 14px",
                    borderRadius: 999,
                    border: `1.5px solid ${active ? COLORS.sage : COLORS.line}`,
                    background: active ? COLORS.sage : COLORS.card,
                    color: active ? COLORS.paper : COLORS.charcoal,
                    fontFamily: "'Cairo', sans-serif",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span>{c.icon}</span>
                  <span>{lang === "en" ? c.labelEn : c.label}</span>
                  <span style={{ opacity: 0.7, fontWeight: 500 }}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Shelf */}
          <div
            style={{
              background: COLORS.card,
              borderRadius: 18,
              border: `1px solid ${COLORS.line}`,
              padding: "6px 6px 14px",
              boxShadow: "0 1px 0 rgba(27,42,65,0.04)",
            }}
          >
            {categoryItems.length === 0 ? (
              <div
                style={{
                  padding: "36px 16px",
                  textAlign: "center",
                  color: COLORS.ink,
                  opacity: 0.6,
                }}
              >
                {query ? t("noResults") : t("emptyShelf")}
              </div>
            ) : (
              categoryItems.map((item, idx) => (
                <ShelfRow
                  key={item.id}
                  item={item}
                  isLast={idx === categoryItems.length - 1}
                  onToggle={() => toggleNeeded(item.id)}
                  onEdit={() => openEditModal(item)}
                  onToggleFavorite={() => toggleFavorite(item.id)}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Shopping tab */}
      {tab === "shopping" && (
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "18px 20px" }}>
          {allNeeded.length > 0 && (
            <div
              style={{
                background: COLORS.card,
                border: `1px solid ${COLORS.line}`,
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
              onClick={neededHasPhotos ? shareWithPhotos : sendToWhatsApp}
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
                marginBottom: neededHasPhotos ? 8 : 16,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "0 4px 12px rgba(37,211,102,0.35)",
              }}
            >
              <span style={{ fontSize: 18 }}>{neededHasPhotos ? "📸" : "📲"}</span>
              <span>
                {neededHasPhotos
                  ? "مشاركة القائمة مع الصور"
                  : waContacts && waContacts.length === 1
                  ? `إرسال القائمة إلى ${waContacts[0].name}`
                  : waContacts && waContacts.length > 1
                  ? "إرسال القائمة عبر واتساب"
                  : "إرسال القائمة عبر واتساب"}
              </span>
            </button>
          )}
          {(shoppingByCategory.length > 0 || occasionGroups.length > 0) && neededHasPhotos && (
            <button
              onClick={sendToWhatsApp}
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "transparent",
                border: "none",
                color: COLORS.ink,
                opacity: 0.6,
                fontSize: 12.5,
                fontFamily: "'Tajawal', sans-serif",
                marginBottom: 12,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              أو إرسال نص القائمة فقط (بدون صور)
            </button>
          )}
          {(!waContacts || waContacts.length === 0) && (shoppingByCategory.length > 0 || occasionGroups.length > 0) && !neededHasPhotos && (
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
                  <span>{c.icon}</span>
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
                   
