# 📦 PARTE 2 - INSTRUÇÕES COMPLETAS PARA IMPLEMENTAÇÃO

## 👥 INFORMAÇÕES

**Responsável:** Colega do grupo
**Dependência:** Parte 1 DEVE estar concluída e commitada
**Tempo estimado:** 1h30min
**Arquivos a modificar:** 2 arquivos

---

## 🎯 OBJETIVO DA PARTE 2

Completar o projeto implementando o processamento de **TISS (XML)** e **ERP (JSON)**, além de atualizar o Mock Lab para enviar dados corretamente.

---

## ✅ PRÉ-REQUISITOS

Antes de começar, certifique-se de que:

```bash
# 1. Puxar as mudanças da Parte 1
git pull origin master

# 2. Verificar que o commit da Parte 1 existe
git log --oneline -3
# Deve aparecer: "feat: implement HL7 processing with FHIR transformation"

# 3. Verificar que os arquivos estão atualizados
cat src/webhooks/webhooks.service.ts | grep "processHl7"
# Deve mostrar a implementação completa (não apenas //todo)
```

---

## 📋 TAREFAS DA PARTE 2

### **Tarefa 1:** Implementar `processTiss()` - Processar XML TISS
### **Tarefa 2:** Implementar `processErp()` - Processar JSON ERP
### **Tarefa 3:** Atualizar Mock Lab
### **Tarefa 4:** Testar tudo
### **Tarefa 5:** Fazer commit

---

## 📝 TAREFA 1: IMPLEMENTAR processTiss()

### **Arquivo:** `src/webhooks/webhooks.service.ts`

### **Localização:** Linha ~85-88

### **SUBSTITUIR:**
```typescript
async processTiss(dto: InboundReceiveDto): Promise<any> {
  // TODO: Part 2 - Implement TISS processing
  throw new Error('TISS processing not implemented yet');
}
```

### **POR:**
```typescript
/**
 * Process TISS XML messages (simplified - no FHIR transformation)
 * Flow: TISS XML → MongoDB → Kafka
 */
async processTiss(dto: InboundReceiveDto): Promise<any> {
  try {
    // Create simplified TISS data object
    const tissData = {
      rawXml: dto.data,
      type: 'TISS',
      receivedAt: new Date().toISOString(),
    };

    const eventId = uuidv4();

    // Save log to MongoDB
    const log = await this.integrationLogRepository.create({
      eventId,
      type: 'TISS',
      direction: 'inbound',
      source: dto.source || 'external-insurance',
      payload: dto.data,
      status: 'success',
      kafkaTopic: KAFKA_TOPICS.INTEGRATION_EVENTS,
    });

    // Publish event to Kafka
    await this.kafkaService.publishEvent(
      KAFKA_TOPICS.INTEGRATION_EVENTS,
      {
        eventId: log.eventId,
        eventType: 'ExternalDataReceived',
        timestamp: new Date().toISOString(),
        source: 'integration-service',
        resourceType: 'TISS',
        data: tissData,
      },
    );

    return {
      success: true,
      eventId: log.eventId,
      data: tissData,
    };
  } catch (error) {
    // Log error to MongoDB
    const eventId = uuidv4();
    await this.integrationLogRepository.create({
      eventId,
      type: 'TISS',
      direction: 'inbound',
      source: dto.source || 'external-insurance',
      payload: dto.data,
      status: 'error',
      error: error.message,
      errorStack: error.stack,
    });
    throw error;
  }
}
```

**⚠️ IMPORTANTE:** Note que `processTiss()` segue o MESMO padrão do `processHl7()`, mas SEM a transformação FHIR (projeto acadêmico - simplificado).

---

## 📝 TAREFA 2: IMPLEMENTAR processErp()

### **Arquivo:** `src/webhooks/webhooks.service.ts`

### **Localização:** Linha ~90-93

### **SUBSTITUIR:**
```typescript
async processErp(dto: InboundReceiveDto): Promise<any> {
  // TODO: Part 2 - Implement ERP processing
  throw new Error('ERP processing not implemented yet');
}
```

