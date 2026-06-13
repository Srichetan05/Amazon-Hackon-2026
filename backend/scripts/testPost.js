async function test() {
  try {
    const newItem = {
      name: 'Realme Smart TV 43"',
      grade: 'NEW',
      damageLevel: 'NONE',
      originalPrice: 32000,
      discountedPrice: 25600,
      deliveryPointId: 'dp-1',
      deliveryPointName: 'Andheri Resale Hub',
      city: 'Mumbai',
      category: '📺 TVs',
      type: 'WAREHOUSE'
    };

    console.log('Sending POST /api/inventory...');
    const postRes = await fetch('http://localhost:5000/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem)
    });

    if (!postRes.ok) throw new Error(`POST failed: ${postRes.statusText}`);
    const created = await postRes.json();
    console.log('Successfully created item:', created);

    console.log('Fetching GET /api/inventory...');
    const getRes = await fetch('http://localhost:5000/api/inventory');
    if (!getRes.ok) throw new Error(`GET failed: ${getRes.statusText}`);
    const list = await getRes.json();
    
    const matched = list.find(item => item.id === created.id);
    if (matched) {
      console.log('MATCH FOUND in database list:', matched);
      console.log('TEST PASSED! Fullstack integration works perfectly.');
    } else {
      console.error('Test failed: created item not found in retrieved list.');
    }
  } catch (err) {
    console.error('Error testing:', err);
  }
}

test();
