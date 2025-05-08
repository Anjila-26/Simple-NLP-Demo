from fastapi import FastAPI
import uvicorn
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import spacy
import nltk
from nltk.stem import PorterStemmer
from nltk.tokenize import word_tokenize

app = FastAPI()

#CORS Middleware
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

nltk.download('punkt')
ps = PorterStemmer()
nlp = spacy.load("en_core_web_sm")

from typing import List

class ComparisonExample(BaseModel):
    word: str
    stemmed: str
    lemmatized: str
    explanation: str

class ComparisonResponse(BaseModel):
    examples: List[ComparisonExample]
    differences: List[str]


@app.get("/tokenize")
async def tokenize_text(text:str):
    tokens = word_tokenize(text)
    return {"tokens": tokens}

@app.get("/stem")
async def stem_text(text: str):
    tokens = word_tokenize(text)
    stemmed_tokens = [ps.stem(token) for token in tokens]
    return {"stemmed_tokens": stemmed_tokens}

@app.get("/lemmatize")
async def lemmatize_text(text):
    doc = nlp(text)
    lemmatize_tokens = [token.lemma_ for token in doc]
    return {"lemmatized_tokens": lemmatize_tokens}

#POS Tagging
@app.get("/pos_tagging")
def pos_tagging(text):
    doc = nlp(text)
    pos_tags = [(token.text, token.pos_) for token in doc]
    return {"pos_tags": pos_tags}

@app.get("/entity_recognition")
def entity_recognition(text):
    doc = nlp(text)
    entities = [(ent.text, ent.label_) for ent in doc.ents]
    return {"entities": entities}
    

def run_local_tests():
    text = "Sundar Pichai is the CEO of Google. Its headquarters is in Mountain View."
    tokens = word_tokenize(text)
    stemmed = [ps.stem(token) for token in tokens]
    doc = nlp(text)
    lemmatized = [token.lemma_ for token in doc]
    pos_tags = [(token.text, token.pos_) for token in doc]
    entities = [(ent.text, ent.label_) for ent in doc.ents]

    print("Original Text:", text)
    print("Tokens:", tokens)
    print("Stemmed:", stemmed)
    print("Lemmatized:", lemmatized)
    print("POS Tags:", pos_tags)
    print("Entities:", entities)

@app.get("/comparison_examples", response_model=ComparisonResponse)
async def get_comparison_examples():
    # Words chosen to highlight differences between stemming and lemmatization
    words = [
        "running", "better", "studies", "wolves", "caring",
        "are", "mice", "understood", "worst", "children"
    ]
    
    examples = []
    
    for word in words:
        # Get stemmed version
        stemmed = ps.stem(word)
        
        # Get lemmatized version
        doc = nlp(word)
        lemmatized = doc[0].lemma_
        
        # Determine appropriate explanation
        if word == "running":
            explanation = "Simple verb form"
        elif word == "better":
            explanation = "Comparative adjective to base form"
        elif word == "studies":
            explanation = "Plural noun to singular"
        elif word == "wolves":
            explanation = "Irregular plural noun"
        elif word == "caring":
            explanation = "Continuous verb form"
        elif word == "are":
            explanation = "Irregular verb form"
        elif word == "mice":
            explanation = "Irregular plural noun"
        elif word == "understood":
            explanation = "Past tense verb"
        elif word == "worst":
            explanation = "Superlative to base form"
        elif word == "children":
            explanation = "Irregular plural noun"
        else:
            explanation = "Base form reduction"
            
        examples.append(
            ComparisonExample(
                word=word,
                stemmed=stemmed,
                lemmatized=lemmatized,
                explanation=explanation
            )
        )
    
    # Key differences between stemming and lemmatization
    differences = [
        "Stemming uses algorithmic rules to chop off word endings, sometimes resulting in non-words.",
        "Lemmatization uses linguistic knowledge to return proper dictionary forms.",
        "Stemming is faster but less accurate than lemmatization.",
        "Lemmatization considers the word's context and part of speech.",
        "Stemming is more suitable for quick information retrieval tasks.",
        "Lemmatization is better for text analysis where accuracy is critical."
    ]
    
    return ComparisonResponse(examples=examples, differences=differences)
