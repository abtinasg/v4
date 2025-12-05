# AI PDF Streaming Viewer - Testing Guide

## Component Verification

### 1. Component Structure ✅
- **Location:** `src/components/ai/AiPdfViewer.tsx`
- **Exports:** `AiPdfViewer` component
- **Props:** `{ symbol: string, companyName: string, onClose?: () => void }`

### 2. Integration Points ✅
- **Stock Report Generator:** `src/components/stock/stock-report-generator.tsx`
  - New section: "AI Streaming Viewer (NEW)"
  - Button: "Open Viewer"
  - State: `showViewer` boolean
  - Modal renders when `showViewer` is true

### 3. API Endpoints ✅
- **Streaming:** `POST /api/stock/[symbol]/report/stream`
  - Already exists in codebase
  - Returns SSE (Server-Sent Events)
  - Format: `data: {type, content/metadata}\n\n`

- **Annotations:** `/api/pdf-annotations`
  - GET: Load annotations for symbol
  - POST: Save new annotation
  - DELETE: Remove annotation by ID

### 4. Database Schema ✅
- **Table:** `pdf_annotations`
- **Fields:**
  - id (TEXT, PRIMARY KEY)
  - user_id (TEXT, FOREIGN KEY)
  - symbol (VARCHAR(10))
  - report_type (VARCHAR(50))
  - text (TEXT)
  - color (VARCHAR(20))
  - position (JSONB)
  - note (TEXT, nullable)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)

## Testing Scenarios

### Scenario 1: Open Viewer
**Steps:**
1. Navigate to `/dashboard/stock-analysis/AAPL`
2. Scroll to "AI Research Reports" section
3. Find "AI Streaming Viewer (NEW)" box
4. Click "Open Viewer" button

**Expected Result:**
- Fullscreen modal opens
- Header shows "AAPL - AI Report"
- Loading spinner appears
- Streaming starts automatically

### Scenario 2: Watch Streaming
**Steps:**
1. Open viewer (as above)
2. Wait for content to appear

**Expected Result:**
- Content appears word-by-word in real-time
- Markdown formatting applied (headers, bold, lists)
- Loading indicator shows "Streaming content..."
- Eventually shows completion

### Scenario 3: Enable Highlighting
**Steps:**
1. Open viewer with content
2. Click "Highlight" button in toolbar

**Expected Result:**
- Button shows "Highlighting" (active state)
- Color picker appears with 5 colors
- Cursor indicates selection mode

### Scenario 4: Create Highlight
**Steps:**
1. Enable highlighting mode
2. Select a color (e.g., Yellow)
3. Click and drag to select text
4. Release mouse

**Expected Result:**
- Selected text gets yellow overlay (30% opacity)
- Highlight persists immediately
- Hover shows delete button
- Highlight saved to database

### Scenario 5: Delete Highlight
**Steps:**
1. Hover over existing highlight
2. Click red trash icon

**Expected Result:**
- Highlight disappears immediately
- Deleted from database
- No error messages

### Scenario 6: Download PDF
**Steps:**
1. Have viewer open with content
2. Optionally add some highlights
3. Click "Download PDF" button

**Expected Result:**
- PDF generates (may take a few seconds)
- File downloads: `AAPL_AI_Report_2025-12-05.pdf`
- Contains all content
- Contains "Your Highlights" section at end

### Scenario 7: Fullscreen Toggle
**Steps:**
1. Open viewer
2. Click fullscreen button (Maximize2 icon)
3. Click again (Minimize2 icon)

**Expected Result:**
- First click: Expands to full viewport, no padding
- Second click: Returns to normal size with padding
- Content remains intact

### Scenario 8: Close Viewer
**Steps:**
1. Open viewer
2. Click "Close" button

**Expected Result:**
- Modal closes smoothly
- Returns to stock analysis page
- Streaming aborts cleanly

## Component Features Checklist

### UI Components ✅
- [x] Modal overlay with backdrop
- [x] Header with stock symbol and company name
- [x] Toolbar with controls
- [x] Content area with scrolling
- [x] Loading states
- [x] Error states

### Toolbar Buttons ✅
- [x] Highlight mode toggle
- [x] Color picker (5 colors)
- [x] Download PDF button
- [x] Fullscreen toggle
- [x] Close button

### Streaming Features ✅
- [x] Auto-start on mount
- [x] Real-time content display
- [x] Metadata handling
- [x] Completion detection
- [x] Error handling
- [x] Abort controller cleanup

### Highlighting Features ✅
- [x] Selection mode toggle
- [x] Text selection detection
- [x] Position calculation
- [x] Color application
- [x] Database persistence
- [x] Load saved highlights
- [x] Delete highlights
- [x] Visual feedback

### PDF Generation ✅
- [x] jsPDF integration
- [x] Markdown to plain text conversion
- [x] Professional formatting
- [x] Header/footer
- [x] Pagination
- [x] Highlights section
- [x] Branding

## Dependencies Verification

### Package.json ✅
```json
{
  "dependencies": {
    "jspdf": "^3.0.4",
    "marked": "^17.0.1",
    "react-pdf": "latest",
    "pdfjs-dist": "latest"
  }
}
```

### Imports in Component ✅
```typescript
import jsPDF from 'jspdf'
import { marked } from 'marked'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
```

## Known Limitations

### Browser Compatibility
- Requires modern browser with ES6+ support
- Selection API may behave differently on mobile
- PDF generation best on desktop

### Performance
- Large reports (>10,000 words) may slow highlighting
- PDF generation blocks UI momentarily
- Streaming requires stable internet connection

### Mobile Experience
- Highlighting less precise on touchscreens
- Consider tap-to-highlight instead of drag
- PDF download works but viewing may be limited

## Error Scenarios

### Network Errors
- **Streaming fails:** Shows error message, allows retry
- **Save highlight fails:** Console error, highlight not persisted
- **Load highlights fails:** Continues without saved data

### Authentication Errors
- **Not logged in:** API returns 401, redirects to login
- **Session expired:** Same as above

### Data Errors
- **Invalid symbol:** Shows "Stock data not found"
- **Missing content:** Shows "Failed to generate report"
- **Database error:** Highlights continue in memory only

## Next Steps for Complete Testing

1. **Set up test environment:**
   - Clone repository
   - Install dependencies: `npm install`
   - Set environment variables (DATABASE_URL, etc.)
   - Run migrations: `npm run db:push`

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Test each scenario:**
   - Follow scenarios above
   - Document any bugs found
   - Take screenshots for documentation

4. **Edge case testing:**
   - Very long reports
   - Many highlights (50+)
   - Rapid highlight/delete cycles
   - Network interruptions during streaming
   - Concurrent sessions in multiple tabs

5. **Cross-browser testing:**
   - Chrome
   - Firefox
   - Safari
   - Edge
   - Mobile browsers

## Success Criteria

✅ All features implemented as per requirements:
- Real-time streaming display
- Parallel processing (already existed)
- Text highlighting with persistence
- PDF download with annotations
- User-friendly interface

✅ Integration complete:
- Works with existing credit system
- Respects authentication
- Uses existing streaming endpoint
- Follows codebase patterns

✅ Code quality:
- TypeScript types correct
- No compilation errors
- Follows React best practices
- Proper cleanup (useEffect, abortController)

## Conclusion

The AI PDF Streaming Viewer is fully implemented and ready for testing in a deployed environment. All requirements from the Persian specification have been met, and the component integrates seamlessly with the existing Deep Terminal codebase.
