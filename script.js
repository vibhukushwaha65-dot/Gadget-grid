/* =============================================================
   Gadget_ — script.js
   Offline POS + Admin Panel. Vanilla JS, localStorage.
   ============================================================= */

// =============================================================
// 1. SAMPLE DATA
// =============================================================
var SAMPLE_PRODUCTS = [
  { id:1,  name:"ElectroBook Pro 14",  category:"Laptops",     price:74999, stock:10, emoji:"💻", tagline:"Power Meets Portability", rating:5.0, reviews:1200 },
  { id:2,  name:"Zenith X1 5G",        category:"Smartphones", price:54999, stock:15, emoji:"📱", tagline:"Capture More Possibilities", rating:4.5, reviews:856 },
  { id:3,  name:"TuneFlow Pro",         category:"Headphones",  price:7999,  stock:20, emoji:"🎧", tagline:"Pure Sound, No Limits", rating:4.5, reviews:2100 },
  { id:4,  name:"FitNova Max",          category:"Smartwatches",price:12999, stock:18, emoji:"⌚", tagline:"Healthier, Happier, You", rating:4.5, reviews:1400 },
  { id:5,  name:"NovaPlay Controller",  category:"Gaming",      price:5999,  stock:25, emoji:"🎮", tagline:"Game Beyond Limits", rating:4.5, reviews:743 },
  { id:6,  name:"Smart LED Monitor",    category:"Accessories", price:28999, stock:8,  emoji:"🖥️", tagline:"Crystal Clear Display", rating:4.0, reviews:560 },
  { id:7,  name:"Wireless Keyboard",    category:"Accessories", price:3999,  stock:30, emoji:"⌨️", tagline:"Type with Freedom", rating:4.0, reviews:890 },
  { id:8,  name:"4K Action Camera",     category:"Cameras",     price:12999, stock:12, emoji:"📷", tagline:"Adventure Ready", rating:4.5, reviews:670 },
  { id:9,  name:"Smart Bulb (2 Pack)",  category:"Smart Home",  price:1999,  stock:40, emoji:"💡", tagline:"Light Up Your Life", rating:4.0, reviews:1500 },
  { id:10, name:"Portable SSD 1TB",     category:"Accessories", price:8999,  stock:14, emoji:"💾", tagline:"Speed in Your Pocket", rating:4.5, reviews:430 },
  { id:11, name:"HP Pavilion 15",       category:"Laptops",     price:48000, stock:7,  emoji:"💻", tagline:"Everyday Performance", rating:4.0, reviews:920 },
  { id:12, name:"Dell Inspiron 14",     category:"Laptops",     price:42000, stock:5,  emoji:"💻", tagline:"Reliable & Sleek", rating:4.0, reviews:780 },
  { id:13, name:"Samsung Galaxy M14",   category:"Smartphones", price:12000, stock:20, emoji:"📱", tagline:"Budget Powerhouse", rating:4.0, reviews:1100 },
  { id:14, name:"Redmi Note 13",        category:"Smartphones", price:15000, stock:15, emoji:"📱", tagline:"All-Day Battery", rating:4.5, reviews:2300 },
  { id:15, name:"iPhone SE",            category:"Smartphones", price:49000, stock:8,  emoji:"📱", tagline:"Compact Flagship", rating:4.5, reviews:3400 },
  { id:16, name:"boAt Rockerz 450",     category:"Headphones",  price:1500,  stock:30, emoji:"🎧", tagline:"Bass That Thumps", rating:4.0, reviews:4500 },
  { id:17, name:"Sony WH-CH520",        category:"Headphones",  price:4500,  stock:12, emoji:"🎧", tagline:"Wireless Comfort", rating:4.5, reviews:1800 },
  { id:18, name:"Fire-Boltt Phoenix",   category:"Smartwatches",price:2000,  stock:25, emoji:"⌚", tagline:"Track Your Goals", rating:4.0, reviews:3200 },
  { id:19, name:"Noise ColorFit Pro",   category:"Smartwatches",price:3500,  stock:18, emoji:"⌚", tagline:"Style Meets Fitness", rating:4.0, reviews:2700 },
  { id:20, name:"Smart Speaker Mini",   category:"Smart Home",  price:3499,  stock:22, emoji:"🔊", tagline:"Your Smart Assistant", rating:4.0, reviews:980 }
];

var SAMPLE_CUSTOMERS = [
  { id:1, name:"Amit Sharma",  email:"amit@example.com",  phone:"9876543210", points:120, totalPointsEarned:120, totalSpent:6000 },
  { id:2, name:"Priya Singh",  email:"priya@example.com", phone:"9876543211", points:45,  totalPointsEarned:45,  totalSpent:2500 },
  { id:3, name:"Rahul Verma",  email:"rahul@example.com", phone:"9876543212", points:300, totalPointsEarned:520, totalSpent:26000 }
];

var SAMPLE_REWARDS = [
  { id:1, name:"₹50 Discount",  pointsCost:100, discountValue:50 },
  { id:2, name:"₹150 Discount", pointsCost:250, discountValue:150 },
  { id:3, name:"₹350 Discount", pointsCost:500, discountValue:350 }
];

var DEFAULT_EARNING_RULE = { points:10, spend:500 }; // earn 10 pts per ₹500
var DEFAULT_STORE_CONFIG = {
  storeName: "Gadget_ Electronics",
  branch: "Main Branch",
  currency: "₹",
  goldDiscountPct: 5
};

// =============================================================
// 2. LOCALSTORAGE HELPERS
// =============================================================
function loadData(k, d) {
  var v = localStorage.getItem(k);
  return v ? JSON.parse(v) : d;
}

function saveData(k, v) {
  localStorage.setItem(k, JSON.stringify(v));
}

function initData() {
  if (!localStorage.getItem("products"))    saveData("products", SAMPLE_PRODUCTS);
  if (!localStorage.getItem("customers"))   saveData("customers", SAMPLE_CUSTOMERS);
  if (!localStorage.getItem("orders"))      saveData("orders", []);
  if (!localStorage.getItem("redemptions")) saveData("redemptions", []);
  if (!localStorage.getItem("earningRule")) saveData("earningRule", DEFAULT_EARNING_RULE);
  if (!localStorage.getItem("storeConfig")) saveData("storeConfig", DEFAULT_STORE_CONFIG);
  if (!localStorage.getItem("rewards"))     saveData("rewards", SAMPLE_REWARDS);
  if (!localStorage.getItem("auditLog")) {
    saveData("auditLog", [
      { date: new Date().toLocaleString("en-IN"), action: "System Initialized", user: "Admin", details: "Default products, rules, and store data loaded" }
    ]);
  }
}

function getEarningRule() { return loadData("earningRule", DEFAULT_EARNING_RULE); }
function getStoreConfig() { return loadData("storeConfig", DEFAULT_STORE_CONFIG); }
function calcPoints(total) {
  var r = getEarningRule();
  if (!r.spend || r.spend <= 0) return 0;
  return Math.floor(total / r.spend) * (r.points || 0);
}

function getTier(tp) {
  if (tp >= 500) return "Gold";
  if (tp >= 200) return "Silver";
  return "Bronze";
}

function getCustomerById(id) {
  var c = loadData("customers", []);
  for (var i = 0; i < c.length; i++) {
    if (c[i].id === id) return c[i];
  }
  return null;
}

function addAuditEntry(action, details) {
  var log = loadData("auditLog", []);
  log.push({
    date: new Date().toLocaleString("en-IN"),
    action: action,
    user: "Admin",
    details: details
  });
  saveData("auditLog", log);
}

function fmtPrice(n) {
  var cfg = getStoreConfig();
  var sym = (cfg && cfg.currency) ? cfg.currency : "₹";
  return sym + Number(n || 0).toLocaleString("en-IN");
}

// =============================================================
// 3. TOP-RIGHT STAFF / ADMIN DROPDOWN CONTROLS
// =============================================================
function toggleStaffDropdown(e) {
  if (e) e.stopPropagation();
  var dd = document.getElementById("staff-dropdown");
  if (dd) dd.classList.toggle("hidden");
}

function toggleAdminStaffDropdown(e) {
  if (e) e.stopPropagation();
  var dd = document.getElementById("admin-staff-dropdown");
  if (dd) dd.classList.toggle("hidden");
}

