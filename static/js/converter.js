(function () {
  'use strict';

  var input = document.getElementById('inputValue');
  var fromSel = document.getElementById('fromUnit');
  var toSel = document.getElementById('toUnit');
  var swapBtn = document.getElementById('swapBtn');
  var resultValue = document.getElementById('resultValue');
  var resultUnit = document.getElementById('resultUnit');

  if (!input || !fromSel || !toSel || !resultValue || !resultUnit) return;

  // Determine category from URL: /length → length
  var category = window.location.pathname.replace(/^\//, '').split('/')[0] || '';

  // Number formatter: up to 10 fraction digits, no trailing zeros
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

  function updateResult() {
    resultUnit.textContent = getResultUnitText();
  }

  async function convert() {
    var raw = input.value.trim();
    if (raw === '') {
      resultValue.textContent = '\u2014';
      updateResult();
      return;
    }
    var value = parseFloat(raw);
    if (isNaN(value)) {
      resultValue.textContent = '\u2014';
      updateResult();
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
        resultValue.textContent = '\u2014';
        updateResult();
        return;
      }
      resultValue.textContent = fmt.format(data.result);
      updateResult();
    } catch (e) {
      resultValue.textContent = '\u2014';
      updateResult();
    }
  }

  input.addEventListener('input', convert);
  fromSel.addEventListener('change', convert);
  toSel.addEventListener('change', convert);

  if (swapBtn) {
    swapBtn.addEventListener('click', function () {
      var tmp = fromSel.value;
      fromSel.value = toSel.value;
      toSel.value = tmp;
      convert();
    });
  }

  // Run initial conversion (e.g. when page loads with a pre-filled value)
  convert();
})();
