# Godlights

Gerador de **god rays / light rays** em React + Vite + Tailwind + shadcn/ui, inspirado no MagicPattern, com mais controles e exportação para PNG, JPG e CSS.

## Stack

- **React 18** + **TypeScript** + **Vite 5**
- **Tailwind CSS** com tokens estilo shadcn (light/dark)
- **shadcn/ui** (Button, Slider, Label, Input, Tabs, Select, Popover, Card, Separator)
- **Radix UI** primitives
- **react-colorful** para color picker
- **lucide-react** para ícones
- Renderização nativa em **Canvas 2D** (sem dependências externas para o engine)

## Como rodar

```bash
cd rays-generator
npm install
npm run dev      # http://localhost:5173
```

Para gerar build de produção:

```bash
npm run build
npm run preview
```

## Funcionalidades

### Dimensões da imagem
- Largura e altura customizáveis (64–8000px).
- Presets: Square 1:1, Story 9:16, Post 4:5, HD/2K/4K 16:9, Wide 21:9, Banner.

### Raios
- **Quantidade** (1–200)
- **Largura base** (px na origem)
- **Divergência** — paralelos, abrem ou fecham para a ponta
- **Comprimento** (× diagonal do canvas)
- **Opacidade** e **Blend mode** (`source-over`, `lighter`, `screen`, `overlay`, `soft-light`, `hard-light`)

### Direção e origem
- **Direção** em estilo bússola (0° = cima, 90° = direita, etc.)
- **Spread** — abertura do leque (0° a 360°)
- **Origem X/Y** — posição da fonte de luz, configurável por slider ou **arrastando o ponto no preview**.

### Cores
- Cor inicial (origem) e cor final (ponta) com picker visual.
- Toggle "desvanecer para transparente" na ponta.

### Background
- Transparente, cor sólida, ou gradiente linear de duas cores com ângulo configurável.

### Halo
- Brilho radial na origem, controlado por intensidade e tamanho.

### Efeitos
- **Blur** gaussiano (0–80px)
- **Ruído / grão** (0–100)
- **Tamanho do grão** (1–6px)

### Aleatoriedade
- Slider de **variação** (jitter em largura, comprimento e ângulo de cada raio)
- **Seed** numérica para reproduzir o mesmo resultado
- Botão "Aleatório" para gerar nova seed

### Presets visuais
- Sunset, Forest light, Cyber, Soft mist, Stage, Neon burst.

### Exportação
- **PNG** com transparência (na resolução exata configurada)
- **JPG** (qualidade 95)
- **Copiar CSS** — gera `background-image: url(data:image/png;base64,…)` pronto para colar
- **Copiar JSON do preset** — exporta a configuração para reutilizar

## Estrutura

```
src/
├── App.tsx
├── main.tsx
├── index.css                    # tokens Tailwind/shadcn
├── lib/
│   ├── godrays.ts               # engine de renderização (Canvas 2D)
│   ├── presets.ts               # presets visuais
│   └── utils.ts                 # cn() helper
└── components/
    ├── GodRaysGenerator.tsx     # UI principal
    ├── ColorPicker.tsx          # picker hex em popover
    ├── ControlSection.tsx       # accordion + Field helper
    └── ui/                      # shadcn components
```

## Engine

Toda a lógica de desenho está em `src/lib/godrays.ts`. Pontos de extensão fáceis:

- Adicionar novos blend modes — basta acrescentar no tipo `BlendMode`.
- Adicionar novos efeitos pós-processamento — adicione uma função após o passo 5 em `drawGodRays`.
- Aumentar o limite do preview (atualmente capado em 1200px no maior eixo) — ajuste `PREVIEW_MAX_DIMENSION` em `GodRaysGenerator.tsx`.

A função pública `exportImage(config, mime, quality)` gera um Blob na resolução exata e independe da preview.
