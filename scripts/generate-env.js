const fs = require('fs');
const path = require('path');

const appRoot = path.resolve(__dirname, '..');
const envPath = path.join(appRoot, '.env');
const outputPath = path.join(appRoot, 'src', 'config', 'env.generated.ts');

function parseEnv(content) {
  return content.split(/\r?\n/).reduce((env, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return env;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex < 0) {
      return env;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
    env[key] = value;
    return env;
  }, {});
}

const env = fs.existsSync(envPath) ? parseEnv(fs.readFileSync(envPath, 'utf8')) : {};
const javascriptKey = env.KAKAO_JAVASCRIPT_KEY || '';

fs.mkdirSync(path.dirname(outputPath), {recursive: true});
fs.writeFileSync(
  outputPath,
  `export const KAKAO_JAVASCRIPT_KEY = ${JSON.stringify(javascriptKey)};\n`,
);
