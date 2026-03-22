# Global Project Rules - Reham Website (Luxury Fashion E-commerce)

Welcome to the **Reham Website** project. This is a premium luxury fashion e-commerce platform built with **React**, **Next.js**, and **TailwindCSS**. To maintain the highest quality standards, visual excellence, and code consistency, all contributors MUST follow these global rules.

---

## 🎨 1. Design & Aesthetics (Premium Luxury)
The brand identity is **Minimalist Luxury**, **High-Contrast**, and **Premium**.

- **Color Palette**: 
  - Primary Background: `#000000` (Dark Mode preferred) / `#FFFFFF` (Light Mode).
  - Accents: Use the brand neutrals defined in `globals.css` (Brand 100-900).
  - Avoid generic colors. Use sophisticated HSL-based scales.
- **Typography**: 
  - Use **Inter** or high-quality serif fonts for headings.
  - Heading hierarchy must be strict (`h1` per page).
- **Visual Effects**:
  - Implement **Glassmorphism** for overlays and navigation.
  - Use **Gradients** sparingly and subtly.
  - All interactive elements must have smooth hover transitions.
- **Animations**:
  - Use **Framer Motion** for page transitions and micro-interactions.
  - Animations should feel "organic" and "weighted," not bouncy or cheesy.

## 💻 2. Technical Stack & Architecture
- **Framework**: Next.js 16+ (App Router).
- **Styling**: TailwindCSS 4+ (@tailwindcss/postcss).
- **State Management**: Zustand (for light, fast state).
- **Icons**: Lucide React.
- **Components**: 
  - Functional components with TypeScript.
  - Keep components modular and reusable in `src/components`.
  - Prefer Lucide-React for all icons.

## 🛠️ 3. Development Guidelines
- **Clean Code**: 
  - Use `clsx` and `tailwind-merge` for dynamic class management.
  - No hardcoded strings for shared values; use constants.
- **Performance**:
  - Optimize images using `next/image`.
  - Minimize client-side logic to improve LCP.
- **SEO**:
  - Every page must have metadata (Title, Description).
  - Use Semantic HTML (`<main>`, `<section>`, `<article>`, `<nav>`, `<footer>`).
- **File Naming**:
  - Components: PascalCase (e.g., `ProductCard.tsx`).
  - Utilities/Hooks: camelCase (e.g., `useCart.ts`).

## 🛍️ 4. E-commerce Specifics
- **Product Gallery**: Must support high-resolution zooming and smooth variant switching.
- **Cart/Checkout**: Security and speed are paramount. Minimize steps in the checkout flow.
- **Responsiveness**: Mobile-first approach. Luxury shopping happens on high-end mobile devices.

---

> [!IMPORTANT]
> **Visual WOW Factor**: If a component looks "standard" or "basic," it is not ready. Re-evaluate using shadows, glassmorphism, or modern spacing.

> [!TIP]
> Use the `.gemini` directory for agent-specific instructions, but keep global project rules in this `global-rules.md` at the root.
