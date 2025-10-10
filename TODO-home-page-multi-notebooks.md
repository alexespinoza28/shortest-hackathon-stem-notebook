# TODO: Home Page & Multi-Notebook Support

## Overview
Create a home page where users can manage multiple notebooks/pages, each dedicated to a different subject or topic.

## Tasks

### 1. Design Home Page UI
- [ ] Create a landing/home page layout
- [ ] Design notebook card/tile components showing:
  - Notebook title
  - Subject/category
  - Last modified date
  - Preview/thumbnail of content
  - Color coding or icons for different subjects
- [ ] Add a "Create New Notebook" button/card
- [ ] Include search/filter functionality for finding notebooks
- [ ] Add sorting options (by date, name, subject)

### 2. Notebook Creation Flow
- [ ] Create modal/dialog for new notebook creation
- [ ] Form fields needed:
  - Notebook name/title (required)
  - Subject/category (dropdown or free text)
  - Description (optional)
  - Color theme selection (optional)
- [ ] Generate unique ID for each notebook
- [ ] Set creation timestamp and metadata

### 3. Notebook Management
- [ ] Implement "Open" functionality to navigate to specific notebook
- [ ] Add "Rename" notebook option
- [ ] Add "Delete" notebook with confirmation dialog
- [ ] Add "Duplicate" notebook feature
- [ ] Implement drag-and-drop for reordering notebooks

### 4. Navigation Updates
- [ ] Add "Home" button/link in notebook view to return to home page
- [ ] Implement breadcrumb navigation (Home > Notebook Name)
- [ ] Update URL routing to support:
  - `/` - Home page
  - `/notebook/:id` - Individual notebook view
- [ ] Handle browser back/forward navigation properly

### 5. Data Structure Updates
- [ ] Update data model to support multiple notebooks:
  \`\`\`
  {
    notebooks: [
      {
        id: string,
        title: string,
        subject: string,
        description: string,
        createdAt: timestamp,
        updatedAt: timestamp,
        colorTheme: string,
        blocks: [...existing block structure...]
      }
    ]
  }
  \`\`\`

### 6. State Management
- [ ] Update context/state to track:
  - List of all notebooks
  - Currently active notebook
  - Home page view state
- [ ] Implement notebook switching logic
- [ ] Clear/reset state when switching between notebooks

### 7. UI/UX Enhancements
- [ ] Add empty state for when user has no notebooks
- [ ] Show recent notebooks section
- [ ] Add notebook templates (Math, Physics, Chemistry, etc.)
- [ ] Implement keyboard shortcuts for quick navigation
- [ ] Add notebook statistics (number of blocks, last edited, etc.)

### 8. NVIDIA Branding & Theme
- [ ] Update "AI Assistant" label in top right to "Nemotron Assistant"
- [ ] Add NVIDIA logo next to "Nemotron Assistant" in top right
- [ ] Implement NVIDIA-themed color scheme (black and green):
  - Primary: NVIDIA green (#76B900)
  - Background: Dark/black tones
  - Accent colors: Green variants
  - Update all UI components to use NVIDIA theme
- [ ] Apply NVIDIA theme to:
  - Notebook backgrounds
  - Block components
  - Buttons and interactive elements
  - Toolbar and navigation
  - Text and typography colors
- [ ] Ensure proper contrast ratios for accessibility
- [ ] Add NVIDIA branding assets (logo files)

## Technical Considerations
- Routing library needed (Next.js App Router or React Router)
- Consider notebook limit per user
- Handle concurrent edits if multiple notebooks open in tabs
- Performance optimization for large number of notebooks
- Accessibility: keyboard navigation, ARIA labels

## Future Enhancements
- Notebook sharing/collaboration
- Notebook export/import
- Folder/tag organization
- Starred/favorited notebooks
- Notebook archival
