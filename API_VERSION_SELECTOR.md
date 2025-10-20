# API Version Selector

A custom Docusaurus navbar component that allows users to select and view different API versions of the YaniQ platform.

## Overview

The API Version Selector provides a dropdown menu in the documentation navbar that displays available API versions, their release dates, and status (Current, Beta, or Deprecated).

## Current Version

- **Version:** 1.0.0
- **Release Date:** October 2024
- **Status:** Current

## Features

- ✅ Dropdown selection of API versions
- ✅ Visual status badges (Current, Beta, Deprecated)
- ✅ Version persistence using localStorage
- ✅ Responsive design (mobile-friendly)
- ✅ Dark mode support
- ✅ Smooth animations and transitions
- ✅ Direct link to API documentation
- ✅ Accessible keyboard navigation

## Component Structure

```
src/
├── components/
│   └── ApiVersionSelector/
│       ├── index.tsx          # Main component
│       └── styles.module.css  # Component styles
└── theme/
    └── NavbarItem/
        └── ComponentTypes.js  # Theme integration
```

## How It Works

1. **Navbar Integration**: The component is registered as a custom navbar item in `docusaurus.config.ts`
2. **Version Storage**: Selected version is stored in browser's localStorage
3. **Status Indicators**: Each version displays a colored badge indicating its status
4. **Documentation Link**: Quick access to the complete API usage guide

## Adding New Versions

To add a new API version, edit `src/components/ApiVersionSelector/index.tsx`:

```typescript
const API_VERSIONS: ApiVersion[] = [
  {
    version: '1.0.0',
    label: 'v1.0.0',
    releaseDate: 'October 2024',
    status: 'current',
  },
  {
    version: '1.1.0',
    label: 'v1.1.0',
    releaseDate: 'October 2025',
    status: 'beta',
  },
  // Add more versions here
];
```

## Version Status Options

- **`current`**: The stable, recommended version (Green badge)
- **`beta`**: Preview version with new features (Yellow badge)
- **`deprecated`**: Old version, use discouraged (Red badge)

## Styling

The component uses CSS modules for scoped styling and supports:
- Light/Dark theme adaptation
- Responsive breakpoints
- Smooth animations
- Custom focus states for accessibility

## Usage Example

The version selector appears in the navbar between the API Reference link and GitHub link:

```
[Documentation] [Services] [Libraries] [API Reference] [API v1.0.0 ▼] [GitHub]
```

When clicked, it displays:

```
┌─────────────────────────────────┐
│ SELECT API VERSION              │
├─────────────────────────────────┤
│ ✓ v1.0.0        [Current]       │
│   October 2024                  │
├─────────────────────────────────┤
│ View API Documentation →        │
└─────────────────────────────────┘
```

## Future Enhancements

Planned features for upcoming versions:

- [ ] Version-specific documentation routing
- [ ] API changelog integration
- [ ] Migration guide links between versions
- [ ] Breaking changes notifications
- [ ] Version comparison view

## Testing

To test the component locally:

```bash
cd yaaniq_docs
npm start
```

The version selector will appear in the top-right of the navbar.

## Customization

### Changing Position

Edit `docusaurus.config.ts` and move the custom item:

```typescript
items: [
  // Move to different position
  {
    type: 'custom-apiVersionSelector',
    position: 'left', // or 'right'
  },
]
```

### Styling Adjustments

Modify `src/components/ApiVersionSelector/styles.module.css` to customize:
- Colors
- Spacing
- Animations
- Badge styles

### Mobile Behavior

On mobile devices (< 768px):
- The version label text is hidden
- Only the icon and chevron are shown
- Dropdown adjusts to smaller screens

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Accessibility

- Full keyboard navigation support
- ARIA labels for screen readers
- Focus indicators
- Semantic HTML structure

## Related Documentation

- [Common API Library](../docs/libraries/common-api.md)
- [Common API Usage Guide](../docs/libraries/common-api-usage-guide.md)
- [API Reference](../docs/api/overview.md)

---

**Last Updated:** October 20, 2025  
**Maintainer:** Danukaji Hansanath
