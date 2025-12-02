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

//construct URL for deletion
function getCookieUrl(cookie) {
  const protocol = cookie.secure ? 'https:' : 'http:';
  const domain = cookie.domain.startsWith('.') ? cookie.domain.substring(1) : cookie.domain;
  return `${protocol}//${domain}${cookie.path}`;
}

//Delete cookie, refresh display
async function deleteCookie(cookie) {
  const url = getCookieUrl(cookie);
  await chrome.cookies.remove({
    url: url,
    name: cookie.name,
    storeId: cookie.storeId
  });
    const tab = await getActiveTab();
    if (tab && tab.url) {
      const urlObj = new URL(tab.url);
      chrome.cookies.getAll({domain: urlObj.hostname}, cookies => {
        renderCookies(cookies, urlObj.hostname);
    });
  }
}

async function renderCookies(cookies, hostname) {
  const list = document.getElementById('list');
  list.innerHTML = '';
  if (!cookies || cookies.length === 0) {
    list.textContent = 'No cookies found for ' + hostname;
    return;
  }

  // Get stored cookie data to check for changes
  const cookieKeys = cookies.map(c => `${c.name}_${c.domain}_${c.path}`);
  chrome.storage.local.get(cookieKeys, (storedData) => {
    cookies.forEach(c => {
      const cookieKey = `${c.name}_${c.domain}_${c.path}`;
      const stored = storedData[cookieKey];
      const hasChanged = stored && stored.oldValue;
      
      const element = document.createElement('div');
      element.className = 'cookie';

      let historyHTML = '';
      if (stored && stored.history && stored.history.length > 0) {
        historyHTML = stored.history.map(entry => {
          const oldVal = entry.oldValue ?? '—';
          const newVal = entry.newValue ?? c.value;
          return `<div class="history-entry">Old: <code>${oldVal}</code> → New: <code>${newVal}</code> • ${new Date(entry.timestamp).toLocaleString()}</div>`;
        }).join('');
      }


      element.innerHTML = `
        <div class="cookie-header">
          <div>
            <strong>${c.name}</strong>${hasChanged ? '<span class="change-indicator" title="Cookie value changed">!</span>' : ''} — <code style="word-break:break-all">${c.value}</code>
            ${hasChanged ? `<div class="old-value-tooltip">Previous value: <code>${stored.oldValue}</code></div>` : ''}
          </div>
          <button class="delete-btn" data-cookie='${JSON.stringify(c)}'>Delete</button>
        </div>
        <div class="meta">${c.domain} ${c.path} • Expires: ${formatExpireDate(c)} • ${c.httpOnly? 'HttpOnly':''} ${c.secure? 'Secure':''} ${c.sameSite||''}</div>
        ${historyHTML ? `<div class="history-toggle">Show/Hide History</div><div class="history-container">${historyHTML}</div>` : ''}
        `;
      
      //delete button listener
      const deleteBtn = element.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', () => {
        deleteCookie(c, false);
      });
      
      // history toggle listener
      const toggleBtn = element.querySelector('.history-toggle');
      if (toggleBtn) {
        const container = element.querySelector('.history-container');
        toggleBtn.addEventListener('click', () => {
          container.style.display = container.style.display === 'none' ? 'block' : 'none';
        });
      }

      list.appendChild(element);
    });
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