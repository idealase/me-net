import{s as M,z as Lt,c as Le,i as xe,l as xt,m as Et,a as $t,b as Nt,d as Ct}from"./d3-DUWLIzZF.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function t(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(n){if(n.ep)return;n.ep=!0;const a=t(n);fetch(n.href,a)}})();class Tt{container;element=null;callbacks;constructor(e,t){this.container=e,this.callbacks=t}show(){if(this.element!==null){this.element.classList.remove("hidden"),this.element.querySelector("#btn-empty-add-behaviour")?.focus();return}this.element=document.createElement("div"),this.element.className="empty-state",this.element.setAttribute("role","status"),this.element.setAttribute("aria-live","polite"),this.element.innerHTML=`
      <div class="empty-state-content">
        <svg class="empty-state-icon" width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="30" cy="60" r="8" fill="var(--color-behaviour)" opacity="0.3" />
          <circle cx="60" cy="60" r="8" fill="var(--color-outcome)" opacity="0.3" />
          <circle cx="90" cy="60" r="8" fill="var(--color-value)" opacity="0.3" />
          <path d="M 38 60 L 52 60" stroke="var(--color-text-secondary)" stroke-width="2" opacity="0.3" stroke-dasharray="3,3" />
          <path d="M 68 60 L 82 60" stroke="var(--color-text-secondary)" stroke-width="2" opacity="0.3" stroke-dasharray="3,3" />
        </svg>
        
        <h2 class="empty-state-title">Your network is empty</h2>
        <p class="empty-state-description">
          Start building your means-ends network by adding your first behaviour.
        </p>

        <div class="empty-state-actions">
          <button id="btn-empty-add-behaviour" class="btn btn-primary" aria-label="Add your first behaviour">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Add First Behaviour
          </button>
          <button id="btn-empty-why-ladder" class="btn btn-secondary" aria-label="Start Why Ladder guided mode">
            Start Why Ladder
          </button>
          <button id="btn-empty-import" class="btn btn-secondary" aria-label="Import existing data">
            Import Data
          </button>
        </div>

        <div class="empty-state-tips">
          <h3 class="empty-state-tips-title">Quick Start Tips:</h3>
          <ul class="empty-state-tips-list">
            <li>Think of a daily habit or action you perform regularly</li>
            <li>Use the Why Ladder mode to quickly map outcomes and values</li>
            <li>The sidebar helps you add nodes and view insights as you build</li>
          </ul>
        </div>
      </div>
    `,this.container.appendChild(this.element);const e=this.element.querySelector("#btn-empty-add-behaviour"),t=this.element.querySelector("#btn-empty-why-ladder"),i=this.element.querySelector("#btn-empty-import");e!==null&&e.addEventListener("click",()=>{this.callbacks.onAddBehaviour()}),t!==null&&t.addEventListener("click",()=>{this.callbacks.onStartWhyLadder()}),i!==null&&i.addEventListener("click",()=>{this.callbacks.onImportData()}),e?.focus()}hide(){this.element!==null&&this.element.classList.add("hidden")}destroy(){this.element!==null&&(this.element.remove(),this.element=null)}}function Ee(){return{nodeTypes:{behaviour:!0,outcome:!0,value:!0},valence:{positive:!0,negative:!0},searchQuery:"",highlightMode:"none"}}class Bt{container;network;callbacks;filterState;constructor(e,t){this.container=e,this.network=t.network,this.callbacks=t.callbacks,this.filterState=Ee(),this.render()}setNetwork(e){this.network=e,this.render()}getFilterState(){return{...this.filterState}}reset(){this.filterState=Ee(),this.render(),this.emitChange()}clearSearch(){this.filterState.searchQuery="",this.render(),this.emitChange()}render(){const{nodeTypes:e,valence:t,searchQuery:i,highlightMode:n}=this.filterState,a=this.network.behaviours.length,o=this.network.outcomes.length,r=this.network.values.length,l=this.network.links.filter(u=>u.valence==="positive").length,c=this.network.links.filter(u=>u.valence==="negative").length;this.container.innerHTML=`
      <div class="filter-panel">
        <!-- Search Box -->
        <div class="filter-section search-section">
          <label class="filter-label" for="filter-search">Search</label>
          <div class="search-input-wrapper">
            <input
              type="text"
              id="filter-search"
              class="filter-search-input"
              placeholder="Search nodes..."
              value="${this.escapeHtml(i)}"
              aria-label="Search nodes by label"
            />
            <button
              class="search-clear-btn ${i===""?"hidden":""}"
              aria-label="Clear search"
              title="Clear search"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Node Type Filters -->
        <div class="filter-section">
          <span class="filter-label">Show Nodes</span>
          <div class="filter-checkboxes">
            <label class="filter-checkbox">
              <input
                type="checkbox"
                id="filter-behaviour"
                ${e.behaviour?"checked":""}
              />
              <span class="checkbox-label behaviour">Behaviours (${a})</span>
            </label>
            <label class="filter-checkbox">
              <input
                type="checkbox"
                id="filter-outcome"
                ${e.outcome?"checked":""}
              />
              <span class="checkbox-label outcome">Outcomes (${o})</span>
            </label>
            <label class="filter-checkbox">
              <input
                type="checkbox"
                id="filter-value"
                ${e.value?"checked":""}
              />
              <span class="checkbox-label value">Values (${r})</span>
            </label>
          </div>
        </div>

        <!-- Valence Filters -->
        <div class="filter-section">
          <span class="filter-label">Show Edges</span>
          <div class="filter-checkboxes">
            <label class="filter-checkbox">
              <input
                type="checkbox"
                id="filter-positive"
                ${t.positive?"checked":""}
              />
              <span class="checkbox-label positive">Positive (${l})</span>
            </label>
            <label class="filter-checkbox">
              <input
                type="checkbox"
                id="filter-negative"
                ${t.negative?"checked":""}
              />
              <span class="checkbox-label negative">Negative (${c})</span>
            </label>
          </div>
        </div>

        <!-- Highlight Modes -->
        <div class="filter-section">
          <span class="filter-label">Highlight</span>
          <div class="filter-radio-group">
            <label class="filter-radio">
              <input
                type="radio"
                name="highlight-mode"
                value="none"
                ${n==="none"?"checked":""}
              />
              <span class="radio-label">None</span>
            </label>
            <label class="filter-radio">
              <input
                type="radio"
                name="highlight-mode"
                value="leverage"
                ${n==="leverage"?"checked":""}
              />
              <span class="radio-label leverage">High Leverage</span>
            </label>
            <label class="filter-radio">
              <input
                type="radio"
                name="highlight-mode"
                value="fragile"
                ${n==="fragile"?"checked":""}
              />
              <span class="radio-label fragile">Fragile Values</span>
            </label>
            <label class="filter-radio">
              <input
                type="radio"
                name="highlight-mode"
                value="conflicts"
                ${n==="conflicts"?"checked":""}
              />
              <span class="radio-label conflicts">Conflicts</span>
            </label>
          </div>
        </div>

        <!-- Reset Button -->
        <div class="filter-actions">
          <button class="filter-reset-btn" aria-label="Reset all filters">
            Reset Filters
          </button>
        </div>
      </div>
    `,this.attachEventListeners()}attachEventListeners(){const e=this.container.querySelector("#filter-search");e&&(e.addEventListener("input",u=>{this.filterState.searchQuery=u.target.value,this.updateClearButton(),this.emitChange()}),e.addEventListener("keydown",u=>{u.key==="Escape"&&this.clearSearch()}));const t=this.container.querySelector(".search-clear-btn");t&&t.addEventListener("click",()=>{this.clearSearch()});const i=this.container.querySelector("#filter-behaviour"),n=this.container.querySelector("#filter-outcome"),a=this.container.querySelector("#filter-value");i?.addEventListener("change",u=>{this.filterState.nodeTypes.behaviour=u.target.checked,this.emitChange()}),n?.addEventListener("change",u=>{this.filterState.nodeTypes.outcome=u.target.checked,this.emitChange()}),a?.addEventListener("change",u=>{this.filterState.nodeTypes.value=u.target.checked,this.emitChange()});const o=this.container.querySelector("#filter-positive"),r=this.container.querySelector("#filter-negative");o?.addEventListener("change",u=>{this.filterState.valence.positive=u.target.checked,this.emitChange()}),r?.addEventListener("change",u=>{this.filterState.valence.negative=u.target.checked,this.emitChange()}),this.container.querySelectorAll('input[name="highlight-mode"]').forEach(u=>{u.addEventListener("change",h=>{this.filterState.highlightMode=h.target.value,this.emitChange()})});const c=this.container.querySelector(".filter-reset-btn");c&&c.addEventListener("click",()=>{this.reset()})}updateClearButton(){const e=this.container.querySelector(".search-clear-btn");e&&e.classList.toggle("hidden",this.filterState.searchQuery==="")}emitChange(){this.callbacks.onFilterChange({...this.filterState})}escapeHtml(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}}const Ot={label:"",frequency:"weekly",cost:"low",contextTags:[],notes:""};function At(s){return{label:s.label,frequency:s.frequency,cost:s.cost,contextTags:[...s.contextTags],notes:s.notes??""}}const Dt={label:"",notes:""};function Vt(s){return{label:s.label,notes:s.notes??""}}const qt={label:"",importance:"medium",neglect:"adequately-met",notes:""};function Mt(s){return{label:s.label,importance:s.importance,neglect:s.neglect,notes:s.notes??""}}const Ht={type:"behaviour-outcome",sourceId:"",targetId:"",valence:"positive",reliability:"usually"},Ft={type:"outcome-value",sourceId:"",targetId:"",valence:"positive",strength:"moderate"},Ge=[{value:"daily",label:"Daily"},{value:"weekly",label:"Weekly"},{value:"monthly",label:"Monthly"},{value:"occasionally",label:"Occasionally"},{value:"rarely",label:"Rarely"}],Ue=[{value:"trivial",label:"Trivial"},{value:"low",label:"Low"},{value:"medium",label:"Medium"},{value:"high",label:"High"},{value:"very-high",label:"Very High"}],Ye=[{value:"critical",label:"Critical"},{value:"high",label:"High"},{value:"medium",label:"Medium"},{value:"low",label:"Low"}],Qe=[{value:"severely-neglected",label:"Severely Neglected"},{value:"somewhat-neglected",label:"Somewhat Neglected"},{value:"adequately-met",label:"Adequately Met"},{value:"well-satisfied",label:"Well Satisfied"}],zt=[{value:"positive",label:"Positive (+)"},{value:"negative",label:"Negative (−)"}],Xe=[{value:"always",label:"Always"},{value:"usually",label:"Usually"},{value:"sometimes",label:"Sometimes"},{value:"rarely",label:"Rarely"}],Je=[{value:"strong",label:"Strong"},{value:"moderate",label:"Moderate"},{value:"weak",label:"Weak"}];function $e(s,e,t,i=[]){const n=t.toLowerCase().trim();let a;switch(e){case"behaviour":a=s.behaviours;break;case"outcome":a=s.outcomes;break;case"value":a=s.values;break}return a.filter(o=>!i.includes(o.id)).filter(o=>n===""||o.label.toLowerCase().includes(n)).map(o=>({id:o.id,label:o.label,type:e})).slice(0,10)}function V(s,e,t){const i=s.trim();if(!i)return{field:"label",message:"Label is required"};if(i.length>100)return{field:"label",message:"Label must be 100 characters or less"};const n=i.toLowerCase();return e.some(o=>o.toLowerCase()===n&&o.toLowerCase()!==t?.toLowerCase())?{field:"label",message:"A node with this label already exists"}:null}function Wt(s,e,t){return s.links.some(i=>i.sourceId===e&&i.targetId===t)}function q(s,e){switch(e){case"behaviour":return s.behaviours.map(t=>t.label);case"outcome":return s.outcomes.map(t=>t.label);case"value":return s.values.map(t=>t.label)}}function Rt(s,e){const t=[];for(const i of s.links)if(i.sourceId===e){const n=Ne(s,i.targetId);n&&t.push({id:n.id,label:n.label,type:n.type,linkId:i.id,valence:i.valence,reliability:i.type==="behaviour-outcome"?i.reliability:void 0,strength:i.type==="outcome-value"?i.strength:void 0,direction:"outgoing"})}else if(i.targetId===e){const n=Ne(s,i.sourceId);n&&t.push({id:n.id,label:n.label,type:n.type,linkId:i.id,valence:i.valence,reliability:i.type==="behaviour-outcome"?i.reliability:void 0,strength:i.type==="outcome-value"?i.strength:void 0,direction:"incoming"})}return t}function Ne(s,e){return s.behaviours.find(t=>t.id===e)??s.outcomes.find(t=>t.id===e)??s.values.find(t=>t.id===e)}class Ce{container;mode;network;data;originalLabel;callbacks;errors=[];constructor(e,t){this.container=e,this.mode=t.mode,this.network=t.network,this.callbacks=t.callbacks,t.initialData?(this.data={...t.initialData},this.originalLabel=t.initialData.label):this.data={...Ot},this.render()}render(){const e=this.mode==="create"?"Add Behaviour":"Edit Behaviour",t=this.mode==="create"?"Create":"Save";this.container.innerHTML=`
      <form class="entity-form behaviour-form" novalidate>
        <h3 class="form-title">${e}</h3>
        
        <div class="form-group">
          <label for="behaviour-label" class="form-label">
            Label <span class="required">*</span>
          </label>
          <input
            type="text"
            id="behaviour-label"
            class="form-input"
            value="${this.escapeHtml(this.data.label)}"
            placeholder="e.g., Morning meditation"
            maxlength="100"
            required
          />
          <div class="form-error" id="label-error"></div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="behaviour-frequency" class="form-label">Frequency</label>
            <select id="behaviour-frequency" class="form-select">
              ${Ge.map(i=>`<option value="${i.value}" ${this.data.frequency===i.value?"selected":""}>${i.label}</option>`).join("")}
            </select>
          </div>

          <div class="form-group">
            <label for="behaviour-cost" class="form-label">Cost</label>
            <select id="behaviour-cost" class="form-select">
              ${Ue.map(i=>`<option value="${i.value}" ${this.data.cost===i.value?"selected":""}>${i.label}</option>`).join("")}
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="behaviour-tags" class="form-label">Context Tags</label>
          <input
            type="text"
            id="behaviour-tags"
            class="form-input"
            value="${this.escapeHtml(this.data.contextTags.join(", "))}"
            placeholder="e.g., morning, alone, work"
          />
          <div class="form-hint">Separate tags with commas</div>
        </div>

        <div class="form-group">
          <label for="behaviour-notes" class="form-label">Notes</label>
          <textarea
            id="behaviour-notes"
            class="form-textarea"
            rows="3"
            placeholder="Optional notes about this behaviour..."
          >${this.escapeHtml(this.data.notes)}</textarea>
        </div>

        <div class="form-actions">
          ${this.mode==="edit"&&this.callbacks.onDelete?'<button type="button" class="btn btn-danger" id="btn-delete">Delete</button>':""}
          <button type="button" class="btn btn-secondary" id="btn-cancel">Cancel</button>
          <button type="submit" class="btn btn-primary" id="btn-submit">${t}</button>
        </div>
      </form>
    `,this.bindEvents()}bindEvents(){const e=this.container.querySelector("form"),t=this.container.querySelector("#behaviour-label"),i=this.container.querySelector("#behaviour-frequency"),n=this.container.querySelector("#behaviour-cost"),a=this.container.querySelector("#behaviour-tags"),o=this.container.querySelector("#behaviour-notes"),r=this.container.querySelector("#btn-cancel"),l=this.container.querySelector("#btn-delete");t.addEventListener("input",()=>{this.data.label=t.value,this.validateField("label")}),i.addEventListener("change",()=>{this.data.frequency=i.value}),n.addEventListener("change",()=>{this.data.cost=n.value}),a.addEventListener("input",()=>{this.data.contextTags=a.value.split(",").map(c=>c.trim()).filter(c=>c.length>0)}),o.addEventListener("input",()=>{this.data.notes=o.value}),e.addEventListener("submit",c=>{c.preventDefault(),this.validate()&&this.callbacks.onSave(this.data)}),r.addEventListener("click",()=>{this.callbacks.onCancel()}),l&&this.callbacks.onDelete&&l.addEventListener("click",()=>{confirm("Are you sure you want to delete this behaviour? This will also remove all connected links.")&&this.callbacks.onDelete()})}validateField(e){if(this.errors=this.errors.filter(t=>t.field!==e),e==="label"){const t=q(this.network,"behaviour"),i=V(this.data.label,t,this.originalLabel);i&&this.errors.push(i)}return this.updateErrorDisplay(),!this.errors.some(t=>t.field===e)}validate(){this.errors=[];const e=q(this.network,"behaviour"),t=V(this.data.label,e,this.originalLabel);return t&&this.errors.push(t),this.updateErrorDisplay(),this.errors.length===0}updateErrorDisplay(){const e=this.container.querySelector("#label-error"),t=this.container.querySelector("#behaviour-label"),i=this.errors.find(n=>n.field==="label");i?(e.textContent=i.message,t.classList.add("invalid")):(e.textContent="",t.classList.remove("invalid"))}escapeHtml(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}getData(){return{...this.data}}setNetwork(e){this.network=e}}class Te{container;mode;network;data;originalLabel;callbacks;errors=[];constructor(e,t){this.container=e,this.mode=t.mode,this.network=t.network,this.callbacks=t.callbacks,t.initialData?(this.data={...t.initialData},this.originalLabel=t.initialData.label):this.data={...Dt},this.render()}render(){const e=this.mode==="create"?"Add Outcome":"Edit Outcome",t=this.mode==="create"?"Create":"Save";this.container.innerHTML=`
      <form class="entity-form outcome-form" novalidate>
        <h3 class="form-title">${e}</h3>
        
        <div class="form-group">
          <label for="outcome-label" class="form-label">
            Label <span class="required">*</span>
          </label>
          <input
            type="text"
            id="outcome-label"
            class="form-input"
            value="${this.escapeHtml(this.data.label)}"
            placeholder="e.g., Mental clarity"
            maxlength="100"
            required
          />
          <div class="form-error" id="label-error"></div>
        </div>

        <div class="form-group">
          <label for="outcome-notes" class="form-label">Notes</label>
          <textarea
            id="outcome-notes"
            class="form-textarea"
            rows="3"
            placeholder="Optional notes about this outcome..."
          >${this.escapeHtml(this.data.notes)}</textarea>
        </div>

        <div class="form-actions">
          ${this.mode==="edit"&&this.callbacks.onDelete?'<button type="button" class="btn btn-danger" id="btn-delete">Delete</button>':""}
          <button type="button" class="btn btn-secondary" id="btn-cancel">Cancel</button>
          <button type="submit" class="btn btn-primary" id="btn-submit">${t}</button>
        </div>
      </form>
    `,this.bindEvents()}bindEvents(){const e=this.container.querySelector("form"),t=this.container.querySelector("#outcome-label"),i=this.container.querySelector("#outcome-notes"),n=this.container.querySelector("#btn-cancel"),a=this.container.querySelector("#btn-delete");t.addEventListener("input",()=>{this.data.label=t.value,this.validateField("label")}),i.addEventListener("input",()=>{this.data.notes=i.value}),e.addEventListener("submit",o=>{o.preventDefault(),this.validate()&&this.callbacks.onSave(this.data)}),n.addEventListener("click",()=>{this.callbacks.onCancel()}),a&&this.callbacks.onDelete&&a.addEventListener("click",()=>{confirm("Are you sure you want to delete this outcome? This will also remove all connected links.")&&this.callbacks.onDelete()})}validateField(e){if(this.errors=this.errors.filter(t=>t.field!==e),e==="label"){const t=q(this.network,"outcome"),i=V(this.data.label,t,this.originalLabel);i&&this.errors.push(i)}return this.updateErrorDisplay(),!this.errors.some(t=>t.field===e)}validate(){this.errors=[];const e=q(this.network,"outcome"),t=V(this.data.label,e,this.originalLabel);return t&&this.errors.push(t),this.updateErrorDisplay(),this.errors.length===0}updateErrorDisplay(){const e=this.container.querySelector("#label-error"),t=this.container.querySelector("#outcome-label"),i=this.errors.find(n=>n.field==="label");i?(e.textContent=i.message,t.classList.add("invalid")):(e.textContent="",t.classList.remove("invalid"))}escapeHtml(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}getData(){return{...this.data}}setNetwork(e){this.network=e}}class Be{container;mode;network;data;originalLabel;callbacks;errors=[];constructor(e,t){this.container=e,this.mode=t.mode,this.network=t.network,this.callbacks=t.callbacks,t.initialData?(this.data={...t.initialData},this.originalLabel=t.initialData.label):this.data={...qt},this.render()}render(){const e=this.mode==="create"?"Add Value":"Edit Value",t=this.mode==="create"?"Create":"Save";this.container.innerHTML=`
      <form class="entity-form value-form" novalidate>
        <h3 class="form-title">${e}</h3>
        
        <div class="form-group">
          <label for="value-label" class="form-label">
            Label <span class="required">*</span>
          </label>
          <input
            type="text"
            id="value-label"
            class="form-input"
            value="${this.escapeHtml(this.data.label)}"
            placeholder="e.g., Health"
            maxlength="100"
            required
          />
          <div class="form-error" id="label-error"></div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="value-importance" class="form-label">Importance</label>
            <select id="value-importance" class="form-select">
              ${Ye.map(i=>`<option value="${i.value}" ${this.data.importance===i.value?"selected":""}>${i.label}</option>`).join("")}
            </select>
          </div>

          <div class="form-group">
            <label for="value-neglect" class="form-label">Current Status</label>
            <select id="value-neglect" class="form-select">
              ${Qe.map(i=>`<option value="${i.value}" ${this.data.neglect===i.value?"selected":""}>${i.label}</option>`).join("")}
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="value-notes" class="form-label">Notes</label>
          <textarea
            id="value-notes"
            class="form-textarea"
            rows="3"
            placeholder="Optional notes about this value..."
          >${this.escapeHtml(this.data.notes)}</textarea>
        </div>

        <div class="form-actions">
          ${this.mode==="edit"&&this.callbacks.onDelete?'<button type="button" class="btn btn-danger" id="btn-delete">Delete</button>':""}
          <button type="button" class="btn btn-secondary" id="btn-cancel">Cancel</button>
          <button type="submit" class="btn btn-primary" id="btn-submit">${t}</button>
        </div>
      </form>
    `,this.bindEvents()}bindEvents(){const e=this.container.querySelector("form"),t=this.container.querySelector("#value-label"),i=this.container.querySelector("#value-importance"),n=this.container.querySelector("#value-neglect"),a=this.container.querySelector("#value-notes"),o=this.container.querySelector("#btn-cancel"),r=this.container.querySelector("#btn-delete");t.addEventListener("input",()=>{this.data.label=t.value,this.validateField("label")}),i.addEventListener("change",()=>{this.data.importance=i.value}),n.addEventListener("change",()=>{this.data.neglect=n.value}),a.addEventListener("input",()=>{this.data.notes=a.value}),e.addEventListener("submit",l=>{l.preventDefault(),this.validate()&&this.callbacks.onSave(this.data)}),o.addEventListener("click",()=>{this.callbacks.onCancel()}),r&&this.callbacks.onDelete&&r.addEventListener("click",()=>{confirm("Are you sure you want to delete this value? This will also remove all connected links.")&&this.callbacks.onDelete()})}validateField(e){if(this.errors=this.errors.filter(t=>t.field!==e),e==="label"){const t=q(this.network,"value"),i=V(this.data.label,t,this.originalLabel);i&&this.errors.push(i)}return this.updateErrorDisplay(),!this.errors.some(t=>t.field===e)}validate(){this.errors=[];const e=q(this.network,"value"),t=V(this.data.label,e,this.originalLabel);return t&&this.errors.push(t),this.updateErrorDisplay(),this.errors.length===0}updateErrorDisplay(){const e=this.container.querySelector("#label-error"),t=this.container.querySelector("#value-label"),i=this.errors.find(n=>n.field==="label");i?(e.textContent=i.message,t.classList.add("invalid")):(e.textContent="",t.classList.remove("invalid"))}escapeHtml(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}getData(){return{...this.data}}setNetwork(e){this.network=e}}class Oe{container;mode;linkType;network;data;callbacks;errors=[];sourceQuery="";targetQuery="";sourceSuggestions=[];targetSuggestions=[];selectedSource=null;selectedTarget=null;constructor(e,t){this.container=e,this.mode=t.mode,this.linkType=t.linkType,this.network=t.network,this.callbacks=t.callbacks,t.initialData?(this.data={...t.initialData},this.selectedSource=this.findNodeById(this.data.sourceId),this.selectedTarget=this.findNodeById(this.data.targetId)):(this.data=this.linkType==="behaviour-outcome"?{...Ht}:{...Ft},t.preselectedSourceId!==void 0&&t.preselectedSourceId!==""&&(this.data.sourceId=t.preselectedSourceId,this.selectedSource=this.findNodeById(t.preselectedSourceId)),t.preselectedTargetId!==void 0&&t.preselectedTargetId!==""&&(this.data.targetId=t.preselectedTargetId,this.selectedTarget=this.findNodeById(t.preselectedTargetId))),this.render()}findNodeById(e){if(e==="")return null;const t=this.network.behaviours.find(a=>a.id===e);if(t)return{id:t.id,label:t.label,type:"behaviour"};const i=this.network.outcomes.find(a=>a.id===e);if(i)return{id:i.id,label:i.label,type:"outcome"};const n=this.network.values.find(a=>a.id===e);return n?{id:n.id,label:n.label,type:"value"}:null}get sourceNodeType(){return this.linkType==="behaviour-outcome"?"behaviour":"outcome"}get targetNodeType(){return this.linkType==="behaviour-outcome"?"outcome":"value"}render(){const e=this.mode==="create"?this.linkType==="behaviour-outcome"?"Link Behaviour → Outcome":"Link Outcome → Value":"Edit Link",t=this.mode==="create"?"Create Link":"Save",i=this.sourceNodeType==="behaviour"?"Behaviour":"Outcome",n=this.targetNodeType==="outcome"?"Outcome":"Value",a=this.linkType==="behaviour-outcome"?`
          <div class="form-group">
            <label for="link-reliability" class="form-label">Reliability</label>
            <select id="link-reliability" class="form-select">
              ${Xe.map(o=>`<option value="${o.value}" ${this.data.reliability===o.value?"selected":""}>${o.label}</option>`).join("")}
            </select>
            <div class="form-hint">How reliably does this behaviour produce this outcome?</div>
          </div>
        `:`
          <div class="form-group">
            <label for="link-strength" class="form-label">Strength</label>
            <select id="link-strength" class="form-select">
              ${Je.map(o=>`<option value="${o.value}" ${this.data.strength===o.value?"selected":""}>${o.label}</option>`).join("")}
            </select>
            <div class="form-hint">How strongly does this outcome contribute to this value?</div>
          </div>
        `;this.container.innerHTML=`
      <form class="entity-form link-form" novalidate>
        <h3 class="form-title">${e}</h3>

        <div class="form-group">
          <label for="link-source" class="form-label">
            ${i} <span class="required">*</span>
          </label>
          <div class="autocomplete-wrapper">
            <input
              type="text"
              id="link-source"
              class="form-input autocomplete-input"
              value="${this.selectedSource?this.escapeHtml(this.selectedSource.label):""}"
              placeholder="Search ${i.toLowerCase()}s..."
              autocomplete="off"
              ${this.mode==="edit"||this.selectedSource?"readonly":""}
            />
            ${this.selectedSource?'<button type="button" class="autocomplete-clear" id="clear-source">×</button>':""}
            <div class="autocomplete-dropdown" id="source-dropdown" style="display: none;"></div>
          </div>
          <div class="form-error" id="source-error"></div>
        </div>

        <div class="link-direction-indicator">↓</div>

        <div class="form-group">
          <label for="link-target" class="form-label">
            ${n} <span class="required">*</span>
          </label>
          <div class="autocomplete-wrapper">
            <input
              type="text"
              id="link-target"
              class="form-input autocomplete-input"
              value="${this.selectedTarget?this.escapeHtml(this.selectedTarget.label):""}"
              placeholder="Search ${n.toLowerCase()}s..."
              autocomplete="off"
              ${this.mode==="edit"||this.selectedTarget?"readonly":""}
            />
            ${this.selectedTarget?'<button type="button" class="autocomplete-clear" id="clear-target">×</button>':""}
            <div class="autocomplete-dropdown" id="target-dropdown" style="display: none;"></div>
          </div>
          <div class="form-error" id="target-error"></div>
        </div>

        <div class="form-group">
          <label for="link-valence" class="form-label">Valence</label>
          <select id="link-valence" class="form-select">
            ${zt.map(o=>`<option value="${o.value}" ${this.data.valence===o.value?"selected":""}>${o.label}</option>`).join("")}
          </select>
          <div class="form-hint">Does this link have a positive or negative effect?</div>
        </div>

        ${a}

        <div class="form-actions">
          ${this.mode==="edit"&&this.callbacks.onDelete?'<button type="button" class="btn btn-danger" id="btn-delete">Delete</button>':""}
          <button type="button" class="btn btn-secondary" id="btn-cancel">Cancel</button>
          <button type="submit" class="btn btn-primary" id="btn-submit">${t}</button>
        </div>
      </form>
    `,this.bindEvents()}bindEvents(){const e=this.container.querySelector("form"),t=this.container.querySelector("#link-source"),i=this.container.querySelector("#link-target"),n=this.container.querySelector("#source-dropdown"),a=this.container.querySelector("#target-dropdown"),o=this.container.querySelector("#link-valence"),r=this.container.querySelector("#btn-cancel"),l=this.container.querySelector("#btn-delete"),c=this.container.querySelector("#clear-source"),u=this.container.querySelector("#clear-target");if(t.readOnly||(t.addEventListener("input",()=>{this.sourceQuery=t.value,this.updateSourceSuggestions()}),t.addEventListener("focus",()=>{this.updateSourceSuggestions()}),t.addEventListener("blur",()=>{setTimeout(()=>{n.style.display="none"},200)})),i.readOnly||(i.addEventListener("input",()=>{this.targetQuery=i.value,this.updateTargetSuggestions()}),i.addEventListener("focus",()=>{this.updateTargetSuggestions()}),i.addEventListener("blur",()=>{setTimeout(()=>{a.style.display="none"},200)})),c&&c.addEventListener("click",()=>{this.selectedSource=null,this.data.sourceId="",this.render()}),u&&u.addEventListener("click",()=>{this.selectedTarget=null,this.data.targetId="",this.render()}),o.addEventListener("change",()=>{this.data.valence=o.value}),this.linkType==="behaviour-outcome"){const h=this.container.querySelector("#link-reliability");h.addEventListener("change",()=>{this.data.reliability=h.value})}else{const h=this.container.querySelector("#link-strength");h.addEventListener("change",()=>{this.data.strength=h.value})}e.addEventListener("submit",h=>{h.preventDefault(),this.validate()&&this.callbacks.onSave(this.data)}),r.addEventListener("click",()=>{this.callbacks.onCancel()}),l&&this.callbacks.onDelete&&l.addEventListener("click",()=>{confirm("Are you sure you want to delete this link?")&&this.callbacks.onDelete()})}updateSourceSuggestions(){const e=this.container.querySelector("#source-dropdown");if(this.sourceSuggestions=$e(this.network,this.sourceNodeType,this.sourceQuery),this.sourceSuggestions.length===0){e.style.display="none";return}e.innerHTML=this.sourceSuggestions.map(t=>`
        <div class="autocomplete-item" data-id="${t.id}">
          <span class="autocomplete-label">${this.escapeHtml(t.label)}</span>
        </div>
      `).join(""),e.style.display="block",e.querySelectorAll(".autocomplete-item").forEach(t=>{t.addEventListener("mousedown",i=>{i.preventDefault();const n=t.dataset.id,a=this.sourceSuggestions.find(o=>o.id===n);a&&this.selectSource(a)})})}updateTargetSuggestions(){const e=this.container.querySelector("#target-dropdown"),t=[];if(this.mode==="create"&&this.data.sourceId&&this.network.links.filter(i=>i.sourceId===this.data.sourceId).forEach(i=>t.push(i.targetId)),this.targetSuggestions=$e(this.network,this.targetNodeType,this.targetQuery,t),this.targetSuggestions.length===0){e.style.display="none";return}e.innerHTML=this.targetSuggestions.map(i=>`
        <div class="autocomplete-item" data-id="${i.id}">
          <span class="autocomplete-label">${this.escapeHtml(i.label)}</span>
        </div>
      `).join(""),e.style.display="block",e.querySelectorAll(".autocomplete-item").forEach(i=>{i.addEventListener("mousedown",n=>{n.preventDefault();const a=i.dataset.id,o=this.targetSuggestions.find(r=>r.id===a);o&&this.selectTarget(o)})})}selectSource(e){this.selectedSource=e,this.data.sourceId=e.id,this.render()}selectTarget(e){this.selectedTarget=e,this.data.targetId=e.id,this.render()}validate(){return this.errors=[],this.data.sourceId||this.errors.push({field:"source",message:`Please select a ${this.sourceNodeType}`}),this.data.targetId||this.errors.push({field:"target",message:`Please select a ${this.targetNodeType}`}),this.mode==="create"&&this.data.sourceId&&this.data.targetId&&Wt(this.network,this.data.sourceId,this.data.targetId)&&this.errors.push({field:"target",message:"A link between these nodes already exists"}),this.updateErrorDisplay(),this.errors.length===0}updateErrorDisplay(){const e=this.container.querySelector("#source-error"),t=this.container.querySelector("#target-error"),i=this.container.querySelector("#link-source"),n=this.container.querySelector("#link-target"),a=this.errors.find(r=>r.field==="source");a?(e.textContent=a.message,i.classList.add("invalid")):(e.textContent="",i.classList.remove("invalid"));const o=this.errors.find(r=>r.field==="target");o?(t.textContent=o.message,n.classList.add("invalid")):(t.textContent="",n.classList.remove("invalid"))}escapeHtml(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}getData(){return{...this.data}}setNetwork(e){this.network=e}}class Pt{container;network;callbacks;selectedNode=null;constructor(e,t){this.container=e,this.network=t.network,this.callbacks=t.callbacks,this.render()}show(e){this.selectedNode=e,this.container.classList.remove("hidden"),this.render()}hide(){this.selectedNode=null,this.container.classList.add("hidden")}setNetwork(e){if(this.network=e,this.selectedNode){const t=this.findNode(this.selectedNode.id);t?(this.selectedNode=t,this.render()):this.hide()}}findNode(e){return this.network.behaviours.find(t=>t.id===e)??this.network.outcomes.find(t=>t.id===e)??this.network.values.find(t=>t.id===e)}render(){if(!this.selectedNode){this.container.innerHTML=`
        <div class="panel-content">
          <div class="panel-header">
            <h2>Select a node</h2>
          </div>
          <p class="panel-placeholder">Click on a node in the graph to see its details.</p>
        </div>
      `;return}const e=this.selectedNode,t=Rt(this.network,e.id),i=t.filter(r=>r.direction==="incoming"),n=t.filter(r=>r.direction==="outgoing"),a=this.getTypeLabel(e.type),o=e.type;this.container.innerHTML=`
      <div class="panel-content">
        <div class="panel-header">
          <button class="panel-close" id="btn-close" aria-label="Close panel">×</button>
          <span class="node-type-badge ${o}">${a}</span>
          <h2 class="panel-title">${this.escapeHtml(e.label)}</h2>
        </div>

        <div class="panel-section">
          <h3>Attributes</h3>
          ${this.renderAttributes(e)}
        </div>

        ${i.length>0?this.renderConnections("Incoming Links",i,"incoming"):""}
        ${n.length>0?this.renderConnections("Outgoing Links",n,"outgoing"):""}

        <div class="panel-section panel-actions-section">
          ${this.renderAddLinkButtons(e)}
          <div class="panel-action-buttons">
            <button class="btn btn-secondary" id="btn-edit">Edit</button>
            <button class="btn btn-danger" id="btn-delete">Delete</button>
          </div>
        </div>
      </div>
    `,this.bindEvents()}renderAttributes(e){switch(e.type){case"behaviour":return this.renderBehaviourAttributes(e);case"outcome":return this.renderOutcomeAttributes(e);case"value":return this.renderValueAttributes(e)}}renderBehaviourAttributes(e){const t=Ge.find(n=>n.value===e.frequency)?.label??e.frequency,i=Ue.find(n=>n.value===e.cost)?.label??e.cost;return`
      <dl class="attribute-list">
        <dt>Frequency</dt>
        <dd>${t}</dd>
        <dt>Cost</dt>
        <dd>${i}</dd>
        ${e.contextTags.length>0?`<dt>Tags</dt><dd>${e.contextTags.map(n=>`<span class="tag">${this.escapeHtml(n)}</span>`).join(" ")}</dd>`:""}
        ${e.notes!==void 0&&e.notes!==""?`<dt>Notes</dt><dd class="notes">${this.escapeHtml(e.notes)}</dd>`:""}
      </dl>
    `}renderOutcomeAttributes(e){return`
      <dl class="attribute-list">
        ${e.notes!==void 0&&e.notes!==""?`<dt>Notes</dt><dd class="notes">${this.escapeHtml(e.notes)}</dd>`:'<p class="no-attributes">No additional attributes</p>'}
      </dl>
    `}renderValueAttributes(e){const t=Ye.find(n=>n.value===e.importance)?.label??e.importance,i=Qe.find(n=>n.value===e.neglect)?.label??e.neglect;return`
      <dl class="attribute-list">
        <dt>Importance</dt>
        <dd>${t}</dd>
        <dt>Current Status</dt>
        <dd>${i}</dd>
        ${e.notes!==void 0&&e.notes!==""?`<dt>Notes</dt><dd class="notes">${this.escapeHtml(e.notes)}</dd>`:""}
      </dl>
    `}renderConnections(e,t,i){return`
      <div class="panel-section">
        <h3>${e}</h3>
        <ul class="connection-list">
          ${t.map(n=>{const a=n.type,o=n.valence,r=n.strength!==void 0?Je.find(l=>l.value===n.strength)?.label:n.reliability!==void 0?Xe.find(l=>l.value===n.reliability)?.label:"";return`
              <li class="connection-item">
                <div class="connection-main">
                  <span class="connection-direction">${i==="incoming"?"←":"→"}</span>
                  <span class="node-type-dot ${a}"></span>
                  <a href="#" class="connection-label" data-node-id="${n.id}">${this.escapeHtml(n.label)}</a>
                </div>
                <div class="connection-meta">
                  <span class="valence-badge ${o}">${n.valence==="positive"?"+":"−"}</span>
                  ${r!==""?`<span class="strength-label">${r}</span>`:""}
                  <button class="btn-icon" data-link-id="${n.linkId}" data-action="edit-link" title="Edit link">✎</button>
                  <button class="btn-icon btn-icon-danger" data-link-id="${n.linkId}" data-action="delete-link" title="Delete link">×</button>
                </div>
              </li>
            `}).join("")}
        </ul>
      </div>
    `}renderAddLinkButtons(e){const t=[];return e.type==="behaviour"&&t.push('<button class="btn btn-sm" id="btn-add-outgoing">+ Link to Outcome</button>'),e.type==="outcome"&&(t.push('<button class="btn btn-sm" id="btn-add-incoming">+ Link from Behaviour</button>'),t.push('<button class="btn btn-sm" id="btn-add-outgoing">+ Link to Value</button>')),e.type==="value"&&t.push('<button class="btn btn-sm" id="btn-add-incoming">+ Link from Outcome</button>'),t.length>0?`<div class="add-link-buttons">${t.join("")}</div>`:""}getTypeLabel(e){switch(e){case"behaviour":return"Behaviour";case"outcome":return"Outcome";case"value":return"Value"}}bindEvents(){const e=this.container.querySelector("#btn-close"),t=this.container.querySelector("#btn-edit"),i=this.container.querySelector("#btn-delete"),n=this.container.querySelector("#btn-add-incoming"),a=this.container.querySelector("#btn-add-outgoing");e?.addEventListener("click",()=>{this.callbacks.onClose()}),t?.addEventListener("click",()=>{this.selectedNode&&this.callbacks.onEdit(this.selectedNode)}),i?.addEventListener("click",()=>{this.selectedNode&&confirm(`Are you sure you want to delete "${this.selectedNode.label}"? This will also remove all connected links.`)&&this.callbacks.onDelete(this.selectedNode)}),n?.addEventListener("click",()=>{this.selectedNode&&this.callbacks.onAddLink(this.selectedNode.id,"incoming")}),a?.addEventListener("click",()=>{this.selectedNode&&this.callbacks.onAddLink(this.selectedNode.id,"outgoing")}),this.container.querySelectorAll(".connection-label").forEach(o=>{o.addEventListener("click",r=>{r.preventDefault();const l=o.dataset.nodeId;l!==void 0&&l!==""&&this.callbacks.onSelectNode(l)})}),this.container.querySelectorAll('[data-action="edit-link"]').forEach(o=>{o.addEventListener("click",()=>{const r=o.dataset.linkId;r!==void 0&&r!==""&&this.callbacks.onEditLink(r)})}),this.container.querySelectorAll('[data-action="delete-link"]').forEach(o=>{o.addEventListener("click",()=>{const r=o.dataset.linkId;r!==void 0&&r!==""&&confirm("Are you sure you want to delete this link?")&&this.callbacks.onDeleteLink(r)})})}escapeHtml(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}}function _t(s){return{always:1,usually:.75,sometimes:.5,rarely:.25}[s]}function jt(s){return{strong:1,moderate:.6,weak:.3}[s]}function Gt(s){const e=s.behaviours.map(o=>({id:o.id,label:o.label,type:"behaviour",data:o})),t=s.outcomes.map(o=>({id:o.id,label:o.label,type:"outcome",data:o})),i=s.values.map(o=>({id:o.id,label:o.label,type:"value",data:o})),n=[...e,...t,...i],a=s.links.map(o=>{const r=o.type==="behaviour-outcome"?_t(o.reliability):jt(o.strength);return{id:o.id,source:o.sourceId,target:o.targetId,type:o.type,valence:o.valence,strength:r,data:o}});return{nodes:n,edges:a}}function Ut(s,e){const t=new Set;for(const i of s.edges){const n=typeof i.source=="string"?i.source:i.source.id,a=typeof i.target=="string"?i.target:i.target.id;n===e?t.add(a):a===e&&t.add(n)}return t}function Yt(s,e){const t=new Set;for(const i of s.edges){const n=typeof i.source=="string"?i.source:i.source.id,a=typeof i.target=="string"?i.target:i.target.id;(n===e||a===e)&&t.add(i.id)}return t}function Qt(s,e=20){return s.length<=e?s:s.substring(0,e-1)+"…"}function Xt(s,e){const t=s.append("defs");t.append("marker").attr("id","arrow-positive").attr("viewBox","0 -5 10 10").attr("refX",10).attr("refY",0).attr("markerWidth",6).attr("markerHeight",6).attr("orient","auto").append("path").attr("d","M0,-5L10,0L0,5").attr("fill",e.edges.positive.stroke),t.append("marker").attr("id","arrow-negative").attr("viewBox","0 -5 10 10").attr("refX",10).attr("refY",0).attr("markerWidth",6).attr("markerHeight",6).attr("orient","auto").append("path").attr("d","M0,-5L10,0L0,5").attr("fill",e.edges.negative.stroke),t.append("filter").attr("id","drop-shadow").attr("x","-50%").attr("y","-50%").attr("width","200%").attr("height","200%").append("feDropShadow").attr("dx",0).attr("dy",2).attr("stdDeviation",4).attr("flood-color","rgba(0,0,0,0.3)")}function G(s,e){return s.nodes[e]}function Jt(s,e){s.append("rect").attr("class","node-shape").attr("x",-e.width/2).attr("y",-e.height/2).attr("width",e.width).attr("height",e.height).attr("rx",8).attr("ry",8).attr("fill",e.fill).attr("stroke",e.stroke).attr("stroke-width",2)}function Zt(s,e){const t=e.width/2,i=e.height/2,n=[[0,-i],[t,0],[0,i],[-t,0]].map(a=>a.join(",")).join(" ");s.append("polygon").attr("class","node-shape").attr("points",n).attr("fill",e.fill).attr("stroke",e.stroke).attr("stroke-width",2)}function Kt(s,e){const t=Math.min(e.width,e.height)/2;s.append("circle").attr("class","node-shape").attr("r",t).attr("fill",e.fill).attr("stroke",e.stroke).attr("stroke-width",2)}function es(s,e){s.each(function(t){const i=M(this),n=G(e,t.type);switch(n.shape){case"rect":Jt(i,n);break;case"diamond":Zt(i,n);break;case"circle":Kt(i,n);break}})}function ts(s,e){s.append("text").attr("class","node-label").attr("text-anchor","middle").attr("dominant-baseline","middle").attr("fill",e.text.fill).attr("font-size",e.text.fontSize).attr("font-family",e.text.fontFamily).attr("pointer-events","none").text(t=>Qt(t.label))}function Ae(s,e,t,i){const n=G(i,s.type),a=s.x??0,o=s.y??0,r=e-a,l=t-o,c=Math.atan2(l,r);switch(n.shape){case"rect":{const u=n.width/2,h=n.height/2,p=Math.abs(Math.tan(c));let v,m;return p<h/u?(v=r>0?u:-u,m=v*Math.tan(c)):(m=l>0?h:-h,v=m/Math.tan(c)),{x:a+v,y:o+m}}case"diamond":{const u=n.width/2,h=n.height/2,p=Math.abs(c);let v;return p<Math.PI/2,v=1/(Math.abs(Math.cos(c))/u+Math.abs(Math.sin(c))/h),{x:a+v*Math.cos(c),y:o+v*Math.sin(c)}}case"circle":{const u=Math.min(n.width,n.height)/2;return{x:a+u*Math.cos(c),y:o+u*Math.sin(c)}}}}const ss={nodes:{behaviour:{shape:"rect",fill:"#3b82f6",stroke:"#1d4ed8",width:140,height:50},outcome:{shape:"diamond",fill:"#f59e0b",stroke:"#d97706",width:120,height:60},value:{shape:"circle",fill:"#10b981",stroke:"#059669",width:100,height:100}},edges:{positive:{stroke:"#6b7280",strokeDasharray:"",markerEnd:"url(#arrow-positive)"},negative:{stroke:"#ef4444",strokeDasharray:"8,4",markerEnd:"url(#arrow-negative)"}},background:"#f9fafb",text:{fill:"#ffffff",fontSize:12,fontFamily:"system-ui, -apple-system, sans-serif"}},is={type:"force",linkDistance:240,chargeStrength:-420,collisionRadius:24},ns={width:1200,height:800,layout:is,theme:ss,zoomExtent:[.25,4],transitionDuration:300},Z={min:1,max:4},K={min:.3,max:1};function as(s){return Z.min+s*(Z.max-Z.min)}function os(s){return K.min+s*(K.max-K.min)}function rs(s,e,t){const i=s.x??0,n=s.y??0,a=e.x??0,o=e.y??0,r=Ae(s,a,o,t),l=Ae(e,i,n,t),c=l.x-r.x,u=l.y-r.y,h=Math.sqrt(c*c+u*u),p=8,v={x:l.x-c/h*p,y:l.y-u/h*p};return`M ${r.x},${r.y} L ${v.x},${v.y}`}function ls(s,e,t){const i=s.selectAll("path.edge").data(e,o=>o.id);i.exit().remove();const a=i.enter().append("path").attr("class","edge").attr("fill","none").merge(i);return a.each(function(o){const r=M(this),l=t.edges[o.valence];r.attr("stroke",l.stroke).attr("stroke-dasharray",l.strokeDasharray).attr("stroke-width",as(o.strength)).attr("opacity",os(o.strength)).attr("marker-end",l.markerEnd)}),a}function cs(s,e){s.attr("d",t=>{const i=t.source,n=t.target;return rs(i,n,e)})}const ds={behaviour:0,outcome:1,value:2};function De(s,e,t,i){const n={0:[],1:[],2:[]};for(const l of s.nodes){const c=ds[l.type];n[c].push(l)}const a=2*e.columnGap+2*e.padding,o=(t-a)/2+e.padding,r=[o,o+e.columnGap,o+2*e.columnGap];for(let l=0;l<3;l++){const c=n[l],u=(c.length-1)*e.rowGap,h=(i-u)/2;c.forEach((p,v)=>{p.x=r[l],p.y=h+v*e.rowGap})}}function us(s){const e=new Map;for(const l of s.nodes)e.set(l.id,new Set);for(const l of s.edges){const c=typeof l.source=="string"?l.source:l.source.id,u=typeof l.target=="string"?l.target:l.target.id;e.get(c)?.add(u),e.get(u)?.add(c)}const t=s.nodes.filter(l=>l.type==="behaviour"),i=s.nodes.filter(l=>l.type==="outcome"),n=s.nodes.filter(l=>l.type==="value");i.sort((l,c)=>{const u=e.get(l.id)?.size??0;return(e.get(c.id)?.size??0)-u});const a=l=>{const c=e.get(l);if(!c||c.size===0)return 0;let u=0,h=0;for(const p of c){const v=i.find(m=>m.id===p);v?.y!==void 0&&(u+=v.y,h++)}return h>0?u/h:0},o=(i.length-1)*80;i.forEach((l,c)=>{l.y=c*80-o/2}),t.sort((l,c)=>a(l.id)-a(c.id));const r=l=>{const c=e.get(l);if(!c||c.size===0)return 0;let u=0,h=0;for(const p of c){const v=i.find(m=>m.id===p);v?.y!==void 0&&(u+=v.y,h++)}return h>0?u/h:0};n.sort((l,c)=>r(l.id)-r(c.id)),s.nodes.length=0,s.nodes.push(...t,...i,...n)}const w=12,I=24,f=16,oe=8,Ve=16;function hs(s,e,t){s.select(".legend").remove();const i=s.append("g").attr("class","legend").attr("transform",`translate(${t.x}, ${t.y})`),n=i.append("rect").attr("class","legend-bg").attr("fill","white").attr("stroke","#e5e7eb").attr("stroke-width",1).attr("rx",8);let a=w;return i.append("text").attr("class","legend-title").attr("x",w).attr("y",a+12).attr("font-size",12).attr("font-weight","bold").attr("fill","#374151").text("Legend"),a+=I+4,i.append("text").attr("class","legend-section").attr("x",w).attr("y",a+10).attr("font-size",10).attr("fill","#6b7280").text("Node Types"),a+=I-4,ee(i,w,a,"Behaviour",e.nodes.behaviour),a+=I,ee(i,w,a,"Outcome",e.nodes.outcome),a+=I,ee(i,w,a,"Value",e.nodes.value),a+=I+Ve,i.append("text").attr("class","legend-section").attr("x",w).attr("y",a+10).attr("font-size",10).attr("fill","#6b7280").text("Edge Valence"),a+=I-4,qe(i,w,a,"Positive",e.edges.positive.stroke,""),a+=I,qe(i,w,a,"Negative",e.edges.negative.stroke,"8,4"),a+=I+Ve,i.append("text").attr("class","legend-section").attr("x",w).attr("y",a+10).attr("font-size",10).attr("fill","#6b7280").text("Edge Strength"),a+=I-4,te(i,w,a,"Strong",4,1),a+=I,te(i,w,a,"Moderate",2.5,.7),a+=I,te(i,w,a,"Weak",1,.4),a+=I,n.attr("width",140).attr("height",a+w),i}function ee(s,e,t,i,n){const a=e+f/2,o=t+f/2;switch(n.shape){case"rect":s.append("rect").attr("x",e).attr("y",t).attr("width",f).attr("height",f).attr("rx",3).attr("fill",n.fill);break;case"diamond":s.append("polygon").attr("points",`${a},${t} ${e+f},${o} ${a},${t+f} ${e},${o}`).attr("fill",n.fill);break;case"circle":s.append("circle").attr("cx",a).attr("cy",o).attr("r",f/2).attr("fill",n.fill);break}s.append("text").attr("x",e+f+oe).attr("y",t+f/2+4).attr("font-size",11).attr("fill","#374151").text(i)}function qe(s,e,t,i,n,a){s.append("line").attr("x1",e).attr("y1",t+f/2).attr("x2",e+f+8).attr("y2",t+f/2).attr("stroke",n).attr("stroke-width",2).attr("stroke-dasharray",a),s.append("text").attr("x",e+f+oe+8).attr("y",t+f/2+4).attr("font-size",11).attr("fill","#374151").text(i)}function te(s,e,t,i,n,a){s.append("line").attr("x1",e).attr("y1",t+f/2).attr("x2",e+f+8).attr("y2",t+f/2).attr("stroke","#6b7280").attr("stroke-width",n).attr("opacity",a),s.append("text").attr("x",e+f+oe+8).attr("y",t+f/2+4).attr("font-size",11).attr("fill","#374151").text(i)}class vs{svg;zoomGroup;edgeGroup;nodeGroup;options;graphData;interactionState;forceSimulation=null;zoom;edgeSelection=null;nodeSelection=null;keydownHandler=null;onNodeClick;onNodeHover;onBackgroundClick;constructor(e,t={}){this.options={...ns,...t},this.graphData={nodes:[],edges:[]},this.interactionState={selectedNodeId:null,hoveredNodeId:null,hoveredEdgeId:null,hoverHighlightedNodeIds:new Set,modeHighlightedNodeIds:new Set,searchQuery:"",nodeTypeVisibility:{behaviour:!0,outcome:!0,value:!0},valenceVisibility:{positive:!0,negative:!0}},this.svg=M(e).append("svg").attr("width",this.options.width).attr("height",this.options.height).attr("class","network-graph").style("background",this.options.theme.background),Xt(this.svg,this.options.theme),this.zoomGroup=this.svg.append("g").attr("class","zoom-group"),this.edgeGroup=this.zoomGroup.append("g").attr("class","edges"),this.nodeGroup=this.zoomGroup.append("g").attr("class","nodes"),this.zoom=Lt().scaleExtent(this.options.zoomExtent).on("zoom",i=>{this.zoomGroup.attr("transform",i.transform.toString())}),this.svg.call(this.zoom),this.keydownHandler=i=>{if(i.key!=="Escape")return;const a=i.target?.tagName?.toLowerCase();a&&(a==="input"||a==="textarea"||a==="select")||(this.clearSelection(),this.onBackgroundClick?.())},document.addEventListener("keydown",this.keydownHandler),this.svg.on("click",i=>{i.target===this.svg.node()&&(this.clearSelection(),this.onBackgroundClick?.())}),this.renderLegend()}setNetwork(e){this.stopForceSimulation(),this.graphData=Gt(e);const t=new Map(this.graphData.nodes.map(i=>[i.id,i]));for(const i of this.graphData.edges){const n=typeof i.source=="string"?i.source:i.source.id,a=typeof i.target=="string"?i.target:i.target.id,o=t.get(n),r=t.get(a);o&&(i.source=o),r&&(i.target=r)}us(this.graphData),this.options.layout.type==="layered"?De(this.graphData,this.options.layout,this.options.width,this.options.height):this.startForceSimulation(),this.render(),this.updateSelectionState()}resize(e,t){if(this.options.width=e,this.options.height=t,this.svg.attr("width",e).attr("height",t),this.options.layout.type==="layered")De(this.graphData,this.options.layout,e,t);else{const i=Le(e/2,t/2);this.forceSimulation?.force("center",i),this.forceSimulation?.alpha(.4).restart()}this.updatePositions(),this.renderLegend()}fitToView(){if(this.graphData.nodes.length===0)return;const e=this.calculateBounds(),t=40,i=e.maxX-e.minX+t*2,n=e.maxY-e.minY+t*2,a=Math.min(this.options.width/i,this.options.height/n,1),o=(e.minX+e.maxX)/2,r=(e.minY+e.maxY)/2,l=xe.translate(this.options.width/2,this.options.height/2).scale(a).translate(-o,-r);this.svg.transition().duration(this.options.transitionDuration).call(c=>this.zoom.transform(c,l))}resetZoom(){this.svg.transition().duration(this.options.transitionDuration).call(e=>this.zoom.transform(e,xe))}selectNode(e){this.interactionState.selectedNodeId=e,this.updateSelectionState()}clearSelection(){this.interactionState.selectedNodeId=null,this.interactionState.hoverHighlightedNodeIds.clear(),this.updateSelectionState()}setOnNodeClick(e){this.onNodeClick=e}setOnNodeHover(e){this.onNodeHover=e}setOnBackgroundClick(e){this.onBackgroundClick=e}setSearchQuery(e){this.interactionState.searchQuery=e,e.trim()!==""&&this.interactionState.hoverHighlightedNodeIds.clear(),this.updateSelectionState()}setNodeTypeVisibility(e,t){this.interactionState.nodeTypeVisibility[e]=t,this.updateSelectionState()}setValenceVisibility(e,t){this.interactionState.valenceVisibility[e]=t,this.updateSelectionState()}setHighlightedNodes(e){this.interactionState.modeHighlightedNodeIds=e,e.size>0&&this.interactionState.hoverHighlightedNodeIds.clear(),this.updateSelectionState()}clearHighlights(){this.interactionState.modeHighlightedNodeIds.clear(),this.updateSelectionState()}destroy(){this.stopForceSimulation(),this.keydownHandler&&document.removeEventListener("keydown",this.keydownHandler),this.svg.remove()}render(){this.renderEdges(),this.renderNodes(),this.updatePositions(),this.options.layout.type==="force"&&!this.forceSimulation&&this.startForceSimulation()}buildNodeAriaLabel(e){return`${`${e.type.charAt(0).toUpperCase()}${e.type.slice(1)}`} node ${e.label}. Press Enter to select.`}renderEdges(){this.edgeSelection=ls(this.edgeGroup,this.graphData.edges,this.options.theme),this.edgeSelection.on("mouseenter",(e,t)=>{this.interactionState.hoveredEdgeId=t.id}).on("mouseleave",()=>{this.interactionState.hoveredEdgeId=null})}renderNodes(){const e=this.nodeGroup.selectAll("g.node").data(this.graphData.nodes,i=>i.id);e.exit().remove();const t=e.enter().append("g").attr("class","node").attr("tabindex",0).attr("role","button").attr("focusable","true").attr("aria-keyshortcuts","Enter Space").attr("aria-label",i=>this.buildNodeAriaLabel(i)).style("cursor","pointer");es(t,this.options.theme),ts(t,this.options.theme),this.nodeSelection=t.merge(e),this.nodeSelection.attr("tabindex",0).attr("role","button").attr("focusable","true").attr("aria-keyshortcuts","Enter Space").attr("aria-label",i=>this.buildNodeAriaLabel(i)),this.nodeSelection.on("click",(i,n)=>{i.stopPropagation(),this.selectNode(n.id),this.onNodeClick?.(n)}).on("keydown",(i,n)=>{(i.key==="Enter"||i.key===" ")&&(i.preventDefault(),this.selectNode(n.id),this.onNodeClick?.(n))}).on("focus",(i,n)=>{this.interactionState.hoveredNodeId=n.id,this.highlightConnected(n.id),this.onNodeHover?.(n)}).on("blur",()=>{this.interactionState.hoveredNodeId=null,this.clearHighlight(),this.onNodeHover?.(null)}).on("mouseenter",(i,n)=>{this.interactionState.hoveredNodeId=n.id,this.highlightConnected(n.id),this.onNodeHover?.(n)}).on("mouseleave",()=>{this.interactionState.hoveredNodeId=null,this.interactionState.selectedNodeId===null&&this.clearHighlight(),this.onNodeHover?.(null)}),this.options.layout.type==="force"&&this.enableNodeDragging()}updatePositions(){this.nodeSelection?.attr("transform",e=>`translate(${e.x??0}, ${e.y??0})`),this.edgeSelection&&cs(this.edgeSelection,this.options.theme)}updateSelectionState(){const e=this.interactionState.selectedNodeId,{nodeTypeVisibility:t,valenceVisibility:i,searchQuery:n}=this.interactionState,a=n.trim()!=="",o=new Map(this.graphData.nodes.map(p=>[p.id,p])),r=this.interactionState.modeHighlightedNodeIds,l=this.interactionState.hoverHighlightedNodeIds,c=r.size>0,u=!c&&!a&&l.size>0,h=c?r:u?l:new Set;this.nodeSelection?.each(function(p){const v=M(this),m=p.id===e,L=t[p.type],x=!a||p.label.toLowerCase().includes(n.toLowerCase().trim()),E=h.has(p.id)||a&&x,$=!L,X=a&&!x,J=c&&!r.has(p.id),P=u&&!l.has(p.id)&&p.id!==e,A=!m&&($||X||J||P);v.classed("selected",m),v.classed("highlighted",E),v.classed("dimmed",A),v.attr("aria-pressed",m?"true":"false"),v.select(".node-shape").attr("filter",m?"url(#drop-shadow)":null).attr("stroke-width",m?3:2).attr("opacity",A?.3:1),v.select(".node-label").attr("opacity",A?.3:1)}),this.edgeSelection?.each(function(p){const v=M(this),m=typeof p.source=="string"?p.source:p.source.id,L=typeof p.target=="string"?p.target:p.target.id,x=o.get(m),E=o.get(L),$=i[p.valence],X=x?t[x.type]:!0,J=E?t[E.type]:!0,P=!$||!X||!J;if(v.classed("filtered-hidden",P),P){v.style("display","none");return}v.style("display",null);const A=m===e||L===e,we=h.has(m)||h.has(L),wt=c&&!we&&!A,Se=n.toLowerCase().trim(),St=!a||(x?.label.toLowerCase().includes(Se)??!1),It=!a||(E?.label.toLowerCase().includes(Se)??!1),Ie=wt||a&&!St&&!It||u&&!we&&!A;v.classed("dimmed",Ie),v.attr("opacity",Ie?.15:null)})}highlightConnected(e){if(this.interactionState.modeHighlightedNodeIds.size>0||this.interactionState.searchQuery.trim()!=="")return;const t=Ut(this.graphData,e);Yt(this.graphData,e),this.interactionState.hoverHighlightedNodeIds=new Set([e,...t]),this.updateSelectionState()}clearHighlight(){this.interactionState.hoverHighlightedNodeIds.clear(),this.updateSelectionState()}calculateBounds(){let e=1/0,t=1/0,i=-1/0,n=-1/0;for(const a of this.graphData.nodes){const o=G(this.options.theme,a.type),r=a.x??0,l=a.y??0,c=o.width/2,u=o.height/2;e=Math.min(e,r-c),t=Math.min(t,l-u),i=Math.max(i,r+c),n=Math.max(n,l+u)}return{minX:e,minY:t,maxX:i,maxY:n}}renderLegend(){hs(this.svg,this.options.theme,{x:this.options.width-160,y:20})}startForceSimulation(){if(this.graphData.nodes.length===0||this.options.layout.type!=="force")return;const e=this.options.layout,t=this.options.theme,i=xt(this.graphData.edges).id(r=>r.id).distance(r=>{const l=e.linkDistance;return Math.max(80,l*(1-r.strength*.4))}).strength(r=>.25+r.strength*.75),n=Et().strength(e.chargeStrength),a=$t(r=>{const l=G(t,r.type);return Math.max(l.width,l.height)/2+e.collisionRadius}),o=Le(this.options.width/2,this.options.height/2);this.forceSimulation=Nt(this.graphData.nodes).force("link",i).force("charge",n).force("collision",a).force("center",o).velocityDecay(.25).alpha(1).on("tick",()=>this.updatePositions())}stopForceSimulation(){this.forceSimulation&&(this.forceSimulation.stop(),this.forceSimulation=null)}enableNodeDragging(){if(!this.nodeSelection)return;const e=Ct().on("start",(t,i)=>{t.sourceEvent.stopPropagation(),!t.active&&this.forceSimulation&&this.forceSimulation.alphaTarget(.3).restart(),i.fx=i.x??t.x,i.fy=i.y??t.y}).on("drag",(t,i)=>{i.fx=t.x,i.fy=t.y}).on("end",(t,i)=>{t.active||this.forceSimulation?.alphaTarget(0),i.fx=i.x,i.fy=i.y});this.nodeSelection.call(e)}}const ps={always:1,usually:.75,sometimes:.5,rarely:.25};function ms(s){return ps[s]}const bs={strong:1,moderate:.6,weak:.3};function fs(s){return bs[s]}const gs={positive:1,negative:-1};function Me(s){return gs[s]}const ys={trivial:1,low:2,medium:4,high:8,"very-high":16};function ks(s){return ys[s]}const ws={critical:4,high:3,medium:2,low:1};function Ze(s){return ws[s]}const Ss={"severely-neglected":4,"somewhat-neglected":3,"adequately-met":2,"well-satisfied":1};function Is(s){return Ss[s]}function Ls(s){return s.behaviours}function xs(s){return s.values}function Es(s){return s.links.filter(e=>e.type==="behaviour-outcome")}function $s(s){return s.links.filter(e=>e.type==="outcome-value")}function Ns(s,e){return s.values.find(t=>t.id===e)}function Ke(s){const e=[],t=Es(s),i=$s(s);for(const n of t){const a=n.targetId,o=i.filter(r=>r.sourceId===a);for(const r of o){const l=Ns(s,r.targetId);if(!l)continue;const c=Me(n.valence),u=Me(r.valence),h=c*u,p=h>0?"positive":"negative",v=ms(n.reliability),m=fs(r.strength),L=v*m,x=Ze(l.importance),E=h*L*x;e.push({behaviourId:n.sourceId,outcomeId:a,valueId:r.targetId,boLinkId:n.id,ovLinkId:r.id,effectiveValence:p,pathWeight:L,influence:E})}}return e}function re(s){const e=Ke(s),t=Ls(s),i=new Map;for(const n of t)i.set(n.id,{behaviourId:n.id,paths:[],positiveInfluence:0,negativeInfluence:0,netInfluence:0,positiveValueIds:new Set,negativeValueIds:new Set,outcomeIds:new Set});for(const n of e){const a=i.get(n.behaviourId);a&&(a.paths.push(n),a.outcomeIds.add(n.outcomeId),n.influence>0?(a.positiveInfluence+=n.influence,a.positiveValueIds.add(n.valueId)):n.influence<0&&(a.negativeInfluence+=Math.abs(n.influence),a.negativeValueIds.add(n.valueId)))}for(const n of i.values())n.netInfluence=n.positiveInfluence-n.negativeInfluence;return i}function Cs(s){const e=Ke(s),t=xs(s),i=new Map;for(const n of t)i.set(n.id,{valueId:n.id,paths:[],positiveSupport:0,negativeSupport:0,netSupport:0,supportingBehaviourIds:new Set,harmingBehaviourIds:new Set});for(const n of e){const a=i.get(n.valueId);a&&(a.paths.push(n),n.influence>0?(a.positiveSupport+=n.influence,a.supportingBehaviourIds.add(n.behaviourId)):n.influence<0&&(a.negativeSupport+=Math.abs(n.influence),a.harmingBehaviourIds.add(n.behaviourId)))}for(const n of i.values())n.netSupport=n.positiveSupport-n.negativeSupport;return i}const T=1/0,Ts=3,Bs=.5,Os=5;function As(s,e){const t=ks(s.cost);return e.netInfluence/t}function Ds(s){return s.positiveValueIds.size}function Vs(s){return Math.min(s.positiveInfluence,s.negativeInfluence)}function qs(s,e){const t=Ze(s.importance),i=Is(s.neglect),n=e.positiveSupport;return n<=0?T:t*i/n}function le(s){const e=re(s),t=new Map;for(const i of s.behaviours){const n=e.get(i.id);n&&t.set(i.id,{behaviourId:i.id,leverageScore:As(i,n),coverage:Ds(n),conflictIndex:Vs(n),positiveInfluence:n.positiveInfluence,negativeInfluence:n.negativeInfluence})}return t}function et(s){const e=Cs(s),t=new Map;for(const i of s.values){const n=e.get(i.id);n&&t.set(i.id,{valueId:i.id,fragilityScore:qs(i,n),supportStrength:n.positiveSupport,supportingBehaviours:Array.from(n.supportingBehaviourIds)})}return t}function ce(s,e=Os){const t=le(s),i=re(s);return Array.from(t.entries()).filter(([a,o])=>o.leverageScore>0).sort((a,o)=>o[1].leverageScore-a[1].leverageScore).slice(0,e).map(([a,o])=>{const r=s.behaviours.find(h=>h.id===a),l=i.get(a);if(!r||!l)throw new Error(`Behaviour not found: ${a}`);const c=s.values.filter(h=>l.positiveValueIds.has(h.id)),u=s.outcomes.filter(h=>l.outcomeIds.has(h.id)).map(h=>h.label);return{behaviour:r,metrics:o,supportedValues:c,viaOutcomes:u}})}function de(s,e=Ts){const t=et(s);return Array.from(t.entries()).filter(([n,a])=>a.fragilityScore>e||a.fragilityScore===T).sort((n,a)=>n[1].fragilityScore===T&&a[1].fragilityScore!==T?-1:a[1].fragilityScore===T&&n[1].fragilityScore!==T?1:a[1].fragilityScore-n[1].fragilityScore).map(([n,a])=>{const o=s.values.find(l=>l.id===n);if(!o)throw new Error(`Value not found: ${n}`);const r=s.behaviours.filter(l=>a.supportingBehaviours.includes(l.id));return{value:o,metrics:a,supportingBehaviours:r,isOrphan:a.fragilityScore===T}})}function ue(s,e=Bs){const t=le(s),i=re(s);return Array.from(t.entries()).filter(([a,o])=>o.conflictIndex>e).sort((a,o)=>o[1].conflictIndex-a[1].conflictIndex).map(([a,o])=>{const r=s.behaviours.find(h=>h.id===a),l=i.get(a);if(!r||!l)throw new Error(`Behaviour not found: ${a}`);const c=s.values.filter(h=>l.positiveValueIds.has(h.id)),u=s.values.filter(h=>l.negativeValueIds.has(h.id));return{behaviour:r,metrics:o,positiveValues:c,negativeValues:u}})}function Ms(s){return{behaviourMetrics:le(s),valueMetrics:et(s),topLeverage:ce(s),fragileValues:de(s),conflictBehaviours:ue(s)}}class Hs{container;network;callbacks;analysis=null;expandedSections=new Set(["leverage"]);constructor(e,t){this.container=e,this.network=t.network,this.callbacks=t.callbacks,this.render()}setNetwork(e){this.network=e,this.analysis=null,this.render()}getAnalysis(){return this.analysis??=Ms(this.network),this.analysis}refresh(){this.analysis=null,this.render()}render(){const e=this.getAnalysis();this.container.innerHTML=`
      <div class="insights-panel">
        ${this.renderHeader(e)}
        ${this.renderSections(e)}
      </div>
    `,this.bindEvents()}renderHeader(e){const t=e.topLeverage.length>0||e.fragileValues.length>0||e.conflictBehaviours.length>0;return`
      <div class="insights-header">
        <div class="insights-status ${t?"has-insights":"no-insights"}">
          <span class="status-icon">${t?"📊":"📈"}</span>
          <span class="status-text">${t?"Insights available":"Add more data for insights"}</span>
        </div>
        <button class="btn-icon" id="btn-refresh-insights" title="Refresh insights">
          🔄
        </button>
      </div>
    `}renderSections(e){return`
      <div class="insights-sections">
        ${this.renderLeverageSection(e.topLeverage)}
        ${this.renderFragilitySection(e.fragileValues)}
        ${this.renderConflictSection(e.conflictBehaviours)}
      </div>
    `}renderLeverageSection(e){const t=this.expandedSections.has("leverage"),i=e.length===0;return`
      <div class="insight-section ${t?"expanded":""}" data-section="leverage">
        <div class="section-header" data-section="leverage">
          <span class="expand-icon">▶</span>
          <span class="section-title">🚀 Top Leverage</span>
          <span class="section-count">${e.length}</span>
        </div>
        <div class="section-content">
          ${i?this.renderEmptyLeverage():this.renderLeverageList(e)}
        </div>
      </div>
    `}renderEmptyLeverage(){return`
      <div class="insight-empty">
        <p>No high-leverage behaviours yet.</p>
        <p class="hint">Add behaviours with links to outcomes and values.</p>
      </div>
    `}renderLeverageList(e){let t='<div class="insight-list">';for(const i of e)t+=this.renderLeverageItem(i);return t+="</div>",t}renderLeverageItem(e){const{behaviour:t,metrics:i,supportedValues:n,viaOutcomes:a}=e,o=n.map(l=>l.label).join(", "),r=a.join(", ");return`
      <div class="insight-item leverage-item" data-node-id="${t.id}">
        <div class="insight-main">
          <div class="insight-label">${this.escapeHtml(t.label)}</div>
          <div class="insight-score">
            <span class="score-value">${i.leverageScore.toFixed(2)}</span>
            <span class="score-label">leverage</span>
          </div>
        </div>
        <div class="insight-explanation">
          <span class="explanation-text">
            Supports <strong>${o!==""?o:"no values"}</strong>
            ${r!==""?`via ${r}`:""}
          </span>
        </div>
        <div class="insight-meta">
          <span class="meta-item">Coverage: ${i.coverage}</span>
          <span class="meta-item">Cost: ${t.cost}</span>
        </div>
      </div>
    `}renderFragilitySection(e){const t=this.expandedSections.has("fragility"),i=e.length===0;return`
      <div class="insight-section ${t?"expanded":""}" data-section="fragility">
        <div class="section-header" data-section="fragility">
          <span class="expand-icon">▶</span>
          <span class="section-title">⚠️ Fragile Values</span>
          <span class="section-count">${e.length}</span>
        </div>
        <div class="section-content">
          ${i?this.renderEmptyFragility():this.renderFragilityList(e)}
        </div>
      </div>
    `}renderEmptyFragility(){return`
      <div class="insight-empty">
        <p>No fragile values detected.</p>
        <p class="hint">All values have adequate support.</p>
      </div>
    `}renderFragilityList(e){let t='<div class="insight-list">';for(const i of e)t+=this.renderFragilityItem(i);return t+="</div>",t}renderFragilityItem(e){const{value:t,metrics:i,supportingBehaviours:n,isOrphan:a}=e,o=a?"∞":i.fragilityScore.toFixed(2),r=n.map(l=>l.label).join(", ");return`
      <div class="insight-item fragility-item ${a?"orphan":""}" data-node-id="${t.id}">
        <div class="insight-main">
          <div class="insight-label">${this.escapeHtml(t.label)}</div>
          <div class="insight-score">
            <span class="score-value ${a?"critical":""}">${o}</span>
            <span class="score-label">fragility</span>
          </div>
        </div>
        <div class="insight-explanation">
          ${a?'<span class="explanation-text warning">No behaviours support this value.</span>':`<span class="explanation-text">Supported by: <strong>${r!==""?r:"none"}</strong></span>`}
        </div>
        <div class="insight-meta">
          <span class="meta-item">Importance: ${t.importance}</span>
          <span class="meta-item">Neglect: ${this.formatNeglect(t.neglect)}</span>
        </div>
        ${a?'<div class="suggestion">Consider adding behaviours that support this value.</div>':""}
      </div>
    `}renderConflictSection(e){const t=this.expandedSections.has("conflict"),i=e.length===0;return`
      <div class="insight-section ${t?"expanded":""}" data-section="conflict">
        <div class="section-header" data-section="conflict">
          <span class="expand-icon">▶</span>
          <span class="section-title">⚡ Conflicts</span>
          <span class="section-count">${e.length}</span>
        </div>
        <div class="section-content">
          ${i?this.renderEmptyConflict():this.renderConflictList(e)}
        </div>
      </div>
    `}renderEmptyConflict(){return`
      <div class="insight-empty">
        <p>No conflict behaviours detected.</p>
        <p class="hint">Behaviours have consistent positive or negative effects.</p>
      </div>
    `}renderConflictList(e){let t='<div class="insight-list">';for(const i of e)t+=this.renderConflictItem(i);return t+="</div>",t}renderConflictItem(e){const{behaviour:t,metrics:i,positiveValues:n,negativeValues:a}=e,o=n.map(l=>l.label).join(", "),r=a.map(l=>l.label).join(", ");return`
      <div class="insight-item conflict-item" data-node-id="${t.id}">
        <div class="insight-main">
          <div class="insight-label">${this.escapeHtml(t.label)}</div>
          <div class="insight-score">
            <span class="score-value">${i.conflictIndex.toFixed(2)}</span>
            <span class="score-label">conflict</span>
          </div>
        </div>
        <div class="insight-explanation">
          <div class="conflict-breakdown">
            <span class="positive-effect">
              ✓ ${o!==""?o:"none"} (+${i.positiveInfluence.toFixed(1)})
            </span>
            <span class="negative-effect">
              ✗ ${r!==""?r:"none"} (-${i.negativeInfluence.toFixed(1)})
            </span>
          </div>
        </div>
        <div class="suggestion">Consider reducing frequency or mitigating negative effects.</div>
      </div>
    `}formatNeglect(e){return e.replace(/-/g," ")}escapeHtml(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}bindEvents(){this.container.querySelector("#btn-refresh-insights")?.addEventListener("click",()=>{this.refresh()}),this.container.querySelectorAll(".section-header").forEach(e=>{e.addEventListener("click",t=>{const i=t.currentTarget.dataset.section;i!==void 0&&i!==""&&(this.expandedSections.has(i)?this.expandedSections.delete(i):this.expandedSections.add(i),this.render())})}),this.container.querySelectorAll(".insight-item").forEach(e=>{e.addEventListener("click",t=>{const i=t.currentTarget.dataset.nodeId;i!==void 0&&i!==""&&this.callbacks.onNavigateToNode(i)})})}}function He(){return{id:`ladder-${Date.now()}`,currentStep:"select-behaviour",behaviourId:null,behaviourLabel:"",outcomes:[],currentOutcomeIndex:0,valueIds:[],completed:!1,startedAt:new Date().toISOString()}}function tt(s){return s.links.filter(e=>e.type==="behaviour-outcome")}function Fs(s){return s.links.filter(e=>e.type==="outcome-value")}function zs(s,e){return tt(s).some(i=>i.sourceId===e)}function se(s){for(let e=s.currentOutcomeIndex;e<s.outcomes.length;e++){const t=s.outcomes[e];if(t&&!t.explained)return t}return null}function Fe(s){return s.outcomes.filter(e=>!e.explained).length}function Ws(s,e=!1){return s.behaviours.map(t=>({id:t.id,label:t.label,hasLinks:zs(s,t.id)})).filter(t=>!e||!t.hasLinks)}function Rs(s,e){const t=tt(s),i=new Set(t.filter(n=>n.sourceId===e).map(n=>n.targetId));return s.outcomes.map(n=>({id:n.id,label:n.label,alreadyLinked:i.has(n.id)}))}function Ps(s,e){const t=Fs(s),i=new Set(t.filter(n=>n.sourceId===e).map(n=>n.targetId));return s.values.map(n=>({id:n.id,label:n.label,alreadyLinked:i.has(n.id)}))}class _s{container;network;callbacks;session;constructor(e,t){if(this.container=e,this.network=t.network,this.callbacks=t.callbacks,this.session=He(),t.initialBehaviourId!==void 0&&t.initialBehaviourId!==""){const i=this.network.behaviours.find(n=>n.id===t.initialBehaviourId);i&&(this.session.behaviourId=i.id,this.session.behaviourLabel=i.label,this.session.currentStep="add-outcomes")}this.render()}setNetwork(e){this.network=e,this.render()}getSession(){return{...this.session}}reset(){this.session=He(),this.render()}render(){switch(this.session.currentStep){case"select-behaviour":this.renderSelectBehaviour();break;case"add-outcomes":this.renderAddOutcomes();break;case"explain-outcome":this.renderExplainOutcome();break;case"complete":this.renderComplete();break}}renderSelectBehaviour(){const e=Ws(this.network,!1);this.container.innerHTML=`
      <div class="ladder-panel">
        <div class="ladder-header">
          <h2>Why Ladder</h2>
          <p class="ladder-subtitle">Map your behaviours to what matters</p>
        </div>

        <div class="ladder-step">
          <div class="step-indicator">
            <span class="step-number">1</span>
            <span class="step-label">Choose a Behaviour</span>
          </div>

          <p class="ladder-prompt">
            What behaviour would you like to explore? Why do you do it?
          </p>

          <div class="ladder-form">
            <div class="form-group">
              <label for="behaviour-input">Create new behaviour</label>
              <div class="input-row">
                <input 
                  type="text" 
                  id="behaviour-input" 
                  class="form-input" 
                  placeholder="e.g., Morning meditation, 30-min walk..."
                  autocomplete="off"
                />
                <button type="button" class="btn btn-primary" id="btn-create-behaviour">
                  Create
                </button>
              </div>
            </div>

            ${e.length>0?`
              <div class="divider-text">
                <span>or select existing</span>
              </div>

              <div class="form-group">
                <label>Select existing behaviour</label>
                <ul class="selectable-list" id="behaviour-list">
                  ${e.map(t=>`
                    <li class="selectable-item ${t.hasLinks?"has-links":"no-links"}" data-id="${t.id}">
                      <span class="item-label">${this.escapeHtml(t.label)}</span>
                      ${t.hasLinks?'<span class="item-badge">has links</span>':'<span class="item-badge unexplained">unexplained</span>'}
                    </li>
                  `).join("")}
                </ul>
              </div>
            `:""}
          </div>
        </div>

        <div class="ladder-actions">
          <button type="button" class="btn btn-secondary" id="btn-cancel">
            Cancel
          </button>
        </div>
      </div>
    `,this.bindSelectBehaviourEvents()}renderAddOutcomes(){const t=Rs(this.network,this.session.behaviourId).filter(n=>!n.alreadyLinked),i=this.session.outcomes.length;this.container.innerHTML=`
      <div class="ladder-panel">
        <div class="ladder-header">
          <h2>Why Ladder</h2>
          <p class="ladder-subtitle">Exploring: <strong>${this.escapeHtml(this.session.behaviourLabel)}</strong></p>
        </div>

        <div class="ladder-step">
          <div class="step-indicator">
            <span class="step-number">2</span>
            <span class="step-label">Add Outcomes</span>
          </div>

          <p class="ladder-prompt">
            What outcome(s) does <strong>"${this.escapeHtml(this.session.behaviourLabel)}"</strong> produce?
          </p>

          ${i>0?`
            <div class="added-items">
              <h4>Added outcomes (${i}):</h4>
              <ul class="outcome-chips">
                ${this.session.outcomes.map(n=>`
                  <li class="outcome-chip">
                    <span>${this.escapeHtml(n.outcomeLabel)}</span>
                    <button type="button" class="chip-remove" data-outcome-id="${n.outcomeId}" title="Remove">×</button>
                  </li>
                `).join("")}
              </ul>
            </div>
          `:""}

          <div class="ladder-form">
            <div class="form-group">
              <label for="outcome-input">Create new outcome</label>
              <div class="input-row">
                <input 
                  type="text" 
                  id="outcome-input" 
                  class="form-input" 
                  placeholder="e.g., Reduced anxiety, Better sleep..."
                  autocomplete="off"
                />
                <button type="button" class="btn btn-primary" id="btn-add-outcome">
                  Add
                </button>
              </div>
            </div>

            ${t.length>0?`
              <div class="divider-text">
                <span>or link existing</span>
              </div>

              <div class="form-group">
                <label>Link to existing outcome</label>
                <ul class="selectable-list" id="outcome-list">
                  ${t.map(n=>`
                    <li class="selectable-item" data-id="${n.id}">
                      <span class="item-label">${this.escapeHtml(n.label)}</span>
                    </li>
                  `).join("")}
                </ul>
              </div>
            `:""}
          </div>
        </div>

        <div class="ladder-actions">
          <button type="button" class="btn btn-secondary" id="btn-back">
            Back
          </button>
          <button type="button" class="btn btn-secondary" id="btn-exit">
            Exit Early
          </button>
          ${i>0?`
            <button type="button" class="btn btn-primary" id="btn-next">
              Continue →
            </button>
          `:""}
        </div>
      </div>
    `,this.bindAddOutcomesEvents()}renderExplainOutcome(){const e=se(this.session);if(!e){this.goToStep("complete");return}const t=e.outcomeId,n=Ps(this.network,t).filter(o=>!o.alreadyLinked),a=Fe(this.session);this.container.innerHTML=`
      <div class="ladder-panel">
        <div class="ladder-header">
          <h2>Why Ladder</h2>
          <p class="ladder-subtitle">Exploring: <strong>${this.escapeHtml(this.session.behaviourLabel)}</strong></p>
        </div>

        <div class="ladder-step">
          <div class="step-indicator">
            <span class="step-number">3</span>
            <span class="step-label">Explain Outcomes</span>
          </div>

          <p class="ladder-prompt">
            Why does <strong>"${this.escapeHtml(e.outcomeLabel)}"</strong> matter to you?
          </p>

          <p class="ladder-hint">
            Link to a value (terminal goal) or chain to another outcome (intermediate step).
            <br/>
            <small>${a} outcome${a!==1?"s":""} left to explain</small>
          </p>

          <div class="ladder-form">
            <div class="form-group">
              <label for="value-input">Add as new value</label>
              <div class="input-row">
                <input 
                  type="text" 
                  id="value-input" 
                  class="form-input" 
                  placeholder="e.g., Health, Peace of mind, Achievement..."
                  autocomplete="off"
                />
                <button type="button" class="btn btn-primary" id="btn-add-value">
                  Add Value
                </button>
              </div>
            </div>

            ${n.length>0?`
              <div class="divider-text">
                <span>or link to existing value</span>
              </div>

              <div class="form-group">
                <ul class="selectable-list" id="value-list">
                  ${n.map(o=>`
                    <li class="selectable-item" data-id="${o.id}">
                      <span class="item-label">${this.escapeHtml(o.label)}</span>
                    </li>
                  `).join("")}
                </ul>
              </div>
            `:""}

            <div class="divider-text">
              <span>or chain to another outcome</span>
            </div>

            <div class="form-group">
              <label for="chain-input">Create intermediate outcome</label>
              <div class="input-row">
                <input 
                  type="text" 
                  id="chain-input" 
                  class="form-input" 
                  placeholder="e.g., Another effect that leads to a value..."
                  autocomplete="off"
                />
                <button type="button" class="btn btn-secondary" id="btn-chain-outcome">
                  Chain Outcome
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="ladder-actions">
          <button type="button" class="btn btn-secondary" id="btn-back">
            Back
          </button>
          <button type="button" class="btn btn-secondary" id="btn-skip">
            Skip This Outcome
          </button>
          <button type="button" class="btn btn-secondary" id="btn-exit">
            Exit Early
          </button>
        </div>
      </div>
    `,this.bindExplainOutcomeEvents(e)}renderComplete(){const e=this.session.outcomes.length,t=this.session.valueIds.length,i=Fe(this.session);this.container.innerHTML=`
      <div class="ladder-panel">
        <div class="ladder-header">
          <h2>Why Ladder Complete!</h2>
        </div>

        <div class="ladder-summary">
          <div class="summary-item">
            <span class="summary-icon">✓</span>
            <span class="summary-text">
              Explored <strong>${this.escapeHtml(this.session.behaviourLabel)}</strong>
            </span>
          </div>

          <div class="summary-item">
            <span class="summary-icon">${e>0?"✓":"○"}</span>
            <span class="summary-text">
              ${e} outcome${e!==1?"s":""} added
            </span>
          </div>

          <div class="summary-item">
            <span class="summary-icon">${t>0?"✓":"○"}</span>
            <span class="summary-text">
              ${t} value${t!==1?"s":""} linked
            </span>
          </div>

          ${i>0?`
            <div class="summary-item warning">
              <span class="summary-icon">⚠</span>
              <span class="summary-text">
                ${i} outcome${i!==1?"s":""} left unexplained
              </span>
            </div>
          `:""}
        </div>

        <div class="ladder-actions">
          <button type="button" class="btn btn-secondary" id="btn-another">
            Add Another Behaviour
          </button>
          <button type="button" class="btn btn-primary" id="btn-done">
            Done
          </button>
        </div>
      </div>
    `,this.bindCompleteEvents()}bindSelectBehaviourEvents(){const e=this.container.querySelector("#behaviour-input"),t=this.container.querySelector("#btn-create-behaviour"),i=this.container.querySelector("#btn-cancel"),n=this.container.querySelector("#behaviour-list");t.addEventListener("click",()=>{const a=e.value.trim();a!==""&&this.createBehaviour(a)}),e.addEventListener("keydown",a=>{if(a.key==="Enter"){const o=e.value.trim();o!==""&&this.createBehaviour(o)}}),n&&n.querySelectorAll(".selectable-item").forEach(a=>{a.addEventListener("click",()=>{const o=a.dataset.id;o!==void 0&&this.selectBehaviour(o)})}),i.addEventListener("click",()=>{this.callbacks.onExit(this.session)})}bindAddOutcomesEvents(){const e=this.container.querySelector("#outcome-input"),t=this.container.querySelector("#btn-add-outcome"),i=this.container.querySelector("#btn-back"),n=this.container.querySelector("#btn-exit"),a=this.container.querySelector("#btn-next"),o=this.container.querySelector("#outcome-list");t.addEventListener("click",()=>{const r=e.value.trim();r!==""&&(this.createOutcome(r),e.value="",e.focus())}),e.addEventListener("keydown",r=>{if(r.key==="Enter"){const l=e.value.trim();l!==""&&(this.createOutcome(l),e.value="")}}),o&&o.querySelectorAll(".selectable-item").forEach(r=>{r.addEventListener("click",()=>{const l=r.dataset.id;l!==void 0&&this.linkOutcome(l)})}),this.container.querySelectorAll(".chip-remove").forEach(r=>{r.addEventListener("click",l=>{l.stopPropagation();const c=r.dataset.outcomeId;c!==void 0&&this.removeOutcome(c)})}),i.addEventListener("click",()=>{this.goToStep("select-behaviour")}),n.addEventListener("click",()=>{this.exitEarly()}),a&&a.addEventListener("click",()=>{this.goToStep("explain-outcome")})}bindExplainOutcomeEvents(e){const t=this.container.querySelector("#value-input"),i=this.container.querySelector("#btn-add-value"),n=this.container.querySelector("#chain-input"),a=this.container.querySelector("#btn-chain-outcome"),o=this.container.querySelector("#btn-back"),r=this.container.querySelector("#btn-skip"),l=this.container.querySelector("#btn-exit"),c=this.container.querySelector("#value-list");i.addEventListener("click",()=>{const u=t.value.trim();u!==""&&this.createValue(u,e)}),t.addEventListener("keydown",u=>{if(u.key==="Enter"){const h=t.value.trim();h!==""&&this.createValue(h,e)}}),c&&c.querySelectorAll(".selectable-item").forEach(u=>{u.addEventListener("click",()=>{const h=u.dataset.id;h!==void 0&&this.linkValue(h,e)})}),a.addEventListener("click",()=>{const u=n.value.trim();u!==""&&this.chainOutcome(u,e)}),n.addEventListener("keydown",u=>{if(u.key==="Enter"){const h=n.value.trim();h!==""&&this.chainOutcome(h,e)}}),o.addEventListener("click",()=>{this.goToStep("add-outcomes")}),r.addEventListener("click",()=>{this.skipOutcome(e)}),l.addEventListener("click",()=>{this.exitEarly()})}bindCompleteEvents(){const e=this.container.querySelector("#btn-another"),t=this.container.querySelector("#btn-done");e.addEventListener("click",()=>{this.session.completed=!0,this.callbacks.onComplete(this.session),this.reset()}),t.addEventListener("click",()=>{this.session.completed=!0,this.callbacks.onComplete(this.session)})}goToStep(e){this.session.currentStep=e,this.render()}createBehaviour(e){const t=this.callbacks.onCreateBehaviour(e);this.session.behaviourId=t.id,this.session.behaviourLabel=t.label,this.goToStep("add-outcomes")}selectBehaviour(e){const t=this.network.behaviours.find(i=>i.id===e);t&&(this.callbacks.onSelectBehaviour(e),this.session.behaviourId=e,this.session.behaviourLabel=t.label,this.goToStep("add-outcomes"))}createOutcome(e){if(this.session.behaviourId===null)return;const t=this.callbacks.onCreateOutcome(e,this.session.behaviourId);this.session.outcomes.push({outcomeId:t.id,outcomeLabel:t.label,explained:!1}),this.render()}linkOutcome(e){if(this.session.behaviourId===null)return;const t=this.network.outcomes.find(i=>i.id===e);t&&(this.callbacks.onLinkOutcome(e,this.session.behaviourId),this.session.outcomes.push({outcomeId:t.id,outcomeLabel:t.label,explained:!1}),this.render())}removeOutcome(e){this.session.outcomes=this.session.outcomes.filter(t=>t.outcomeId!==e),this.render()}createValue(e,t){const i=this.callbacks.onCreateValue(e,t.outcomeId);this.session.valueIds.push(i.id),this.markOutcomeExplained(t)}linkValue(e,t){this.callbacks.onLinkValue(e,t.outcomeId),this.session.valueIds.includes(e)||this.session.valueIds.push(e),this.markOutcomeExplained(t)}chainOutcome(e,t){const i=this.callbacks.onChainOutcome(e,t.outcomeId);this.session.outcomes.push({outcomeId:i.id,outcomeLabel:i.label,explained:!1}),this.markOutcomeExplained(t)}markOutcomeExplained(e){const t=this.session.outcomes.findIndex(n=>n.outcomeId===e.outcomeId);if(t!==-1){const n=this.session.outcomes[t];n&&(n.explained=!0)}const i=se(this.session);i?(this.session.currentOutcomeIndex=this.session.outcomes.findIndex(n=>n.outcomeId===i.outcomeId),this.render()):this.goToStep("complete")}skipOutcome(e){const t=this.session.outcomes.findIndex(n=>n.outcomeId===e.outcomeId);this.session.currentOutcomeIndex=t+1,se(this.session)?this.render():this.goToStep("complete")}exitEarly(){this.session.completed=!1,this.callbacks.onExit(this.session)}escapeHtml(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}}const js=1440*60*1e3;function z(s,e){return`w-${s}-${e}`}function W(s){switch(s){case"orphan-value":return"warning";case"unexplained-behaviour":return"info";case"floating-outcome":return"info";case"outcome-level-conflict":return"warning";case"value-level-conflict":return"error";default:return"info"}}function Gs(s,e){if(e.dismissed[s.id]===!0)return!1;const t=e.snoozed[s.id];return t!==void 0&&t!==""?new Date(t)<new Date:!0}function Us(){return{warnings:[],byType:{"orphan-value":[],"unexplained-behaviour":[],"floating-outcome":[],"outcome-level-conflict":[],"value-level-conflict":[]},byNodeId:{},counts:{total:0,byType:{"orphan-value":0,"unexplained-behaviour":0,"floating-outcome":0,"outcome-level-conflict":0,"value-level-conflict":0},bySeverity:{error:0,warning:0,info:0},active:0,snoozed:0,dismissed:0}}}function he(){return{snoozed:{},dismissed:{}}}function Q(s){return s.links.filter(e=>e.type==="behaviour-outcome")}function ve(s){return s.links.filter(e=>e.type==="outcome-value")}function st(s,e){return s.behaviours.find(t=>t.id===e)}function Ys(s,e){return s.outcomes.find(t=>t.id===e)}function ze(s,e){return s.values.find(t=>t.id===e)}function Qs(s){const e=[],t=Q(s),i=ve(s),n=new Set(t.map(a=>a.targetId));for(const a of s.values){const o=i.filter(l=>l.targetId===a.id).map(l=>l.sourceId);o.some(l=>n.has(l))||e.push({id:z("orphan-value",a.id),type:"orphan-value",nodeId:a.id,message:`"${a.label}" has no connection from any behaviour`,severity:W("orphan-value"),relatedNodeIds:o,suggestion:"Connect this value to an outcome, or use Why Ladder to trace a behaviour to this value."})}return e}function Xs(s){const e=[],t=Q(s),i=new Set(t.map(n=>n.sourceId));for(const n of s.behaviours)i.has(n.id)||e.push({id:z("unexplained-behaviour",n.id),type:"unexplained-behaviour",nodeId:n.id,message:`"${n.label}" has no outcomes linked`,severity:W("unexplained-behaviour"),relatedNodeIds:[],suggestion:"Use Why Ladder to explore what outcomes this behaviour produces."});return e}function Js(s){const e=[],t=ve(s),i=new Set(t.map(n=>n.sourceId));for(const n of s.outcomes)i.has(n.id)||e.push({id:z("floating-outcome",n.id),type:"floating-outcome",nodeId:n.id,message:`"${n.label}" is not connected to any value`,severity:W("floating-outcome"),relatedNodeIds:[],suggestion:'Ask "Why does this outcome matter?" to connect it to a value.'});return e}function Zs(s){const e=[],t=Q(s),i=new Map;for(const n of t)if(n.valence==="negative"){const a=i.get(n.sourceId)??[];a.push(n),i.set(n.sourceId,a)}for(const[n,a]of i){const o=st(s,n);if(!o)continue;const r=a.map(l=>{const c=Ys(s,l.targetId);return c?{id:c.id,label:c.label}:null}).filter(l=>l!==null);if(r.length>0){const l=r.map(c=>`"${c.label}"`).join(", ");e.push({id:z("outcome-level-conflict",n),type:"outcome-level-conflict",nodeId:n,message:`"${o.label}" has negative effects on: ${l}`,severity:W("outcome-level-conflict"),relatedNodeIds:r.map(c=>c.id),suggestion:"Consider whether the benefits outweigh the costs, or find alternatives."})}}return e}function Ks(s){const e=[],t=Q(s),i=ve(s);for(const n of t){const a=i.filter(o=>o.sourceId===n.targetId);for(const o of a){const r=n.valence===o.valence?"positive":"negative",l=ei(n.reliability),c=ti(o.strength),u=r==="positive"?1:-1,h=l*c*u;e.push({behaviourId:n.sourceId,outcomeId:n.targetId,valueId:o.targetId,valence:r,weight:h})}}return e}function ei(s){switch(s){case"always":return 1;case"usually":return .75;case"sometimes":return .5;case"rarely":return .25;default:return .5}}function ti(s){switch(s){case"strong":return 1;case"moderate":return .6;case"weak":return .3;default:return .5}}function si(s){const e=[],t=Ks(s),i=new Map;for(const n of t){const a=i.get(n.behaviourId)??[];a.push(n),i.set(n.behaviourId,a)}for(const[n,a]of i){const o=st(s,n);if(!o)continue;const r=new Set,l=new Set;for(const c of a)c.valence==="positive"?r.add(c.valueId):l.add(c.valueId);if(r.size>0&&l.size>0){const c=Array.from(r).map(v=>ze(s,v)).filter(v=>v!==void 0).map(v=>({id:v.id,label:v.label})),u=Array.from(l).map(v=>ze(s,v)).filter(v=>v!==void 0).map(v=>({id:v.id,label:v.label})),h=c.map(v=>`"${v.label}"`).join(", "),p=u.map(v=>`"${v.label}"`).join(", ");e.push({id:z("value-level-conflict",n),type:"value-level-conflict",nodeId:n,message:`"${o.label}" creates a trade-off: helps ${h} but hurts ${p}`,severity:W("value-level-conflict"),relatedNodeIds:[...r,...l],suggestion:"Consider whether this trade-off aligns with your priorities."})}}return e}function ii(s,e){const t=Us(),i=e??{snoozed:{},dismissed:{}},n=[...Qs(s),...Xs(s),...Js(s),...Zs(s),...si(s)];t.warnings=n;for(const a of n){t.byType[a.type].push(a),t.byNodeId[a.nodeId]??=[];const o=t.byNodeId[a.nodeId];o!==void 0&&o.push(a),t.counts.total++,t.counts.byType[a.type]++,t.counts.bySeverity[a.severity]++;const r=i.snoozed[a.id];i.dismissed[a.id]===!0?t.counts.dismissed++:r!==void 0&&r!==""&&new Date(r)>new Date?t.counts.snoozed++:t.counts.active++}return t}function ni(s,e){return s.warnings.filter(t=>Gs(t,e))}class ai{container;network;warningState;callbacks;showDismissed;result=null;expandedTypes=new Set;constructor(e,t){this.container=e,this.network=t.network,this.warningState=t.warningState??he(),this.callbacks=t.callbacks,this.showDismissed=t.showDismissed??!1,this.render()}setNetwork(e){this.network=e,this.result=null,this.render()}setWarningState(e){this.warningState=e,this.render()}getValidationResult(){return this.result??=ii(this.network,this.warningState),this.result}refresh(){this.result=null,this.render()}render(){const e=this.getValidationResult(),t=ni(e,this.warningState);this.container.innerHTML=`
      <div class="validation-panel">
        ${this.renderHeader(e,t.length)}
        ${this.renderSummary(e)}
        ${this.renderWarningGroups(e)}
      </div>
    `,this.bindEvents()}renderHeader(e,t){return`
      <div class="validation-header">
        <div class="validation-status ${t===0?"status-ok":"status-warning"}">
          <span class="status-icon">${t===0?"✓":"⚠"}</span>
          <span class="status-text">
            ${t===0?"No issues":`${t} issue${t===1?"":"s"}`}
          </span>
        </div>
        <div class="validation-actions">
          <button class="btn btn-small" id="btn-refresh-validation" title="Re-run validation">
            ↻
          </button>
          <label class="toggle-label">
            <input type="checkbox" id="chk-show-dismissed" ${this.showDismissed?"checked":""}>
            Show dismissed
          </label>
        </div>
      </div>
    `}renderSummary(e){const t=e.counts;return t.total===0?`
        <div class="validation-summary validation-empty">
          <p>Your network is well-connected! 🎉</p>
        </div>
      `:`
      <div class="validation-summary">
        <div class="summary-counts">
          ${t.bySeverity.error>0?`<span class="count-badge error">${t.bySeverity.error} conflicts</span>`:""}
          ${t.bySeverity.warning>0?`<span class="count-badge warning">${t.bySeverity.warning} warnings</span>`:""}
          ${t.bySeverity.info>0?`<span class="count-badge info">${t.bySeverity.info} suggestions</span>`:""}
        </div>
      </div>
    `}renderWarningGroups(e){const t=[{type:"value-level-conflict",label:"Value Conflicts",severity:"error"},{type:"outcome-level-conflict",label:"Outcome Conflicts",severity:"warning"},{type:"orphan-value",label:"Orphan Values",severity:"warning"},{type:"unexplained-behaviour",label:"Unexplained Behaviours",severity:"info"},{type:"floating-outcome",label:"Floating Outcomes",severity:"info"}];let i='<div class="warning-groups">';for(const n of t){const a=this.filterWarnings(e.byType[n.type]);if(a.length===0)continue;const o=this.expandedTypes.has(n.type);i+=`
        <div class="warning-group ${n.severity}">
          <div class="group-header" data-type="${n.type}">
            <span class="group-icon">${o?"▼":"▶"}</span>
            <span class="group-label">${n.label}</span>
            <span class="group-count">${a.length}</span>
          </div>
          ${o?this.renderWarningList(a):""}
        </div>
      `}return i+="</div>",i}filterWarnings(e){return e.filter(t=>{const i=this.warningState.dismissed[t.id]===!0,n=this.warningState.snoozed[t.id],a=n!==void 0&&n!==""&&new Date(n)>new Date;return!(!this.showDismissed&&i||!this.showDismissed&&a)})}renderWarningList(e){if(e.length===0)return'<div class="warning-list-empty">No issues</div>';let t='<div class="warning-list">';for(const i of e)t+=this.renderWarningItem(i);return t+="</div>",t}renderWarningItem(e){const t=this.warningState.dismissed[e.id]===!0,i=this.warningState.snoozed[e.id],n=i!==void 0&&i!==""&&new Date(i)>new Date;return`
      <div class="warning-item ${t?"dismissed":n?"snoozed":"active"}" data-warning-id="${e.id}">
        <div class="warning-content">
          <div class="warning-message">${e.message}</div>
          ${e.suggestion!==void 0&&e.suggestion!==""?`<div class="warning-suggestion">${e.suggestion}</div>`:""}
          ${n&&i!==void 0?`<div class="warning-status">Snoozed until ${new Date(i).toLocaleString()}</div>`:""}
          ${t?'<div class="warning-status">Dismissed</div>':""}
        </div>
        <div class="warning-actions">
          <button class="btn-icon btn-navigate" data-node-id="${e.nodeId}" title="Go to node">
            👁
          </button>
          ${!t&&!n?`
            <button class="btn-icon btn-snooze" data-warning-id="${e.id}" title="Snooze for 24h">
              💤
            </button>
            <button class="btn-icon btn-dismiss" data-warning-id="${e.id}" title="Dismiss">
              ✕
            </button>
          `:""}
          ${t?`
            <button class="btn-icon btn-undismiss" data-warning-id="${e.id}" title="Restore">
              ↩
            </button>
          `:""}
        </div>
      </div>
    `}bindEvents(){this.container.querySelector("#btn-refresh-validation")?.addEventListener("click",()=>{this.refresh()}),this.container.querySelector("#chk-show-dismissed")?.addEventListener("change",e=>{this.showDismissed=e.target.checked,this.render()}),this.container.querySelectorAll(".group-header").forEach(e=>{e.addEventListener("click",t=>{const i=t.currentTarget.dataset.type;i!==void 0&&i!==""&&(this.expandedTypes.has(i)?this.expandedTypes.delete(i):this.expandedTypes.add(i),this.render())})}),this.container.querySelectorAll(".btn-navigate").forEach(e=>{e.addEventListener("click",t=>{t.stopPropagation();const i=t.currentTarget.dataset.nodeId;i!==void 0&&i!==""&&this.callbacks.onNavigateToNode(i)})}),this.container.querySelectorAll(".btn-snooze").forEach(e=>{e.addEventListener("click",t=>{t.stopPropagation();const i=t.currentTarget.dataset.warningId;if(i!==void 0&&i!==""){const n=new Date(Date.now()+js).toISOString();this.warningState.snoozed[i]=n,this.callbacks.onSnooze(i),this.render()}})}),this.container.querySelectorAll(".btn-dismiss").forEach(e=>{e.addEventListener("click",t=>{t.stopPropagation();const i=t.currentTarget.dataset.warningId;i!==void 0&&i!==""&&(this.warningState.dismissed[i]=!0,this.callbacks.onDismiss(i),this.render())})}),this.container.querySelectorAll(".btn-undismiss").forEach(e=>{e.addEventListener("click",t=>{t.stopPropagation();const i=t.currentTarget.dataset.warningId;i!==void 0&&i!==""&&(delete this.warningState.dismissed[i],this.callbacks.onUndismiss(i),this.render())})})}}class oi{container;element=null;callbacks;constructor(e,t){this.container=e,this.callbacks=t}show(){if(this.element!==null){this.element.classList.remove("hidden"),this.element.querySelector("#btn-welcome-start")?.focus();return}this.element=document.createElement("div"),this.element.className="welcome-screen",this.element.setAttribute("role","dialog"),this.element.setAttribute("aria-labelledby","welcome-title"),this.element.innerHTML=`
      <div class="welcome-content">
        <h1 id="welcome-title" class="welcome-title">Welcome to M-E Net</h1>
        <p class="welcome-subtitle">Map your behaviours to what truly matters</p>
        
        <div class="welcome-description">
          <p>M-E Net helps you understand <strong>why</strong> you do what you do by connecting:</p>
          <ul class="welcome-list">
            <li><strong>Behaviours</strong> — The actions you take</li>
            <li><strong>Outcomes</strong> — The effects they produce</li>
            <li><strong>Values</strong> — What ultimately matters to you</li>
          </ul>
          <p>Discover which behaviours are most leveraged, which values are fragile, and where trade-offs exist.</p>
        </div>

        <div class="welcome-actions">
          <button id="btn-welcome-start" class="btn btn-primary" aria-label="Start mapping your first behaviour">
            Start with a Behaviour
          </button>
          <button id="btn-welcome-import" class="btn btn-secondary" aria-label="Import existing network data">
            Import Existing Data
          </button>
        </div>

        <p class="welcome-hint">Tip: Use the Why Ladder mode to quickly build your network</p>
      </div>
    `,this.container.appendChild(this.element);const e=this.element.querySelector("#btn-welcome-start"),t=this.element.querySelector("#btn-welcome-import");e!==null&&e.addEventListener("click",()=>{this.hide(),this.callbacks.onGetStarted()}),t!==null&&t.addEventListener("click",()=>{this.hide(),this.callbacks.onImportData()}),e?.focus()}hide(){this.element!==null&&this.element.classList.add("hidden")}destroy(){this.element!==null&&(this.element.remove(),this.element=null)}}function R(s){const e=Date.now().toString(36),t=Math.random().toString(36).substring(2,8);return`${s}-${e}-${t}`}function k(){return new Date().toISOString()}function it(s,e){const t=nt(e.label,s);if(!t.valid)return{success:!1,error:t.error};const i={id:R("b"),type:"behaviour",label:e.label.trim(),frequency:e.frequency,cost:e.cost,contextTags:e.contextTags??[],notes:e.notes,createdAt:k(),updatedAt:k()};return{success:!0,data:{network:{...s,behaviours:[...s.behaviours,i]},behaviour:i}}}function ri(s,e,t){const i=s.behaviours.findIndex(l=>l.id===e);if(i===-1)return{success:!1,error:`Behaviour with id "${e}" not found`};const n=s.behaviours[i];if(t.label!==void 0&&t.label.trim().toLowerCase()!==n.label.toLowerCase()){const l=nt(t.label,s);if(!l.valid)return{success:!1,error:l.error}}const a={...n,label:t.label?.trim()??n.label,frequency:t.frequency??n.frequency,cost:t.cost??n.cost,contextTags:t.contextTags??n.contextTags,notes:t.notes??n.notes,updatedAt:k()},o=[...s.behaviours];return o[i]=a,{success:!0,data:{network:{...s,behaviours:o},behaviour:a}}}function li(s,e){if(s.behaviours.findIndex(o=>o.id===e)===-1)return{success:!1,error:`Behaviour with id "${e}" not found`};const i=s.behaviours.filter(o=>o.id!==e),n=s.links.filter(o=>o.sourceId!==e);return{success:!0,data:{network:{...s,behaviours:i,links:n}}}}function nt(s,e){const t=s.trim();return t.length===0?{valid:!1,error:"Label cannot be empty"}:t.length>100?{valid:!1,error:"Label cannot exceed 100 characters"}:e.behaviours.some(n=>n.label.toLowerCase()===t.toLowerCase())?{valid:!1,error:`A behaviour with label "${t}" already exists`}:{valid:!0}}const at="1.0.0";function pe(){return{version:at,behaviours:[],outcomes:[],values:[],links:[]}}function ci(s={}){return{version:s.version??at,behaviours:s.behaviours??[],outcomes:s.outcomes??[],values:s.values??[],links:s.links??[],exportedAt:s.exportedAt}}function F(s){return s.behaviours.length===0&&s.outcomes.length===0&&s.values.length===0}const ot="me-net-network",di="1.0.0";function ui(s){try{const e={...s,version:di},t=JSON.stringify(e);return localStorage.setItem(ot,t),{success:!0}}catch(e){return{success:!1,error:`Failed to save network: ${e instanceof Error?e.message:"Unknown storage error"}`}}}function hi(){try{const s=localStorage.getItem(ot);if(s===null)return{success:!0,data:pe()};const e=JSON.parse(s),t=rt(e);return t.valid?{success:!0,data:e}:{success:!1,error:`Invalid network data: ${t.error}`}}catch(s){return{success:!1,error:`Failed to load network: ${s instanceof Error?s.message:"Unknown error"}`}}}function rt(s){if(s===null||typeof s!="object")return{valid:!1,error:"Data must be an object"};const e=s;return Array.isArray(e.behaviours)?Array.isArray(e.outcomes)?Array.isArray(e.values)?Array.isArray(e.links)?typeof e.version!="string"?{valid:!1,error:'Missing or invalid "version" string'}:{valid:!0}:{valid:!1,error:'Missing or invalid "links" array'}:{valid:!1,error:'Missing or invalid "values" array'}:{valid:!1,error:'Missing or invalid "outcomes" array'}:{valid:!1,error:'Missing or invalid "behaviours" array'}}const lt="1.0.0";function vi(s){return{...s,version:lt,exportedAt:new Date().toISOString()}}function pi(s){const e=vi(s);return JSON.stringify(e,null,2)}function mi(s="me-net"){const e=new Date,t=e.toISOString().slice(0,10),i=e.toISOString().slice(11,19).replace(/:/g,"-");return`${s}-${t}-${i}.json`}function bi(s){const e=pi(s),t=new Blob([e],{type:"application/json"}),i=URL.createObjectURL(t),n=document.createElement("a");n.href=i,n.download=mi(),document.body.appendChild(n),n.click(),document.body.removeChild(n),URL.revokeObjectURL(i)}function fi(s){try{const e=JSON.parse(s),t=rt(e);if(!t.valid)return{success:!1,error:`Invalid network structure: ${t.error}`};const i=e,n=gi(i);return n.valid?{success:!0,network:ci({version:i.version,exportedAt:i.exportedAt,behaviours:i.behaviours,outcomes:i.outcomes,values:i.values,links:i.links})}:{success:!1,error:n.error}}catch(e){return{success:!1,error:`Failed to parse JSON: ${e instanceof Error?e.message:"Unknown parse error"}`}}}function gi(s){const e=s.behaviours;for(let o=0;o<e.length;o++){const r=e[o],l=r.id,c=r.label;if(typeof l!="string"||l==="")return{valid:!1,error:`Behaviour at index ${o} missing valid id`};if(typeof c!="string"||c==="")return{valid:!1,error:`Behaviour "${l}" missing valid label`};if(r.type!=="behaviour")return{valid:!1,error:`Behaviour "${l}" has invalid type`}}const t=s.outcomes;for(let o=0;o<t.length;o++){const r=t[o],l=r.id,c=r.label;if(typeof l!="string"||l==="")return{valid:!1,error:`Outcome at index ${o} missing valid id`};if(typeof c!="string"||c==="")return{valid:!1,error:`Outcome "${l}" missing valid label`};if(r.type!=="outcome")return{valid:!1,error:`Outcome "${l}" has invalid type`}}const i=s.values;for(let o=0;o<i.length;o++){const r=i[o],l=r.id,c=r.label;if(typeof l!="string"||l==="")return{valid:!1,error:`Value at index ${o} missing valid id`};if(typeof c!="string"||c==="")return{valid:!1,error:`Value "${l}" missing valid label`};if(r.type!=="value")return{valid:!1,error:`Value "${l}" has invalid type`}}const n=s.links;for(let o=0;o<n.length;o++){const r=n[o],l=r.id,c=r.sourceId,u=r.targetId;if(typeof l!="string"||l==="")return{valid:!1,error:`Link at index ${o} missing valid id`};if(typeof c!="string"||c==="")return{valid:!1,error:`Link "${l}" missing valid sourceId`};if(typeof u!="string"||u==="")return{valid:!1,error:`Link "${l}" missing valid targetId`};if(r.type!=="behaviour-outcome"&&r.type!=="outcome-value")return{valid:!1,error:`Link "${l}" has invalid type`};if(r.valence!=="positive"&&r.valence!=="negative")return{valid:!1,error:`Link "${l}" has invalid valence`}}const a=new Set;for(const o of e)a.add(o.id);for(const o of t)a.add(o.id);for(const o of i)a.add(o.id);for(const o of n){const r=o,l=r.id,c=r.sourceId,u=r.targetId;if(!a.has(c))return{valid:!1,error:`Link "${l}" references non-existent source "${c}"`};if(!a.has(u))return{valid:!1,error:`Link "${l}" references non-existent target "${u}"`}}return{valid:!0}}function yi(s){return new Promise(e=>{const t=new FileReader;t.onload=i=>{const n=i.target?.result;if(typeof n!="string"){e({success:!1,error:"Failed to read file content"});return}e(fi(n))},t.onerror=()=>{e({success:!1,error:"Failed to read file"})},t.readAsText(s)})}function ki(s,e,t,i){const n=[];t.length>0&&n.push(`You have ${t.length} orphan value${t.length>1?"s":""} with no supporting behaviours. Consider using Why Ladder to connect behaviours to these values.`),i.length>0&&n.push(`You have ${i.length} behaviour${i.length>1?"s":""} with conflicting effects. Review these trade-offs and consider if alternatives exist.`);const a=s.behaviours.filter(l=>!s.links.some(c=>c.sourceId===l.id));a.length>0&&n.push(`You have ${a.length} behaviour${a.length>1?"s":""} without outcomes. Use Why Ladder to explore why you do these.`);const o=s.outcomes.filter(l=>!s.links.some(c=>c.type==="outcome-value"&&c.sourceId===l.id));o.length>0&&n.push(`You have ${o.length} outcome${o.length>1?"s":""} not connected to any value. Ask "Why does this matter?" to connect them.`);const r=e[0];return r!==void 0&&r.metrics.leverageScore>0&&n.push(`Your highest-leverage behaviour is "${r.behaviour.label}". Consider prioritising this action.`),n.length===0&&n.push("Your network looks complete! Continue refining link attributes for more accurate insights."),{generatedAt:new Date().toISOString(),version:lt,stats:{behaviours:s.behaviours.length,outcomes:s.outcomes.length,values:s.values.length,links:s.links.length},topLeverageBehaviours:e.map(l=>({label:l.behaviour.label,score:Math.round(l.metrics.leverageScore*100)/100,supportedValues:l.supportedValues.map(c=>c.label),viaOutcomes:l.viaOutcomes})),orphanValues:t.map(l=>({label:l.value.label})),conflictBehaviours:i.map(l=>({label:l.behaviour.label,conflictIndex:Math.round(l.metrics.conflictIndex*100)/100,positiveValues:l.positiveValues.map(c=>c.label),negativeValues:l.negativeValues.map(c=>c.label)})),suggestions:n}}function wi(s){const e=[];if(e.push("# M-E Net Summary Report"),e.push(""),e.push(`> Generated: ${new Date(s.generatedAt).toLocaleString()}`),e.push(`> Version: ${s.version}`),e.push(""),e.push("## Network Statistics"),e.push(""),e.push(`- **Behaviours:** ${s.stats.behaviours}`),e.push(`- **Outcomes:** ${s.stats.outcomes}`),e.push(`- **Values:** ${s.stats.values}`),e.push(`- **Links:** ${s.stats.links}`),e.push(""),e.push("## Top Leverage Behaviours"),e.push(""),s.topLeverageBehaviours.length===0)e.push("_No behaviours with positive leverage found._");else for(const t of s.topLeverageBehaviours)e.push(`### ${t.label}`),e.push(""),e.push(`- **Leverage Score:** ${t.score}`),e.push(`- **Supports Values:** ${t.supportedValues.join(", ")||"None"}`),e.push(`- **Via Outcomes:** ${t.viaOutcomes.join(", ")||"None"}`),e.push("");if(e.push("## Orphan Values"),e.push(""),s.orphanValues.length===0)e.push("_All values are connected to behaviours. Great job!_");else{e.push("These values have no supporting behaviours:"),e.push("");for(const t of s.orphanValues)e.push(`- ${t.label}`)}if(e.push(""),e.push("## Conflict Behaviours"),e.push(""),s.conflictBehaviours.length===0)e.push("_No conflicting behaviours detected._");else for(const t of s.conflictBehaviours)e.push(`### ${t.label}`),e.push(""),e.push(`- **Conflict Index:** ${t.conflictIndex}`),e.push(`- **Helps:** ${t.positiveValues.join(", ")}`),e.push(`- **Hurts:** ${t.negativeValues.join(", ")}`),e.push("");e.push("## Suggested Next Steps"),e.push("");for(const t of s.suggestions)e.push(`- ${t}`);return e.push(""),e.push("---"),e.push("_Generated by M-E Net_"),e.join(`
