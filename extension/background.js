chrome.cookies.onChanged.addListener((changeInfo) => {
  const cookie = changeInfo.cookie;
  const removed = changeInfo.removed;
  
  if (removed) return;
  
  //create a unique key
  const cookieKey = `${cookie.name}_${cookie.domain}_${cookie.path}`;
  
  //check if a previous value is stored
  chrome.storage.local.get([cookieKey], (result) => {
    const storedData = result[cookieKey];
    
    if (storedData && storedData.currentValue !== cookie.value) {
      //store old value, update history 

      const history = storedData.history || [];
      
      history.push({
        oldValue: storedData.currentValue,
        newValue: cookie.value,
        timestamp: Date.now()
      })

      chrome.storage.local.set({
        [cookieKey]: {
          oldValue: storedData.currentValue,
          currentValue: cookie.value,
          history: history,
          timestamp: Date.now()
        }
      });
    } else if (!storedData) {
      //store current data if new
      chrome.storage.local.set({
        [cookieKey]: {
          currentValue: cookie.value,
          history: [
            {
              newValue: cookie.value,
              timestamp: Date.now()
            }
          ],
          timestamp: Date.now()
        }
      });
    }
  });
});