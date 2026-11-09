document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const store = window.SHOQAN;
    const filters = document.getElementById("catalog-filters");
    const search = document.getElementById("catalog-search");
    const price = document.getElementById("price-max");
    const sort = document.getElementById("sort");
    const favoritesOnly = document.getElementById("favorites-only");
    const grid = document.getElementById("catalog-products");
    const resultCount = document.getElementById("result-count");
    const emptyState = document.getElementById("catalog-empty");
    const headerSearch = document.querySelector(".search-form input");

    function selectedValues(name) {
        const checked = filters.querySelectorAll('input[name="' + name + '"]:checked');
        return Array.from(checked, function (input) {
            return input.value;
        });
    }

    function getFilteredProducts() {
        const query = search.value.trim().toLowerCase();
        const categories = selectedValues("category");
        const sizes = selectedValues("size");
        const colors = selectedValues("color");
        const favorites = store.getFavorites();

                                                                            
        return store.products.filter(function (product) {
            const searchableText = (product.name + " " + product.category + " " + product.color).toLowerCase();
            const matchesSearch = searchableText.includes(query);
            const matchesCategory = categories.length === 0 || categories.includes(product.category);
            const matchesSize = sizes.length === 0 || product.sizes.some(function (size) {
                return sizes.includes(size);
            });
            const matchesColor = colors.length === 0 || colors.includes(product.color);
            const matchesPrice = product.price <= Number(price.value);
            const matchesFavorite = !favoritesOnly.checked || favorites.includes(product.id);
            return matchesSearch && matchesCategory && matchesSize && matchesColor && matchesPrice && matchesFavorite;
        });
    }

    function renderCatalog() {
        const products = getFilteredProducts();
        if (sort.value === "price-asc") {
            products.sort(function (a, b) { return a.price - b.price; });
        } else if (sort.value === "price-desc") {
            products.sort(function (a, b) { return b.price - a.price; });
        } else if (sort.value === "name") {
            products.sort(function (a, b) { return a.name.localeCompare(b.name); });
        }

        grid.replaceChildren();
        products.forEach(function (product) {
            grid.appendChild(store.createProductCard(product));
        });
        document.getElementById("price-label").textContent = store.formatPrice(Number(price.value));
        resultCount.textContent = "Showing " + products.length + " of " + store.products.length + " products";
        emptyState.hidden = products.length !== 0;
    }

                                                                          
    const parameters = new URLSearchParams(window.location.search);
    search.value = parameters.get("q") || "";
    headerSearch.value = search.value;
    const initialCategories = parameters.getAll("category");
    filters.querySelectorAll('input[name="category"]').forEach(function (input) {
        input.checked = initialCategories.includes(input.value);
    });
    favoritesOnly.checked = parameters.get("favorites") === "1";

    search.addEventListener("input", renderCatalog);
    price.addEventListener("input", renderCatalog);
    filters.addEventListener("change", renderCatalog);
    sort.addEventListener("change", renderCatalog);
    filters.addEventListener("submit", function (event) {
        event.preventDefault();
        renderCatalog();
    });
    document.getElementById("reset-filters").addEventListener("click", function () {
        filters.reset();
        sort.value = "featured";
        headerSearch.value = "";
        renderCatalog();
    });
    document.addEventListener("shoqan:favorites", renderCatalog);

    renderCatalog();
});
