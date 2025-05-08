# Text Preprocessing Application

A modern web application for natural language processing and text preprocessing with a React frontend and FastAPI backend.

![Application Screenshot](https://via.placeholder.com/800x450)

## Features

- **Text Tokenization**: Split text into individual tokens
- **Stemming & Lemmatization**: Compare different word normalization techniques
- **Part-of-Speech Tagging**: Identify grammatical parts of speech
- **Named Entity Recognition**: Extract named entities from text
- **Interactive Comparison**: View real examples showing the differences between stemming and lemmatization

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Modern ES6+ JavaScript

### Backend
- FastAPI
- NLTK (Natural Language Toolkit)
- spaCy
- Python 3.8+

## Getting Started

### Prerequisites
- Node.js and npm
- Python 3.8 or higher
- pip (Python package manager)

### Backend Setup

1. Clone the repository
   ```bash
   git clone https://github.com/Anjila-26/text-preprocessing-app.git
   cd text-preprocessing-app/backend
   ```

2. Create a virtual environment
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment
   ```bash
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

4. Install dependencies
   ```bash
   pip install fastapi uvicorn spacy nltk
   ```

5. Download required models
   ```bash
   python -m spacy download en_core_web_sm
   python -c "import nltk; nltk.download('punkt')"
   ```

6. Start the backend server
   ```bash
   uvicorn main:app --reload
   ```

The backend will be running at http://localhost:8000.

### Frontend Setup

1. Navigate to the frontend directory
   ```bash
   cd ../frontend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

The frontend will be running at http://localhost:3000.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/tokenize` | GET | Tokenizes input text |
| `/stem` | GET | Applies stemming to input text |
| `/lemmatize` | GET | Applies lemmatization to input text |
| `/pos_tagging` | GET | Returns part-of-speech tags for input text |
| `/entity_recognition` | GET | Identifies named entities in input text |
| `/comparison_examples` | GET | Returns examples comparing stemming and lemmatization |

## Understanding Text Preprocessing

### Tokenization
Tokenization is the process of breaking text into smaller units called tokens. Tokens can be words, characters, or subwords, depending on the tokenization strategy.

### Stemming vs. Lemmatization
Both stemming and lemmatization reduce words to their base or root form, but they use different approaches:

- **Stemming**: Uses an algorithm to remove common word endings (suffixes) from words. It's faster but can sometimes produce non-words.
- **Lemmatization**: Uses vocabulary and morphological analysis to return the base dictionary form of a word. It's more accurate but computationally intensive.

### Part-of-Speech Tagging
POS tagging is the process of marking up words in text according to their part of speech (e.g., noun, verb, adjective). This helps in understanding the grammatical structure of sentences.

### Named Entity Recognition
NER is the process of identifying and categorizing named entities in text into predefined categories such as person names, organizations, locations, etc.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- NLTK - For providing tools for natural language processing
- spaCy - For the comprehensive NLP library
- FastAPI - For the high-performance web framework
- React - For the frontend library
- Tailwind CSS - For the utility-first CSS framework

