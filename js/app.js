/**
 * Proffee Web Application Logic
 * Comprehensive technical audit & optimization 2026
 */

// Pricing Configuration (Price in EGP)
const PRICING = {
    plain: { 0.25: 230, 0.5: 450, 1.0: 820 },
    mahwaj: { 0.25: 240, 0.5: 470, 1.0: 900 },
    french: { 0.25: 250, 0.5: 480, 1.0: 940 },
    hazelnut: { 0.25: 250, 0.5: 480, 1.0: 940 }
};

// Coffee Products Database
const products = [
    {
        id: 1,
        name: "Plain Light Roast",
        nameAr: "سادة فاتح",
        type: "plain",
        description: "Smooth and mild with delicate floral notes. Pure coffee pleasure.",
        image: "images/plain_roast.jpg"
    },
    {
        id: 2,
        name: "Plain Medium Roast",
        nameAr: "سادة وسط",
        type: "plain",
        description: "Balanced body with rich nutty flavors. The perfect daily brew.",
        image: "images/plain_roast.jpg"
    },
    {
        id: 3,
        name: "Plain Dark Roast",
        nameAr: "سادة غامق",
        type: "plain",
        description: "Bold, intense, and smoky. For those who love a strong kick.",
        image: "images/plain_roast.jpg"
    },
    {
        id: 4,
        name: "Mahwaj Light Roast",
        nameAr: "محوج فاتح",
        type: "mahwaj",
        description: "Lightly roasted beans blended with premium cardamom and spices.",
        image: "images/mahwaj_light.jpg"
    },
    {
        id: 5,
        name: "Mahwaj Medium Roast",
        nameAr: "محوج وسط",
        type: "mahwaj",
        description: "A harmonious mix of medium roast coffee and aromatic spices.",
        image: "images/mahwaj_medium.jpg"
    },
    {
        id: 6,
        name: "Mahwaj Dark Roast",
        nameAr: "محوج غامق",
        type: "mahwaj",
        description: "Deep, dark roast enriched with traditional spices for a robust flavor.",
        image: "images/mahwaj_dark.jpg"
    },
    {
        id: 7,
        name: "French Roast",
        nameAr: "فرنساوي",
        type: "french",
        description: "Smooth and creamy texture with a rich, milky finish.",
        image: "images/french_roast.png"
    },
    {
        id: 8,
        name: "French Hazelnut",
        nameAr: "فرنساوي بندق",
        type: "hazelnut",
        description: "Decadent roast infused with natural hazelnut flavor.",
        image: "images/french_hazelnut.png"
    }
];

// Cart State Management
let cart = [];
try {
    cart = JSON.parse(localStorage.getItem('proffee-cart')) || [];
} catch (e) {
    console.error('Error loading cart from localStorage', e);
    cart = [];
}

/**
 * Synchronize cart with latest product data
 */
function syncCart() {
    cart = cart.map(item => {
        const product = products.find(p => p.id === item.id);
        if (!product) return item;

        const weight = item.weight || 0.25;
        const cartItemId = item.cartItemId || `${item.id}_${weight}`;
        const currentPrice = PRICING[product.type][weight];

        return {
            ...item,
            name: product.name,
            nameAr: product.nameAr,
            image: product.image,
            description: product.description,
            weight: weight,
            cartItemId: cartItemId,
            price: currentPrice
        };
    });
    saveCart();
}

/**
 * Save cart to localStorage
 */
function saveCart() {
    try {
        localStorage.setItem('proffee-cart', JSON.stringify(cart));
    } catch (e) {
        console.error('Error saving cart to localStorage', e);
    }
}

/**
 * Update global cart badge count
 */
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
    });
}

/**
 * Create HTML for a product card
 */
