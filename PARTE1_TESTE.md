# 🧪 PARTE 1 - GUIA DE TESTES

## ✅ O QUE FOI IMPLEMENTADO

### Arquivos modificados:
1. **src/webhooks/webhooks.module.ts**
   - ✅ Adicionado `TransformersModule` aos imports

2. **src/webhooks/webhooks.service.ts**
   - ✅ Adicionados imports: `uuid`, `KAFKA_TOPICS`, `HL7ToFhirTransformer`
   - ✅ Injetado `HL7ToFhirTransformer` no constructor
   - ✅ Implementado `detectIntegrationType()` - detecta HL7/TISS/ERP
   - ✅ Implementado `processInbound()` - roteamento por tipo
   - ✅ Implementado `processHl7()` completo - HL7→FHIR→MongoDB→Kafka
   - ⏳ `processTiss()` e `processErp()` marcados como TODO (Parte 2)

---

## 🚀 COMO TESTAR

### **Pré-requisitos:**
```bash
# 1. Subir o ambiente Docker
docker compose up -d

# 2. Aguardar todos os serviços subirem (30-60 segundos)
docker ps

# Você deve ver:
# - integration-service
# - kafka
# - zookeeper
# - mongodb
```

---

## 📝 TESTE 1: Enviar HL7 via curl

### **Dados de teste (HL7 válido - Resultado de Glicose):**

```bash
curl -X POST http://localhost:3010/webhooks/inbound \
  -H "Content-Type: application/json" \
  -d '{
    "data": "MSH|^~\\&|LAB|ExtLab|||20251109120000||ORU^R01|MSG123|P|2.5\nPID|1||12345||Silva^João||19850315|M\nOBR|1||ORD001||GLU^Glucose^LOINC|||20251109120000\nOBX|1|NM|GLU^Glucose^LOINC|1|95|mg/dL|70-100|N|||F|||20251109120000",
    "source": "test-lab",
    "contentType": "HL7"
  }'
```

### **Resultado esperado (sucesso):**
```json
{
  "message": "Inbound received",
  "result": {
    "success": true,
    "eventId": "abc-123-uuid-aqui",
    "fhirResource": {
      "resourceType": "Observation",
      "id": "LAB-ORD001-1",
      "status": "final",
      "category": [
        {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/observation-category",
              "code": "laboratory"
            }
          ]
        }
      ],
      "code": {
        "coding": [
          {
            "system": "http://loinc.org",
            "code": "GLU",
            "display": "Glucose"
          }
        ]
      },
      "subject": {
        "reference": "Patient/12345",
        "display": "Silva, João"
      },
      "valueQuantity": {
        "value": 95,
        "unit": "mg/dL"
      },
      "interpretation": [
        {
          "coding": [
            {
              "code": "N",
              "display": "Normal"
            }
          ]
        }
      ],
      "referenceRange": [
        {
          "low": {
            "value": 70
          },
          "high": {
            "value": 100
          }
        }
      ]
    }
  }
}
```

---

## 📝 TESTE 2: Verificar MongoDB (log salvo)

```bash
# Entrar no container MongoDB
docker exec -it mongodb mongosh

# Dentro do mongosh:
use integration

# Buscar todos os logs
db.integrationlogs.find().pretty()
```

### **Resultado esperado:**
```javascript
{
  _id: ObjectId("..."),
  eventId: "abc-123-uuid-aqui",
  type: "HL7",
  direction: "inbound",
  source: "test-lab",
  payload: "MSH|^~\\&|LAB|ExtLab...",  // HL7 original
  fhirResource: {
    resourceType: "Observation",
    // ... objeto FHIR completo
  },
  status: "success",
  kafkaTopic: "integration.events",
  createdAt: ISODate("2025-11-09T..."),
  updatedAt: ISODate("2025-11-09T...")
}
```

---

## 📝 TESTE 3: Verificar Kafka (evento publicado)

```bash
# Consumir mensagens do tópico integration.events
docker exec -it kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic integration.events \
  --from-beginning
```