function handleStaffLogout() {
  if (confirm("Log out of current session?")) {
    alert("Session logged out. Resuming store clerk session.");
    var dd = document.getElementById("staff-dropdown");
    if (dd) dd.classList.add("hidden");
  }
}

function handleAdminLogout() {
  if (confirm("Log out of Admin Panel?")) {
    window.location.href = "index.html";
  }
}

// Global click handler to close dropdowns and search popups
document.addEventListener("click", function(e) {
  var sd = document.getElementById("staff-dropdown");
  var sb = document.getElementById("staff-admin-btn");
  if (sd && !sd.classList.contains("hidden")) {
    if (!sd.contains(e.target) && (!sb || !sb.contains(e.target))) {
      sd.classList.add("hidden");
    }
  }

  var asd = document.getElementById("admin-staff-dropdown");
  var asb = document.getElementById("admin-staff-btn");
  if (asd && !asd.classList.contains("hidden")) {
    if (!asd.contains(e.target) && (!asb || !asb.contains(e.target))) {
      asd.classList.add("hidden");
    }
  }

  var sr = document.getElementById("cust-search-results");
  var si = document.getElementById("cust-search-input");
  if (sr && !sr.contains(e.target) && e.target !== si) {
    sr.classList.add("hidden");
  }
});

// =============================================================
// 4. POS SECTION NAVIGATION
// =============================================================
var posCart = [];
var selectedCustomerId = null;
var posCategory = "All";
var isCompletingPurchase = false; // Prevents duplicate double-click orders

function showPosSection(name) {
  var ids = ["billing", "pos-customers", "pos-products", "pos-transactions", "pos-rewards"];
  var titles = {
    "billing": "Billing",
    "pos-customers": "Customers",
    "pos-products": "Products",
    "pos-transactions": "Transactions",
    "pos-rewards": "Rewards"
  };
  for (var i = 0; i < ids.length; i++) {
    var el = document.getElementById("section-" + ids[i]);
    if (el) {
      if (ids[i] === name) el.classList.remove("hidden");
      else el.classList.add("hidden");
    }
  }
  var pageTitle = document.getElementById("pos-page-title");
  if (pageTitle) pageTitle.textContent = titles[name] || "Billing";

  // Update sidebar active buttons
  var btns = document.querySelectorAll(".pos-sidebar .sidebar-btn[data-section]");
  for (var j = 0; j < btns.length; j++) {
    btns[j].classList.toggle("active", btns[j].getAttribute("data-section") === name);
  }

  if (name === "billing") renderPosProducts();
  if (name === "pos-customers") renderPosCustomerList();
  if (name === "pos-products") renderPosProductTable();
  if (name === "pos-transactions") renderPosTransactions();
  if (name === "pos-rewards") renderPosRewards();
}

// =============================================================
// 5. BILLING — PRODUCT GRID
// =============================================================
function setPosCategory(cat, btn) {
  posCategory = cat;
  var pills = document.querySelectorAll(".cat-pill");
  for (var i = 0; i < pills.length; i++) pills[i].classList.remove("active");
  if (btn) btn.classList.add("active");
  renderPosProducts();
}

function renderPosProducts() {
  var grid = document.getElementById("pos-product-grid");
  if (!grid) return;
  var products = loadData("products", []);
  var searchInput = document.getElementById("pos-search");
  var search = (searchInput ? searchInput.value : "").toLowerCase().trim();
  grid.innerHTML = "";
  var count = 0;

  for (var i = 0; i < products.length; i++) {
    var p = products[i];
    if (posCategory !== "All" && p.category !== posCategory) continue;
    if (search && p.name.toLowerCase().indexOf(search) === -1 && p.category.toLowerCase().indexOf(search) === -1) continue;
    count++;
    var oos = p.stock <= 0;
    var div = document.createElement("div");
    div.className = "pos-prod-card" + (oos ? " out-of-stock" : "");
    div.onclick = (function(pid) {
      return function() { addToPos(pid); };
    })(p.id);

    var mediaHtml = p.image
      ? '<div class="pos-prod-media"><img src="' + p.image + '" alt="' + p.name + '" class="pos-prod-img" onerror="this.style.display=\'none\';var f=this.nextElementSibling;if(f)f.style.display=\'flex\';"><div class="pos-prod-emoji fallback" style="display:none;">' + (p.emoji || "📦") + '</div></div>'
      : '<div class="pos-prod-emoji">' + (p.emoji || "📦") + '</div>';

    div.innerHTML =
      mediaHtml +
      '<div class="pos-prod-name" title="' + p.name + '">' + p.name + '</div>' +
      '<div class="pos-prod-cat">' + p.category + '</div>' +
      '<div class="pos-prod-price">' + fmtPrice(p.price) + '</div>' +
      '<div class="pos-prod-stock' + (p.stock <= 3 ? " low" : "") + '">' +
        (oos ? "Out of stock" : "Stock: " + p.stock) +
      '</div>';
    grid.appendChild(div);
  }

  if (count === 0) {
    grid.innerHTML = '<p class="empty-msg" style="grid-column:1/-1">No products found matching criteria.</p>';
  }
}

// =============================================================
// 6. BILLING — CART
// =============================================================
function addToPos(productId) {
  var products = loadData("products", []);
  var product = null;
  for (var i = 0; i < products.length; i++) {
    if (products[i].id === productId) { product = products[i]; break; }
  }
  if (!product || product.stock <= 0) return;

  var found = false;
  for (var j = 0; j < posCart.length; j++) {
    if (posCart[j].productId === productId) {
      if (posCart[j].quantity < product.stock) {
        posCart[j].quantity++;
      } else {
        alert("Maximum available stock (" + product.stock + ") reached.");
      }
      found = true;
      break;
    }
  }
  if (!found) {
    posCart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }
  renderPosCart();
}

function renderPosCart() {
  var container = document.getElementById("pos-cart-items");
  var countEl = document.getElementById("pos-cart-count");
  if (!container) return;
  container.innerHTML = "";

  if (posCart.length === 0) {
    container.innerHTML = '<p class="empty-msg">No items added yet.</p>';
    if (countEl) countEl.textContent = "0";
    updatePosTotals();
    return;
  }

  var totalQty = 0;
  for (var i = 0; i < posCart.length; i++) {
    var item = posCart[i];
    totalQty += item.quantity;
    var row = document.createElement("div");
    row.className = "cart-row";
    row.innerHTML =
      '<span class="cart-row-name">' + item.name + '</span>' +
      '<span class="cart-row-price">' + fmtPrice(item.price * item.quantity) + '</span>' +
      '<div class="cart-qty-controls">' +
        '<button type="button" onclick="changeQtyPos(' + i + ',-1)">−</button>' +
        '<span>' + item.quantity + '</span>' +
        '<button type="button" onclick="changeQtyPos(' + i + ',1)">+</button>' +
        '<button type="button" class="cart-remove" onclick="removeFromPos(' + i + ')">✕</button>' +
      '</div>';
    container.appendChild(row);
  }

  if (countEl) countEl.textContent = totalQty;
  updatePosTotals();
}

function changeQtyPos(idx, delta) {
  if (!posCart[idx]) return;
  posCart[idx].quantity += delta;
  var products = loadData("products", []);
  for (var i = 0; i < products.length; i++) {
    if (products[i].id === posCart[idx].productId) {
      if (posCart[idx].quantity > products[i].stock) {
        posCart[idx].quantity = products[i].stock;
        alert("Only " + products[i].stock + " available in stock.");
      }
      break;
    }
  }
  if (posCart[idx].quantity <= 0) posCart.splice(idx, 1);
  renderPosCart();
}

function removeFromPos(idx) {
  posCart.splice(idx, 1);
  renderPosCart();
}

