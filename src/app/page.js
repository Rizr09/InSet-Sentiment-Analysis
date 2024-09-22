'use client';

import React, { useState } from 'react';
import Head from 'next/head';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { duotoneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const InSetExplanation = () => (
  <div className="bg-indigo-100 border-l-4 border-indigo-500 text-indigo-700 p-4 mb-6 rounded">
    <p className="font-bold">About InSet (Indonesia Sentiment Lexicon):</p>
    <p className="mt-2">
      Composed using a collection of words from Indonesian tweets, InSet was constructed by manually weighting each word and enhanced by adding stemming and synonym sets. The result is a comprehensive lexicon containing 3,609 positive words and 6,609 negative words, with scores ranging from -5 to +5.
    </p>
  </div>
);

const SentimentResult = ({ result }) => (
  <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
    <h2 className="text-xl font-semibold">Hasil Analisis:</h2>
    <div className="bg-gray-100 p-4 rounded-md overflow-auto">
      <p><strong>Verdict:</strong> {result.verdict}</p>
      <p><strong>Score:</strong> {result.score.toFixed(2)}</p>
      <p><strong>Comparative:</strong> {result.comparative.toFixed(2)}</p>
      <p><strong>Positive words:</strong> {result.positive.join(', ')}</p>
      <p><strong>Negative words:</strong> {result.negative.join(', ')}</p>
    </div>
  </div>
);

export default function Home() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeSentiment = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while analyzing the sentiment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <Head>
        <title>Analisis Sentimen InSet</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-indigo-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-semibold text-black mb-5">
              <a
                href="https://www.researchgate.net/publication/321757985_InSet_Lexicon_Evaluation_of_a_Word_List_for_Indonesian_Sentiment_Analysis_in_Microblogs"
                target="_blank"
                rel="noopener noreferrer"
                className=""
              >
                Analisis Sentimen Menggunakan{' '}
                <span className="hover:text-indigo-600 transition-colors underline decoration-violet-600">
                  InSet (Indonesia Sentiment Lexicon)
                </span>
              </a>
            </h1>

            <InSetExplanation />

            <div className="space-y-6">
              <div className="flex flex-col">
                <label
                  htmlFor="text-input"
                  className="text-sm font-medium text-gray-700 mb-1"
                >
                  Masukkan teks untuk dianalisis, untuk referensi preprocessing lihat{' '}
                  <a
                    href="https://github.com/agushendra7/twitter-sentiment-analysis-using-inset-and-random-forest"
                    target="_blank"
                    className="underline"
                  >
                    disini
                  </a>
                  , atau hit endpoint {' '}
                  <code className="bg-gray-200 p-1 rounded-md text-indigo-600 break-all">
                      https://inset-sentiment-analysis.vercel.app/api/analyze
                  </code>{' '}
                  dengan method {' '}
                  <code className="bg-gray-200 p-1 rounded-md text-indigo-600 break-all">
                    POST
                  </code>
                  {' '}dan body sebagai berikut:
                </label>
                <SyntaxHighlighter language="json" style={duotoneDark} className="bg-gray-100 p-2 rounded-md">
                  {`{\n  "text": "halo dunia"\n}`}
                </SyntaxHighlighter>
                <textarea
                  id="text-input"
                  className="px-4 py-2 border focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md text-black"
                  rows="4"
                  placeholder="Masukkan teks di sini"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                ></textarea>
              </div>
              <button
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                onClick={analyzeSentiment}
                disabled={loading || !text.trim()}
              >
                {loading ? 'Menganalisis...' : 'Analisis Sentimen'}
              </button>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              {result && (
                <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                  <h2 className="text-xl font-semibold">Hasil Analisis:</h2>
                  <SyntaxHighlighter
                    language="json"
                    style={duotoneDark}
                    className="bg-gray-100 p-4 rounded-md overflow-auto"
                  >
                    {JSON.stringify(result, null, 2)}
                  </SyntaxHighlighter>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-black">
            Made with ❤️ by rizr09
          </div>
        </div>
      </div>
    </div>
  );
}
