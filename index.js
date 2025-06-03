const fs = require("fs");
const path = require("path");
const kuromoji = require("kuromoji");

// Path to subtitle file

const filePath = path.join(
  __dirname,
  "subtitles",
  "Mob Psycho 100 II.S01E01.ja (1).srt"
);

// Read the subtitle file
fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  // Clean up subtitles: remove timestamps and formatting
  const lines = data
    .split("\n")
    .filter(
      (line) =>
        !line.match(/^\d+$|^(\d{2}:){2}\d{2},\d{3}/) && line.trim() !== ""
    );

  const text = lines.join("\n");

  // Build the tokenizer
  kuromoji
    .builder({ dicPath: "node_modules/kuromoji/dict" })
    .build((err, tokenizer) => {
      if (err) throw err;
      const tokens = tokenizer.tokenize(text);
      const frequencyMap = {};
      const excludedPos = ["助詞", "助動詞", "記号"];

      tokens.forEach((token) => {
        const base =
          token.basic_form === "*" ? token.surface_form : token.basic_form;

        // Skip punctuation, whitespace, brackets, etc.
        if (token.pos === "記号") return;

        if (!excludedPos.includes(token.pos)) {
          frequencyMap[base] = (frequencyMap[base] || 0) + 1;
        }
      });

      // Sort by frequency
      const sorted = Object.entries(frequencyMap)
        .sort((a, b) => b[1] - a[1])
        .slice(100, 200); // Top 100 words

      console.log("Top words:\n");
      sorted.forEach(([word, count]) => {
        console.log(`${word}: ${count}`);
      });
    });
});
