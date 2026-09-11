# CatalogoPro — SaaS para gestión de comercios

Aplicación React + Vite + Tailwind CSS v4 con contexto multi-tenant, catálogo de productos, inventario, punto de venta, WhatsApp, tienda pública, arquitectura técnica y suite de tests.

## Comandos

- `pnpm run dev` — desarrollo
- `pnpm run build` — producción
- `pnpm run format` — formato con oxfmt

## Estructura

- `src/App.tsx` — shell con sidebar, header, navegación por rol y módulos
- `src/context/AppContext.tsx` — estado global (tenants, productos, ventas, movimientos, plantillas)
- `src/components/` — módulos de negocio
- `src/mockData.ts` — datos de ejemplo (2 tiendas, 12 productos, 8 ventas)
- `.figma/make/` — configuración Figma Make

## Correcciones aplicadas (última actualización)

- Limpieza de importaciones no usadas (`import React` redundante) en App.tsx y main.tsx
- Corrección de navegación por rol con `useEffect`: si el rol cambia a uno que no puede ver el módulo actual, se redirige al primer módulo visible
- Reemplazo de tipo `React.ReactElement` por `JSX.Element`
- Creación de `README.md` y estructura de tests en `tests/app-context.test.ts`
- Configuración de `base` de despliegue documentada para GitHub Pages