function updatePosTotals() {
  var subtotal = 0;
  for (var i = 0; i < posCart.length; i++) {
    subtotal += posCart[i].price * posCart[i].quantity;
  }

  // Tier discount benefit
  var discount = 0;
  if (selectedCustomerId) {
    var customer = getCustomerById(selectedCustomerId);
    if (customer && getTier(customer.totalPointsEarned) === "Gold") {
      var cfg = getStoreConfig();
      var pct = (cfg && cfg.goldDiscountPct) ? cfg.goldDiscountPct : 5;
      discount = Math.round(subtotal * (pct / 100));
    }
  }

  var total = Math.max(0, subtotal - discount);
  var pts = calcPoints(total);

  var subEl = document.getElementById("pos-subtotal");
  var discEl = document.getElementById("pos-discount");
  var totEl = document.getElementById("pos-total");
  var ptsPrev = document.getElementById("pos-points-preview");
  var buyBtn = document.getElementById("btn-complete-purchase");

  if (subEl) subEl.textContent = fmtPrice(subtotal);
  if (discEl) discEl.textContent = "-" + fmtPrice(discount);
  if (totEl) totEl.innerHTML = "<strong>" + fmtPrice(total) + "</strong>";
  if (ptsPrev) ptsPrev.textContent = "Points to earn: " + pts;
  if (buyBtn) buyBtn.disabled = !(posCart.length > 0 && selectedCustomerId);
}

// =============================================================
// 7. BILLING — CUSTOMER LOOKUP
// =============================================================
function searchCustomerLookup() {
  var input = document.getElementById("cust-search-input");
  if (!input) return;
  var q = input.value.toLowerCase().trim();
  var results = document.getElementById("cust-search-results");
  if (!results) return;

  if (q.length === 0) {
    results.classList.add("hidden");
    results.innerHTML = "";
    return;
  }

  var customers = loadData("customers", []);
  var matches = [];
  for (var i = 0; i < customers.length; i++) {
    var c = customers[i];
    if (c.name.toLowerCase().indexOf(q) !== -1 ||
        (c.phone && c.phone.indexOf(q) !== -1) ||
        String(c.id) === q ||
        (c.email && c.email.toLowerCase().indexOf(q) !== -1)) {
      matches.push(c);
    }
  }

  if (matches.length === 0) {
    results.innerHTML = '<div class="cust-result-item" style="color:#a3a3a3">No customers found</div>';
    results.classList.remove("hidden");
    return;
  }

  results.innerHTML = "";
  for (var j = 0; j < matches.length; j++) {
    var div = document.createElement("div");
    div.className = "cust-result-item";
    div.textContent = matches[j].name + " (" + matches[j].phone + ") — " + matches[j].points + " pts";
    div.onclick = (function(cid) {
      return function() { selectCustomer(cid); };
    })(matches[j].id);
    results.appendChild(div);
  }
  results.classList.remove("hidden");
}

function selectCustomer(id) {
  selectedCustomerId = id;
  var c = getCustomerById(id);
  if (!c) return;

  var results = document.getElementById("cust-search-results");
  if (results) results.classList.add("hidden");

  var input = document.getElementById("cust-search-input");
  if (input) input.value = "";

  var selInfo = document.getElementById("selected-customer-info");
  if (selInfo) selInfo.classList.remove("hidden");

  var nameEl = document.getElementById("sel-cust-name");
  var tierEl = document.getElementById("sel-cust-tier");
  var ptsEl = document.getElementById("sel-cust-points");
  var phoneEl = document.getElementById("sel-cust-phone");

  if (nameEl) nameEl.textContent = c.name;
  if (tierEl) tierEl.textContent = getTier(c.totalPointsEarned);
  if (ptsEl) ptsEl.textContent = c.points + " pts";
  if (phoneEl) phoneEl.textContent = c.phone;

  updatePosTotals();
}

function clearSelectedCustomer() {
  selectedCustomerId = null;
  var selInfo = document.getElementById("selected-customer-info");
  if (selInfo) selInfo.classList.add("hidden");
  updatePosTotals();
}

// =============================================================
// 8. CUSTOMER REGISTRATION MODAL
// =============================================================
function openNewCustomerModal() {
  var m = document.getElementById("new-customer-modal");
  if (m) m.classList.remove("hidden");
}

function closeNewCustomerModal() {
  var m = document.getElementById("new-customer-modal");
  if (m) m.classList.add("hidden");
}

function registerNewCustomer(e) {
  e.preventDefault();
  var nameEl = document.getElementById("new-cust-name");
  var phoneEl = document.getElementById("new-cust-phone");

  var name = nameEl ? nameEl.value.trim() : "";
  var phone = phoneEl ? phoneEl.value.trim() : "";

  if (!name || !phone) {
    alert("Customer Name and Phone Number are required.");
    return;
  }

  var customers = loadData("customers", []);
  for (var i = 0; i < customers.length; i++) {
    if (customers[i].phone === phone) {
      alert("A customer with phone number " + phone + " is already registered.");
      return;
    }
  }

  var newId = 1;
  for (var j = 0; j < customers.length; j++) {
    if (customers[j].id >= newId) newId = customers[j].id + 1;
  }

  var newCust = {
    id: newId,
    name: name,
    email: "",
    phone: phone,
    points: 0,
    totalPointsEarned: 0,
    totalSpent: 0
  };

  customers.push(newCust);
  saveData("customers", customers);
  addAuditEntry("Customer Registered", "New customer: " + name + " (" + phone + ")");

  closeNewCustomerModal();
  if (nameEl) nameEl.value = "";
  if (phoneEl) phoneEl.value = "";

  selectCustomer(newId);
  alert("Customer registered successfully: " + name);
}

// Admin customer modal wrappers
function openAdminNewCustomerModal() {
  var m = document.getElementById("admin-new-customer-modal");
  if (m) m.classList.remove("hidden");
}

function closeAdminNewCustomerModal() {
  var m = document.getElementById("admin-new-customer-modal");
  if (m) m.classList.add("hidden");
}

function handleAdminRegisterCustomer(e) {
  e.preventDefault();
  var nameEl = document.getElementById("admin-new-cust-name");
  var phoneEl = document.getElementById("admin-new-cust-phone");

  var name = nameEl ? nameEl.value.trim() : "";
  var phone = phoneEl ? phoneEl.value.trim() : "";

  if (!name || !phone) {
    alert("Customer Name and Phone Number are required.");
    return;
  }

  var customers = loadData("customers", []);
  for (var i = 0; i < customers.length; i++) {
    if (customers[i].phone === phone) {
      alert("A customer with phone number " + phone + " already exists.");
      return;
    }
  }

  var newId = 1;
  for (var j = 0; j < customers.length; j++) {
    if (customers[j].id >= newId) newId = customers[j].id + 1;
  }

  customers.push({
    id: newId,
    name: name,
    email: "",
    phone: phone,
    points: 0,
    totalPointsEarned: 0,
    totalSpent: 0
  });

  saveData("customers", customers);
  addAuditEntry("Customer Registered (Admin)", name + " (" + phone + ")");
  closeAdminNewCustomerModal();
  if (nameEl) nameEl.value = "";
  if (phoneEl) phoneEl.value = "";

  renderAdminCustomers();
  refreshAdminDashboard();
  alert("Customer registered: " + name);
}

