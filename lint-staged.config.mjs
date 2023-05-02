const config = {
  /**
   *
   * @param {string[]} files
   * @returns string[] | string | Promise<string> | Promise<string[]>
   */
  '*': (files) => [
    `prettier -l ${files.join(' ')}`,
    `cspell --gitignore ${files
      .map((f) => `"${f.replace(/\[/g, '\\[').replace(/\]/g, '\\]')}"`)
      .join(' ')}`,
  ],
  '*.(ts|tsx|js|jsx)': 'eslint',
};

export default config;
