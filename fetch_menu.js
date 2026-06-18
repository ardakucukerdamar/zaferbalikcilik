async function run() {
  try {
    const res = await fetch('http://localhost:3000/menu');
    const html = await res.text();
    console.log('Menu Page Fetch Status:', res.status);
    console.log('Has "Bu kategoride kayıtlı yemek bulunmuyor":', html.includes('Bu kategoride kayıtlı yemek bulunmuyor'));
    console.log('Contains "Çupra" (seeded item):', html.includes('Çupra') || html.includes('cupra'));
    console.log('Contains "Haydari" (seeded item):', html.includes('Haydari') || html.includes('haydari'));
    
    // Print first 500 chars of main
    const mainIdx = html.indexOf('<main');
    if (mainIdx !== -1) {
      console.log('\nHTML snippet from <main>:\n', html.substring(mainIdx, mainIdx + 600));
    } else {
      console.log('No <main> tag found.');
    }
  } catch (e) {
    console.error('Error fetching:', e.message);
  }
}

run();
