(function () {
  'use strict';

  var input = document.getElementById('inputValue');
  var fromSel = document.getElementById('fromUnit');
  var toSel = document.getElementById('toUnit');
  var swapBtn = document.getElementById('swapBtn');
  var convertBtn = document.getElementById('convertBtn');
  var resultValue = document.getElementById('resultValue');
  var resultUnit = document.getElementById('resultUnit');
  var copyBtn = document.getElementById('copyBtn');

  if (!input || !fromSel || !toSel || !resultValue || !resultUnit || !convertBtn || !copyBtn) return;

  var category = window.location.pathname.replace(/^\//, '').split('/')[0] || '';

  var fmt = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 10,
    minimumFractionDigits: 0,
    useGrouping: true
  });

  function getResultUnitText() {
    var opt = toSel.options[toSel.selectedIndex];
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
      var params = new URLSearchParams({
        category: category,
        from: fromSel.value,
        to: toSel.value,
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
      var tmp = fromSel.value;
      fromSel.value = toSel.value;
      toSel.value = tmp;
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
