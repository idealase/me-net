import { escapeHtml } from './html';

describe('escapeHtml', () => {
  it('escapes all HTML-significant characters', () => {
    expect(escapeHtml(`<a href="x" title='y'>&</a>`)).toBe(
      '&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;'
    );
  });

  it('leaves plain text untouched', () => {
    expect(escapeHtml('Exercise daily')).toBe('Exercise daily');
    expect(escapeHtml('')).toBe('');
  });

  it('prevents attribute breakout when used in a quoted attribute', () => {
    const div = document.createElement('div');
    div.innerHTML = `<input value="${escapeHtml('a" autofocus onfocus="alert(1)')}">`;
    const input = div.querySelector('input');
    expect(input?.hasAttribute('onfocus')).toBe(false);
    expect(input?.value).toBe('a" autofocus onfocus="alert(1)');
  });

  it('prevents element injection in text content', () => {
    const div = document.createElement('div');
    div.innerHTML = `<span>${escapeHtml('<img src=x onerror="alert(1)">')}</span>`;
    expect(div.querySelector('img')).toBeNull();
    expect(div.textContent).toBe('<img src=x onerror="alert(1)">');
  });
});
