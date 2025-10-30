# Mejores Prácticas para StandardJS y ECMAScript Moderno

> **Consistencia y calidad desde el inicio:**
>
> Este proyecto utiliza ECMAScript moderno (ES2015+), la guía de estilo StandardJS y configuraciones base para mantener el código limpio, legible y consistente en todos los archivos (JS, HTML, CSS).

## Guía de estilo aplicada

- **StandardJS:**
  - Indentación de 2 espacios
  - Comillas simples por defecto
  - Sin punto y coma (`;`)
  - Máximo 80 caracteres por línea
  - Espacios entre operadores y después de palabras clave
  - Nombres descriptivos y camelCase

- **ECMAScript:**
  - Uso de `const` y `let` en vez de `var`
  - Funciones flecha y métodos modernos
  - Template strings
  - Objetos y arrays literales
  - JSDoc para documentación de funciones y objetos

## Configuración base

### .editorconfig

```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
max_line_length = 80
quote_type = double

[*.js]
indent_style = space
indent_size = 2
max_line_length = 80
quote_type = double

[*.css]
indent_style = space
indent_size = 2
max_line_length = 80

[*.html]
indent_style = space
indent_size = 2
max_line_length = 80
```

### ESLint (StandardJS)

```json
{
  "root": true,
  "env": { "browser": true, "es2021": true },
  "extends": ["standard"],
  "rules": {
    "indent": ["error", 2],
    "quotes": ["error", "single"],
    "max-len": ["error", { "code": 80 }],
    "semi": ["error", "never"],
    "comma-dangle": ["error", "never"]
  }
}
```

### Prettier (shareable config)

```json
{
  "tabWidth": 2,
  "useTabs": false,
  "singleQuote": true,
  "printWidth": 80,
  "semi": false,
  "trailingComma": "none"
}
```

## Acciones y ajustes recientes

- Ahora se adopta el estándar de ECMAScript moderno (ES2015+): se hace uso de `const`, `let`, funciones flecha, template strings y JSDoc.
- Mejoré la documentación en `app.js` siguiendo JSDoc y StandardJS.
- Se definen los archivos `.editorconfig`, `.eslintrc.json` y `.prettierrc` para mantener la consistencia en todo el proyecto y mejorar la experiencia de codificación en el editor de VS Code.
- Se ajustó el CSS y HTML para cumplir con la indentación y formato estándar.
- Se documentó la integración y uso en VS Code para validar y formatear sin dependencias externas.
- Se recomienda mantener esta estructura y estilo en todos los archivos nuevos y existentes.
