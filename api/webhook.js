import axios from 'axios';

export default async function handler(req, res) {
  // 1. تأكيد الربط مع ميتا
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    } else {
      return res.status(403).json({ error: 'Verification failed' });
    }
  }

  // 2. استقبال الرسايل والرد
  if (req.method === 'POST') {
    try {
      const body = req.body;
      if (body.object && body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
        const phone_number_id = body.entry[0].changes[0].value.metadata.phone_number_id;
        const from = body.entry[0].changes[0].value.messages[0].from;
        const msg_body = body.entry[0].changes[0].value.messages[0].text.body;

        // البرومبت الخاص بيك
        const systemPrompt = `أنت ممثل خدمة العملاء لـ Elnems Films المتخصصة في كورسات المونتاج. ردودك قصيرة جداً ومرحة.`;
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

        const geminiResponse = await axios.post(geminiUrl, {
          contents: [{ parts: [{ text: msg_body }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] }
        });

        let botReply = geminiResponse.data.candidates[0].content.parts[0].text.replace(/[*#]/g, '').trim();

        // الإرسال للواتساب
        await axios({
          method: 'POST',
          url: `https://graph.facebook.com/v18.0/${phone_number_id}/messages`,
          headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
          data: { messaging_product: 'whatsapp', to: from, text: { body: botReply } }
        });
      }
      return res.status(200).send('EVENT_RECEIVED');
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).send('Error');
    }
  }

  res.status(405).send('Method Not Allowed');
}
