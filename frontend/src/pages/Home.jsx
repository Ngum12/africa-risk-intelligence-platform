import React, { useState } from 'react';
import Form from '../components/Form';
import PredictionResult from '../components/PredictionResult';

export default function Home() {
  const [result, setResult] = useState(null);

  return (
    <div className="container mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Africa Risk Intelligence Platform</h1>
        <p className="text-lg text-gray-300 mb-6">
          AI-powered conflict risk assessment and prediction
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Risk Assessment</h2>
          <Form onResult={setResult} />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold mb-4">Prediction Results</h2>
          {result ? (
            <PredictionResult result={result} />
          ) : (
            <div className="bg-gray-800 p-6 rounded-xl shadow-md text-center">
              <p className="text-gray-400">Enter details on the left to generate a risk assessment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}