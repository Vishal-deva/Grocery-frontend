const API_BASE = "https://grocery-1-hsz1.onrender.com";
// Cart in localStorage
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(product) {
  let cart = getCart();
  const existing = cart.find(item => item.productId === product.productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    product.quantity = 1;
    cart.push(product);
  }
  saveCart(cart);
  alert(`${product.productName} added to cart`);
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.productId !== productId);
  saveCart(cart);
  renderCartItems();
}

// Render cart items in cart.html
function renderCartItems() {
  const container = document.getElementById("cart-items");
  if (!container) return;
  const cart = getCart();
  container.innerHTML = "";
  if (cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }
  cart.forEach(item => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <h4>${item.productName}</h4>
      <p>Price: ₹${item.price}</p>
      <p>Quantity: ${item.quantity}</p>
      <button onclick="removeFromCart('${item.productId}')">Remove</button>
    `;
    container.appendChild(div);
  });
}

// Place order API call from cart.html checkout form
async function placeOrder(event) {
  event.preventDefault();
  const cart = getCart();
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  const customerId = document.getElementById("customerId").value;
  const customerName = document.getElementById("customerName").value;
  const customerEmail = document.getElementById("customerEmail").value;
  const customerAddress = document.getElementById("customerAddress").value;

  if (!customerName || !customerEmail || !customerAddress) {
    alert("Please fill all customer details.");
    return;
  }

  const items = cart.map(item => ({
    productId: item.productId,
    quantity: item.quantity,
    pricePerUnit: parseFloat(item.price),
    totalPrice: parseFloat(item.price) * item.quantity
  }));

  const totalAmount = items.reduce((sum, i) => sum + i.totalPrice, 0);

  const orderDto = {
    customerId,
    customerName,
    customerEmail,
    customerAddress,
    totalAmount,
    orderStatus: "Pending",
    items
  };

  try {
    const res = await fetch(`${API_BASE}/add-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderDto)
    });
    const data = await res.json();
    if (data.statusCode === "200") {
      alert("Order placed successfully!");
      localStorage.removeItem("cart");
      window.location.href = "index.html";
    } else {
      alert("Order failed: " + data.statusMessage);
    }
  } catch (e) {
    alert("Failed to place order.");
  }
}

// Register customer API call from register.html
async function registerCustomer(event) {
  event.preventDefault();
  const customerName = document.getElementById("customerName").value;
  const customerEmailId = document.getElementById("customerEmailId").value;
  const customerMobileNumber = document.getElementById("customerMobileNumber").value;
  const customerAddress = document.getElementById("customerAddress").value;
  const customerPinCode = document.getElementById("customerPinCode").value;

  if (!customerName || !customerEmailId || !customerMobileNumber || !customerAddress || !customerPinCode) {
    alert("Please fill all fields.");
    return;
  }

  const userDto = {
    customerName,
    customerEmailId,
    customerMobileNumber,
    customerAddress,
    customerPinCode
  };

  try {
    const res = await fetch(`${API_BASE}/save-customerDetails`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userDto)
    });
    const data = await res.json();
    alert(data.statusMessage || "Registered successfully!");
    if (data.statusCode === "200") {
      window.location.href = "index.html";
    }
  } catch {
    alert("Registration failed.");
  }
}
