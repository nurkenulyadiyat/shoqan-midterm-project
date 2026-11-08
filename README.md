# SHOQAN — Classic Menswear

Endterm continuation of our midterm website: a fictional menswear boutique in Astana, Kazakhstan.
The same topic, team, five pages, product illustrations and responsive Bootstrap layout are retained.

**Team:** Adiyat Nurkenuly, Bekarys Zhassuzakh, Abubakir Daniyaruly

**Existing website address:** https://nurkenulyadiyat.github.io/shoqan-midterm-project/

The endterm changes appear there after the team pushes the files and GitHub Pages finishes deploying.
This is a static student project. Checkout, contact and newsletter forms demonstrate client-side validation;
they do not send orders, messages, subscriptions or payments.

## Run the project

Use GitHub Pages or a local HTTP server. From the repository folder:

```bash
python -m http.server 5500
```

Then open `http://localhost:5500`. On Windows, `py -m http.server 5500` also works if Python is installed.
VS Code Live Server is an alternative. No npm install, compilation, backend or database is needed.
Use the same address and port for all pages so browser storage is shared.
Opening separate HTML files with `file://` is not a reliable way to test cross-page storage.

## Pages and endterm work packages

These packages follow the midterm page assignments. Each member reviews, tests and commits their package.

| Member | Files to review and commit | Endterm features |
| --- | --- | --- |
| Adiyat | `index.html`, `css/style.css`, `js/data.js`, `js/common.js`, `js/home.js`, `js/vendor/`, `README.md` | Product data, shared cart/favorites helpers, dynamic arrivals, theme switch, newsletter validation, integration and documentation |
| Bekarys | `catalog.html`, `product.html`, `css/catalog.css`, `css/product.css`, `js/catalog.js`, `js/product.js` | Search, combined filters, sorting, favorites view, dynamic product details, size/quantity selection and gallery |
| Abubakir | `cart.html`, `contact.html`, `css/cart.css`, `css/contact.css`, `js/cart.js`, `js/contact.js` | Cart quantities/removal, totals, promo, delivery, checkout/contact validation, jQuery FAQ and message counter |

Apply Adiyat's package first, then the two page packages. Package file lists do not overlap.
Everyone pulls the latest `main` before copying their package. Keep all original files that are not replaced,
including `images/`, Bootstrap CSS and `css/home.css`.

## Interactive features

- **Catalog:** ten actual products rendered from an array; live search; category, size, colour and maximum-price filters; price/name sorting; reset; accurate result count and empty state.
- **Favorites:** Save/Saved buttons on product cards and product pages; Favorites only in the catalog. Saved IDs persist across pages and reloads.
- **Product:** matching details via `product.html?id=shirt-white`, available sizes, quantities from 1 to 10, and a gallery. The navy suit has three views; its gallery also supports left/right arrow keys.
- **Cart:** starts empty; adds and merges identical product/size variants; updates quantity; removes rows; recalculates totals. Different sizes stay separate.
- **Promo and delivery:** `SHOQAN10` gives 10% off products. Courier delivery is 2,000 tenge below a 50,000-tenge subtotal and free from that subtotal; the threshold is checked before the discount. Pickup is free; Kazpost costs 3,000 tenge. The discount does not apply to delivery.
- **Checkout:** custom field-specific errors, pickup-specific address rules, a visible demo success message, and cart clearing after successful validation.
- **Contact:** name/email/subject/message validation, live character count and a success message. Messages must contain 10–1000 characters.
- **jQuery:** useful FAQ slide animations and contact success fade animations. Reduced-motion preferences are respected.
- **Shared theme:** light/dark toggle on all pages; saved in browser storage.
- **Newsletter:** email validation and local demo feedback.

Quick-add buttons use size M when available, otherwise the product's first size. The card explains this;
open a product page to choose another size. Cart quantities are limited to 10 per product/size variant.

## Where the requirements appear

