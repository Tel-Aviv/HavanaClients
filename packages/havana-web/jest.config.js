module.exports = async () => {
    return {
      rootDir: 'src', 
      verbose: true,
      setupFiles: ["<rootDir>/setEnvVars.js"]
    };
  };