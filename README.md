# SHOQAN — Classic Menswear · Final Project

Final continuation of our midterm and endterm website: a fictional menswear boutique in Astana, Kazakhstan.
The same team, topic, five connected pages, SVG products and responsive Bootstrap design are retained.
All endterm search, filters, favorites, cart, validation, gallery, theme and jQuery features remain included.

**Team:** Adiyat Nurkenuly, Bekarys Zhassuzakh, Abubakir Daniyaruly

**Repository:** https://github.com/nurkenulyadiyat/shoqan-midterm-project

**Existing website address:** https://nurkenulyadiyat.github.io/shoqan-midterm-project/

The final version appears at that address after the final files are pushed and GitHub Pages finishes deploying.
This is a static student project. Checkout, contact messages, newsletter subscriptions and fitting appointments
are demonstrations; no real order, payment, message or reservation is transmitted.

## Run

Use GitHub Pages, VS Code Live Server, or a local HTTP server from the project folder:

```bash
python -m http.server 5500
```

Open `http://localhost:5500`. On Windows, `py -m http.server 5500` also works if Python is installed.
There is no npm install, compilation, backend or database. Keep the same address and port between pages,
so their browser storage is shared. Separate `file://` pages are not a reliable storage test.
An internet connection is needed for fresh currency rates; Google Fonts has system-font fallbacks.

## Exactly five substantial additions after endterm

| # | New final feature | Where to demonstrate it | Main files |
| --- | --- | --- | --- |
| 1 | Remote currency price calculator: choose a product, quantity and USD/EUR; show remote-rate cards and the estimated converted price | Home, “A price in your currency” | `js/currency.js`, `index.html`, `css/home.css` |
| 2 | Fitting appointments: create, view, edit, cancel editing, delete and clear saved appointments | Contact, “Book a fitting” | `js/bookings.js`, `contact.html`, `css/contact.css` |
| 3 | Recently viewed products: automatic history, newest first, six-item limit, individual removal and clear | Home and Product | `js/recent.js`, `css/recent.css`, `js/product.js`, `product.html` |
| 4 | Three-step checkout: customer → delivery/payment → review/confirmation; validation before moving forward | Cart / Checkout | `js/cart.js`, `cart.html`, `css/cart.css` |
| 5 | Category statistics: item/category counts, subtotals and labeled bar chart, updating as the cart changes | Cart, “Your cart by category” | `js/cart.js`, `cart.html`, `css/cart.css` |

The OOP class and storage helpers implement these features; they are not counted as separate extra features.
Existing endterm features such as dark mode and basic filtering are also not counted again as final additions.

## Mandatory requirements and additional choices

| Requirement | Implementation |
| --- | --- |
| External API, `fetch`, Promises / async-await | `loadExchangeRates()` in `js/currency.js` uses `fetch` and `await response.json()` |
| Loading, success, empty-data and error states | `refreshRates()` updates `#currency-tool[data-state]`, status text and controls; handles a timeout and retries |
| Dynamic DOM built from remote JSON | `parseRates()` selects valid USD/EUR rates; `renderRates()` creates rate cards and `updateEstimate()` calculates a product price |
| Meaningful JavaScript class | `Booking` has a constructor, properties and `update()`, `getLabel()`, `isPast()`, `toJSON()` methods |
| Multiple real class instances | Each created appointment is `new Booking(values)`; valid saved records are restored with `new Booking(data)` |
| Persistent JSON data and safe restoration | Shared storage helpers plus validation in `loadBookings()` and `getRecentProducts()`; editing/removal/clear are available |
| Additional choice: full CRUD | The fitting appointment interface implements Create, Read, Update and Delete |
| Additional choice: advanced form | Checkout has three steps, dependent address requirements, calculated totals and final full validation |
| Additional choice: meaningful visualization | Category subtotal bars, percentages, quantities, labels and an empty state |
| Earlier course features | Arrays, functions, loops, native events, DOM, validation and jQuery remain in the five pages |

## API information

