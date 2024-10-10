let isHighlighting = false;

function highlightElements(elements, backgroundColor, padding, borderRadius, fontWeight) {
  elements.forEach(element => {
    element.style.backgroundColor = isHighlighting ? backgroundColor : '';
    element.style.padding = isHighlighting ? padding : '';
    element.style.borderRadius = isHighlighting ? borderRadius : '';
    element.style.fontWeight = isHighlighting ? fontWeight : '';
  });
}

function highlightAmazonProductDetails() {
  const productPrices = document.querySelectorAll('#corePriceDisplay_desktop_feature_div > div.a-section.a-spacing-none.aok-align-center.aok-relative > span.a-price.aok-align-center.reinventPricePriceToPayMargin.priceToPay > span:nth-child(2) > span.a-price-whole');
  const productTitles = document.querySelectorAll('#productTitle');
  const discountPrices = document.querySelectorAll('#corePriceDisplay_desktop_feature_div > div.a-section.a-spacing-none.aok-align-center.aok-relative > span.a-size-large.a-color-price.savingPriceOverride.aok-align-center.reinventPriceSavingsPercentageMargin.savingsPercentage');
  const fullPrice = document.querySelectorAll('#corePriceDisplay_desktop_feature_div > div.a-section.a-spacing-small.aok-align-center > span > span.aok-relative > span.a-size-small.a-color-secondary.aok-align-center.basisPrice > span');
  const productTotal = document.querySelectorAll('#subtotals-marketplace-table > tbody > tr:nth-child(4) > td.a-color-price.a-size-medium.a-text-right.grand-total-price.aok-nowrap.a-text-bold.a-nowrap');

  highlightElements(productPrices, '#4F6F52', '2px 5px', '3px', 'bold');
  highlightElements(productTitles, '#BFD8AF', '2px 5px', '3px', 'bold');
  highlightElements(discountPrices, '#D2E3C8', '2px 5px', '3px', 'bold');
  highlightElements(fullPrice, '#D2E3C8', '2px 5px', '3px', 'bold');
  highlightElements(productTotal, '#D2E3C8', '2px 5px', '3px', 'bold');

  function amazoncompareprice(productPrice, amazonPriceDifference) {
    if (productPrice > amazonPriceDifference) {
      return "Additional price is being charged";
    } else {
      return "Less price is charged";
    }
  }

  let amazonPriceDifferenceArray = Array.from(fullPrice).map((price, index) => {
    let fullPriceValue = parseFloat(price.textContent.replace(/,/g, '').replace('₹', '').split('₹')[0]);
    let discountPrice = parseFloat(discountPrices[index]?.textContent.replace(/,/g, '').replace('-', '').replace('%', '')) / 100;
    let amazonPriceDifference = fullPriceValue - (fullPriceValue * discountPrice);
    return amazonPriceDifference;
  });

  let amazonComparePriceArray = amazonPriceDifferenceArray.map((amazonPriceDifference, index) => {
    let productPriceValue = parseFloat(productPrices[index]?.textContent.replace(/,/g, '').replace('₹', ''));
    return amazoncompareprice(productPriceValue, amazonPriceDifference);
  });

  let discountDifferenceArray = amazonPriceDifferenceArray.map((amazonPriceDifference, index) => {
    let productPriceValue = parseFloat(productPrices[index]?.textContent.replace(/,/g, '').replace('₹', ''));
    let ans = productPriceValue - amazonPriceDifference;
    return ans.toFixed(2);
  });

  chrome.storage.local.set({
    'amazonProductPrices': Array.from(productPrices).map(price => parseFloat(price.textContent.replace(/,/g, '').replace('₹', ''))),
    'amazonProductTitles': Array.from(productTitles).map(title => title.textContent),
    'amazonDiscountPrices': Array.from(discountPrices).map(price => parseFloat(price.textContent.replace(/,/g, '').replace('-', ''))),
    'amazonFullPrice': Array.from(fullPrice).map(price => parseFloat(price.textContent.replace(/,/g, '').replace('₹', '').split('₹')[0])),
    'amazonProductTotal': Array.from(productTotal).map(total => total.textContent),
    'amazonPriceDifference': amazonPriceDifferenceArray,
    'amazonComparePrice': amazonComparePriceArray,
    'discountDifference': discountDifferenceArray
  });

  function updateStoredValues() {
    chrome.storage.local.get(['deliveryAmount', 'itemsAmount', 'orderTotalAmount', 'promotionAppliedAmount', 'totalAmount'], function (result) {
      document.getElementById('deliveryAmount').textContent = 'Delivery Amount: ₹' + (result.deliveryAmount || 0).toFixed(2);
      document.getElementById('itemsAmount').textContent = 'Items Amount: ₹' + (result.itemsAmount || 0).toFixed(2);
      document.getElementById('orderTotalAmount').textContent = 'Order Total Amount: ₹' + (result.orderTotalAmount || 0).toFixed(2);
      document.getElementById('promotionAppliedAmount').textContent = 'Promotion Applied Amount: ₹' + (result.promotionAppliedAmount || 0).toFixed(2);
      document.getElementById('totalAmount').textContent = 'Total Amount: ₹' + (result.totalAmount || 0).toFixed(2);

      const deliveryAmount = parseFloat(result.deliveryAmount) || 0;
      const itemsAmount = parseFloat(result.itemsAmount) || 0;
      const orderTotalAmount = parseFloat(result.orderTotalAmount) || 0;
      const promotionAppliedAmount = parseFloat(result.promotionAppliedAmount) || 0;
      const totalAmount = parseFloat(result.totalAmount) || 0;

      const updatedTotalAmount = totalAmount - deliveryAmount;

      document.getElementById('totalAmount').textContent = 'Total Amount: ₹' + updatedTotalAmount.toFixed(2);
    });
  }

  chrome.storage.local.get(['totalAmount', 'amazonProductPrices'], function (result) {
    document.getElementById('totalAmount').textContent = 'Total Amount: ₹' + (result.totalAmount || 0).toFixed(2);
    const totalAmount = parseFloat(result.totalAmount) || 0;
    const amazonProductPrices = result.amazonProductPrices || [];

    const updatedPrices = amazonProductPrices.map(price => {
      return price - totalAmount;
    });

    chrome.storage.local.get(['totalAmount', 'discountDifference'], function (result) {
      document.getElementById('totalAmount').textContent = 'Total Amount: ₹' + (result.totalAmount || 0).toFixed(2);

      const discountDifference = result.discountDifference || [];
      const sumDiscountDifference = discountDifference.reduce((acc, cur) => acc + parseFloat(cur), 0);

      const totalAmount = parseFloat(result.totalAmount) || 0;
      const newTotalAmount = totalAmount + sumDiscountDifference;

      document.getElementById('totalAmount').textContent = 'Total Amount: ₹' + newTotalAmount.toFixed(2);

      chrome.storage.local.set({
        'AmazonProductFinalPrices': updatedPrices,
        'amazontotalHiddenCost': newTotalAmount
      });
    });
  });

  updateStoredValues();
}


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'toggleHighlighting') {
    isHighlighting = request.isHighlighting;
    const url = window.location.href;
    if (url.includes('amazon')) {
      highlightAmazonProductDetails();
    } else if (url.includes('flipkart')) {
      highlightFlipkartProductDetails();
    } else if (url.includes('ajio')) {
      highlightAjioProductDetails();
    }
    chrome.storage.local.set({ isHighlighting: isHighlighting });
  }
});

