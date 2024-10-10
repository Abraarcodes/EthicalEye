from flask import Flask, jsonify, request
from flask_cors import CORS
from transformers import BertTokenizer, BertForSequenceClassification
import torch

# Load BERT models and tokenizers
presence_tokenizer = BertTokenizer.from_pretrained('./presence_bert_model')
presence_model = BertForSequenceClassification.from_pretrained('./presence_bert_model')

category_tokenizer = BertTokenizer.from_pretrained('./category_bert_model')
category_model = BertForSequenceClassification.from_pretrained('./category_bert_model')

app = Flask(__name__)
CORS(app)

# Function for prediction using BERT models
def predict_with_bert(texts, model, tokenizer):
    model.eval()
    encodings = tokenizer(texts, padding=True, truncation=True, return_tensors='pt')
    with torch.no_grad():
        outputs = model(**encodings)
    logits = outputs.logits
    predictions = torch.argmax(logits, dim=-1).tolist()
    return predictions

@app.route('/', methods=['POST'])
def main():
    if request.method == 'POST':
        output = []
        data = request.get_json().get('tokens')

        texts = [token['text'] for token in data]
        presence_predictions = predict_with_bert(texts, presence_model, presence_tokenizer)

        for i, token in enumerate(data):
            if presence_predictions[i] == 1:  # Dark
                # Predict category for dark patterns
                category_predictions = predict_with_bert([token['text']], category_model, category_tokenizer)
                category = 'Category_' + str(category_predictions[0])  
            else:
                category = 'Not Dark'
            output.append({'index': token['index'], 'category': category})

        # Create a dictionary for the output
        response = {'result': output}

        # Print the results for debugging
        dark = [data[i] for i in range(len(output)) if output[i]['category'] != 'Not Dark']
        print("Detected Dark Patterns:")
        for d in dark:
            print(d)
        print()
        print(f"Number of detected dark patterns: {len(dark)}")

        return jsonify(response)

if __name__ == '__main__':
    app.run(port=5001, threaded=True, debug=True)