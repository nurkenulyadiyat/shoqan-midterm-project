# SHOQAN — Classic Menswear

Midterm project: a multi-page responsive website for a fictional menswear store in Astana, Kazakhstan.
The store sells suits, shirts, coats, trousers and accessories and offers free tailoring.

**Team:** Adiyat Nurkenuly, Bekarys Zhassuzakh, Abubakir Daniyaruly

**Live site:** https://nurkenulyadiyat.github.io/shoqan-midterm-project/

## Pages

| Page | File | Author | Main features |
|------|------|--------|---------------|
| Home | `index.html` | Adiyat | Hero, categories (CSS Grid), new arrivals (Bootstrap grid), benefits (Flexbox), newsletter form |
| Catalog | `catalog.html` | Bekarys | Filter form (checkboxes, range), sort select, product grid (CSS Grid), pagination |
| Product | `product.html` | Bekarys | Gallery, size/color selection with radio buttons, `<details>` blocks, size guide table |
| Cart / Checkout | `cart.html` | Abubakir | Cart table, order summary, checkout form, order confirmation with `:target` |
| About & Contact | `contact.html` | Abubakir | Our story, facts (CSS Grid), contact form, opening hours table, map |

A Login / Register page is planned for the future (the Login button is disabled).

## Technologies

- **HTML5** with semantic elements: `header`, `nav`, `main`, `section`, `article`, `aside`, `figure`, `address`, `footer`, `details`
- **CSS3**: custom properties, class and ID selectors, Flexbox, Grid, `position: relative / absolute / sticky / fixed`
- **Bootstrap 5.3** (CSS only, stored locally in `css/bootstrap.min.css`): grid system, spacing, text and display utilities, forms, tables, breadcrumb, pagination
- **Media queries** for two breakpoints: tablet (`max-width: 991.98px`) and mobile (`max-width: 575.98px`)
- No JavaScript is used. Expandable blocks use `<details>`, the order confirmation uses the CSS `:target` selector.

## Folder structure

```
shoqan/
├── index.html
├── catalog.html
├── product.html
├── cart.html
├── contact.html
├── README.md
├── css/
│   ├── bootstrap.min.css   Bootstrap 5.3.3
│   ├── style.css           common styles: header, footer, buttons, cards
│   ├── home.css
│   ├── catalog.css
│   ├── product.css
│   ├── cart.css
│   └── contact.css
└── images/                 SVG illustrations of the products
```

## How to run

Open `index.html` in a browser, or visit the live link above.
