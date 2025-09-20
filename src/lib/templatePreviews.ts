/**
 * Template Preview Image Generator
 * Generates SVG preview images for presentation templates
 */

export interface TemplatePreviewConfig {
  name: string;
  displayName: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  style: 'modern' | 'classic' | 'minimal' | 'creative';
}

// Template configurations with color schemes and styles
const templateConfigs: Record<string, TemplatePreviewConfig> = {
  general: {
    name: 'general',
    displayName: 'General',
    description: 'Versatile template suitable for any presentation type',
    colors: {
      primary: '#3b82f6',
      secondary: '#1e40af',
      accent: '#60a5fa',
      background: '#ffffff',
      text: '#1f2937'
    },
    style: 'classic'
  },
  modern: {
    name: 'modern',
    displayName: 'Modern',
    description: 'Contemporary design with clean lines and bold typography',
    colors: {
      primary: '#6366f1',
      secondary: '#4f46e5',
      accent: '#a78bfa',
      background: '#f8fafc',
      text: '#0f172a'
    },
    style: 'modern'
  },
  standard: {
    name: 'standard',
    displayName: 'Standard',
    description: 'Classic business presentation layout',
    colors: {
      primary: '#374151',
      secondary: '#1f2937',
      accent: '#9ca3af',
      background: '#ffffff',
      text: '#111827'
    },
    style: 'classic'
  },
  swift: {
    name: 'swift',
    displayName: 'Swift',
    description: 'Minimalist template for quick, focused presentations',
    colors: {
      primary: '#10b981',
      secondary: '#047857',
      accent: '#6ee7b7',
      background: '#ffffff',
      text: '#065f46'
    },
    style: 'minimal'
  },
  professional: {
    name: 'professional',
    displayName: 'Professional',
    description: 'Formal business template with corporate styling',
    colors: {
      primary: '#1e40af',
      secondary: '#1e3a8a',
      accent: '#3b82f6',
      background: '#ffffff',
      text: '#1e293b'
    },
    style: 'classic'
  },
  creative: {
    name: 'creative',
    displayName: 'Creative',
    description: 'Dynamic template with creative elements and vibrant colors',
    colors: {
      primary: '#f59e0b',
      secondary: '#d97706',
      accent: '#fbbf24',
      background: '#fffbeb',
      text: '#92400e'
    },
    style: 'creative'
  }
};

/**
 * Generate SVG preview for a template
 */
export function generateTemplatePreview(templateName: string): string {
  const config = templateConfigs[templateName] || templateConfigs.general!;
  
  const { colors, style } = config;
  
  // Base SVG structure
  const width = 300;
  const height = 200;
  
  // Generate different layouts based on style
  switch (style) {
    case 'modern':
      return generateModernPreview(colors, width, height);
    case 'minimal':
      return generateMinimalPreview(colors, width, height);
    case 'creative':
      return generateCreativePreview(colors, width, height);
    case 'classic':
    default:
      return generateClassicPreview(colors, width, height);
  }
}

function generateClassicPreview(colors: TemplatePreviewConfig['colors'], width: number, height: number): string {
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="classicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="${colors.background}" rx="8"/>
      
      <!-- Header bar -->
      <rect x="0" y="0" width="${width}" height="50" fill="url(#classicGrad)" rx="8"/>
      
      <!-- Title placeholder -->
      <rect x="20" y="15" width="200" height="8" fill="${colors.background}" rx="4" opacity="0.9"/>
      <rect x="20" y="27" width="150" height="6" fill="${colors.background}" rx="3" opacity="0.7"/>
      
      <!-- Content blocks -->
      <rect x="20" y="70" width="260" height="4" fill="${colors.text}" opacity="0.6" rx="2"/>
      <rect x="20" y="80" width="240" height="4" fill="${colors.text}" opacity="0.4" rx="2"/>
      <rect x="20" y="90" width="200" height="4" fill="${colors.text}" opacity="0.4" rx="2"/>
      
      <rect x="20" y="110" width="260" height="4" fill="${colors.text}" opacity="0.6" rx="2"/>
      <rect x="20" y="120" width="220" height="4" fill="${colors.text}" opacity="0.4" rx="2"/>
      
      <!-- Accent shapes -->
      <circle cx="250" cy="150" r="25" fill="${colors.accent}" opacity="0.2"/>
      <rect x="20" y="160" width="40" height="20" fill="${colors.primary}" rx="4" opacity="0.3"/>
    </svg>
  `;
}

function generateModernPreview(colors: TemplatePreviewConfig['colors'], width: number, height: number): string {
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="modernGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:0.3" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="${colors.background}" rx="12"/>
      
      <!-- Geometric background -->
      <rect x="0" y="0" width="${width}" height="${height}" fill="url(#modernGrad)" rx="12"/>
      
      <!-- Modern layout blocks -->
      <rect x="30" y="30" width="120" height="6" fill="${colors.text}" rx="3"/>
      <rect x="30" y="42" width="180" height="12" fill="${colors.text}" rx="6" opacity="0.8"/>
      
      <!-- Content grid -->
      <rect x="30" y="70" width="80" height="60" fill="${colors.background}" rx="8" opacity="0.9"/>
      <rect x="120" y="70" width="80" height="60" fill="${colors.background}" rx="8" opacity="0.7"/>
      <rect x="210" y="70" width="60" height="60" fill="${colors.background}" rx="8" opacity="0.5"/>
      
      <!-- Modern accent lines -->
      <rect x="0" y="150" width="${width}" height="3" fill="${colors.primary}"/>
      <rect x="30" y="160" width="100" height="2" fill="${colors.secondary}" opacity="0.6"/>
      <rect x="30" y="170" width="80" height="2" fill="${colors.secondary}" opacity="0.4"/>
    </svg>
  `;
}