// =============================================================
// 9. COMPLETE PURCHASE (Checkout in Billing POS)
// =============================================================
function completePurchase() {
  if (isCompletingPurchase) return; // Prevent double submissions
  if (posCart.length === 0) {
    alert("Cart is empty.");
    return;
  }
  if (!selectedCustomerId) {
    alert("Please select a customer before completing purchase.");
    return;
  }

  var customer = getCustomerById(selectedCustomerId);
  if (!customer) {
    alert("Customer not found.");
    return;
  }

  isCompletingPurchase = true;

  var subtotal = 0;
  for (var i = 0; i < posCart.length; i++) {
    subtotal += posCart[i].price * posCart[i].quantity;
  }

  var discount = 0;
  if (getTier(customer.totalPointsEarned) === "Gold") {
    var cfg = getStoreConfig();
    var pct = (cfg && cfg.goldDiscountPct) ? cfg.goldDiscountPct : 5;
    discount = Math.round(subtotal * (pct / 100));
  }

  var total = Math.max(0, subtotal - discount);
  var pointsEarned = calcPoints(total);

  var paymentMethod = (document.getElementById("pos-payment") || {}).value || "Cash";
  var note = ((document.getElementById("pos-note") || {}).value || "").trim();

  var orders = loadData("orders", []);
  var orderId = 1000 + orders.length + 1;

  var order = {
    id: orderId,
    customerId: customer.id,
    customerName: customer.name,
    customerPhone: customer.phone,
    items: [],
    subtotal: subtotal,
    discount: discount,
    total: total,
    pointsEarned: pointsEarned,
    payment: paymentMethod,
    note: note,
    date: new Date().toLocaleString("en-IN"),
    staff: "Admin",
    status: "Completed"
  };

  for (var j = 0; j < posCart.length; j++) {
    order.items.push({
      productId: posCart[j].productId,
      name: posCart[j].name,
      price: posCart[j].price,
      quantity: posCart[j].quantity
    });
  }

  // Deduct inventory stock
  var products = loadData("products", []);
  for (var k = 0; k < posCart.length; k++) {
    for (var m = 0; m < products.length; m++) {
      if (products[m].id === posCart[k].productId) {
        products[m].stock -= posCart[k].quantity;
        if (products[m].stock < 0) products[m].stock = 0;
        break;
      }
    }
  }
  saveData("products", products);

  // Update customer loyalty points and spend
  var customers = loadData("customers", []);
  for (var n = 0; n < customers.length; n++) {
    if (customers[n].id === customer.id) {
      customers[n].points += pointsEarned;
      customers[n].totalPointsEarned += pointsEarned;
      customers[n].totalSpent += total;
      break;
    }
  }
  saveData("customers", customers);

  // Save transaction
  orders.push(order);
  saveData("orders", orders);

  addAuditEntry("Purchase Completed", "Txn #" + orderId + " | " + customer.name + " | Total " + fmtPrice(total) + " | Earned: " + pointsEarned + " pts");

  // Show purchase confirmation modal
  var confBody = document.getElementById("confirm-modal-body");
  if (confBody) {
    var itemsHtml = "";
    for (var q = 0; q < order.items.length; q++) {
      var it = order.items[q];
      itemsHtml += "<tr><td>" + it.name + "</td><td>×" + it.quantity + "</td><td>" + fmtPrice(it.price * it.quantity) + "</td></tr>";
    }
    confBody.innerHTML =
      '<table class="data-table"><thead><tr><th>Item</th><th>Qty</th><th>Amount</th></tr></thead><tbody>' +
      itemsHtml + '</tbody></table>' +
      (order.discount > 0 ? '<p style="color:#16a34a;margin-top:8px;"><strong>Member Discount:</strong> -' + fmtPrice(order.discount) + '</p>' : '') +
      '<p style="margin-top:6px"><strong>Total Paid:</strong> ' + fmtPrice(order.total) + '</p>' +
      '<p><strong>Payment Method:</strong> ' + order.payment + '</p>' +
      '<p><strong>Customer:</strong> ' + order.customerName + '</p>' +
      '<p style="color:#d42b2b;"><strong>Loyalty Points Earned:</strong> +' + order.pointsEarned + ' pts</p>' +
      '<p style="font-size:12px;color:#737373;margin-top:10px;">Transaction ID #' + order.id + ' — ' + order.date + '</p>';
    var confModal = document.getElementById("confirm-modal");
    if (confModal) confModal.classList.remove("hidden");
  }

  // Clear cart and note
  posCart = [];
  var noteInput = document.getElementById("pos-note");
  if (noteInput) noteInput.value = "";

  renderPosCart();
  renderPosProducts();
  selectCustomer(selectedCustomerId);
  isCompletingPurchase = false;
}

function closeConfirmModal() {
  var confModal = document.getElementById("confirm-modal");
  if (confModal) confModal.classList.add("hidden");
}

// =============================================================
// 10. POS — CUSTOMER LIST & DETAIL
// =============================================================
function renderPosCustomerList() {
  var tbody = document.getElementById("pos-customer-tbody");
  if (!tbody) return;
  var customers = loadData("customers", []);
  var q = ((document.getElementById("pos-cust-filter") || {}).value || "").toLowerCase().trim();
  tbody.innerHTML = "";

  for (var i = 0; i < customers.length; i++) {
    var c = customers[i];
    if (q && c.name.toLowerCase().indexOf(q) === -1 &&
        (c.phone && c.phone.indexOf(q) === -1) &&
        (c.email && c.email.toLowerCase().indexOf(q) === -1) &&
        String(c.id) !== q) continue;

    var tr = document.createElement("tr");
    tr.innerHTML =
      "<td>" + c.id + "</td>" +
      "<td><strong>" + c.name + "</strong></td>" +
      "<td>" + c.phone + "</td>" +
      "<td>" + c.email + "</td>" +
      "<td>" + getTier(c.totalPointsEarned) + "</td>" +
      "<td>" + c.points + "</td>" +
      "<td>" + fmtPrice(c.totalSpent) + "</td>" +
      '<td><button type="button" class="btn-sm btn-outline" onclick="viewPosCustomerDetail(' + c.id + ')">View</button></td>';
    tbody.appendChild(tr);
  }
}

function viewPosCustomerDetail(id) {
  var c = getCustomerById(id);
  if (!c) return;
  var panel = document.getElementById("pos-cust-detail");
  if (!panel) return;
  panel.classList.remove("hidden");
  document.getElementById("pos-cust-detail-name").textContent = c.name + " (Customer #" + c.id + ")";

  var body = document.getElementById("pos-cust-detail-body");
  var orders = loadData("orders", []);
  var custOrders = [];
  for (var i = 0; i < orders.length; i++) {
    if (orders[i].customerId === id) custOrders.push(orders[i]);
  }

  var ordersTable = "";
  if (custOrders.length === 0) {
    ordersTable = '<p class="empty-msg">No in-store purchases on record.</p>';
  } else {
    ordersTable = '<h3 style="margin-top:14px;font-size:14px;">Purchase Records</h3><table class="data-table"><thead><tr><th>Order #</th><th>Date</th><th>Total</th><th>Points</th><th>Payment</th></tr></thead><tbody>';
    for (var j = custOrders.length - 1; j >= 0; j--) {
      var o = custOrders[j];
      ordersTable += "<tr><td>#" + o.id + "</td><td>" + o.date + "</td><td>" + fmtPrice(o.total) + "</td><td>+" + o.pointsEarned + "</td><td>" + o.payment + "</td></tr>";
    }
    ordersTable += "</tbody></table>";
  }

  body.innerHTML =
    "<p><strong>Phone:</strong> " + c.phone + "</p>" +
    "<p><strong>Email:</strong> " + c.email + "</p>" +
    "<p><strong>Membership Tier:</strong> " + getTier(c.totalPointsEarned) + "</p>" +
    "<p><strong>Current Point Balance:</strong> " + c.points + " pts</p>" +
    "<p><strong>Total Lifetime Spent:</strong> " + fmtPrice(c.totalSpent) + "</p>" +
    ordersTable;
}

function closePosCustomerDetail() {
  var panel = document.getElementById("pos-cust-detail");
  if (panel) panel.classList.add("hidden");
}

// =============================================================
// 11. POS — PRODUCT TABLE
// =============================================================
function renderPosProductTable() {
  var tbody = document.getElementById("pos-product-tbody");
  if (!tbody) return;
  var products = loadData("products", []);
  tbody.innerHTML = "";

  for (var i = 0; i < products.length; i++) {
    var p = products[i];
    var tr = document.createElement("tr");
    tr.innerHTML =
      "<td>" + p.id + "</td>" +
      "<td>" + (p.emoji || "📦") + " " + p.name + "</td>" +
      "<td>" + p.category + "</td>" +
      "<td>" + fmtPrice(p.price) + "</td>" +
      "<td" + (p.stock <= 3 ? ' style="color:var(--red);font-weight:600;"' : "") + ">" + p.stock + "</td>" +
      '<td><button type="button" class="btn-danger" onclick="deleteProduct(' + p.id + ')">Delete</button></td>';
    tbody.appendChild(tr);
  }
}

