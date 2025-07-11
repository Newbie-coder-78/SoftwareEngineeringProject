/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

describe('Password Generator UI Tests', () => {
  let lengthInput, warningMsg, generateBtn, uppercase, lowercase, numbers, symbols, form, passwordField;

  beforeEach(() => {
    document.documentElement.innerHTML = html.toString();
    require('../script'); // this binds the JS to the test DOM

    lengthInput = document.getElementById('length');
    warningMsg = document.getElementById('warning-msg');
    generateBtn = document.getElementById('generate-btn');
    uppercase = document.getElementById('uppercase');
    lowercase = document.getElementById('lowercase');
    numbers = document.getElementById('numbers');
    symbols = document.getElementById('symbols');
    form = document.getElementById('password-form');
    passwordField = document.getElementById('generated-password');
  });

  test('shows warning if length is below 8', () => {
    lengthInput.value = '5';
    lengthInput.dispatchEvent(new Event('input'));
    expect(generateBtn.disabled).toBe(true);
    expect(warningMsg.textContent).toContain('at least 8 characters');
  });

  test('shows warning if no character types are selected', () => {
    lengthInput.value = '12';
    lengthInput.dispatchEvent(new Event('input'));

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(passwordField.value).toBe('');
    expect(warningMsg.textContent).toContain('Select at least one');
  });

  test('generates a password when valid options selected', () => {
    lengthInput.value = '12';
    uppercase.checked = true;
    lowercase.checked = true;
    numbers.checked = true;
    symbols.checked = true;

    lengthInput.dispatchEvent(new Event('input'));
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(passwordField.value.length).toBe(12);
    expect(warningMsg.textContent).toBe('');
  });

  test('toggles theme and updates button text', () => {
    const toggleBtn = document.getElementById('theme-toggle');
    toggleBtn.click();

    const newTheme = document.documentElement.getAttribute('data-theme');
    expect(['dark', 'light']).toContain(newTheme);
    expect(toggleBtn.textContent).toMatch(/Switch to (Light|Dark) Mode/);
  });
});
