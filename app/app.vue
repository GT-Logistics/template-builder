<template>
  <div v-if="mostrarModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
    <div class="bg-white p-6 rounded-xl shadow-2xl border border-gray-200" :class="tipoModal === 'importar' ? 'w-[600px]' : 'w-96'">
      <h3 class="text-lg font-bold mb-2 text-gray-800">{{ modalTitulo }}</h3>
      <p class="text-sm text-gray-500 mb-4">{{ modalSubtitulo }}</p>
      
      <div v-if="tipoModal === 'bucle'" class="space-y-4 mb-6">
        <div>
          <label class="text-[10px] font-bold text-gray-400 uppercase">Colección (Lista)</label>
          <input v-model="inputColeccion" placeholder="ej: unitCodes" class="w-full p-2 border border-gray-300 rounded text-black focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div>
          <label class="text-[10px] font-bold text-gray-400 uppercase">Variable (Elemento)</label>
          <input v-model="inputVariable" placeholder="ej: unitCode" class="w-full p-2 border border-gray-300 rounded text-black focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div>
          <label class="text-[10px] font-bold text-gray-400 uppercase">Índice (Contador)</label>
          <input v-model="inputIndice" placeholder="ej: index" class="w-full p-2 border border-gray-300 rounded text-black focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
      </div>

      <textarea v-else-if="tipoModal === 'importar'" v-model="inputValor" ref="inputRef" class="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-xs text-black mb-6 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Pega tu código aquí..."></textarea>
      
      <input 
        v-else
        v-model="inputValor" 
        @keyup.enter="confirmarAccionModal"
        ref="inputRef"
        type="text" 
        :placeholder="modalPlaceholder"
        class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-6 text-black"
      />

      <div class="flex justify-end gap-3">
        <button @click="cerrarModal" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
        <button @click="confirmarAccionModal" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Confirmar</button>
      </div>
    </div>
  </div>

  <div class="flex flex-col h-screen p-4 bg-gray-50 relative">
    <div class="flex justify-between items-center mb-4 bg-white p-4 rounded shadow-sm border border-gray-200">
      <h1 class="text-2xl font-bold text-gray-800">Editor de Plantillas Pro</h1>
      <div class="flex gap-3">
        <button @click="abrirModalImportar" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">Importar Código</button>
        <button @click="imprimirPlantilla" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition">Vista Previa</button>
        <button @click="abrirModalNombreArchivo" class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-bold shadow-md transition">Exportar</button>
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
  </div>
</template>

