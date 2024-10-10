# Ethical Eye - Dark Patterns Detection Extension

The **Ethical Eye** project is a browser extension designed to detect dark patterns on e-commerce websites and inform users of deceptive design tactics aimed at manipulating their behavior. Dark patterns, such as false urgency, social proof, and forced account creation, often lead users into making unintended decisions, such as purchasing unnecessary items, revealing personal data, or subscribing to unwanted services. Ethical Eye uses machine learning techniques, specifically a BERT-based model, to analyze the HTML, CSS, and JavaScript elements of a webpage to identify these manipulative design patterns.

The extension scrapes the webpage's DOM elements, isolates textual content, and sends this data to a backend server. The backend processes the data using a pre-trained BERT model that classifies various types of dark patterns. The identified patterns are then highlighted in real-time on the webpage, offering transparency to the user regarding potentially deceptive content.

Ethical Eye’s detection system focuses on patterns like false urgency, misleading product information, hidden costs, subscription trickery, and more. With an accuracy rate of 98.2%, the tool empowers users to make more informed decisions and avoid falling victim to manipulative design. Ethical Eye is a proactive approach toward encouraging transparency and ethical behavior in e-commerce platforms.

---

## How to Download and Use the Extension

### Step 1: Clone or Download the Repository
1. Navigate to the repository link on GitHub.
2. Click on the **Code** button, and then either:
   - Select **Download ZIP** to download the files directly to your machine.
   - Or, clone the repository by running the following command in your terminal:
     ```bash
     git clone https://github.com/username/repository-name.git
     ```

### Step 2: Install the Extension Locally
1. **Open Chrome** (or any Chromium-based browser such as Edge or Brave).
2. In the address bar, type `chrome://extensions/` and press Enter.
3. Enable **Developer Mode** (toggle is located at the top right corner of the page).
4. Click on **Load unpacked** and select the folder where you downloaded/cloned the repository.

### Step 3: Use the Extension
1. After the extension is loaded, an **Ethical Eye** icon will appear in your browser's toolbar.
2. Navigate to any e-commerce website you want to analyze.
3. Click on the **Ethical Eye** icon to activate the extension.
4. The extension will scan the webpage for dark patterns and highlight them visually.
5. If detected, you will see the manipulative elements highlighted on the page, with tooltips explaining each dark pattern type.

---