// =============================================================
// 12. POS — TRANSACTIONS
// =============================================================
function renderPosTransactions() {
  var tbody = document.getElementById("pos-txn-tbody");
  if (!tbody) return;
  var orders = loadData("orders", []);
  var filterInput = document.getElementById("pos-txn-filter");
  var q = (filterInput ? filterInput.value : "").toLowerCase().trim();
  tbody.innerHTML = "";

  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-msg">No transactions recorded yet.</td></tr>';
    return;
  }

  for (var i = orders.length - 1; i >= 0; i--) {
    var o = orders[i];
    if (q && o.customerName.toLowerCase().indexOf(q) === -1 && String(o.id).indexOf(q) === -1) continue;
    var itemsStr = [];
    for (var j = 0; j < o.items.length; j++) {
      itemsStr.push(o.items[j].name + " ×" + o.items[j].quantity);
    }
    var tr = document.createElement("tr");
    tr.innerHTML =
      "<td>#" + o.id + "</td>" +
      "<td>" + o.date + "</td>" +
      "<td>" + o.customerName + "</td>" +
      "<td>" + itemsStr.join(", ") + "</td>" +
      "<td>" + fmtPrice(o.total) + "</td>" +
      "<td>+" + o.pointsEarned + "</td>" +
      "<td>" + o.payment + "</td>";
    tbody.appendChild(tr);
  }
}

// =============================================================
// 13. POS — REWARDS VIEW
// =============================================================
function renderPosRewards() {
  var rule = getEarningRule();
  var ruleDisp = document.getElementById("earning-rule-display");
  if (ruleDisp) {
    ruleDisp.textContent = "Earn " + rule.points + " point(s) for every " + fmtPrice(rule.spend) + " spent.";
  }
  var redemptions = loadData("redemptions", []);
  var log = document.getElementById("pos-redemption-log");
  if (!log) return;
  if (redemptions.length === 0) {
    log.innerHTML = '<p class="empty-msg">No redemptions yet.</p>';
    return;
  }
  var h = '<table class="data-table"><thead><tr><th>Date</th><th>Customer</th><th>Reward</th><th>Points Used</th></tr></thead><tbody>';
  for (var i = redemptions.length - 1; i >= 0; i--) {
    var r = redemptions[i];
    h += "<tr><td>" + r.date + "</td><td>" + r.customerName + "</td><td>" + r.rewardName + "</td><td>" + r.pointsUsed + "</td></tr>";
  }
  h += "</tbody></table>";
  log.innerHTML = h;
}

// =============================================================
// 14. ADMIN PANEL — SECTION SWITCHING
// =============================================================
function showAdminSection(name) {
  var sections = ["dashboard", "customers", "products", "transactions", "reports", "settings", "audit"];
  var titles = {
    "dashboard": "Dashboard",
    "customers": "Customer Management",
    "products": "Product Management",
    "transactions": "Sales & Transactions",
    "reports": "Sales & Activity Reports",
    "settings": "Settings",
    "audit": "Audit History Log"
  };

  for (var i = 0; i < sections.length; i++) {
    var el = document.getElementById("admin-" + sections[i]);
    if (el) {
      if (sections[i] === name) el.classList.remove("hidden");
      else el.classList.add("hidden");
    }
  }

  var pageTitle = document.getElementById("admin-page-title");
  if (pageTitle) pageTitle.textContent = titles[name] || "Admin Console";

  var btns = document.querySelectorAll(".admin-sidebar-dark .sidebar-btn[data-section]");
  for (var j = 0; j < btns.length; j++) {
    btns[j].classList.toggle("active", btns[j].getAttribute("data-section") === "admin-" + name);
  }

  if (name === "dashboard") refreshAdminDashboard();
  if (name === "customers") renderAdminCustomers();
  if (name === "products") renderAdminProducts();
  if (name === "transactions") renderAdminTransactions();
  if (name === "reports") renderAdminReports();
  if (name === "settings") {
    loadLoyaltySettings();
    renderAdminRewards();
  }
  if (name === "audit") renderAuditLog();
}

// =============================================================
// 15. ADMIN — DASHBOARD
// =============================================================
function refreshAdminDashboard() {
  var customers = loadData("customers", []);
  var orders = loadData("orders", []);
  var redemptions = loadData("redemptions", []);

  var totalSales = 0;
  var totalPoints = 0;
  for (var i = 0; i < orders.length; i++) {
    totalSales += orders[i].total;
    totalPoints += orders[i].pointsEarned;
  }

  var cEl = document.getElementById("stat-customers");
  var oEl = document.getElementById("stat-orders");
  var sEl = document.getElementById("stat-sales");
  var pEl = document.getElementById("stat-points");
  var rEl = document.getElementById("stat-redeemed");

  if (cEl) cEl.textContent = customers.length;
  if (oEl) oEl.textContent = orders.length;
  if (sEl) sEl.textContent = fmtPrice(totalSales);
  if (pEl) pEl.textContent = totalPoints.toLocaleString("en-IN");
  if (rEl) rEl.textContent = redemptions.length;

  // Recent transactions table
  var cont = document.getElementById("admin-recent-orders");
  if (cont) {
    if (orders.length === 0) {
      cont.innerHTML = '<p class="empty-msg">No transactions yet.</p>';
    } else {
      var h = '<table class="data-table"><thead><tr><th>Txn #</th><th>Customer</th><th>Total</th><th>Date</th></tr></thead><tbody>';
      var start = Math.max(0, orders.length - 5);
      for (var j = orders.length - 1; j >= start; j--) {
        h += "<tr><td>#" + orders[j].id + "</td><td>" + orders[j].customerName + "</td><td>" + fmtPrice(orders[j].total) + "</td><td>" + orders[j].date + "</td></tr>";
      }
      h += "</tbody></table>";
      cont.innerHTML = h;
    }
  }

  // Low stock alert box
  var lsCont = document.getElementById("admin-low-stock");
  if (lsCont) {
    var products = loadData("products", []);
    var lowStock = [];
    for (var k = 0; k < products.length; k++) {
      if (products[k].stock <= 3) lowStock.push(products[k]);
    }
    if (lowStock.length === 0) {
      lsCont.innerHTML = '<p class="empty-msg" style="color:#16a34a;">All products are adequately stocked.</p>';
    } else {
      var lh = '<table class="data-table"><thead><tr><th>Product</th><th>Remaining Stock</th><th>Action</th></tr></thead><tbody>';
      for (var l = 0; l < lowStock.length; l++) {
        lh += '<tr><td>' + lowStock[l].name + '</td><td style="color:var(--red);font-weight:600;">' + lowStock[l].stock + ' units</td><td><button class="btn-sm btn-outline" onclick="editProduct(' + lowStock[l].id + ')">Restock</button></td></tr>';
      }
      lh += "</tbody></table>";
      lsCont.innerHTML = lh;
    }
  }
}

// =============================================================
// 16. ADMIN — CUSTOMERS
// =============================================================
function renderAdminCustomers() {
  var tbody = document.getElementById("admin-customer-tbody");
  if (!tbody) return;
  var customers = loadData("customers", []);
  var q = ((document.getElementById("admin-customer-search") || {}).value || "").toLowerCase().trim();
  tbody.innerHTML = "";

  var detailPanel = document.getElementById("customer-detail-panel");
  if (detailPanel) detailPanel.classList.add("hidden");

  for (var i = 0; i < customers.length; i++) {
    var c = customers[i];
    if (q && c.name.toLowerCase().indexOf(q) === -1 &&
        (c.email && c.email.toLowerCase().indexOf(q) === -1) &&
        (c.phone && c.phone.indexOf(q) === -1) &&
        String(c.id) !== q) continue;

    var tr = document.createElement("tr");
    tr.innerHTML =
      "<td>" + c.id + "</td>" +
      "<td><strong>" + c.name + "</strong></td>" +
      "<td>" + (c.email || "—") + "</td>" +
      "<td>" + c.phone + "</td>" +
      "<td>" + c.points + "</td>" +
      "<td><span class=\"tier-tag\">" + getTier(c.totalPointsEarned) + "</span></td>" +
      "<td>" + fmtPrice(c.totalSpent) + "</td>" +
      '<td><button type="button" class="btn-sm btn-outline" onclick="viewCustomerDetail(' + c.id + ')">View Profile</button></td>';
    tbody.appendChild(tr);
  }
}

