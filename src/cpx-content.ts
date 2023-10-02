export class CPXContent extends HTMLElement {
  static get tag() {
    return "cpx-content";
  }
  static get observedAttributes() {
    return ["url", "ready", "cache", "lang", "placement"];
  }

  _template;
  get template() {
    return this._template;
  }
  set template(val) {
    if (this._template === val) return;
    this._template = val;
  }

  _auto = false;
  _ready: boolean;
  get ready() {
    return this._ready;
  }
  set ready(val) {
    if (this._ready === !!val) return;
    this._ready = val;
    this.setAttribute("ready", this._ready.toString());
  }
  _cache: RequestCache = "default";
  _url;
  _data;
  
  get auto() {
    return this._auto;
  }
  set auto(val) {
    if (typeof val === "string") {
      val = true;
    }
    if (val === null) {
      val = false;
    }
    if (this._auto === val) {
      return;
    } else {
      this._auto = val;
      if (this._auto) {
        this.setAttribute("auto", "");
      } else {
        this.removeAttribute("auto");
      }
    }
  }
  get cache() {
    return this._cache;
  }
  set cache(val) {
    if (this._cache === val) return;
    this._cache = val;
    this.setAttribute("cache", this._cache);
  }
  
  get url() {
    try {
      return new URL(this._url);
    } catch {
      return new URL(this._url, window.location.href + "/");
    }
  }

  set url(val) {
    if (this._url === val) return;
    this._url = val;
    this.setAttribute("url", val.toString());
  }

  _lang = "en";
  get lang() { return this._lang;}
  set lang(val) { 
    if (this._lang === val) return;
    this._lang = val;
    this.setAttribute("lang", val);
  }

  _placement;
  get placement() { return this._placement; }
  set placement(val) {
    if (this._placement === val) return;
    this._placement = val;
    this.setAttribute("placement", val);
  }

  get data() { return this._data; }
  set data(val) {
    if (this._data === val) return;
    this._data = val;
    this.render();
  }

  filterString(facets) {
    var len = facets.length,
      filterArr = [];
    for (let i = 0; i < len; i++) {
      for (let j = 0; j < facets[i].items.length; j++) {
        if (facets[i].items[j].active) {
          let idx = 0;
          while (idx < facets[i].items[j].value.length) {
            filterArr.push(facets[i].items[j].value[idx]);
            idx = idx + 1;
          }
        }
      }
    }
    return filterArr.join(", ");
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    // let tmpl = this.querySelector("template");
    // if (tmpl) {
    //   this.attachShadow({ mode: "open" });
    //   this.template = tmpl.cloneNode(true);
    //   this.prepTemplate();
    // } else if (this.getAttribute("template")) {
    //   this.attachShadow({ mode: "open" });
    //   this.template = top.document.querySelector(this.getAttribute("template"))
    //     .cloneNode(true);
    //   this.prepTemplate();
    // }

    //this._changeAttr = this._changeAttr.bind(this);
  }

  async connectedCallback() {
    //top.addEventListener("params-ready", this._changeAttr);
    const autoVal = this.getAttribute('auto');
    if ( autoVal !== null && !autoVal) {
      await this.render();
    }
  }

  

  attributeChangedCallback(name, oldVal, newVal) {
    this[name] = newVal;
  }
  

  prepTemplate() {
    let repeatEls = this.template.content.querySelectorAll("[data-repeat]");
    let varMatch = /\${([^{]+[^}])}/g;
    if (repeatEls.length > 0) {
      repeatEls.forEach((el) => {
        let dr = el.getAttribute("data-repeat");
        if (dr.length === 0) {
          let drtxt = btoa(el.innerHTML.trim());
          el.setAttribute("data-repeat", drtxt);
          while (el.firstChild) el.removeChild(el.firstChild);
        }
      });
    }
    //this.template.innerHTML = this.template.innerHTML.replaceAll(/\${([^{]+[^}])}/g,'<var data-val="$1"></var>');
    if (!this.shadowRoot.firstChild) {
      //while (this.shadowRoot.firstChild) { this.shadowRoot.removeChild(this.shadowRoot.firstChild); }
      this.shadowRoot.appendChild(this.template.content.cloneNode(true));
      this.ready = true;
    }
  }

  renderTemplate(data, ele?) {
    let eltmpl;
    let matches;
    if (ele.getAttribute) {
      eltmpl = ele.getAttribute("data-repeat");
    }
    if (eltmpl) {
      matches = [...atob(eltmpl).matchAll(/\${([^{]+[^}])}/g)];
      data.forEach((v, k) => {
        if (Number.isInteger(k)) {
          let html = matches.reduce((a, c) => {
            let dataVal = c[1].split(".");
            return a.replaceAll(
              c[0],
              dataVal.length <= 1
                ? v[c[1]]
                : dataVal.reduce((acc, curr) => acc[curr], v),
            );
          }, atob(eltmpl));
          ele.innerHTML += html;
        }
      });
    } else {
      matches = [...ele.innerHTML.matchAll(/\${([^{]+[^}])}/g)];
      data.forEach((v, k) => {
        if (!Number.isInteger(k)) {
          let html = matches.reduce((a, c) => {
            let dataVal = c[1].split(".");
            return dataVal[0] == k
              ? a.replaceAll(
                c[0],
                dataVal.length <= 1
                  ? v
                  : dataVal.reduce((acc, curr) => acc[curr] || acc, v),
              )
              : a;
          }, ele.innerHTML);
          ele.innerHTML = html;
        }
      });
    }
  }

  async render() {
    const resp = await fetch(this.url);
    const data = await resp.json();
    const placement = data['data']['placements']
    .filter(n=>n['placement_key'] === this.placement)[0];
    const translation = placement['blocks'][0]['translations']
    .filter(l=>l['langcode'] === this.lang)[0];
    const content = translation['html'];

    this.shadowRoot.innerHTML = `<style>
      :host { display: block; 
        
      max-height: 100vh; }
    </style>
    ${content}
    `;
    /*
    if (this.data) {
      let repeatEls = this.shadowRoot.querySelectorAll("[data-repeat]");
      if (repeatEls.length > 0) {
        repeatEls.forEach((el) => {
          while (el.firstChild) el.removeChild(el.firstChild);
          this.renderTemplate(this.data, el);
        });
      }
      this.renderTemplate(this.data, this.shadowRoot);
    }
    */
  }
}

window.customElements.define(CPXContent.tag, CPXContent);
