/**
 * @filename: lint-staged.config.mjs
 * @type {import('lint-staged').Configuration}
 */
const config = {
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write --ignore-unknown",
    // ⚠️  lint‑staged automatically appends the list of staged file paths to
    //     every task. When those paths reach `tsc`, the compiler receives
    //     explicit file arguments and therefore **ignores tsconfig.json** —
    //     see https://www.typescriptlang.org/docs/handbook/compiler-options.html#tsconfigjson-files-are-ignored-when-input-files-are-specified
    //     and https://github.com/okonet/lint-staged/issues/825 .
    //     Wrapping the script in `bash -c` prevents that filename injection,
    //     allowing `npm run typecheck` (aka `tsc --noEmit`) to run against the
    //     entire project and honour the project’s tsconfig.
    "bash -c 'npm run typecheck'",
  ],
  "!*.{js,jsx,ts,tsx}": ["prettier --write --ignore-unknown"],
};

export default config;
