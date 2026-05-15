# Godlights

**Crie cenas animadas de feixes de luz em React. Exporte como PNG, CSS ou componente.**

[![Demo](https://img.shields.io/badge/Demo-godlights.vercel.app-black?style=flat-square)](https://www.godlights.io)
[![npm](https://img.shields.io/npm/v/godlights?style=flat-square&color=black)](https://www.npmjs.com/package/godlights)
[![Licença: MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-black?style=flat-square)](./packages/godlights/README.md)

![Editor Godlights](https://www.godlights.io/app.gif)

---

## Pacote npm

O motor de renderização está disponível como um pacote React independente, sem dependências além do próprio React.

```bash
npm install godlights
```

```tsx
import { GodLights } from "godlights";
import type { SceneConfig } from "godlights";

// Preset "Corner haze" — primeiro preset do editor
const scene: SceneConfig = {
  width: 1920,
  height: 1080,
  noise: 8,
  grainSize: 1,
  layers: [
    {
      type: "background",
      bgType: "solid",
      bgColor: "#000000",
      bgColor2: "#000000",
      bgGradientAngle: 180,
    },
    {
      type: "rays",
      direction: 158,
      spread: 70,
      originX: 12,
      originY: -25,
      rayCount: 28,
      rayWidth: 90,
      divergence: 1.5,
      rayLength: 0.6,
      colorStart: "#ffffff",
      colorEnd: "#ffffff",
      opacity: 0.24,
      blendMode: "screen",
      fadeToTransparent: true,
      blur: 17.5,
      randomnessWidth: 100,
      randomnessLength: 24,
      randomnessAngle: 0,
      seed: 554433,
    },
    {
      type: "halo",
      originX: 16,
      originY: 2,
      color: "#ffffff",
      intensity: 0.16,
      size: 0.47,
      blendMode: "lighter",
    },
  ],
};

export default function App() {
  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <GodLights
        scene={scene}
        animParams={{ speed: 3, angleAmp: 40, lengthAmp: 30, widthAmp: 20, haloAmp: 50 }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
    </div>
  );
}
```

→ [Documentação completa do pacote](./packages/godlights/README.md) · [Docs interativa](https://www.godlights.io/docs)

---

## Funcionalidades do editor

- **Cenas em múltiplas camadas** — empilhe raios, halos e fundos em qualquer ordem
- **Preview ao vivo** — canvas animado com pan & zoom
- **14+ presets** — pesquisáveis e filtráveis por estilo
- **Exportação** — PNG, JPG, CSS `background-image`, JSON, componente JSX
- **Compartilhar** — codifica a cena completa em uma URL (`/editor?scene=...`)
- **Slots de salvamento** — persiste cenas no localStorage
- **Modo claro / escuro**

---

## Uso com IA / LLMs

O Godlights inclui documentação em formato de texto simples, otimizada para consumo por modelos de linguagem:

| Arquivo | Conteúdo |
|---------|----------|
| [`/llms.txt`](https://www.godlights.io/llms.txt) | Quick start, erros comuns, restrições importantes |
| [`/llms-full.txt`](https://www.godlights.io/llms-full.txt) | Referência completa da API, todos os tipos com intervalos, exemplos |

Se você estiver usando um assistente de IA (Cursor, Copilot, Claude, etc.) para gerar cenas, aponte-o para um desses arquivos para obter resultados precisos. Os erros mais comuns estão documentados lá: `BackgroundLayer` ausente, blend mode errado em fundos claros e uso de `opacityAmp` (que não existe).

---

## Estrutura do monorepo

```
/
├── src/                        # App do editor (React + Vite + Tailwind + shadcn/ui)
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── PresetsPage.tsx
│   │   ├── DocsPage.tsx
│   │   └── PreviewPage.tsx
│   ├── components/
│   │   ├── GodRaysGenerator.tsx  # UI principal do editor
│   │   └── ui/                   # componentes shadcn
│   └── lib/
│       ├── presets.ts
│       ├── share.ts              # codificação/decodificação de URL
│       └── utils.ts
├── packages/
│   └── godlights/              # pacote npm
│       ├── src/
│       │   ├── GodLights.tsx   # componente React
│       │   ├── godrays.ts      # motor de renderização Canvas 2D
│       │   └── index.ts
│       └── package.json
├── public/
│   ├── llms.txt                # quick start para IAs
│   └── llms-full.txt           # referência completa da API para LLMs
└── index.html
```

---

## Rodando localmente

```bash
npm install
npm run dev        # app do editor → http://localhost:5173
npm run build      # build de produção
npm run build:pkg  # build do pacote npm godlights
```

---

## Stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** + **shadcn/ui** + **Radix UI**
- **Motor Canvas 2D** (sem dependências em runtime no pacote)
- **lucide-react** ícones · **react-colorful** seletor de cores
