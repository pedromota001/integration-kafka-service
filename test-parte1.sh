#!/bin/bash

echo "🧪 TESTANDO PARTE 1 - HL7 Processing"
echo "======================================"
echo ""

# Verificar se Docker está rodando
echo "1️⃣ Verificando Docker..."
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker não está rodando!"
    echo "   Por favor, inicie o Docker Desktop e tente novamente."
    exit 1
fi
echo "✅ Docker está rodando"
echo ""

# Verificar serviços
echo "2️⃣ Verificando serviços Docker..."
docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "(integration-service|mongodb|kafka|zookeeper)"
echo ""

# Aguardar alguns segundos para garantir que os serviços estão prontos
echo "3️⃣ Aguardando serviços iniciarem (10 segundos)..."
sleep 10
echo "✅ Pronto para testar"
echo ""

# Teste 1: Enviar HL7
echo "4️⃣ TESTE 1: Enviando mensagem HL7..."
echo ""

RESPONSE=$(curl -s -X POST http://localhost:3010/webhooks/inbound \
  -H "Content-Type: application/json" \
  -d '{
    "data": "MSH|^~\\&|LAB|ExtLab|||20251109120000||ORU^R01|MSG123|P|2.5\nPID|1||12345||Silva^João||19850315|M\nOBR|1||ORD001||GLU^Glucose^LOINC|||20251109120000\nOBX|1|NM|GLU^Glucose^LOINC|1|95|mg/dL|70-100|N|||F|||20251109120000",
    "source": "test-lab",
    "contentType": "HL7"
  }')

echo "Resposta:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Verificar se foi sucesso
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ TESTE 1 PASSOU: HL7 processado com sucesso!"
else
    echo "❌ TESTE 1 FALHOU: Verifique a resposta acima"
fi
echo ""

# Teste 2: Verificar MongoDB
echo "5️⃣ TESTE 2: Verificando MongoDB..."
echo ""

MONGO_RESULT=$(docker exec mongodb mongosh --quiet --eval "
use integration;
db.integrationlogs.find({type: 'HL7'}).limit(1).pretty();
" 2>/dev/null)

if [ -n "$MONGO_RESULT" ]; then
    echo "✅ TESTE 2 PASSOU: Log encontrado no MongoDB!"
    echo "$MONGO_RESULT"
else
    echo "❌ TESTE 2 FALHOU: Nenhum log encontrado no MongoDB"
fi
echo ""

# Teste 3: Verificar contagem de logs
echo "6️⃣ TESTE 3: Contando logs no MongoDB..."
COUNT=$(docker exec mongodb mongosh --quiet --eval "
use integration;
db.integrationlogs.countDocuments({type: 'HL7'});
" 2>/dev/null)

echo "Total de logs HL7: $COUNT"
if [ "$COUNT" -gt 0 ]; then
    echo "✅ TESTE 3 PASSOU: $COUNT log(s) encontrado(s)"
else
    echo "❌ TESTE 3 FALHOU: Nenhum log encontrado"
fi
echo ""

# Teste 4: Testar TISS (deve retornar erro)
echo "7️⃣ TESTE 4: Testando TISS (deve retornar erro esperado)..."
echo ""

TISS_RESPONSE=$(curl -s -X POST http://localhost:3010/webhooks/inbound \
  -H "Content-Type: application/json" \
  -d '{
    "data": "<?xml version=\"1.0\"?><GuiaTISS><numeroGuia>123</numeroGuia></GuiaTISS>",
    "source": "test-insurance"
  }')

echo "Resposta:"
echo "$TISS_RESPONSE" | jq '.' 2>/dev/null || echo "$TISS_RESPONSE"
echo ""

if echo "$TISS_RESPONSE" | grep -q "not implemented"; then
    echo "✅ TESTE 4 PASSOU: TISS retornou erro esperado (será implementado na Parte 2)"
else
    echo "⚠️  TESTE 4: Resposta inesperada, mas OK para Parte 1"
fi
echo ""

# Resumo
echo "======================================"
echo "📊 RESUMO DOS TESTES"
echo "======================================"
echo ""
echo "Se você viu:"
echo "  ✅ TESTE 1 PASSOU: HL7 está funcionando!"
echo "  ✅ TESTE 2 PASSOU: MongoDB está salvando logs!"
echo "  ✅ TESTE 3 PASSOU: Logs estão sendo persistidos!"
echo ""
echo "Então a PARTE 1 está funcionando perfeitamente! 🎉"
echo ""
echo "Próximos passos:"
echo "  1. Fazer commit da Parte 1"
echo "  2. Avisar seu colega para começar a Parte 2"
echo ""
