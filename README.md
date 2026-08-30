# My Pet Admin — Automação

Suíte de qualidade do My Pet Admin baseada em Playwright. O repositório concentra testes de API dos microsserviços e será expandido para UI/E2E quando o novo frontend existir.

## Escopo atual

- `PS_Empresa`: smoke, segurança e regressão de cadastro, consulta, edição, paginação e sincronização de status.
- `PS_Contrato`: smoke, segurança e integração controlada com empresa.
- `PS_User`: smoke e segurança dos endpoints internos.
- `PS_Login`: smoke, validação de contrato público e segurança básica.
- `PS_Orchestrator`: smoke e segurança do onboarding interno.
- `PS_Gateway`: smoke, segurança da borda e integração autenticada `PS_Login -> PS_Gateway -> PS_Contrato`.
- Frontend: ainda não existe; a futura suíte UI deverá ficar separada dos testes de API.

## Estratégia

A suíte possui três camadas principais:

- `@smoke`: disponibilidade e contratos essenciais.
- `@security`: autenticação, autorização, headers confiáveis e exposição indevida.
- `@integration`: fluxos entre microsserviços.

Testes que exigem dados mutáveis ou credenciais reais de QA devem ser executados apenas em ambiente efêmero/QA. Segredos nunca devem ser versionados.

## Execução

```bash
npm ci
npm test
```

Comandos principais:

```bash
npm run backend:smoke
npm run backend:security
npm run backend:integration
npm run empresa
npm run contrato
npm run user
npm run login
npm run orchestrator
npm run gateway
```

## Fluxo autenticado Gateway

A integração `PS_Login -> PS_Gateway -> PS_Contrato` usa:

- `PS_LOGIN_URL`
- `PS_GATEWAY_URL`
- `QA_LOGIN_EMAIL`
- `QA_LOGIN_PASSWORD`

O teste valida que o JWT possui contexto de tenant, que o Gateway aceita o token e que headers internos enviados pelo cliente não conseguem alterar o tenant confiável derivado do JWT.

## Segurança

Arquivos `.env` reais não podem ser versionados. Use `.env.example` somente como modelo e mantenha valores reais em variáveis locais, ambiente de QA ou GitHub Secrets.

A automação deve continuar fail-closed: ausência de segredo necessário não pode provocar fallback para rotas menos seguras.

## Próxima evolução

A partir desta base, os próximos blocos são:

1. regras completas de autorização de usuários MASTER/ADMIN/perfis operacionais;
2. lifecycle autenticado completo de usuário;
3. refresh token, troca e recuperação de senha;
4. onboarding cross-service em ambiente efêmero;
5. isolamento tenant com duas empresas distintas;
6. contratos com filtros, paginação e regressão tenant-aware;
7. testes UI e E2E quando o frontend for reconstruído.
