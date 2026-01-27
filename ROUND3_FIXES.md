# Round 3 Positioning and Focus Fixes

## Issues Addressed

### Issue 1: Menu Positioning ✅ FIXED

**Problem**: Menu was appearing in "random places" instead of where expected.

**User Requirements**:

- Y coordinate: Right below the channel file name
- X coordinate: At the cursor's X position when right-clicking

**Previous Implementation (Incorrect)**:

```tsx
setContextMenuPosition({ x: e.clientX, y: e.clientY });
```

This used the cursor's Y position, which could be anywhere within the file name area.

**New Implementation (Correct)**:

```tsx
const triggerRect = accordionTriggerRef.current?.getBoundingClientRect();

if (triggerRect) {
  setContextMenuPosition({
    x: e.clientX, // Cursor X position (as requested)
    y: triggerRect.bottom, // Bottom edge of file name element
  });
}
```

**How It Works**:

1. Get the bounding rectangle of the AccordionTrigger element
2. Use `triggerRect.bottom` for Y coordinate (bottom edge of file name)
3. Use `e.clientX` for X coordinate (cursor position)
4. Menu always appears directly below the file name, aligned with cursor horizontally

**Visual Example**:

```
┌─────────────────────────────────────┐
│ Channel File Name 🕐 +5 s      [⋮]  │ ← File name row
└─────────────────────────────────────┘
      ↑ (cursor X)
      ┌──────────────────────────┐     ← Menu appears here
      │ ✕ Close file             │       (Y = bottom of file name)
      ├──────────────────────────┤       (X = cursor position)
      │ 🕐 Time delay: [...] s   │
      │               [Apply]    │
      └──────────────────────────┘
```

### Issue 2: Input Field Not Working Properly ✅ FIXED

**Problem**: Despite previous changes, the input field still wasn't maintaining focus properly.

**Root Cause**: The `autoFocus` attribute wasn't reliable with Radix UI's DropdownMenuItem, which manages its own focus behavior.

**Solution**: Programmatic focus with proper timing:

```tsx
// In useEffect when dropdown opens
useEffect(() => {
  if (isDropdownOpen) {
    setTimeOffsetInput(String(timeOffset));
    // Focus after a delay to ensure menu is fully rendered
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select(); // Also select text for easy editing
    }, 100);
  }
}, [isDropdownOpen, timeOffset]);
```

**Additional Improvements**:

1. Added `ref={inputRef}` to the Input component
2. Added `onMouseDown` handler to prevent event propagation
3. Removed `autoFocus` and `onFocus` attributes (now handled programmatically)
4. Added `.select()` to automatically select the current value for easy replacement

**User Experience**:

1. Menu opens
2. After 100ms, input automatically focuses and selects current value
3. User can immediately start typing to replace value
4. Focus is maintained even when cursor moves outside input
5. Press Enter or click Apply to submit

## Technical Implementation

### Changes Made

**File**: `src/app/renderer/components/AppSidebar/AppSidebar.tsx`

**1. Added Refs**:

```tsx
const accordionTriggerRef = useRef<HTMLButtonElement>(null);
const inputRef = useRef<HTMLInputElement>(null);
```

**2. Updated handleContextMenu**:

```tsx
function handleContextMenu(e: React.MouseEvent) {
  e.preventDefault();
  e.stopPropagation();

  const triggerRect = accordionTriggerRef.current?.getBoundingClientRect();

  if (triggerRect) {
    setContextMenuPosition({
      x: e.clientX, // Cursor X
      y: triggerRect.bottom, // Below file name
    });
  } else {
    // Fallback to cursor position
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
  }

  setIsDropdownOpen(true);
}
```

**3. Enhanced useEffect for Focus**:

```tsx
useEffect(() => {
  if (isDropdownOpen) {
    setTimeOffsetInput(String(timeOffset));
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 100);
  }
}, [isDropdownOpen, timeOffset]);
```

**4. Updated JSX**:

```tsx
<AccordionTrigger
  ref={accordionTriggerRef}  // Added ref
  ...
/>

<Input
  ref={inputRef}  // Added ref
  onMouseDown={(e) => e.stopPropagation()}  // Added handler
  // Removed: autoFocus, onFocus
  ...
/>
```

## Comparison: Before vs After

### Menu Positioning

**Before (Round 2)**:

- Y: Cursor Y position (could be anywhere in the file name)
- X: Cursor X position ✓
- Result: Menu appeared at random vertical positions

**After (Round 3)**:

- Y: Bottom of file name element (consistent)
- X: Cursor X position ✓
- Result: Menu always appears right below file name

### Input Focus

**Before (Round 2)**:

- Used `autoFocus` attribute
- Focus unreliable with Radix UI DropdownMenuItem
- No text selection

**After (Round 3)**:

- Programmatic focus with setTimeout
- Reliable focus after menu renders
- Text automatically selected for easy editing
- `onMouseDown` prevents additional focus issues

## Testing

- ✅ All 80 unit tests passing
- ✅ Lint checks passing
- ✅ Format checks passing
- ✅ No security vulnerabilities

## Expected Behavior

### Right-Click Workflow:

1. User right-clicks on a channel file name
2. Menu appears:
   - Horizontally: At cursor X position
   - Vertically: Directly below the file name row
3. Input field is automatically focused and current value selected
4. User types new value (selected text is replaced)
5. User can move cursor freely while typing
6. Press Enter or click Apply to submit

### Three-Dot Button Workflow:

1. User clicks three-dot icon
2. Menu appears at button position (standard dropdown behavior)
3. Same focus and typing experience as above

## Commit

**Commit**: `c9b0471`
**Message**: "Fix menu positioning and input focus behavior"
