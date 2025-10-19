const stopWords = new Set([
  'and', 'or', 'the', 'is', 'a', 'an', 'of', 'to', 'in', 'for', 'on', 'at', 'with',
  'và', 'hoặc', 'là', 'của', 'cho', 'trong', 'với', 'các', 'những', 'một', 'được', 'từ'
]);

const normalize = (text = '') => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\sàáạãảâầấậẫẩăằắặẵẳèéẹẽẻêềếệễểìíịĩỉòóọõỏôồốộỗổơờớợỡởùúụũủưừứựữửỳýỵỹỷđ-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => !stopWords.has(token));
};

const buildFrequencyMap = (tokens) => {
  return tokens.reduce((acc, token) => {
    acc[token] = (acc[token] || 0) + 1;
    return acc;
  }, {});
};

const cosineSimilarity = (vecA, vecB) => {
  const intersection = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dot = 0;
  let magA = 0;
  let magB = 0;

  intersection.forEach((term) => {
    const a = vecA[term] || 0;
    const b = vecB[term] || 0;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  });

  if (!magA || !magB) {
    return 0;
  }

  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
};

module.exports = {
  normalize,
  buildFrequencyMap,
  cosineSimilarity
};