import { test } from '@playwright/test';
import { existsSync, readFileSync } from 'fs';
import { JSDOM } from 'jsdom';
import path from 'path';
import { setupFonts } from './setupFonts';
import { setupImports } from './setupImports';

test.beforeEach(async ({ page }, { file }) => {
  await page.goto('/e2e/site');
  await setupImports(page);
  await setupFonts(page);
  // add test script
  const testDir = path.relative(
    path.resolve(process.cwd(), 'e2e', 'tests'),
    path.resolve(file, '..')
  );
  const pathToHTML = path.resolve(
    process.cwd(),
    'e2e',
    'tests',
    testDir,
    'index.html'
  );
  if (existsSync(pathToHTML)) {
    const doc = new JSDOM(readFileSync(pathToHTML).toString()).window.document;
    await page.evaluate((html) => {
      document.body.innerHTML = `${html}`;
    }, doc.body.innerHTML);
  }
  const pathToApp = path.resolve(
    process.cwd(),
    'e2e',
    'tests',
    testDir,
    'index.ts'
  );
  const pathToBuiltApp = path.resolve(
    process.cwd(),
    'e2e',
    'dist',
    testDir,
    'index.js'
  );
  const exists = existsSync(pathToBuiltApp);
  if (!exists && existsSync(pathToApp)) {
    throw new Error(
      `test script '${pathToBuiltApp}' not found: global setup script probably did not run`
    );
  } else if (exists) {
    // used to avoid a race condition that occurs because of script loading
    const trigger = page.evaluate(
      () =>
        new Promise((resolve) => {
          window.addEventListener('fabric:setup', resolve, { once: true });
        })
    );
    await page.addScriptTag({
      type: 'module',
      content: `${readFileSync(
        path.relative(process.cwd(), pathToBuiltApp)
      ).toString()}
       window.dispatchEvent(new CustomEvent('fabric:setup'));
       `,
    });
    await trigger;
    await page.evaluate(() => window.__setupFabricHook());
  }
});

test.afterEach(async ({ page }) => {
  await page.evaluate(() => window.__teardownFabricHook());
});
