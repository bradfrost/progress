module.exports = function(eleventyConfig) {
  // Copy static assets to output
  eleventyConfig.addPassthroughCopy("src/styles.css");
  eleventyConfig.addPassthroughCopy("src/script.js");
  eleventyConfig.addPassthroughCopy("src/bf-tokens.css");
  
  // Set default layout for markdown files
  eleventyConfig.addGlobalData("layout", "base.njk");
  
  // Configure markdown-it to use task-lists plugin for checkboxes
  eleventyConfig.amendLibrary("md", (mdLib) => {
    mdLib.use(require("markdown-it-task-lists"), { enabled: true });
  });
  
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes"
    }
  };
}; 