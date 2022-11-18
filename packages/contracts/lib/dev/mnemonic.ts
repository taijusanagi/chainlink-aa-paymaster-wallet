import fs from "fs";
import path from "path";

export const getMnemonic = () => {
  const dir = path.join(__dirname, "../../../../mnemonic.txt");
  let mnemonic = "test ".repeat(11) + "junk";
  if (fs.existsSync(dir)) {
    mnemonic = fs.readFileSync(dir, "ascii").trim();
  }
  return mnemonic;
};
