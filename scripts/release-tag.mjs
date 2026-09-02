import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import process from 'node:process'

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf-8'))
const tag = `v${pkg.version}`

try {
  execSync(`git rev-parse -q --verify refs/tags/${tag}`, { stdio: 'ignore' })
  console.error(`\x1B[31mTag ${tag} already exists. Bump version in package.json first.\x1B[0m`)
  process.exit(1)
} catch {
  // tag doesn't exist, proceed
}

console.log(`Creating tag ${tag} from package.json version...`)
execSync(`git tag -a -m "Release ${tag}" ${tag}`, { stdio: 'inherit' })
execSync(`git push origin ${tag}`, { stdio: 'inherit' })
