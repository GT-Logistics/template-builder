<template>
  <div>
    <h1>Editor de plantillas</h1>

    <Editor
      id="editor"
      license-key="gpl"
      :init="tinymceConfigs"
    />
  </div>
</template>

<script setup lang="ts">
import type {RawEditorOptions} from 'tinymce';
import Editor from '@tinymce/tinymce-vue';

const tinymceConfigs: RawEditorOptions = {
  height: 500,
  language: 'es_MX'
}
</script>