chrome.storage.local.get(['isHighlighting'], function (result) {
  isHighlighting = result.isHighlighting || false;
  const url = window.location.href;
  if (url.includes('amazon')) {
    highlightAmazonProductDetails();
  } else if (url.includes('flipkart')) {
    highlightFlipkartProductDetails();
  } else if (url.includes('ajio')) {
    highlightAjioProductDetails();
  }
});

window.addEventListener('load', function () {
  const url = window.location.href;
  if (url.includes('amazon')) {
    highlightAmazonProductDetails();
  } else if (url.includes('flipkart')) {
    highlightFlipkartProductDetails();
  } else if (url.includes('ajio')) {
    highlightAjioProductDetails();
  }
});





// content.js

// Function to send a message to the background script with the current URL
function sendUrlToBackgroundScript() {
  chrome.runtime.sendMessage({ action: 'sendUrl', url: window.location.href });
}

// Function to open a new tab with the provided URL
function openNewTab(url) {
  chrome.tabs.create({ url: url });
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'openNewTab') {
    openNewTab(request.url);  // Change 'request.data' to 'request.url'
  }
});

// Call the function to send the current URL to the background script
sendUrlToBackgroundScript();


const endpoint = "http://127.0.0.1:5000/";
const descriptions = {
  "Sneaking": "Coerces users to act in ways that they would not normally act by obscuring information.",
  "Urgency": "Places deadlines on things to make them appear more desirable.",
  "Misdirection": "Aims to deceptively incline a user towards one choice over the other.",
  "Social Proof": "Gives the perception that a given action or product has been approved by other people.",
  "Scarcity": "Tries to increase the value of something by making it appear to be limited in availability.",
  "Obstruction": "Tries to make an action more difficult so that a user is less likely to do that action.",
  "Forced Action": "Forces a user to complete extra, unrelated tasks to do something that should be simple.",
};

