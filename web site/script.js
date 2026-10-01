const products = [
	{ id: "vitamin-c", name: "Vitamin C Tablets", category: "wellness", categoryName: "Wellness", description: "Everyday vitamin supplement · 60 tablets", price: 199, icon: "🍊", color: "#f8eee0" },
	{ id: "electrolyte", name: "Electrolyte Powder", category: "wellness", categoryName: "Wellness", description: "Hydration support · 10 sachets", price: 149, icon: "🥤", color: "#e7f1ed" },
	{ id: "first-aid-kit", name: "First Aid Kit", category: "first-aid", categoryName: "First aid", description: "A handy kit for home and travel", price: 499, icon: "🧰", color: "#f7e9e4" },
	{ id: "bandage-pack", name: "Adhesive Bandages", category: "first-aid", categoryName: "First aid", description: "Flexible fabric strips · 20 count", price: 89, icon: "🩹", color: "#f3efe2" },
	{ id: "thermometer", name: "Digital Thermometer", category: "devices", categoryName: "Health devices", description: "Easy-to-read digital display", price: 299, icon: "🌡️", color: "#e9eef3" },
	{ id: "bp-monitor", name: "Blood Pressure Monitor", category: "devices", categoryName: "Health devices", description: "Automatic upper-arm monitor", price: 1299, icon: "🩺", color: "#e7f1ed" },
	{ id: "hand-wash", name: "Gentle Hand Wash", category: "personal-care", categoryName: "Personal care", description: "Daily hand care · 250 ml", price: 129, icon: "🧴", color: "#f0eaf3" },
	{ id: "cotton-roll", name: "Cotton Roll", category: "personal-care", categoryName: "Personal care", description: "Soft, absorbent cotton · 100 g", price: 69, icon: "☁️", color: "#eff0ea" }
];

const productList = document.querySelector("#product-list");
const searchInput = document.querySelector("#search");
const categoryFilters = [...document.querySelectorAll(".category-filter")];
const emptyResults = document.querySelector("#empty-results");
const cartPanel = document.querySelector("#cart-panel");
const cartBackdrop = document.querySelector("#cart-backdrop");
const cartItems = document.querySelector("#cart-items");
const cartEmpty = document.querySelector("#cart-empty");
const cartCount = document.querySelector("#cart-count");
const cartSubtotal = document.querySelector("#cart-subtotal");
const toast = document.querySelector("#toast");

let activeCategory = "all";
let toastTimer;
let previousFocus;

function readCart() {
	try {
		const saved = JSON.parse(localStorage.getItem("general-agency-cart") || "{}");
		return Object.fromEntries(
			Object.entries(saved).filter(([id, quantity]) =>
				products.some((product) => product.id === id) && Number.isInteger(quantity) && quantity > 0
			)
		);
	} catch {
		return {};
	}
}

let cart = readCart();

function saveCart() {
	try {
		localStorage.setItem("general-agency-cart", JSON.stringify(cart));
	} catch {
		showToast("Cart updates will not be saved on this device.");
	}
}

function formatPrice(amount) {
	return `₹${amount.toLocaleString("en-IN")}`;
}

function renderProducts() {
	const query = searchInput.value.trim().toLocaleLowerCase();
	const visibleProducts = products.filter((product) => {
		const matchesCategory = activeCategory === "all" || product.category === activeCategory;
		const matchesSearch = `${product.name} ${product.categoryName} ${product.description}`.toLocaleLowerCase().includes(query);
		return matchesCategory && matchesSearch;
	});

	productList.innerHTML = visibleProducts.map((product) => `
		<article class="product">
			<div class="product-visual" style="--visual: ${product.color}">
				<span class="product-category">${product.categoryName}</span>
				<span class="product-emoji" aria-hidden="true">${product.icon}</span>
			</div>
			<div class="product-info">
				<h3>${product.name}</h3>
				<p class="product-description">${product.description}</p>
				<div class="product-bottom">
					<span class="product-price">${formatPrice(product.price)}</span>
					<button class="add-button" type="button" data-add="${product.id}">Add to cart</button>
				</div>
			</div>
		</article>
	`).join("");
	emptyResults.hidden = visibleProducts.length > 0;
}

