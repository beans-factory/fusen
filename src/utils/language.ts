const EXT_TO_LANG: Record<string, string> = {
  // Web
  ts: 'typescript', tsx: 'typescript',
  js: 'javascript', jsx: 'javascript',
  html: 'html', htm: 'html',
  css: 'css', scss: 'scss', less: 'less',
  // Data
  json: 'json', jsonc: 'json',
  yaml: 'yaml', yml: 'yaml',
  toml: 'ini',
  xml: 'xml',
  csv: 'plaintext',
  // Backend
  py: 'python',
  rb: 'ruby',
  go: 'go',
  rs: 'rust',
  java: 'java',
  kt: 'kotlin',
  swift: 'swift',
  c: 'c', h: 'c',
  cpp: 'cpp', cc: 'cpp', cxx: 'cpp',
  cs: 'csharp',
  php: 'php',
  // Shell / config
  sh: 'shell', bash: 'shell', zsh: 'shell',
  ps1: 'powershell',
  dockerfile: 'dockerfile',
  // DB
  sql: 'sql',
  // Docs
  md: 'markdown', mdx: 'markdown',
  txt: 'plaintext',
}

export function detectLanguage(title: string): string {
  const dot = title.lastIndexOf('.')
  if (dot === -1) return 'plaintext'
  const ext = title.slice(dot + 1).toLowerCase()
  return EXT_TO_LANG[ext] ?? 'plaintext'
}
