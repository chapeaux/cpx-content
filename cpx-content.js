var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class CPXContent extends HTMLElement {
    constructor() {
        super();
        this._auto = false;
        this._cache = "default";
        this._lang = "en";
        this.attachShadow({ mode: "open" });
    }
    static get tag() {
        return "cpx-content";
    }
    static get observedAttributes() {
        return ["url", "ready", "cache", "lang", "placement"];
    }
    get template() {
        return this._template;
    }
    set template(val) {
        if (this._template === val)
            return;
        this._template = val;
    }
    get ready() {
        return this._ready;
    }
    set ready(val) {
        if (this._ready === !!val)
            return;
        this._ready = val;
        this.setAttribute("ready", this._ready.toString());
    }
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
        }
        else {
            this._auto = val;
            if (this._auto) {
                this.setAttribute("auto", "");
            }
            else {
                this.removeAttribute("auto");
            }
        }
    }
    get cache() {
        return this._cache;
    }
    set cache(val) {
        if (this._cache === val)
            return;
        this._cache = val;
        this.setAttribute("cache", this._cache);
    }
    get url() {
        try {
            return new URL(this._url);
        }
        catch (_a) {
            return new URL(this._url, window.location.href + "/");
        }
    }
    set url(val) {
        if (this._url === val)
            return;
        this._url = val;
        this.setAttribute("url", val.toString());
    }
    get lang() { return this._lang; }
    set lang(val) {
        if (this._lang === val)
            return;
        this._lang = val;
        this.setAttribute("lang", val);
    }
    get placement() { return this._placement; }
    set placement(val) {
        if (this._placement === val)
            return;
        this._placement = val;
        this.setAttribute("placement", val);
    }
    get data() { return this._data; }
    set data(val) {
        if (this._data === val)
            return;
        this._data = val;
        this.render();
    }
    filterString(facets) {
        var len = facets.length, filterArr = [];
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
    connectedCallback() {
        return __awaiter(this, void 0, void 0, function* () {
            const autoVal = this.getAttribute('auto');
            if (autoVal !== null && !autoVal) {
                yield this.render();
            }
        });
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
                    while (el.firstChild)
                        el.removeChild(el.firstChild);
                }
            });
        }
        if (!this.shadowRoot.firstChild) {
            this.shadowRoot.appendChild(this.template.content.cloneNode(true));
            this.ready = true;
        }
    }
    renderTemplate(data, ele) {
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
                        return a.replaceAll(c[0], dataVal.length <= 1
                            ? v[c[1]]
                            : dataVal.reduce((acc, curr) => acc[curr], v));
                    }, atob(eltmpl));
                    ele.innerHTML += html;
                }
            });
        }
        else {
            matches = [...ele.innerHTML.matchAll(/\${([^{]+[^}])}/g)];
            data.forEach((v, k) => {
                if (!Number.isInteger(k)) {
                    let html = matches.reduce((a, c) => {
                        let dataVal = c[1].split(".");
                        return dataVal[0] == k
                            ? a.replaceAll(c[0], dataVal.length <= 1
                                ? v
                                : dataVal.reduce((acc, curr) => acc[curr] || acc, v))
                            : a;
                    }, ele.innerHTML);
                    ele.innerHTML = html;
                }
            });
        }
    }
    render() {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield fetch(this.url);
            const data = yield resp.json();
            const placement = data['data']['placements']
                .filter(n => n['placement_key'] === this.placement)[0];
            const translation = placement['blocks'][0]['translations']
                .filter(l => l['langcode'] === this.lang)[0];
            const content = translation['html'];
            this.shadowRoot.innerHTML = `<style>
      :host { display: block; 
        
      max-height: 100vh; }
    </style>
    ${content}
    `;
        });
    }
}
window.customElements.define(CPXContent.tag, CPXContent);
