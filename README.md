    resourceType: 'Observation',
    rawData: hl7Data,
  });

  return log.eventId;
}
# Integration Service - Projeto Acadêmico

Projeto da disciplina de Integração de Sistemas. Nosso serviço faz a ponte entre dados externos (HL7, XML TISS e JSON do ERP) e a fila interna em Kafka.

## O que vamos entregar
- Endpoint único `/webhooks/inbound` que identifica se o payload é HL7, TISS ou ERP.
- Processamento completo de HL7: converter para FHIR, salvar log no MongoDB e publicar no tópico `integration.events`.
- Processamento simplificado de TISS (guardar o XML e publicar o evento bruto) e de ERP (parse do JSON, log e publicação).
- Logs de integração centralizados com o `IntegrationLogRepository`.
- Kafka com 11 tópicos definidos, script `npm run topics:create` e serviço `kafka-init` no Compose para subir tudo sozinho.
- Mock Lab atualizando HL7 válido para poder testar o fluxo end-to-end.

## Como rodar
```bash
npm install
cp .env.example .env
docker compose up --build
```

- O serviço `kafka-init` roda automaticamente e cria todos os tópicos antes do Nest subir.
- A API fica em `http://localhost:3010`.
- O Mock Lab sobe em `http://localhost:4001/send`.

## Testes rápidos
- Listar tópicos:  
  `docker exec -it integration-service-infra-kafka-1 kafka-topics --bootstrap-server kafka:9092 --list`
- Consumir mensagens do grupo do serviço:  
  `docker exec -it integration-service-infra-kafka-1 kafka-console-consumer --bootstrap-server kafka:9092 --topic integration.events --group integration-service-group`
- Publicar um evento de teste:  
  `docker exec -it integration-service-infra-kafka-1 kafka-console-producer --bootstrap-server kafka:9092 --topic integration.events`

Se o mock responder e o consumer mostrar a mensagem, o fluxo completo está funcionando.

### 4. **Webhooks Controller** (src/webhooks/webhooks.controller.ts)
```typescript
@Post('hl7')
@HttpCode(HttpStatus.ACCEPTED)
async receiveHL7(@Body() data: string) {
  const eventId = await this.webhooksService.processHL7(data);
  return { message: 'HL7 received', eventId };
}
```

### 5. **Injetar Dependências**
```typescript
// webhooks.module.ts
@Module({
  imports: [KafkaModule, DatabaseModule], // ← Adicionar
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
```

### 6. **Criar Mocks TISS e ERP**
```bash
cp -r mocks/mock-lab mocks/mock-insurance
cp -r mocks/mock-lab mocks/mock-erp

# Edite index.js de cada um para:
# - mock-insurance: enviar TISS XML para /webhooks/tiss
# - mock-erp: enviar JSON para /webhooks/erp
```

## 🔧 Comandos Úteis

```bash
# Ver logs
docker-compose logs -f integration-service

# MongoDB
docker exec -it integration-service-infra-mongodb-1 mongosh
> use integration
> db.integrationlogs.find().pretty()

# Kafka
docker exec -it integration-service-infra-kafka-1 kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic lab.events \
  --from-beginning

# Rebuild
docker-compose down
docker-compose up --build
```

## 🎓 Conceitos Importantes

- **Event-Driven Architecture**: Comunicação assíncrona via Kafka
- **FHIR R4**: Padrão internacional para dados de saúde
- **Repository Pattern**: Abstração de acesso a dados
- **Dependency Injection**: Padrão do NestJS para inversão de controle
- **HL7 v2**: Formato legacy de integração hospitalar
- **TISS**: Padrão brasileiro de troca de informações na saúde suplementar

## 📖 Referências

- [NestJS Docs](https://docs.nestjs.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [KafkaJS Docs](https://kafka.js.org/)
- [FHIR R4 Spec](https://www.hl7.org/fhir/)
- [HL7 v2 Docs](https://www.hl7.org/implement/standards/product_brief.cfm?product_id=185)
