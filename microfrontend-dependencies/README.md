# Microfrontend Dependencies

A sample project demonstrating how to handle multiple dependencies in microfrontends with Webpack Module Federation

- **products** (React
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png" alt="React" width="16"/>): displays a list of products
- **cart** (Vue <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Vue.js_Logo_2.svg/1200px-Vue.js_Logo_2.svg.png" alt="Vue" width="16" />): displays the number of items in the shopping cart
- **host** (SolidJS <img src="https://www.solidjs.com/assets/logo.123b04bc.svg" alt="Next" width="16">): the MFE container app that shows/hides each MFE remote apps (products, cart)

## Getting Started

1. Run `npm install` in each folder (cart, products, host)
2. Run `npm run start` in each folder (cart, products, host)
3. Navigate to http://localhost:8080
