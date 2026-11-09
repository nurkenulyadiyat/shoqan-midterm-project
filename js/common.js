(function () {
    "use strict";
    const S = window.SHOQAN;
    const memory = {};
    let storageAvailable = true;
    let toastTimer;

    function getProduct(id) {
        return S.products.find(function (product) { return product.id === id; });
    }

    function formatPrice(value) {
        return Number(value).toLocaleString("en-US").replace(/,/g, " ") + " ₸";
    }

    function isValidEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
    }

    function readStorage(key, fallback) {
        if (!storageAvailable) return memory[key] === undefined ? fallback : memory[key];
        let raw;
        try {
            raw = localStorage.getItem("shoqan." + key);
        } catch (error) {
            storageAvailable = false;
            return memory[key] === undefined ? fallback : memory[key];
        }
        if (raw === null) return fallback;
        try {
            const value = JSON.parse(raw);
            memory[key] = value;
            return value;
        } catch (error) {
            return fallback;
        }
    }

    function writeStorage(key, value) {
        memory[key] = value;
        try {
            localStorage.setItem("shoqan." + key, JSON.stringify(value));
        } catch (error) {
            storageAvailable = false;
            notify("Browser storage is unavailable. Changes will last only on this page.");
        }
    }

    function cleanCart(value) {
        const cart = [];
        if (!Array.isArray(value)) return cart;
   
        for (const row of value) {
            if (!row || typeof row !== "object") continue;
            const product = getProduct(row.id);
            if (!product || !product.sizes.includes(row.size)) continue;
            if (!Number.isInteger(row.quantity) || row.quantity < 1 || row.quantity > 10) continue;
            const existing = cart.find(function (item) {
                return item.id === row.id && item.size === row.size;
            });
            if (existing) existing.quantity = Math.min(10, existing.quantity + row.quantity);
            else cart.push({ id: row.id, size: row.size, quantity: row.quantity });
        }
        return cart;
    }

    function getCart() {
        return cleanCart(readStorage("cart", []));
    }

    function setCart(items) {
        writeStorage("cart", cleanCart(items));
        document.dispatchEvent(new CustomEvent("shoqan:cart"));
    }

    function addToCart(id, size, quantity) {
        const product = getProduct(id);
        if (!product || !product.sizes.includes(size) || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) return false;
        const cart = getCart();
        const existing = cart.find(function (item) { return item.id === id && item.size === size; });
        if (existing && existing.quantity + quantity > 10) return false;
        if (existing) existing.quantity += quantity;
        else cart.push({ id: id, size: size, quantity: quantity });
        setCart(cart);
        return true;
    }

    function getFavorites() {
        const value = readStorage("favorites", []);
        if (!Array.isArray(value)) return [];
        return value.filter(function (id, index) {
            return Boolean(getProduct(id)) && value.indexOf(id) === index;
        });
    }

    function toggleFavorite(id) {
        if (!getProduct(id)) return false;
        const favorites = getFavorites();
        const index = favorites.indexOf(id);
        if (index === -1) favorites.push(id);
        else favorites.splice(index, 1);
        writeStorage("favorites", favorites);
        document.dispatchEvent(new CustomEvent("shoqan:favorites"));
        return index === -1;
    }

    function updateCartCount() {
        let count = 0;
        for (const item of getCart()) count += item.quantity;
        document.querySelectorAll(".cart-count").forEach(function (badge) {
            badge.textContent = count;
            badge.setAttribute("aria-label", count + " items in cart");
        });
    }

    function updateFavoriteButtons() {
        const favorites = getFavorites();
        document.querySelectorAll("[data-favorite]").forEach(function (button) {
            const product = getProduct(button.dataset.favorite);
            if (!product) return;
            const saved = favorites.includes(product.id);
            button.textContent = saved ? "Saved" : "Save";
            button.setAttribute("aria-pressed", String(saved));
            button.setAttribute("aria-label", saved ? "Remove " + product.name + " from favorites" : "Save " + product.name + " to favorites");
            button.classList.toggle("is-favorite", saved);
        });
    }

    function notify(message) {
        let toast = document.getElementById("site-notice");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "site-notice";
            toast.className = "site-notice";
            toast.setAttribute("role", "status");
            toast.setAttribute("aria-live", "polite");
            document.body.appendChild(toast);
        }
        clearTimeout(toastTimer);
        toast.textContent = message;
        toast.hidden = false;
        toastTimer = setTimeout(function () { toast.hidden = true; }, 4000);
    }

    function setTheme(theme) {
        document.documentElement.dataset.theme = theme === "dark" ? "dark" : "light";
        document.documentElement.dataset.bsTheme = document.documentElement.dataset.theme;
        document.querySelectorAll(".theme-toggle").forEach(function (button) {
            const dark = theme === "dark";
            button.setAttribute("aria-pressed", String(dark));
            button.textContent = dark ? "Light mode" : "Dark mode";
        });
    }

    function createProductCard(product) {
        const card = document.createElement("article");
        card.className = "product-card";
        card.dataset.productId = product.id;
        const photoLink = document.createElement("a");
        photoLink.href = "product.html?id=" + encodeURIComponent(product.id);
        const photo = document.createElement("img");
        photo.src = product.image;
        photo.alt = product.name;
        photo.loading = "lazy";
        photoLink.appendChild(photo);
        card.appendChild(photoLink);
        if (product.oldPrice) {
            const sale = document.createElement("span");
            sale.className = "badge-sale";
            sale.textContent = "Sale";
            card.appendChild(sale);
        }
        const title = document.createElement("h3");
        const link = document.createElement("a");
        link.href = photoLink.href;
        link.textContent = product.name;
        title.appendChild(link);
        card.appendChild(title);
        const price = document.createElement("p");
        price.className = "price";
        price.textContent = formatPrice(product.price);
        if (product.oldPrice) {
            const old = document.createElement("del");
            old.textContent = formatPrice(product.oldPrice);
            price.appendChild(old);
        }
        card.appendChild(price);
        const size = product.sizes.includes("M") ? "M" : product.sizes[0];
        const hint = document.createElement("p");
        hint.className = "small text-muted mb-2";
        hint.textContent = "Quick add: " + size + ". Open item for other sizes.";
        card.appendChild(hint);
        const actions = document.createElement("div");
        actions.className = "card-actions";
        const add = document.createElement("button");
        add.type = "button";
        add.className = "btn btn-shoqan";
        add.dataset.addProduct = product.id;
        add.textContent = "Add to cart";
        const favorite = document.createElement("button");
        favorite.type = "button";
        favorite.className = "btn btn-outline-shoqan favorite-button";
        favorite.dataset.favorite = product.id;
        const saved = getFavorites().includes(product.id);
        favorite.textContent = saved ? "Saved" : "Save";
        favorite.setAttribute("aria-pressed", String(saved));
        favorite.setAttribute("aria-label", saved ? "Remove " + product.name + " from favorites" : "Save " + product.name + " to favorites");
        favorite.classList.toggle("is-favorite", saved);
        actions.append(add, favorite);
        card.appendChild(actions);
        return card;
    }

    Object.assign(S, {
        getProduct, formatPrice, isValidEmail, getCart, setCart, addToCart,
        getFavorites, toggleFavorite, notify, createProductCard
    });

    document.addEventListener("DOMContentLoaded", function () {
        setTheme(readStorage("theme", "light"));
        updateCartCount();
        updateFavoriteButtons();
        document.querySelectorAll(".theme-toggle").forEach(function (button) {
            button.addEventListener("click", function () {
                const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
                setTheme(next);
                writeStorage("theme", next);
            });
        });
    });

    
    document.addEventListener("click", function (event) {
        const add = event.target.closest("[data-add-product]");
        if (add) {
            const product = getProduct(add.dataset.addProduct);
            if (!product) return;
            const size = product.sizes.includes("M") ? "M" : product.sizes[0];
            const added = addToCart(product.id, size, 1);
            notify(added ? product.name + " (" + size + ") added to cart." : "Maximum 10 of this product and size per order.");
        }
        const favorite = event.target.closest("[data-favorite]");
        if (favorite) {
            const saved = toggleFavorite(favorite.dataset.favorite);
            notify(saved ? "Saved to favorites. Find saved items in the catalog." : "Removed from favorites.");
        }
    });

    document.addEventListener("shoqan:cart", updateCartCount);
    document.addEventListener("shoqan:favorites", updateFavoriteButtons);
    window.addEventListener("storage", function (event) {
        if (event.key === "shoqan.cart" || event.key === null) document.dispatchEvent(new CustomEvent("shoqan:cart"));
        if (event.key === "shoqan.favorites" || event.key === null) document.dispatchEvent(new CustomEvent("shoqan:favorites"));
        if (event.key === "shoqan.theme" || event.key === null) setTheme(readStorage("theme", "light"));
    });
}());
