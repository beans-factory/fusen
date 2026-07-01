export interface AppSettings {
  editor: {
    fontSize:            number
    fontFamily:          string
    tabSize:             number
    wordWrap:            'on' | 'off'
    minimap:             boolean
    lineNumbers:         'on' | 'off' | 'relative'
    smoothScrolling:     boolean
    cursorBlinking:      'blink' | 'smooth' | 'phase' | 'expand' | 'solid'
    renderLineHighlight: 'none' | 'gutter' | 'line' | 'all'
    lineHeight:          number
    fontLigatures:          boolean
    stickyScroll:           boolean
    mouseWheelZoom:         boolean
    renderWhitespace:       'none' | 'boundary' | 'selection' | 'trailing' | 'all'
    trimAutoWhitespace:     boolean
    insertSpaces:           boolean
    autoClosingBrackets:    'always' | 'languageDefined' | 'beforeWhitespace' | 'never'
    autoClosingQuotes:      'always' | 'languageDefined' | 'beforeWhitespace' | 'never'
    autoSurround:           'languageDefined' | 'quotes' | 'brackets' | 'never'
    matchBrackets:          'never' | 'near' | 'always'
    bracketPairColorization: boolean
    guides:                 boolean
  }
  ui: {
    theme:              'dark' | 'light'
    statusBarColor:     string
    language:           'en' | 'ja' | 'fr' | 'de' | 'hi' | 'zh' | 'ko'
    defaultShowPreview: boolean
  }
}

export const DEFAULT_SETTINGS: AppSettings = {
  editor: {
    fontSize:            14,
    fontFamily:          "'Fira Code', 'Cascadia Code', Consolas, Menlo, monospace",
    tabSize:             2,
    wordWrap:            'on',
    minimap:             true,
    lineNumbers:         'on',
    smoothScrolling:     true,
    cursorBlinking:      'smooth',
    renderLineHighlight: 'line',
    lineHeight:          0,
    fontLigatures:           true,
    stickyScroll:            true,
    mouseWheelZoom:          false,
    renderWhitespace:        'none',
    trimAutoWhitespace:      true,
    insertSpaces:            true,
    autoClosingBrackets:     'languageDefined',
    autoClosingQuotes:       'languageDefined',
    autoSurround:            'languageDefined',
    matchBrackets:           'always',
    bracketPairColorization: false,
    guides:                  true,
  },
  ui: {
    theme:              'dark',
    statusBarColor:     '#f5c842',
    language:           'en',
    defaultShowPreview: false,
  },
}
