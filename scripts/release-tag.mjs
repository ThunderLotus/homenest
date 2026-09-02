import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf-8'))
const tag = `v${pkg.version}`

try {
  execSync(`git rev-parse -q --verify refs/tags/${tag}`, { stdio: 'ignore' })
  console.error(`\x1b[31mTag ${tag} already exists. Bump version in package.json first.\x1b[0m`)
  process.exit(1)
} catch {
  // tag doesn't exist, proceed
}

console.log(`Creating tag ${tag} from package.json version...`)
execSync(`git tag ${tag}`, { stdio: 'inherit' })
execSync(`git push origin ${tag}`, { stdio: 'inherit' })