function createProductCardHTML(product, isFeatured = false) {
    const defaultWeight = 0.25;
    const price = PRICING[product.type][defaultWeight];
    const cardId = isFeatured ? `featured-product-card-${product.id}` : `product-card-${product.id}`;
    const priceId = isFeatured ? `featured-price-${product.id}` : `price-${product.id}`;

    return `
        <div class="product-card" id="${cardId}">
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.name}" class="product-img" loading="lazy">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <h4 style="font-size: 0.9rem; color: var(--color-accent); margin-bottom: 0.5rem;">${product.nameAr}</h4>
                <p class="product-desc">${product.description}</p>
                
                <div class="product-options">
                    <label>Select Quantity:</label>
                    <select class="weight-select" onchange="updateProductPrice(${product.id}, this.value, ${isFeatured})">
                        <option value="0.25">Quarter Kilo (250g)</option>
                        <option value="0.5">Half Kilo (500g)</option>
                        <option value="1.0">One Kilo (1000g)</option>
                    </select>
                </div>

                <div class="product-footer">
                    <span class="price" id="${priceId}">${price} EGP</span>
                    <button class="btn btn-sm" onclick="addToCart(${product.id}, ${isFeatured})" aria-label="Add ${product.name} to cart">Add to Cart</button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render shop grid
 */
function renderShop() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    grid.innerHTML = products.map(p => createProductCardHTML(p, false)).join('');
}

/**
 * Render featured items
 */
function renderFeatured() {
    const grid = document.getElementById('featured-grid');
    if (!grid) return;
    const featuredIds = [1, 4, 7, 8];
    const featuredItems = products.filter(p => featuredIds.includes(p.id));
    grid.innerHTML = featuredItems.map(p => createProductCardHTML(p, true)).join('');
}

/**
 * Update price in UI when weight selected changes
 */
window.updateProductPrice = function (productId, weight, isFeatured) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const price = PRICING[product.type][parseFloat(weight)];
    const priceId = isFeatured ? `featured-price-${productId}` : `price-${productId}`;
    const priceEl = document.getElementById(priceId);

    if (priceEl) {
        priceEl.textContent = `${price} EGP`;
    }
};

/**
 * Add item to cart
 */
window.addToCart = function (productId, isFeatured) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const selector = isFeatured ? `#featured-product-card-${productId} .weight-select` : `#product-card-${productId} .weight-select`;
    const weightEl = document.querySelector(selector);
    const weight = weightEl ? parseFloat(weightEl.value) : 0.25;
    const price = PRICING[product.type][weight];
    const cartItemId = `${productId}_${weight}`;

    const existingItem = cart.find(item => item.cartItemId === cartItemId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            cartItemId,
            weight,
            price,
            quantity: 1
        });
    }

    saveCart();
    updateCartCount();

    // Feedback
    const btn = event.target;
    if (btn && btn.tagName === 'BUTTON') {
        const originalText = btn.textContent;
        btn.textContent = 'Added!';
        btn.disabled = true;
        setTimeout(() => {
            btn.textContent = originalText;
            btn.disabled = false;
        }, 1000);
    }
};

/**
 * Render cart items
 */
function renderCart() {
    const list = document.getElementById('cart-items');
    const summary = document.getElementById('cart-summary');
    if (!list || !summary) return;

    if (cart.length === 0) {
        list.innerHTML = `<div class="empty-cart-msg">Your cart is empty. <a href="products.html" class="text-accent">Go Shop</a></div>`;
        summary.style.display = 'none';
        return;
    }

    summary.style.display = 'block';

    list.innerHTML = cart.map(item => {
        const weightLabel = { 0.25: '250g', 0.5: '500g', 1.0: '1kg' }[item.weight];
        return `
            <div class="cart-item">
                <div class="cart-item-image">
                     <img src="${item.image}" alt="${item.name}" class="cart-item-img" loading="lazy">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.name} <span style="font-size: 0.8em; color: var(--color-text-muted);">(${weightLabel})</span></div>
                    <div class="cart-item-price">${item.price.toFixed(2)} EGP</div>
                </div>
                <div class="cart-item-actions">
                    <button class="quantity-btn" onclick="updateQuantity('${item.cartItemId}', -1)" aria-label="Decrease quantity">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity('${item.cartItemId}', 1)" aria-label="Increase quantity">+</button>
                    <button class="btn btn-sm" style="margin-left: 10px; border-color: #ef4444; color: #ef4444; padding: 6px 10px;" onclick="removeFromCart('${item.cartItemId}')" aria-label="Remove item">
                        <i class="ph ph-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalEl = document.getElementById('cart-total-amount');
    if (totalEl) {
        totalEl.textContent = `${total.toFixed(2)} EGP`;
    }

    // Add shipping hint if it doesn't exist
    if (!document.querySelector('.shipping-hint')) {
        const hint = document.createElement('p');
        hint.className = 'shipping-hint';
        hint.style.fontSize = '0.85rem';
        hint.style.color = 'var(--color-text-muted)';
        hint.style.marginTop = '10px';
        hint.style.textAlign = 'right';
        hint.textContent = '+ 60 EGP Shipping added at checkout';
        summary.appendChild(hint);
    }
}

/**
 * Cart actions
 */
window.removeFromCart = function (cartItemId) {
    cart = cart.filter(item => item.cartItemId !== cartItemId);
    saveCart();
    renderCart();
    updateCartCount();
};

window.updateQuantity = function (cartItemId, delta) {
    const item = cart.find(item => item.cartItemId === cartItemId);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(cartItemId);
        } else {
            saveCart();
            renderCart();
            updateCartCount();
        }
    }
};

/**
 * App Initialization
 */
document.addEventListener('DOMContentLoaded', () => {
    syncCart();
    updateCartCount();
    renderShop();
    renderFeatured();
    renderCart();

    // Scroll Effect
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        }, { passive: true });
    }

    // Smooth Scroll for local anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});

