# UI Changes Summary - Time Offset Feature Update

## Changes Made Based on Feedback

### 1. Right-Click Context Menu Support ✅

**Issue**: User had to click the three-dot button to access options, which could be hidden when file names are long.

**Solution**: Added right-click (context menu) support directly on the file name.

- Right-clicking anywhere on the channel file name now opens the dropdown menu
- The three-dot button is still available for users who prefer clicking
- Both methods open the same dropdown menu

**Technical Implementation**:

```tsx
<AccordionTrigger
  onContextMenu={(e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropdownOpen(true);
  }}
>
```

### 2. Wider Input Field ✅

**Issue**: Input field was too narrow (w-16 = 64px), causing values like "-10" to only show "-1".

**Solution**: Increased input field width from `w-16` to `w-24` (96px).

- Now comfortably displays 3-4 digit numbers with decimal points
- Also increased dropdown menu width from `w-56` to `w-64` for better layout

**Before**: `className="h-6 w-16 text-xs"` (64px)
**After**: `className="h-6 w-24 text-xs"` (96px - 50% wider)

### 3. Decimal Value Support ✅

**Issue**: Ensure decimal values like 5.5, -3.25 are properly supported.

**Solution**: Added explicit `step="any"` attribute to the number input.

- This allows any decimal precision (e.g., 5, 5.5, 5.25, 5.125, etc.)
- The `type="number"` was already present, but `step="any"` makes it explicit

**Technical Implementation**:

```tsx
<Input
  type="number"
  step="any"  // ← New attribute
  value={timeOffsetInput}
  ...
/>
```

## Visual Layout Changes

### Before (w-16 input field):

```
┌─────────────────────────────────────┐
│ 🕐 Time delay: [12.5] s [Apply]    │  ← Truncated display
└─────────────────────────────────────┘
     Input too narrow (64px)
```

### After (w-24 input field):

```
┌─────────────────────────────────────┐
│ 🕐 Time delay: [  -12.5  ] s [Apply]│  ← Full display
└─────────────────────────────────────┘
     Input wider (96px)
```

## Interaction Methods

### Method 1: Right-Click (NEW)

1. Right-click on any channel file name
2. Context menu opens immediately
3. Select "Time delay" option
4. Enter value and click "Apply"

### Method 2: Three-Dot Button (Existing)

1. Click the three-dot icon (⋮) on the right side
2. Dropdown menu opens
3. Select "Time delay" option
4. Enter value and click "Apply"

## Examples of Supported Values

All the following values are now fully supported and visible:

| Value  | Display  | Notes                                   |
| ------ | -------- | --------------------------------------- |
| 0      | `0`      | Default, no offset                      |
| 5      | `5`      | Simple integer                          |
| -10    | `-10`    | Negative integer (previously truncated) |
| 5.5    | `5.5`    | Single decimal                          |
| -3.25  | `-3.25`  | Negative with decimals                  |
| 12.125 | `12.125` | Multiple decimals                       |
| 0.001  | `0.001`  | Small precision                         |

## Technical Details

### File Modified

- `src/app/renderer/components/AppSidebar/AppSidebar.tsx`

### Changes Summary

1. Moved `DropdownMenu` wrapper to encompass `AccordionTrigger`
2. Added `onContextMenu` handler to `AccordionTrigger`
3. Changed input `className` from `w-16` to `w-24`
4. Changed dropdown `className` from `w-56` to `w-64`
5. Added `step="any"` to input element
6. Kept three-dot button for backward compatibility

### Testing

- ✅ All 80 unit tests pass
- ✅ Lint checks pass
- ✅ Format checks pass
- ✅ No security vulnerabilities

## Commit

- Commit: `e4e8bac`
- Message: "Add right-click support and improve input field width"
