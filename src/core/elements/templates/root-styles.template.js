export const hostStyleSheet = new CSSStyleSheet()
hostStyleSheet.replaceSync(`
    :host {
        --sk-primary: #050021;
        --sk-secondary: #1E0074;
        --sk-accent: #C9D1FF;
        --sk-hover-color: #03001a;
        --sk-background-variant-1: #191B1C;
        --sk-background-variant-2: #1E1E1E;

        --sk-text-grey: #5f5f5f;
        --sk-results-blue-foreground: #3172ff;
        --sk-results-yellow-foreground: #ffe600;
        --sk-results-green-foreground: #40ff2f;
        --sk-results-red-foreground: #ff2b2b;
        --sk-indicator-green: #36ff46;
        --sk-indicator-yellow: #fafe09;
        --sk-indicator-red: #de291f;
        --sk-indicator-blue: #1b72e4;

        --sk-text-xs: 0.75rem;
        --sk-text-sm: 0.875rem;
        --sk-text-base: 1rem;
        --sk-text-md: 1.075rem;
        --sk-text-lg: 1.125rem;
        --sk-text-xl: 1.25rem;
        --sk-text-2xl: 1.5rem;
        --sk-text-3xl: 2rem;
        --sk-text-4xl: 3rem;
    }`
)