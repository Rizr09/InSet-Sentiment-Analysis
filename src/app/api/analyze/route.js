import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const loadLexicon = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = new Map();
    // use path.resolve
    fs.createReadStream(path.join(process.cwd(), filePath))
      .pipe(csv({ separator: '\t', headers: ['word', 'weight'] }))
      .on('data', (data) => results.set(data.word, parseFloat(data.weight)))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
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

    // log pwd
    console.log('process.cwd():', process.cwd());

    const positiveLexicon = await loadLexicon('public/inset/positive.tsv');
    const negativeLexicon = await loadLexicon('public/inset/negative.tsv');
    
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