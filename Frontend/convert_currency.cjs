const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fp = path.join(dir, f);
        if (fs.statSync(fp).isDirectory()) {
            processDir(fp);
        } else if (fp.endsWith('.tsx') || fp.endsWith('.ts')) {
            let content = fs.readFileSync(fp, 'utf8');
            let original = content;

            // Replace generic values: $99.99 -> Rs 99.99
            content = content.replace(/\$([0-9.,]+)/g, 'Rs $1');

            // Replace in JSX attributes/expressions like: value={`$${money}`} -> value={`Rs ${money}`}
            // We use a safe string replace for the exact template literal patterns we know
            content = content.replace(/`\$(\$\{)/g, '`Rs $1');

            // Replace strings like >${value}< to >Rs ${value}<
            content = content.replace(/>\$([\$\{])/g, '>Rs $1');

            if (content !== original) {
                fs.writeFileSync(fp, content);
                console.log('Updated:', fp);
            }
        }
    }
}

processDir('src');
