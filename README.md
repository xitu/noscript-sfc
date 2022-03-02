# NoScript SFC

Load vue3 SFC component with inline `<noscript>` tag. Funny :-) :Yeah:

https://codepen.io/akira-cn-the-selector/pen/mdqQYEg

```html
<noscript type="vue-sfc" component="MyComponent" mount="#app">
  <script>
    export default {
      data() {
        return {
          count: 0
        }
      }
    }
  </script>

  <template>
    <button @click="count++">Count is: {{ count }}</button>
  </template>

  <style scoped>
    button {
      font-weight: bold;
    }
  </style>
</noscript>
<div id="app"></div>
<script src="https://unpkg.com/noscript-sfc/index.js"></script>
```
