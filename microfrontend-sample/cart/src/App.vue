<template>
  <div class="cart-container">
    <strong>Cart:</strong>
    <div>You have {{ cart.count }} items in the cart</div>
  </div>
</template>

<script lang="ts">
import { faker } from '@faker-js/faker';

export default {
  data() {
    return {
      cart: {
        count: faker.datatype.number(5),
      },
    };
  },
};
</script>