function viewCustomerDetail(id) {
  var c = getCustomerById(id);
  if (!c) return;
  var panel = document.getElementById("customer-detail-panel");
  if (!panel) return;
  panel.classList.remove("hidden");

  document.getElementById("detail-customer-name").textContent = c.name + " — Customer Profile (#" + c.id + ")";
  var infoHtml = "";
  if (c.email) infoHtml += "<p><strong>Email:</strong> " + c.email + "</p>";
  infoHtml +=
    "<p><strong>Phone:</strong> " + c.phone + "</p>" +
    "<p><strong>Active Points:</strong> " + c.points + " pts</p>" +
    "<p><strong>Lifetime Points Earned:</strong> " + c.totalPointsEarned + " pts</p>" +
    "<p><strong>Tier:</strong> " + getTier(c.totalPointsEarned) + "</p>" +
    "<p><strong>Total Lifetime Spend:</strong> " + fmtPrice(c.totalSpent) + "</p>";
  document.getElementById("detail-customer-info").innerHTML = infoHtml;

  var orders = loadData("orders", []);
  var custOrders = [];
  for (var i = 0; i < orders.length; i++) {
    if (orders[i].customerId === id) custOrders.push(orders[i]);
  }

  var div = document.getElementById("detail-customer-orders");
  if (!div) return;
  if (custOrders.length === 0) {
    div.innerHTML = '<p class="empty-msg">No purchase transactions on file.</p>';
  } else {
    var h = '<table class="data-table"><thead><tr><th>Order #</th><th>Date</th><th>Items</th><th>Total</th><th>Points</th><th>Payment</th></tr></thead><tbody>';
    for (var j = custOrders.length - 1; j >= 0; j--) {
      var o = custOrders[j];
      var itNames = [];
      for (var k = 0; k < o.items.length; k++) itNames.push(o.items[k].name + " ×" + o.items[k].quantity);
      h += "<tr><td>#" + o.id + "</td><td>" + o.date + "</td><td>" + itNames.join(", ") + "</td><td>" + fmtPrice(o.total) + "</td><td>+" + o.pointsEarned + "</td><td>" + o.payment + "</td></tr>";
    }
    h += "</tbody></table>";
    div.innerHTML = h;
  }
}

function closeCustomerDetail() {
  var panel = document.getElementById("customer-detail-panel");
  if (panel) panel.classList.add("hidden");
}

// =============================================================
// 17. ADMIN — PRODUCT MANAGEMENT (ADD / EDIT / DELETE / SEARCH)
// =============================================================
var currentProductImageBase64 = null;

function handleProductImageSelect(event) {
  var file = event.target.files && event.target.files[0];
  if (!file) return;

  var validTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"];
  var isValidExt = file.name && file.name.match(/\.(jpg|jpeg|png|webp|svg|gif)$/i);
  if (validTypes.indexOf(file.type) === -1 && !isValidExt) {
    alert("Unsupported image format. Please upload a PNG, JPEG, WEBP, or SVG image.");
    event.target.value = "";
    return;
  }

  // 2MB size limit validation
  if (file.size > 2 * 1024 * 1024) {
    alert("Image file size exceeds 2MB limit. Please choose a smaller image.");
    event.target.value = "";
    return;
  }

  var reader = new FileReader();
  reader.onload = function(e) {
    var rawDataUrl = e.target.result;

    // Optional canvas downsampling for durable, compact localStorage storage
    if (typeof Image !== "undefined" && typeof document !== "undefined" && document.createElement) {
      try {
        var img = new Image();
        img.onload = function() {
          var maxDim = 360;
          var w = img.width;
          var h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
            var canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, w, h);
            currentProductImageBase64 = canvas.toDataURL("image/jpeg", 0.85);
          } else {
            currentProductImageBase64 = rawDataUrl;
          }
          updateProductImagePreview(currentProductImageBase64);
        };
        img.onerror = function() {
          currentProductImageBase64 = rawDataUrl;
          updateProductImagePreview(currentProductImageBase64);
        };
        img.src = rawDataUrl;
        return;
      } catch (err) {
        currentProductImageBase64 = rawDataUrl;
      }
    } else {
      currentProductImageBase64 = rawDataUrl;
    }
    updateProductImagePreview(currentProductImageBase64);
  };
  reader.readAsDataURL(file);
}

function updateProductImagePreview(src) {
  var prevWrap = document.getElementById("modal-prod-preview-wrapper");
  var prevImg = document.getElementById("modal-prod-preview-img");
  var noImgNote = document.getElementById("modal-prod-no-image");

  if (src) {
    if (prevImg) prevImg.src = src;
    if (prevWrap) prevWrap.style.display = "flex";
    if (noImgNote) noImgNote.style.display = "none";
  } else {
    if (prevImg) prevImg.src = "";
    if (prevWrap) prevWrap.style.display = "none";
    if (noImgNote) noImgNote.style.display = "block";
  }
}

function removeProductImage() {
  currentProductImageBase64 = null;
  var fileInput = document.getElementById("modal-prod-image");
  if (fileInput) fileInput.value = "";
  updateProductImagePreview(null);
}

function openProductModal() {
  document.getElementById("product-modal-title").textContent = "Add New Product";
  document.getElementById("modal-prod-id").value = "";
  document.getElementById("modal-prod-name").value = "";
  document.getElementById("modal-prod-category").value = "Laptops";
  document.getElementById("modal-prod-price").value = "";
  document.getElementById("modal-prod-stock").value = "";
  currentProductImageBase64 = null;
  var fileInput = document.getElementById("modal-prod-image");
  if (fileInput) fileInput.value = "";
  updateProductImagePreview(null);
  document.getElementById("product-modal").classList.remove("hidden");
}

function closeProductModal() {
  var m = document.getElementById("product-modal");
  if (m) m.classList.add("hidden");
}

function editProduct(id) {
  var products = loadData("products", []);
  var p = null;
  for (var i = 0; i < products.length; i++) {
    if (products[i].id === id) { p = products[i]; break; }
  }
  if (!p) return;

  document.getElementById("product-modal-title").textContent = "Edit Product #" + p.id;
  document.getElementById("modal-prod-id").value = p.id;
  document.getElementById("modal-prod-name").value = p.name;
  document.getElementById("modal-prod-category").value = p.category;
  document.getElementById("modal-prod-price").value = p.price;
  document.getElementById("modal-prod-stock").value = p.stock;

  currentProductImageBase64 = p.image || null;
  var fileInput = document.getElementById("modal-prod-image");
  if (fileInput) fileInput.value = "";
  updateProductImagePreview(currentProductImageBase64);

  document.getElementById("product-modal").classList.remove("hidden");
}

function handleSaveProduct(e) {
  e.preventDefault();
  var idStr = document.getElementById("modal-prod-id").value;
  var name = document.getElementById("modal-prod-name").value.trim();
  var category = document.getElementById("modal-prod-category").value;
  var price = parseInt(document.getElementById("modal-prod-price").value);
  var stock = parseInt(document.getElementById("modal-prod-stock").value);

  if (!name || isNaN(price) || price <= 0 || isNaN(stock) || stock < 0) {
    alert("Please enter valid product details.");
    return;
  }

  var emojiMap = {
    "Laptops":"💻", "Smartphones":"📱", "Headphones":"🎧", "Smartwatches":"⌚",
    "Gaming":"🎮", "Smart Home":"🔊", "Cameras":"📷", "Accessories":"📦"
  };

  var products = loadData("products", []);

  if (idStr) {
    // Edit existing product
    var editId = parseInt(idStr);
    for (var i = 0; i < products.length; i++) {
      if (products[i].id === editId) {
        products[i].name = name;
        products[i].category = category;
        products[i].price = price;
        products[i].stock = stock;
        products[i].emoji = emojiMap[category] || products[i].emoji || "📦";
        products[i].image = currentProductImageBase64;
        break;
      }
    }
    saveData("products", products);
    addAuditEntry("Product Updated", "Product #" + editId + " (" + name + ") | Price: " + fmtPrice(price) + " | Stock: " + stock + (currentProductImageBase64 ? " | Image Updated" : ""));
    alert("Product updated successfully.");
  } else {
    // Create new product
    var newId = 1;
    for (var j = 0; j < products.length; j++) {
      if (products[j].id >= newId) newId = products[j].id + 1;
    }
    products.push({
      id: newId,
      name: name,
      category: category,
      price: price,
      stock: stock,
      emoji: emojiMap[category] || "📦",
      image: currentProductImageBase64,
      tagline: category,
      rating: 4.5,
      reviews: 0
    });
    saveData("products", products);
    addAuditEntry("Product Added", "Product #" + newId + " (" + name + ") | " + fmtPrice(price) + (currentProductImageBase64 ? " | With Image" : ""));
    alert("Product added successfully.");
  }

  closeProductModal();
  renderAdminProducts();
  refreshAdminDashboard();
}

