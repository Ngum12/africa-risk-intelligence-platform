import React from 'react';

export default function PredictionResult({ result }) {
  if (!result) return null;
  
  // Format the confidence value to two decimal places
  const formattedConfidence = Number(result.confidence).toFixed(2);
  
  return (
    <div className="p-6 bg-gray-800 rounded-xl shadow-md">
      <h2 className="text-xl font-bold text-center mb-4">📊 Prediction Result</h2>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span>Risk Level:</span>
          <span className={`font-bold text-lg ${result.prediction === 'High Risk' ? 'text-red-500' : 'text-green-400'}`}>
            {result.prediction}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>Confidence:</span>
          <span className="font-bold">{formattedConfidence}%</span>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <h3 className="font-bold mb-2">🧠 AI Recommendation</h3>
          <p className="whitespace-pre-line text-sm">{result.ai_recommendation}</p>
        </div>
        <div>
          <h3 className="font-bold mb-2">📉 If No Action Taken</h3>
          <p className="whitespace-pre-line text-sm">{result.if_no_action}</p>
        </div>
      </div>
      {result.warning && (
        <div className="mt-4 p-2 bg-yellow-800 border border-yellow-600 rounded-md">
          <p className="text-sm text-yellow-200">{result.warning}</p>
        </div>
      )}
    </div>
  );
}