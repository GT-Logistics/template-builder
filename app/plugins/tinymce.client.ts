import tinymce from "tinymce";

import "tinymce/icons/default/icons.min.js";
import "tinymce/themes/silver/theme.min.js";
import "tinymce/models/dom/model.min.js";

import "tinymce/skins/ui/oxide/skin.css";

import "~/i18n/tinymce/es_MX";

export default defineNuxtPlugin(() => {
    return {
        provide: {
            tinymce: tinymce,
        },
    };
});
