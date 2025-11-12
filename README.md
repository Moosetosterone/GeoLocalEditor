gantt
    dateFormat  YYYY-MM-DD
    title GeoLocalEditor Refactor Plan (SOLID + DRY Alignment)
    excludes weekends

    section 🟩 Sprint 1 – SRP: Modular Hooks & Separation of Concerns
    Extract useGeoData() Hook               :a1, 2025-11-17, 2d
    Move localStorage to useGeoData         :a2, after a1, 1d
    Refactor Editor to use new hook         :a3, after a2, 1d
    Split MapCanvas into custom hooks       :a4, after a3, 2d
    Unit tests for useGeoData()             :a5, after a4, 1d
    Milestone: Sprint 1 Complete            :milestone, a6, after a5, 0d

    section 🟦 Sprint 2 – OCP: Extensible Geometry, Tools, and Formats
    Create geometryRenderers registry       :b1, 2025-12-01, 1d
    Replace import/export logic w/ handlers :b2, after b1, 1d
    Centralize tool definitions (TOOL_DEFS) :b3, after b2, 0.5d
    Add test for MultiPolygon renderer      :b4, after b3, 1d
    Milestone: Sprint 2 Complete            :milestone, b5, after b4, 0d

    section 🟨 Sprint 3 – DIP & ISP: Dependency Injection + Abstractions
    Inject IStorage into backend routes     :c1, 2025-12-08, 1d
    Add env-based storage selection         :c2, after c1, 1d
    Implement client storageService module  :c3, after c2, 1d
    Replace direct localStorage in Editor   :c4, after c3, 0.5d
    Optional LeafletAdapter abstraction     :c5, after c4, 1d
    Milestone: Sprint 3 Complete            :milestone, c6, after c5, 0d

    section 🟧 Sprint 4 – DRY: Utility Extraction & Constants Unification
    Create getAllPropertyKeys() utility     :d1, 2025-12-15, 0.5d
    Refactor FeatureTable & CSV utilities   :d2, after d1, 0.5d
    Consolidate updateGeoData logic         :d3, after d2, 1d
    Define shared constants (colors, keys)  :d4, after d3, 0.5d
    Cleanup duplicate literals              :d5, after d4, 0.5d
    Milestone: Sprint 4 Complete            :milestone, d6, after d5, 0d

    section 🚀 Project Wrap-Up
    Final QA + Test Coverage Audit          :e1, 2025-12-22, 2d
    Documentation + Architecture Update     :e2, after e1, 2d
    Release Refactored Version (v1.1.0)     :milestone, e3, after e2, 0d
