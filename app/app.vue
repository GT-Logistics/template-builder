<template>
  <div class="flex flex-col h-screen p-4 bg-gray-50 relative">
    <div class="flex justify-between items-center mb-4 bg-white p-4 rounded shadow-sm border border-gray-200">
      <h1 class="text-2xl font-bold text-gray-800">Editor de Plantillas Pro</h1>
      <div class="flex gap-3">
        <button @click="abrirModalImportar" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
          Importar Código
        </button>
        <button @click="imprimirPlantilla" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition">
          Vista Previa
        </button>
        <button @click="abrirModalNombreArchivo" class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-bold shadow-md transition">
          Exportar
        </button>
      </div>
    </div>

    <div class="flex-1 bg-white rounded shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      <Editor
        id="editor"
        v-model="contenidoHtml"
        license-key="gpl"
        :init="tinymceConfigs"
        @init="onEditorInit"
      />
    </div>

    <div v-if="mostrarModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div class="bg-white p-6 rounded-xl shadow-2xl border border-gray-200" :class="tipoModal === 'importar' ? 'w-[600px]' : 'w-96'">
        <h3 class="text-lg font-bold mb-2 text-gray-800">{{ modalTitulo }}</h3>
        <p class="text-sm text-gray-500 mb-4">{{ modalSubtitulo }}</p>
        
        <input 
          v-if="tipoModal !== 'importar'"
          v-model="inputValor" 
          @keyup.enter="confirmarAccionModal"
          ref="inputRef"
          type="text" 
          :placeholder="modalPlaceholder" 
          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none mb-6 text-black"
        />

        <textarea
          v-else
          v-model="inputValor"
          ref="inputRef"
          placeholder="Pega aquí todo el código HTML..."
          class="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none mb-6 text-black"
        ></textarea>

        <div class="flex justify-end gap-3">
          <button @click="cerrarModal" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
          <button @click="confirmarAccionModal" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Confirmar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, nextTick } from 'vue';
  import type { RawEditorOptions } from 'tinymce';
  import Editor from '@tinymce/tinymce-vue';

  const contenidoHtml = ref('<p>¿Qué estás pensando?...</p>');
  const estilosImportados = ref(''); 
  const mostrarModal = ref(false);
  const inputValor = ref('');
  const inputRef = ref<HTMLInputElement | HTMLTextAreaElement | null>(null);
  let editorRef: any = null;

  const modalTitulo = ref('');
  const modalSubtitulo = ref('');
  const modalPlaceholder = ref('');
  const tipoModal = ref<'variable' | 'archivo' | 'importar' | 'bucle' | 'condicion'>('variable');

  const onEditorInit = (evt: any) => { editorRef = evt.target; };
  const cerrarModal = () => { mostrarModal.value = false; };

  // MODALES (TAL CUAL LOS TENÍAS)
  const abrirModalVariable = () => {
    tipoModal.value = 'variable';
    modalTitulo.value = 'Insertar Variable';
    modalSubtitulo.value = 'Nombre del campo en Quickbase:';
    modalPlaceholder.value = 'ej: nombre_cliente';
    inputValor.value = '';
    mostrarModal.value = true;
    nextTick(() => inputRef.value?.focus());
  };

  const abrirModalBucle = () => {
    tipoModal.value = 'bucle';
    modalTitulo.value = 'Insertar Bucle (For)';
    modalSubtitulo.value = 'Variable a procesar (ej: acciones):';
    modalPlaceholder.value = 'acciones';
    inputValor.value = '';
    mostrarModal.value = true;
    nextTick(() => inputRef.value?.focus());
  };

  const abrirModalCondicion = () => {
    tipoModal.value = 'condicion';
    modalTitulo.value = 'Insertar Condición (If)';
    modalSubtitulo.value = 'Condición lógica (ej: total > 0):';
    modalPlaceholder.value = 'total > 0';
    inputValor.value = '';
    mostrarModal.value = true;
    nextTick(() => inputRef.value?.focus());
  };

  const abrirModalNombreArchivo = () => {
    tipoModal.value = 'archivo';
    modalTitulo.value = 'Exportar Plantilla';
    modalSubtitulo.value = 'Nombre del archivo:';
    inputValor.value = 'plantilla_quickbase'; 
    mostrarModal.value = true;
    nextTick(() => inputRef.value?.focus());
  };

  const abrirModalImportar = () => {
    tipoModal.value = 'importar';
    modalTitulo.value = 'Importar Código Fuente';
    modalSubtitulo.value = 'Se detectarán variables y lógica automáticamente.';
    inputValor.value = '';
    mostrarModal.value = true;
    nextTick(() => inputRef.value?.focus());
  };

  const confirmarAccionModal = () => {
    const valor = inputValor.value.trim();
    if (!valor) return;

    if (tipoModal.value === 'variable') {
      editorRef?.insertContent(`<span class="variable-badge mceNonEditable" data-varname="${valor}">${valor}</span>&nbsp;`);
    } 
    else if (tipoModal.value === 'bucle') {
      // Ajuste para insertar en tabla o fuera
      const dentroDeTabla = editorRef.dom.getParent(editorRef.selection.getStart(), 'table');
      const startTag = `<% ${valor}.forEach((item, index) => { %>`;
      if (dentroDeTabla) {
        editorRef?.insertContent(`<tbody class="logic-block bucle" data-ejs-start="${startTag.replace(/"/g, '&quot;')}"><tr class="mceNonEditable"><td colspan="100%" class="logic-header">FOR: ${valor}</td></tr><tr><td colspan="100%">Contenido...</td></tr><tr class="mceNonEditable"><td colspan="100%" class="logic-footer">FIN FOR</td></tr></tbody>`);
      } else {
        editorRef?.insertContent(`<div class="logic-block bucle" data-ejs-start="${startTag.replace(/"/g, '&quot;')}"><div class="logic-header mceNonEditable">FOR: ${valor}</div><div class="logic-content"><p>Contenido del bucle...</p></div><div class="logic-footer mceNonEditable">FIN FOR</div></div><p>&nbsp;</p>`);
      }
    }
    else if (tipoModal.value === 'condicion') {
      const dentroDeTabla = editorRef.dom.getParent(editorRef.selection.getStart(), 'table');
      const startTag = `<% if (${valor}) { %>`;
      if (dentroDeTabla) {
        editorRef?.insertContent(`<tbody class="logic-block condicion" data-ejs-start="${startTag.replace(/"/g, '&quot;')}"><tr class="mceNonEditable"><td colspan="100%" class="logic-header">IF: ${valor}</td></tr><tr><td colspan="100%">Contenido...</td></tr><tr class="mceNonEditable"><td colspan="100%" class="logic-footer">FIN IF</td></tr></tbody>`);
      } else {
        editorRef?.insertContent(`<div class="logic-block condicion" data-ejs-start="${startTag.replace(/"/g, '&quot;')}"><div class="logic-header mceNonEditable">IF: ${valor}</div><div class="logic-content"><p>Contenido condicional...</p></div><div class="logic-footer mceNonEditable">FIN IF</div></div><p>&nbsp;</p>`);
      }
    }
    else if (tipoModal.value === 'importar') {
      procesarCodigoImportado(valor);
    } 
    else {
      ejecutarExportacion(valor);
    }
    cerrarModal();
  };

  const procesarCodigoImportado = (codigo: string) => {
    const decoder = document.createElement('textarea');
    decoder.innerHTML = codigo;
    let codigoLimpio = decoder.value;

    const styleMatch = codigoLimpio.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    let estilosCapturados = "";
    if (styleMatch) {
        estilosCapturados = styleMatch.map(s => s.replace(/<\/?style[^>]*>/gi, '')).join('\n');
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(codigoLimpio, 'text/html');
    const scriptTemplate = doc.getElementById('report_card') || 
                           doc.getElementById('preinvoice') || 
                           doc.querySelector('script[type="application/x-ejs"]');

    if (scriptTemplate && scriptTemplate.getAttribute('style')) {
        estilosCapturados += `\nbody { ${scriptTemplate.getAttribute('style')} }`;
    }
    estilosImportados.value = estilosCapturados;

    let extraido = scriptTemplate ? scriptTemplate.innerHTML : (doc.body ? doc.body.innerHTML : codigoLimpio);

    // 1. PROCESAR VARIABLES
    let htmlProcesado = extraido.replace(/<%=\s*([\s\S]*?)\s*%>/g, (match, p1) => {
        return `<span class="variable-badge mceNonEditable" data-varname="${p1.trim()}">${p1.trim()}</span>`;
    });

    // 2. PROCESAR LÓGICA CON DETECCIÓN DE TABLAS (CORREGIDO)
    const partes = htmlProcesado.split(/(<%.*?%>)/g);
    let resultado = "";
    let stackLogica: string[] = [];

    partes.forEach((parte, index) => {
        if (parte.startsWith('<%') && parte.endsWith('%>')) {
            const logic = parte.replace(/<%\s*|\s*%>/g, '').trim();
            const textoPrevio = partes.slice(0, index).join('');
            const dentroDeTabla = textoPrevio.lastIndexOf('<table') > textoPrevio.lastIndexOf('</table');

            if (logic.includes('}') && !logic.includes('{')) {
                const tag = stackLogica.pop() || 'div';
                if (tag === 'tbody') {
                    resultado += `<tr class="mceNonEditable"><td colspan="100%" class="logic-footer">FIN BLOQUE</td></tr></tbody>`;
                } else {
                    resultado += `</div><div class="logic-footer mceNonEditable">FIN BLOQUE</div></div>`;
                }
            } else if (logic.includes('{')) {
                const isFor = logic.includes('forEach') || logic.includes('for');
                const tag = dentroDeTabla ? 'tbody' : 'div';
                stackLogica.push(tag);
                const label = isFor ? 'FOR' : 'IF';
                const clase = isFor ? 'bucle' : 'condicion';
                const displayLabel = logic.replace(/forEach|if|\(|\)|{|}/g, '').trim();
                
                if (tag === 'tbody') {
                  resultado += `<tbody class="logic-block ${clase}" data-ejs-start="${parte.replace(/"/g, '&quot;')}">
                                  <tr class="mceNonEditable"><td colspan="100%" class="logic-header">${label}: ${displayLabel}</td></tr>`;
                } else {
                  resultado += `<div class="logic-block ${clase}" data-ejs-start="${parte.replace(/"/g, '&quot;')}">
                                  <div class="logic-header mceNonEditable">${label}: ${displayLabel}</div><div class="logic-content">`;
                }
            } else if (logic.includes('else')) {
                resultado += dentroDeTabla 
                  ? `<tr class="mceNonEditable"><td colspan="100%" class="logic-header" style="background:#64748b">ELSE</td></tr>`
                  : `</div><div class="logic-header mceNonEditable" style="background:#64748b">ELSE</div><div class="logic-content">`;
            } else {
                resultado += `<span class="mceNonEditable ejs-logic" data-ejs="${parte.replace(/"/g, '&quot;')}"></span>`;
            }
        } else {
            resultado += parte;
        }
    });

    contenidoHtml.value = resultado;
  };

  const tinymceConfigs: RawEditorOptions = {
    height: '100%',
    plugins: ['autosave', 'help', 'image', 'link', 'lists', 'advlist', 'nonbreaking', 'pagebreak', 'quickbars', 'save', 'table', 'visualchars', 'noneditable', 'charmap', 'emoticons', 'accordion', 'code'],
    toolbar: 'undo redo | accordion | blocks fontfamily fontsize | bold italic underline strikethrough | align numlist bullist | table image link | variableBtn bucleBtn condicionBtn | lineheight outdent indent | forecolor backcolor removeformat | charmap emoticons | code preview pagebreak',
    language: 'es',
    menubar: 'file edit view insert format tools table help',
    table_resize_bars: true,
    object_resizing: 'img,table', 
    file_picker_callback: (cb) => {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      input.onchange = function () {
        const file = (this as any).files[0];
        const reader = new FileReader();
        reader.onload = function () {
          const id = 'blobid' + (new Date()).getTime();
          const blobCache = (window as any).tinymce.activeEditor.editorUpload.blobCache;
          const base64 = (reader.result as string).split(',')[1];
          const blobInfo = blobCache.create(id, file, base64);
          blobCache.add(blobInfo);
          cb(blobInfo.blobUri(), { title: file.name });
        };
        reader.readAsDataURL(file);
      };
      input.click();
    },
    content_style: `
      html { background-color: #e5e7eb; padding: 20px; }
      body { 
        font-family: sans-serif; font-size: 11pt; width: 21.59cm; min-height: 27.94cm; 
        margin: 0 auto !important; padding: 1.5cm !important; background-color: white !important; 
        box-shadow: 0 0 10px rgba(0,0,0,0.2); box-sizing: border-box;
      }
      .variable-badge { background-color: #fef3c7; color: #92400e; border: 1px solid #fcd34d; border-radius: 4px; padding: 2px 4px; font-family: monospace; font-weight: bold; }
      .logic-block { border: 1px dashed #3b82f6; margin: 10px 0; border-radius: 4px; background: rgba(59, 130, 246, 0.02); }
      tbody.logic-block { outline: 2px dashed #3b82f6; outline-offset: -2px; display: table-row-group; }
      .logic-header { color: white; padding: 4px 10px; font-family: sans-serif; font-size: 10px; font-weight: bold; }
      td.logic-header { background-color: #3b82f6 !important; border: none !important; }
      .logic-content { padding: 10px; min-height: 20px; }
      .logic-footer { background: #f8fafc; color: #94a3b8; font-size: 8px; padding: 2px 10px; text-align: right; border-top: 1px dashed #eee; }
      td.logic-footer { border: none !important; }
      .bucle { border-color: #3b82f6; }
      .bucle > .logic-header, .bucle td.logic-header { background-color: #3b82f6 !important; }
      .condicion { border-color: #8b5cf6; }
      .condicion > .logic-header, .condicion td.logic-header { background-color: #8b5cf6 !important; }
      table { border-collapse: collapse; width: 100%; border: 1px solid #333; }
      table td { border: 1px solid #333; padding: 8px; }
    `,
    setup: (editor) => {
      editor.ui.registry.addButton('variableBtn', { text: '{x} Variable', onAction: () => abrirModalVariable() });
      editor.ui.registry.addButton('bucleBtn', { text: 'FOR', tooltip: 'Insertar Bucle', onAction: () => abrirModalBucle() });
      editor.ui.registry.addButton('condicionBtn', { text: 'IF', tooltip: 'Insertar Condición', onAction: () => abrirModalCondicion() });
    }
  };

  const ejecutarExportacion = (nombreArchivo: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = contenidoHtml.value;

    tempDiv.querySelectorAll('.variable-badge').forEach(b => {
      b.replaceWith(`<%= ${b.getAttribute('data-varname')} %>`);
    });

    tempDiv.querySelectorAll('.logic-block').forEach(block => {
      const start = block.getAttribute('data-ejs-start');
      const isTable = block.tagName === 'TBODY';
      
      // Limpiar elementos visuales del editor
      block.querySelectorAll('.mceNonEditable').forEach(el => el.remove());
      
      const content = isTable ? block.innerHTML : block.querySelector('.logic-content')?.innerHTML || '';
      block.replaceWith(`${start}${content}<% } -%>`);
    });

    let finalHtml = tempDiv.innerHTML
      .replace(/&lt;%/g, '<%')
      .replace(/%&gt;/g, '%>')
      .replace(/&quot;/g, '"');

    const cssFinal = estilosImportados.value || `
      @page { size: letter portrait; margin: 0; }
      html, body { margin: 0; padding: 0; font-family: 'Arimo', sans-serif; -webkit-print-color-adjust: exact; }
      * { box-sizing: border-box; }
    `;

    const htmlCompleto = `<!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <link href="https://fonts.googleapis.com/css2?family=Arimo:wght@400;700&display=swap" rel="stylesheet">
          <style>${cssFinal}</style>
      </head>
      <body>
          <script id="report_card" type="application/x-ejs">${finalHtml}<\/script>
          <script src="https://cdn.jsdelivr.net/npm/ejs@3.1.10/ejs.min.js"><\/script>
          <script type="module">
              import qs from 'https://cdn.jsdelivr.net/npm/query-string@9.0.0/+esm';
              const rawData = qs.parse(window.location.search, { arrayFormat: 'bracket-separator', arrayFormatSeparator: ';' });
              const helpers = {
                  formatCurrency: (n) => new Intl.NumberFormat('es-MX', {style:'currency', currency:'MXN'}).format(n || 0),
                  formatDate: (d) => new Intl.DateTimeFormat('es-MX').format(new Date(d))
              };
              try {
                  const compiled = ejs.render(document.getElementById('report_card').textContent, { ...rawData, ...helpers });
                  document.body.innerHTML = compiled;
                  setTimeout(() => { window.print(); }, 500);
              } catch (err) { console.error(err); }
          <\/script>
      </body>
      </html>`;

    const blob = new Blob([htmlCompleto], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${nombreArchivo}.html`;
    a.click();
  };

  const imprimirPlantilla = () => {
    const win = window.open('', '_blank');
    if (win) {
      const temp = document.createElement('div');
      temp.innerHTML = contenidoHtml.value;
      temp.querySelectorAll('.variable-badge').forEach(b => b.replaceWith(b.textContent || ''));
      temp.querySelectorAll('.logic-header, .logic-footer').forEach(el => el.remove());
      win.document.write(`<html><head><style>${estilosImportados.value || 'body{font-family:sans-serif;padding:1cm;}table{border-collapse:collapse;width:100%;}td{border:1px solid #333;padding:8px;}'}</style></head><body>${temp.innerHTML}</body></html>`);
      win.document.close();
      win.print();
    }
  };
</script>