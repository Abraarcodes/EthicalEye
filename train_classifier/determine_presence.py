import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer, TfidfTransformer
from sklearn.naive_bayes import BernoulliNB
from sklearn import metrics
from joblib import dump
from sklearn.metrics import confusion_matrix

# Load datasets
df1 = pd.read_csv('normie.csv')
df2 = pd.read_csv('dark_patterns.csv')

# Preprocess normie dataset
df1 = df1[pd.notnull(df1["Pattern String"])]
df1 = df1[df1["classification"] == 0]
df1["classification"] = "Not Dark"
df1 = df1.drop_duplicates(subset="Pattern String")

# Preprocess dark patterns dataset
df2 = df2[pd.notnull(df2["Pattern String"])]
df2["classification"] = "Dark"
col = ["Pattern String", "classification"]
df2 = df2[col]

# Combine datasets
df = pd.concat([df1, df2])

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(df['Pattern String'], df["classification"], test_size=0.30, random_state=42)

# Convert text data to TF-IDF features
count_vect = CountVectorizer()
X_train_counts = count_vect.fit_transform(X_train)
tfidf_transformer = TfidfTransformer()
X_train_tfidf = tfidf_transformer.fit_transform(X_train_counts)

# Train the classifier
clf = BernoulliNB().fit(X_train_tfidf, y_train)

# Make predictions
y_pred = clf.predict(count_vect.transform(X_test))

# Evaluate metrics
accuracy = metrics.accuracy_score(y_test, y_pred)
precision = metrics.precision_score(y_test, y_pred, average='weighted')
recall = metrics.recall_score(y_test, y_pred, average='weighted')
f1_score = metrics.f1_score(y_test, y_pred, average='weighted')

print("Accuracy:", accuracy)
print("Precision:",precision)
print("Recall:",recall)
print("f1_score:",f1_score)


# Save the model and vectorizer
dump(clf, 'presence_classifier.joblib')
dump(count_vect, 'presence_vectorizer.joblib')