### **Resultado esperado:**
```json
{
  "eventId": "abc-123-uuid-aqui",
  "eventType": "ExternalDataReceived",
  "timestamp": "2025-11-09T12:00:00.000Z",
  "source": "integration-service",
  "resourceType": "Observation",
  "data": {
    "resourceType": "Observation",
    "id": "LAB-ORD001-1",
    "status": "final",
    // ... resto do FHIR
  }
}
```

**Pressione Ctrl+C para sair do consumer**

---

## 📝 TESTE 4: Testar detecção de TISS (deve retornar erro por enquanto)

```bash
curl -X POST http://localhost:3010/webhooks/inbound \
  -H "Content-Type: application/json" \
  -d '{
    "data": "<?xml version=\"1.0\"?><GuiaTISS><numeroGuia>123</numeroGuia></GuiaTISS>",
    "source": "test-insurance",
    "contentType": "TISS"
  }'
```

### **Resultado esperado (erro esperado):**
```json
{
  "statusCode": 500,
  "message": "TISS processing not implemented yet"
}
```

**Isso é CORRETO! TISS será implementado na Parte 2.**

---

## 📝 TESTE 5: Testar detecção de ERP (deve retornar erro por enquanto)

```bash
curl -X POST http://localhost:3010/webhooks/inbound \
  -H "Content-Type: application/json" \
  -d '{
    "data": "{\"invoiceId\":\"INV-001\",\"total\":350.00}",
    "source": "test-erp",
    "contentType": "ERP"
  }'
```

### **Resultado esperado (erro esperado):**
```json
{
  "statusCode": 500,
  "message": "ERP processing not implemented yet"
}
```

**Isso é CORRETO! ERP será implementado na Parte 2.**

---

## ✅ CHECKLIST DE VALIDAÇÃO

- [ ] **Teste 1 passou:** HL7 foi transformado em FHIR com sucesso
- [ ] **Teste 2 passou:** MongoDB tem o log com status "success"
- [ ] **Teste 3 passou:** Kafka recebeu o evento no tópico integration.events
- [ ] **Teste 4 retornou erro esperado:** "TISS processing not implemented yet"
- [ ] **Teste 5 retornou erro esperado:** "ERP processing not implemented yet"

---

## 🐛 TROUBLESHOOTING

### **Erro: "Cannot connect to MongoDB"**
```bash
# Verificar se MongoDB está rodando
docker ps | grep mongodb

# Verificar logs do MongoDB
docker logs mongodb
```

### **Erro: "Cannot connect to Kafka"**
```bash
# Verificar se Kafka está rodando
docker ps | grep kafka

# Verificar logs do Kafka
docker logs kafka
```

### **Erro: "Module not found: TransformersModule"**
```bash
# Recompilar o projeto
npm run build

# Ou reiniciar em modo dev
npm run start:dev
```

---

## 🎯 PRÓXIMOS PASSOS

Após validar que tudo está funcionando:

1. **Fazer commit:**
```bash
git add src/webhooks/
git commit -m "feat: implement HL7 processing with FHIR transformation

- Add TransformersModule to WebhooksModule
- Implement detectIntegrationType() for format detection
- Implement processInbound() with routing logic
- Implement complete processHl7() flow:
  * HL7 → FHIR transformation
  * MongoDB logging
  * Kafka event publishing
- Add error handling with MongoDB error logs

Related to: ROADMAP.md Steps 1-2"
```

2. **Push para o repositório:**
```bash
git push origin master
```

3. **Avisar seu colega que pode começar a Parte 2** 🚀

---

## 📊 RESUMO DA PARTE 1

| Item | Status |
|------|--------|
| TransformersModule importado | ✅ |
| HL7ToFhirTransformer injetado | ✅ |
| detectIntegrationType() | ✅ |
| processInbound() | ✅ |
| processHl7() completo | ✅ |
| MongoDB logging | ✅ |
| Kafka publishing | ✅ |
| Error handling | ✅ |
| processTiss() | ⏳ Parte 2 |
| processErp() | ⏳ Parte 2 |

---

**PARTE 1 COMPLETA! 🎉**
