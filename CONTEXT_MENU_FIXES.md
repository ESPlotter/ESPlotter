# Context Menu Behavior Fixes

## Issues Addressed

### Issue 1: Left-Click Conflict with Accordion ✅ FIXED
**Problem**: The dropdown menu was opening on left-clicks, preventing the accordion from expanding/collapsing normally.

**Root Cause**: The `AccordionTrigger` was wrapped inside `DropdownMenuTrigger asChild`, making ANY click on the accordion trigger open the dropdown menu.

**Solution**: 
- Removed the `AccordionTrigger` from being a child of `DropdownMenuTrigger`
- Added separate `onContextMenu` handler to `AccordionTrigger` for right-click only
- Kept the three-dot button as a separate `DropdownMenuTrigger` for left-click access

**Result**: Left-clicking the file name now properly expands/collapses the accordion. Right-clicking opens the context menu.

### Issue 2: Menu Positioning at Three-Dot Icon Location ✅ FIXED
**Problem**: When right-clicking on a file name (especially when the name is long), the menu appeared at the three-dot icon position (which could be off-screen), not at the cursor position.

**Root Cause**: The dropdown menu was using `align="end"` which positions it relative to the trigger element (the accordion), regardless of where the right-click occurred.

**Solution**:
- Track cursor position in state: `const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null)`
- Capture cursor coordinates on right-click: `setContextMenuPosition({ x: e.clientX, y: e.clientY })`
- Apply fixed positioning when opened via right-click:
  ```tsx
  style={
    contextMenuPosition
      ? {
          position: 'fixed',
          left: `${contextMenuPosition.x}px`,
          top: `${contextMenuPosition.y}px`,
        }
      : undefined
  }
  ```
- Reset position when menu closes to allow normal positioning for three-dot button

**Result**: Right-clicking shows menu at cursor location. Three-dot button shows menu at button location (default behavior).

### Issue 3: Input Field Losing Focus ✅ FIXED
**Problem**: After clicking in the input field, moving the cursor away caused focus to be lost, making it unintuitive to continue typing.

**Root Cause**: Missing `autoFocus` attribute and insufficient event handling to maintain focus.

**Solution**:
- Added `autoFocus` attribute to automatically focus the input when menu opens
- Added `onFocus` event handler with `stopPropagation` to prevent focus loss
- Input now maintains focus even when cursor moves outside the field

**Result**: Users can click the input once, move their cursor anywhere, and continue typing until they press Enter or click Apply.

## Technical Implementation Details

### Before (Problematic Structure)
```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <AccordionTrigger onContextMenu={...}>  {/* ANY click opens menu */}
      File Name
    </AccordionTrigger>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">  {/* Positioned at trigger */}
    ...
  </DropdownMenuContent>
</DropdownMenu>
```

### After (Fixed Structure)
```tsx
<AccordionTrigger onContextMenu={handleContextMenu}>  {/* Only right-click */}
  File Name
</AccordionTrigger>
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <button onClick={...}>⋮</button>  {/* Three-dot button */}
  </DropdownMenuTrigger>
  <DropdownMenuContent
    style={contextMenuPosition ? { position: 'fixed', left: ..., top: ... } : undefined}
  >
    <Input autoFocus onFocus={(e) => e.stopPropagation()} />
  </DropdownMenuContent>
</DropdownMenu>
```

## User Experience Improvements

### Interaction Flow Now

#### Right-Click on File Name:
1. User right-clicks anywhere on the channel file name
2. Menu appears **exactly at cursor position**
3. Input field is automatically focused
4. User can type immediately without needing to click
5. User can move cursor freely while typing
6. Press Enter or click Apply to submit

#### Click Three-Dot Button:
1. User clicks the three-dot (⋮) icon
2. Menu appears at button position (standard dropdown behavior)
3. Same auto-focus and typing experience as above

#### Left-Click on File Name:
1. User left-clicks the channel file name
2. Accordion expands/collapses normally
3. No menu appears

## Code Changes

**File Modified**: `src/app/renderer/components/AppSidebar/AppSidebar.tsx`

**Key Changes**:
1. Added `contextMenuPosition` state to track cursor location
2. Added `handleContextMenu` function to capture right-click coordinates
3. Restructured JSX to separate accordion trigger from dropdown trigger
4. Added dynamic positioning via inline styles
5. Added `autoFocus` and `onFocus` to input element
6. Reset context menu position when dropdown closes

**Commit**: `04c4068`

## Testing

- ✅ All 80 unit tests passing
- ✅ Lint checks passing (fixed unused parameter warning)
- ✅ Format checks passing
- ✅ No new security vulnerabilities

## Visual Examples

### Scenario 1: Long File Name
**Before**: 
- File name truncated: "very_long_channel_file_n..."
- Three-dot icon hidden off-screen
- Right-click opens menu off-screen

**After**:
- Right-click on visible file name
- Menu appears at cursor (on-screen)
- Can access all functions

### Scenario 2: Typing Experience
**Before**:
- Click input field
- Move cursor → focus lost
- Must click again to continue typing

**After**:
- Input auto-focuses when menu opens
- Can move cursor freely
- Continue typing without re-clicking

### Scenario 3: Normal Accordion Usage
**Before**:
- Left-click opens menu (wrong!)
- Can't expand/collapse accordion

**After**:
- Left-click expands/collapses accordion (correct!)
- Right-click opens menu
