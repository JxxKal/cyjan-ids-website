// cyjan-ids-downloads.js
// Setzt Download-Links auf das jeweils aktuelle Cyjan-IDS-Release.
//
// HTML-Verwendung:
//   <a data-cyjan-download="iso" href="https://github.com/JxxKal/ids/releases">
//     ISO herunterladen
//   </a>
//   <a data-cyjan-download="update"
//      href="https://github.com/JxxKal/ids/releases/latest/download/cyjan-ids-update-latest.zip">
//     Update-Paket herunterladen
//   </a>
//   <script src="/assets/js/cyjan-ids-downloads.js" defer></script>
//
// Update-ZIP: nutzt einfach den stabilen Permalink (das HTML-href reicht
// schon, das Skript bestätigt ihn nur).
// ISO: wird via GitHub-API ermittelt, weil /releases/latest/ auch auf
// Minor-Releases zeigt, die kein ISO enthalten.

(function () {
  const REPO = 'JxxKal/ids';
  const CACHE_KEY = 'cyjan-ids-downloads-v1';
  const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

  const updateUrl =
    `https://github.com/${REPO}/releases/latest/download/cyjan-ids-update-latest.zip`;

  function applyLinks(state) {
    document.querySelectorAll('[data-cyjan-download]').forEach((el) => {
      const kind = el.dataset.cyjanDownload;
      if (kind === 'update') {
        el.href = state.updateUrl;
        if (state.updateVersion) {
          el.dataset.cyjanVersion = state.updateVersion;
        }
      } else if (kind === 'iso') {
        if (state.isoUrl) {
          el.href = state.isoUrl;
          el.removeAttribute('aria-disabled');
          if (state.isoVersion) el.dataset.cyjanVersion = state.isoVersion;
        } else {
          el.href = `https://github.com/${REPO}/releases`;
          el.setAttribute('aria-disabled', 'true');
        }
      }
    });
  }

  function readCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (Date.now() - data.ts > CACHE_TTL_MS) return null;
      return data;
    } catch { return null; }
  }

  function writeCache(state) {
    try {
      localStorage.setItem(CACHE_KEY,
        JSON.stringify({ ...state, ts: Date.now() }));
    } catch {}
  }

  async function fetchReleases() {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/releases?per_page=30`,
      { headers: { Accept: 'application/vnd.github+json' } }
    );
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    return res.json();
  }

  async function resolveLatest() {
    const releases = await fetchReleases();
    const stable = releases.filter((r) => !r.draft && !r.prerelease);

    // Update: einfach das neueste stable.
    const latestUpdate = stable[0];
    // ISO: das neueste stable mit einem .iso-Asset.
    const latestIsoRel = stable.find((r) =>
      r.assets.some((a) => a.name.endsWith('.iso')));

    const isoAsset = latestIsoRel
      ? latestIsoRel.assets.find((a) => a.name.endsWith('.iso'))
      : null;

    return {
      updateUrl,
      updateVersion: latestUpdate ? latestUpdate.tag_name : null,
      isoUrl: isoAsset ? isoAsset.browser_download_url : null,
      isoVersion: latestIsoRel ? latestIsoRel.tag_name : null,
    };
  }

  function init() {
    const cached = readCache();
    if (cached) { applyLinks(cached); return; }

    applyLinks({ updateUrl, isoUrl: null });

    resolveLatest()
      .then((state) => { applyLinks(state); writeCache(state); })
      .catch((err) => console.warn('[cyjan-ids-downloads]', err));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
