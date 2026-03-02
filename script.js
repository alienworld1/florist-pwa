document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. GLOBAL STATE & SELECTORS ---
    
    // Attempt to load cart from localStorage, otherwise default to empty array
    let cart = JSON.parse(localStorage.getItem('ethereal_cart')) || [];
    
    const selectors = {
        cartTrigger: document.getElementById('cart-trigger'),
        cartCount: document.getElementById('cart-count'),
        sidebar: document.getElementById('cart-sidebar'),
        overlay: document.getElementById('cart-overlay'),
        closeBtn: document.getElementById('close-cart'),
        cartItemsContainer: document.getElementById('cart-items-container'),
        totalPrice: document.getElementById('cart-total-price'),
        checkoutBtn: document.getElementById('checkout-btn'),
        toast: document.getElementById('toast'),
        // Select all add-to-cart buttons across the site
        addToCartBtns: document.querySelectorAll('.add-to-cart-btn') 
    };

    // --- 2. CORE FUNCTIONS ---

    // Save current state to browser storage
    const saveCart = () => {
        localStorage.setItem('ethereal_cart', JSON.stringify(cart));
        updateCartCount();
        renderCartItems();
    };

    // Update the small number badge in nav
    const updateCartCount = () => {
        const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
        if (selectors.cartCount) {
            selectors.cartCount.textContent = totalQty;
        }
    };

    // Calculate Total Price
    const calculateTotal = () => {
        return cart.reduce((acc, item) => acc + (item.price * item.qty), 0).toFixed(2);
    };

    // Render HTML for Cart Items
    const renderCartItems = () => {
        if (!selectors.cartItemsContainer) return;

        selectors.cartItemsContainer.innerHTML = ''; // Clear current display

        if (cart.length === 0) {
            selectors.cartItemsContainer.innerHTML = `
                <div class="empty-cart-msg" style="text-align:center; margin-top:2rem; color:var(--text-secondary);">
                    <p>Your garden is currently empty.</p>
                </div>`;
            selectors.totalPrice.textContent = '$0.00';
            return;
        }

        cart.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.classList.add('cart-item-row');
            itemEl.innerHTML = `
                <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <span class="cart-item-price">$${item.price}</span>
                    <button class="remove-item-btn" data-id="${item.id}">Remove</button>
                </div>
                <div class="qty-controls">
                    <button class="qty-btn decrease" data-id="${item.id}">-</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn increase" data-id="${item.id}">+</button>
                </div>
            `;
            selectors.cartItemsContainer.appendChild(itemEl);
        });

        selectors.totalPrice.textContent = `$${calculateTotal()}`;
    };

    // Show Toast Notification
    const showToast = (message) => {
        if (!selectors.toast) return;
        selectors.toast.textContent = message;
        selectors.toast.classList.remove('hidden');
        
        setTimeout(() => {
            selectors.toast.classList.add('hidden');
        }, 3000);
    };

    // --- 3. EVENT HANDLERS ---

    // Add Item to Cart (Logic)
    const addToCart = (product) => {
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.qty += 1;
            showToast(`Added another ${product.name}`);
        } else {
            cart.push({ ...product, qty: 1 });
            showToast(`${product.name} added to garden`);
        }
        
        saveCart();
        openCart(); // Auto-open cart to show user
    };

    // Open/Close Sidebar
    const openCart = () => {
        selectors.sidebar.classList.add('active');
        selectors.overlay.classList.add('active');
    };

    const closeCart = () => {
        selectors.sidebar.classList.remove('active');
        selectors.overlay.classList.remove('active');
    };

    // --- 4. EVENT LISTENERS ---

    // 1. Add to Cart Buttons (Global)
    selectors.addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent jump to top
            const product = {
                id: btn.dataset.id,
                name: btn.dataset.name,
                price: parseFloat(btn.dataset.price),
                img: btn.dataset.img
            };
            addToCart(product);
        });
    });

    // 2. Navbar Cart Trigger
    if (selectors.cartTrigger) {
        selectors.cartTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            openCart();
        });
    }

    // 3. Close Trigger (Btn & Overlay)
    if (selectors.closeBtn) selectors.closeBtn.addEventListener('click', closeCart);
    if (selectors.overlay) selectors.overlay.addEventListener('click', closeCart);

    // 4. Cart Item Interactions (Delegation)
    // We attach one listener to the container instead of every single dynamic button
    if (selectors.cartItemsContainer) {
        selectors.cartItemsContainer.addEventListener('click', (e) => {
            const target = e.target;
            const id = target.dataset.id;

            if (!id) return;

            // Remove Item
            if (target.classList.contains('remove-item-btn')) {
                cart = cart.filter(item => item.id !== id);
                saveCart();
            }

            // Increase Qty
            if (target.classList.contains('increase')) {
                const item = cart.find(item => item.id === id);
                item.qty++;
                saveCart();
            }

            // Decrease Qty
            if (target.classList.contains('decrease')) {
                const item = cart.find(item => item.id === id);
                if (item.qty > 1) {
                    item.qty--;
                } else {
                    // Optional: Remove if qty goes to 0
                    cart = cart.filter(item => item.id !== id);
                }
                saveCart();
            }
        });
    }

    // 5. Checkout Simulation
    if (selectors.checkoutBtn) {
        selectors.checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) return;
            
            const total = calculateTotal();
            // Simple simulation
            if(confirm(`Proceed to payment for $${total}?`)) {
                alert('Thank you for your order! Your blooms are on the way.');
                cart = [];
                saveCart();
                closeCart();
            }
        });
    }

    // --- 5. INITIALIZATION ---
    updateCartCount();
    renderCartItems();
});