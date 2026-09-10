const fs = require('fs');
const path = require('path');

const replacements = {
    'text-blue-600': 'text-emerald-600',
    'bg-blue-600': 'bg-emerald-600',
    'border-blue-600': 'border-emerald-600',
    'hover:bg-blue-600': 'hover:bg-emerald-600',
    'hover:text-blue-600': 'hover:text-emerald-600',
    'text-blue-700': 'text-emerald-700',
    'bg-blue-50': 'bg-emerald-50',
    'border-blue-200': 'border-emerald-200',
    'bg-blue-100': 'bg-emerald-100',
    'text-blue-800': 'text-emerald-800',
    'border-blue-300': 'border-emerald-300',
    'ring-blue-600': 'ring-emerald-600',
    'focus:border-blue-600': 'focus:border-emerald-600',
    'bg-blue-50/50': 'bg-emerald-50/50',
    'bg-blue-50/30': 'bg-emerald-50/30',
    'text-blue-500': 'text-emerald-500',
    '#2563eb': '#059669', // Emerald 600 for Recharts
};

function walk(dir, callback) {
    fs.readdir(dir, function(err, list) {
        if (err) return;
        list.forEach(function(file) {
            file = path.resolve(dir, file);
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, callback);
                } else {
                    if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
                        callback(file);
                    }
                }
            });
        });
    });
}

function processFile(file) {
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content;
    
    for (const [oldStr, newStr] of Object.entries(replacements)) {
        newContent = newContent.split(oldStr).join(newStr);
    }
    
    if (newContent !== content) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log(`Updated ${file}`);
    }
}

walk('server/resources/js', processFile);

// Update app.css
const appCssPath = 'server/resources/css/app.css';
if (fs.existsSync(appCssPath)) {
    let content = fs.readFileSync(appCssPath, 'utf8');
    
    content = content.replace('--primary: 240 5.9% 10%;', '--primary: 161 94% 30%;');
    content = content.replace('--ring: 240 10% 3.9%;', '--ring: 161 94% 30%;');
    
    content = content.replace('--sidebar-primary: 240 5.9% 10%;', '--sidebar-primary: 161 94% 30%;');
    content = content.replace('--sidebar-accent: 214 95% 93%;', '--sidebar-accent: 152 81% 96%;');
    content = content.replace('--sidebar-accent-foreground: 226 71% 40%;', '--sidebar-accent-foreground: 161 94% 30%;');
    content = content.replace('--sidebar-ring: 217.2 91.2% 59.8%;', '--sidebar-ring: 161 94% 30%;');
    
    fs.writeFileSync(appCssPath, content, 'utf8');
    console.log("Updated app.css");
}

