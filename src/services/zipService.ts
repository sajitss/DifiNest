import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { WebApp } from '../types/app';

export class ZipService {
  /**
   * Export an app as a ZIP file containing index.html, styles.css, script.js and README.md
   */
  public static async exportAppAsZip(app: WebApp): Promise<void> {
    const zip = new JSZip();

    // Create index.html that references styles.css and script.js
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${app.name} - DifiNest</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
${app.html}

  <script src="script.js"></script>
</body>
</html>`;

    const readme = `# ${app.name}

${app.description || 'Application created with DifiNest'}

- **Author**: ${app.author}
- **Category**: ${app.category}
- **Tags**: ${app.tags.join(', ')}
- **Exported from DifiNest**: ${new Date().toLocaleDateString()}

## Usage
Simply double click \`index.html\` or open it in any web browser!
`;

    zip.file('index.html', fullHtml);
    zip.file('styles.css', app.css);
    zip.file('script.js', app.js);
    zip.file('README.md', readme);

    const content = await zip.generateAsync({ type: 'blob' });
    const filename = `${app.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-difinest.zip`;
    saveAs(content, filename);
  }

  /**
   * Export an app as a single self-contained standalone HTML file
   */
  public static exportAppAsSingleHtml(app: WebApp): void {
    const singleHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${app.name}</title>
  <style>
${app.css}
  </style>
</head>
<body>
${app.html}

  <script>
${app.js}
  </script>
</body>
</html>`;

    const blob = new Blob([singleHtml], { type: 'text/html;charset=utf-8' });
    const filename = `${app.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.html`;
    saveAs(blob, filename);
  }

  /**
   * Parse uploaded zip archive and extract HTML, CSS, JS strings
   */
  public static async parseUploadedZip(file: File): Promise<{ html: string; css: string; js: string; name?: string }> {
    const zip = await JSZip.loadAsync(file);
    let html = '';
    let css = '';
    let js = '';

    // Search for html file
    const htmlFile = zip.file(/index\.html$/i)[0] || zip.file(/\.html$/i)[0];
    if (htmlFile) {
      const rawHtml = await htmlFile.async('string');
      // If it contains <body> tag, extract inner body content
      const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) {
        html = bodyMatch[1].trim();
        // Remove script tags pointing to script.js if embedded
        html = html.replace(/<script[^>]*src=["'] script\.js["'][^>]*><\/script>/gi, '');
      } else {
        html = rawHtml;
      }
    }

    // Search for css file
    const cssFile = zip.file(/styles?\.css$/i)[0] || zip.file(/\.css$/i)[0];
    if (cssFile) {
      css = await cssFile.async('string');
    }

    // Search for js file
    const jsFile = zip.file(/script?s?\.js$/i)[0] || zip.file(/\.js$/i)[0];
    if (jsFile) {
      js = await jsFile.async('string');
    }

    const appName = file.name.replace(/\.zip$/i, '').replace(/[-_]/g, ' ');

    return { html, css, js, name: appName };
  }

  /**
   * Read multiple separate files (.html, .css, .js)
   */
  public static async readMultipleFiles(files: FileList | File[]): Promise<{ html: string; css: string; js: string; suggestedName?: string }> {
    let html = '';
    let css = '';
    let js = '';
    let suggestedName = '';

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const text = await file.text();

      if (file.name.endsWith('.html')) {
        suggestedName = file.name.replace(/\.html$/i, '').replace(/[-_]/g, ' ');
        const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        html = bodyMatch ? bodyMatch[1].trim() : text;
      } else if (file.name.endsWith('.css')) {
        css = text;
      } else if (file.name.endsWith('.js')) {
        js = text;
      }
    }

    return { html, css, js, suggestedName };
  }
}
