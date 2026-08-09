(function () {
  'use strict';

  var expressionEl = document.getElementById('engExpression');
  var resultEl = document.getElementById('engResult');
  var modeBadge = document.getElementById('engModeBadge');
  var copyBtn = document.getElementById('engCopyBtn');
  var historyList = document.getElementById('engHistoryList');
  var historyEmpty = document.getElementById('engHistoryEmpty');
  var historyClear = document.getElementById('engHistoryClear');

  var HISTORY_KEY = 'arbor_eng_history';
  var history = [];
  var memory = 0;
  var lastAnswer = 0;
  var degMode = true;
  var openParens = 0;

  var state = {
    display: '0',
    expression: '',
    prevResult: null
  };

  // ===== History =====
  function loadHistory() {
    try {
      var stored = localStorage.getItem(HISTORY_KEY);
      if (stored) history = JSON.parse(stored);
      if (!Array.isArray(history)) history = [];
    } catch(e) { history = []; }
    renderHistory();
  }

  function saveHistory() {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch(e) {}
    renderHistory();
  }

  function addHistory(expr, result) {
    history.unshift({ expr: expr, result: result, time: Date.now() });
    if (history.length > 100) history = history.slice(0, 100);
    saveHistory();
  }

  function renderHistory() {
    historyList.innerHTML = '';
    if (history.length === 0) {
      historyEmpty.style.display = 'block';
      return;
    }
    historyEmpty.style.display = 'none';
    history.forEach(function(entry, i) {
      var item = document.createElement('div');
      item.className = 'eng-history-item';
      item.innerHTML = '<div class="eng-history-expr">' + entry.expr + '</div><div class="eng-history-result">= ' + entry.result + '</div>';
      item.setAttribute('data-index', i);
      item.addEventListener('click', function() {
        var clean = entry.result.replace(/\s/g, '');
        if (clean !== '∞' && clean !== 'Error' && !isNaN(parseFloat(clean))) {
          state.display = clean;
          updateDisplay();
        }
      });
      historyList.appendChild(item);
    });
  }

  function clearHistory() {
    history = [];
    saveHistory();
  }

  // ===== Display =====
  function formatNumber(n) {
    if (typeof n === 'string' && (n === '∞' || n === 'Error')) return n;
    var str = String(n);
    var parts = str.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return parts.join('.');
  }

  function updateDisplay() {
    resultEl.textContent = formatNumber(state.display);
    expressionEl.textContent = state.expression;
  }

  function parseDisplay() {
    return parseFloat(state.display.replace(/\s/g, ''));
  }

  // ===== Input =====
  function inputDigit(d) {
    if (state.display === '0' && d !== '.') state.display = d;
    else state.display += d;
    updateDisplay();
  }

  function inputDecimal() {
    if (state.display.includes('.')) return;
    state.display += '.';
    updateDisplay();
  }

  function inputOperator(op) {
    var sym = { add: '+', subtract: '−', multiply: '×', divide: '÷', mod: 'mod' }[op] || op;
    state.expression = state.display + ' ' + sym;
    state.prevResult = parseDisplay();
    state.operation = op;
    state.display = '0';
    updateDisplay();
  }

  // ===== Evaluation =====
  function evaluate() {
    if (!state.operation && state.expression.indexOf('=') < 0) {
      // Just compute what's on screen (e.g. after a function)
      return;
    }

    try {
      var result;
      var expr = state.expression;

      if (state.operation) {
        var curr = parseDisplay();
        var prev = state.prevResult;
        
        switch (state.operation) {
          case 'add': result = prev + curr; break;
          case 'subtract': result = prev - curr; break;
          case 'multiply': result = prev * curr; break;
          case 'divide': result = curr === 0 ? '∞' : prev / curr; break;
          case 'mod': result = prev % curr; break;
          case 'pow': result = Math.pow(prev, curr); break;
          default: return;
        }
        
        var opSym = { add: '+', subtract: '−', multiply: '×', divide: '÷', mod: 'mod', pow: '^' }[state.operation];
        state.expression = formatNumber(prev) + ' ' + opSym + ' ' + formatNumber(curr) + ' =';
      } else {
        // Direct computation
        result = parseDisplay();
        state.expression = formatNumber(result) + ' =';
      }

      if (typeof result === 'number') {
        result = parseFloat(result.toPrecision(12));
        result = Math.round(result * 1e12) / 1e12;
      }

      var resultStr = String(result);
      addHistory(state.expression, formatNumber(resultStr));
      lastAnswer = typeof result === 'number' ? result : 0;
      state.display = resultStr;
      state.operation = null;
      state.prevResult = null;
      updateDisplay();
    } catch(e) {
      state.display = 'Error';
      updateDisplay();
    }
  }

  // ===== Scientific functions =====
  function applyFunc(fn) {
    var val = parseDisplay();
    if (isNaN(val)) return;
    var result;
    var exprPrefix = '';

    switch (fn) {
      case 'sin':
      case 'cos':
      case 'tan':
        var angle = degMode ? val * Math.PI / 180 : val;
        result = fn === 'sin' ? Math.sin(angle) : fn === 'cos' ? Math.cos(angle) : Math.tan(angle);
        exprPrefix = fn + '(' + formatNumber(val) + ')';
        break;
      case 'asin':
      case 'acos':
      case 'atan':
        result = fn === 'asin' ? Math.asin(val) : fn === 'acos' ? Math.acos(val) : Math.atan(val);
        if (degMode) result = result * 180 / Math.PI;
        exprPrefix = fn + '(' + formatNumber(val) + ')';
        break;
      case 'log2':
        result = Math.log2(val);
        exprPrefix = 'log₂(' + formatNumber(val) + ')';
        break;
      case 'log':
        result = Math.log10(val);
        exprPrefix = 'log(' + formatNumber(val) + ')';
        break;
      case 'ln':
        result = Math.log(val);
        exprPrefix = 'ln(' + formatNumber(val) + ')';
        break;
      case 'sqrt':
        result = Math.sqrt(val);
        exprPrefix = '√(' + formatNumber(val) + ')';
        break;
      case 'cbrt':
        result = Math.cbrt(val);
        exprPrefix = '∛(' + formatNumber(val) + ')';
        break;
      case 'square':
        result = val * val;
        exprPrefix = formatNumber(val) + '²';
        break;
      case 'cube':
        result = val * val * val;
        exprPrefix = formatNumber(val) + '³';
        break;
      case 'inv':
        result = val === 0 ? '∞' : 1 / val;
        exprPrefix = '1/(' + formatNumber(val) + ')';
        break;
      case 'ten_pow':
        result = Math.pow(10, val);
        exprPrefix = '10^(' + formatNumber(val) + ')';
        break;
      case 'exp':
        result = Math.exp(val);
        exprPrefix = 'e^(' + formatNumber(val) + ')';
        break;
      case 'sinh':
        result = Math.sinh(val);
        exprPrefix = 'sinh(' + formatNumber(val) + ')';
        break;
      case 'cosh':
        result = Math.cosh(val);
        exprPrefix = 'cosh(' + formatNumber(val) + ')';
        break;
      case 'tanh':
        result = Math.tanh(val);
        exprPrefix = 'tanh(' + formatNumber(val) + ')';
        break;
      case 'asinh':
        result = Math.asinh(val);
        exprPrefix = 'asinh(' + formatNumber(val) + ')';
        break;
      case 'acosh':
        result = Math.acosh(val);
        exprPrefix = 'acosh(' + formatNumber(val) + ')';
        break;
      case 'atanh':
        result = Math.atanh(val);
        exprPrefix = 'atanh(' + formatNumber(val) + ')';
        break;
      case 'abs':
        result = Math.abs(val);
        exprPrefix = 'abs(' + formatNumber(val) + ')';
        break;
      case 'factorial':
        result = factorial(val);
        exprPrefix = formatNumber(val) + '!';
        break;
      case 'pi':
        result = Math.PI;
        exprPrefix = 'π';
        break;
      case 'e':
        result = Math.E;
        exprPrefix = 'e';
        break;
      case 'sign':
        result = -val;
        break;
      case 'rnd':
        result = Math.random();
        exprPrefix = 'Rand';
        break;
      case 'ee':
        state.display += 'e';
        updateDisplay();
        return;
      case 'ans':
        state.display = String(lastAnswer);
        updateDisplay();
        return;
      default:
        return;
    }

    if (typeof result === 'number') {
      result = parseFloat(result.toPrecision(12));
      result = Math.round(result * 1e12) / 1e12;
    }

    if (exprPrefix) {
      state.expression = exprPrefix + ' =';
      addHistory(exprPrefix, formatNumber(String(result)));
    }

    state.display = String(result);
    state.operation = null;
    state.prevResult = null;
    updateDisplay();
  }

  function factorial(n) {
    if (n < 0 || n > 170) return '∞';
    if (n === 0 || n === 1) return 1;
    if (!Number.isInteger(n)) return gamma(n + 1);
    var r = 1;
    for (var i = 2; i <= n; i++) r *= i;
    return r;
  }

  function gamma(n) {
    if (n < 0.5) return Math.PI / (Math.sin(Math.PI * n) * gamma(1 - n));
    n -= 1;
    var g = 0.99999999999980993;
    var c = [676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    for (var i = 0; i < 8; i++) g += c[i] / (n + i + 1);
    var t = n + 7.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, n + 0.5) * Math.exp(-t) * g;
  }

  // ===== Memory =====
  function memoryAction(action) {
    var val = parseDisplay();
    if (isNaN(val) && action !== 'mc' && action !== 'mr') return;
    switch (action) {
      case 'mc': memory = 0; break;
      case 'mr': state.display = String(memory); break;
      case 'mplus': memory += val; break;
      case 'mminus': memory -= val; break;
      case 'ms': memory = val; break;
    }
    updateDisplay();
  }

  // ===== Clear & Backspace =====
  function clearAll() {
    state.display = '0';
    state.expression = '';
    state.operation = null;
    state.prevResult = null;
    openParens = 0;
    updateDisplay();
  }

  function backspace() {
    if (state.display.length <= 1) state.display = '0';
    else state.display = state.display.slice(0, -1);
    updateDisplay();
  }

  function percent() {
    var val = parseDisplay();
    if (isNaN(val)) return;
    state.display = String(val / 100);
    updateDisplay();
  }

  function inputLparen() {
    openParens++;
    state.display = state.display === '0' ? '(' : state.display + '(';
    updateDisplay();
  }

  function inputRparen() {
    if (openParens > 0) {
      openParens--;
      state.display += ')';
      updateDisplay();
    }
  }

  // ===== Keyboard =====
  function handleKey(key) {
    if (/^[0-9]$/.test(key)) { inputDigit(key); return; }
    switch (key) {
      case '.': inputDecimal(); break;
      case '+': inputOperator('add'); break;
      case '-': inputOperator('subtract'); break;
      case '*': inputOperator('multiply'); break;
      case '/': inputOperator('divide'); break;
      case 'Enter': case '=': evaluate(); break;
      case 'Escape': case 'c': case 'C': clearAll(); break;
      case 'Backspace': backspace(); break;
      case '%': percent(); break;
      case '(': inputLparen(); break;
      case ')': inputRparen(); break;
      case '^': inputOperator('pow'); break;
    }
  }

  // ===== Button events =====
  document.querySelector('.eng-buttons').addEventListener('click', function(e) {
    var btn = e.target.closest('.eng-btn');
    if (!btn) return;
    var action = btn.getAttribute('data-action');

    switch (action) {
      case 'clear': clearAll(); break;
      case 'backspace': backspace(); break;
      case 'percent': percent(); break;
      case 'sign': applyFunc('sign'); break;
      case 'decimal': inputDecimal(); break;
      case 'lparen': inputLparen(); break;
      case 'rparen': inputRparen(); break;
      case 'equals': case 'equals2': evaluate(); break;
      case 'add': case 'subtract': case 'multiply': case 'divide': case 'mod': case 'pow':
        inputOperator(action); break;
      case 'mc': case 'mr': case 'mplus': case 'mminus': case 'ms':
        memoryAction(action); break;
      case 'mode':
        degMode = !degMode;
        modeBadge.textContent = degMode ? 'DEG' : 'RAD';
        break;
      case 'int':
        state.display = String(Math.floor(parseDisplay()));
        updateDisplay();
        break;
      case 'exp':
        state.display += 'e';
        updateDisplay();
        break;
      default:
        // scientific functions, numbers
        var nums = ['0','1','2','3','4','5','6','7','8','9','00'];
        if (nums.indexOf(action) >= 0) { inputDigit(action); }
        else if (action === 'ten_pow2') { applyFunc('exp'); }
        else { applyFunc(action); }
    }
  });

  // History clear
  if (historyClear) {
    historyClear.addEventListener('click', clearHistory);
  }

  // Copy
  if (copyBtn) {
    copyBtn.addEventListener('click', function() {
      var text = resultEl.textContent;
      if (!text || text === '0') return;
      var clean = text.replace(/\s/g, '');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(clean).then(flashCopied).catch(function() { fallbackCopy(clean); });
      } else { fallbackCopy(clean); }
    });
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); flashCopied(); } catch(e) {}
    document.body.removeChild(ta);
  }

  var copyTimeout;
  function flashCopied() {
    if (copyTimeout) clearTimeout(copyTimeout);
    copyBtn.classList.add('copied');
    copyTimeout = setTimeout(function() { copyBtn.classList.remove('copied'); }, 800);
  }

  // Keyboard
  document.addEventListener('keydown', function(e) { handleKey(e.key); });

  // Init
  loadHistory();
  updateDisplay();
})();
