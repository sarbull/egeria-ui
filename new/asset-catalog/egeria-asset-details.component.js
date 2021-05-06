/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */
import { PolymerElement, html } from '@polymer/polymer';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { EgeriaItemUtilsBehavior } from '../commons/egeria-item-utils.behaviour';
import { egeriaFetch } from '../commons/fetch';
import './egeria-asset-tools.component';
import '../commons/egeria-props-table.component';

import { ENV } from '../../env';

class EgeriaAssetDetails extends mixinBehaviors([EgeriaItemUtilsBehavior], PolymerElement) {
  static get properties() {
    return {
      guid: { type: String, value: '', observer: '_onGuidChange' },
      item: { type: Object, value: null },
      components: { type: Array, value: [] }
    }
  }

  _onGuidChange() {
    this.updateData();
  }

  ready() {
    super.ready();

    egeriaFetch(`/api/assets/${ this.atob(this.guid) }`)
      .then(response => response.json())
      .then(response => {
        this.item = response;
      });
  }

  updateData() {
    egeriaFetch(`/api/assets/${ this.atob(this.guid) }`)
      .then(response => response.json())
      .then(response => {
        this.item = response;
      });
  }

  atob(string) {
    return ENV['PRODUCTION'] ? string : window.atob(string);
  }

  static get template() {
    return html`
      <style>
        :host {
          display:block;
          height:100%;
          background:var(--egeria-background-color);
        }
      </style>

      <template is="dom-if" if="[[ item ]]">
        <egeria-asset-tools guid="[[ item.guid ]]"
                            type="[[ item.type.name ]]"
                            components="[[ components ]]"></egeria-asset-tools>

        <egeria-props-table items="[[ _attributes(item.properties) ]]"
                            title="Properties"
                            with-row-stripes></egeria-props-table>

        <egeria-props-table items="[[ _attributes(item.type) ]]"
                            title="Type"
                            with-row-stripes ></egeria-props-table>

        <template is="dom-if" if="[[ _hasKeys(item.additionalProperties) ]]">
          <egeria-props-table items="[[ _attributes(item.additionalProperties) ]]"
                              title="Additional Properties"
                              with-row-stripes></egeria-props-table>
        </template>

        <egeria-props-table items="[[ _attributes(item) ]]"
                            title="Attributes"
                            with-row-stripes
                            collapsable></egeria-props-table>
      </template>
    `;
  }
}

window.customElements.define('egeria-asset-details', EgeriaAssetDetails);
