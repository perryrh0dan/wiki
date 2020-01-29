module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    project: 'tsconfig.json',
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  globals: {
    angular: true
  },
  rules: {
    semi: ["error", "always"],
    quotes: ["error", "single"],
    // require trailing commas in multiline object literals
    "comma-dangle": ["error", {
      arrays: "always-multiline",
      objects: "always-multiline",
      imports: "always-multiline",
      exports: "always-multiline",
      functions: "always-multiline",
    }],
    'no-dupe-class-members': 'off',
    '@typescript-eslint/explicit-member-accessibility': ['error'],
    '@typescript-eslint/explicit-function-return-type': ['error'],
    '@typescript-eslint/naming-convention': ['error', {
      selector: 'default',
      format: ['camelCase', 'PascalCase'],
      },
    ],
    '@typescript-eslint/no-explicit-any': ['warn'],
    '@typescript-eslint/typedef': ['error', {
        arrowParameter: false,
        variableDeclaration: false,
        'call-signature': true,
        'property-declaration': true,
        memberVariableDeclaration: false,
        'no-inferrable-types': true,
      },
    ],
  }
}
