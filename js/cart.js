(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        const shop = window.SHOQAN;
        const cartItems = document.getElementById("cart-items");
        const checkoutForm = document.getElementById("checkout-form");
        const deliverySelect = document.getElementById("delivery");
        const promoInput = document.getElementById("promo");
        let promoApplied = false;

        function calculateTotals(cart) {
            let subtotal = 0;
            for (const item of cart) {
                subtotal += shop.getProduct(item.id).price * item.quantity;
            }
            const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
            let delivery = 0;
            if (cart.length > 0 && deliverySelect.value === "courier" && subtotal < 50000) {
                delivery = 2000;
            } else if (cart.length > 0 && deliverySelect.value === "post") {
                delivery = 3000;
            }
            return { subtotal: subtotal, discount: discount, delivery: delivery, total: subtotal - discount + delivery };
        }

        function renderSummary() {
            const totals = calculateTotals(shop.getCart());
            document.getElementById("summary-subtotal").textContent = shop.formatPrice(totals.subtotal);
            document.getElementById("summary-delivery").textContent = shop.formatPrice(totals.delivery);
            document.getElementById("summary-discount").textContent = (totals.discount ? "−" : "") + shop.formatPrice(totals.discount);
            document.getElementById("summary-total").textContent = shop.formatPrice(totals.total);
            document.getElementById("remove-promo").hidden = !promoApplied;
            document.getElementById("promo-status").textContent = promoApplied ? "SHOQAN10 applied: 10% off products." : "";
        }

        function createCartRow(item, index) {
            const product = shop.getProduct(item.id);
            const row = document.createElement("tr");
            row.dataset.id = item.id;
            row.dataset.size = item.size;

            row.innerHTML = '<td><div class="cart-product"><img><div><a></a><small class="d-block text-muted"></small></div></div></td>' +
                '<td class="item-size"></td>' +
                '<td><input type="number" class="form-control form-control-sm rounded-0 qty" min="1" max="10" step="1"><p class="field-error quantity-error" aria-live="polite"></p></td>' +
                '<td class="line-total text-nowrap"></td>' +
                '<td><button type="button" class="remove-link" data-remove-item>×</button></td>';
            row.querySelector("img").src = product.image;
            row.querySelector("img").alt = product.name;
            row.querySelector("a").href = "product.html?id=" + encodeURIComponent(item.id);
            row.querySelector("a").textContent = product.name;
            row.querySelector("small").textContent = product.color + " · " + shop.formatPrice(product.price) + " each";
            row.querySelector(".item-size").textContent = item.size;
            row.querySelector(".line-total").textContent = shop.formatPrice(product.price * item.quantity);
            const quantity = row.querySelector(".qty");
            quantity.value = item.quantity;
            quantity.id = "cart-quantity-" + index;
            quantity.setAttribute("aria-label", "Quantity, " + product.name + ", size " + item.size);
            quantity.setAttribute("aria-describedby", quantity.id + "-error");
            row.querySelector(".quantity-error").id = quantity.id + "-error";
            row.querySelector("[data-remove-item]").setAttribute("aria-label", "Remove " + product.name + ", size " + item.size);
            return row;
        }

        function renderCart() {
            const cart = shop.getCart();
            cartItems.replaceChildren();
            let count = 0;
            cart.forEach(function (item, index) {
                cartItems.appendChild(createCartRow(item, index));
                count += item.quantity;
            });
            const empty = cart.length === 0;
            if (!empty) document.getElementById("order-confirmation").hidden = true;
            document.getElementById("cart-caption").textContent = count + (count === 1 ? " item in your cart" : " items in your cart");
            document.getElementById("cart-empty").hidden = !empty;
            document.getElementById("cart-table-wrap").hidden = empty;
            document.getElementById("checkout").hidden = empty;
            document.getElementById("checkout-link").classList.toggle("disabled", empty);
            document.getElementById("checkout-link").setAttribute("aria-disabled", String(empty));
            document.getElementById("checkout-link").tabIndex = empty ? -1 : 0;
            promoInput.disabled = empty;
            document.getElementById("apply-promo").disabled = empty;
            if (empty) {
                promoApplied = false;
                promoInput.value = "";
                setFieldError("promo", "");
            }
            renderSummary();
        }

        function setFieldError(id, message) {
            const field = document.getElementById(id);
            document.getElementById(id + "-error").textContent = message;
            field.classList.toggle("is-invalid", Boolean(message));
            field.setAttribute("aria-invalid", String(Boolean(message)));
        }

        function updateDeliveryFields() {
            const pickup = deliverySelect.value === "pickup";
            setFieldError("delivery", "");
            ["city", "address", "postal"].forEach(function (id) {
                const field = document.getElementById(id);
                field.disabled = pickup;
                field.required = !pickup && id !== "postal";
                if (pickup) setFieldError(id, "");
            });
            document.getElementById("address-hint").textContent = pickup
                ? "Pickup at Mangilik El Ave 55, Astana. A delivery address is not needed."
                : "Enter a delivery address, or choose boutique pickup.";
            renderSummary();
        }

        function validateCheckout() {
            const name = document.getElementById("full-name").value.trim();
            const email = document.getElementById("email").value.trim();
            const phone = document.getElementById("phone").value.trim().replace(/[\s()-]/g, "");
            const city = document.getElementById("city").value.trim();
            const address = document.getElementById("address").value.trim();
            const postal = document.getElementById("postal").value.trim();
            const pickup = deliverySelect.value === "pickup";
            const payment = checkoutForm.querySelector('input[name="payment"]:checked');
            const checks = [
                ["full-name", name.length >= 2 && name.length <= 80, "Enter your full name (2–80 characters)."],
                ["email", shop.isValidEmail(email) && email.length <= 120, "Enter a valid e-mail address."],
                ["phone", /^(?:\+7|7|8)\d{10}$/.test(phone), "Enter an 11-digit phone number starting with +7 or 8."],
                ["city", pickup || (city.length >= 2 && city.length <= 60), "Enter your city (at least 2 characters)."],
                ["address", pickup || (address.length >= 5 && address.length <= 160), "Enter your street and building (at least 5 characters)."],
                ["postal", pickup || postal === "" || /^\d{6}$/.test(postal), "Use 6 digits, or leave the postal code empty."],
                ["delivery", ["courier", "pickup", "post"].includes(deliverySelect.value), "Choose a delivery method."],
                ["payment", payment && ["card", "kaspi", "bank"].includes(payment.value), "Choose a payment preference."],
                ["comment", document.getElementById("comment").value.length <= 500, "Keep the comment under 501 characters."],
                ["terms", document.getElementById("terms").checked, "Confirm that you understand this is a demo checkout."]
            ];
            let firstInvalid = null;
            checks.forEach(function (check) {
                setFieldError(check[0], check[1] ? "" : check[2]);
                if (!check[1] && !firstInvalid) firstInvalid = document.getElementById(check[0]);
            });
            if (firstInvalid) firstInvalid.focus();
            return firstInvalid === null;
        }

        cartItems.addEventListener("change", function (event) {
            if (!event.target.matches(".qty")) return;
            const input = event.target;
            const quantity = Number(input.value);
            const valid = input.value.trim() !== "" && Number.isInteger(quantity) && quantity >= 1 && quantity <= 10;
            const error = document.getElementById(input.id + "-error");
            error.textContent = valid ? "" : "Use a whole number from 1 to 10.";
            input.classList.toggle("is-invalid", !valid);
            input.setAttribute("aria-invalid", String(!valid));
            if (!valid) return;
            const row = input.closest("tr");
            const cart = shop.getCart();
            const item = cart.find(function (item) { return item.id === row.dataset.id && item.size === row.dataset.size; });
            if (item) item.quantity = quantity;
            shop.setCart(cart);
            document.getElementById("cart-feedback").textContent = "Quantity updated.";
            document.getElementById("checkout-error").textContent = "";
        });

        cartItems.addEventListener("click", function (event) {
            const button = event.target.closest("[data-remove-item]");
            if (!button) return;
            const row = button.closest("tr");
            const cart = shop.getCart().filter(function (item) {
                return !(item.id === row.dataset.id && item.size === row.dataset.size);
            });
            const product = shop.getProduct(row.dataset.id);
            shop.setCart(cart);
            document.getElementById("cart-feedback").textContent = product.name + " removed from your cart.";
        });

        document.getElementById("promo-form").addEventListener("submit", function (event) {
            event.preventDefault();
            promoApplied = shop.getCart().length > 0 && promoInput.value.trim().toUpperCase() === "SHOQAN10";
            setFieldError("promo", promoApplied ? "" : "Enter SHOQAN10 to apply the demo discount.");
            renderSummary();
        });

        promoInput.addEventListener("input", function () {
            promoApplied = false;
            setFieldError("promo", "");
            renderSummary();
        });

        document.getElementById("remove-promo").addEventListener("click", function () {
            promoApplied = false;
            promoInput.value = "";
            setFieldError("promo", "");
            renderSummary();
            promoInput.focus();
        });

        deliverySelect.addEventListener("change", updateDeliveryFields);
        document.getElementById("checkout-link").addEventListener("click", function (event) {
            if (shop.getCart().length === 0) event.preventDefault();
        });

        checkoutForm.addEventListener("input", function (event) {
            if (event.target.name === "payment") setFieldError("payment", "");
            if (event.target.id && document.getElementById(event.target.id + "-error")) {
                setFieldError(event.target.id, "");
            }
        });

        checkoutForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const cart = shop.getCart();
            const invalidQuantity = cartItems.querySelector('.qty[aria-invalid="true"]');
            const checkoutError = document.getElementById("checkout-error");
            checkoutError.textContent = "";
            if (cart.length === 0 || invalidQuantity) {
                checkoutError.textContent = cart.length === 0 ? "Add a product before checking out." : "Correct the item quantities before checking out.";
                if (invalidQuantity) invalidQuantity.focus();
                return;
            }
            if (!validateCheckout()) return;
            const totals = calculateTotals(cart);
            const reference = "DEMO-" + Date.now().toString().slice(-6);
            document.getElementById("order-confirmation-text").textContent = "Reference: " + reference + ". Total: " + shop.formatPrice(totals.total) + ".";
            checkoutForm.reset();
            updateDeliveryFields();
   
            shop.setCart([]);
            document.getElementById("cart-feedback").textContent = "Your demo order is complete and your cart is now empty.";
            const confirmation = document.getElementById("order-confirmation");
            confirmation.hidden = false;
            confirmation.focus();
        });

        document.addEventListener("shoqan:cart", renderCart);
        renderCart();
        updateDeliveryFields();
    });
}());
