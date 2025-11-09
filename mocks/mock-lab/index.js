const express = require('express');
const axios = require('axios');

const app = express();

app.get('/send', async (req, res) => {
  try {
    console.log('🧪 Enviando HL7 para Integration Service...');

    const hl7Message =
`MSH|^~\\&|LAB|ExtLab|||${Date.now()}||ORU^R01|MSG${Date.now()}|P|2.5
PID|1||12345||Silva^João||19850315|M
OBR|1||ORD123||GLU^Glucose^LOINC|||${Date.now()}
OBX|1|NM|GLU^Glucose^LOINC|1|95|mg/dL|70-100|N|||F|||${Date.now()}`;

    const response = await axios.post(
      'http://integration-service:3010/webhooks/inbound',
      {
        data: hl7Message,
        source: 'mock-lab',
        contentType: 'HL7',
      }
    );

    console.log('✅ Sucesso:', response.data);
    res.json({ success: true, response: response.data });
  } catch (error) {
    console.error('❌ Erro:', error.message);
    res.status(500).json({
      error: error.message,
      details: error.response?.data
    });
  }
});

app.listen(4001, '0.0.0.0', () => {
  console.log('🧪 Mock Lab rodando na porta 4001');
  console.log('   Teste: curl http://localhost:4001/send');
});