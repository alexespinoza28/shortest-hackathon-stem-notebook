# TODO: Data Persistence & Storage

## Overview
Implement robust data persistence to save and restore notebook data, ensuring users don't lose their work.

## Tasks

### 1. Choose Storage Strategy
- [ ] Decide on storage approach:
  - **Local Storage** - Browser-based, simple, no backend needed
  - **IndexedDB** - Browser-based, handles larger data
  - **Backend Database** - PostgreSQL/MongoDB with API
  - **Hybrid** - Local storage + cloud sync
- [ ] Document pros/cons of chosen approach
- [ ] Consider data size limits and scalability

### 2. Local Storage Implementation (Option 1)
- [ ] Create storage utility functions:
  - `saveNotebook(notebookId, data)`
  - `loadNotebook(notebookId)`
  - `deleteNotebook(notebookId)`
  - `getAllNotebooks()`
  - `saveNotebooksList(notebooks)`
- [ ] Implement auto-save functionality:
  - Debounced saves (e.g., 2 seconds after last edit)
  - Save on specific actions (block creation, deletion, etc.)
- [ ] Handle storage quota exceeded errors
- [ ] Implement data compression if needed
- [ ] Create migration/versioning system for data schema changes

### 3. IndexedDB Implementation (Option 2)
- [ ] Set up IndexedDB schema and object stores
- [ ] Create wrapper/abstraction layer for IndexedDB operations
- [ ] Implement CRUD operations:
  - Create notebook
  - Read notebook(s)
  - Update notebook
  - Delete notebook
- [ ] Handle IndexedDB transactions properly
- [ ] Add error handling and fallback to localStorage
- [ ] Implement indexing for fast lookups (by date, subject, etc.)

### 4. Backend/Cloud Storage (Option 3)
- [ ] Design database schema:
  \`\`\`sql
  users (id, email, created_at)
  notebooks (id, user_id, title, subject, metadata, created_at, updated_at)
  blocks (id, notebook_id, type, content, position, created_at, updated_at)
  \`\`\`
- [ ] Set up backend API endpoints:
  - `POST /api/notebooks` - Create notebook
  - `GET /api/notebooks` - List all notebooks
  - `GET /api/notebooks/:id` - Get specific notebook
  - `PUT /api/notebooks/:id` - Update notebook
  - `DELETE /api/notebooks/:id` - Delete notebook
  - `POST /api/notebooks/:id/blocks` - Add block
  - `PUT /api/blocks/:id` - Update block
  - `DELETE /api/blocks/:id` - Delete block
- [ ] Implement authentication/authorization
- [ ] Add request validation and sanitization
- [ ] Set up database connection and ORM (Prisma, Drizzle, etc.)
- [ ] Implement error handling and retry logic

### 5. Auto-Save System
- [ ] Create auto-save service/hook
- [ ] Implement debouncing (save after X ms of inactivity)
- [ ] Add save status indicator in UI:
  - "Saving..."
  - "All changes saved"
  - "Error saving - retry"
- [ ] Queue changes during offline mode
- [ ] Sync queued changes when back online
- [ ] Handle conflicts if needed

### 6. Data Synchronization (if cloud storage)
- [ ] Implement real-time sync (WebSockets/polling)
- [ ] Handle offline-first approach:
  - Save locally first
  - Sync to cloud when available
  - Merge conflicts if any
- [ ] Add sync status indicators
- [ ] Implement conflict resolution strategy:
  - Last write wins
  - Manual merge
  - Version history

### 7. Import/Export Functionality
- [ ] Export notebook to JSON
- [ ] Export notebook to PDF
- [ ] Export notebook to Markdown
- [ ] Import from JSON
- [ ] Import from existing formats (if applicable)
- [ ] Bulk export all notebooks

### 8. Backup & Recovery
- [ ] Implement automatic backups:
  - Local backups in IndexedDB
  - Cloud backups (if using backend)
- [ ] Create restore from backup functionality
- [ ] Add version history/snapshots
- [ ] Implement "undo" across sessions
- [ ] Add data recovery tools for corrupted data

### 9. Performance Optimization
- [ ] Lazy load notebook content (only load when opened)
- [ ] Implement pagination for large notebooks
- [ ] Use virtual scrolling for many blocks
- [ ] Optimize JSON serialization/deserialization
- [ ] Add caching layer
- [ ] Monitor and limit storage usage

### 10. Data Migration & Versioning
- [ ] Create data schema version number
- [ ] Implement migration scripts for schema changes
- [ ] Test migrations with sample data
- [ ] Add backward compatibility where possible
- [ ] Document data structure for future reference

### 11. Testing & Validation
- [ ] Test save/load cycle
- [ ] Test data integrity after page refresh
- [ ] Test with large datasets
- [ ] Test offline functionality
- [ ] Test concurrent edits (multiple tabs)
- [ ] Test error scenarios (quota exceeded, network errors)

## Technical Considerations
- Data privacy and security (encryption at rest?)
- GDPR compliance if storing user data
- Rate limiting for API calls
- Database connection pooling
- Backup retention policy
- Storage cost estimation (if cloud)

## Future Enhancements
- Real-time collaboration
- Version control like Git
- Conflict resolution UI
- Data analytics/insights
- Cross-device sync
- Shared notebooks with permissions
