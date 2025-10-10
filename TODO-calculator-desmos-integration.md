# TODO: Calculator & Desmos Integration

## Overview
Add computational capabilities to notebook blocks, including a Desmos-style calculator for mathematical computations, graphing, and interactive visualizations.

## Tasks

### 1. Research & Planning
- [ ] Research Desmos API options:
  - Desmos API for embedding calculator
  - Desmos Graphing Calculator API
  - Alternative: MathJS for calculations
  - Alternative: KaTeX for rendering
- [ ] Review Desmos API documentation and licensing
- [ ] Determine which features to support:
  - Basic arithmetic
  - Algebra/equations
  - Graphing functions
  - Statistics
  - Geometry
  - 3D graphing
- [ ] Plan integration approach (embed vs custom implementation)

### 2. Desmos API Integration
- [ ] Install Desmos API package/CDN
- [ ] Create Desmos calculator component
- [ ] Set up calculator initialization:
  ```typescript
  const calculator = Desmos.GraphingCalculator(element, {
    keypad: true,
    expressions: true,
    settingsMenu: true,
    // ... other options
  });
  ```
- [ ] Configure calculator permissions and features
- [ ] Style calculator to match notebook theme

### 3. Calculator Block Type
- [ ] Create new block type: "calculator" or "computation"
- [ ] Design calculator block UI:
  - Input area for expressions
  - Output/result display
  - Graph visualization area
  - Variables panel
- [ ] Implement block rendering for calculator type
- [ ] Add calculator to block type selector/menu

### 4. Expression & Calculation Features
- [ ] Support basic arithmetic operations
- [ ] Support variables and assignments (x = 5)
- [ ] Support functions (f(x) = x^2)
- [ ] Support equations (solve, simplify)
- [ ] Support units and unit conversion
- [ ] Display step-by-step solutions (if possible)
- [ ] Show calculation history within block

### 5. Graphing Features
- [ ] Plot 2D functions (y = f(x))
- [ ] Plot parametric equations
- [ ] Plot polar coordinates
- [ ] Support multiple graphs in same view
- [ ] Interactive graph features:
  - Zoom and pan
  - Trace points
  - Find intersections
  - Calculate derivatives/integrals visually
- [ ] Customize graph appearance:
  - Colors
  - Line styles
  - Grid settings
  - Axis labels

### 6. Advanced Calculator Features
- [ ] Support matrices and linear algebra
- [ ] Statistical calculations (mean, median, regression)
- [ ] Trigonometric functions
- [ ] Logarithmic and exponential functions
- [ ] Complex numbers
- [ ] Calculus (derivatives, integrals, limits)
- [ ] Symbolic computation (if supported)

### 7. Calculator State Management
- [ ] Save calculator state in block data:
  ```typescript
  {
    type: 'calculator',
    expressions: [...],
    graphState: {...},
    variables: {...},
    settings: {...}
  }
  ```
- [ ] Restore calculator state when loading notebook
- [ ] Handle calculator state in block duplication
- [ ] Implement undo/redo for calculator operations

### 8. Inter-Block Computation
- [ ] Create system for referencing values from other blocks
- [ ] Implement block-to-block variable passing:
  - Reference syntax: `@block-id.variable`
  - Example: `x = @calc1.result * 2`
- [ ] Update dependent blocks when source changes
- [ ] Create dependency graph visualization
- [ ] Handle circular dependencies
- [ ] Add execution order controls

### 9. Alternative: Custom Calculator Implementation
If not using Desmos:
- [ ] Integrate MathJS for computations
- [ ] Integrate Plotly.js or Recharts for graphing
- [ ] Create custom expression parser
- [ ] Build custom graphing interface
- [ ] Implement interactive graph controls
- [ ] Add LaTeX rendering with KaTeX or MathJax

### 10. UI/UX Enhancements
- [ ] Add calculator toolbar:
  - Common functions (sin, cos, log, etc.)
  - Special symbols (π, √, ∫, etc.)
  - Graph controls
- [ ] Keyboard shortcuts for calculator operations
- [ ] Auto-complete for functions and variables
- [ ] Syntax highlighting for expressions
- [ ] Error messages for invalid expressions
- [ ] Responsive design for calculator blocks

### 11. Export & Sharing
- [ ] Export graph as image (PNG/SVG)
- [ ] Export calculations as text/LaTeX
- [ ] Share calculator state via URL
- [ ] Copy expression/result to clipboard
- [ ] Export to Desmos website (open in Desmos)

### 12. Performance Optimization
- [ ] Lazy load Desmos API (only when calculator block used)
- [ ] Debounce graph updates during rapid input
- [ ] Limit number of calculator blocks per notebook
- [ ] Optimize re-renders of calculator components
- [ ] Memory management for large datasets/graphs

### 13. Testing
- [ ] Test basic arithmetic operations
- [ ] Test function graphing
- [ ] Test variable assignments and references
- [ ] Test calculator state persistence
- [ ] Test performance with complex expressions
- [ ] Test mobile/touch interactions
- [ ] Test accessibility with keyboard navigation

### 14. Documentation
- [ ] Create user guide for calculator features
- [ ] Document supported functions and syntax
- [ ] Provide example calculations and graphs
- [ ] Add tooltips and help text in UI
- [ ] Create video tutorials

## Technical Considerations
- Desmos API pricing/licensing (free tier limits?)
- Bundle size impact of calculator libraries
- Browser compatibility
- Mobile touch support for graphing
- Accessibility for screen readers
- Security: sanitize mathematical expressions
- Rate limiting for complex calculations

## Future Enhancements
- 3D graphing support
- Animation and sliders for parameters
- Collaborative real-time calculations
- AI-assisted problem solving
- Integration with symbolic math engines (SymPy, WolframAlpha API)
- Unit testing framework
- Geometry tools (compass, protractor, etc.)
- Chemistry equation balancing
- Physics simulations
- Custom function libraries by subject
