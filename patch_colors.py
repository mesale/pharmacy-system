import os
import glob

replacements = {
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
    '#2563eb': '#059669', # Emerald 600 for Recharts
}

directories = [
    'server/resources/js/Pages/**/*.tsx',
    'server/resources/js/Pages/**/*.jsx',
    'server/resources/js/Layouts/**/*.tsx',
    'server/resources/js/Layouts/**/*.jsx',
    'server/resources/js/components/**/*.tsx',
    'server/resources/js/components/**/*.jsx',
]

for directory in directories:
    for filepath in glob.glob(directory, recursive=True):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = content
        for old, new in replacements.items():
            new_content = new_content.replace(old, new)
            
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filepath}")

# Update app.css
app_css_path = 'server/resources/css/app.css'
if os.path.exists(app_css_path):
    with open(app_css_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace default primary with emerald-600 (HSL: 161 94% 30%)
    content = content.replace('--primary: 240 5.9% 10%;', '--primary: 161 94% 30%;')
    content = content.replace('--ring: 240 10% 3.9%;', '--ring: 161 94% 30%;')
    
    # Sidebar colors (Emerald Theme)
    content = content.replace('--sidebar-primary: 240 5.9% 10%;', '--sidebar-primary: 161 94% 30%;')
    content = content.replace('--sidebar-accent: 214 95% 93%;', '--sidebar-accent: 152 81% 96%;') # Emerald 50
    content = content.replace('--sidebar-accent-foreground: 226 71% 40%;', '--sidebar-accent-foreground: 161 94% 30%;') # Emerald 600
    content = content.replace('--sidebar-ring: 217.2 91.2% 59.8%;', '--sidebar-ring: 161 94% 30%;')
    
    with open(app_css_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated app.css")