function renderCart() {
	const entries = Object.entries(cart).filter(([, quantity]) => quantity > 0);
	const itemCount = entries.reduce((total, [, quantity]) => total + quantity, 0);
	const subtotal = entries.reduce((total, [id, quantity]) => {
		const product = products.find((item) => item.id === id);
		return total + product.price * quantity;
	}, 0);

	cartCount.textContent = itemCount;
	cartEmpty.hidden = entries.length > 0;
	cartItems.innerHTML = entries.map(([id, quantity]) => {
		const product = products.find((item) => item.id === id);
		return `
			<article class="cart-line">
				<span class="cart-line-visual" aria-hidden="true">${product.icon}</span>
				<div>
					<h3>${product.name}</h3>
					<p class="cart-line-price">${formatPrice(product.price)} each</p>
					<div class="quantity-control" aria-label="Quantity for ${product.name}">
						<button type="button" data-change="${id}" data-delta="-1" aria-label="Decrease ${product.name} quantity">−</button>
						<span>${quantity}</span>
						<button type="button" data-change="${id}" data-delta="1" aria-label="Increase ${product.name} quantity">+</button>
					</div>
				</div>
				<button class="remove-item" type="button" data-remove="${id}" aria-label="Remove ${product.name}">Remove</button>
			</article>
		`;
	}).join("");
	cartSubtotal.textContent = formatPrice(subtotal);
}

function showToast(message) {
	toast.textContent = message;
	toast.classList.add("is-visible");
	window.clearTimeout(toastTimer);
	toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function setCartOpen(isOpen) {
	cartPanel.classList.toggle("is-open", isOpen);
	cartPanel.setAttribute("aria-hidden", String(!isOpen));
	cartPanel.inert = !isOpen;
	document.querySelector("#open-cart").setAttribute("aria-expanded", String(isOpen));
	cartBackdrop.hidden = !isOpen;
	cartBackdrop.classList.toggle("is-visible", isOpen);
	document.body.classList.toggle("cart-open", isOpen);
	if (isOpen) {
		previousFocus = document.activeElement;
		document.querySelector("#close-cart").focus();
	} else if (previousFocus) {
		previousFocus.focus();
	}
}

productList.addEventListener("click", (event) => {
	const button = event.target.closest("[data-add]");
	if (!button) return;
	const product = products.find((item) => item.id === button.dataset.add);
	cart[product.id] = (cart[product.id] || 0) + 1;
	saveCart();
	renderCart();
	showToast(`${product.name} added to cart`);
});

categoryFilters.forEach((button) => {
	button.addEventListener("click", () => {
		activeCategory = button.dataset.category;
		categoryFilters.forEach((filter) => {
			const isActive = filter === button;
			filter.classList.toggle("is-active", isActive);
			filter.setAttribute("aria-pressed", String(isActive));
		});
		renderProducts();
	});
});

searchInput.addEventListener("input", renderProducts);
cartItems.addEventListener("click", (event) => {
	const changeButton = event.target.closest("[data-change]");
	const removeButton = event.target.closest("[data-remove]");
	if (changeButton) {
		const id = changeButton.dataset.change;
		cart[id] = (cart[id] || 0) + Number(changeButton.dataset.delta);
		if (cart[id] <= 0) delete cart[id];
		saveCart();
		renderCart();
	} else if (removeButton) {
		delete cart[removeButton.dataset.remove];
		saveCart();
		renderCart();
	}
});

document.querySelector("#open-cart").addEventListener("click", () => setCartOpen(true));
document.querySelector("#close-cart").addEventListener("click", () => setCartOpen(false));
document.querySelector("#continue-shopping").addEventListener("click", () => setCartOpen(false));
cartBackdrop.addEventListener("click", () => setCartOpen(false));
document.addEventListener("keydown", (event) => {
	if (event.key === "Escape" && cartPanel.classList.contains("is-open")) setCartOpen(false);
});

renderProducts();
renderCart();
