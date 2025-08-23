# Animation System

The GitHub Insights Dashboard features a sophisticated animation system powered by Framer Motion. This guide explains how animations work, how to customize them, and best practices for creating smooth, engaging user experiences.

## 🎬 Overview

The animation system is built around Framer Motion, a production-ready motion library for React. It provides:

- **Smooth Transitions**: Fluid animations between states
- **Performance Optimization**: Hardware-accelerated animations
- **Accessibility**: Respects user motion preferences
- **Customization**: Easy-to-modify animation variants

## 🏗️ Architecture

### Core Animation Variants

The dashboard uses predefined animation variants for consistency:

```typescript
// Container animations for staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

// Card animations for individual elements
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  hover: {
    scale: 1.05,
    y: -5,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
}
```

### Chart-Specific Animations

Different chart types have specialized animations:

```typescript
// Chart container animations
const chartVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2
    }
  }
}
```

## 🎨 Animation Types

### 1. Entrance Animations

#### Staggered Loading
```typescript
<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  {items.map((item, index) => (
    <motion.div
      key={item.id}
      variants={cardVariants}
      whileHover="hover"
    >
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

#### Fade-in Effects
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: "easeOut" }}
>
  Content
</motion.div>
```

### 2. Interactive Animations

#### Hover Effects
```typescript
<motion.div
  whileHover={{ 
    scale: 1.05, 
    y: -5,
    transition: { duration: 0.2 }
  }}
  whileTap={{ scale: 0.95 }}
>
  Interactive Element
</motion.div>
```

#### Click Animations
```typescript
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
>
  Click Me
</motion.button>
```

### 3. Continuous Animations

#### Floating Effects
```typescript
<motion.div
  animate={{
    y: [0, -5, 0],
  }}
  transition={{
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut"
  }}
>
  Floating Element
</motion.div>
```

#### Pulsing Animations
```typescript
<motion.div
  animate={{
    scale: [1, 1.2, 1],
    opacity: [0.7, 1, 0.7]
  }}
  transition={{
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }}
>
  Pulsing Element
</motion.div>
```

## 📊 Chart Animations

### Recharts Integration

The dashboard enhances Recharts with custom animations:

```typescript
<Area
  type="monotone"
  dataKey="value"
  stroke="#3B82F6"
  strokeWidth={3}
  fill="#3B82F6"
  fillOpacity={0.3}
  animationDuration={2000}
  animationBegin={0}
/>
```

### Custom Chart Animations

#### Staggered Data Loading
```typescript
<Bar
  dataKey="value"
  fill="#3B82F6"
  radius={[4, 4, 0, 0]}
  animationDuration={1500}
  animationBegin={300} // Staggered delay
/>
```

#### Interactive Chart Elements
```typescript
<Line
  type="monotone"
  dataKey="value"
  stroke="#10B981"
  strokeWidth={3}
  dot={{
    fill: '#10B981',
    r: 6,
    stroke: '#ffffff',
    strokeWidth: 2
  }}
  activeDot={{
    r: 8,
    stroke: '#10B981',
    strokeWidth: 3,
    fill: '#ffffff'
  }}
/>
```

## 🎭 Heatmap Animations

### Contribution Heatmap

The GitHub-style heatmap features sophisticated animations:

```typescript
const heatmapSquareVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: (custom: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: custom * 0.01, // Staggered delay
      duration: 0.3,
      ease: "easeOut"
    }
  }),
  hover: {
    scale: 1.3,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
}
```

### Interactive Tooltips
```typescript
<AnimatePresence>
  {tooltip.show && (
    <motion.div
      className="tooltip"
      variants={tooltipVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      {tooltip.text}
    </motion.div>
  )}
</AnimatePresence>
```

## 🌙 Dark Mode Transitions

### Theme Switching Animations

