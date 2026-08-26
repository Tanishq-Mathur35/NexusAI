export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            fontFamily: { display: ['Syne', 'sans-serif'], body: ['DM Sans', 'sans-serif'], mono: ['JetBrains Mono', 'monospace'] },
            colors: { void: '#050508', surface: '#0d0d14', panel: '#12121c', border: '#1e1e2e', accent: '#6366f1', 'accent-glow': '#818cf8' },
            animation: { 'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite', 'spin-slow': 'spin 2s linear infinite' }
        }
    },
    plugins: []
};
