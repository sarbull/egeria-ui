/* SPDX-License-Identifier: Apache-2.0 */

/* Copyright Contributors to the ODPi Egeria project. */

import { PolymerElement, html } from "@polymer/polymer/polymer-element.js";
import "@polymer/paper-checkbox/paper-checkbox.js";
import "@polymer/paper-button/paper-button.js";
import "@polymer/paper-input/paper-input.js";
import '../../old/shared-styles.js';
import '../../old/token-ajax.js';
import {egeriaFetch} from "../commons/fetch";

/*
*
* ConnectionManager implements a web component for specification of server details
*
* It should present to the user 5 controls for:
*   * server name        - a string
*   * server URL Root    - a string
*   * enterprise scope   - a boolean
*   * a Load! button     - a button to initiate a connection using the displayed settings
*   * status             - a string - displays if a load failure occurs
*
* The user can change the details at any time; they will take effect when Load! button is pressed.
* This will initiate a connection attempt by the TypeManager - which will either succeed (causing the
* typesLoaded event to be sent), or fail (e.g. because the server is unavailable or the details are
* incorrect).
*
*
*/

class ConnectionManager extends PolymerElement {
  static get properties() {
    return {

      //  user-specified serverName - using bi-directional databind
      serverName: {
        type               : String,
        value              : "",
        notify             : true,
        reflectToAttribute : true
      },

      //  user-specified serverURLRoot
      serverURLRoot: {
        type               : String,
        value              : "",
        notify             : true,
        reflectToAttribute : true
      },

      //  user-specified enterprise scope option (true | false)
      enterpriseScope: {
        type               : Boolean,
        value              : false,
        notify             : true,
        reflectToAttribute : true
      },

      // Reference to TypeManager element which this ConnectionManager depends on.
      // The TypeManager is created in the DOM of the parent and is passed in
      // once we are all initialised. This avoids any direct dependency from ConnectionManager
      // on TypeManager.

      typeManager: Object

    };
  }

  /*
  * Element is ready
  */
  ready() {
    // Ensure you call super.ready() first to initialise node hash...
    super.ready();

    egeriaFetch(`/api/ui/settings`)
        .then(response => {
          this.serverName = response.serverName;
          this.serverURLRoot = response.baseUrl;
          this.doLoad();
        });
  }


  // Inbound events

  /*
  *  Inbound event: types-loaded
  */
  inEvtTypesLoaded() {
    this.clearStaleConnectionWarning();
  }

  /*
  *  Inbound event: types-loaded
  */
  inEvtTypesNotLoaded() {
    this.displayStaleConnectionWarning();
  }



  serverNameChanged() {
    // No action
  }

  serverURLRootChanged() {
    // No action
  }

  enterpriseScopeChanged() {
    // No action
  }

  doLoad() {
    var typeManager = this.typeManager;
    typeManager.loadTypes(this.serverName, this.serverURLRoot, this.enterpriseScope);
  }


  displayStaleConnectionWarning() {
    var statusMsg = this.$.statusMsg;
    statusMsg.innerHTML = "Warning: types did not load; switching to offline mode; previously loaded type information may be stale";
  }

  clearStaleConnectionWarning() {
    var statusMsg = this.$.statusMsg;
    statusMsg.innerHTML = "";
  }

  static get template() {
    return html`
      <style include="shared-styles">
        * { font-size: 12px ; font-family: sans-serif; }
        :host { display: block;  padding: 0px 10px; }
        .inline-element {
          display: inline-block;
        }
      </style>

      <div id='connectionParameters'>
        Load types from:
        <paper-input no-label-float
                    class="inline-element"
                    style="width:150px; height:0px; padding-left:20px; padding-right:20px; "
                    id = 'serverNameInput'
                    label = "Server Name"
                    value={{serverName}}
                    on-change="serverNameChanged"></paper-input>

        <paper-input no-label-float
                    class="inline-element"
                    style="width:200px; height:0px; padding-right:20px;"
                    label = "Server URL Root"
                    value={{serverURLRoot}}
                    on-change="serverURLRootChanged"></paper-input>

        <paper-checkbox disabled
                        class="inline-element"
                        style="padding-right:20px; "
                        id="enterpriseQuery"
                        checked="{{ enterpriseQuery }}"
                        on-change="enterpriseQueryChanged">
          Enterprise Query
        </paper-checkbox>

        <paper-button class="inline-element"
                      style="padding-left:10px; padding-right:10px; "
                      id = "loadButton"
                      raised
                      on-click="doLoad" >
          Load!
        </paper-button>

        <div class="inline-element" id='statusMsg'></div>
      </div>
    `;
  }
}

window.customElements.define('connection-manager', ConnectionManager);
