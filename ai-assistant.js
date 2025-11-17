const fetch = require('node-fetch');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { message } = JSON.parse(event.body);

    const response = await fetch(
      'https://api-inference.huggingface.co/models/deepseek-ai/DeepSeek-Coder-6.7B-Instruct',
      {
        headers: {
          'Authorization': `Bearer ${process.env.HF_API_KEY}`,
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
          inputs: `Ты - AI ассистент по программированию на C++. Ответь подробно и понятно на вопрос: ${message}`,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
            return_full_text: false
          }
        })
      }
    );

    const data = await response.json();
    
    if (data && data[0] && data[0].generated_text) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ response: data[0].generated_text })
      };
    } else {
      throw new Error('Invalid response from AI');
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};