function renderAdminProducts() {
  var tbody = document.getElementById("admin-product-tbody");
  if (!tbody) return;
  var products = loadData("products", []);
  var searchInput = document.getElementById("admin-product-search");
  var q = (searchInput ? searchInput.value : "").toLowerCase().trim();
  tbody.innerHTML = "";

  for (var i = 0; i < products.length; i++) {
    var p = products[i];
    if (q && p.name.toLowerCase().indexOf(q) === -1 && p.category.toLowerCase().indexOf(q) === -1) continue;
    var statusBadge = p.stock > 3 ? '<span style="color:#16a34a;font-weight:600;">In Stock</span>' : (p.stock > 0 ? '<span style="color:#ca8a04;font-weight:600;">Low Stock</span>' : '<span style="color:var(--red);font-weight:600;">Out of Stock</span>');

    var prodImgHtml = p.image
      ? '<img src="' + p.image + '" alt="" class="admin-prod-thumb" onerror="this.style.display=\'none\';var s=this.nextElementSibling;if(s)s.style.display=\'inline\';"><span class="admin-prod-fallback-emoji" style="display:none;">' + (p.emoji || "📦") + '</span>'
      : '<span class="admin-prod-fallback-emoji">' + (p.emoji || "📦") + '</span>';

    var tr = document.createElement("tr");
    tr.innerHTML =
      "<td>" + p.id + "</td>" +
      "<td>" + prodImgHtml + "<strong>" + p.name + "</strong></td>" +
      "<td>" + p.category + "</td>" +
      "<td>" + fmtPrice(p.price) + "</td>" +
      "<td" + (p.stock <= 3 ? ' style="color:var(--red);font-weight:600;"' : "") + ">" + p.stock + "</td>" +
      "<td>" + statusBadge + "</td>" +
      '<td>' +
        '<button type="button" class="btn-sm btn-outline" style="margin-right:6px;" onclick="editProduct(' + p.id + ')">Edit</button>' +
        '<button type="button" class="btn-danger" onclick="deleteProduct(' + p.id + ')">Delete</button>' +
      '</td>';
    tbody.appendChild(tr);
  }
}

function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete product #" + id + "?")) return;
  var products = loadData("products", []);
  var filtered = [];
  var delName = "Unknown";
  for (var i = 0; i < products.length; i++) {
    if (products[i].id !== id) {
      filtered.push(products[i]);
    } else {
      delName = products[i].name;
    }
  }
  saveData("products", filtered);
  addAuditEntry("Product Deleted", "Product #" + id + " (" + delName + ")");

  if (document.getElementById("admin-product-tbody")) renderAdminProducts();
  if (document.getElementById("pos-product-tbody")) renderPosProductTable();
  if (document.getElementById("pos-product-grid")) renderPosProducts();
}

// =============================================================
// 18. ADMIN — SALES & TRANSACTIONS
// =============================================================
function renderAdminTransactions() {
  var tbody = document.getElementById("admin-transaction-tbody");
  if (!tbody) return;
  var orders = loadData("orders", []);
  var searchInput = document.getElementById("admin-txn-search");
  var q = (searchInput ? searchInput.value : "").toLowerCase().trim();
  var payFilter = (document.getElementById("admin-txn-payment-filter") || {}).value || "All";

  tbody.innerHTML = "";
  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty-msg">No sales transactions on record.</td></tr>';
    return;
  }

  for (var i = orders.length - 1; i >= 0; i--) {
    var o = orders[i];
    if (payFilter !== "All" && o.payment !== payFilter) continue;
    if (q && o.customerName.toLowerCase().indexOf(q) === -1 && String(o.id).indexOf(q) === -1) continue;

    var items = [];
    for (var j = 0; j < o.items.length; j++) {
      items.push(o.items[j].name + " ×" + o.items[j].quantity);
    }

    var tr = document.createElement("tr");
    tr.innerHTML =
      "<td><strong>#" + o.id + "</strong></td>" +
      "<td>" + o.date + "</td>" +
      "<td>" + o.customerName + "</td>" +
      "<td style=\"max-width:240px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;\" title=\"" + items.join(", ") + "\">" + items.join(", ") + "</td>" +
      "<td><strong>" + fmtPrice(o.total) + "</strong></td>" +
      "<td style=\"color:#16a34a;\">+" + o.pointsEarned + "</td>" +
      "<td>" + o.payment + "</td>" +
      "<td><span style=\"background:#dcfce7;color:#166534;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;\">" + (o.status || "Completed") + "</span></td>";
    tbody.appendChild(tr);
  }
}

// =============================================================
// 19. ADMIN — MEMBERSHIPS & REWARDS MANAGEMENT
// =============================================================
function openRewardModal() {
  document.getElementById("modal-reward-name").value = "";
  document.getElementById("modal-reward-cost").value = "";
  document.getElementById("modal-reward-value").value = "";
  document.getElementById("reward-modal").classList.remove("hidden");
}

function closeRewardModal() {
  var m = document.getElementById("reward-modal");
  if (m) m.classList.add("hidden");
}

function handleSaveReward(e) {
  e.preventDefault();
  var name = document.getElementById("modal-reward-name").value.trim();
  var cost = parseInt(document.getElementById("modal-reward-cost").value);
  var value = parseInt(document.getElementById("modal-reward-value").value);

  if (!name || isNaN(cost) || cost <= 0 || isNaN(value) || value <= 0) {
    alert("Please enter valid reward parameters.");
    return;
  }

  var rewards = loadData("rewards", SAMPLE_REWARDS);
  var newId = 1;
  for (var i = 0; i < rewards.length; i++) {
    if (rewards[i].id >= newId) newId = rewards[i].id + 1;
  }

  rewards.push({
    id: newId,
    name: name,
    pointsCost: cost,
    discountValue: value
  });

  saveData("rewards", rewards);
  addAuditEntry("Reward Added", name + " (" + cost + " pts for " + fmtPrice(value) + ")");
  closeRewardModal();
  renderAdminRewards();
  alert("Reward added to catalogue.");
}

function deleteReward(id) {
  if (!confirm("Remove this reward from the catalogue?")) return;
  var rewards = loadData("rewards", SAMPLE_REWARDS);
  var filtered = [];
  var delName = "";
  for (var i = 0; i < rewards.length; i++) {
    if (rewards[i].id !== id) filtered.push(rewards[i]);
    else delName = rewards[i].name;
  }
  saveData("rewards", filtered);
  addAuditEntry("Reward Removed", delName + " (ID #" + id + ")");
  renderAdminRewards();
}

function renderAdminRewards() {
  var tbody = document.getElementById("admin-rewards-tbody");
  if (tbody) {
    var rewards = loadData("rewards", SAMPLE_REWARDS);
    tbody.innerHTML = "";
    for (var i = 0; i < rewards.length; i++) {
      var r = rewards[i];
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td><strong>" + r.name + "</strong></td>" +
        "<td>" + r.pointsCost + " pts</td>" +
        "<td>" + fmtPrice(r.discountValue) + "</td>" +
        '<td><button type="button" class="btn-danger btn-sm" onclick="deleteReward(' + r.id + ')">Remove</button></td>';
      tbody.appendChild(tr);
    }
  }

  // Redemptions
  var cont = document.getElementById("admin-redemption-log");
  if (cont) {
    var redemptions = loadData("redemptions", []);
    if (redemptions.length === 0) {
      cont.innerHTML = '<p class="empty-msg">No rewards redeemed yet.</p>';
    } else {
      var h = '<table class="data-table"><thead><tr><th>Date</th><th>Customer</th><th>Reward</th><th>Points Used</th><th>Discount Applied</th></tr></thead><tbody>';
      for (var j = redemptions.length - 1; j >= 0; j--) {
        var red = redemptions[j];
        h += "<tr><td>" + red.date + "</td><td>" + red.customerName + "</td><td>" + red.rewardName + "</td><td>" + red.pointsUsed + "</td><td>" + fmtPrice(red.discountValue) + "</td></tr>";
      }
      h += "</tbody></table>";
      cont.innerHTML = h;
    }
  }
}