**Provider:** [ExchangeRate-API Open Access](https://www.exchangerate-api.com/docs/free)

**Endpoint:** `https://open.er-api.com/v6/latest/KZT`

The open endpoint requires no secret key. Its documentation requires attribution, allows caching and describes
daily updates and rate limits. Home includes the visible provider attribution link.

Fields used: `result`, `base_code`, `rates.USD`, `rates.EUR`, `time_last_update_unix`.
Only positive, finite numeric rates are accepted. The base must be KZT and the result must indicate success.
A successful response without usable USD/EUR rates produces the empty-data state. An HTTP/network/JSON error
produces the error state. The request is aborted after ten seconds; Refresh rates / retry allows another attempt.

A validated response saved less than 24 hours ago is reused to avoid unnecessary requests. A forced refresh
always requests the service. Missing, stale, future-dated and malformed caches are ignored. Failed requests
preserve the old stored entry but hide the current estimate; stale data is not silently presented as a new response.
The widget displays the provider's update date and whether a saved response was used.

Converted prices are estimates for the selected product/quantity. All catalog, cart and checkout amounts remain
in KZT; the calculator excludes delivery. Payment providers may use a different conversion rate.

## Booking class and data

`Booking` properties are `id`, `name`, `date`, `time`, `service`, and `notes`.

- `constructor(data)` creates a distinct record and calls `update(data)`.
- `update(data)` changes editable properties while preserving the record ID.
- `getLabel()` creates the appointment heading used by the UI.
- `isPast()` distinguishes past and upcoming records.
- `toJSON()` returns the fields saved in browser storage.

The appointment form offers suit fitting, shirt fitting and alterations consultations, at 11:00, 13:00, 15:00 or 17:00.
It checks the name, service, a real calendar date from today through 90 days ahead, a future time, notes of at most
300 characters and duplicate local date/time slots. Dates/times use the browser's local clock. Past saved
appointments remain readable; editing one requires a future slot. This is a local demo, not shared shop availability.

## Browser storage

All keys begin with `shoqan.`:

| Key | Saved data | Update / clear |
| --- | --- | --- |
| `cart` | Product ID, size and quantity | Change quantity, remove items, complete a valid demo checkout |
| `favorites` | Product IDs | Save / Saved buttons |
| `theme` | Light or dark preference | Theme button |
| `recent` | Up to six unique known product IDs, newest first | Open products, Remove from history, Clear history |
| `bookings` | Appointment records as JSON | Add, Edit, Delete, Clear all |
| `rates` | Successful API response and save timestamp | Refresh rates / retry; expired data is replaced |
| `currency` | Preferred USD/EUR option | Currency selector |

`readStorage()` handles missing or malformed JSON. Feature-specific restoration rejects invalid fields and unknown
IDs. `writeStorage()` returns whether the write succeeded; blocked storage falls back to the current page's memory
and shows a message. Cross-page persistence then cannot be guaranteed.
Checkout and contact-message details are not saved. Appointment names and notes are saved locally for the booking
feature and can be removed through its interface.

## Existing endterm behavior

- Ten products come from `js/data.js`; dynamic arrivals and cards use the same data and prices.
- Catalog search, category/size/color/price filters, price/name sorting, reset and favorites-only view are retained.
- Product IDs, sizes, quantities, favorites, gallery thumbnails and arrow-key gallery navigation remain available.
- Quick add uses size M when available, otherwise the first size; the card says which size will be added.
- Cart variants are identified by product ID plus size. Quantities must be whole numbers from 1 to 10 per variant.
- `SHOQAN10` gives 10% off products only. Courier is 2,000 KZT below a 50,000 KZT subtotal and free from that amount
  before discount; pickup is free; Kazpost is 3,000 KZT.
- Contact-message and newsletter validation remain client-side demonstrations.
- `js/contact.js` retains jQuery ID/class selectors, click/input handlers, `closest()` / `find()` traversal,
  FAQ `slideUp()` / `slideDown()` and success `fadeIn()` / `fadeOut()`. Reduced-motion preferences are respected.

## Test the final features

1. **API success:** open Home and scroll to the currency calculator. Wait for rates or use Refresh rates / retry.
   Select another product, quantity and currency; verify that the estimate and remote-rate cards update.
2. **API input and failure:** quantities 0, 11, a decimal or blank must show a field error. In browser DevTools,
   enable Offline and click Refresh rates / retry: an error must appear without breaking the store. Restore Online
   and retry. A saved response may be used on ordinary reload; the refresh button forces a request.
3. **API empty/invalid response:** use browser response overrides or a mocked fetch during testing to return a
   successful KZT response with an empty `rates` object. The widget must show its empty-data message. Unexpected
   base/result or invalid JSON must show an error. These cases are handled in code; real provider data is not replaced
   by hardcoded demo rates in the submitted project.
4. **Multiple Booking instances:** create two demo appointments for different future slots. Both should appear.
   Refresh Contact and confirm both are restored. Edit one: its ID stays the same and the other is unchanged.
5. **Booking validation:** try a short name, empty fields, a past date/time, a date over 90 days ahead, or an occupied
   local slot. Errors should appear beside the relevant fields. Cancel an edit, delete one record and test Clear all.
6. **Recent products:** open several different product pages, then return Home. The newest is first. Reopen an older
   item: it moves to the front without duplication. History is limited to six, survives reload and supports removal/clear.
7. **Checkout:** add items, submit an empty first step and inspect its errors. Enter example customer details, continue
   to delivery, then review. Back preserves values. Enter on an early step should advance only after validation;
   it must not place an order early. Pickup disables address requirements. Final submission checks all steps again.
8. **Review and total:** with one White Poplin Shirt, courier total is 24,900 KZT. `SHOQAN10` makes it 22,610; pickup
   makes it 20,610; Kazpost makes it 23,610. Editing or rejecting the promo removes the previous discount. Review must
   agree with the summary. A valid demo order shows its total/reference and clears the cart.
9. **Statistics:** add items from several categories, change quantities and remove rows. Bars, percentages, category
   counts and amounts must update. The chart uses product subtotals before promo/delivery, so those choices do not
   change its category shares. An empty cart has a clear empty state.
10. **Endterm regression:** check the catalog filters/sort/favorites, product sizes/gallery, header count, theme,
    newsletter, contact form and jQuery FAQ. Navigate all five pages, inspect mobile/desktop layouts and keyboard focus,
    and confirm there are no application errors in the browser console.

## Final work packages

The complete ZIP contains every project file and can be applied by one person. The three optional smaller packages
contain non-overlapping final changes on top of the complete endterm and can be reviewed/committed by the team:

| Package | Suggested responsibility | Files |
| --- | --- | --- |
| 01 · Adiyat | API calculator, shared helpers, documentation and shared comment cleanup | `README.md`, `css/home.css`, `css/style.css`, `css/bootstrap.min.css`, `css/bootstrap-LICENSE.txt`, `js/common.js`, `js/currency.js`, `js/data.js`, `js/vendor/jquery.min.js` |
| 02 · Bekarys | Recently viewed products, Home/Product integration and catalog comment cleanup | `index.html`, `product.html`, `js/product.js`, `js/recent.js`, `css/recent.css`, `js/catalog.js` |
| 03 · Abubakir | Booking class/CRUD, checkout/statistics and contact comment cleanup | `contact.html`, `css/contact.css`, `js/bookings.js`, `cart.html`, `css/cart.css`, `js/cart.js`, `js/contact.js` |

Apply them in order 01 → 02 → 03. The calculator UI becomes available when package 02 connects Home to the script
from package 01; the fitting link is complete after package 03. Test the complete final version after all three.
Everyone should understand and test the files they commit. Preserve the endterm checkpoint in Git history so the
new final changes are identifiable.

## Structure and defence

Each page loads external scripts using `defer`: shared data/common first, then its page modules.
Product loads `recent.js` before `product.js`; Contact loads local jQuery before `contact.js`, then `bookings.js`.
Initialization uses `DOMContentLoaded`. Shared methods live on `window.SHOQAN`; page-specific responsibilities stay
in their own files. There is no module bundler or framework.

For defence, be ready to locate and explain:

- `fetch`, `async` / `await`, response validation, cache and the four request states in `currency.js`.
- Class versus instance, constructor/properties/methods and JSON rehydration in `bookings.js`.
- Arrays, loops, events, DOM creation/removal and storage in `recent.js` and the shared helpers.
- Step-specific/full validation, dependent fields, review totals and statistics in `cart.js`.
- All retained HTML/CSS/Bootstrap, JavaScript fundamentals and jQuery behavior from earlier stages.

The project is worth 60 points and individual defence is worth 40 points. Each member must answer at least four
questions about any project code or topic covered throughout the course and may need to modify/debug code live.

## Deployment and submission

**Submission deadline:** 19 November 2026, 09:00 AM.

Keep using the existing repository and five-page static hosting setup. No build command is needed.
If GitHub Pages is not configured, choose `main` and the repository root as its source. After the team commits and
pushes the completed final version, wait for deployment and test the published site.
Submit the organized source/assets, updated README, working website URL and source repository URL.

Bootstrap 5.3.3 CSS and jQuery 3.6.1 are stored locally. Their license notices are kept separately in `css/bootstrap-LICENSE.txt` and `js/vendor/jquery-LICENSE.txt`.
