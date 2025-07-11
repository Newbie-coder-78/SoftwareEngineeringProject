/**
 * @jest-environment jsdom
*/

const fs = require('fs');
const path = require('path');

describe('Password Generator UI Tests', () => {
  let lengthInput, warningMsg, generateBtn, uppercase, lowercase, numbers, symbols, form, passwordField, toggleBtn;

  beforeEach(() => {
    const html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf8');
    document.documentElement.innerHTML = html;

    //localStorage
    Object.defineProperty(window, 'localStorage', {
      value: (() => {
        let store = {};
        return {
          getItem: key => store[key] || null,
          setItem: (key, value) => store[key] = value,
          removeItem: key => delete store[key],
          clear: () => (store = {})
        };
      })(),
      writable: true
    });

    window.localStorage.clear();
  });


  function loadScript() {
    window.dispatchEvent(new Event('DOMContentLoaded'));
    require('./script.js');
    window.dispatchEvent(new Event('DOMContentLoaded'));

    //DOM elements
    lengthInput = document.getElementById('length');
    warningMsg = document.getElementById('warning-msg');
    generateBtn = document.getElementById('generate-btn');
    uppercase = document.getElementById('uppercase');
    lowercase = document.getElementById('lowercase');
    numbers = document.getElementById('numbers');
    symbols = document.getElementById('symbols');
    form = document.getElementById('password-form');
    passwordField = document.getElementById('generated-password');
    toggleBtn = document.getElementById('theme-toggle');
  }

  //Test 1: Warnig for length below 8
  test('shows warning if length is below 8', () => {
    loadScript();
    lengthInput.value = '5';
    lengthInput.dispatchEvent(new Event('input'));
    expect(generateBtn.disabled).toBe(true);
    expect(warningMsg.textContent).toContain('at least 8 characters');
  });

});