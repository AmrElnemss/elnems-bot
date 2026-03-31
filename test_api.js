const fs = require('fs');

async function test() {
    const API_KEY = "AIzaSyC47xtmmqZPloz426uy5dwHQ-AIxrOsGY0";
    const MODEL = "gemini-2.0-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
    
    const payload = {
        contents: [
            { role: 'user', parts: [{ text: 'سلام' }] }
        ],
        systemInstruction: { parts: [{ text: 'أنت ممثل خدمة عملاء' }] }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    console.log(response.status);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
}

test();
