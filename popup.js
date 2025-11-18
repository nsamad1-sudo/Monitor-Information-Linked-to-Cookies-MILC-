async function getActiveTab() {
  const tabs = await chrome.tabs.query({active:true,currentWindow:true});
  return tabs[0];
}

function formatExpireDate(c) {
  if (c.session)
    return 'session';
  if (!c.expirationDate)
    return 'unknown';
  return new Date(c.expirationDate * 1000).toLocaleString();
}

function renderCookies(cookies, hostname) {
  const list = document.getElementById('list');
  list.innerHTML = '';
  if (!cookies || cookies.length === 0) {
    list.textContent = 'No cookies found for ' + hostname;
    return;
  }
  cookies.forEach(c => {
    const element = document.createElement('div');
    element.className = 'cookie';
    element.innerHTML = `
      <div><strong>${c.name}</strong> — <code style="word-break:break-all">${c.value}</code></div>
      <div class="meta">${c.domain} ${c.path} • Expires: ${prettyExpire(c)} • ${c.httpOnly? 'HttpOnly':''} ${c.secure? 'Secure':''} ${c.sameSite||''}</div>
    `;
    list.appendChild(element);
  });
}

(async function main(){
  const tab = await getActiveTab();
  if (!tab || !tab.url) {
    document.getElementById('site').textContent = 'Cannot determine active tab';
    return;
  }
  const url = new URL(tab.url);
  const hostname = url.hostname;
  document.getElementById('site').textContent = hostname;

  chrome.cookies.getAll({domain: hostname}, cookies => {
    renderCookies(cookies, hostname);
  });
})();