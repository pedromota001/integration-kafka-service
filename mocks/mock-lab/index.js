const express = require('express');
const axios = require('axios');

const app = express();

app.get('/send', async (req, res) => {
  try {
    console.log('🧪 Enviando HL7...');

    const hl7Message = `MSH|^~\\&|LAB|ExtLab|||20250126|ORU^R01|MSG001|P|2.5
PID|1||P001||Silva^João||19900101|M
OBR|1||ORD001|GLU^Glicose
OBX|1|NM|GLU||95|mg/dL|70-100|N`;

    const response = await axios.post(
      'http://integration-service:3010/webhooks/hl7',
      hl7Message,
      { headers: { 'Content-Type': 'text/plain' } }
    );

    res.json({ success: true, response: response.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(4001, '0.0.0.0', () => {
  console.log('🧪 Mock Lab na porta 4001');
  console.log('   Teste: curl http://localhost:4001/send');
});
