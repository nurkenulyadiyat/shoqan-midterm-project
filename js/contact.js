(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        const shop = window.SHOQAN;
        const form = document.getElementById("contact-form");
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const duration = reducedMotion ? 0 : 180;

        function showFieldError(id, message) {
            const field = document.getElementById(id);
            field.classList.toggle("is-invalid", Boolean(message));
            field.setAttribute("aria-invalid", String(Boolean(message)));
            document.getElementById(id + "-error").textContent = message;
        }

        function validateContactForm() {
            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("contact-email").value.trim();
            const subject = document.getElementById("subject").value;
            const message = document.getElementById("text").value;
            const checks = [
                ["name", name.length >= 2 && name.length <= 80, "Enter your name (2–80 characters)."],
                ["contact-email", shop.isValidEmail(email) && email.length <= 120, "Enter a valid e-mail address."],
                ["subject", ["order", "fitting", "returns", "other"].includes(subject), "Choose a subject."],
                ["text", message.trim().length >= 10 && message.length <= 1000, "Write a message of 10–1000 characters."]
            ];
            let firstInvalid = null;
            checks.forEach(function (check) {
                showFieldError(check[0], check[1] ? "" : check[2]);
                if (!check[1] && !firstInvalid) firstInvalid = document.getElementById(check[0]);
            });
            if (firstInvalid) firstInvalid.focus();
            return firstInvalid === null;
        }

        function updateMessageCount(field) {
            $(field).closest(".message-field").find(".message-count").text(
                field.value.length + " / 1000 characters (minimum 10)"
            );
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            $("#contact-success").stop(true, true).hide();
            if (!validateContactForm()) return;
            const name = document.getElementById("name").value.trim();
            form.reset();
            updateMessageCount(document.getElementById("text"));
            $("#contact-success")
                .text("Thanks, " + name + ". Your demo message passed validation. No message was sent and your details were not saved.")
                .removeAttr("hidden")
                .hide()
                .fadeIn(duration, function () { this.focus(); });
        });

        form.addEventListener("input", function (event) {
            if (event.target.id && document.getElementById(event.target.id + "-error")) {
                showFieldError(event.target.id, "");
            }
            $("#contact-success").stop(true, true).fadeOut(duration);
        });

        form.addEventListener("change", function (event) {
            if (event.target.id && document.getElementById(event.target.id + "-error")) {
                showFieldError(event.target.id, "");
            }
        });

  
        $("#text").on("input", function () {
            updateMessageCount(this);
        });

        $(".faq-answer").removeAttr("hidden").hide();
        $(".faq-toggle").on("click", function () {
            const button = $(this);
            const item = button.closest(".faq-item");
            const answer = item.find(".faq-answer");
            const willOpen = button.attr("aria-expanded") !== "true";
            $(".faq-toggle").not(this).attr("aria-expanded", "false").find(".faq-icon").text("+");
            
            $(".faq-item").not(item).find(".faq-answer").stop(true, true).slideUp(duration);
            button.attr("aria-expanded", String(willOpen)).find(".faq-icon").text(willOpen ? "−" : "+");
            if (willOpen) {
                answer.stop(true, true).slideDown(duration);
            } else {
                answer.stop(true, true).slideUp(duration);
            }
        });
    });
}());
