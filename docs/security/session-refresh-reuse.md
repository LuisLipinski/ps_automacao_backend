# Refresh token reuse — regressão de segurança

Este bloco valida o comportamento já implementado no PS_Login para rotação de refresh token e revogação da família.

## Regras cobertas

- cada refresh bem-sucedido emite um novo refresh token;
- o refresh token anterior passa a ser considerado usado;
- reutilizar um refresh token já usado deve ser rejeitado;
- ao detectar reuse, toda a família de refresh tokens é revogada;
- o token de substituição emitido antes da detecção também deve deixar de ser utilizável;
- logout de refresh token desconhecido permanece idempotente e retorna sucesso sem revelar estado interno.

## Ambiente

Os cenários autenticados usam `QA_LOGIN_EMAIL` e `QA_LOGIN_PASSWORD` via ambiente/Secrets. Nenhuma credencial real deve ser versionada.
