import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer, TfidfTransformer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn import metrics
from joblib import dump

# Load dataset
df = pd.read_csv('dark_patterns.csv')

# Drop rows with missing values in "Pattern String"
df = df[pd.notnull(df["Pattern String"])]

# Select relevant columns
selected_classification = "Pattern Category"
col = ["Pattern String", selected_classification]
df = df[col]

# Encode categories
df["category_id"] = df[selected_classification].factorize()[0]
category_id_df = df[[selected_classification, 'category_id']].drop_duplicates().sort_values('category_id')
category_to_id = dict(category_id_df.values)
id_to_category = dict(category_id_df[['category_id', selected_classification]].values)

# Define features and labels
tfidf = TfidfVectorizer(sublinear_tf=True, min_df=5, norm='l2', encoding='latin-1', ngram_range=(1, 2), stop_words='english')
features = tfidf.fit_transform(df["Pattern String"]).toarray()
labels = df.category_id

# Split data into training and test sets
X_train, X_test, y_train, y_test = train_test_split(df['Pattern String'], df[selected_classification], test_size=0.3, random_state=42)

# Convert text data to TF-IDF features
count_vect = CountVectorizer()
X_train_counts = count_vect.fit_transform(X_train)
tfidf_transformer = TfidfTransformer()
X_train_tfidf = tfidf_transformer.fit_transform(X_train_counts)

# Train the classifier
clf = MultinomialNB().fit(X_train_tfidf, y_train)

# Make predictions
y_pred = clf.predict(count_vect.transform(X_test))

# Evaluate accuracy
accuracy = metrics.accuracy_score(y_test, y_pred)
precision = metrics.precision_score(y_test, y_pred, average='weighted')
recall = metrics.recall_score(y_test, y_pred, average='weighted')
f1_score = metrics.f1_score(y_test, y_pred, average='weighted')

print("Accuracy:", accuracy)
print("Precision:", precision)
print("Recall:", recall)
print("f1_score:", f1_score)

# Save the model and vectorizer
dump(clf, 'category_classifier.joblib')
dump(count_vect, 'category_vectorizer.joblib')
