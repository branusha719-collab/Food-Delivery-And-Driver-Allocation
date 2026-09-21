const fetch = require('node-fetch');

async function testFlow() {
  try {
    // 1. Register a new user
    console.log("Registering user...");
    const email = `test${Date.now()}@example.com`;
    const regRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email, password: 'password123', role: 'customer' })
    });
    const regData = await regRes.json();
    if (!regData.success) throw new Error(regData.message || "Registration failed");
    const token = regData.data.token;
    console.log(`Registered and logged in successfully as ${email}. Token obtained.`);

    // 2. Fetch Restaurants
    console.log("Fetching restaurants...");
    const restRes = await fetch('http://localhost:5000/api/restaurants?limit=5');
    const restData = await restRes.json();
    const restaurantId = restData.data.items[0]._id;
    console.log(`Selected restaurant: ${restaurantId}`);

    // 3. Fetch Menu
    console.log("Fetching menu...");
    const menuRes = await fetch(`http://localhost:5000/api/restaurants/${restaurantId}/menu`);
    const menuData = await menuRes.json();
    const menuItemId = menuData.data.items[0]._id;
    console.log(`Selected menu item: ${menuItemId}`);

    // 4. Create Order
    console.log("Placing order...");
    const orderRes = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        restaurantId,
        deliveryAddress: "Test Address",
        items: [{ menuItemId, quantity: 2 }]
      })
    });
    const orderData = await orderRes.json();
    if (!orderData.success) throw new Error(orderData.message || "Order failed");
    const orderId = orderData.data._id;
    console.log(`Order placed successfully! ID: ${orderId}`);

    // 5. Assign Driver
    console.log("Assigning driver...");
    const assignRes = await fetch(`http://localhost:5000/api/orders/${orderId}/assign-driver`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ driverId: 'AUTO' })
    });
    const assignData = await assignRes.json();
    if (!assignData.success) throw new Error(assignData.message || "Assign failed");
    console.log(`Driver assigned successfully!`);
    console.log(`Assigned Driver Name: ${assignData.data.selectedDriver.name}`);
    console.log(`Time taken: ${assignData.data.metrics.executionTimeMs}ms`);

  } catch (err) {
    console.error("Test flow failed:", err);
  }
}

testFlow();
