/**
 * TextSnap - Extractor de Texto & Código (OCR v2)
 * Soporte para Recorte Interactivo (Cropper.js), OCR.space Engine 2 & Tesseract.js
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias DOM ---
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const dropzoneEmpty = document.getElementById('dropzoneEmpty');
    const cropperContainer = document.getElementById('cropperContainer');
    const cropperImage = document.getElementById('cropperImage');
    const cropperToolbar = document.getElementById('cropperToolbar');

    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const resetCropBtn = document.getElementById('resetCropBtn');
    const changeImageBtn = document.getElementById('changeImageBtn');

    const engineSelect = document.getElementById('engineSelect');
    const languageSelect = document.getElementById('languageSelect');
    const processBtn = document.getElementById('processBtn');

    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressStatus = document.getElementById('progressStatus');
    const progressPercent = document.getElementById('progressPercent');

    const outputText = document.getElementById('outputText');
    const outputEmpty = document.getElementById('outputEmpty');
    const charCount = document.getElementById('charCount');
    const wordCount = document.getElementById('wordCount');

    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const clearBtn = document.getElementById('clearBtn');

    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');

    // --- Estado de la Aplicación ---
    let cropper = null;
    let selectedImageFile = null;
    let isProcessing = false;

    // --- Inicialización del Cropper.js ---
    function initCropper(imageSrc) {
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }

        cropperImage.src = imageSrc;
        dropzoneEmpty.classList.add('hidden');
        cropperContainer.classList.remove('hidden');
        cropperToolbar.classList.remove('hidden');
        cropperToolbar.classList.add('flex');

        cropper = new Cropper(cropperImage, {
            viewMode: 1,
            autoCropArea: 0.95,
            responsive: true,
            restore: false,
            guides: true,
            center: true,
            highlight: false,
            cropBoxMovable: true,
            cropBoxResizable: true,
            toggleDragModeOnDblclick: false,
            ready() {
                processBtn.disabled = false;
            }
        });
    }

    function resetImage() {
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }

        selectedImageFile = null;
        cropperImage.src = '';
        cropperContainer.classList.add('hidden');
        cropperToolbar.classList.add('hidden');
        cropperToolbar.classList.remove('flex');
        dropzoneEmpty.classList.remove('hidden');
        fileInput.value = '';
        processBtn.disabled = true;
    }

    function handleFile(file) {
        if (!file || !file.type.startsWith('image/')) {
            showToast('Por favor selecciona un archivo de imagen válido', 'error');
            return;
        }

        selectedImageFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            initCropper(e.target.result);
            showToast('Imagen cargada. Ajusta el recuadro sobre el texto a extraer', 'success');
        };
        reader.readAsDataURL(file);
    }

    // --- Eventos de Carga (FileInput & Click) ---
    dropzoneEmpty.addEventListener('click', () => {
        if (!isProcessing) fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    changeImageBtn.addEventListener('click', resetImage);

    // Zoom & Crop Controls
    zoomInBtn.addEventListener('click', () => cropper && cropper.zoom(0.1));
    zoomOutBtn.addEventListener('click', () => cropper && cropper.zoom(-0.1));
    resetCropBtn.addEventListener('click', () => cropper && cropper.reset());

    // --- Evento Pegado Global (Ctrl + V) ---
    window.addEventListener('paste', (e) => {
        if (isProcessing) return;

        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (const item of items) {
            if (item.type.indexOf('image') === 0) {
                const file = item.getAsFile();
                handleFile(file);
                showToast('¡Imagen pegada desde el portapapeles!', 'success');
                break;
            }
        }
    });

    // --- Eventos Drag & Drop ---
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    dropzone.addEventListener('drop', (e) => {
        if (isProcessing) return;
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    });

    // --- Lógica de Extracción de OCR ---
    processBtn.addEventListener('click', async () => {
        if (!cropper || isProcessing) return;

        isProcessing = true;
        processBtn.disabled = true;
        progressContainer.classList.remove('hidden');
        progressContainer.classList.add('flex');
        updateProgress('Obteniendo recorte recortado de alta resolución...', 20);

        try {
            // Obtener Canvas del recorte en alta resolución
            const croppedCanvas = cropper.getCroppedCanvas({
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high',
            });

            if (!croppedCanvas) {
                throw new Error('No se pudo generar la imagen del recorte');
            }

            const engine = engineSelect.value;
            const lang = languageSelect.value;

            let extractedText = '';

            if (engine === 'ocrspace') {
                updateProgress('Enviando a Motor OCR.space (Engine 2 para Código/Símbolos)...', 50);
                extractedText = await processWithOCRSpace(croppedCanvas, lang);
            } else {
                updateProgress('Procesando localmente con Tesseract.js...', 50);
                extractedText = await processWithTesseract(croppedCanvas, lang);
            }

            // Limpieza básica de cursores parpadeantes al final de capturas
            if (extractedText.endsWith('|')) {
                extractedText = extractedText.slice(0, -1).trim();
            }

            displayResult(extractedText);
            showToast('¡Texto extraído con éxito!', 'success');

        } catch (error) {
            console.error('Error OCR:', error);
            showToast(`Error: ${error.message || 'No se pudo extraer el texto'}`, 'error');
            updateProgress('Error en el proceso', 0);
        } finally {
            isProcessing = false;
            processBtn.disabled = !cropper;
            progressContainer.classList.add('hidden');
            progressContainer.classList.remove('flex');
        }
    });

    // --- Motor 1: OCR.space API (Engine 2 para código, símbolos y capturas) ---
    async function processWithOCRSpace(canvas, lang) {
        return new Promise((resolve, reject) => {
            canvas.toBlob(async (blob) => {
                try {
                    const formData = new FormData();
                    formData.append('file', blob, 'screenshot.png');
                    formData.append('language', lang === 'spa' ? 'spa' : 'eng');
                    formData.append('OCREngine', '2'); // Engine 2 es específico para capturas, números y símbolos
                    formData.append('isTable', 'false');
                    formData.append('scale', 'true');

                    const response = await fetch('https://api.ocr.space/parse/image', {
                        method: 'POST',
                        headers: {
                            'apikey': 'helloworld' // API Key pública/gratuita por defecto
                        },
                        body: formData
                    });

                    if (!response.ok) {
                        throw new Error(`Respuesta HTTP ${response.status}`);
                    }

                    const json = await response.json();

                    if (json.IsErroredOnProcessing) {
                        const errMsg = json.ErrorMessage ? json.ErrorMessage.join(', ') : 'Error en OCR.space';
                        throw new Error(errMsg);
                    }

                    if (json.ParsedResults && json.ParsedResults.length > 0) {
                        resolve(json.ParsedResults[0].ParsedText.trim());
                    } else {
                        resolve('');
                    }
                } catch (err) {
                    reject(err);
                }
            }, 'image/png');
        });
    }

    // --- Motor 2: Tesseract.js (Offline Local Engine) ---
    async function processWithTesseract(canvas, lang) {
        const dataUrl = canvas.toDataURL('image/png');
        const worker = await Tesseract.createWorker(lang, 1, {
            logger: m => handleTesseractProgress(m)
        });

        await worker.setParameters({
            tessedit_pageseg_mode: '7', // Single line mode
            preserve_interword_spaces: '1',
            load_system_dawg: '0',
            load_freq_dawg: '0',
            load_punc_dawg: '0',
        });

        const result = await worker.recognize(dataUrl);
        await worker.terminate();
        return result.data.text.trim();
    }

    function handleTesseractProgress(m) {
        if (!m || !m.status) return;
        let pct = Math.round((m.progress || 0) * 100);
        updateProgress(`Motor Local Tesseract: ${m.status}...`, pct);
    }

    function updateProgress(status, percent) {
        progressStatus.querySelector('span:last-child').textContent = status;
        progressPercent.textContent = `${percent}%`;
        progressBar.style.width = `${percent}%`;
    }

    // --- Resultado & Métricas ---
    function displayResult(text) {
        outputText.value = text;
        
        if (text.length > 0) {
            outputEmpty.classList.add('hidden');
            copyBtn.disabled = false;
            downloadBtn.disabled = false;
        } else {
            outputEmpty.classList.remove('hidden');
            copyBtn.disabled = true;
            downloadBtn.disabled = true;
            showToast('No se detectó texto en el área seleccionada', 'info');
        }

        const chars = text.length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        charCount.textContent = `${chars} caracteres`;
        wordCount.textContent = `${words} palabras`;
    }

    // --- Acciones de Usuario ---
    copyBtn.addEventListener('click', async () => {
        const text = outputText.value;
        if (!text) return;

        try {
            await navigator.clipboard.writeText(text);
            showToast('Texto copiado al portapapeles', 'success');
        } catch (err) {
            outputText.select();
            document.execCommand('copy');
            showToast('Texto copiado al portapapeles', 'success');
        }
    });

    downloadBtn.addEventListener('click', () => {
        const text = outputText.value;
        if (!text) return;

        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `texto-extraido-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Archivo .txt descargado', 'success');
    });

    clearBtn.addEventListener('click', () => {
        resetImage();
        outputText.value = '';
        outputEmpty.classList.remove('hidden');
        copyBtn.disabled = true;
        downloadBtn.disabled = true;
        charCount.textContent = '0 caracteres';
        wordCount.textContent = '0 palabras';
        showToast('Datos limpiados', 'info');
    });

    // --- Toast Notifications ---
    let toastTimeout = null;
    function showToast(message, type = 'success') {
        clearTimeout(toastTimeout);

        toastMessage.textContent = message;

        if (type === 'success') {
            toastIcon.className = 'fa-solid fa-circle-check text-emerald-400 text-lg';
        } else if (type === 'error') {
            toastIcon.className = 'fa-solid fa-circle-exclamation text-rose-400 text-lg';
        } else if (type === 'info') {
            toastIcon.className = 'fa-solid fa-circle-info text-blue-400 text-lg';
        }

        toast.classList.remove('translate-y-20', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');

        toastTimeout = setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('translate-y-20', 'opacity-0');
        }, 3200);
    }
});