### **POR:**
```typescript
/**
 * Process ERP JSON messages (simplified - no FHIR transformation)
 * Flow: ERP JSON → MongoDB → Kafka
 */
async processErp(dto: InboundReceiveDto): Promise<any> {
  try {
    // Parse JSON data
    const erpData = JSON.parse(dto.data);

    const eventId = uuidv4();

    // Save log to MongoDB
    const log = await this.integrationLogRepository.create({
      eventId,
      type: 'ERP',
      direction: 'inbound',
      source: dto.source || 'external-erp',
      payload: dto.data,
      status: 'success',
      kafkaTopic: KAFKA_TOPICS.INTEGRATION_EVENTS,
    });

    // Publish event to Kafka
    await this.kafkaService.publishEvent(
      KAFKA_TOPICS.INTEGRATION_EVENTS,
      {
        eventId: log.eventId,
        eventType: 'ExternalDataReceived',
        timestamp: new Date().toISOString(),
        source: 'integration-service',
        resourceType: 'ERP',
        data: erpData,
      },
    );

    return {
      success: true,
      eventId: log.eventId,
      data: erpData,
    };
  } catch (error) {
    // Log error to MongoDB
    const eventId = uuidv4();
    await this.integrationLogRepository.create({
      eventId,
      type: 'ERP',
      direction: 'inbound',
      source: dto.source || 'external-erp',
      payload: dto.data,
      status: 'error',
      error: error.message,
      errorStack: error.stack,
    });
    throw error;
  }
}
```

**📌 DIFERENÇA:** `processErp()` faz `JSON.parse(dto.data)` antes de salvar, enquanto `processTiss()` mantém o XML como string.

---

## 📝 TAREFA 3: ATUALIZAR MOCK LAB

### **Arquivo:** `mocks/mock-lab/index.js`

### **PROBLEMA ATUAL:**
- ❌ Mock Lab envia para endpoint ERRADO: `/webhooks/hl7` (não existe!)
- ❌ Mock Lab envia HL7 INCOMPLETO (falta campos)
- ❌ Mock Lab usa `Content-Type: text/plain` (errado!)

### **SOLUÇÃO: SUBSTITUIR TODO O ARQUIVO**

**Apague todo o conteúdo do arquivo `mocks/mock-lab/index.js` e cole:**

```javascript
const express = require('express');
const axios = require('axios');

const app = express();

app.get('/send', async (req, res) => {
  try {
    console.log('🧪 Enviando HL7 para Integration Service...');

    // Mensagem HL7 v2.5 ORU^R01 completa e válida
    const hl7Message =
`MSH|^~\\&|LAB|ExtLab|||${Date.now()}||ORU^R01|MSG${Date.now()}|P|2.5
PID|1||12345||Silva^João||19850315|M
OBR|1||ORD123||GLU^Glucose^LOINC|||${Date.now()}
OBX|1|NM|GLU^Glucose^LOINC|1|95|mg/dL|70-100|N|||F|||${Date.now()}`;

    // ✅ CORRIGIDO: Enviar para /webhooks/inbound com formato InboundReceiveDto
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
```

**📌 MUDANÇAS IMPORTANTES:**
1. **Endpoint:** `/webhooks/hl7` → `/webhooks/inbound` ✅
2. **Body:** Agora usa formato JSON com `{ data, source, contentType }` ✅
3. **HL7:** Mensagem completa com todos os segmentos (MSH, PID, OBR, OBX) ✅

---

## 🧪 TAREFA 4: TESTAR TUDO

### **Passo 1: Subir o ambiente**

```bash
# Certifique-se de estar na pasta do projeto
cd ~/integration-kafka-service  # No Linux PopOS

# Subir todos os containers
docker compose up -d

# Verificar que todos estão rodando
docker ps
# Deve mostrar: integration-service, kafka, zookeeper, mongodb, mock-lab
```

### **Passo 2: Aguardar serviços iniciarem (30-60 segundos)**

```bash
# Verificar logs do integration-service
docker logs integration-service --tail 50

# Deve mostrar algo como:
# "NestJS application successfully started"
# "Kafka connected successfully"
```

---

### **TESTE 1: HL7 (da Parte 1 - deve continuar funcionando)**

```bash
curl -X POST http://localhost:3010/webhooks/inbound \
  -H "Content-Type: application/json" \
  -d '{
    "data": "MSH|^~\\&|LAB|ExtLab|||20251109120000||ORU^R01|MSG123|P|2.5\nPID|1||12345||Silva^João||19850315|M\nOBR|1||ORD001||GLU^Glucose^LOINC|||20251109120000\nOBX|1|NM|GLU^Glucose^LOINC|1|95|mg/dL|70-100|N|||F|||20251109120000",
    "source": "test-lab",
    "contentType": "HL7"
  }'
```

**✅ Resultado esperado:**
```json
{
  "message": "Inbound received",
  "result": {
    "success": true,
    "eventId": "uuid-aqui",
    "fhirResource": {
      "resourceType": "Observation",
      "status": "final",
      ...
    }
  }
}
```

---

### **TESTE 2: TISS (novo - sua implementação)**

```bash
curl -X POST http://localhost:3010/webhooks/inbound \
  -H "Content-Type: application/json" \
  -d '{
    "data": "<?xml version=\"1.0\"?><GuiaTISS><numeroGuia>TISS-123456</numeroGuia><paciente>12345</paciente><procedimentos><procedimento codigo=\"10101012\" valor=\"150.00\"/></procedimentos><total>150.00</total></GuiaTISS>",
    "source": "test-insurance",
    "contentType": "TISS"
  }'
```

