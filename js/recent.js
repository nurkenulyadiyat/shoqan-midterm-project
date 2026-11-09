(function () {
    "use strict";

    const store = window.SHOQAN;
    const historyLimit = 6;

    function getRecentProducts() {
        const saved = store.readStorage("recent", []);
        if (!Array.isArray(saved)) return [];
        const recent = [];
                                                                                     
        for (const id of saved) {
            if (typeof id === "string" && store.getProduct(id) && !recent.includes(id)) {
                recent.push(id);
            }
            if (recent.length === historyLimit) break;
        }
        return recent;
    }

    function saveRecentProducts(ids) {
        const saved = store.writeStorage("recent", ids);
        document.dispatchEvent(new CustomEvent("shoqan:recent"));
        return saved;
    }

    function rememberProduct(id) {
        if (typeof id !== "string" || !store.getProduct(id)) return false;
        const recent = getRecentProducts().filter(function (savedId) {
            return savedId !== id;
        });
        recent.unshift(id);
        return saveRecentProducts(recent.slice(0, historyLimit));
    }

    store.getRecentProducts = getRecentProducts;
    store.rememberProduct = rememberProduct;

    document.addEventListener("DOMContentLoaded", function () {
        const grid = document.getElementById("recent-products");
        if (!grid) return;
        const empty = document.getElementById("recent-empty");
        const clearButton = document.getElementById("clear-recent");
        const status = document.getElementById("recent-status");
        status.tabIndex = -1;

        function renderRecentProducts() {
            const ids = getRecentProducts();
            grid.replaceChildren();
            for (const id of ids) {
                const product = store.getProduct(id);
                const card = store.createProductCard(product);
                const remove = document.createElement("button");
                remove.type = "button";
                remove.className = "recent-remove";
                remove.dataset.removeRecent = id;
                remove.textContent = "Remove from history";
                remove.setAttribute("aria-label", "Remove " + product.name + " from recently viewed");
                card.appendChild(remove);
                grid.appendChild(card);
            }
            empty.hidden = ids.length > 0;
            clearButton.disabled = ids.length === 0;
            status.textContent = ids.length ? ids.length + " recently viewed " + (ids.length === 1 ? "product" : "products") + ". Most recent first." : "";
        }

        clearButton.addEventListener("click", function () {
            const saved = saveRecentProducts([]);
            status.textContent = saved ? "Recently viewed history cleared." : "History cleared for this page only. Browser storage is unavailable.";
            status.focus();
        });

        grid.addEventListener("click", function (event) {
            const button = event.target.closest("[data-remove-recent]");
            if (!button) return;
            const id = button.dataset.removeRecent;
            const recent = getRecentProducts();
            const index = recent.indexOf(id);
            const product = store.getProduct(id);
            if (!product || index === -1) {
                renderRecentProducts();
                return;
            }
            const saved = saveRecentProducts(recent.filter(function (savedId) {
                return savedId !== id;
            }));
            status.textContent = product.name + " removed from history." + (saved ? "" : " This change could not be saved in this browser.");
                                                                                  
            const remainingButtons = grid.querySelectorAll("[data-remove-recent]");
            if (remainingButtons.length) remainingButtons[Math.min(index, remainingButtons.length - 1)].focus();
            else status.focus();
        });

        document.addEventListener("shoqan:recent", renderRecentProducts);
        window.addEventListener("storage", function (event) {
            if (event.key === "shoqan.recent" || event.key === null) renderRecentProducts();
        });
        renderRecentProducts();
    });
}());
