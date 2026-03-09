A high-performance recipe website built for web to master advanced JavaScript concepts. Users can search for thousands of recipes, adjust servings, save favorites, and manage a persistent shopping list.

  Key Technical Pillars:
   * Architectural Pattern (MVC + Pub/Sub): Designed with a robust Model-View-Controller structure. I implemented the Publisher/Subscriber design pattern to handle events, ensuring
     that the Model remains completely isolated from the View for a clean, professional codebase.
   * API Efficiency & Caching: To ensure a "snappy" user experience, the application implements state-based caching. Search results are cached in memory to allow for instantaneous
     pagination and filtering, while user-uploaded recipes and bookmarks are cached via localStorage to bypass unnecessary network requests and reduce API overhead.
   * Advanced Asynchronous JS: Orchestrated complex data flows using async/await and the Fetch API, handling real-time search results and ingredient updates without UI blocking.
   * Persistent Data Layer: Utilized localStorage to ensure user bookmarks and shopping list data persist across sessions, creating a "production-ready" user experience.
   * Surgical SASS & Modern Tooling: Leveraged Parcel for asset bundling and CI/CD deployment via Netlify, managing a professional CSS architecture with SASS.

  Advanced AI Engineering (Gemini CLI & Maestro):
  This project served as a playground for cutting-edge AI-assisted development. I explored the boundaries of prompt engineering by:
   * Maestro & Conductor Integration: I utilized the Maestro orchestrator and Conductor tracks to manage complex implementation phases, practicing how to break down large features
     into manageable "AI-ready" tasks.
   * High-Fidelity Prompting: I focused on providing surgical context to the AI, moving beyond simple "code generation" to collaborative architectural reasoning.
   * System Mapping: Used AI to perform root-cause analysis on asynchronous race conditions and to audit the integrity of the Publisher/Subscriber event handlers.
