module.exports = async () => {
    return {
      rootDir: 'src', 
      verbose: true,
      setupFiles: ["<rootDir>/__tests__/setEnvVars.js"]
    };
  };