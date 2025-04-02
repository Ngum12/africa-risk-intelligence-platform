import React from 'react';

export default function ResultCard({ result }) {
  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-lg space-y-4">
      <h2 className="text-2xl font-bold text-green-400">📊 Prediction Result</h2>

      <div>
        <p className="text-lg">
          <strong>Risk Level:</strong>{' '}
          <span className={result.prediction === 'High Risk' ? 'text-red-500 font-semibold' : 'text-yellow-300 font-semibold'}>
            {result.prediction}
          </span>
        </p>
        <p className="text-lg">
          <strong>Confidence:</strong> {Math.round(result.confidence * 100)}%
        </p>
      </div>

      <div className="bg-gray-700 p-4 rounded">
        <h3 className="text-md font-semibold mb-2 text-blue-300">🧠 AI Recommendation</h3>
        <pre className="text-sm whitespace-pre-wrap text-white">{result.ai_recommendation}</pre>
      </div>

      <div className="bg-gray-700 p-4 rounded">
        <h3 className="text-md font-semibold mb-2 text-orange-300">📉 If No Action Taken</h3>
        <pre className="text-sm whitespace-pre-wrap text-white">{result.if_no_action}</pre>
      </div>
    </div>
  );
}
