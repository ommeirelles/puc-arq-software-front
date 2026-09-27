# Software Architecture MVP — Front-end Application

Online shopping single-page application developed for the Software Architecture
post-graduation course (PUC). It renders the store catalog and manages the shopping
cart, fetching product data directly from the external
[Fake Store API](https://fakestoreapi.com/), delegating cart operations to the
back-end cart API and authentication to the back-end auth API — both live in the
[back-end repository](https://github.com/ommeirelles/puc-arq-soft-cart).

## Stack

- **React 19** + **TypeScript** + **Vite 6**
- **Tailwind CSS 4** + **daisyUI** for styling
- **Zod** for runtime schema validation (API responses and forms)
- **React Hook Form** (with `@hookform/resolvers`) for form state and validation

## Architecture Overview

This app is the front-end of a microservice-based system. It communicates with the
product service (Fake Store API) for catalog data, with the cart service (the
Flask back-end) for everything cart-related, and with the auth service (the
Flask back-end) for user registration and authentication.

```mermaid
flowchart LR
    User([User]) --> FE["Front-end SPA<br/>React + Vite · :4173"]
    FE -->|"GET /products"| FSA["Fake Store API<br/>fakestoreapi.com"]
    FE -->|"Cart operations<br/>(create, add, remove, summary)"| BE["Cart API<br/>Flask · :8000"]
    FE -->|"POST /user · POST /login<br/>GET /user"| AUTH["Auth API<br/>Flask · :8001"]
    BE -->|"Product details & prices"| FSA
    BE --> DB[("SQLite<br/>./db/cart.db")]
    AUTH --> AUTHDB[("SQLite<br/>./db/auth.db")]
```

Key implementation points:

- Routing is handled by `react-router`: the login page is the index route (`/`),
  user registration lives at `/register`, and the store catalog lives at `/store`,
  guarded by `RequireAuth`. When no token is present in `sessionStorage` (key
  `auth_token`), the guard clears the session (token and cart GUID) and redirects
  to the login page.
- Authentication is **JWT-based**: the auth API issues a signed token on login,
  stored in `sessionStorage` under the key `auth_token`. Logout is client-side —
  the token is simply discarded.
- The active cart is **session-less**: its GUID is created by the back-end and
  persisted in `localStorage` under the key `cart_guid`.
- The header includes a search input (before the cart basket) that filters the
  product listing as you type: the text is matched case-insensitively against
  the product title and description first; only when that yields no results does
  it fall back to matching the image URL and category. On mobile the header
  stacks in two rows: the Fake Store APP logo centered on top, and the search
  input plus cart basket below (the logout button is hidden — logout lives in
  the mobile dock), and the cart dropdown adapts to the viewport width. Product
  images use native lazy loading (`loading="lazy"`) so they only load when they
  enter the viewport.
- The store catalog can be filtered by category through a side panel
  (`src/pages/store/components/category-filter.tsx`): each category is a checkbox
  that includes/removes its products from the listing, plus a button to
  select/unselect all categories at once. Filtering happens entirely
  on the front-end — no extra requests are made. When no products are left to
  display (e.g., all categories unselected), an empty state
  (`src/pages/store/components/empty-state.tsx`) informs that no products are
  available. The panel is responsive: on
  desktop (`lg` and up) it renders side by side with the product grid and can be
  collapsed to a slim strip; on smaller screens it becomes an overlay drawer
  opened from the mobile dock (daisyUI `drawer` with `lg:drawer-open`).
- On mobile, a daisyUI `dock` (`src/components/mobile-dock.tsx`, hidden at `lg`
  and up) sticks to the bottom of the store page with three actions: **Logout**,
  **Top** (smooth-scrolls the product grid to the top) and **Filters** (opens the
  category drawer).
- The product listing is a fluid CSS grid
  (`grid-cols-[repeat(auto-fill,minmax(220px,1fr))]`): cards have a 220px minimum
  width (in line with common e-commerce grids like Amazon, Mercado Livre and
  Best Buy), stretch evenly to fill the row, and the grid adds a column whenever
  another minimum-width card fits — 4 columns at 1440px, 3 at 820px.
- Service layer in `src/services/`:
  - `api.ts` — abstract HTTP client (`get`/`post`/`put`/`patch`/`delete`) with
    optional Zod response validation.
  - `product.ts` — `ProductService`, a singleton that fetches products from the
    Fake Store API and caches them in memory by ID.
  - `cart.ts` — `CartService`, a singleton that creates/retrieves the cart,
    fetches the cart summary (items grouped by product, with quantities), and
    adds/removes items through the back-end API. Every request carries the
    `Authorization: Bearer` JWT; on `401` the session and cart are cleared and
    the app redirects to the login page, and on a `400` "Cart not found"
    response (stale/invalid GUID) the cart is discarded and the operation is
    retried once with a freshly created cart.
  - `auth.ts` — `AuthService`, a singleton that registers users and authenticates
    through the back-end auth API, storing the returned JWT in `sessionStorage`.
- Shared types and Zod schemas live in `src/types.ts`.

## External API

Product catalog data comes from the [Fake Store API](https://fakestoreapi.com/) —
a free, public fake API for testing and prototyping e-commerce applications
([docs](https://fakestoreapi.com/docs)). No registration or API key is required,
and it is free to use. Only the read-only product routes are consumed:

| Method | Path             | Description          |
| ------ | ---------------- | -------------------- |
| `GET`  | `/products`      | List all products.   |
| `GET`  | `/products/{id}` | Get a single product. |

The data is fetched and rendered by this application itself — the external API is
never used as a redirect target.

## Environment Variables

Configuration is done through a `.env` file — copy `.env.example` to `.env` and
adjust the values if needed:

| Variable                          | Default                       | Purpose                                          |
| --------------------------------- | ----------------------------- | ------------------------------------------------ |
| `VITE_FAKE_STORE_API_URL`         | `https://fakestoreapi.com`    | Product catalog source                           |
| `VITE_CART_API_URL`               | `http://localhost:8000`       | Back-end cart API base URL                       |
| `VITE_AUTH_API_URL`               | `http://localhost:8001`       | Back-end auth API base URL                       |
| `VITE_OTEL_EXPORTER_OTLP_ENDPOINT`| `http://localhost:4318`       | OTLP HTTP collector endpoint (traces, metrics, logs) |
| `VITE_OTEL_SERVICE_NAME`          | `puc-arq-software-front`      | Service name reported in telemetry               |

## Running

### Docker

It's possible to run the *vite preview* using make (`make run`) or the
*vite development* server (`make dev`). Preview uses a production build that
needs to be rebuilt on each new change applied, while development fires up the
**full stack** — this app, both back-end APIs, the OTEL collector and Jaeger —
through the `docker-compose.yml` at this repository's root, syncing source
changes into the containers (via `docker-compose --watch`).

*It's also possible to run without make:*

- **Vite Preview**
  - `docker build -t arq-soft-front .`
  - `docker run --rm -p 4173:4173 arq-soft-front`
  - The container exposes port **4173** for preview.
- **Full-stack Development**
  - `docker-compose up --build --watch`
  - The container exposes port **4173** for development work.

> Docker is used through the Podman compatibility layer, with Compose enabled
> through the standalone `docker-compose` binary.

### Locally

Prerequisites:

- Node.js **24.x (LTS)** and npm **11.x** — pinned in `engines` (`package.json`)

Steps:

1. Clone the repository
2. Run `npm install` (or `yarn install`) to install dependencies
3. Run `npm run dev` for the development server, or `npm run preview` to preview
   the production build

### npm Scripts

| Script            | Description                                  |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Start the Vite development server            |
| `npm run build`   | Type-check (`tsc -b`) and build for production |
| `npm run preview` | Preview the production build                 |
| `npm run lint`    | Run ESLint                                   |
