# UseFrete V2 — Matching

Protótipo demonstrável da nova tese da UseFrete: a plataforma recebe uma demanda estruturada e encontra transportadores compatíveis por rota, veículo, capacidade, horário e disponibilidade.

## Rodar localmente

Requisitos: Node.js 20+ e pnpm.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Abra `http://localhost:3000`.

Para validar a versão de produção:

```bash
pnpm exec tsc --noEmit
pnpm build
pnpm start
```

## Roteiro da demo principal

1. Clique em **Preciso de transporte**.
2. Avance pelos dados pré-preenchidos de rota e carga.
3. Confirme a recomendação de veículo.
4. Aguarde o matching simulado.
5. Selecione um dos três transportadores compatíveis.
6. Confirme e avance pela timeline de acompanhamento.

O fluxo **Sou transportador** demonstra disponibilidade, retorno vazio, oportunidades compatíveis e envio de interesse.

## Escopo do protótipo

Os transportadores, valores, rotas, disponibilidade, matching e transições são mocks locais organizados em `lib/usefrete-data.ts`. Não há autenticação, backend, pagamento, GPS ou roteamento em produção. O mapa preserva o componente Leaflet da V1, mas usa uma base visual local para que a demonstração não dependa de tiles externos.