**✅ Resultado esperado:**
```json
{
  "message": "Inbound received",
  "result": {
    "success": true,
    "eventId": "uuid-aqui",
    "data": {
      "rawXml": "<?xml version=\"1.0\"?>...",
      "type": "TISS",
      "receivedAt": "2025-11-09T..."
    }
  }
}
```

---

### **TESTE 3: ERP (novo - sua implementação)**

```bash
curl -X POST http://localhost:3010/webhooks/inbound \
  -H "Content-Type: application/json" \
  -d '{
    "data": "{\"invoiceId\":\"INV-001\",\"patientId\":\"12345\",\"items\":[{\"description\":\"Consulta\",\"value\":200.00}],\"total\":200.00}",
    "source": "test-erp",
    "contentType": "ERP"
  }'
```

**✅ Resultado esperado:**
```json
{
  "message": "Inbound received",
  "result": {
    "success": true,
    "eventId": "uuid-aqui",
    "data": {
      "invoiceId": "INV-001",
      "patientId": "12345",
      "items": [...],
      "total": 200.00
    }
  }
}
```

---

### **TESTE 4: Mock Lab (atualizado)**

```bash
# Reconstruir o container do Mock Lab (para pegar as mudanças)
docker compose up -d --build mock-lab

# Aguardar 10 segundos
sleep 10

# Enviar HL7 via Mock Lab
curl http://localhost:4001/send
```

**✅ Resultado esperado:**
```json
{
  "success": true,
  "response": {
    "message": "Inbound received",
    "result": {
      "success": true,
      "eventId": "uuid-aqui",
      "fhirResource": {
        "resourceType": "Observation",
        ...
      }
    }
  }
}
```

---

### **TESTE 5: Verificar MongoDB (deve ter 3 tipos de logs)**

```bash
# Entrar no MongoDB
docker exec -it mongodb mongosh

# Dentro do mongosh:
use integration

# Ver todos os tipos de logs
db.integrationlogs.distinct("type")
# Resultado esperado: ["HL7", "TISS", "ERP"]

# Contar por tipo
db.integrationlogs.aggregate([
  { $group: { _id: "$type", count: { $sum: 1 } } }
])

# Resultado esperado:
# { "_id": "HL7", "count": 2 }
# { "_id": "TISS", "count": 1 }
# { "_id": "ERP", "count": 1 }

# Ver último log de cada tipo
db.integrationlogs.find({type: "HL7"}).sort({createdAt: -1}).limit(1).pretty()
db.integrationlogs.find({type: "TISS"}).sort({createdAt: -1}).limit(1).pretty()
db.integrationlogs.find({type: "ERP"}).sort({createdAt: -1}).limit(1).pretty()

# Sair do mongosh
exit
```

---

### **TESTE 6: Verificar Kafka (deve ter eventos dos 3 tipos)**

```bash
# Consumir mensagens do tópico integration.events
docker exec -it kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic integration.events \
  --from-beginning

# Pressionar Ctrl+C após ver várias mensagens
```

**✅ Resultado esperado:** Você deve ver mensagens JSON com:
- `"resourceType": "Observation"` (HL7)
- `"resourceType": "TISS"` (TISS)
- `"resourceType": "ERP"` (ERP)

---

## ✅ CHECKLIST DE VALIDAÇÃO

Antes de fazer o commit, certifique-se:

- [ ] `processTiss()` implementado em `webhooks.service.ts`
- [ ] `processErp()` implementado em `webhooks.service.ts`
- [ ] `mock-lab/index.js` atualizado com endpoint correto
- [ ] **TESTE 1 passou:** HL7 continua funcionando
- [ ] **TESTE 2 passou:** TISS processa e salva
- [ ] **TESTE 3 passou:** ERP processa e salva
- [ ] **TESTE 4 passou:** Mock Lab envia corretamente
- [ ] **TESTE 5 passou:** MongoDB tem 3 tipos de logs
- [ ] **TESTE 6 passou:** Kafka recebeu eventos dos 3 tipos

---

## 📝 TAREFA 5: FAZER COMMIT

### **Comandos Git:**

```bash
# 1. Verificar mudanças
git status
# Deve mostrar:
#   modified: src/webhooks/webhooks.service.ts
#   modified: mocks/mock-lab/index.js

# 2. Adicionar arquivos
git add src/webhooks/webhooks.service.ts
git add mocks/mock-lab/index.js

# 3. Fazer commit (copie exatamente essa mensagem)
git commit -m "feat: implement TISS and ERP processing + update Mock Lab

- Implement processTiss() for XML TISS data
  * Save to MongoDB with type 'TISS'
  * Publish to Kafka (integration.events)
  * Simplified approach (no FHIR transformation)
- Implement processErp() for JSON ERP data
  * Parse JSON before processing
  * Save to MongoDB with type 'ERP'
  * Publish to Kafka (integration.events)
- Update Mock Lab to send HL7 to correct endpoint
  * Fix endpoint: /webhooks/hl7 → /webhooks/inbound
  * Fix payload format to match InboundReceiveDto
  * Add complete HL7 message with all required segments
- Add error handling for both TISS and ERP processors

Related to: ROADMAP.md Steps 3-4-5

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 4. Push para o repositório
git push origin master
```

