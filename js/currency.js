(function () {
    "use strict";
    const shop = window.SHOQAN;
    const API_URL = "https://open.er-api.com/v6/latest/KZT";
    const currencies = ["USD", "EUR"];
    const cacheLifetime = 24 * 60 * 60 * 1000;

    function parseRates(data) {
        if (!data || data.result !== "success" || data.base_code !== "KZT") {
            throw new Error("The rate provider returned an unexpected response.");
        }
        const rates = {};
        if (!data.rates || typeof data.rates !== "object" || Array.isArray(data.rates)) return rates;
        currencies.forEach(function (code) {
            const rate = data.rates[code];
            if (typeof rate === "number" && Number.isFinite(rate) && rate > 0) rates[code] = rate;
        });
        return rates;
    }

    function convertPrice(amount, rate) {
        if (!Number.isFinite(amount) || amount < 0 || !Number.isFinite(rate) || rate <= 0) return null;
        const converted = amount * rate;
        return Number.isFinite(converted) ? converted : null;
    }

    function foreignPrice(amount, code) {
        if (!Number.isFinite(amount)) return "Unavailable";
        return new Intl.NumberFormat("en-US", {
            style: "currency", currency: code, currencyDisplay: "code"
        }).format(amount);
    }

    async function loadExchangeRates(forceRefresh) {
        const cached = shop.readStorage("rates", null);
        if (!forceRefresh && cached && Number.isFinite(cached.savedAt)) {
            const age = Date.now() - cached.savedAt;
            if (age >= 0 && age < cacheLifetime) {
                try {
                    const rates = parseRates(cached.data);
                    if (Object.keys(rates).length) {
                        return { rates: rates, updatedAt: cached.data.time_last_update_unix, cached: true };
                    }
                } catch (error) {
                                                                                 
                }
            }
        }

        const controller = new AbortController();
        const timeout = setTimeout(function () { controller.abort(); }, 10000);
        try {
            const response = await fetch(API_URL, { signal: controller.signal });
            if (!response.ok) {
                throw new Error(response.status === 429
                    ? "The rate service is busy. Please try again later."
                    : "The rate service could not complete the request.");
            }
            const data = await response.json();
            const rates = parseRates(data);
            if (Object.keys(rates).length) {
                shop.writeStorage("rates", { savedAt: Date.now(), data: data });
            }
            return { rates: rates, updatedAt: data.time_last_update_unix, cached: false };
        } finally {
            clearTimeout(timeout);
        }
    }

                                                                                        
    shop.parseRates = parseRates;
    shop.convertPrice = convertPrice;
    shop.loadExchangeRates = loadExchangeRates;

    document.addEventListener("DOMContentLoaded", function () {
        const section = document.getElementById("currency-tool");
        if (!section) return;
        const productSelect = document.getElementById("currency-product");
        const currencySelect = document.getElementById("currency-code");
        const quantity = document.getElementById("currency-quantity");
        const quantityError = document.getElementById("currency-quantity-error");
        const result = document.getElementById("currency-result");
        const status = document.getElementById("currency-status");
        const rateCards = document.getElementById("currency-rates");
        const refreshButton = document.getElementById("currency-refresh");
        let rates = {};
        let loading = false;
        let readyStatus = "";

        shop.products.forEach(function (product) {
            const option = document.createElement("option");
            option.value = product.id;
            option.textContent = product.name + " — " + shop.formatPrice(product.price);
            productSelect.appendChild(option);
        });
        const preferred = shop.readStorage("currency", "USD");
        currencySelect.value = currencies.includes(preferred) ? preferred : "USD";

        function updateEstimate() {
            if (!loading && Object.keys(rates).length) status.textContent = readyStatus;
            const amount = Number(quantity.value);
            const valid = Number.isInteger(amount) && amount >= 1 && amount <= 10;
            quantityError.textContent = valid ? "" : "Choose a whole quantity from 1 to 10.";
            quantity.classList.toggle("is-invalid", !valid);
            quantity.setAttribute("aria-invalid", String(!valid));
            result.hidden = true;
            const product = shop.getProduct(productSelect.value);
            const rate = rates[currencySelect.value];
            if (!valid || !product || !rate || loading) return;
            const subtotal = product.price * amount;
            const converted = convertPrice(subtotal, rate);
            if (converted === null) {
                status.textContent = "The selected exchange rate cannot be used for an estimate. Refresh rates or choose another currency. Store prices remain in KZT.";
                return;
            }
            result.textContent = amount + " × " + product.name + ": " + shop.formatPrice(subtotal) +
                " ≈ " + foreignPrice(converted, currencySelect.value);
            result.hidden = false;
        }

        function renderRates() {
            rateCards.replaceChildren();
                                                                                          
            for (const code of Object.keys(rates)) {
                const card = document.createElement("div");
                card.className = "rate-card";
                const title = document.createElement("dt");
                title.textContent = "1 000 ₸ in " + code;
                const value = document.createElement("dd");
                value.textContent = foreignPrice(convertPrice(1000, rates[code]), code);
                card.append(title, value);
                rateCards.appendChild(card);
            }
            Array.from(currencySelect.options).forEach(function (option) {
                option.disabled = !rates[option.value];
            });
            if (!rates[currencySelect.value]) currencySelect.value = Object.keys(rates)[0] || "";
            currencySelect.disabled = Object.keys(rates).length === 0;
        }

        async function refreshRates(forceRefresh) {
            if (loading) return;
            loading = true;
            rates = {};
            rateCards.replaceChildren();
            result.hidden = true;
            currencySelect.disabled = true;
            refreshButton.disabled = true;
            section.setAttribute("aria-busy", "true");
            section.dataset.state = "loading";
            status.textContent = "Loading exchange rates…";
            try {
                const response = await loadExchangeRates(forceRefresh);
                rates = response.rates;
                renderRates();
                if (Object.keys(rates).length === 0) {
                    section.dataset.state = "empty";
                    status.textContent = "The service returned no usable USD or EUR rates. You can retry; all store prices remain available in KZT.";
                } else {
                    section.dataset.state = "success";
                    const stamp = response.updatedAt;
                    const providerDate = new Date(stamp * 1000);
                    const date = Number.isFinite(stamp) && stamp > 0 && Number.isFinite(providerDate.getTime())
                        ? providerDate.toLocaleDateString("en-GB", { timeZone: "UTC" }) : "not supplied";
                    readyStatus = "Rates ready. Provider update: " + date +
                        (response.cached ? " · using a saved response." : " · loaded from the rate service.");
                    status.textContent = readyStatus;
                }
            } catch (error) {
                section.dataset.state = "error";
                status.textContent = error.name === "AbortError"
                    ? "The rate request timed out. Check your connection and try again. Store prices remain in KZT."
                    : "Rates could not be loaded. Check your connection or try again later. Store prices remain in KZT.";
                currencySelect.disabled = true;
            } finally {
                loading = false;
                refreshButton.disabled = false;
                section.setAttribute("aria-busy", "false");
                updateEstimate();
            }
        }

        productSelect.addEventListener("change", updateEstimate);
        quantity.addEventListener("input", updateEstimate);
        currencySelect.addEventListener("change", function () {
            shop.writeStorage("currency", currencySelect.value);
            updateEstimate();
        });
        refreshButton.addEventListener("click", function () { refreshRates(true); });
        refreshRates(false);
    });
}());
