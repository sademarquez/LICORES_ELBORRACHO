# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EL BORRACHO is a Progressive Web Application (PWA) for a liquor delivery service in Popayán, Colombia. The application is built with vanilla JavaScript using ES6 modules, with no build process or package management system.

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6 modules), HTML5, CSS3
- **Styling**: Tailwind CSS (CDN), custom CSS with glassmorphism design
- **UI Components**: Swiper.js for carousels
- **3D Effects**: Three.js for particle background animations
- **PWA**: Service Worker for offline functionality and caching
- **Dependencies**: All loaded via CDN (no npm/package.json)

## Architecture

### Module System
The application uses ES6 modules with clear separation of concerns:
- `js/main.js` - Main application controller, imports and orchestrates other modules
- `js/cart.js` - Shopping cart functionality and WhatsApp integration
- `js/carousels.js` - Swiper.js carousel implementations
- `js/age-verification.js` - Age verification modal for alcohol purchases
- `js/search.js` - Product search and filtering
- Additional utilities: `toast.js`, `support.js`, `products.js`

### Data Management
- `products.json` - Product catalog with categories (Licor, Cerveza, Vino, Tabaco, etc.)
- `config.json` - Site configuration including banners, brands, and contact info
- Local storage for cart persistence
- No backend API - WhatsApp integration for order processing

### PWA Implementation
- `sw.js` - Service Worker with app shell caching and dynamic image caching
- `manifest.json` - PWA manifest with Colombian peso pricing and app metadata
- Offline-first approach with fallback strategies

## Development Workflow

### Running the Application
```bash
# Use npm dev script (uses serve)
npm run dev

# Or serve static files using any web server
python -m http.server 8000
# or
npx serve .
# or use Live Server extension in VS Code
```

### Key Files to Understand
- `index.html` - Single-page application entry point
- `js/main.js` - Main controller that initializes all features
- `css/styles.css` - Custom properties and glassmorphism design system
- `products.json` - Product data structure and categories

### Making Changes
1. **Adding Products**: Edit `products.json` with new product data
2. **UI Changes**: Modify CSS files or HTML structure
3. **Feature Changes**: Update relevant JS modules
4. **PWA Updates**: Modify `manifest.json` or `sw.js` for offline behavior

## Business Logic

### Product Categories
- Licor (Liquor)
- Cerveza (Beer) 
- Vino (Wine)
- Tabaco (Tobacco)
- Bebida no alcohólica (Non-alcoholic drinks)
- Snack

### Order Processing
**Professional Order System** with dual WhatsApp integration:
- **Customer**: Receives confirmation with order code, details, and estimated delivery
- **Delivery Team**: Gets order details, customer info, and delivery instructions
- **Order Codes**: Format EB + YYMMDD + HHMM + Random (e.g., EB241202154523)
- **Phones**: 573174144815 (customer), 573233833450 (delivery team)

### Age Verification
Legal requirement for alcohol sales - implemented as a modal that must be accepted before viewing products.

## Key Features

### Professional Order Management
- **Checkout Modal**: Complete customer information collection
- **Order Codes**: Unique identifiers for tracking
- **Dual WhatsApp**: Separate messages for customer and delivery team
- **Order Tracking**: `/pedidos.html` page for order status checking
- **Validation**: Real-time form validation with Colombian phone format

### Responsive Design
- Mobile-first approach with bottom navigation
- Desktop layout with header navigation
- Glassmorphism UI with backdrop blur effects

### Performance
- Lazy loading for product images
- Service Worker caching for offline functionality
- Three.js particle effects for visual appeal

### User Experience
- Smooth animations and transitions
- Professional checkout flow with address collection
- Order confirmation and tracking system
- Search and filter functionality
- Brand showcase carousel

## Common Tasks

### Adding New Products
1. Add product data to `products.json`
2. Place product image in `images/products/`
3. Ensure image follows naming convention (lowercase, no spaces)

### Modifying Styles
- Edit `css/styles.css` for global changes
- Use existing CSS custom properties for consistency
- Mobile-first responsive approach

### Testing Changes
- Test on mobile devices (primary target)
- Verify PWA functionality (offline mode, add to home screen)
- Test WhatsApp integration with actual phone numbers

### Building Mobile Apps
```bash
# Deploy web changes to Capacitor
npm run deploy

# Build Android APK
npm run build-apk

# Run on Android device/emulator
npm run android

# Sync changes with Capacitor
npm run sync

# Open in Android Studio
npx cap open android
```

## Mobile App Distribution

### Automatic APK Generation
- GitHub Actions automatically builds APKs on every push to main
- APKs available in GitHub Releases for direct download
- Users can install without Google Play Store

### Direct Download Features
- `/descargar.html` - Download page with install instructions
- PWA install prompt for supported browsers
- Automatic GitHub Releases with download links

### Capacitor Configuration
- `capacitor.config.json` - Native app configuration
- `android/` directory - Native Android project
- Icons automatically generated from `images/logo.png`

## Order System Architecture

### Core Modules
- `js/order-system.js` - Order creation, validation, and management
- `js/checkout-modal.js` - Professional checkout UI and form handling
- `js/cart.js` - Updated cart with new checkout integration

### Order Flow
1. **Add to Cart** - Products added to cart with local storage persistence
2. **Checkout** - Professional modal with customer information form
3. **Validation** - Real-time validation of name, phone, and address
4. **Order Creation** - Generate unique order code and save locally
5. **WhatsApp Integration** - Send separate messages to customer and delivery team
6. **Tracking** - Orders can be tracked via `/pedidos.html`

### Key Pages
- `index.html` - Main store with cart and checkout
- `pedidos.html` - Order tracking and status checking
- `descargar.html` - App download page

### Data Storage
- Cart: `localStorage` key `el_borracho_cart`
- Orders: `localStorage` key `el_borracho_orders`
- Age verification: Session-based modal

## Code Conventions

- Use ES6+ features (async/await, destructuring, template literals)
- Maintain module separation of concerns
- Follow existing glassmorphism design patterns
- Keep mobile-first responsive design approach
- Use semantic HTML with proper ARIA labels