---

## 🎉 PROJETO 100% COMPLETO!

Após fazer o commit, o projeto estará **totalmente funcional** com:

✅ **Infraestrutura:** Kafka, MongoDB, Docker Compose
✅ **HL7 Processing:** Transformação HL7 → FHIR R4
✅ **TISS Processing:** Recebimento de XML de operadoras
✅ **ERP Processing:** Recebimento de JSON do ERP
✅ **Mock Lab:** Simulador de laboratório externo
✅ **Logging:** Auditoria completa no MongoDB
✅ **Event Publishing:** Distribuição via Kafka

---

## 🐛 TROUBLESHOOTING

### **Erro: "Cannot find module 'uuid'"**
```bash
npm install uuid
npm install --save-dev @types/uuid
```

### **Mock Lab não conecta ao Integration Service**
```bash
# Verificar que estão na mesma rede Docker
docker network ls
docker network inspect integration-kafka-service_hospital-network

# Reconstruir o Mock Lab
docker compose down mock-lab
docker compose up -d --build mock-lab
```

### **MongoDB não retorna dados**
```bash
# Verificar se MongoDB está rodando
docker logs mongodb --tail 50

# Limpar dados e testar novamente
docker exec -it mongodb mongosh
use integration
db.integrationlogs.deleteMany({})
exit
```

### **Kafka não recebe mensagens**
```bash
# Verificar se Kafka está rodando
docker logs kafka --tail 50

# Verificar tópicos existentes
docker exec -it kafka kafka-topics --bootstrap-server localhost:9092 --list
# Deve mostrar: integration.events
```

### **Integration Service não inicia**
```bash
# Ver logs
docker logs integration-service --tail 100

# Reconstruir
docker compose down integration-service
docker compose up -d --build integration-service
```

---

## 📊 COMPARAÇÃO: ANTES vs DEPOIS DA PARTE 2

| Aspecto | Antes (Parte 1) | Depois (Parte 2) |
|---------|-----------------|------------------|
| **Formatos suportados** | Apenas HL7 | HL7, TISS, ERP ✅ |
| **processTiss()** | Lança erro | Implementado ✅ |
| **processErp()** | Lança erro | Implementado ✅ |
| **Mock Lab** | Endpoint errado | Corrigido ✅ |
| **Logs MongoDB** | Só HL7 | 3 tipos ✅ |
| **Eventos Kafka** | Só HL7 | 3 tipos ✅ |
| **Status projeto** | 75% | 100% ✅ |

---

## 📚 RECURSOS ADICIONAIS

### **Documentação de referência:**
- FHIR R4: https://hl7.org/fhir/R4/
- HL7 v2.5: https://www.hl7.org/implement/standards/product_brief.cfm?product_id=185
- TISS: https://www.ans.gov.br/prestadores/tiss-troca-de-informacao-de-saude-suplementar
- Kafka: https://kafka.apache.org/documentation/

### **Arquivos importantes do projeto:**
- `src/kafka/kafka-topics.config.ts` - 10 tópicos Kafka definidos
- `src/transformers/hl7-to-fhir.transformer.ts` - Transformação HL7→FHIR
- `src/database/schemas/integration-log.schema.ts` - Schema MongoDB
- `ROADMAP.md` - Roadmap original do projeto
- `PARTE1_TESTE.md` - Testes da Parte 1

---

## 💡 DICAS IMPORTANTES

1. **Sempre teste antes de commitar** - Execute TODOS os 6 testes
2. **Leia as mensagens de erro** - Elas são descritivas e ajudam a debugar
3. **Use `docker logs <container>`** para ver o que está acontecendo
4. **MongoDB e Kafka são assíncronos** - Aguarde alguns segundos após enviar dados
5. **Se algo der errado, reconstrua:** `docker compose down && docker compose up -d --build`

---

**BOA SORTE NA IMPLEMENTAÇÃO! 🚀**

Se tiver dúvidas, consulte:
- O código da Parte 1 em `src/webhooks/webhooks.service.ts` (método `processHl7()`)
- O arquivo `PARTE1_TESTE.md` para entender o padrão
- Os logs do Docker para debugar

**Qualquer problema, documente no commit com `[WIP]` e peça ajuda ao colega da Parte 1!**