// Normalize text by converting to lower case and trimming extra spaces
function normalizeText(text) {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}


function scrape() {
  // Check if the page has already been analyzed
  if (document.getElementById("insite_count")) {
    return;
  }

  console.log("Scraped elements:");

  // Aggregate all DOM elements on the page
  let elements = segments(document.body);
  let filtered_elements = [];
  let element_texts = []; // To store original text for comparison

  for (let i = 0; i < elements.length; i++) {
    let rawText = elements[i].innerText;
    let text = rawText ? normalizeText(rawText.replace(/\t/g, " ")) : '';

    if (text.length > 0) {
      filtered_elements.push({ index: i, text: text }); // Include index
      element_texts.push({
        original: rawText.trim(),
        normalized: text
      }); // Save original and normalized text
      console.log(`Element ${i}:`, text);
    }
  }

  // Post to the web server
  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tokens: filtered_elements }),
  })
    .then((resp) => resp.json())
    .then((data) => {
      let json = JSON.parse(JSON.stringify(data));
      // console.log("Detected Patterns:", json.result);

      let dp_count = 0;

      for (let i = 0; i < filtered_elements.length; i++) {
        let elementIndex = filtered_elements[i].index; // Use original index
        if (json.result[i] && json.result[i].category) {
          console.log("Detected Patterns:", json.result[i].category);
          if (json.result[i].category !== "Not Dark") {
            console.log(`Highlighting Element ${elementIndex}:`, element_texts[i].original);
            highlight(elements[elementIndex], json.result[i].category); // Use original index
            dp_count++;
          }
        }
      }

      // Store number of dark patterns
      let g = document.createElement("div");
      g.id = "insite_count";
      g.value = dp_count;
      g.style.opacity = 0;
      g.style.position = "fixed";
      document.body.appendChild(g);
      sendDarkPatterns(g.value);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}




function highlight(element, type) {
  console.log('Highlighting element:', element);
  console.log('Type:', type);

  // Add highlight class
  element.classList.add("insite-highlight");

  // Create highlight body
  let body = document.createElement("span");
  body.classList.add("insite-highlight-body");

  // Header
  let header = document.createElement("div");
  header.classList.add("modal-header");
  let headerText = document.createElement("h1");
  headerText.innerHTML = type + " Pattern";
  header.appendChild(headerText);
  body.appendChild(header);

  // Content
  let content = document.createElement("div");
  content.classList.add("modal-content");
  content.innerHTML = descriptions[type] || "No description available.";
  body.appendChild(content);

  // Append to element
  console.log('Highlight body:', body);
  element.appendChild(body);

  // Ensure visibility
  element.style.position = 'relative'; // Ensures that the body is positioned correctly relative to the element
}

function sendDarkPatterns(number) {
  chrome.runtime.sendMessage({
    message: "update_current_count",
    count: number,
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "analyze_site") {
    scrape();
  } else if (request.message === "popup_open") {
    let element = document.getElementById("insite_count");
    if (element) {
      sendDarkPatterns(element.value);
    }
  }
});






































































