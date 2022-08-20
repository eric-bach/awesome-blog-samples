import { render } from 'solid-js/web';
import 'products/ProductsIndex';
import 'cart/CartIndex';

import './index.css';

const App = () => (
  <div class='container'>
    <strong>Host</strong>
    <div id='products-dev'></div>
    <div id='cart-dev'></div>
  </div>
);
render(App, document.getElementById('app'));
