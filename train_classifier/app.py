from flask import Flask, jsonify, request
from flask_cors import CORS
from joblib import load
import re

presence_classifier = load('presence_classifier.joblib')
presence_vect = load('presence_vectorizer.joblib')
category_classifier = load('category_classifier.joblib')
category_vect = load('category_vectorizer.joblib')

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['POST'])
def main():
    if request.method == 'POST':
        output = []
        data = request.get_json().get('tokens')

        # Define non-dark and dark keyword patterns
        non_dark_keywords = [
            r"in stock", r"service centre replacement", r"₹", r"days", r"no cost emi", 
            r"ghz", r"resolution", r"brightness", r"camera", r"battery", r"off", r"display", 
            r"adapter", r"connectivity", r"ram", r"report an issue with this product",
            r"storage", r"sim", r"lens", r"warranty", r"fastest delivery", r"free delivery",
            r"\.in", r"brand in this category on amazon", r"all discounts", r"today's deals",
            r"5.5 in & above", r"usb cable", r"pay on delivery", r"today's deal", r"discount",
            r"get gst invoice and save up to 28% on business purchases.",
            r"add a protection plan:", r"include out of stock", r"eligible for pay on delivery",
            r"report an issue with the product", r"frequently bought together", r"if ordered before pm",
            r"view in a map", r"sort by", r"reserve now, pay later", r"recommended price: low to high",
            r"price: high to low", r"guest rating \+ our choices", r"property class","get it today"
        ]

        dark_keywords = [
            r"only \d+ left", r"\d+% off", r"limited time offer", r"deal ends soon", r"hurry, only",
            r"just \d+ remaining", r"buy now, \d+% discount", r"act fast", r"stock running low",
            r"last chance", r"final hours", r"\d+ people bought this", r"high demand", r"selling fast",
            r"limited availability", r"low stock alert", r"we have \d+ left at \d+% off","we have 1 left at 11% off at "
        ]

        for token in data:
            text = token['text']

            # Debug: Print the text being processed
            print(f"Processing text: {text}")

            # Check for non-dark keywords using regex
            non_dark_matched = any(re.search(keyword, text.lower()) for keyword in non_dark_keywords)
            if non_dark_matched:
                print(f"Non-dark pattern detected: {text}")
                output.append({'index': token['index'], 'category': 'Not Dark'})
                continue

            # Check for general dark patterns using regex
            dark_matched = any(re.search(keyword, text.lower()) for keyword in dark_keywords)
            if dark_matched:
                print(f"Dark pattern detected by regex: {text}")
                output.append({'index': token['index'], 'category': 'Dark'})
                continue

            result = presence_classifier.predict(presence_vect.transform([text]))
            if result == 'Dark':
                cat = category_classifier.predict(category_vect.transform([text]))
                output.append({'index': token['index'], 'category': cat[0]})
            else:
                output.append({'index': token['index'], 'category': result[0]})

        response = {'result': output}

        # Print the results for debugging
        dark = [data[i] for i in range(len(output)) if output[i]['category'] != 'Not Dark']
        print("Detected Dark Patterns:")
        for d in dark:
            print(d)
        print(f"Number of detected dark patterns: {len(dark)}")

        return jsonify(response)

if __name__ == '__main__':
    app.run(port=5000, threaded=True, debug=True)


