`)}function Si(){return`me-net-report-${new Date().toISOString().slice(0,10)}.md`}function Ii(s,e,t,i){const n=ki(s,e,t,i),a=wi(n),o=new Blob([a],{type:"text/markdown"}),r=URL.createObjectURL(o),l=document.createElement("a");l.href=r,l.download=Si(),document.body.appendChild(l),l.click(),document.body.removeChild(l),URL.revokeObjectURL(r)}function me(s,e){const t=s.behaviours.find(r=>r.id===e.sourceId);if(!t)return{success:!1,error:`Behaviour with id "${e.sourceId}" not found`};const i=s.outcomes.find(r=>r.id===e.targetId);if(!i)return{success:!1,error:`Outcome with id "${e.targetId}" not found`};if(s.links.find(r=>r.sourceId===e.sourceId&&r.targetId===e.targetId))return{success:!1,error:`A link from "${t.label}" to "${i.label}" already exists`};const a={id:R("l"),type:"behaviour-outcome",sourceId:e.sourceId,targetId:e.targetId,valence:e.valence,reliability:e.reliability,createdAt:k(),updatedAt:k()};return{success:!0,data:{network:{...s,links:[...s.links,a]},link:a}}}function be(s,e){const t=s.outcomes.find(r=>r.id===e.sourceId);if(!t)return{success:!1,error:`Outcome with id "${e.sourceId}" not found`};const i=s.values.find(r=>r.id===e.targetId);if(!i)return{success:!1,error:`Value with id "${e.targetId}" not found`};if(s.links.find(r=>r.sourceId===e.sourceId&&r.targetId===e.targetId))return{success:!1,error:`A link from "${t.label}" to "${i.label}" already exists`};const a={id:R("l"),type:"outcome-value",sourceId:e.sourceId,targetId:e.targetId,valence:e.valence,strength:e.strength,createdAt:k(),updatedAt:k()};return{success:!0,data:{network:{...s,links:[...s.links,a]},link:a}}}function Li(s,e,t){const i=s.links.findIndex(c=>c.id===e);if(i===-1)return{success:!1,error:`Link with id "${e}" not found`};const n=s.links[i];if(n.type!=="behaviour-outcome")return{success:!1,error:`Link "${e}" is not a behaviour-outcome link`};const a=n,o={id:a.id,type:"behaviour-outcome",sourceId:a.sourceId,targetId:a.targetId,valence:t.valence??a.valence,reliability:t.reliability??a.reliability,createdAt:a.createdAt,updatedAt:k()},r=[...s.links];return r[i]=o,{success:!0,data:{network:{...s,links:r},link:o}}}function xi(s,e,t){const i=s.links.findIndex(c=>c.id===e);if(i===-1)return{success:!1,error:`Link with id "${e}" not found`};const n=s.links[i];if(n.type!=="outcome-value")return{success:!1,error:`Link "${e}" is not an outcome-value link`};const a=n,o={id:a.id,type:"outcome-value",sourceId:a.sourceId,targetId:a.targetId,valence:t.valence??a.valence,strength:t.strength??a.strength,createdAt:a.createdAt,updatedAt:k()},r=[...s.links];return r[i]=o,{success:!0,data:{network:{...s,links:r},link:o}}}function Ei(s,e){if(s.links.findIndex(a=>a.id===e)===-1)return{success:!1,error:`Link with id "${e}" not found`};const i=s.links.filter(a=>a.id!==e);return{success:!0,data:{network:{...s,links:i}}}}function fe(s,e){const t=ct(e.label,s);if(!t.valid)return{success:!1,error:t.error};const i={id:R("o"),type:"outcome",label:e.label.trim(),notes:e.notes,createdAt:k(),updatedAt:k()};return{success:!0,data:{network:{...s,outcomes:[...s.outcomes,i]},outcome:i}}}function $i(s,e,t){const i=s.outcomes.findIndex(l=>l.id===e);if(i===-1)return{success:!1,error:`Outcome with id "${e}" not found`};const n=s.outcomes[i];if(t.label!==void 0&&t.label.trim().toLowerCase()!==n.label.toLowerCase()){const l=ct(t.label,s);if(!l.valid)return{success:!1,error:l.error}}const a={...n,label:t.label?.trim()??n.label,notes:t.notes??n.notes,updatedAt:k()},o=[...s.outcomes];return o[i]=a,{success:!0,data:{network:{...s,outcomes:o},outcome:a}}}function Ni(s,e){if(s.outcomes.findIndex(o=>o.id===e)===-1)return{success:!1,error:`Outcome with id "${e}" not found`};const i=s.outcomes.filter(o=>o.id!==e),n=s.links.filter(o=>o.sourceId!==e&&o.targetId!==e);return{success:!0,data:{network:{...s,outcomes:i,links:n}}}}function ct(s,e){const t=s.trim();return t.length===0?{valid:!1,error:"Label cannot be empty"}:t.length>100?{valid:!1,error:"Label cannot exceed 100 characters"}:e.outcomes.some(n=>n.label.toLowerCase()===t.toLowerCase())?{valid:!1,error:`An outcome with label "${t}" already exists`}:{valid:!0}}function dt(s,e){const t=ut(e.label,s);if(!t.valid)return{success:!1,error:t.error};const i={id:R("v"),type:"value",label:e.label.trim(),importance:e.importance,neglect:e.neglect,notes:e.notes,createdAt:k(),updatedAt:k()};return{success:!0,data:{network:{...s,values:[...s.values,i]},value:i}}}function Ci(s,e,t){const i=s.values.findIndex(l=>l.id===e);if(i===-1)return{success:!1,error:`Value with id "${e}" not found`};const n=s.values[i];if(t.label!==void 0&&t.label.trim().toLowerCase()!==n.label.toLowerCase()){const l=ut(t.label,s);if(!l.valid)return{success:!1,error:l.error}}const a={...n,label:t.label?.trim()??n.label,importance:t.importance??n.importance,neglect:t.neglect??n.neglect,notes:t.notes??n.notes,updatedAt:k()},o=[...s.values];return o[i]=a,{success:!0,data:{network:{...s,values:o},value:a}}}function Ti(s,e){if(s.values.findIndex(o=>o.id===e)===-1)return{success:!1,error:`Value with id "${e}" not found`};const i=s.values.filter(o=>o.id!==e),n=s.links.filter(o=>o.targetId!==e);return{success:!0,data:{network:{...s,values:i,links:n}}}}function ut(s,e){const t=s.trim();return t.length===0?{valid:!1,error:"Label cannot be empty"}:t.length>100?{valid:!1,error:"Label cannot exceed 100 characters"}:e.values.some(n=>n.label.toLowerCase()===t.toLowerCase())?{valid:!1,error:`A value with label "${t}" already exists`}:{valid:!0}}const d={network:pe(),selectedNodeId:null,formMode:"none",editingNode:null,editingLink:null,linkType:null,preselectedSourceId:null,preselectedTargetId:null,ladderBehaviourId:null};let b=null,U=null,ht=null,vt=null,pt=null,ne=he(),H=null,N=null,_=null,B=!1;const mt="me-net-warnings",bt="me-net-welcome-dismissed",Bi=8e3;function Oi(){try{const s=localStorage.getItem(mt);if(s!==null&&s!=="")return JSON.parse(s)}catch{}return he()}function ie(){try{localStorage.setItem(mt,JSON.stringify(ne))}catch{}}function Y(s,e){if(!_)return;const t=document.createElement("div");t.className=`app-message app-message-${s}`,t.setAttribute("role",s==="error"?"alert":"status");const i=document.createElement("span");i.textContent=e,t.appendChild(i);const n=document.createElement("button");n.type="button",n.className="app-message-close",n.setAttribute("aria-label","Dismiss message"),n.textContent="×",n.addEventListener("click",()=>{t.remove()}),t.appendChild(n),_.appendChild(t),window.setTimeout(()=>{t.parentElement===_&&t.remove()},Bi)}function Ai(){try{B=localStorage.getItem(bt)==="true"}catch{B=!1}}function O(){if(!B){B=!0;try{localStorage.setItem(bt,"true")}catch{}H?.hide()}}function ft(){H&&(!B&&F(d.network)?H.show():H.hide())}function ge(){if(N){if(!B&&F(d.network)){N.hide();return}F(d.network)?N.show():N.hide()}}function ye(){document.getElementById("import-file-input")?.click()}function Di(){O(),N?.hide(),ke()}function Vi(){O(),N?.hide(),ye()}function qi(){O(),N?.hide(),ke()}function Mi(){O(),N?.hide(),gt()}function Hi(){O(),N?.hide(),ye()}function g(s){d.network=s;const e=ui(s);!e.success&&e.error&&Y("error",e.error),b?.setNetwork(s),U?.setNetwork(s),ht?.setNetwork(s),vt?.setNetwork(s),pt?.setNetwork(s),!B&&!F(s)&&O(),ge(),ft()}function S(s){if(d.selectedNodeId=s,s!==null&&s!==""){b?.selectNode(s);const e=ae(s);e&&U?.show(e)}else b?.clearSelection(),U?.hide()}function ae(s){return d.network.behaviours.find(e=>e.id===s)??d.network.outcomes.find(e=>e.id===s)??d.network.values.find(e=>e.id===s)}function Fi(s){return d.network.links.find(e=>e.id===s)}function ke(){d.formMode="create-behaviour",C()}function zi(){d.formMode="create-outcome",C()}function Wi(){d.formMode="create-value",C()}function D(s,e,t){d.formMode="create-link",d.linkType=s,d.preselectedSourceId=e??null,d.preselectedTargetId=t??null,C()}function Ri(s){d.formMode="edit-node",d.editingNode=s,C()}function Pi(s){d.formMode="edit-link",d.editingLink=s,d.linkType=s.type,C()}function gt(s){d.formMode="why-ladder",d.ladderBehaviourId=null,C()}function y(){d.formMode="none",d.editingNode=null,d.editingLink=null,d.linkType=null,d.preselectedSourceId=null,d.preselectedTargetId=null,d.ladderBehaviourId=null,C(),ge()}function _i(s){const e=it(d.network,{label:s,frequency:"occasionally",cost:"low",contextTags:[]});if(e.success&&e.data)return g(e.data.network),e.data.behaviour;throw new Error("Failed to create behaviour")}function ji(s,e){const t=fe(d.network,{label:s});if(!t.success||!t.data)throw new Error("Failed to create outcome");const i=me(t.data.network,{sourceId:e,targetId:t.data.outcome.id,valence:"positive",reliability:"usually"});return i.success&&i.data&&g(i.data.network),t.data.outcome}function Gi(s,e){const t=me(d.network,{sourceId:e,targetId:s,valence:"positive",reliability:"usually"});t.success&&t.data&&g(t.data.network)}function Ui(s,e){const t=dt(d.network,{label:s,importance:"high",neglect:"adequately-met"});if(!t.success||!t.data)throw new Error("Failed to create value");const i=be(t.data.network,{sourceId:e,targetId:t.data.value.id,valence:"positive",strength:"moderate"});return i.success&&i.data&&g(i.data.network),t.data.value}function Yi(s,e){const t=be(d.network,{sourceId:e,targetId:s,valence:"positive",strength:"moderate"});t.success&&t.data&&g(t.data.network)}function Qi(s,e){const t=fe(d.network,{label:s});if(!t.success||!t.data)throw new Error("Failed to create chained outcome");return g(t.data.network),t.data.outcome}function Xi(s){y()}function Ji(s){y()}function We(s){if(d.formMode==="edit-node"&&d.editingNode?.type==="behaviour"){const e=ri(d.network,d.editingNode.id,{label:s.label,frequency:s.frequency,cost:s.cost,contextTags:s.contextTags,notes:s.notes||void 0});e.success&&e.data&&(g(e.data.network),S(d.editingNode.id))}else{const e=it(d.network,{label:s.label,frequency:s.frequency,cost:s.cost,contextTags:s.contextTags,notes:s.notes||void 0});e.success&&e.data&&(g(e.data.network),S(e.data.behaviour.id))}y()}function Re(s){if(d.formMode==="edit-node"&&d.editingNode?.type==="outcome"){const e=$i(d.network,d.editingNode.id,{label:s.label,notes:s.notes||void 0});e.success&&e.data&&(g(e.data.network),S(d.editingNode.id))}else{const e=fe(d.network,{label:s.label,notes:s.notes||void 0});e.success&&e.data&&(g(e.data.network),S(e.data.outcome.id))}y()}function Pe(s){if(d.formMode==="edit-node"&&d.editingNode?.type==="value"){const e=Ci(d.network,d.editingNode.id,{label:s.label,importance:s.importance,neglect:s.neglect,notes:s.notes||void 0});e.success&&e.data&&(g(e.data.network),S(d.editingNode.id))}else{const e=dt(d.network,{label:s.label,importance:s.importance,neglect:s.neglect,notes:s.notes||void 0});e.success&&e.data&&(g(e.data.network),S(e.data.value.id))}y()}function _e(s){if(d.formMode==="edit-link"&&d.editingLink)if(s.type==="behaviour-outcome"){const e=Li(d.network,d.editingLink.id,{valence:s.valence,reliability:s.reliability});e.success&&e.data&&g(e.data.network)}else{const e=xi(d.network,d.editingLink.id,{valence:s.valence,strength:s.strength});e.success&&e.data&&g(e.data.network)}else if(s.type==="behaviour-outcome"){const e=me(d.network,{sourceId:s.sourceId,targetId:s.targetId,valence:s.valence,reliability:s.reliability});e.success&&e.data&&g(e.data.network)}else{const e=be(d.network,{sourceId:s.sourceId,targetId:s.targetId,valence:s.valence,strength:s.strength});e.success&&e.data&&g(e.data.network)}y()}function j(s){let e;switch(s.type){case"behaviour":e=li(d.network,s.id);break;case"outcome":e=Ni(d.network,s.id);break;case"value":e=Ti(d.network,s.id);break}e?.success&&e.data&&(g(e.data.network),S(null)),y()}function yt(s){const e=Ei(d.network,s);e.success&&e.data&&g(e.data.network)}function Zi(s){b&&(b.setNodeTypeVisibility("behaviour",s.nodeTypes.behaviour),b.setNodeTypeVisibility("outcome",s.nodeTypes.outcome),b.setNodeTypeVisibility("value",s.nodeTypes.value),b.setValenceVisibility("positive",s.valence.positive),b.setValenceVisibility("negative",s.valence.negative),b.setSearchQuery(s.searchQuery),Ki(s.highlightMode))}function Ki(s){if(!b)return;if(s==="none"){b.clearHighlights();return}let e;const t=n=>{const a=new Set;a.add(n);const o=d.network.links.filter(r=>r.type==="behaviour-outcome"&&r.sourceId===n).map(r=>r.targetId);for(const r of o)a.add(r);for(const r of o){const l=d.network.links.filter(c=>c.type==="outcome-value"&&c.sourceId===r).map(c=>c.targetId);for(const c of l)a.add(c)}return a},i=n=>{const a=new Set;a.add(n);const o=d.network.links.filter(r=>r.type==="outcome-value"&&r.targetId===n).map(r=>r.sourceId);for(const r of o)a.add(r);for(const r of o){const l=d.network.links.filter(c=>c.type==="behaviour-outcome"&&c.targetId===r).map(c=>c.sourceId);for(const c of l)a.add(c)}return a};switch(s){case"leverage":{const n=ce(d.network,5);e=new Set;for(const a of n)for(const o of t(a.behaviour.id))e.add(o);break}case"fragile":{const n=de(d.network);e=new Set;for(const a of n)for(const o of i(a.value.id))e.add(o);break}case"conflicts":{const n=ue(d.network);e=new Set;for(const a of n)for(const o of t(a.behaviour.id))e.add(o);break}default:e=new Set}b.setHighlightedNodes(e)}function en(){bi(d.network)}function tn(){const s=ce(d.network,5),e=de(d.network),t=ue(d.network);Ii(d.network,s,e,t)}function sn(s){const e=s.target,t=e.files?.[0];t&&yi(t).then(i=>{if(i.success&&i.network){const n=i.network.behaviours.length+i.network.outcomes.length+i.network.values.length,a=i.network.links.length;confirm(`Import network with ${n} nodes and ${a} links?

