
const { onCall } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();

exports.createOrder = onCall(async (request) => {
  const { customer, items, total } = request.data;

  // 1. Validate data (basic validation)
  if (!customer || !items || !total) {
    throw new onCall.HttpsError("invalid-argument", "Missing required order data.");
  }

  // 2. Generate a unique pickup code
  const pickupCodePrefix = "EB";
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  const pickupCode = `${pickupCodePrefix}-${randomNumber}`;

  // 3. Create the order object
  const newOrder = {
    customer,
    items,
    total,
    pickupCode,
    status: "nuevo",
    timestamp: new Date(),
  };

  // 4. Save to Firestore
  try {
    const writeResult = await getFirestore()
      .collection("orders")
      .add(newOrder);
    
    console.log(`Successfully created order ${writeResult.id} with code ${pickupCode}`);
    
    // 5. Return the pickup code to the client
    return { pickupCode };

  } catch (error) {
    console.error("Failed to save order to Firestore:", error);
    throw new onCall.HttpsError("internal", "Failed to create the order.");
  }
});
