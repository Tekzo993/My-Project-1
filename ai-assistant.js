const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  console.log('🚀 Function started with NEW URL');
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { message } = JSON.parse(event.body);
    console.log('💬 User message:', message);

    if (!process.env.HF_API_KEY) {
      throw new Error('HF_API_KEY environment variable is not set');
    }

    console.log('🔄 Calling NEW Hugging Face API endpoint...');
    
    // НОВЫЙ URL - ВАЖНО!
    const hfResponse = await fetch(
      'https://router.huggingface.co/hf-inference/models/deepseek-ai/DeepSeek-Coder-6.7B-Instruct',
      {
        headers: {
          'Authorization': `Bearer ${process.env.HF_API_KEY}`,
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
          inputs: `Ты - AI ассистент по программированию на C++. Ответь подробно и понятно на вопрос: ${message}`,
          parameters: {
            max_new_tokens: 300,
            temperature: 0.7
          }
        })
      }
    );

    console.log('📡 HF API Status:', hfResponse.status);
    
    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.error('❌ HF API Error:', errorText);
      throw new Error(`Hugging Face API error: ${hfResponse.status}`);
    }

    const data = await hfResponse.json();
    console.log('✅ HF API Response received');

    if (data && data[0] && data[0].generated_text) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ response: data[0].generated_text })
      };
    } else {
      throw new Error('Unexpected response format from AI');
    }

  } catch (error) {
    console.error('💥 Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};