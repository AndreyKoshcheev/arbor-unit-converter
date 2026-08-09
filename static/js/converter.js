(function () {
  'use strict';

  var input = document.getElementById('inputValue');
  var fromSel = document.getElementById('fromUnit');
  var toSel = document.getElementById('toUnit');
  var fromSelExt = document.getElementById('fromUnitExtended');
  var toSelExt = document.getElementById('toUnitExtended');
  var swapBtn = document.getElementById('swapBtn');
  var convertBtn = document.getElementById('convertBtn');
  var resultValue = document.getElementById('resultValue');
  var resultUnit = document.getElementById('resultUnit');
  var copyBtn = document.getElementById('copyBtn');
  var extendedCb = document.getElementById('extendedCheckbox');

  if (!input || !fromSel || !toSel || !resultValue || !resultUnit || !convertBtn || !copyBtn) return;

  var category = window.location.pathname.replace(/^\//, '').split('/')[0] || '';

  var fmt = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 10,
    minimumFractionDigits: 0,
    useGrouping: true
  });

  function getActiveFromSel() {
    if (extendedCb && extendedCb.checked && fromSelExt) return fromSelExt;
    return fromSel;
  }

  function getActiveToSel() {
    if (extendedCb && extendedCb.checked && toSelExt) return toSelExt;
    return toSel;
  }

  function getResultUnitText() {
    var sel = getActiveToSel();
    var opt = sel.options[sel.selectedIndex];
    if (opt && opt.getAttribute('data-gen')) {
      return opt.getAttribute('data-gen');
    }
    return opt ? opt.textContent : '';
  }

  function clearResult() {
    resultValue.textContent = '';
    resultUnit.textContent = '';
  }

  async function convert() {
    var raw = input.value.trim();
    if (raw === '') {
      clearResult();
      return;
    }
    var value = parseFloat(raw);
    if (isNaN(value)) {
      clearResult();
      return;
    }

    try {
      var fromActive = getActiveFromSel();
      var toActive = getActiveToSel();
      var params = new URLSearchParams({
        category: category,
        from: fromActive.value,
        to: toActive.value,
        value: String(value)
      });
      var res = await fetch('/api/convert?' + params.toString());
      var data = await res.json();
      if (data.error) {
        clearResult();
        return;
      }
      resultValue.textContent = fmt.format(data.result);
      resultUnit.textContent = getResultUnitText();
    } catch (e) {
      clearResult();
    }
  }

  // Extended checkbox toggle
  if (extendedCb && fromSelExt && toSelExt) {
    extendedCb.addEventListener('change', function () {
      var isExtended = extendedCb.checked;

      // Sync values between selects
      if (isExtended) {
        fromSelExt.value = fromSel.value;
        toSelExt.value = toSel.value;
      } else {
        // When going back to basic, try to find matching basic option
        var fromVal = fromSelExt.value;
        var toVal = toSelExt.value;
        if (fromSel.querySelector('option[value="' + fromVal + '"]')) {
          fromSel.value = fromVal;
        }
        if (toSel.querySelector('option[value="' + toVal + '"]')) {
          toSel.value = toVal;
        }
      }

      fromSel.style.display = isExtended ? 'none' : '';
      fromSelExt.style.display = isExtended ? '' : 'none';
      toSel.style.display = isExtended ? 'none' : '';
      toSelExt.style.display = isExtended ? '' : 'none';

      convert();
    });
  }

  // Convert only on button click
  convertBtn.addEventListener('click', convert);

  // Convert on Enter key
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      convert();
    }
  });

  // Swap units
  if (swapBtn) {
    swapBtn.addEventListener('click', function () {
      var fromActive = getActiveFromSel();
      var toActive = getActiveToSel();
      var tmp = fromActive.value;
      fromActive.value = toActive.value;
      toActive.value = tmp;
      convert();
    });
  }

  // Copy result — only on button click
  copyBtn.addEventListener('click', function () {
    var text = resultValue.textContent;
    if (!text) return;

    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(flashCopied).catch(function () {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  });

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = '-9999px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      flashCopied();
    } catch (e) {}
    document.body.removeChild(ta);
  }

  var copyTimeout;

  function flashCopied() {
    if (copyTimeout) clearTimeout(copyTimeout);
    copyBtn.classList.add('copied');
    copyTimeout = setTimeout(function () {
      copyBtn.classList.remove('copied');
    }, 800);
  }
})();
