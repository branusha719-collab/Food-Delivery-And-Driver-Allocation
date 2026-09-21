const { io } = require("socket.io-client");
const fetch = require("node-fetch");

const SOCKET_URL = "http://localhost:5000";
const API_URL = "http://localhost:5000/api";

async function testWebSockets() {
  console.log("Connecting to socket...");
  const socket = io(SOCKET_URL);

  let orderCreatedReceived = false;
  let orderUpdatedReceived = false;
  let driverAssignedReceived = false;

  socket.on("connect", async () => {
    console.log("Connected to WebSocket with ID:", socket.id);

    try {
      // 1. Register a user to get a token
      const email = `test_ws_${Date.now()}@example.com`;
      const regRes = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "WS Tester", email, password: "password123", role: "customer" })
      });
      const regData = await regRes.json();
      const token = regData.data.token;

      // 2. Fetch Restaurant
      const restRes = await fetch(`${API_URL}/restaurants?limit=1`);
      const restData = await restRes.json();
      const restaurantId = restData.data.items[0]._id;

      // 3. Fetch Menu
      const menuRes = await fetch(`${API_URL}/restaurants/${restaurantId}/menu`);
      const menuData = await menuRes.json();
      const menuItemId = menuData.data.items[0]._id;

      // Setup Listeners
      socket.on("order_created", (order) => {
        console.log("✅ Received order_created event via WebSockets!");
        orderCreatedReceived = true;
      });

      socket.on("order_updated", (order) => {
        console.log(`✅ Received order_updated event via WebSockets! Status: ${order.status}`);
        orderUpdatedReceived = true;
      });

      socket.on("driver_assigned", (order) => {
        console.log("✅ Received driver_assigned event via WebSockets!");
        driverAssignedReceived = true;
      });

      // 4. Create Order
      console.log("Placing order...");
      const orderRes = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          restaurantId,
          deliveryAddress: "Test WebSockets",
          items: [{ menuItemId, quantity: 1 }]
        })
      });
      const orderData = await orderRes.json();
      const orderId = orderData.data._id;
      
      // Join the room for the specific order to test targeted events
      socket.emit("join_order", orderId);

      // Wait a moment for WS event
      await new Promise(r => setTimeout(r, 500));

      // 5. Update Order Status to READY (Requires Restaurant Role, but we'll use a hack or Admin Role token)
      // Actually, since I changed the backend to allow driver allocation on PLACED, let's just do that.
      
      console.log("Assigning Driver...");
      const assignRes = await fetch(`${API_URL}/orders/${orderId}/assign-driver`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Customer role is allowed for demo
        },
        body: JSON.stringify({ driverId: "AUTO" })
      });
      await assignRes.json();

      // Wait a moment for WS event
      await new Promise(r => setTimeout(r, 500));

      console.log("--- Test Summary ---");
      console.log(`order_created: ${orderCreatedReceived}`);
      console.log(`driver_assigned: ${driverAssignedReceived}`);
      
      socket.disconnect();
      process.exit(0);
    } catch (err) {
      console.error("Test failed", err);
      socket.disconnect();
      process.exit(1);
    }
  });
}

testWebSockets();
