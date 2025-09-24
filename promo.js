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
    // Capture the original SEO code from the DOM before we mutate it
    var originalSeoCode = null;
    if (codeNodes.length > 0) {
      try { originalSeoCode = (codeNodes[0].textContent || '').trim(); } catch (e) {}
    }
    // Fallbacks if not found in code nodes
    if (!originalSeoCode && titleNodes.length > 0) {
      var t = (titleNodes[0].textContent || '').trim();
      var match = t.match(/[A-Z0-9]{12}/);
      if (match) originalSeoCode = match[0];
    }
    if (!originalSeoCode) { originalSeoCode = 'AJQ70RA48LNO'; }

    for (var j = 0; j < codeNodes.length; j++) {
      codeNodes[j].textContent = selected;
      // make it obvious it's clickable
      try { codeNodes[j].style.cursor = 'pointer'; } catch (e) {}
    }

    // Links and CTAs
    updateHref('[data-promo-slot="cta"]', selected);
    updateHref('[data-promo-slot="deepLink"]', selected);

    // Meta/JSON-LD stay static for SEO

    // Click-to-copy behavior for promo code elements
    function copyTextToClipboard(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
      }
      // Fallback for older browsers
      var textarea = document.createElement('textarea');
      textarea.value = text;
      // Move off-screen
      textarea.style.position = 'fixed';
      textarea.style.top = '-1000px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(textarea);
      return Promise.resolve();
    }

    function attachCopyHandlers() {
      var nodes = document.querySelectorAll('[data-promo-slot="code"]');
      for (var i = 0; i < nodes.length; i++) {
        (function(el) {
          // Prevent duplicate listeners
          if (el.__mskCopyBound) return;
          el.__mskCopyBound = true;
          el.setAttribute('title', 'Kodu kopyalamak için tıklayın');
          el.addEventListener('click', function () {
            var original = el.getAttribute('data-original-text') || el.textContent;
            el.setAttribute('data-original-text', original);
            copyTextToClipboard(original).finally(function () {
              el.textContent = 'KOPYALANDI';
              var restoreDelayMs = 3000;
              setTimeout(function () {
                el.textContent = el.getAttribute('data-original-text') || original;
              }, restoreDelayMs);
            });
          });
        })(nodes[i]);
      }
    }

    attachCopyHandlers();

    // Replace any remaining visible occurrences of the original SEO code in text nodes
    function replaceVisibleText(oldCode, newCode) {
      if (!oldCode || oldCode === newCode) return;
      var selectors = [
        'header',
        'main',
        'h1', 'h2', 'h3', 'p', 'strong', 'em', 'span', 'a', 'li', 'div'
      ];
      var containers = document.querySelectorAll(selectors.join(','));
      for (var i = 0; i < containers.length; i++) {
        var el = containers[i];
        // Skip elements explicitly marked as SEO-static
        if (el.hasAttribute('data-seo-static')) continue;
        // Walk child text nodes and replace occurrences
        var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
        var textNode;
        var changedNodes = [];
        while ((textNode = walker.nextNode())) {
          var text = textNode.nodeValue;
          if (text && text.indexOf(oldCode) !== -1) {
            changedNodes.push({ node: textNode, value: text.replace(new RegExp(oldCode, 'g'), newCode) });
          }
        }
        for (var k = 0; k < changedNodes.length; k++) {
          changedNodes[k].node.nodeValue = changedNodes[k].value;
        }
      }
    }

    replaceVisibleText(originalSeoCode, selected);
  });
})();
