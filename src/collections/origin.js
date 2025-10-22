import admin from "firebase-admin";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// For ES modules, __dirname workaround:
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load service account key
const serviceAccount = JSON.parse(
  readFileSync(
    join(__dirname, "../../filipinoemigrantsdb-9cc1e-firebase-adminsdk-fbsvc-3a27b36bed.json"),
    "utf8"
  )
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// List of country names
const provinceNames = [
  "Albania", "Andorra", "Angola", "Anguilla", "Antigua and Barbuda",
  "Argentina", "Aruba", "Australia", "Austria", "Bahamas", "Bahrain",
  "Bangladesh", "Belgium", "Bermuda", "Bolivia", "Bosnia and Herzegovina",
  "Brazil", "British Virgin Islands", "Brunei Darussalam", "Bulgaria",
  "Canada", "Cayman Islands", "Channel Island", "Chile", "China (P.R.O.C.)",
  "Cocos (Keeling) Island", "Colombia", "Costa Rica", "Croatia", "Cyprus",
  "Czech Republic", "Democratic Kampuchea", "Democratic Republic of the Congo (Zaire)",
  "Denmark", "Dominican Republic", "Ecuador", "Egypt", "Estonia", "Ethiopia",
  "Faroe Islands", "Falkland Islands (Malvinas)", "Fiji", "Finland", "France",
  "French Polynesia", "Gabon", "Germany", "Ghana", "Gibraltar", "Greece",
  "Greenland", "Hongkong", "Hungary", "Iceland", "India", "Indonesia", "Iran",
  "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", "Japan", "Jordan",
  "Kazakhstan", "Kiribati", "Kuwait", "Latvia", "Lebanon", "Leichtenstein",
  "Lesotho", "Liberia", "Libya", "Lithuania", "Luxembourg", "Macau",
  "Macedonia", "Malaysia", "Maldives", "Malta", "Marshall Islands", "Mauritius",
  "Mexico", "Midway Island", "Monaco", "Morocco", "Myanmar (Burma)", "Namibia",
  "Nepal", "Netherlands", "Netherlands Antilles", "New Caledonia", "New Zealand",
  "Nigeria", "Norway", "Oman", "Pacific Islands", "Pakistan", "Palau", "Panama",
  "Papua New Guinea", "Peru", "Poland", "Portugal", "Puerto Rico", "Qatar",
  "Romania", "Russian Federation / Ussr", "San Marino", "Saudi Arabia",
  "Seychelles", "Singapore", "Slovak Republic", "Slovenia", "Solomon Islands",
  "South Africa", "South Korea", "Spain", "Sri Lanka", "Sudan", "Sweden",
  "Switzerland", "Syria", "Taiwan (Roc)", "Thailand", "Trinidad and Tobago",
  "Tunisia", "Turkey", "Turks and Caicos Islands", "Uganda", "Ukraine",
  "United Arab Emirates", "United Kingdom", "United States of America",
  "Uruguay", "Vanuatu", "Venezuela", "Vietnam", "Wake Island", "Yemen",
  "Yugoslavia (Serbia & Montenegro)"
];

// Function to upload all countries into one document
async function uploadCountriesForYear(year) {
  const countriesCollection = db.collection("countries");
  const docRef = countriesCollection.doc(String(year));

  // Create an object with countries as fields
  const countriesData = { year };
  countryNames.forEach((country) => {
    countriesData[country] = 0; // You can set default emigrant count to 0
  });

  try {
    await docRef.set({
      ...countriesData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`🎉 Successfully uploaded countries for year ${year}`);
  } catch (error) {
    console.error("❌ Error uploading countries:", error);
  }
}

// Example: upload for year 2024
uploadCountriesForYear(2024);

// Run this script with: node src/collections/countries.js