// =============================================================
// 20. ADMIN — LOYALTY SETTINGS
// =============================================================
function loadLoyaltySettings() {
  var rule = getEarningRule();
  var ptsIn = document.getElementById("rule-points");
  var spdIn = document.getElementById("rule-spend");
  var disp = document.getElementById("current-rule-display");

  if (ptsIn) ptsIn.value = rule.points;
  if (spdIn) spdIn.value = rule.spend;
  if (disp) {
    disp.textContent = "Active Rule: Customers earn " + rule.points + " point(s) for every " + fmtPrice(rule.spend) + " spent on qualifying in-store purchases.";
  }
}

function saveEarningRule(e) {
  e.preventDefault();
  var ptsIn = document.getElementById("rule-points");
  var spendIn = document.getElementById("rule-spend");

  var pts = ptsIn ? parseInt(ptsIn.value) : 0;
  var spend = spendIn ? parseInt(spendIn.value) : 0;

  if (isNaN(pts) || pts < 1 || isNaN(spend) || spend < 1) {
    alert("Please enter valid positive numbers for points and spend threshold.");
    return;
  }

  var old = getEarningRule();
  saveData("earningRule", { points: pts, spend: spend });
  addAuditEntry("Loyalty Rule Updated", "Changed from " + old.points + " pts/" + fmtPrice(old.spend) + " to " + pts + " pts/" + fmtPrice(spend));
  loadLoyaltySettings();
  alert("Loyalty earning rule updated successfully.");
}

// =============================================================
// 21. ADMIN — REPORTS
// =============================================================
function renderAdminReports() {
  var orders = loadData("orders", []);
  var customers = loadData("customers", []);

  var totalRev = 0;
  var catSpend = {};
  var custSpend = {};

  for (var i = 0; i < orders.length; i++) {
    var o = orders[i];
    totalRev += o.total;

    custSpend[o.customerId] = (custSpend[o.customerId] || 0) + o.total;

    for (var j = 0; j < o.items.length; j++) {
      var it = o.items[j];
      // Lookup category from products table
      var cat = "Other";
      var prods = loadData("products", []);
      for (var p = 0; p < prods.length; p++) {
        if (prods[p].name === it.name || prods[p].id === it.productId) {
          cat = prods[p].category;
          break;
        }
      }
      catSpend[cat] = (catSpend[cat] || 0) + (it.price * it.quantity);
    }
  }

  var avgOrder = orders.length > 0 ? Math.round(totalRev / orders.length) : 0;
  var topCat = "—";
  var topCatMax = 0;
  for (var c in catSpend) {
    if (catSpend[c] > topCatMax) {
      topCatMax = catSpend[c];
      topCat = c;
    }
  }

  var activeCustCount = Object.keys(custSpend).length;
  var redemptions = loadData("redemptions", []);
  var totalPtsIssued = 0;
  for (var r = 0; r < orders.length; r++) totalPtsIssued += orders[r].pointsEarned;
  var totalPtsRedeemed = 0;
  for (var rd = 0; rd < redemptions.length; rd++) totalPtsRedeemed += redemptions[rd].pointsUsed;
  var redRate = totalPtsIssued > 0 ? Math.round((totalPtsRedeemed / totalPtsIssued) * 100) : 0;

  var avgEl = document.getElementById("rep-avg-order");
  var catEl = document.getElementById("rep-top-category");
  var actEl = document.getElementById("rep-active-cust");
  var ratEl = document.getElementById("rep-points-rate");

  if (avgEl) avgEl.textContent = fmtPrice(avgOrder);
  if (catEl) catEl.textContent = topCat;
  if (actEl) actEl.textContent = activeCustCount;
  if (ratEl) ratEl.textContent = redRate + "%";

  // Category breakdown table
  var catDiv = document.getElementById("reports-category-breakdown");
  if (catDiv) {
    var ch = '<table class="data-table"><thead><tr><th>Category</th><th>Revenue</th></tr></thead><tbody>';
    var hasCat = false;
    for (var k in catSpend) {
      hasCat = true;
      ch += "<tr><td>" + k + "</td><td><strong>" + fmtPrice(catSpend[k]) + "</strong></td></tr>";
    }
    if (!hasCat) ch += '<tr><td colspan="2" class="empty-msg">No sales data recorded yet.</td></tr>';
    ch += "</tbody></table>";
    catDiv.innerHTML = ch;
  }

  // Top customers table
  var custDiv = document.getElementById("reports-top-customers");
  if (custDiv) {
    var sortedCusts = [];
    for (var cid in custSpend) {
      var custObj = getCustomerById(parseInt(cid));
      if (custObj) sortedCusts.push({ name: custObj.name, spend: custSpend[cid], tier: getTier(custObj.totalPointsEarned) });
    }
    sortedCusts.sort(function(a, b) { return b.spend - a.spend; });

    var th = '<table class="data-table"><thead><tr><th>Customer</th><th>Tier</th><th>Total Spend</th></tr></thead><tbody>';
    if (sortedCusts.length === 0) {
      th += '<tr><td colspan="3" class="empty-msg">No customer spend on file.</td></tr>';
    } else {
      for (var s = 0; s < Math.min(5, sortedCusts.length); s++) {
        th += "<tr><td>" + sortedCusts[s].name + "</td><td>" + sortedCusts[s].tier + "</td><td><strong>" + fmtPrice(sortedCusts[s].spend) + "</strong></td></tr>";
      }
    }
    th += "</tbody></table>";
    custDiv.innerHTML = th;
  }
}

// =============================================================
// 22. ADMIN — SETTINGS
// =============================================================
function loadStoreSettings() {
  loadLoyaltySettings();
  renderAdminRewards();
}

function saveStoreSettings(e) {
  if (e) e.preventDefault();
  var nameEl = document.getElementById("cfg-store-name");
  var branchEl = document.getElementById("cfg-branch");
  var currEl = document.getElementById("cfg-currency");
  var discEl = document.getElementById("cfg-gold-discount");

  var prev = getStoreConfig();
  var cfg = {
    storeName: nameEl ? nameEl.value.trim() : (prev.storeName || "Gadget_ Electronics"),
    branch: branchEl ? branchEl.value.trim() : (prev.branch || "Main Branch"),
    currency: currEl ? currEl.value.trim() : (prev.currency || "₹"),
    goldDiscountPct: discEl ? (parseInt(discEl.value) || 0) : (prev.goldDiscountPct !== undefined ? prev.goldDiscountPct : 5)
  };

  saveData("storeConfig", cfg);
  addAuditEntry("System Settings Changed", "Store: " + cfg.storeName + " | Branch: " + cfg.branch + " | Gold Disc: " + cfg.goldDiscountPct + "%");
  alert("Settings saved successfully.");
}

function resetToDemoData() {
  if (!confirm("Reset all store data to factory demo state? This will clear all transactions and custom records.")) return;
  localStorage.clear();
  initData();
  addAuditEntry("Factory Reset", "All application data reset to initial demo seeds");
  alert("Demo data restored.");
  window.location.reload();
}

// =============================================================
// 23. ADMIN — AUDIT LOG
// =============================================================
function renderAuditLog() {
  var log = loadData("auditLog", []);
  var tbody = document.getElementById("admin-audit-tbody");
  if (!tbody) return;
  var q = ((document.getElementById("admin-audit-search") || {}).value || "").toLowerCase().trim();
  tbody.innerHTML = "";

  if (log.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty-msg">No audit entries logged yet.</td></tr>';
    return;
  }

  for (var i = log.length - 1; i >= 0; i--) {
    var e = log[i];
    if (q && e.action.toLowerCase().indexOf(q) === -1 && e.details.toLowerCase().indexOf(q) === -1) continue;
    var tr = document.createElement("tr");
    tr.innerHTML =
      "<td>" + e.date + "</td>" +
      "<td><strong>" + e.action + "</strong></td>" +
      "<td>" + e.user + "</td>" +
      "<td>" + e.details + "</td>";
    tbody.appendChild(tr);
  }
}

// =============================================================
// 24. INITIALIZATION
// =============================================================
initData();

if (document.getElementById("pos-view")) {
  renderPosProducts();
  renderPosCart();
}

if (document.getElementById("admin-view")) {
  refreshAdminDashboard();
  showAdminSection("dashboard");
}
