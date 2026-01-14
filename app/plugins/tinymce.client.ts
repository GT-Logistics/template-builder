import tinymce from "tinymce";

import "tinymce/icons/default/icons.min.js";
import "tinymce/themes/silver/theme.min.js";
import "tinymce/models/dom/model.min.js";

import "tinymce/plugins/autosave";
import "tinymce/plugins/code";
import "tinymce/plugins/help";
import "tinymce/plugins/image";
import "tinymce/plugins/link";
import "tinymce/plugins/lists";
import "tinymce/plugins/advlist";
import "tinymce/plugins/nonbreaking";
import "tinymce/plugins/pagebreak";
import "tinymce/plugins/preview";
import "tinymce/plugins/quickbars";
import "tinymce/plugins/save";
import "tinymce/plugins/table";
import "tinymce/plugins/visualchars";

import "tinymce/skins/ui/oxide/skin.css";

import "~/i18n/tinymce/es";

export default defineNuxtPlugin(() => {
    return {
        provide: {
            tinymce: tinymce,
        },
    };
});
