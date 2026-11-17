document.addEventListener("DOMContentLoaded", () => {
  // Enable scrolling in preview
  document.body.style.overflowY = "auto";
  // Ensure no persisted flag interferes
  localStorage.removeItem('ageConfirmed');
  const ageGate = document.getElementById('age-gate');
  console.log('script loaded, ageGate element:', ageGate);
  // Ensure the gate is visible on every load
  ageGate?.classList.remove('is-hidden');
  // Keep main content inert until user confirms
  // (HTML already sets inert, we just reaffirm it)
  document.getElementById('site-content')?.setAttribute('inert', '');

  const confirmBtn = document.getElementById('confirm-age');
  const declineBtn = document.getElementById('decline-age');

  confirmBtn?.addEventListener('click', () => {
    ageGate?.classList.add('is-hidden');
    document.getElementById('site-content')?.removeAttribute('inert');
    localStorage.setItem('ageConfirmed', 'true');
  });

  declineBtn?.addEventListener('click', () => {
    // Redirect to a safe page or close
    window.location.href = 'https://www.google.com';
  });
  const CONSENT_KEY = "0kbanana-consent-v6";
  const CRAK_SCRIPT_URL =
    "https://crxcra.com/cams-widget-ext/script?landing_id=%7Boffer_url_id%7D&genders=f&providers=streamate&skin=1&containerAlignment=center&cols=4&rows=1&number=4&background=transparent&useFeed=1&animateFeed=1&smoothAnimation=1&ratio=1&verticalSpace=10px&horizontalSpace=10px&colorFilter=0&colorFilterStrength=0&AuxiliaryCSS=%0A&lang=en&token=9d6718e0-e024-11f1-bd59-ada65d5f2f5b&api_key=5adb6bf5982b2b5d0c9c53813620e49915e43d1c1d4f2634582f9115e09a6c82";

  const modal = document.getElementById("cookie-modal");
  const vastCheckbox = document.getElementById("consent-vast");
  const camsCheckbox = document.getElementById("consent-cams");
  const camContainer = document.getElementById("cam-widget-container");

  let camWidgetLoaded = false;

  // Read saved consent from localStorage
  function getConsent() {
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      return raw ? JSON.parse(raw) : { vast: false, cams: false };
    } catch (e) {
      return { vast: false, cams: false };
    }
  }

  // Save consent and apply changes immediately
  function saveConsent(prefs) {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(prefs));
    applyConsent(prefs);
  }

  // Inject the CrakRevenue script safely inside a clean srcdoc iframe
  function loadCamWidget() {
    if (camWidgetLoaded || !camContainer) return;
    camWidgetLoaded = true;

    camContainer.innerHTML = "";
    const iframe = document.createElement("iframe");
    iframe.style.width = "100%";
    iframe.style.height = "340px";
    iframe.style.border = "none";
    iframe.style.overflow = "hidden";
    iframe.setAttribute("scrolling", "no");
    iframe.setAttribute("title", "Sponsored Live Cams");

    // Renders your exact script tag cleanly without needing /camwidget/
    iframe.srcdoc = `<!DOCTYPE html>
      <html>
        <head><style>body{margin:0;padding:0;background:transparent;overflow:hidden;}</style></head>
        <body>
          <script src="${CRAK_SCRIPT_URL}"><\/script>
        </body>
      </html>`;

    camContainer.appendChild(iframe);
  }

  // Apply consent state to UI & widgets
  function applyConsent(prefs) {
    if (vastCheckbox) vastCheckbox.checked = !!prefs.vast;
    if (camsCheckbox) camsCheckbox.checked = !!prefs.cams;

    if (prefs.cams) {
      loadCamWidget();
    }
  }

  // Event delegation so EVERY "click here" or "Cookie settings" button works
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest(".open-cookie-modal, #cookie-banner-link");
    if (trigger) {
      e.preventDefault();
      const current = getConsent();
      if (vastCheckbox) vastCheckbox.checked = !!current.vast;
      if (camsCheckbox) camsCheckbox.checked = !!current.cams;
      if (modal) modal.style.display = "flex";
    }
  });

  // Modal buttons
  document.getElementById("close-cookie-modal")?.addEventListener("click", () => {
    if (modal) modal.style.display = "none";
  });

  document.getElementById("save-cookie-prefs")?.addEventListener("click", () => {
    saveConsent({
      vast: !!vastCheckbox?.checked,
      cams: !!camsCheckbox?.checked,
    });
    if (modal) modal.style.display = "none";
  });

  document.getElementById("accept-all-cookies")?.addEventListener("click", () => {
    saveConsent({ vast: true, cams: true });
    if (modal) modal.style.display = "none";
  });

  // Close modal when clicking the dark backdrop
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  // Initialize on page load
  applyConsent(getConsent());

  // Allow reopening the age gate (e.g., from footer link)
  const reopenLink = document.getElementById('reopen-gate');
  reopenLink?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('ageConfirmed');
    ageGate?.classList.remove('is-hidden');
    document.getElementById('site-content')?.setAttribute('inert', '');
  });
});