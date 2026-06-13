**Prerequisites:**  Node.js
1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

   Root Directory (Configuration & Infrastructure)
package.json
Purpose: Manages your project dependencies (React, Tailwind CSS, Lucide icons, Framer Motion, Firebase SDK) and defines system commands for development (npm run dev), build compilation (npm run build), and code checking (npm run lint).
tsconfig.json
Purpose: Instructs the TypeScript compiler on how to transpile raw TypeScript types down to standard JavaScript compatible with most browsers.
vite.config.ts
Purpose: Configures the Vite development runner and build pipeline, including routing and compiling all elements onto a single-page asset.
index.html
Purpose: The main HTML template. It serves as the single anchor page of your application where the Vite-compiled React program mounts.
metadata.json
Purpose: Holds system-specific config fields, description meta elements, and custom app credentials used by the hosting environment when rendering previews.
firebase-applet-config.json
Purpose: Holds secure Firebase project authorization keys (Database URL, App ID, Messaging ID) mapped to your database.
firebase-blueprint.json
Purpose: A blueprint mapping rules and initial database collection definitions for persistence.
firestore.rules
Purpose: Standard Firestore security rules that dictate backend permission levels (restricting read/write behavior to authorize customers and admins safely).
📂 /src Directory (Core Logic & Routing)
src/main.tsx
Purpose: The entry point of the React application. It binds the React virtual DOM directly to the #root element in index.html.
src/App.tsx
Purpose: The main application shell. Orchestrates overall screen layout, manages global state (including the dynamic basket synchronizer, category filters, and active tab toggles), and binds live Firestore updates using real-time listeners.
src/firebase.ts
Purpose: Initializes your Connection to Firebase Firestore and exports custom error handlers specifically styled to notify the user of transaction state limits.
src/types.ts
Purpose: Houses all shared TypeScript typing definitions, standardizing strict structures for items like MenuItem, CartItem, Order, and customizable RestaurantSettings.
src/initialMenu.ts
Purpose: Contains the initial database seed collection of standard local dishes (Tiffins, Curries, Special Combos) to cleanly hydrate the food list on newly initialized databases.
src/index.css
Purpose: The root styling sheet. Configures Tailwind V4 directives and imports Google Fonts (Inter and Space Grotesk) to power modern typography and interfaces.
📂 /src/components/* Directory (Modular UI Components)
src/components/GlassHero.tsx
Purpose: Controls the glassmorphic head banner of the website, displaying the restaurant's metadata, delivery availability toggle, phone details, and smooth loading animations.
src/components/MenuItemCard.tsx
Purpose: Designs the modular food card element. Dynamically displays dietary badges, prices, and toggles customizable controls like additive additions, inventory status, and custom quantity controllers.
src/components/CartDrawer.tsx
Purpose: A collapsible slider modal hosting the shopping basket workspace. It summarizes order calculations, gathers customer info (name, address, delivery hotline), and issues precise WhatsApp API dispatch requests.
src/components/AdminPortal.tsx
Purpose: Holds the secure Store Manager dashboard workspace. Built with access locks, it lets the restaurant owner manage menus (add dishes, edit pricing, toggle sold-out status), view live customer orders, update contact details, and wipe logs cleanly on close.
