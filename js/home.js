(function () {
    "use strict";
    document.addEventListener("DOMContentLoaded", function () {
        const S = window.SHOQAN;
        const arrivalIds = ["suit-charcoal", "shirt-blue", "coat-grey", "trousers-grey"];
        const arrivals = document.getElementById("arrival-products");
        arrivalIds.forEach(function (id) {
            const column = document.createElement("div");
            column.className = "col-12 col-sm-6 col-lg-3";
            column.appendChild(S.createProductCard(S.getProduct(id)));
            arrivals.appendChild(column);
        });

        const form = document.getElementById("newsletter-form");
        const email = document.getElementById("newsletter-email");
        const error = document.getElementById("newsletter-error");
        const success = document.getElementById("newsletter-success");

        function showError(message) {
            error.textContent = message;
            email.classList.toggle("is-invalid", Boolean(message));
            email.setAttribute("aria-invalid", String(Boolean(message)));
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            success.hidden = true;
            if (!S.isValidEmail(email.value)) {
                showError("Enter a valid email address, for example name@example.com.");
                email.focus();
                return;
            }
            showError("");
            success.textContent = "Thank you! Your email passed validation. This is a demo; no subscription was sent.";
            success.hidden = false;
            form.reset();
        });

        email.addEventListener("input", function () {
            success.hidden = true;
            if (email.getAttribute("aria-invalid") === "true") {
                showError(S.isValidEmail(email.value) ? "" : "Enter a valid email address.");
            }
        });
    });
}());
