# 📸 TextSnap - Extractor de Texto de Imágenes (OCR)

Una aplicación web moderna, rápida y 100% privada para extraer texto de cualquier imagen directamente desde tu navegador. Ideal para agregar como proyecto funcional a tu portfolio web.

![GitHub Pages Compatible](https://img.shields.io/badge/GitHub%20Pages-Compatible-brightgreen?style=flat-square&logo=github)
![Tesseract.js](https://img.shields.io/badge/OCR-Tesseract.js%20v5-blue?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/UI-Tailwind%20CSS-38bdf8?style=flat-square&logo=tailwindcss)

---

## ✨ Características Principales

- 📋 **Pegado Directo (`Ctrl + V`)**: Captura una pantalla con `Print Screen` o `Win + Shift + S` y pégala instantáneamente en cualquier parte de la página.
- 📁 **Arrastrar y Soltar (Drag & Drop)**: Arrastra imágenes PNG, JPG, WEBP o BMP.
- 🔒 **100% Privado y Local**: El reconocimiento óptico de caracteres (OCR) se ejecuta enteramente en el navegador con WebAssembly y Web Workers. Tus imágenes nunca se envían a ningún servidor backend.
- 🌐 **Soporte Multi-idioma**: Reconocimiento en Español, Inglés o modo combinado (Español + Inglés).
- 📊 **Progreso en Tiempo Real**: Barra de porcentaje y estado detallado durante el procesamiento del modelo OCR.
- 📝 **Herramientas de Exportación**: Botón rápido para copiar al portapapeles, descargar en archivo `.txt`, métricas de caracteres/palabras y visor de imagen previsualizada.

---

## 🚀 Cómo Subir este Proyecto a GitHub Pages

Subir esta página a **GitHub Pages** es sumamente sencillo porque **no requiere proceso de compilación** (sin node_modules ni `npm run build`).

### Paso 1: Crear un nuevo repositorio en GitHub
1. Ve a [GitHub](https://github.com/new) e inicia sesión.
2. Crea un repositorio público nuevo con el nombre que prefieras (por ejemplo: `image-text-extractor` o `text-snap`).
3. No es necesario marcar "Add a README file" si vas a subir estos archivos.

### Paso 2: Subir los archivos a tu repositorio
Abre tu terminal en la carpeta de este proyecto y ejecuta:

```bash
git init
git add .
git commit -m "Initial commit: TextSnap OCR Web App"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

*(Reemplaza `TU_USUARIO` y `TU_REPOSITORIO` por tus datos de GitHub)*.

### Paso 3: Activar GitHub Pages
1. En GitHub, ve a la pestaña **Settings** (Configuración) de tu repositorio.
2. En el menú lateral izquierdo, selecciona **Pages**.
3. En la sección **Build and deployment** -> **Branch**:
   - Selecciona `main` (o `master`).
   - Deja la carpeta en `/ (root)`.
   - Haz clic en **Save**.
4. ¡Listo! En 1-2 minutos GitHub te dará un enlace público con tu sitio funcionando (ejemplo: `https://tu-usuario.github.io/tu-repositorio/`).

---

## 🛠️ Tecnologías Utilizadas

- **HTML5 / CSS3 / JavaScript (ES6+)**
- **[Tesseract.js](https://tesseract.projectnaptha.com/)**: Motor OCR de código abierto portado a JavaScript via WebAssembly.
- **[Tailwind CSS](https://tailwindcss.com/)**: Framework CSS de utilidad rápida.
- **[FontAwesome Icons](https://fontawesome.com/)**: Iconografía de la interfaz.

---

## 📄 Licencia

Este proyecto es de uso libre para incluir en tu portfolio personal o adaptar comercialmente.
