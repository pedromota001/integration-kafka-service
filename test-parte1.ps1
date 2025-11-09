# TESTE PARTE 1 - HL7 Processing
Write-Host "🧪 TESTANDO PARTE 1 - HL7 Processing" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Docker está rodando
Write-Host "1️⃣ Verificando Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✅ Docker está rodando" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não está rodando!" -ForegroundColor Red
    Write-Host "   Por favor, inicie o Docker Desktop e tente novamente." -ForegroundColor Red
    exit 1
}
Write-Host ""

# Verificar serviços
Write-Host "2️⃣ Verificando serviços Docker..." -ForegroundColor Yellow
docker ps --format "table {{.Names}}\t{{.Status}}" | Select-String -Pattern "(integration-service|mongodb|kafka|zookeeper)"
Write-Host ""

# Aguardar
Write-Host "3️⃣ Aguardando serviços iniciarem (10 segundos)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
Write-Host "✅ Pronto para testar" -ForegroundColor Green
Write-Host ""

# Teste 1: Enviar HL7
Write-Host "4️⃣ TESTE 1: Enviando mensagem HL7..." -ForegroundColor Yellow
Write-Host ""

$body = @{
    data = "MSH|^~\&|LAB|ExtLab|||20251109120000||ORU^R01|MSG123|P|2.5`nPID|1||12345||Silva^João||19850315|M`nOBR|1||ORD001||GLU^Glucose^LOINC|||20251109120000`nOBX|1|NM|GLU^Glucose^LOINC|1|95|mg/dL|70-100|N|||F|||20251109120000"
    source = "test-lab"
    contentType = "HL7"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3010/webhooks/inbound" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body

    Write-Host "Resposta:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10
    Write-Host ""

    if ($response.result.success -eq $true) {
        Write-Host "✅ TESTE 1 PASSOU: HL7 processado com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "❌ TESTE 1 FALHOU: Verifique a resposta acima" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ TESTE 1 FALHOU: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Teste 2: Verificar MongoDB
Write-Host "5️⃣ TESTE 2: Verificando MongoDB..." -ForegroundColor Yellow
Write-Host ""

try {
    $mongoResult = docker exec mongodb mongosh --quiet --eval "use integration; db.integrationlogs.find({type: 'HL7'}).limit(1).pretty();" 2>$null

    if ($mongoResult) {
        Write-Host "✅ TESTE 2 PASSOU: Log encontrado no MongoDB!" -ForegroundColor Green
        Write-Host $mongoResult
    } else {
        Write-Host "❌ TESTE 2 FALHOU: Nenhum log encontrado no MongoDB" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ TESTE 2 FALHOU: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Teste 3: Contagem
Write-Host "6️⃣ TESTE 3: Contando logs no MongoDB..." -ForegroundColor Yellow

try {
    $count = docker exec mongodb mongosh --quiet --eval "use integration; db.integrationlogs.countDocuments({type: 'HL7'});" 2>$null

    Write-Host "Total de logs HL7: $count"

    if ([int]$count -gt 0) {
        Write-Host "✅ TESTE 3 PASSOU: $count log(s) encontrado(s)" -ForegroundColor Green
    } else {
        Write-Host "❌ TESTE 3 FALHOU: Nenhum log encontrado" -ForegroundColor Red
    }
} catch {
    Write-Host "⚠️  Não foi possível verificar contagem" -ForegroundColor Yellow
}
Write-Host ""

# Teste 4: TISS (deve retornar erro)
Write-Host "7️⃣ TESTE 4: Testando TISS (deve retornar erro esperado)..." -ForegroundColor Yellow
Write-Host ""

$tissBody = @{
    data = '<?xml version="1.0"?><GuiaTISS><numeroGuia>123</numeroGuia></GuiaTISS>'
    source = "test-insurance"
} | ConvertTo-Json

try {
    $tissResponse = Invoke-RestMethod -Uri "http://localhost:3010/webhooks/inbound" `
        -Method Post `
        -ContentType "application/json" `
        -Body $tissBody `
        -ErrorAction Stop
} catch {
    $errorMsg = $_.Exception.Message

    Write-Host "Resposta (erro esperado):" -ForegroundColor Cyan
    Write-Host $errorMsg
    Write-Host ""

    if ($errorMsg -match "not implemented") {
        Write-Host "✅ TESTE 4 PASSOU: TISS retornou erro esperado (será implementado na Parte 2)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  TESTE 4: Resposta inesperada, mas OK para Parte 1" -ForegroundColor Yellow
    }
}
Write-Host ""

# Resumo
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "📊 RESUMO DOS TESTES" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Se você viu:" -ForegroundColor White
Write-Host "  ✅ TESTE 1 PASSOU: HL7 está funcionando!" -ForegroundColor Green
Write-Host "  ✅ TESTE 2 PASSOU: MongoDB está salvando logs!" -ForegroundColor Green
Write-Host "  ✅ TESTE 3 PASSOU: Logs estão sendo persistidos!" -ForegroundColor Green
Write-Host ""
Write-Host "Então a PARTE 1 está funcionando perfeitamente! 🎉" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "  1. Fazer commit da Parte 1" -ForegroundColor White
Write-Host "  2. Avisar seu colega para começar a Parte 2" -ForegroundColor White
Write-Host ""