This will replace your current network.`)&&(g(i.network),C(),Y("success","Network imported successfully."))}else Y("error",i.error??"Import failed due to an unknown error.");e.value=""})}function kt(){const s=document.getElementById("graph-container");if(!s||!b)return;const e=s.getBoundingClientRect();b.resize(e.width||800,e.height||600)}function nn(){const s=document.getElementById("sidebar"),e=document.getElementById("detail-panel"),t=document.getElementById("graph-container"),i=document.getElementById("sidebar-resizer"),n=document.getElementById("detail-resizer");if(!s||!e||!t)return;const a=(o,r)=>{o.addEventListener("mousedown",u=>{u.preventDefault();const h=r==="left"?s:e,p=u.clientX,v=h.getBoundingClientRect().width;o.classList.add("sidebar-resizer-active");const m=x=>{const E=x.clientX-p;let $=r==="left"?v+E:v-E;Number.isNaN($)||($<220&&($=220),$>560&&($=560),h.style.width=`${$}px`,kt())},L=()=>{document.removeEventListener("mousemove",m),document.removeEventListener("mouseup",L),o.classList.remove("sidebar-resizer-active")};document.addEventListener("mousemove",m),document.addEventListener("mouseup",L)})};i&&a(i,"left"),n&&a(n,"right")}function C(){const s=document.getElementById("sidebar");if(s===null)return;const e=s.querySelector(".sidebar-form-container");if(e!==null)switch(e.innerHTML="",d.formMode){case"create-behaviour":new Ce(e,{mode:"create",network:d.network,callbacks:{onSave:We,onCancel:y}});break;case"create-outcome":new Te(e,{mode:"create",network:d.network,callbacks:{onSave:Re,onCancel:y}});break;case"create-value":new Be(e,{mode:"create",network:d.network,callbacks:{onSave:Pe,onCancel:y}});break;case"create-link":d.linkType&&new Oe(e,{mode:"create",linkType:d.linkType,network:d.network,preselectedSourceId:d.preselectedSourceId??void 0,preselectedTargetId:d.preselectedTargetId??void 0,callbacks:{onSave:_e,onCancel:y}});break;case"edit-node":if(d.editingNode)switch(d.editingNode.type){case"behaviour":new Ce(e,{mode:"edit",network:d.network,initialData:At(d.editingNode),callbacks:{onSave:We,onCancel:y,onDelete:()=>j(d.editingNode)}});break;case"outcome":new Te(e,{mode:"edit",network:d.network,initialData:Vt(d.editingNode),callbacks:{onSave:Re,onCancel:y,onDelete:()=>j(d.editingNode)}});break;case"value":new Be(e,{mode:"edit",network:d.network,initialData:Mt(d.editingNode),callbacks:{onSave:Pe,onCancel:y,onDelete:()=>j(d.editingNode)}});break}break;case"edit-link":d.editingLink!==null&&d.linkType!==null&&new Oe(e,{mode:"edit",linkType:d.linkType,network:d.network,initialData:d.editingLink.type==="behaviour-outcome"?{type:"behaviour-outcome",sourceId:d.editingLink.sourceId,targetId:d.editingLink.targetId,valence:d.editingLink.valence,reliability:d.editingLink.reliability}:{type:"outcome-value",sourceId:d.editingLink.sourceId,targetId:d.editingLink.targetId,valence:d.editingLink.valence,strength:d.editingLink.strength},callbacks:{onSave:_e,onCancel:y,onDelete:()=>{yt(d.editingLink.id),y()}}});break;case"why-ladder":new _s(e,{network:d.network,initialBehaviourId:d.ladderBehaviourId??void 0,callbacks:{onCreateBehaviour:_i,onSelectBehaviour:t=>{},onCreateOutcome:ji,onLinkOutcome:Gi,onCreateValue:Ui,onLinkValue:Yi,onChainOutcome:Qi,onComplete:Xi,onExit:Ji}});break;default:e.innerHTML=`
        <div class="sidebar-placeholder">
          <p>Add nodes to build your network:</p>
          <div class="add-buttons">
            <button class="btn btn-behaviour" id="btn-add-behaviour" aria-label="Add behaviour">Add Behaviour</button>
            <button class="btn btn-outcome" id="btn-add-outcome" aria-label="Add outcome">Add Outcome</button>
            <button class="btn btn-value" id="btn-add-value" aria-label="Add value">Add Value</button>
          </div>
          <hr class="sidebar-divider" />
          <p>Add connections:</p>
          <div class="add-buttons">
            <button class="btn btn-link" id="btn-add-bo-link" aria-label="Add behaviour to outcome link">Behaviour → Outcome Link</button>
            <button class="btn btn-link" id="btn-add-ov-link" aria-label="Add outcome to value link">Outcome → Value Link</button>
          </div>
          <hr class="sidebar-divider" />
          <p>Guided capture:</p>
          <div class="add-buttons">
            <button class="btn btn-ladder" id="btn-why-ladder" aria-label="Start Why Ladder capture">🪜 Why Ladder</button>
          </div>
        </div>
      `,document.getElementById("btn-add-behaviour")?.addEventListener("click",ke),document.getElementById("btn-add-outcome")?.addEventListener("click",zi),document.getElementById("btn-add-value")?.addEventListener("click",Wi),document.getElementById("btn-add-bo-link")?.addEventListener("click",()=>D("behaviour-outcome")),document.getElementById("btn-add-ov-link")?.addEventListener("click",()=>D("outcome-value")),document.getElementById("btn-why-ladder")?.addEventListener("click",()=>gt())}}function je(){const s=document.getElementById("app");if(!s)return;Ai(),s.innerHTML=`
    <div class="app-container">
      <header class="app-header" role="banner">
        <h1>M-E Net</h1>
        <p class="subtitle">Means–Ends Network</p>
        <div class="toolbar" role="toolbar" aria-label="Graph controls">
          <button id="btn-fit" class="btn" aria-label="Fit entire network to view">Fit to View</button>
          <button id="btn-reset" class="btn" aria-label="Reset zoom level">Reset Zoom</button>
          <span class="toolbar-separator"></span>
          <button id="btn-export-json" class="btn btn-export" aria-label="Export network as JSON">Export JSON</button>
          <button id="btn-export-report" class="btn btn-export" aria-label="Export summary report">Export Report</button>
          <button id="btn-import" class="btn btn-import" aria-label="Import network data">Import</button>
          <input type="file" id="import-file-input" accept=".json" style="display: none;" aria-hidden="true" />
        </div>
      </header>
      <div id="app-messages" class="app-messages" role="region" aria-live="polite" aria-atomic="false"></div>
      <main class="app-main" role="main" aria-label="Network workspace">
        <aside id="sidebar" class="sidebar" aria-label="Network controls">
          <div class="sidebar-content">
            <h2 class="sidebar-title">Filters</h2>
            <div class="sidebar-filter-container"></div>
            <hr class="sidebar-divider" />
            <h2 class="sidebar-title">Add / Edit</h2>
            <div class="sidebar-form-container"></div>
            <hr class="sidebar-divider" />
            <h2 class="sidebar-title">Validation</h2>
            <div class="sidebar-validation-container"></div>
            <hr class="sidebar-divider" />
            <h2 class="sidebar-title">Insights</h2>
            <div class="sidebar-insights-container"></div>
          </div>
        </aside>
        <div id="sidebar-resizer" class="sidebar-resizer" role="separator" aria-orientation="vertical" aria-label="Resize left sidebar"></div>
        <div id="graph-container" class="graph-container" role="region" aria-label="Network diagram"></div>
        <div id="detail-resizer" class="sidebar-resizer" role="separator" aria-orientation="vertical" aria-label="Resize detail panel"></div>
        <aside id="detail-panel" class="detail-panel hidden" aria-label="Node details panel"></aside>
      </main>
      <div id="overlay-root" class="overlay-root" aria-live="assertive"></div>
    </div>
  `,_=document.getElementById("app-messages");const e=document.getElementById("graph-container");if(!e)return;const t=document.getElementById("overlay-root");t&&(H=new oi(t,{onGetStarted:Di,onImportData:Vi})),N=new Tt(e,{onAddBehaviour:qi,onStartWhyLadder:Mi,onImportData:Hi});const i=e.getBoundingClientRect();b=new vs(e,{width:i.width||800,height:i.height||600});const n=hi();!n.success&&n.error&&Y("error",n.error),d.network=n.success&&n.data?n.data:pe(),b.setNetwork(d.network),F(d.network)||O(),ge(),ft(),ne=Oi();const a=document.getElementById("detail-panel");a&&(U=new Pt(a,{network:d.network,callbacks:{onEdit:u=>Ri(u),onDelete:u=>j(u),onAddLink:(u,h)=>{const p=ae(u);p&&(p.type==="behaviour"&&h==="outgoing"?D("behaviour-outcome",u):p.type==="outcome"?h==="incoming"?D("behaviour-outcome",void 0,u):D("outcome-value",u):p.type==="value"&&h==="incoming"&&D("outcome-value",void 0,u))},onSelectNode:u=>S(u),onEditLink:u=>{const h=Fi(u);h&&Pi(h)},onDeleteLink:u=>yt(u),onClose:()=>S(null)}}));const o=document.querySelector(".sidebar-validation-container");o&&(ht=new ai(o,{network:d.network,warningState:ne,callbacks:{onSnooze:u=>{ie()},onDismiss:u=>{ie()},onUndismiss:u=>{ie()},onNavigateToNode:u=>{S(u)}}}));const r=document.querySelector(".sidebar-insights-container");r&&(vt=new Hs(r,{network:d.network,callbacks:{onNavigateToNode:u=>{S(u)}}}));const l=document.querySelector(".sidebar-filter-container");l&&(pt=new Bt(l,{network:d.network,callbacks:{onFilterChange:u=>{Zi(u)}}})),setTimeout(()=>b?.fitToView(),100),document.getElementById("btn-fit")?.addEventListener("click",()=>b?.fitToView()),document.getElementById("btn-reset")?.addEventListener("click",()=>b?.resetZoom()),document.getElementById("btn-export-json")?.addEventListener("click",en),document.getElementById("btn-export-report")?.addEventListener("click",tn),document.getElementById("btn-import")?.addEventListener("click",()=>{ye()}),document.getElementById("import-file-input")?.addEventListener("change",sn),b.setOnNodeClick(u=>{const h=ae(u.id);h&&S(h.id)}),b.setOnBackgroundClick(()=>{S(null)}),nn();let c;window.addEventListener("resize",()=>{clearTimeout(c),c=window.setTimeout(()=>{kt()},100)}),C()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",je):je();
//# sourceMappingURL=index-a6cKTFFW.js.map
