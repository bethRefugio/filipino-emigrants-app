import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export const AVAILABLE_DATASETS = [
  { id: 'age', name: 'Age Distribution', flatStructure: true },
  { id: 'civil_status', name: 'Civil Status', flatStructure: true },
  { id: 'education', name: 'Education Level', flatStructure: true },
  { id: 'major-destination', name: 'Major Destinations', flatStructure: true },
  { id: 'occupation', name: 'Occupation', flatStructure: true },
  { id: 'origin', name: 'Origin/Province', flatStructure: true },
  { id: 'sex', name: 'Sex/Gender', flatStructure: true }
];

/**
 * Fetch data from Firebase collection with flat structure
 * Structure: { year: 2015, female: 52919, male: 40079, ... }
 */
export async function fetchDatasetFromFirebase(collectionName) {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const data = [];
    
    querySnapshot.forEach((doc) => {
      const docData = doc.data();
      
      if (!docData.year) {
        console.warn('Document missing year field:', doc.id);
        return;
      }

      // Extract all numeric fields except 'year' for breakdown
      const year = parseInt(docData.year);
      const breakdown = {};
      let total = 0;
      
      Object.entries(docData).forEach(([key, value]) => {
        if (key !== 'year' && typeof value === 'number') {
          breakdown[key] = value;
          total += value;
        }
      });
      
      if (total > 0) {
        data.push({
          year,
          emigrants: total,
          breakdown,
          ...breakdown // Flatten for chart access
        });
      }
    });

    console.log(`Fetched ${data.length} documents from ${collectionName}:`, data.length > 0 ? data[0] : 'No data');
    return data.sort((a, b) => a.year - b.year);
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Fetch aggregated yearly data with breakdown details
 * All datasets use flat structure with year + category fields
 */
export async function fetchAggregatedYearlyData(collectionName) {
  const rawData = await fetchDatasetFromFirebase(collectionName);
  
  if (rawData.length === 0) {
    console.warn(`No data found in ${collectionName} collection`);
    return [];
  }

  // Data is already in the correct format
  return rawData;
}