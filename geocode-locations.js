// geocode-locations-fixed.js
// Fixed version that works with Node.js

const fs = require('fs');
const path = require('path');
const https = require('https');

const locationsPath = path.join(__dirname, 'src', 'locations.js');
const locationsContent = fs.readFileSync(locationsPath, 'utf8');

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'EuropeTripVisualizer/1.0'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function geocodeAddress(address, locationName) {
  const encodedAddress = encodeURIComponent(address);
  const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`;

  try {
    console.log(`Geocoding: ${locationName}`);
    console.log(`  ${address}`);
    
    const data = await httpsGet(url);

    if (data && data.length > 0) {
      const result = data[0];
      const coords = [parseFloat(result.lat), parseFloat(result.lon)];
      console.log(`  ✓ [${coords[0]}, ${coords[1]}]`);
      return coords;
    } else {
      console.log(`  ✗ Not found`);
      return null;
    }
  } catch (error) {
    console.error(`  ✗ Error:`, error.message);
    return null;
  }
}

async function geocodeAllLocations() {
  // Extract locations using regex
  const locationRegex = /\{\s*id:\s*'([^']+)'[^}]*address:\s*'([^']+)'[^}]*coords:\s*\[([^\]]+)\]/g;
  const locations = [];
  let match;
  
  while ((match = locationRegex.exec(locationsContent)) !== null) {
    const [, id, address, coordsStr] = match;
    const coords = coordsStr.split(',').map(c => parseFloat(c.trim()));
    locations.push({ id, address, oldCoords: coords });
  }

  console.log(`\nFound ${locations.length} locations to geocode\n`);
  console.log('='.repeat(80));

  const results = [];

  for (let i = 0; i < locations.length; i++) {
    const location = locations[i];
    console.log(`\n[${i + 1}/${locations.length}]`);
    
    const newCoords = await geocodeAddress(location.address, location.id);
    
    results.push({
      id: location.id,
      address: location.address,
      oldCoords: location.oldCoords,
      newCoords: newCoords || location.oldCoords,
      changed: newCoords !== null
    });

    // Wait 1.1 seconds between requests (rate limiting)
    if (i < locations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1100));
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('\nRESULTS:\n');

  const changed = results.filter(r => r.changed).length;
  const failed = results.filter(r => !r.changed).length;
  
  console.log(`✓ Successfully geocoded: ${changed}`);
  console.log(`✗ Failed: ${failed}`);
  console.log(`Total: ${results.length}\n`);

  // Show changes
  if (changed > 0) {
    console.log('Changes:');
    console.log('-'.repeat(80));
    results.forEach(result => {
      if (result.changed) {
        const diff0 = Math.abs(result.oldCoords[0] - result.newCoords[0]);
        const diff1 = Math.abs(result.oldCoords[1] - result.newCoords[1]);
        const distance = Math.sqrt(diff0 * diff0 + diff1 * diff1) * 111; // Rough km
        
        console.log(`\n${result.id}:`);
        console.log(`  Old: [${result.oldCoords[0]}, ${result.oldCoords[1]}]`);
        console.log(`  New: [${result.newCoords[0]}, ${result.newCoords[1]}]`);
        console.log(`  Δ:   ~${distance.toFixed(2)} km`);
      }
    });
  }

  // Generate updated content
  let updatedContent = locationsContent;
  
  results.forEach(result => {
    if (result.changed) {
      // Build the old coordinate string exactly as it appears
      const oldStr = `[${result.oldCoords[0]}, ${result.oldCoords[1]}]`;
      const newStr = `[${result.newCoords[0]}, ${result.newCoords[1]}]`;
      
      // Find and replace in the specific location block
      const locationBlock = new RegExp(
        `(id:\\s*'${result.id}'[^}]*coords:\\s*)\\[${result.oldCoords[0]},\\s*${result.oldCoords[1]}\\]`,
        'g'
      );
      updatedContent = updatedContent.replace(locationBlock, `$1${newStr}`);
    }
  });

  // Save files
  const backupPath = path.join(__dirname, 'src', 'locations.backup.js');
  fs.writeFileSync(backupPath, locationsContent);
  console.log(`\n✓ Backup: ${backupPath}`);

  fs.writeFileSync(locationsPath, updatedContent);
  console.log(`✓ Updated: ${locationsPath}`);

  const reportPath = path.join(__dirname, 'geocoding-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`✓ Report: ${reportPath}\n`);
}

console.log('\n🌍 Geocoding locations...\n');
geocodeAllLocations().catch(error => {
  console.error('\nFatal error:', error);
  process.exit(1);
});
