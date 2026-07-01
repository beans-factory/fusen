export interface Translations {
  editor: {
    shortcutNewNote: string
    renameHint:      string
    editTags:        string
    noTags:          string
  }
  settings: { title: string; badge: string; reset: string; close: string }
  statusBar: { notes: string; tags: string; saving: string; saved: string; logout: string }
  login:    { subtitle: string; placeholder: string; submit: string; error: string }
  board: {
    newMemo:    string
    search:     string
    all:        string
    noTags:     string
    tagName:    string
    create:     string
    save:       string
    delete:     string
    cancel:     string
    custom:     string
    deleteTitle: string
    deleteUndo:  string
    noResults:   string
  }
  commands: {
    placeholder:  string
    newMemo:      string
    showPreview:  string
    hidePreview:  string
    settings:     string
    export:       string
    exportTitle:  string
    exportOk:     string
    lightTheme:   string
    darkTheme:    string
  }
}

export const en: Translations = {
  editor: {
    shortcutNewNote: 'New Memo',
    renameHint:      'Click to rename',
    editTags:        'Edit tags',
    noTags:          'No tags yet',
  },
  settings: {
    title: 'Settings',
    badge: 'settings.json',
    reset: 'Reset',
    close: 'Close',
  },
  statusBar: {
    notes:   'memos',
    tags:    'tags',
    saving:  'Saving...',
    saved:   'Saved',
    logout:  'Logout',
  },
  login: {
    subtitle:    'Enter your access key',
    placeholder: 'Access key',
    submit:      'Login',
    error:       'Invalid key',
  },
  board: {
    newMemo:     'New Memo',
    search:      'Search memos…',
    all:         'All',
    noTags:      'No tags yet',
    tagName:     'Tag name',
    create:      'Create',
    save:        'Save',
    delete:      'Delete',
    cancel:      'Cancel',
    custom:      'Custom…',
    deleteTitle: 'Delete memo',
    deleteUndo:  'This action cannot be undone.',
    noResults:   'No memos matching',
  },
  commands: {
    placeholder:  'Run a command…',
    newMemo:      'New Memo',
    showPreview:  'Show Preview',
    hidePreview:  'Hide Preview',
    settings:     'Open Settings',
    export:       'Export All as ZIP',
    exportTitle:  'ZIP Export',
    exportOk:     'Export',
    lightTheme:   'Switch to Light Theme',
    darkTheme:    'Switch to Dark Theme',
  },
}
