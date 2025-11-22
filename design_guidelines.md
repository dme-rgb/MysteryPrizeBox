# Mystery Box Game - Design Guidelines

## Design Approach
**Reference-Based Approach**: Inspired by mobile game loot box interfaces and casino slot machine aesthetics, focusing on exciting reveal mechanics and celebratory animations.

## Core Design Principles
1. **Anticipation & Reward**: Build excitement through smooth animations and celebratory effects
2. **Centered Focus**: Keep user attention on the mystery box interaction
3. **Tactile Feedback**: Immediate visual response to all interactions
4. **Celebration**: Amplify winning moments with particles and glowing effects

## Typography
- **Primary Font**: Poppins (via Google Fonts CDN)
- **Weights**: Regular (400), Medium (500), Bold (700)
- **Hierarchy**:
  - Game Title: 3xl to 4xl, Bold
  - Prize Names: 2xl, Medium
  - UI Labels: base to lg, Regular
  - Button Text: lg, Medium

## Color Palette (Gamified Theme)
- **Primary Green**: HSL(158 45% 45%) - Vibrant forest green for buttons, mystery box
- **Light Green**: #5ba085 (highlights, hover states)
- **Dark Green**: #2d5f4a (shadows, depth)
- **Gold Accent**: HSL(45 85% 58%) - Bright gold for prizes, rewards, celebration effects
- **Background**: HSL(220 18% 8%) - Deep blue-tinted dark for contrast
- **Card/Surface**: HSL(220 15% 12%) - Slightly lighter than background
- **Borders**: HSL(158 15% 25%) - Green-tinted borders for cohesion
- **Text Primary**: HSL(158 25% 95%) - Bright, slightly green-tinted white
- **Text Muted**: HSL(158 15% 75%) - Green-tinted gray for secondary text

## Layout System
- **Spacing**: Tailwind units of 4, 6, 8, 12, 16 for consistent rhythm
- **Container**: Centered single-column layout, max-w-4xl
- **Box Position**: Vertically and horizontally centered with generous spacing
- **Responsive**: Full viewport height on desktop, adaptive on mobile

## Component Library

### Mystery Box Component
- 3D isometric perspective matching reference image
- Forest green (#41886e) as base color with darker shadows (#2d5f4a)
- Golden accents (#ffd700) for lock, hinges, decorative elements
- Rounded corners and soft shadows for depth
- Glow effect in idle state using box-shadow
- Lid animation: Smooth upward lift with rotation
- Touch-friendly size: minimum 300px on mobile

### Prize Display
- Scale-up reveal animation from box center
- Card-based design with gradient backgrounds
- Rarity indicators: color-coded borders (common to legendary)
- Prize icons prominently displayed above prize name
- Golden glow effect for rare items

### Celebration Effects
- Particle burst: Radial explosion from box center
- Confetti: Random colored particles falling with gravity
- Golden rays: Emanating from winning prizes
- Pulsing glow: Applied to prize cards
- Duration: 2-3 seconds for full effect

### Buttons
- Primary: Forest green (#41886e) with rounded-lg
- Hover: Light green (#5ba085) transition
- Shadow: Subtle elevation with dark green (#2d5f4a)
- Size: Generous padding (py-4 px-8) for touch targets
- Text: White (#ffffff), medium weight

### Icons
Use Font Awesome CDN for:
- Gift box icon for mystery box decoration
- Star icons for rarity indicators
- Sparkle effects for particles
- Trophy/crown for legendary prizes

## Animations (Essential)
- **Box Opening**: 0.8s ease-out lid rotation and translation
- **Prize Reveal**: 0.5s scale from 0 to 1 with bounce easing
- **Particle Effects**: 2s with fade-out and physics-based movement
- **Glow Pulse**: Continuous 1.5s infinite loop for idle state
- **Hover States**: 0.2s smooth transitions

## Audio Integration
Use Web Audio API or HTML5 Audio with these sound moments:
- Box click: Short anticipatory sound
- Lid opening: Creaking/magical reveal sound
- Prize reveal: Chime or fanfare based on rarity
- Celebration: Triumphant music snippet for rare wins

## Accessibility
- High contrast between text (#ffffff) and backgrounds (#1a1a1a)
- Generous touch targets (minimum 44px)
- Clear focus states on interactive elements
- Reduced motion option for accessibility

## Images
**Mystery Box Visualization**: The primary box should replicate the 3D isometric style from the reference image - a gift box with visible lid, lock/clasp detail, and decorative elements. No external images needed; render with CSS/Canvas for performance.

**Prize Icons**: Use icon library (Font Awesome) rather than images for coins, gems, power-ups to maintain crisp rendering at all sizes.