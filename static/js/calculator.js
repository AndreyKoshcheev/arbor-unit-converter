(function () {
  'use strict';

  var display = document.getElementById('calcDisplay');
  var expressionEl = document.getElementById('calcExpression');
  var resultEl = document.getElementById('calcResult');
  var historyList = document.getElementById('calcHistoryList');
  var historyEmpty = document.getElementById('calcHistoryEmpty');
  var historyClear = document.getElementById('calcHistoryClear');
  var copyBtn = document.getElementById('calcCopyBtn');

  var state = {
    current: '0',
    previous: '',
    operation: null,
    resetNext: false,
    justEvaluated: false,
    expression: ''
  };

  // History storage
  var HISTORY_KEY = 'arbor_calc_history';
  var history = [];

  function loadHistory() {
    try {
      var stored = localStorage.getItem(HISTORY_KEY);
      if (stored) history = JSON.parse(stored);
      if (!Array.isArray(history)) history = [];
    } catch (e) { history = []; }
    renderHistory();
  }

  function saveHistory() {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {}
    renderHistory();
  }

  function addHistoryEntry(expr, result) {
    history.unshift({ expr: expr, result: result, time: Date.now() });
    // Keep max 100 entries
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
    history.forEach(function (entry, i) {
      var item = document.createElement('div');
      item.className = 'calc-history-item';
      item.innerHTML = '<div class="calc-history-expr">' + entry.expr + '</div><div class="calc-history-result">= ' + entry.result + '</div>';
      item.setAttribute('data-index', i);
      // Click to reuse result
      item.addEventListener('click', function () {
        var clean = entry.result.replace(/\s/g, '');
        if (clean !== '∞' && !isNaN(parseFloat(clean))) {
          state.current = clean;
          state.resetNext = true;
          state.justEvaluated = false;
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

  function formatNumber(n) {
    var str = String(n);
    var parts = str.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return parts.join('.');
  }

  function updateDisplay() {
    resultEl.textContent = formatNumber(state.current);
    expressionEl.textContent = state.expression;
  }

  function inputDigit(digit) {
    if (state.resetNext) {
      state.current = '';
      state.resetNext = false;
    }
    if (state.justEvaluated) {
      state.current = '';
      state.expression = '';
      state.justEvaluated = false;
    }
    if (state.current === '0' && digit !== '.') {
      state.current = digit;
    } else {
      if (digit === '.' && state.current.includes('.')) return;
      state.current += digit;
    }
    updateDisplay();
  }

  function inputOperator(op) {
    var opSymbols = { add: '+', subtract: '−', multiply: '×', divide: '÷' };
    var symbol = opSymbols[op] || op;

    if (state.justEvaluated) {
      state.justEvaluated = false;
    }

    if (state.operation && !state.resetNext) {
      calculate();
    }

    state.previous = state.current;
    state.operation = op;
    state.resetNext = true;
    state.expression = formatNumber(state.previous.replace(/\s/g, '')) + ' ' + symbol;
    updateDisplay();
  }

  function calculate() {
    if (!state.operation) return;

    var prev = parseFloat(state.previous.replace(/\s/g, ''));
    var curr = parseFloat(state.current.replace(/\s/g, ''));
    var result;

    switch (state.operation) {
      case 'add':
        result = prev + curr;
        break;
      case 'subtract':
        result = prev - curr;
        break;
      case 'multiply':
        result = prev * curr;
        break;
      case 'divide':
        if (curr === 0) {
          result = '∞';
        } else {
          result = prev / curr;
        }
        break;
      default:
        return;
    }

    if (typeof result === 'number') {
      result = parseFloat(result.toPrecision(12));
      result = Math.round(result * 1e12) / 1e12;
    }

    var opSymbols = { add: '+', subtract: '−', multiply: '×', divide: '÷' };
    var opStr = opSymbols[state.operation] || state.operation;
    var exprStr = formatNumber(state.previous.replace(/\s/g, '')) + ' ' + opStr + ' ' + formatNumber(state.current.replace(/\s/g, ''));
    state.expression = exprStr + ' =';
    state.current = String(result);
    state.operation = null;
    state.resetNext = true;
    state.justEvaluated = true;

    // Save to history
    var resultFormatted = formatNumber(String(result));
    addHistoryEntry(exprStr, resultFormatted);

    updateDisplay();
  }

  function clearAll() {
    state.current = '0';
    state.previous = '';
    state.operation = null;
    state.resetNext = false;
    state.justEvaluated = false;
    state.expression = '';
    updateDisplay();
  }

  function backspace() {
    if (state.justEvaluated || state.resetNext) {
      clearAll();
      return;
    }
    if (state.current.length === 1 || (state.current.length === 2 && state.current.startsWith('-'))) {
      state.current = '0';
    } else {
      state.current = state.current.slice(0, -1);
    }
    updateDisplay();
  }

  function toggleSign() {
    if (state.current === '0') return;
    state.current = state.current.startsWith('-') ? state.current.slice(1) : '-' + state.current;
    updateDisplay();
  }

  function percent() {
    var val = parseFloat(state.current.replace(/\s/g, ''));
    if (isNaN(val)) return;
    val = val / 100;
    state.current = String(val);
    updateDisplay();
  }

  function handleKey(key) {
    if (/^[0-9]$/.test(key)) {
      inputDigit(key);
    } else if (key === '.') {
      inputDigit('.');
    } else if (key === '+') {
      inputOperator('add');
    } else if (key === '-') {
      inputOperator('subtract');
    } else if (key === '*') {
      inputOperator('multiply');
    } else if (key === '/') {
      inputOperator('divide');
    } else if (key === 'Enter' || key === '=') {
      if (state.operation) {
        calculate();
      }
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
      clearAll();
    } else if (key === 'Backspace') {
      backspace();
    } else if (key === '%') {
      percent();
    }
  }

  // Event delegation on buttons
  document.querySelector('.calculator-buttons').addEventListener('click', function (e) {
    var btn = e.target.closest('.calc-btn');
    if (!btn) return;

    var action = btn.getAttribute('data-action');

    switch (action) {
      case 'clear':
        clearAll();
        break;
      case 'backspace':
        backspace();
        break;
      case 'percent':
        percent();
        break;
      case 'sign':
        toggleSign();
        break;
      case 'decimal':
        inputDigit('.');
        break;
      case 'equals':
        if (state.operation) calculate();
        break;
      case 'add':
      case 'subtract':
      case 'multiply':
      case 'divide':
        inputOperator(action);
        break;
      default:
        inputDigit(action);
    }
  });

  // History clear
  if (historyClear) {
    historyClear.addEventListener('click', function () {
      clearHistory();
    });
  }

  // Copy result
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var text = resultEl.textContent;
      if (!text || text === '0') return;

      var cleanText = text.replace(/\s/g, '');

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(cleanText).then(flashCopied).catch(function () {
          fallbackCopy(cleanText);
        });
      } else {
        fallbackCopy(cleanText);
      }
    });
  }

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

  // Keyboard support
  document.addEventListener('keydown', function (e) {
    handleKey(e.key);
  });

  // Init
  loadHistory();
  updateDisplay();
})();
