document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const store = window.SHOQAN;
    const parameters = new URLSearchParams(window.location.search);
    const productId = parameters.has("id") ? parameters.get("id") : "suit-navy";
    const product = store.getProduct(productId);

    if (!product) {
        document.getElementById("product-content").hidden = true;
        document.getElementById("product-not-found").hidden = false;
        document.getElementById("product-breadcrumb").textContent = "Product not found";
        document.title = "Product not found — SHOQAN";
        return;
    }

    const form = document.getElementById("product-form");
    const quantity = document.getElementById("quantity");
    const formError = document.getElementById("product-form-error");
    const mainImage = document.getElementById("main-product-image");
    const thumbnails = document.getElementById("product-thumbnails");
    const images = product.images.length ? product.images : [product.image];

    function showImage(index) {
        mainImage.src = images[index];
        mainImage.alt = product.name + ", view " + (index + 1);
        document.getElementById("photo-note").textContent = "View " + (index + 1) + " of " + images.length;
        thumbnails.querySelectorAll("button").forEach(function (button, buttonIndex) {
            button.setAttribute("aria-pressed", String(buttonIndex === index));
        });
    }

    function renderGallery() {
        images.forEach(function (path, index) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "gallery-thumb";
            button.dataset.imageIndex = index;
            button.setAttribute("aria-label", "Show view " + (index + 1) + " of " + product.name);
            const image = document.createElement("img");
            image.src = path;
            image.alt = "";
            button.appendChild(image);
            thumbnails.appendChild(button);
        });
        thumbnails.hidden = images.length < 2;
        showImage(0);
    }

    function renderSizes() {
        const sizeOptions = document.getElementById("size-options");
        const defaultSize = product.sizes.includes("M") ? "M" : product.sizes[0];
        product.sizes.forEach(function (size, index) {
            const input = document.createElement("input");
            input.type = "radio";
            input.id = "product-size-" + index;
            input.name = "size";
            input.value = size;
            input.checked = size === defaultSize;
            const label = document.createElement("label");
            label.htmlFor = input.id;
            label.className = "size-box";
            label.textContent = size;
            sizeOptions.append(input, label);
        });
        document.getElementById("size-guide-note").hidden = !product.sizes.includes("One size");
    }

    function renderProduct() {
        document.title = product.name + " — SHOQAN";
        document.getElementById("product-name").textContent = product.name;
        document.getElementById("product-breadcrumb").textContent = product.name;
        document.getElementById("product-meta").textContent = "Free tailoring at our Astana boutique";
        const categoryLink = document.getElementById("product-category-link");
        categoryLink.textContent = product.category.charAt(0).toUpperCase() + product.category.slice(1);
        categoryLink.href = "catalog.html?category=" + encodeURIComponent(product.category);
        document.getElementById("product-color").textContent = product.color.charAt(0).toUpperCase() + product.color.slice(1);
        const price = document.getElementById("product-price");
        price.textContent = store.formatPrice(product.price);
        if (product.oldPrice && product.oldPrice > product.price) {
            const oldPrice = document.createElement("del");
            oldPrice.textContent = store.formatPrice(product.oldPrice);
            price.append(" ", oldPrice);
        }
        document.getElementById("product-description").textContent = product.description;
        const details = document.getElementById("product-details");
        for (const detail of product.details) {
            const item = document.createElement("li");
            item.textContent = detail;
            details.appendChild(item);
        }
        const favoriteButton = document.getElementById("product-favorite");
        const isFavorite = store.getFavorites().includes(product.id);
        favoriteButton.dataset.favorite = product.id;
        favoriteButton.setAttribute("aria-pressed", String(isFavorite));
        favoriteButton.classList.toggle("is-favorite", isFavorite);
        favoriteButton.setAttribute("aria-label", isFavorite ? "Remove " + product.name + " from favorites" : "Save " + product.name + " to favorites");
        favoriteButton.textContent = isFavorite ? "Saved" : "Save";
        favoriteButton.classList.toggle("is-favorite", isFavorite);
        renderSizes();
        renderGallery();
    }

    function renderRelatedProducts() {
        const relatedProducts = store.products.filter(function (item) {
            return item.id !== product.id;
        }).slice(0, 4);
        const relatedGrid = document.getElementById("related-products");
        for (const relatedProduct of relatedProducts) {
            const column = document.createElement("div");
            column.className = "col-12 col-sm-6 col-lg-3";
            column.appendChild(store.createProductCard(relatedProduct));
            relatedGrid.appendChild(column);
        }
    }

    function clearFormError() {
        formError.textContent = "";
        quantity.removeAttribute("aria-invalid");
    }

    // Links from the footer should also open the corresponding details block.
    function openLinkedDetails() {
        const target = document.getElementById(window.location.hash.slice(1));
        if (target && target.tagName === "DETAILS") {
            target.open = true;
        }
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        clearFormError();
        const amount = Number(quantity.value);
        const selectedSize = form.querySelector('input[name="size"]:checked');
        if (!Number.isInteger(amount) || amount < 1 || amount > 10) {
            formError.textContent = "Enter a whole number from 1 to 10.";
            quantity.setAttribute("aria-invalid", "true");
            quantity.focus();
            return;
        }
        if (!selectedSize) {
            formError.textContent = "Please choose a size.";
            form.querySelector('input[name="size"]').focus();
            return;
        }
        if (!store.addToCart(product.id, selectedSize.value, amount)) {
            formError.textContent = "Your cart can contain up to 10 of this item in the same size.";
            quantity.setAttribute("aria-invalid", "true");
            quantity.focus();
            return;
        }
        store.notify(product.name + " added to cart.");
    });
    form.addEventListener("input", clearFormError);
    form.addEventListener("change", clearFormError);
    thumbnails.addEventListener("click", function (event) {
        const button = event.target.closest("button[data-image-index]");
        if (button) showImage(Number(button.dataset.imageIndex));
    });
    thumbnails.addEventListener("keydown", function (event) {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        const button = event.target.closest("button[data-image-index]");
        if (!button) return;
        event.preventDefault();
        const step = event.key === "ArrowRight" ? 1 : -1;
        const nextIndex = (Number(button.dataset.imageIndex) + step + images.length) % images.length;
        showImage(nextIndex);
        thumbnails.children[nextIndex].focus();
    });
    window.addEventListener("hashchange", openLinkedDetails);

    renderProduct();
    renderRelatedProducts();
    openLinkedDetails();
});
