(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        const shop = window.SHOQAN;
        const cartItems = document.getElementById("cart-items");
        const checkoutForm = document.getElementById("checkout-form");
        const deliverySelect = document.getElementById("delivery");
        const promoInput = document.getElementById("promo");
        let promoApplied = false;
        let currentStep = 1;

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
            renderReview();
        }

        function calculateCartStatistics(cart) {
            const categories = [];
            let itemCount = 0;
            let subtotal = 0;
            for (const item of cart) {
                const product = shop.getProduct(item.id);
                const amount = product.price * item.quantity;
                let category = categories.find(function (group) { return group.category === product.category; });
                if (!category) {
                    category = { category: product.category, quantity: 0, subtotal: 0 };
                    categories.push(category);
                }
                category.quantity += item.quantity;
                category.subtotal += amount;
                itemCount += item.quantity;
                subtotal += amount;
            }
            categories.sort(function (a, b) { return b.subtotal - a.subtotal; });
            return { categories: categories, itemCount: itemCount, subtotal: subtotal };
        }

        function renderCartStatistics(cart) {
            const statistics = calculateCartStatistics(cart);
            const chart = document.getElementById("category-chart");
            const labels = { suits: "Suits", shirts: "Shirts", coats: "Coats", trousers: "Trousers", accessories: "Accessories" };
            chart.replaceChildren();
            statistics.categories.forEach(function (category) {
                const share = statistics.subtotal > 0 ? category.subtotal / statistics.subtotal * 100 : 0;
                const row = document.createElement("li");
                row.className = "category-stat";
                row.dataset.category = category.category;
                row.innerHTML = '<div class="category-stat-heading"><strong></strong><span></span></div>' +
                    '<p class="category-stat-count"></p><div class="category-bar-track" aria-hidden="true"><div class="category-bar-fill"></div></div>';
                row.querySelector("strong").textContent = labels[category.category] || category.category;
                row.querySelector("span").textContent = shop.formatPrice(category.subtotal);
                row.querySelector(".category-stat-count").textContent = category.quantity + (category.quantity === 1 ? " item" : " items") +
                    " · " + Math.round(share * 10) / 10 + "% of product subtotal";
                row.querySelector(".category-bar-fill").style.width = share + "%";
                chart.appendChild(row);
            });
            const categoryCount = statistics.categories.length;
            document.getElementById("cart-statistics-summary").textContent = statistics.itemCount +
                (statistics.itemCount === 1 ? " item across " : " items across ") + categoryCount +
                (categoryCount === 1 ? " category" : " categories") + " · Product subtotal: " + shop.formatPrice(statistics.subtotal);
            document.getElementById("cart-statistics-empty").hidden = categoryCount > 0;
            chart.hidden = categoryCount === 0;
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
                showCheckoutStep(1, false);
            }
            renderCartStatistics(cart);
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

        function showCheckoutStep(step, focusHeading) {
            currentStep = step;
            const titles = ["Customer details", "Delivery and payment", "Review your order"];
            const buttonLabels = ["Continue to delivery", "Review order", "Place demo order"];
            checkoutForm.querySelectorAll("[data-checkout-step]").forEach(function (section) {
                section.hidden = Number(section.dataset.checkoutStep) !== step;
            });
            document.querySelectorAll("[data-checkout-progress]").forEach(function (item) {
                const number = Number(item.dataset.checkoutProgress);
                item.classList.toggle("is-complete", number < step);
                if (number === step) item.setAttribute("aria-current", "step");
                else item.removeAttribute("aria-current");
            });
            document.getElementById("checkout-step-status").textContent = "Step " + step + " of 3: " + titles[step - 1];
            document.getElementById("checkout-back").hidden = step === 1;
            document.getElementById("checkout-next").textContent = buttonLabels[step - 1];
            if (step === 3) renderReview();
            if (focusHeading) document.getElementById("checkout-step-title-" + step).focus();
        }

        function renderReview() {
            const cart = shop.getCart();
            const totals = calculateTotals(cart);
            const list = document.getElementById("review-items");
            list.replaceChildren();
            cart.forEach(function (item) {
                const product = shop.getProduct(item.id);
                const row = document.createElement("li");
                const description = document.createElement("span");
                const amount = document.createElement("strong");
                description.textContent = product.name + " · Size " + item.size + " · Quantity " + item.quantity;
                amount.textContent = shop.formatPrice(product.price * item.quantity);
                row.append(description, amount);
                list.appendChild(row);
            });
            if (cart.length === 0) {
                const row = document.createElement("li");
                row.textContent = "Your cart is empty.";
                list.appendChild(row);
            }
            document.getElementById("review-subtotal").textContent = shop.formatPrice(totals.subtotal);
            document.getElementById("review-delivery-fee").textContent = shop.formatPrice(totals.delivery);
            document.getElementById("review-discount-label").textContent = promoApplied ? "Discount (SHOQAN10)" : "Discount";
            document.getElementById("review-discount").textContent = (totals.discount ? "−" : "") + shop.formatPrice(totals.discount);
            document.getElementById("review-total").textContent = shop.formatPrice(totals.total);
                                                                                          
            document.getElementById("review-name").textContent = document.getElementById("full-name").value.trim() || "Not entered";
            document.getElementById("review-email").textContent = document.getElementById("email").value.trim() || "Not entered";
            document.getElementById("review-phone").textContent = document.getElementById("phone").value.trim() || "Not entered";
            const deliveryLabels = { courier: "Courier (1–2 days)", pickup: "Boutique pickup", post: "Kazpost (3–5 days)" };
            document.getElementById("review-delivery").textContent = deliveryLabels[deliverySelect.value] || "Not selected";
            const address = ["city", "address", "postal"].map(function (id) { return document.getElementById(id).value.trim(); }).filter(Boolean).join(", ");
            document.getElementById("review-address").textContent = deliverySelect.value === "pickup" ? "Mangilik El Ave 55, Astana" : (address || "Not entered");
            const payment = checkoutForm.querySelector('input[name="payment"]:checked');
            const paymentLabels = { card: "Credit card (demo)", kaspi: "Kaspi QR (demo)", bank: "Bank transfer (demo)" };
            document.getElementById("review-payment").textContent = payment ? paymentLabels[payment.value] || "Not selected" : "Not selected";
            document.getElementById("review-comment").textContent = document.getElementById("comment").value.trim() || "None";
        }

        function validateCheckout(step) {
            const name = document.getElementById("full-name").value.trim();
            const email = document.getElementById("email").value.trim();
            const phone = document.getElementById("phone").value.trim().replace(/[\s()-]/g, "");
            const city = document.getElementById("city").value.trim();
            const address = document.getElementById("address").value.trim();
            const postal = document.getElementById("postal").value.trim();
            const pickup = deliverySelect.value === "pickup";
            const payment = checkoutForm.querySelector('input[name="payment"]:checked');
                                                                                                        
            const checks = [
                [1, "full-name", name.length >= 2 && name.length <= 80, "Enter your full name (2–80 characters)."],
                [1, "email", shop.isValidEmail(email) && email.length <= 120, "Enter a valid e-mail address."],
                [1, "phone", /^(?:\+7|7|8)\d{10}$/.test(phone), "Enter an 11-digit phone number starting with +7 or 8."],
                [2, "delivery", ["courier", "pickup", "post"].includes(deliverySelect.value), "Choose a delivery method."],
                [2, "city", pickup || (city.length >= 2 && city.length <= 60), "Enter your city (at least 2 characters)."],
                [2, "address", pickup || (address.length >= 5 && address.length <= 160), "Enter your street and building (at least 5 characters)."],
                [2, "postal", pickup || postal === "" || /^\d{6}$/.test(postal), "Use 6 digits, or leave the postal code empty."],
                [2, "payment", payment && ["card", "kaspi", "bank"].includes(payment.value), "Choose a payment preference."],
                [2, "comment", document.getElementById("comment").value.length <= 500, "Keep the comment under 501 characters."],
                [3, "terms", document.getElementById("terms").checked, "Confirm that you understand this is a demo checkout."]
            ];
            let firstInvalid = null;
            checks.forEach(function (check) {
                if (step && check[0] !== step) return;
                setFieldError(check[1], check[2] ? "" : check[3]);
                if (!check[2] && !firstInvalid) firstInvalid = { step: check[0], id: check[1] };
            });
            if (firstInvalid) {
                showCheckoutStep(firstInvalid.step, false);
                document.getElementById(firstInvalid.id).focus();
            }
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
            document.getElementById("checkout-error").textContent = "";
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

        document.getElementById("checkout-back").addEventListener("click", function () {
            document.getElementById("checkout-error").textContent = "";
            if (currentStep > 1) showCheckoutStep(currentStep - 1, true);
        });

        checkoutForm.addEventListener("input", function (event) {
            if (event.target.name === "payment") setFieldError("payment", "");
            if (event.target.id && document.getElementById(event.target.id + "-error")) {
                setFieldError(event.target.id, "");
            }
            renderReview();
        });
        checkoutForm.addEventListener("change", renderReview);

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
                                                                                               
            if (currentStep < 3) {
                if (validateCheckout(currentStep)) showCheckoutStep(currentStep + 1, true);
                return;
            }
            if (!validateCheckout()) return;
            const totals = calculateTotals(cart);
            const reference = "DEMO-" + Date.now().toString().slice(-6);
            document.getElementById("order-confirmation-text").textContent = "Reference: " + reference + ". Total: " + shop.formatPrice(totals.total) + ".";
            checkoutForm.reset();
            showCheckoutStep(1, false);
            updateDeliveryFields();
                                                                                           
            shop.setCart([]);
            document.getElementById("cart-feedback").textContent = "Your demo order is complete and your cart is now empty.";
            const confirmation = document.getElementById("order-confirmation");
            confirmation.hidden = false;
            confirmation.focus();
        });

        document.addEventListener("shoqan:cart", renderCart);
        showCheckoutStep(1, false);
        renderCart();
        updateDeliveryFields();
    });
}());
