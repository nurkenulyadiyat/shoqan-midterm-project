
# SHOQAN — Final Project

SHOQAN is a responsive men's clothing store website and a continuation of our Midterm and Endterm projects. The website has five pages and uses HTML, CSS, Bootstrap, JavaScript and jQuery.

## Team Members

- Adiyat Nurkenuly — home page, shared JavaScript and currency calculator.
- Bekarys Zhassuzakh — catalog, product pages and recently viewed products.
- Abubakir Daniyaruly — cart, contact page, fitting bookings and checkout.

## Features

- Product catalog with search, filters and sorting.
- Product details, image gallery, favorites and shopping cart.
- Promo code, delivery options, dark mode and form validation.
- Currency calculator with exchange rates from an external API.
- Fitting appointment management: create, view, edit and delete.
- Recently viewed products.
- Three-step checkout with validation.
- Cart statistics by product category.
- Browser storage for the cart, favorites, theme, bookings and recently viewed products.

## API

The currency calculator uses the public **ExchangeRate-API** endpoint:

`https://open.er-api.com/v6/latest/KZT`

Exchange rates are loaded with `fetch()` and `async/await` and used to display prices in USD or EUR. The calculator handles loading and errors and caches rates in `localStorage`. No API key is required.

## How to Run

1. Download or clone the repository.
2. Open the project folder in VS Code and run `index.html` using **Live Server**.
3. Open the website in your browser. An internet connection is needed to load new exchange rates.

No installation, backend or database is required. Checkout and fitting appointments are demonstrations, not real purchases or bookings.

## Links

- **Website:** https://nurkenulyadiyat.github.io/shoqan-midterm-project/
- **Repository:** https://github.com/nurkenulyadiyat/shoqan-midterm-project
