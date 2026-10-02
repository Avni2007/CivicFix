const Complaint = require('../models/Complaint');

/**
 * Haversine formula to compute distance in km between two lat/lng pairs
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates string word overlap similarity (Jaccard similarity index)
 */
function textSimilarity(str1, str2) {
  const getWords = (text) => new Set((text || '').toLowerCase().replace(/[^\w\s]/gi, '').split(/\s+/).filter(Boolean));
  const set1 = getWords(str1);
  const set2 = getWords(str2);
  
  if (set1.size === 0 || set2.size === 0) return 0;
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

/**
 * AI Category Classifier Service
 */
function predictCategory(title = '', description = '') {
  const text = `${title} ${description}`.toLowerCase();
  
  const keywords = {
    'Pothole': ['pothole', 'hole in road', 'asphalt crack', 'crater', 'road bump', 'broken road', 'tar', 'tarmac'],
    'Garbage': ['garbage', 'trash', 'waste', 'dump', 'litter', 'smell', 'filth', 'dustbin', 'refuse', 'plastic dump'],
    'Streetlight': ['light', 'lamp', 'darkness', 'bulb', 'streetlight', 'lighting', 'power pole', 'blackout'],
    'Water': ['water leak', 'pipe burst', 'drinking water', 'pipeline', 'water supply', 'clean water', 'tanker'],
    'Drainage': ['drain', 'drainage', 'sewage', 'clogged drain', 'overflowing', 'gutter', 'manhole', 'sludge'],
    'Road': ['road block', 'sidewalk', 'pavement', 'divider', 'guard rail', 'footpath', 'cobblestone'],
    'Traffic': ['traffic signal', 'light broken', 'traffic light', 'jam', 'signboard', 'crossing', 'zebra crossing'],
    'Public Property': ['park bench', 'playground', 'bus stop', 'wall graffiti', 'public toilet', 'fence']
  };

  let bestMatch = 'Other';
  let maxHits = 0;

  for (const [cat, words] of Object.entries(keywords)) {
    let hits = 0;
    for (const w of words) {
      if (text.includes(w)) hits++;
    }
    if (hits > maxHits) {
      maxHits = hits;
      bestMatch = cat;
    }
  }

  const confidence = maxHits > 0 ? Math.min(0.70 + (maxHits * 0.08), 0.98) : 0.82;
  return { category: bestMatch, confidence: parseFloat(confidence.toFixed(2)) };
}

/**
 * Department Recommendation Engine
 */
function recommendDepartment(category) {
  const deptMap = {
    'Garbage': 'Sanitation',
    'Pothole': 'Public Works',
    'Road': 'Public Works',
    'Streetlight': 'Electricity',
    'Water': 'Water',
    'Drainage': 'Drainage',
    'Traffic': 'Traffic',
    'Public Property': 'Municipal Administration',
    'Other': 'Municipal Administration'
  };
  return deptMap[category] || 'Municipal Administration';
}

/**
 * AI Priority Prediction Engine
 */
function predictPriority(category, title = '', description = '', similarNearbyCount = 0) {
  const text = `${title} ${description}`.toLowerCase();
  
  const criticalKeywords = ['emergency', 'hazard', 'electric shock', 'sparking', 'live wire', 'open manhole', 'burst pipe', 'major accident', 'school area', 'hospital road'];
  const highKeywords = ['deep pothole', 'severe overflow', 'flooding', 'blocked highway', 'dark street', 'main road', 'heavy traffic', 'danger'];

  const hasCritical = criticalKeywords.some(kw => text.includes(kw));
  const hasHigh = highKeywords.some(kw => text.includes(kw));

  if (hasCritical || (similarNearbyCount >= 4 && ['Water', 'Drainage', 'Electricity'].includes(category))) {
    return 'CRITICAL';
  }
  if (hasHigh || similarNearbyCount >= 2 || ['Drainage', 'Water', 'Traffic'].includes(category)) {
    return 'HIGH';
  }
  if (['Pothole', 'Garbage', 'Streetlight'].includes(category)) {
    return 'MEDIUM';
  }
  return 'LOW';
}

/**
 * Duplicate Complaint Detector (Spatial 500m + Textual similarity)
 */
async function detectDuplicates(lat, lng, category, title, description) {
  if (!lat || !lng) return { hasDuplicates: false, similarComplaints: [], count: 0 };

  // Fetch recent active complaints
  const activeComplaints = await Complaint.find({
    status: { $in: ['REPORTED', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'REOPENED'] }
  }).lean();

  const matches = [];

  for (const c of activeComplaints) {
    if (!c.location || !c.location.lat || !c.location.lng) continue;

    const distKm = calculateHaversineDistance(lat, lng, c.location.lat, c.location.lng);

    // Check if within 0.5 km (500 meters)
    if (distKm <= 0.5) {
      const titleSim = textSimilarity(title, c.title);
      const descSim = textSimilarity(description, c.description);
      const catMatch = c.category === category;

      const totalSimScore = (titleSim * 0.4) + (descSim * 0.4) + (catMatch ? 0.2 : 0);

      if (totalSimScore >= 0.25 || distKm <= 0.15) {
        matches.push({
          complaintId: c.complaintId,
          id: c._id,
          title: c.title,
          category: c.category,
          status: c.status,
          priority: c.priority,
          distanceMeters: Math.round(distKm * 1000),
          similarityScore: Math.round(totalSimScore * 100)
        });
      }
    }
  }

  return {
    hasDuplicates: matches.length > 0,
    similarComplaints: matches,
    count: matches.length
  };
}

/**
 * Executive AI Summary Generator
 */
function generateSummary(title, description, category, priority, locationAddress, similarCount) {
  const priorityTag = priority === 'CRITICAL' || priority === 'HIGH' ? 'High-priority' : 'Standard';
  const duplicateTag = similarCount > 0 ? `${similarCount} duplicate/similar report(s) nearby` : 'First report in immediate area';
  
  return `${priorityTag} ${category.toLowerCase()} report at "${locationAddress || 'specified location'}". ${duplicateTag}. Executive note: "${title} - ${description.substring(0, 100)}..."`;
}

/**
 * Full AI Analysis Pipeline
 */
async function analyzeComplaint({ title, description, category, lat, lng, locationAddress }) {
  // 1. Predict Category if not provided or to check confidence
  const predicted = predictCategory(title, description);
  const finalCategory = category || predicted.category;

  // 2. Department Recommendation
  const department = recommendDepartment(finalCategory);

  // 3. Duplicate Check
  const duplicateResult = await detectDuplicates(lat, lng, finalCategory, title, description);

  // 4. Priority Prediction
  const priority = predictPriority(finalCategory, title, description, duplicateResult.count);

  // 5. Executive AI Summary
  const summary = generateSummary(title, description, finalCategory, priority, locationAddress, duplicateResult.count);

  return {
    category: finalCategory,
    confidence: predicted.confidence,
    priority,
    suggestedDepartment: department,
    similarCount: duplicateResult.count,
    similarComplaints: duplicateResult.similarComplaints,
    summary
  };
}

module.exports = {
  predictCategory,
  recommendDepartment,
  predictPriority,
  detectDuplicates,
  generateSummary,
  analyzeComplaint
};
