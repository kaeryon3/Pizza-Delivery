// =========================
// Detect current page
// =========================
const isMenuPage = document.querySelector('.menu-card');
const isCartPage = document.getElementById('cart-items');

// =========================
// Shared data
// =========================
const pizzaPrices = {
    Margherita: 12,
    Pepperoni: 14,
    Vegetarian: 13,
    'BBQ Chicken': 15,
    Hawaiian: 14,
    'Four Cheese': 16,
    Coke: 2,
    'Orange Juice': 3,
    Beer: 5,
    Wine: 8,
};

// =========================
// Utility functions
// =========================
function getEstimatedTime() {
    return Math.floor(Math.random() * 16) + 15;
}

function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
    const cart = getCart();
    const counters = document.querySelectorAll('.cart-count');
    counters.forEach((el) => (el.textContent = cart.length));
}

// =========================
// MENU PAGE LOGIC
// =========================
if (isMenuPage) {
    const orderButtons = document.querySelectorAll('.order-btn');

    orderButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.card');
            if (!card) return;

            const pizzaName = card.querySelector('.card-title').textContent;

            const cart = getCart();
            cart.push(pizzaName);
            saveCart(cart);
            updateCartCount();

            btn.disabled = true;
            const originalText = btn.textContent;
            btn.textContent = 'Added ✓';

            setTimeout(() => {
                btn.disabled = false;
                btn.textContent = originalText;
            }, 500);
        });
    });

    updateCartCount();
}

// =========================
// CART PAGE LOGIC
// =========================
if (isCartPage) {
    const cartItemsContainer = document.getElementById('cart-items');
    const totalElement = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');

    let cart = getCart();
    let total = 0;

    function renderCart() {
        cartItemsContainer.innerHTML = '';
        total = 0;

        cart.forEach((item, index) => {
            const price = pizzaPrices[item] || 0;
            total += price;

            const div = document.createElement('div');
            div.className = 'cart-item mb-2';
            div.innerHTML = `
                <span class="cart-name">${item}</span>
                <span class="cart-price">$${price}</span>
                <button class="btn btn-sm btn-danger remove-btn" data-index="${index}">✕</button>
            `;
            cartItemsContainer.appendChild(div);
        });

        totalElement.textContent = total;
        updateCartCount();
    }

    cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            const index = e.target.dataset.index;
            cart.splice(index, 1);
            saveCart(cart);
            renderCart();
        }
    });

    // =========================
    // MASK FOR EXPIRATION DATE
    // =========================
    const expiryInput = document.getElementById('cardExpiry');
    if (expiryInput) {
        expiryInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            e.target.value = value;
        });
    }

    // =========================
    // Checkout modal logic
    // =========================
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            checkoutBtn.classList.add('btn-danger');
            checkoutBtn.classList.remove('btn-primary');
            checkoutBtn.textContent = 'Add items to proceed';

            setTimeout(() => {
                checkoutBtn.classList.remove('btn-danger');
                checkoutBtn.classList.add('btn-primary');
                checkoutBtn.textContent = 'Proceed to Checkout';
            }, 1500);

            return;
        }

        const checkoutTotal = document.getElementById('checkout-total');
        if (checkoutTotal) checkoutTotal.textContent = total;
        const checkoutModal = new bootstrap.Modal(document.getElementById('checkoutModal'));
        checkoutModal.show();
    });

    document.getElementById('checkout-form')?.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('cardName').value.trim();
    const address = document.getElementById('cardAddress').value.trim();
    const number = document.getElementById('cardNumber').value.trim();
    const cvv = document.getElementById('cardCVV').value.trim();
    const expiry = document.getElementById('cardExpiry').value.trim();

    if (!name || !address) {
        alert('Please enter your name and address.');
        return;
    }

    if (!/^\d{16}$/.test(number)) {
        alert('Card number must be 16 digits.');
        return;
    }

    if (!/^\d{3}$/.test(cvv)) {
        alert('CVV must be 3 digits.');
        return;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
        alert('Expiration date must be in MM/YY format.');
        return;
    }

    const estimatedTime = getEstimatedTime();

    const checkoutModal = bootstrap.Modal.getInstance(
        document.getElementById('checkoutModal')
    );
    checkoutModal.hide();

    document.getElementById('cart-confirmation').innerHTML = `
        <h4>Thank you for your order!</h4>
        <p>Name: <strong>${name}</strong></p>
        <p>Address: <strong>${address}</strong></p>
        <p>You ordered <strong>${cart.length}</strong> item(s).</p>
        <p>Total: <strong>$${total}</strong></p>
        <p>Estimated delivery time: <strong>${estimatedTime} minutes</strong></p>
    `;

    localStorage.removeItem('cart');
    cart = [];
    renderCart();
});

    renderCart();
}

updateCartCount();