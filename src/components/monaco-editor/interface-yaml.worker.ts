import {
    type CodeAction,
    type CompletionList,
    type Diagnostic,
    type DocumentLink,
    type DocumentSymbol,
    type Hover,
    type LocationLink,
    type Position,
    type Range,
    type TextEdit
} from 'vscode-languageserver-types'

import {
    type CustomFormatterOptions,
} from 'yaml-language-server/lib/esm/languageservice/yamlLanguageService.js'

export interface YAMLWorker {
    doValidation: (uri: string) => Diagnostic[] | undefined

    doComplete: (uri: string, position: Position) => CompletionList | undefined

    doDefinition: (uri: string, position: Position) => LocationLink[] | undefined

    doHover: (uri: string, position: Position) => Hover | null | undefined

    format: (uri: string, options: CustomFormatterOptions) => TextEdit[] | undefined

    resetSchema: (uri: string) => boolean | undefined

    findDocumentSymbols: (uri: string) => DocumentSymbol[] | undefined

    findLinks: (uri: string) => DocumentLink[] | undefined

    getCodeAction: (uri: string, range: Range, diagnostics: Diagnostic[]) => CodeAction[] | undefined
}

