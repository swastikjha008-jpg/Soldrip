# ASCII background source image

Drop an image here (e.g. `ascii-source.jpg`) and point `VITE_ASCII_SOURCE_IMAGE`
at it in your `.env` to have the AsciiBackground renderer sample it.

If no image is present (or it fails to load), `AsciiRenderer` automatically
falls back to a procedurally generated texture — see
`drawProceduralSource()` in `src/lib/ascii/renderer.ts`. This keeps the app
fully self-contained with zero external image dependencies out of the box.
