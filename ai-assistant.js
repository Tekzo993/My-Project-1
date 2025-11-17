const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  console.log('🚀 Function started at:', new Date().toISOString());
  console.log('HTTP Method:', event.httpMethod);
  console.log('Path:', event.path);
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    console.log('📝 Handling OPTIONS preflight');
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    console.log('❌ Method not allowed:', event.httpMethod);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('📦 Raw body:', event.body);
    
    if (!event.body) {
      throw new Error('No body provided');
    }

    const { message } = JSON.parse(event.body);
    console.log('💬 User message:', message);

    if (!message) {
      throw new Error('Message is required');
    }

    // Check if API key is available
    if (!process.env.HF_API_KEY) {
      throw new Error('HF_API_KEY environment variable is not set');
    }
    console.log('✅ HF_API_KEY is available');

    console.log('🔄 Calling Hugging Face API...');
    const hfResponse = await fetch(
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
            max_new_tokens: 300,
            temperature: 0.7,
            return_full_text: false
          }
        })
      }
    );

    console.log('📡 HF API Status:', hfResponse.status);
    
    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.error('❌ HF API Error:', errorText);
      throw new Error(`Hugging Face API error: ${hfResponse.status} - ${errorText}`);
    }

    const data = await hfResponse.json();
    console.log('✅ HF API Response:', JSON.stringify(data, null, 2));

    // Handle response format
    if (data && data[0] && data[0].generated_text) {
      const responseText = data[0].generated_text;
      console.log('🤖 AI Response:', responseText);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ response: responseText })
      };
    } else if (data.error) {
      console.error('❌ HF API returned error:', data.error);
      throw new Error(`Hugging Face: ${data.error}`);
    } else {
      console.error('❌ Unexpected response format:', data);
      throw new Error('Unexpected response format from AI');
    }

  } catch (error) {
    console.error('💥 Critical error:', error);
    console.error('Error stack:', error.stack);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message,
        details: 'Check function logs for more information'
      })
    };
  }
};