'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('tokens');
  const [showExamples, setShowExamples] = useState(false);
  const [results, setResults] = useState({
    tokens: [],
    stemmed: [],
    lemmatized: [],
    pos: [],
    entities: []
  });
  
  // Example words for stemming vs lemmatization comparison
  const [exampleWords, setExampleWords] = useState([
    { word: "running", stem: "run", lemma: "run", explanation: "Simple verb form" },
    { word: "better", stem: "better", lemma: "good", explanation: "Comparative adjective to base form" },
    { word: "studies", stem: "studi", lemma: "study", explanation: "Plural noun to singular" },
    { word: "wolves", stem: "wolv", lemma: "wolf", explanation: "Irregular plural" },
    { word: "caring", stem: "care", lemma: "care", explanation: "Continuous form" },
    { word: "are", stem: "are", lemma: "be", explanation: "Irregular verb form" },
    { word: "mice", stem: "mice", lemma: "mouse", explanation: "Irregular plural noun" },
    { word: "understood", stem: "understood", lemma: "understand", explanation: "Past tense" },
    { word: "worst", stem: "worst", lemma: "bad", explanation: "Superlative to base form" },
    { word: "children", stem: "children", lemma: "child", explanation: "Irregular plural" }
  ]);
  
  const [differences, setDifferences] = useState([
    "Stemming uses algorithmic rules to chop off word endings, sometimes resulting in non-words.",
    "Lemmatization uses linguistic knowledge to return proper dictionary forms.",
    "Stemming is faster but less accurate than lemmatization.",
    "Lemmatization considers the word's context and part of speech."
  ]);

  const API_URL = "http://localhost:8000";

  // Function to compare single word stemming and lemmatization
  const processExampleWords = async () => {
    // Process example words to get real results from the API
    try {
      for (let i = 0; i < exampleWords.length; i++) {
        const word = exampleWords[i].word;
        const stemRes = await fetch(`${API_URL}/stem?text=${encodeURIComponent(word)}`);
        const lemmaRes = await fetch(`${API_URL}/lemmatize?text=${encodeURIComponent(word)}`);
        
        const stemData = await stemRes.json();
        const lemmaData = await lemmaRes.json();
        
        // Update the example word with actual results from API
        if (stemData.stemmed_tokens && stemData.stemmed_tokens.length > 0) {
          exampleWords[i].stem = stemData.stemmed_tokens[0];
        }
        
        if (lemmaData.lemmatized_tokens && lemmaData.lemmatized_tokens.length > 0) {
          exampleWords[i].lemma = lemmaData.lemmatized_tokens[0];
        }
      }
    } catch (error) {
      console.error("Error processing example words:", error);
    }
  };

  // Process example words on component mount
  // Define the type for the example object
  interface Example {
    word: string;
    stemmed: string;
    lemmatized: string;
    explanation: string;
  }
  
  useEffect(() => {
    // Try to fetch examples from the backend first
    const fetchExamples = async () => {
      try {
        const response = await fetch(`${API_URL}/comparison_examples`);
        if (response.ok) {
          const data = await response.json();
          // Update the state with the fetched examples
          setExampleWords(data.examples.map((ex: Example) => ({
            word: ex.word,
            stem: ex.stemmed,
            lemma: ex.lemmatized,
            explanation: ex.explanation
          })));
          setDifferences(data.differences);
        } else {
          // If backend endpoint doesn't exist, fallback to processing examples client-side
          processExampleWords();
        }
      } catch (error) {
        console.error("Error fetching examples:", error);
        // Fallback to processing examples client-side
        processExampleWords();
      }
    };
    
    fetchExamples();
  }, []);

  const handleProcess = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [tokensRes, stemRes, lemmatizeRes, posRes, entitiesRes] = await Promise.all([
        fetch(`${API_URL}/tokenize?text=${encodeURIComponent(text)}`),
        fetch(`${API_URL}/stem?text=${encodeURIComponent(text)}`),
        fetch(`${API_URL}/lemmatize?text=${encodeURIComponent(text)}`),
        fetch(`${API_URL}/pos_tagging?text=${encodeURIComponent(text)}`),
        fetch(`${API_URL}/entity_recognition?text=${encodeURIComponent(text)}`)
      ]);

      const tokens = await tokensRes.json();
      const stemmed = await stemRes.json();
      const lemmatized = await lemmatizeRes.json();
      const pos = await posRes.json();
      const entities = await entitiesRes.json();

      setResults({
        tokens: tokens.tokens,
        stemmed: stemmed.stemmed_tokens,
        lemmatized: lemmatized.lemmatized_tokens,
        pos: pos.pos_tags,
        entities: entities.entities
      });
    } catch (error) {
      console.error("Error processing text:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tokens':
        return (
          <div className="bg-white p-4 rounded-b-lg border border-t-0 border-gray-300 min-h-40">
            {results.tokens.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {results.tokens.map((token, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 rounded border border-gray-300">
                    {token}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">Process text to see tokens</p>
            )}
          </div>
        );
      
      case 'stemLemma':
        return (
          <div className="bg-white p-4 rounded-b-lg border border-t-0 border-gray-300 min-h-40">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Comparison</h3>
              <button 
                onClick={() => setShowExamples(!showExamples)}
                className="px-3 py-1 bg-black text-white rounded hover:bg-gray-800"
              >
                {showExamples ? 'Hide Examples' : 'Show Examples'}
              </button>
            </div>

            {showExamples && (
              <div className="mb-6 overflow-x-auto">
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Key Differences:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {differences.map((diff, index) => (
                      <li key={index}>{diff}</li>
                    ))}
                  </ul>
                </div>
                
                <table className="min-w-full border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2">Original Word</th>
                      <th className="border border-gray-300 px-4 py-2">Stemming Result</th>
                      <th className="border border-gray-300 px-4 py-2">Lemmatization Result</th>
                      <th className="border border-gray-300 px-4 py-2">Explanation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exampleWords.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-4 py-2 font-medium">{item.word}</td>
                        <td className="border border-gray-300 px-4 py-2">{item.stem}</td>
                        <td className="border border-gray-300 px-4 py-2">{item.lemma}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{item.explanation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {results.stemmed.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-r border-gray-300 pr-4">
                  <h3 className="font-bold text-lg mb-2 text-center">Stemming</h3>
                  <div className="flex flex-wrap gap-2">
                    {results.stemmed.map((token, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 rounded border border-gray-300">
                        {token}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pl-4">
                  <h3 className="font-bold text-lg mb-2 text-center">Lemmatization</h3>
                  <div className="flex flex-wrap gap-2">
                    {results.lemmatized.map((token, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 rounded border border-gray-300">
                        {token}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">Process text to see stemming and lemmatization comparison</p>
            )}
          </div>
        );
      
      case 'pos':
        return (
          <div className="bg-white p-4 rounded-b-lg border border-t-0 border-gray-300 min-h-40">
            {results.pos.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {results.pos.map((item, index) => (
                  <div key={index} className="flex flex-col items-center border border-gray-300 rounded p-2 bg-gray-50">
                    <span>{item[0]}</span>
                    <span className="text-xs font-semibold bg-black text-white px-2 py-1 rounded mt-1">{item[1]}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">Process text to see part-of-speech tags</p>
            )}
          </div>
        );
      
      case 'entities':
        return (
          <div className="bg-white p-4 rounded-b-lg border border-t-0 border-gray-300 min-h-40">
            {results.entities.length > 0 ? (
              results.entities.length > 0 ? (
                <div className="flex flex-wrap gap-4">
                  {results.entities.map((entity, index) => (
                    <div key={index} className="border border-gray-300 rounded p-3 bg-gray-50">
                      <div className="font-medium">{entity[0]}</div>
                      <div className="text-sm mt-1 bg-black text-white px-2 py-1 rounded text-center">
                        {entity[1]}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No entities found</p>
              )
            ) : (
              <p className="text-gray-500 italic">Process text to see named entities</p>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md border border-gray-300 p-6 mb-8">
          <h1 className="text-3xl font-bold mb-4 text-center">Text Preprocessing</h1>
          
          <div className="mb-6">
            <textarea
              className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Enter text for preprocessing..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          
          <div className="flex justify-center mb-8">
            <button
              className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-400"
              onClick={handleProcess}
              disabled={loading || !text.trim()}
            >
              {loading ? 'Processing...' : 'Process Text'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-t-lg shadow-md border border-gray-300">
          <div className="flex flex-wrap border-b border-gray-300">
            <button
              className={`px-4 py-3 font-medium ${activeTab === 'tokens' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
              onClick={() => setActiveTab('tokens')}
            >
              Tokenization
            </button>
            <button
              className={`px-4 py-3 font-medium ${activeTab === 'stemLemma' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
              onClick={() => setActiveTab('stemLemma')}
            >
              Stemming & Lemmatization
            </button>
            <button
              className={`px-4 py-3 font-medium ${activeTab === 'pos' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
              onClick={() => setActiveTab('pos')}
            >
              POS Tagging
            </button>
            <button
              className={`px-4 py-3 font-medium ${activeTab === 'entities' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
              onClick={() => setActiveTab('entities')}
            >
              Entity Recognition
            </button>
          </div>

          {renderTabContent()}
        </div>
        
        {activeTab === 'stemLemma' && (
          <div className="bg-white p-4 mt-8 rounded-lg shadow-md border border-gray-300">
            <h2 className="text-xl font-bold mb-4">Understanding the Difference</h2>
            <div className="space-y-4 text-sm">
              <p>
                <strong>Stemming</strong> is a simple process that removes or replaces word suffixes to arrive at a common base form of the word. It uses a set of rules without considering the context or part of speech.
              </p>
              <p>
                <strong>Lemmatization</strong> is a more sophisticated process that considers the word's context, part of speech, and uses vocabulary and morphological analysis to return the base dictionary form of a word (the lemma).
              </p>
              <p>
                While stemming is faster and requires less computational resources, lemmatization is more accurate but slower and more resource-intensive. The choice between them depends on your specific needs.
              </p>
              <p>
                <strong>When to use stemming:</strong> When processing speed is important and some inaccuracy is acceptable.
              </p>
              <p>
                <strong>When to use lemmatization:</strong> When accuracy is critical and you need proper dictionary forms.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}