function generateMinimalPreview(colors: TemplatePreviewConfig['colors'], width: number, height: number): string {
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="${colors.background}" rx="8"/>
      
      <!-- Minimal header -->
      <rect x="40" y="40" width="80" height="2" fill="${colors.primary}" rx="1"/>
      <rect x="40" y="50" width="120" height="8" fill="${colors.text}" rx="4" opacity="0.8"/>
      
      <!-- Simple content lines with lots of whitespace -->
      <rect x="40" y="80" width="200" height="2" fill="${colors.text}" opacity="0.3" rx="1"/>
      <rect x="40" y="90" width="160" height="2" fill="${colors.text}" opacity="0.3" rx="1"/>
      <rect x="40" y="100" width="140" height="2" fill="${colors.text}" opacity="0.3" rx="1"/>
      
      <rect x="40" y="120" width="180" height="2" fill="${colors.text}" opacity="0.3" rx="1"/>
      <rect x="40" y="130" width="120" height="2" fill="${colors.text}" opacity="0.3" rx="1"/>
      
      <!-- Single accent element -->
      <rect x="220" y="150" width="40" height="20" fill="${colors.primary}" rx="10" opacity="0.6"/>
    </svg>
  `;
}

function generateCreativePreview(colors: TemplatePreviewConfig['colors'], width: number, height: number): string {
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="creativeGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:0.1" />
        </radialGradient>
      </defs>
      
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="${colors.background}" rx="12"/>
      <rect width="${width}" height="${height}" fill="url(#creativeGrad)" rx="12"/>
      
      <!-- Creative shapes -->
      <circle cx="60" cy="60" r="30" fill="${colors.primary}" opacity="0.2"/>
      <polygon points="200,20 240,50 200,80 160,50" fill="${colors.secondary}" opacity="0.3"/>
      <rect x="20" y="120" width="40" height="40" fill="${colors.accent}" rx="20" opacity="0.4" transform="rotate(45 40 140)"/>
      
      <!-- Dynamic text blocks -->
      <rect x="100" y="40" width="100" height="6" fill="${colors.text}" rx="3" opacity="0.7"/>
      <rect x="100" y="52" width="80" height="8" fill="${colors.text}" rx="4" opacity="0.9"/>
      
      <!-- Flowing content -->
      <path d="M 20 100 Q 100 90 180 100 T 280 100" stroke="${colors.primary}" stroke-width="2" fill="none" opacity="0.5"/>
      <rect x="40" y="130" width="60" height="3" fill="${colors.text}" rx="1.5" opacity="0.4"/>
      <rect x="40" y="140" width="80" height="3" fill="${colors.text}" rx="1.5" opacity="0.4"/>
      <rect x="40" y="150" width="40" height="3" fill="${colors.text}" rx="1.5" opacity="0.4"/>
      
      <!-- Creative footer -->
      <rect x="150" y="160" width="100" height="20" fill="${colors.secondary}" rx="10" opacity="0.3"/>
    </svg>
  `;
}

/**
 * Get template configuration
 */
export function getTemplateConfig(templateName: string): TemplatePreviewConfig {
  return templateConfigs[templateName] || templateConfigs.general!;
}

/**
 * Get all available template configs
 */
export function getAllTemplateConfigs(): TemplatePreviewConfig[] {
  return Object.values(templateConfigs);
}

/**
 * Generate data URL for SVG preview
 */
export function generateTemplatePreviewDataUrl(templateName: string): string {
  const svg = generateTemplatePreview(templateName);
  const encodedSvg = encodeURIComponent(svg);
  return `data:image/svg+xml,${encodedSvg}`;
}