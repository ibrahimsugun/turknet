(function () {
  var PROMO_CODES = ['JAQ57UH73KJX', 'QBB27IK38VUN', 'BWD62AY20SXA', 'AJQ70RA48LNO', 'PIY20IR79GTJ'];
  var DEFAULT_CODE = PROMO_CODES[0];

  function getRandomIndex(max) {
    try {
      if (window.crypto && window.crypto.getRandomValues) {
        var array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return array[0] % max;
      }
    } catch (e) {}
    return Math.floor(Math.random() * max);
  }

  function chooseCode() {
    if (!Array.isArray(PROMO_CODES) || PROMO_CODES.length === 0) return DEFAULT_CODE;
    return PROMO_CODES[getRandomIndex(PROMO_CODES.length)];
  }

  function buildPromoUrl(code) {
    return 'https://turk.net/taahhutsuz-ozgur-iletisim-abonelik/?promo=' + encodeURIComponent(code);
  }

  function updateHref(selector, code) {
    var nodes = document.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var url = buildPromoUrl(code);
      el.setAttribute('href', url);
      var onClick = el.getAttribute('onclick');
      if (onClick && onClick.indexOf('gtag_report_conversion') !== -1) {
        el.setAttribute('onclick', "gtag_report_conversion('" + url + "')");
      }
      if (el.hasAttribute('data-promo-slot') && el.getAttribute('data-promo-slot') === 'deepLink') {
        el.textContent = url;
      }
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var selected = chooseCode();

    // Title and code texts
    var titleNodes = document.querySelectorAll('[data-promo-slot="title"]');
    for (var i = 0; i < titleNodes.length; i++) {
      titleNodes[i].textContent = 'TürkNet arkadaşını getir indirim kodu ' + selected;
    }

    var codeNodes = document.querySelectorAll('[data-promo-slot="code"]');
    for (var j = 0; j < codeNodes.length; j++) {
      codeNodes[j].textContent = selected;
    }

    // Links and CTAs
    updateHref('[data-promo-slot="cta"]', selected);
    updateHref('[data-promo-slot="deepLink"]', selected);

    // Meta/JSON-LD stay static for SEO
  });
})();
