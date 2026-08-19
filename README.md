# OneGrid Energies website

This is a static site designed for hosts such as Namecheap. Each public route
has its own folder and `index.html`, so direct links work without server
rewrites.

## Updating the site

1. Edit the shared source in `index.html`, CSS, or JavaScript.
2. Generate the route documents:

   ```bash
   node build-static-pages.mjs
   ```

3. Refresh asset filenames and their references in every route document:

   ```bash
   bash cache_burster.sh
   ```

The generated route folders are `home`, `about`, `oneplastic`,
`stories-of-hope`, `recognitions`, `quote`, and `contact`.
