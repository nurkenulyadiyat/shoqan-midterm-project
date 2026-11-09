# SHOQAN — Men's Clothing Store

SHOQAN is a responsive online men's clothing store developed as a continuation of our Midterm and Endterm projects. Users can explore clothing, view product details, save favorites, manage a shopping cart, and use additional interactive features.

The project is a client-side website built with HTML, CSS, Bootstrap, JavaScript, and jQuery.

## Team Members

- **Adiyat Nurkenuly** — home page, shared JavaScript functionality, and currency calculator.
- **Bekarys Zhassuzakh** — product catalog, product details, filtering, and recently viewed products.
- **Abubakir Daniyaruly** — shopping cart, contact page, fitting appointments, checkout, and cart statistics.

## Technologies

- HTML5 and CSS3
- Bootstrap for responsive layout
- JavaScript for application logic, DOM manipulation, and event handling
- jQuery for interface interactions and effects
- Fetch API for exchange rates
- localStorage for saving browser data

## Pages

- **Home (`index.html`)** — featured products, currency calculator, and recently viewed items.
- **Catalog (`catalog.html`)** — product listing, search, filters, and sorting.
- **Product (`product.html`)** — product information, gallery, size selection, and related products.
- **Cart (`cart.html`)** — cart management, discount, order checkout, and statistics.
- **Contact (`contact.html`)** — contact form, FAQ, and fitting appointments.

## Main Features

- Dynamic product cards generated from JavaScript data.
- Product search, category and size filters, and sorting.
- Product image gallery and size selection.
- Favorites and shopping cart with quantity updates.
- Promo code, delivery options, and total price calculation.
- Light/dark theme switcher.
- Form validation and jQuery interactions.

## New Final Project Features

1. **Currency calculator:** Retrieves exchange rates from an external API and converts selected product prices from KZT to USD or EUR.
2. **Fitting appointments:** Users can create, view, edit, and delete fitting bookings.
3. **Recently viewed products:** Displays up to six recently opened products, with options to remove individual items or clear the history.
4. **Three-step checkout:** Guides users through contact details, delivery/payment options, and order review, with validation.
5. **Cart statistics:** Displays quantities and subtotals by product category using a simple chart.

## API Integration

The currency calculator uses the public [ExchangeRate-API](https://www.exchangerate-api.com/docs/free).

- **Endpoint:** `https://open.er-api.com/v6/latest/KZT`
- **Method:** `GET` using `fetch()` and `async/await`
- **Data:** Exchange rates for USD and EUR returned as JSON
- **Error handling:** Loading, success, empty-data, and error messages are displayed.
- **Caching:** Valid exchange-rate data can be reused from localStorage for up to 24 hours.

No API key is required. An internet connection is needed to load fresh exchange rates.

## OOP and Data Storage

The `Booking` class in `js/bookings.js` uses a constructor, properties, and methods to manage fitting appointments. Multiple booking objects can be created and updated.

The website uses `localStorage` to save the cart, favorites, theme preference, fitting appointments, recently viewed products, and exchange-rate cache. Saved data is restored when the page is reopened.

## How to Run

1. Clone or download the repository.
2. Open the project folder in VS Code.
3. Open `index.html` using the **Live Server** extension.
4. Navigate through the website in your browser.

Alternatively, run a local server from the project folder:

```bash
python -m http.server 5500
```

Then open `http://localhost:5500`.

No database, backend, or package installation is required.

## Project Links

- **Live Website:** https://nurkenulyadiyat.github.io/shoqan-midterm-project/
- **GitHub Repository:** https://github.com/nurkenulyadiyat/shoqan-midterm-project

**Note:** This is an educational project. Orders, contact messages, and fitting appointments are demonstrations and are not sent to a real store.