```typescript
// Smooth theme transitions
<motion.div
  initial={false}
  animate={{
    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
    color: theme === 'dark' ? '#ffffff' : '#000000'
  }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

### CSS Variable Transitions

```css
/* Global theme transitions */
* {
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

## ⚡ Performance Optimization

### Animation Best Practices

#### 1. Use Transform Properties
```typescript
// Good: Hardware accelerated
<motion.div animate={{ scale: 1.1, y: -5 }} />

// Avoid: Layout-triggering properties
<motion.div animate={{ width: '200px', height: '200px' }} />
```

#### 2. Optimize Animation Duration
```typescript
// Quick interactions
whileHover={{ scale: 1.05 }}
transition={{ duration: 0.2 }}

// Longer entrance animations
animate={{ opacity: 1 }}
transition={{ duration: 0.5 }}
```

#### 3. Use Appropriate Easing
```typescript
// Spring for natural movement
transition={{ type: "spring", stiffness: 100, damping: 15 }}

// Ease for smooth transitions
transition={{ duration: 0.3, ease: "easeOut" }}
```

### Reducing Motion

The system respects user motion preferences:

```typescript
// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Conditionally apply animations
const animationVariants = prefersReducedMotion ? {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
} : {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}
```

## 🎨 Customization

### Creating Custom Animations

#### 1. Define Animation Variants
```typescript
const customVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  }
}
```

#### 2. Apply to Components
```typescript
<motion.div
  variants={customVariants}
  initial="hidden"
  animate="visible"
>
  Custom Animated Content
</motion.div>
```

### Animation Configuration

#### Global Animation Settings
```typescript
// Animation configuration object
const animationConfig = {
  default: {
    duration: 0.3,
    ease: "easeOut"
  },
  spring: {
    type: "spring",
    stiffness: 100,
    damping: 15
  },
  bounce: {
    type: "spring",
    stiffness: 300,
    damping: 10
  }
}
```

## 🔧 Troubleshooting

### Common Animation Issues

#### 1. Animations Not Working
- Check if Framer Motion is properly installed
- Verify component is wrapped in motion.div
- Ensure JavaScript is enabled

#### 2. Performance Issues
- Use transform properties instead of layout properties
- Reduce animation complexity on mobile
- Implement reduced motion support

#### 3. Animation Conflicts
- Check for conflicting CSS transitions
- Ensure proper variant naming
- Verify animation timing

### Debugging Tips

#### Enable Animation Debugging
```typescript
// Add debug information
<motion.div
  onAnimationStart={() => console.log('Animation started')}
  onAnimationComplete={() => console.log('Animation completed')}
>
  Content
</motion.div>
```

#### Performance Monitoring
```typescript
// Monitor animation performance
const startTime = performance.now()
onAnimationComplete={() => {
  const duration = performance.now() - startTime
  console.log(`Animation took ${duration}ms`)
}}
```

## 📱 Mobile Considerations

### Touch-Friendly Animations

#### Reduced Motion on Mobile
```typescript
const isMobile = window.innerWidth < 768
const animationDuration = isMobile ? 0.2 : 0.3

<motion.div
  animate={{ scale: 1.05 }}
  transition={{ duration: animationDuration }}
>
  Touch Element
</motion.div>
```

#### Optimized Touch Targets
```typescript
// Larger touch targets on mobile
const touchTargetSize = isMobile ? 44 : 32

<motion.button
  style={{ minHeight: touchTargetSize, minWidth: touchTargetSize }}
  whileTap={{ scale: 0.95 }}
>
  Button
</motion.button>
```

## 🎯 Best Practices

### 1. Consistency
- Use predefined animation variants
- Maintain consistent timing across similar elements
- Follow established animation patterns

### 2. Accessibility
- Respect `prefers-reduced-motion`
- Provide alternative states for animations
- Ensure animations don't interfere with functionality

### 3. Performance
- Use hardware-accelerated properties
- Limit concurrent animations
- Optimize for mobile devices

### 4. User Experience
- Keep animations subtle and purposeful
- Provide visual feedback for interactions
- Avoid overwhelming users with too many animations

---

**Create engaging, performant animations that enhance the user experience! 🎬**