<script setup lang="ts">
  import { ref, nextTick } from 'vue';
  import type { RawEditorOptions } from 'tinymce';
  import Editor from '@tinymce/tinymce-vue';

  const inputColeccion = ref('');
  const inputVariable = ref('');
  const inputIndice = ref('');

  const contenidoHtml = ref('<p>¿Qué estás pensando?...</p>');
  const estilosImportados = ref(''); 
  const mostrarModal = ref(false);
  const inputValor = ref('');
  const inputRef = ref<HTMLInputElement | HTMLTextAreaElement | null>(null);
  let editorRef: any = null;

  // NUEVAS VARIABLES PARA PRESERVAR EL ADN DE LA PLANTILLA
  const cabeceraOriginal = ref('');
  const scriptLogicaOriginal = ref('');
  const datosScriptTemplate = ref({ id: 'report_card', atributos: '' });

  const bloqueEditando = ref<HTMLElement | null>(null);
  const esEdicionLogica = ref(false);

  const modalTitulo = ref('');
  const modalSubtitulo = ref('');
  const modalPlaceholder = ref('');
  const tipoModal = ref<'variable' | 'archivo' | 'importar' | 'bucle' | 'condicion'>('variable');

  const onEditorInit = (evt: any) => { editorRef = evt.target; };
  const cerrarModal = () => {
    mostrarModal.value = false;
    esEdicionLogica.value = false;
    bloqueEditando.value = null;
    inputValor.value = ''; 
    inputColeccion.value = '';
    inputVariable.value = '';
    inputIndice.value = '';
  };

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
    // Extraemos y limpiamos los valores de los 3 inputs
    const col = inputColeccion.value.trim();
    const varItem = inputVariable.value.trim() || 'item';
    const idx = inputIndice.value.trim() || 'index';
    const valSimple = inputValor.value.trim();

    // Si es bucle y no hay colección, no hacemos nada
    if (tipoModal.value === 'bucle' && !col) return;
    // Si no es bucle y no hay valor (ej. un IF vacío), no hacemos nada
    if (tipoModal.value !== 'bucle' && tipoModal.value !== 'importar' && !valSimple) return;

    // CASO A: EDITAR BLOQUE EXISTENTE
    if (esEdicionLogica.value && bloqueEditando.value) {
      const esBucle = bloqueEditando.value.classList.contains('bucle');
      
      // Generamos el nuevo tag basado en los inputs
      const startTag = esBucle 
        ? `<% ${col}.forEach((${varItem}, ${idx}) => { %>` 
        : `<% if (${valSimple}) { %>`;
      
      bloqueEditando.value.setAttribute('data-ejs-start', startTag);
      
      const header = bloqueEditando.value.querySelector('.logic-header');
      if (header) {
        header.textContent = `${esBucle ? 'FOR' : 'IF'}: ${esBucle ? col : valSimple}`;
      }

      contenidoHtml.value = editorRef.getContent();
    } 
    // CASO B: INSERTAR NUEVO (Tu lógica original mejorada)
    else {
      if (tipoModal.value === 'variable') {
        editorRef?.insertContent(`<span class="variable-badge mceNonEditable" data-varname="${valSimple}">${valSimple}</span>&nbsp;`);
      } 
      else if (tipoModal.value === 'bucle') {
        const startTag = `<% ${col}.forEach((${varItem}, ${idx}) => { %>`;
        const dentroDeTabla = editorRef.dom.getParent(editorRef.selection.getStart(), 'table');
        
        const html = dentroDeTabla 
          ? `<tbody class="logic-block bucle" data-ejs-start="${startTag.replace(/"/g, '&quot;')}"><tr class="mceNonEditable"><td colspan="100%" class="logic-header">FOR: ${col}</td></tr><tr><td colspan="100%">Contenido...</td></tr><tr class="mceNonEditable"><td colspan="100%" class="logic-footer">FIN FOR</td></tr></tbody>`
          : `<div class="logic-block bucle" data-ejs-start="${startTag.replace(/"/g, '&quot;')}"><div class="logic-header mceNonEditable">FOR: ${col}</div><div class="logic-content"><p>Contenido del bucle...</p></div><div class="logic-footer mceNonEditable">FIN FOR</div></div><p>&nbsp;</p>`;
        
        editorRef?.insertContent(html);
      }
      else if (tipoModal.value === 'condicion') {
        const startTag = `<% if (${valSimple}) { %>`;
        const dentroDeTabla = editorRef.dom.getParent(editorRef.selection.getStart(), 'table');
        const html = dentroDeTabla
          ? `<tbody class="logic-block condicion" data-ejs-start="${startTag.replace(/"/g, '&quot;')}"><tr class="mceNonEditable"><td colspan="100%" class="logic-header">IF: ${valSimple}</td></tr><tr><td colspan="100%">Contenido...</td></tr><tr class="mceNonEditable"><td colspan="100%" class="logic-footer">FIN IF</td></tr></tbody>`
          : `<div class="logic-block condicion" data-ejs-start="${startTag.replace(/"/g, '&quot;')}"><div class="logic-header mceNonEditable">IF: ${valSimple}</div><div class="logic-content"><p>Contenido...</p></div><div class="logic-footer mceNonEditable">FIN IF</div></div><p>&nbsp;</p>`;
        editorRef?.insertContent(html);
      }
      else if (tipoModal.value === 'importar') {
        procesarCodigoImportado(valSimple);
      } 
      else {
        ejecutarExportacion(valSimple);
      }
    }

    cerrarModal();
  };

  const procesarCodigoImportado = (codigo: string) => {
    const decoder = document.createElement('textarea');
    decoder.innerHTML = codigo;
    let codigoLimpio = decoder.value;

    const parser = new DOMParser();
    const doc = parser.parseFromString(codigoLimpio, 'text/html');

    // 1. EXTRAER LINKS Y CABECERAS ORIGINALES (LO QUE ME PEDISTE NO OMITIR)
    const linksOriginales = doc.head.querySelectorAll('link, meta:not([charset])');
    cabeceraOriginal.value = Array.from(linksOriginales).map(el => el.outerHTML).join('\n    ');

    // 2. EXTRAER LOGICA DE SCRIPT (MODULOS)
    const scriptsModulos = doc.querySelectorAll('script[type="module"]');
    scriptLogicaOriginal.value = Array.from(scriptsModulos).map(s => s.innerHTML).join('\n');

    // 3. EXTRAER ESTILOS
    const styleMatch = codigoLimpio.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    let estilosCapturados = "";
    if (styleMatch) {
        estilosCapturados = styleMatch.map(s => s.replace(/<\/?style[^>]*>/gi, '')).join('\n');
    }

    const scriptTemplate = doc.getElementById('report_card') || 
                           doc.getElementById('preinvoice') || 
                           doc.querySelector('script[type="application/x-ejs"]');

    if (scriptTemplate) {
        // Guardamos el ID y todos los atributos (style, data-page-margin, etc)
        datosScriptTemplate.value.id = scriptTemplate.id || 'report_card';
        datosScriptTemplate.value.atributos = Array.from(scriptTemplate.attributes)
            .filter(a => a.name !== 'id' && a.name !== 'type')
            .map(a => `${a.name}="${a.value}"`)
            .join(' ');

        if (scriptTemplate.getAttribute('style')) {
            estilosCapturados += `\nbody { ${scriptTemplate.getAttribute('style')} }`;
        }
    }
    estilosImportados.value = estilosCapturados;

    // 4. CONFIGURACIÓN DEL LIENZO
    if (editorRef) {
        const editorDoc = editorRef.getDoc();
        let styleTag = editorDoc.getElementById('imported-styles');
        if (!styleTag) {
            styleTag = editorDoc.createElement('style');
            styleTag.id = 'imported-styles';
            editorDoc.head.appendChild(styleTag);
        }
        
        styleTag.innerHTML = `
            ${estilosCapturados}
            @page { size: letter portrait; margin: 0; }
            html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            body { 
                position: relative !important; width: 210mm; margin: 0 auto !important; 
                padding: 1cm 1.5cm !important; min-height: 297mm;
                background-color: white; font-family: sans-serif; color: #2c3e50;
                overflow-x: hidden !important;
            }
            .main-table { width: 100%; border-collapse: collapse; border: 1.5px solid #333; }
            .main-table td { border: 1px solid #333; padding: 7px; font-size: 9pt; }
        `;
    }

    let extraido = scriptTemplate ? scriptTemplate.innerHTML : (doc.body ? doc.body.innerHTML : codigoLimpio);

    // 5. PROCESAR VARIABLES Y LÓGICA
    let htmlProcesado = extraido.replace(/<%=\s*([\s\S]*?)\s*%>/g, (match, p1) => {
        return `<span class="variable-badge mceNonEditable" data-varname="${p1.trim()}">${p1.trim()}</span>`;
    });

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
                resultado += tag === 'tbody' 
                    ? `<tr class="mceNonEditable"><td colspan="100%" class="logic-footer">FIN BLOQUE</td></tr></tbody>`
                    : `</div><div class="logic-footer mceNonEditable">FIN BLOQUE</div></div>`;
            } else if (logic.includes('{')) {
                const isFor = logic.includes('forEach') || logic.includes('for');
                const tag = dentroDeTabla ? 'tbody' : 'div';
                stackLogica.push(tag);
                const label = isFor ? 'FOR' : 'IF';
                const clase = isFor ? 'bucle' : 'condicion';
                const displayLabel = logic.replace(/forEach|if|\(|\)|{|}/g, '').trim();
                
                resultado += tag === 'tbody'
                  ? `<tbody class="logic-block ${clase}" data-ejs-start="${parte.replace(/"/g, '&quot;')}"><tr class="mceNonEditable"><td colspan="100%" class="logic-header">${label}: ${displayLabel}</td></tr>`
                  : `<div class="logic-block ${clase}" data-ejs-start="${parte.replace(/"/g, '&quot;')}"><div class="logic-header mceNonEditable">${label}: ${displayLabel}</div><div class="logic-content">`;
            } else {
                resultado += `<span class="mceNonEditable ejs-logic" data-ejs="${parte.replace(/"/g, '&quot;')}"></span>`;
            }
        } else {
            resultado += parte;
        }
    });

    contenidoHtml.value = resultado.replace(/position:\s*absolute;([^"]*)/gi, (match, estilos) => {
        return `position: absolute; ${estilos}`;
    });
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
      .mce-offscreen-selection { 
        display: none !important; 
      }
      html { background-color: #e5e7eb; padding: 20px; }
      body {
        font-family: sans-serif; font-size: 11pt; width: 21.59cm; min-height: 27.94cm;
        margin: 0 auto !important; padding: 1.5cm !important; background-color: white !important;
        box-shadow: 0 0 10px rgba(0,0,0,0.2); box-sizing: border-box;
        position: relative !important;
      }
      .variable-badge { background-color: #fef3c7; color: #92400e; border: 1px solid #fcd34d; border-radius: 4px; padding: 2px 4px; font-family: monospace; }
      .logic-block { border: 1px solid #3b82f6; margin: 2px 0; position: relative; }
      .logic-header { background-color: #3b82f6; color: white; font-size: 9px; padding: 2px 5px; cursor: pointer; }
      .logic-footer { font-size: 8px; color: #94a3b8; text-align: right; padding: 2px; }
      table { border-collapse: collapse; width: 100%; }
      .bucle { border-color: #3b82f6; }
      .bucle > .logic-header, .bucle td.logic-header { background-color: #3b82f6 !important; }
      .condicion { border-color: #8b5cf6; }
      .condicion > .logic-header, .condicion td.logic-header { background-color: #8b5cf6 !important; }
    `,
    setup: (editor) => {
      editor.ui.registry.addButton('variableBtn', { text: '{x} Variable', onAction: () => abrirModalVariable() });
      editor.ui.registry.addButton('bucleBtn', { text: 'FOR', tooltip: 'Insertar Bucle', onAction: () => abrirModalBucle() });
      editor.ui.registry.addButton('condicionBtn', { text: 'IF', tooltip: 'Insertar Condición', onAction: () => abrirModalCondicion() });

      editor.on('dblclick', (e) => {
        const target = e.target as HTMLElement; 
        const bloque = editor.dom.getParent(target, '.logic-block') as HTMLElement;
        
        if (bloque) {
          bloqueEditando.value = bloque;
          esEdicionLogica.value = true;
          
          const tagOriginal = bloque.getAttribute('data-ejs-start') || '';
          let textoParaInput = tagOriginal.replace(/<%\s*|\s*%>/g, ''); 

          if (bloque.classList.contains('bucle')) {
            const mEntries = textoParaInput.match(/of\s+(.*?)\.entries\(\)/);
            const mOf = textoParaInput.match(/of\s+(.*?)\)/);
            const mForEach = textoParaInput.match(/(.*?)\.forEach/);
            
            if (mEntries && mEntries[1]) {
              textoParaInput = mEntries[1].trim();
            } else if (mOf && mOf[1]) {
              textoParaInput = mOf[1].trim();
            } else if (mForEach && mForEach[1]) {
              textoParaInput = mForEach[1].trim();
            }

            inputColeccion.value = textoParaInput;

            const partesBucle = tagOriginal.match(/\(([^)]+)\)/);
            if (partesBucle && partesBucle[1]) {
              // Mantenemos tu estructura que no da errores
              const nombres = partesBucle[1].split(',').map(n => {
                return n.trim()
                  .replace('const ', '')
                  .replace('[', '')
                  .replace(']', '')
                  .replace('(', '') // <--- Agregamos esto para limpiar el ( de forEach((
                  .replace(')', '') // <--- Agregamos esto por seguridad para limpiar el final
                  .split(' of ')[0];
              });

              if (tagOriginal.includes('.entries')) {
                inputIndice.value = nombres[0] || 'index';
                inputVariable.value = nombres[1] || 'item';
              } else {
                inputVariable.value = nombres[0] || 'item';
                inputIndice.value = nombres[1] || 'index';
              }
            } else {
              inputVariable.value = 'item';
              inputIndice.value = 'index';
            }

          } else {
            const mIf = textoParaInput.match(/if\s*\((.*)\)\s*{/);
            if (mIf && mIf[1]) {
              textoParaInput = mIf[1].trim();
            }
          }

          tipoModal.value = bloque.classList.contains('bucle') ? 'bucle' : 'condicion';
          modalTitulo.value = `Editar ${tipoModal.value.toUpperCase()}`;
          modalSubtitulo.value = "Modifica los parámetros:";
          inputValor.value = textoParaInput; 
          mostrarModal.value = true;
          
          nextTick(() => {
            if (inputRef.value) inputRef.value.focus();
          });
        }
      });
    }
  };

  const ejecutarExportacion = (nombreArchivo: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = contenidoHtml.value;

    tempDiv.querySelectorAll('.variable-badge').forEach(b => {
      const varName = b.getAttribute('data-varname');
      b.replaceWith(`<%= ${varName} %>`);
    });

    tempDiv.querySelectorAll('.logic-block').forEach(block => {
      const startTag = block.getAttribute('data-ejs-start') || '';
      block.querySelectorAll('.mceNonEditable, .logic-header, .logic-footer').forEach(el => el.remove());

      let innerContent = (block.tagName === 'TBODY' || block.tagName === 'TABLE') 
        ? block.innerHTML 
        : (block.querySelector('.logic-content')?.innerHTML || block.innerHTML);

      const esIfSinCierre = startTag.includes('if') && !startTag.includes('}');
      const cierre = startTag.includes('forEach') ? '<% }) %>' : (esIfSinCierre ? '' : '<% } %>');
      block.replaceWith(`${startTag}${innerContent}${cierre}`);
    });

    let finalHtml = tempDiv.innerHTML;
    finalHtml = finalHtml.replace(/&amp;/g, '&').replace(/&amp;/g, '&'); 
    finalHtml = finalHtml.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    finalHtml = finalHtml.replace(/\{ %>\s*<% \} %>/g, '{ %>');

    const mapaAcentos: { [key: string]: string } = {
        'á': '&aacute;', 'é': '&eacute;', 'í': '&iacute;', 'ó': '&oacute;', 'ú': '&uacute;', 'ñ': '&ntilde;',
        'Á': '&Aacute;', 'É': '&Eacute;', 'Í': '&Iacute;', 'Ó': '&Oacute;', 'Ú': '&Uacute;', 'Ñ': '&Ntilde;',
        '¿': '&iquest;', '¡': '&iexcl;'
    };
    finalHtml = finalHtml.replace(/[áéíóúñÁÉÍÓÚÑ¿¡]/g, (match) => mapaAcentos[match] || match);
    finalHtml = finalHtml.replace(/&amp;&amp;/g, '&&').replace(/<tbody>/gi, '').replace(/<\/tbody>/gi, '');

    // 4. ENSAMBLAJE USANDO EL .JOIN SOLICITADO Y LOS DATOS EXTRAÍDOS
    const cssFinal = estilosImportados.value || `body { font-family: sans-serif; }`;
    
    // Si no hay logica capturada, usamos la por defecto para no romper el archivo
    const scriptLogica = scriptLogicaOriginal.value || [
      "  import qs from 'https://cdn.jsdelivr.net/npm/query-string@9.0.0/+esm';",
      "  const rawData = qs.parse(window.location.search, { arrayFormat: 'bracket-separator', arrayFormatSeparator: ';' });",
      "  const helpers = {",
      "    formatCurrency: (n) => new Intl.NumberFormat('es-MX', {style:'currency', currency:'MXN'}).format(n || 0),",
      "    formatDate: (d) => new Intl.DateTimeFormat('es-MX').format(new Date(d))",
      "  };",
      "  try {",
      `    const template = document.getElementById('${datosScriptTemplate.value.id}').textContent;`,
      "    document.body.innerHTML = ejs.render(template, { ...rawData, ...helpers });",
      "    setTimeout(() => { window.print(); }, 700);",
      "  } catch (err) { console.error(err); }"
    ].join('\n');

    const htmlCompleto = [
      '<!DOCTYPE html>',
      '<html lang="es">',
      '<head>',
      '    <meta charset="UTF-8">',
      `    ${cabeceraOriginal.value}`, // AQUÍ SE PONEN LOS LINKS ORIGINALES
      `    <style>${cssFinal}</style>`,
      '</head>',
      '<body>',
      `<script id="${datosScriptTemplate.value.id}" ${datosScriptTemplate.value.atributos} type="application/x-ejs">${finalHtml.trim()}<\/script>`,
      '    <script src="https://cdn.jsdelivr.net/npm/ejs@3.1.10/ejs.min.js"><\/script>',
      '    <script type="module">',
      scriptLogica,
      '    <\/script>',
      '</body>',
      '</html>'
    ].join('\n');

    const blob = new Blob([htmlCompleto], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${nombreArchivo}.html`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  
  const imprimirPlantilla = () => {
    const win = window.open('', '_blank');
    if (win) {
      const temp = document.createElement('div');
      temp.innerHTML = contenidoHtml.value;
      temp.querySelectorAll('.variable-badge').forEach(b => b.replaceWith(b.textContent || ''));
      temp.querySelectorAll('.logic-header, .logic-footer').forEach(el => el.remove());

      const estilosFinales = `
          html { background: white; touch-action: manipulation; }
          @media (prefers-color-scheme: dark) { html { background: rgb(40, 41, 44); } }
          html, body { height: 100%; margin: 0; overflow: hidden; width: 100%; }
          .loading body::before { background: rgb(218, 220, 224); border-right: 1px solid rgb(232, 234, 237); content: ''; display: block; height: 100%; width: calc(100% - 385px); }
          @page { size: letter portrait; margin: 0; }
          body { font-family: sans-serif; position: relative; width: 215.9mm; height: 279.4mm; display: flex; flex-direction: column; }
          .contenedor-base { padding: 1cm 1.5cm; position: relative; z-index: 1; flex: 1; display: flex; flex-direction: column; }
          .contenedor-base > *:last-child { margin-top: auto; }
          .fecha-impresion-manual { position: absolute; top: 10mm; right: 15mm; font-size: 8pt; color: #000; z-index: 9999; }
          @media print { html, body { background: white !important; color: black !important; } .fecha-impresion-manual { color: black !important; } }
          ${estilosImportados.value}
      `;

      win.document.write(`
          <!DOCTYPE html>
          <html lang="es">
              <head>
                  <meta charset="UTF-8">
                  ${cabeceraOriginal.value}
                  <title>Vista Previa de Impresión</title>
                  <style>${estilosFinales}</style>
              </head>
              <body>
                  <div class="contenedor-base">
                      ${temp.innerHTML}
                  </div>
              </body>
          </html>
      `);
      win.document.close();
      setTimeout(() => { win.focus(); win.print(); }, 600);
    }
  };
</script>