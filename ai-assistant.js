const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  console.log('🚀 Function started');
  
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

    console.log('🔄 Calling Hugging Face API...');
    
    // Попробуем другую модель с более стабильным API
    const hfResponse = await fetch(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large',
      {
        headers: {
          'Authorization': `Bearer ${process.env.HF_API_KEY}`,
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
          inputs: {
            text: `Ты - AI ассистент по программированию на C++. Ответь на вопрос: ${message}`
          },
          parameters: {
            max_new_tokens: 200,
            temperature: 0.7
          }
        })
      }
    );

    console.log('📡 HF API Status:', hfResponse.status);
    
    if (!hfResponse.ok) {
      // Если ошибка, попробуем альтернативный endpoint
      console.log('🔄 Trying alternative endpoint...');
      const altResponse = await fetch(
        'https://router.huggingface.co/hf-inference/models/microsoft/DialoGPT-large',
        {
          headers: {
            'Authorization': `Bearer ${process.env.HF_API_KEY}`,
            'Content-Type': 'application/json'
          },
          method: 'POST',
          body: JSON.stringify({
            inputs: `Ты - AI ассистент по программированию на C++. Ответь на вопрос: ${message}`,
            parameters: {
              max_new_tokens: 200,
              temperature: 0.7
            }
          })
        }
      );
      
      if (!altResponse.ok) {
        const errorText = await altResponse.text();
        console.error('❌ Both endpoints failed');
        throw new Error(`Hugging Face API error: ${altResponse.status}`);
      }
      
      const altData = await altResponse.json();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ response: altData[0]?.generated_text || 'Ответ от AI' })
      };
    }

    const data = await hfResponse.json();
    console.log('✅ HF API Response received');

    // Обработка разных форматов ответа
    let responseText = 'Ответ от AI';
    
    if (data && data[0] && data[0].generated_text) {
      responseText = data[0].generated_text;
    } else if (data && data.generated_text) {
      responseText = data.generated_text;
    } else if (data && data.conversation && data.conversation.generated_responses) {
      responseText = data.conversation.generated_responses[0];
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ response: responseText })
    };

  } catch (error) {
    console.error('💥 Error:', error);
    
    // Демо-ответ если API не работает
    const demoResponses = {
      "объясни указатели": "Указатели в C++ - переменные, хранящие адреса памяти. Пример: int* ptr = &x;",
      "что такое ооп": "ООП в C++: классы, объекты, наследование, полиморфизм, инкапсуляция.",
      "векторы в c++": "vector<int> vec; - динамический массив. Методы: push_back(), size(), pop_back()",
      "default": `Извините, AI временно недоступен. Ваш вопрос: "${event.body ? JSON.parse(event.body).message : ''}". Для курсовой демонстрации используется заглушка.`
    };
    
    const userMessage = event.body ? JSON.parse(event.body).message.toLowerCase() : '';
    const demoResponse = demoResponses[userMessage] || demoResponses.default;
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ response: demoResponse })
    };
  }
};