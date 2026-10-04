# frame

Standalone photo framing tool at `/frame/`. Static ES modules; no build, upload, analytics, cookies, API, or external dependencies. Input images remain in memory for the current page session. Only the application shell is cached for offline use, scoped to `/frame/`.

Select up to 30 photos, adjust the shared minimum white inset (percentage of output width), prepare JPEGs, then use native file sharing or downloads. Exports are 1080×1350 or 2160×2700 at JPEG quality 0.95, with centered contain geometry. The browser applies EXIF orientation. HEIC support depends on the browser; JPEG/PNG are the portable inputs. Unsupported files are reported by name and do not prevent other files loading.

Decode originals sequentially and release them after each canvas operation. Retain only original File handles and downscaled preview blobs. Export files are prepared before the share button is tapped to preserve Safari user activation. Multi-file sharing depends on the OS; individual share/download and a ZIP are fallbacks. Closing the share sheet is not treated as proof of saving.

Deploy by adding this directory to the GitHub Pages `main` branch. It is intentionally unlinked from the portfolio and marked noindex. Future `07_archive/scripts/build_live.py` builds preserve repo-only subdirectories. Bump the cache name in `sw.js` after app changes; the new worker activates once previous windows close.
