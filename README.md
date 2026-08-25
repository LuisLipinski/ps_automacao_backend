# My Pet Admin — Automação

Suíte de qualidade do My Pet Admin baseada em Playwright. O repositório concentra testes de API dos microsserviços e será expandido para UI/E2E quando o novo frontend existir.

## Escopo atual

- `PS_Empresa`: smoke, segurança e regressão de cadastro, consulta, edição, paginação e sincronização de status.
- `PS_Contrato`: smoke e segurança não destrutivos.
- Integração `PS_Empresa <-> PS_Contrato`: lifecycle opt-in em ambiente efêmero/QA.
- Frontend: ainda não existe; a futura suíte UI deverá ficar separada dos testes de API.

## Estrutura

```text
tests/
  api/
    ps_empresa/
      clients/
      fixtures/
      helpers/
      regression/
      schemas/
      security/
      smoke/
    ps_contrato/
      clients/
      integration/
      security/
      smoke/
  shared/
```

Quando o frontend for reconstruído, a recomendação é adicionar:

```text
tests/
  ui/
    pages/
    fixtures/
    smoke/
    regression/
  e2e/
    onboarding/
    authentication/
```

A camada `api/` não deve depender do frontend. A camada `ui/` valida a interface isoladamente quando possível. A camada `e2e/` fica reservada aos fluxos realmente transversais.

## Segurança

Arquivos `.env` reais não podem ser versionados. Use `.env.example` somente como modelo e mantenha os valores reais em variáveis locais ou Secrets do CI.

Credenciais exigidas:

- `PS_EMPRESA_INTERNAL_KEY`
- `PS_CONTRATO_INTERNAL_KEY`

URLs:

- `PS_EMPRESA_URL`
- `PS_CONTRATO_URL`

A automação é fail-closed: clients autenticados lançam erro quando a chave interna não está configurada. Não existe fallback para endpoints públicos/legados.

> Credenciais que tenham sido versionadas anteriormente devem ser consideradas comprometidas e rotacionadas. Remover o arquivo da branch atual não remove o segredo do histórico Git.

## Ambiente local

```bash
cp .env.example .env
npm ci
```

Preencha o `.env` local com as chaves do ambiente de desenvolvimento. O arquivo é ignorado pelo Git.

Não é necessário instalar browsers para executar os testes atuais de API.

## Execução

Todos os testes:

```bash
npm test
```

PS_Empresa:

```bash
npm run empresa:smoke
npm run empresa:security
npm run empresa:regression
```

PS_Contrato:

```bash
npm run contrato:smoke
npm run contrato:security
```

Integração destrutiva controlada:

```bash
RUN_DESTRUCTIVE_INTEGRATION=true npm run contrato:integration
```

Esse lifecycle cria dados e deve ser executado apenas em banco efêmero ou ambiente de QA. O CI do `PS_Contrato` é o local preferencial porque sobe `PS_Empresa`, `PS_Contrato` e PostgreSQL do zero.

## Estratégia de CI

O workflow deste repositório possui dois níveis:

1. **automation-quality** — roda em PR/push, valida instalação, descoberta dos testes e impede `.env` versionado.
2. **live-api-smoke** — execução manual contra um ambiente remoto, usando Repository Variables para URLs e GitHub Secrets para credenciais.

O lifecycle entre microsserviços não roda automaticamente contra produção. Ele é exercitado em ambiente efêmero pelo CI dos serviços.

## Convenções

- `@smoke`: validações rápidas e essenciais.
- `@security`: autenticação, autorização e exposição indevida.
- `@integration`: fluxo que depende de mais de um microsserviço.
- testes devem criar dados únicos;
- cleanup deve ocorrer em `finally` quando o domínio permitir exclusão;
- contratos não são removidos apenas para facilitar testes; histórico de contrato é dado de domínio;
- erros de teste não devem imprimir secrets, tokens ou credenciais.

## Próxima evolução

Após `PS_Empresa` e `PS_Contrato` estabilizados, a suíte pode receber os novos `PS_User`, `PS_Login`, Gateway/Orchestrator e, por último, o frontend reconstruído. A estrutura atual permite isso sem misturar teste de API com teste de interface.