| Requirement | Code examples |
| --- | --- |
| Same project and at least five connected pages | The original Home, Catalog, Product, Cart / Checkout and Contact pages and navigation |
| At least two arrays | `SHOQAN.products` in `js/data.js`; cart and favorites arrays in `js/common.js`; `arrivalIds` in `js/home.js` |
| At least two loop examples | `for...of` in `cleanCart()` and `calculateTotals()`; `forEach()` in `renderCatalog()` and home rendering |
| Reusable functions with parameters and return values | `getProduct(id)`, `formatPrice(value)`, `isValidEmail(value)`, `addToCart(id, size, quantity)`, `calculateTotals(cart)` |
| Dynamic content, addition and removal | `createProductCard()`, `renderCatalog()`, `createCartRow()`, `renderCart()` and removal handler |
| Five or more useful interface features | Search, filtering, sorting, favorites, theme, gallery and cart |
| Native events, event object and submission control | `addEventListener`; click/input/change/submit/keydown/DOMContentLoaded; `event.target`; `event.preventDefault()` |
| Substantial custom form validation | `validateCheckout()` and `validateContactForm()`; `novalidate` prevents browser popups replacing our field messages |
| Two jQuery selector types | `$("#text")` and `$(".faq-toggle")` in `js/contact.js` |
| Two jQuery traversal methods | `closest()` and `find()` for field counters and FAQ answers |
| Two jQuery user events | `.on("input", ...)` and `.on("click", ...)` |
| Two useful jQuery effect families | `slideUp()` / `slideDown()` for FAQ; `fadeIn()` / `fadeOut()` for contact feedback |
| External JavaScript and accessible feedback | Separate `js/` files, labels, `aria-describedby`, `aria-invalid`, status regions and keyboard buttons |

## Quick manual test

1. Open Home. The initial cart count is zero in a fresh browser. Switch the theme and navigate to another page: the theme stays selected.
2. Search for `shirt` in the header. The catalog shows two shirts. Try combined filters, a price limit, both price-sort directions and Reset filters.
3. Search for a nonexistent name. The empty state appears. Save an item, enable Favorites only, reload, and confirm it remains saved. Remove it from favorites.
4. Open Navy Wool Suit. Select gallery views and press arrow keys on a thumbnail. Add size M twice and size L once; the cart shows two variants with quantities 2 and 1.
5. Try quantity 0, 11, a decimal and an empty input. Each must be rejected with a clear error. Remove items and check the empty state and badge.
6. For an exact total check, keep only one White Poplin Shirt (22,900 tenge). Courier total is 24,900. Apply `SHOQAN10`: discount is 2,290 and total is 22,610. Pickup makes the total 20,610; Kazpost makes it 23,610. An invalid promo must remove the discount.
7. Submit an incomplete checkout. Fix fields using example details such as `Demo Student`, `demo@example.com`, `+7 777 123 45 67`, `Astana`, `Example Street 10`, optional postal `010000`, and tick the demo acknowledgement. A valid demo order shows a reference/total and clears the cart; no real order is sent.
8. Submit an empty contact form. Correct the name/email/subject and enter at least ten message characters. Check the counter and fading success panel. Open/close different FAQ items, including rapid repeated clicks.
9. Submit an invalid then valid newsletter email. Check local error/success feedback.
10. Inspect all five pages at a narrow mobile width and on desktop. Use the keyboard for controls; open DevTools Console and confirm there are no application errors.

## How the scripts connect

Each page loads `data.js`, then `common.js`, then its page script using `defer`.
Initialization runs on `DOMContentLoaded`. The contact page also loads local jQuery before `contact.js`.

`window.SHOQAN` is a small shared object containing the product array and reusable helpers.
Cart rows are `{ id, size, quantity }`; prices are read from the product array rather than browser storage.
`setCart()` and `toggleFavorite()` save changes and dispatch `shoqan:cart` / `shoqan:favorites` events,
which refresh the relevant interface. A delegated click listener handles buttons in dynamically created cards.

Browser storage uses only `shoqan.cart`, `shoqan.favorites` and `shoqan.theme`.
Invalid stored data is ignored. If storage is blocked, changes work in memory on the current page and cannot
persist across navigation. Checkout/contact details are never stored.
This client-side validation is appropriate for this static assignment; a real shop would also need a backend.

## Defence

Every group member should be able to explain the shared helpers and the other members' pages.
The requirements allocate 40 points to defence and allow questions about any part of the group code.
Practise locating the array, loops, returning functions, DOM creation/removal, event handlers, validation,
and jQuery selectors/traversal/effects in the actual files. Demonstrate each feature in the published site.

## Technologies and deployment

- HTML5, CSS3, responsive Bootstrap 5.3.3 CSS and the original SVG illustrations.
- Plain JavaScript and local jQuery 3.6.1 (full build with effects). Its license is in `js/vendor/jquery-LICENSE.txt`.
- Google Fonts is optional; the existing CSS includes system-font fallbacks.
- Continue using the existing GitHub repository and its Pages configuration. This project needs no build command.
- If Pages is not configured, select the `main` branch and repository root as the source, then wait for deployment.
- After all three packages are merged and published, test the site and submit the published URL required by the assignment.
