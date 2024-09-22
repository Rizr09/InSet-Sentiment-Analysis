import fs from 'fs';
import fetch from 'node-fetch';

const POSITIVE_LEXICON_URL = 'https://raw.githubusercontent.com/fajri91/InSet/refs/heads/master/positive.tsv';
const NEGATIVE_LEXICON_URL = 'https://raw.githubusercontent.com/fajri91/InSet/refs/heads/master/negative.tsv';

const loadLexicon = async (url) => {
  const response = await fetch(url);
  const text = await response.text();
  const results = new Map();

  text.split('\n').forEach(line => {
    const [word, weight] = line.split('\t');
    if (word && weight) {
      results.set(word, parseFloat(weight));
    }
  });

  return results;
};

const preprocessText = (text) => {
  return text.toLowerCase().replace(/[^\w\s]/gi, '');
};

const calculateSentiment = (text, positiveLexicon, negativeLexicon) => {
  const words = preprocessText(text).split(/\s+/);
  let sentimentScore = 0;
  const positiveWords = [];
  const negativeWords = [];

  for (let i = 0; i < words.length; i++) {
    let longestMatch = '';
    let matchWeight = 0;
    let isPositive = false;

    for (let j = words.length; j > i; j--) {
      const phrase = words.slice(i, j).join(' ');
      const posWeight = positiveLexicon.get(phrase);
      const negWeight = negativeLexicon.get(phrase);

      if (posWeight !== undefined && phrase.length > longestMatch.length) {
        longestMatch = phrase;
        matchWeight = posWeight;
        isPositive = true;
      } else if (negWeight !== undefined && phrase.length > longestMatch.length) {
        longestMatch = phrase;
        matchWeight = negWeight;
        isPositive = false;
      }
    }

    if (longestMatch) {
      sentimentScore += matchWeight;
      if (isPositive) {
        positiveWords.push(longestMatch);
      } else {
        negativeWords.push(longestMatch);
      }
      i += longestMatch.split(' ').length - 1;
    }
  }

  const comparative = words.length > 0 ? sentimentScore / words.length : 0;
  const verdict = sentimentScore > 0 ? 'POSITIVE' : sentimentScore < 0 ? 'NEGATIVE' : 'NEUTRAL';

  return {
    verdict,
    score: sentimentScore,
    comparative,
    positive: positiveWords,
    negative: negativeWords,
  };
};

export async function POST(req) {
  try {
    const { text } = await req.json();
    
    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid input. Text must be a non-empty string.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Load lexicons from URLs
    const [positiveLexicon, negativeLexicon] = await Promise.all([
      loadLexicon(POSITIVE_LEXICON_URL),
      loadLexicon(NEGATIVE_LEXICON_URL)
    ]);
    
    const result = calculateSentiment(text, positiveLexicon, negativeLexicon);
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in sentiment analysis:', error);
    return new Response(JSON.stringify({ error: 'An error occurred while analyzing the sentiment.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}