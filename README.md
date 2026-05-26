# ld

Light/Dark/Auto web component for setting `document.body[data-theme]`.

## CDN usage

```html
<script src="https://ld.j4rl.se/ld-theme-toggle.js" defer></script>

<ld-theme-toggle></ld-theme-toggle>
```

The component registers `<ld-theme-toggle>` and stores the selected mode in
`localStorage` under `ld-theme`.

Behavior:

- Default mode is `system`.
- `system` resolves to either `light` or `dark` from `prefers-color-scheme`.
- `document.body` always receives `data-theme="light"` or `data-theme="dark"`.
- The selected mode is remembered in `localStorage`.

Use a custom storage key if needed:

```html
<ld-theme-toggle storage-key="my-theme"></ld-theme-toggle>
```

Listen for changes:

```js
document.querySelector("ld-theme-toggle").addEventListener("themechange", (event) => {
  console.log(event.detail.mode, event.detail.theme);
});
```
