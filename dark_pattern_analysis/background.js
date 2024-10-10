let isHighlighting = false;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'toggleHighlighting') {
    isHighlighting = !isHighlighting; 
    demo(sendResponse);

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, { action: 'toggleHighlighting', isHighlighting });
      chrome.storage.local.set({ isHighlighting: isHighlighting });
    });
  } else if (request.action === 'setIcon') {
    console.log('Received message:', request);
    chrome.action.setIcon({ path: request.path }, () => {
      if (chrome.runtime.lastError) {
        console.log('Error setting icon:', chrome.runtime.lastError);
        sendResponse({ success: false });
      } else {
        console.log('Icon set');
        sendResponse({ success: true });
      }
    });
  } else if (request.action === 'backButtonClicked') {
    chrome.browserAction.setIcon({path: 'images/default.png'}, function() {
      if (!isHighlighting) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.runtime.reload();
        });
      }
    });
  }
  return true;  // Will respond asynchronously.
});

chrome.storage.local.get(['isHighlighting'], function(result) {
  isHighlighting = result.isHighlighting || false;
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete') {
    isHighlighting = true;
    chrome.storage.local.set({ isHighlighting: isHighlighting });
    chrome.tabs.sendMessage(tabId, { action: 'toggleHighlighting', isHighlighting });

    isHighlighting = false;
    chrome.storage.local.set({ isHighlighting: isHighlighting });
    chrome.tabs.sendMessage(tabId, { action: 'toggleHighlighting', isHighlighting });
  }
});

chrome.runtime.onInstalled.addListener(function () {
  console.log("Dark Pattern Extension installed");
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "openNewTab") {
    const mlUrl = "http://127.0.0.1:5001/";  // Replace with your ML server URL
    const newTabUrl = mlUrl + "?url=" + encodeURIComponent(message.url);
    chrome.tabs.create({ url: newTabUrl });
  }
});

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {alert: "Comparison Result: " + comparisonResult});
});

function demo(sendResponse) {
  // Fetch the URL from the current tab
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const currentTab = tabs[0];
    const url = currentTab.url;

    console.log('Scraping data from URL:', url);
    
    // Fetch data from the server using the URL
    fetch('http://127.0.0.1:5123/amazon_run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: url })
    })
    .then(response => response.json())
    .then(data => {
      console.log("Response from server:", data);
      // Extract numeric values from the response
      const delivery = parseFloat(data['Delivery:'].replace(/[^\d.]/g, ''));
      const items = parseFloat(data['Items:'].replace(/[^\d.]/g, ''));
      const orderTotal = parseFloat(data['Order Total:'].replace(/[^\d.]/g, ''));
      const promotionApplied = parseFloat(data['Promotion Applied:'].replace(/[^\d.]/g, ''));
      const total = parseFloat(data['Total:'].replace(/[^\d.]/g, ''));

      // Store the values in local Chrome storage
      chrome.storage.local.set({ 
        'deliveryAmount': delivery || 0,
        'itemsAmount': items || 0,
        'orderTotalAmount': orderTotal || 0,
        'promotionAppliedAmount': promotionApplied || 0,
        'totalAmount': total || 0
      }, function() {
        if (chrome.runtime.lastError) {
          console.error('Error storing data:', chrome.runtime.lastError);
        } else {
          console.log('Data stored successfully');
        }
      });

      // Send the values back to the content script if needed
      sendResponse({ 
        deliveryAmount: delivery || 0,
        itemsAmount: items || 0,
        orderTotalAmount: orderTotal || 0,
        promotionAppliedAmount: promotionApplied || 0,
        totalAmount: total || 0
      });
       chrome.runtime.reload();
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      sendResponse({ error: "An error occurred while fetching data." });
    });
  });


  

  // Return true to indicate that sendResponse will be called asynchronously
  return true;
}






































































// let isHighlighting = false;

// // Listener for incoming messages
// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//   switch (request.action) {
//     case 'toggleHighlighting':
//       isHighlighting = !isHighlighting;
//       updateHighlightingState(sendResponse);
//       break;
    
//     case 'setIcon':
//       setIcon(request.path, sendResponse);
//       break;

//     case 'backButtonClicked':
//       handleBackButton(sendResponse);
//       break;

//     case 'openNewTab':
//       openNewTab(request.url);
//       break;
//   }
//   return true;  // Indicate async response
// });

// // Initialize highlighting state
// chrome.storage.local.get(['isHighlighting'], function(result) {
//   isHighlighting = result.isHighlighting || false;
// });

// // Update highlighting state when tab content is updated
// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
//   if (changeInfo.status === 'complete') {
//     updateHighlightingState();
//   }
// });

// // Notify when extension is installed
// chrome.runtime.onInstalled.addListener(function () {
//   console.log("Dark Pattern Extension installed");
// });

// // Fetch and store data from server
// function updateHighlightingState(sendResponse) {
//   chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
//     const activeTab = tabs[0];
//     chrome.tabs.sendMessage(activeTab.id, { action: 'toggleHighlighting', isHighlighting });
//     chrome.storage.local.set({ isHighlighting });
//   });
// }

// // Set extension icon
// function setIcon(path, sendResponse) {
//   chrome.action.setIcon({ path }, () => {
//     if (chrome.runtime.lastError) {
//       sendResponse({ success: false });
//     } else {
//       sendResponse({ success: true });
//     }
//   });
// }

// // Handle back button click
// function handleBackButton(sendResponse) {
//   chrome.browserAction.setIcon({ path: 'images/default.png' }, function() {
//     if (!isHighlighting) {
//       chrome.runtime.reload();
//     }
//   });
// }

// // Open a new tab with ML server URL
// function openNewTab(url) {
//   const mlUrl = "http://127.0.0.1:5001/";
//   const newTabUrl = `${mlUrl}?url=${encodeURIComponent(url)}`;
//   chrome.tabs.create({ url: newTabUrl });
// }

// // Fetch data from server and store it
// function fetchDataFromServer(url, sendResponse) {
//   fetch('http://127.0.0.1:5123/amazon_run', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ url })
//   })
//   .then(response => response.json())
//   .then(data => {
//     const parsedData = {
//       deliveryAmount: parseFloat(data['Delivery:']?.replace(/[^\d.]/g, '')) || 0,
//       itemsAmount: parseFloat(data['Items:']?.replace(/[^\d.]/g, '')) || 0,
//       orderTotalAmount: parseFloat(data['Order Total:']?.replace(/[^\d.]/g, '')) || 0,
//       promotionAppliedAmount: parseFloat(data['Promotion Applied:']?.replace(/[^\d.]/g, '')) || 0,
//       totalAmount: parseFloat(data['Total:']?.replace(/[^\d.]/g, '')) || 0
//     };

//     chrome.storage.local.set(parsedData, function() {
//       if (chrome.runtime.lastError) {
//         console.error('Error storing data:', chrome.runtime.lastError);
//       }
//     });

//     sendResponse(parsedData);
//     chrome.runtime.reload();
//   })
//   .catch(error => {
//     console.error('Error fetching data:', error);
//     sendResponse({ error: "An error occurred while fetching data." });
//   });
// }

// // Fetch and store data when demo function is triggered
// function demo(sendResponse) {
//   chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
//     const url = tabs[0].url;
//     fetchDataFromServer(url, sendResponse);
//   });
// }



