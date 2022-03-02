function getBlobURL(jsCode) {
  const blob = new Blob([jsCode], {type: 'text/javascript'});
  const blobURL = URL.createObjectURL(blob);
  return blobURL;
}

// https://github.com/WICG/import-maps
const map = {
  imports: {
    vue: 'https://unpkg.com/vue@3/dist/vue.esm-browser.js',
    'sfc-loader': 'https://cdn.jsdelivr.net/npm/vue3-sfc-loader/dist/vue3-sfc-loader.esm.js',
  },
  scopes: { },
};

function makeComponent(component) {
  const module = component.getAttribute('component');
  let moduleName = module;
  if(!/\.vue$/.test(module)) {
    moduleName += '.vue';
  }
  if(module) {
    const code = component.innerHTML;
    return [getBlobURL(`
      import * as Vue from 'vue';
      import {loadModule} from 'sfc-loader';
      const options = {
        moduleCache: {
          vue: Vue
        },
        async getFile() {
          return \`${code}\`;
        },
        addStyle(textContent) {
          const style = Object.assign(document.createElement('style'), {textContent});
          const ref = document.head.getElementsByTagName('style')[0] || null;
          document.head.insertBefore(style, ref);
        },
      };
      export default Vue.defineAsyncComponent(() => loadModule('${moduleName}', options));
    `), module];
  }
  return [];
}

const currentScript = document.currentScript || document.querySelector('script');

function setup() {
  const components = document.querySelectorAll('noscript[type="vue-sfc"]');
  const importMap = {};
  let mount = null;

  [...components].forEach((component) => {
    const [url, module] = makeComponent(component);
    if(component.hasAttribute('mount')) {
      if(mount) throw new Error('Not support multiple app entrances.');
      mount = [module, component.getAttribute('mount')];
    }
    if(url) {
      importMap[module] = url;
    }
  });
  const importMapEl = document.querySelector('script[type="importmap"]');
  if(importMapEl) {
    // map = JSON.parse(mapEl.innerHTML);
    throw new Error('Cannot setup after importmap is set. Use <script type="sfc-importmap"> instead.');
  }

  const externalMapEl = document.querySelector('script[type="sfc-importmap"]');

  if(externalMapEl) {
    const externalMap = JSON.parse(externalMapEl.textContent);
    Object.assign(map.imports, externalMap.imports);
    Object.assign(map.scopes, externalMap.scopes);
  }

  Object.assign(map.imports, importMap);

  const mapEl = document.createElement('script');
  mapEl.setAttribute('type', 'importmap');
  mapEl.textContent = JSON.stringify(map);
  currentScript.after(mapEl);

  if(mount) {
    const script = document.createElement('script');
    script.setAttribute('type', 'module');
    script.innerHTML = `
      import {createApp} from 'vue';
      import App from '${mount[0]}';
      createApp(App).mount('${mount[1]}');    
    `;
    document.body.appendChild(script);
  }
}

setup();
