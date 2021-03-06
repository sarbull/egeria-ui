/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright Contributors to the ODPi Egeria project. */

import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-form/iron-form.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/iron-a11y-keys/iron-a11y-keys.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-styles/paper-styles.js';
import '@polymer/paper-input/paper-input-behavior.js';

import '../old/shared-styles.js';
import '../old/form-feedback.js';

import { setCookie } from './commons/local-storage';

import { ENV } from '../env';

class EgeriaLogin extends PolymerElement {
  getApiUrl() {
    return ENV['API_URL'];
  }

  static get properties() {
    return {
      token: {
        type: Object,
        notify: true
      },
      feedback: String,
      feedbackLevel: String,
      titleChunks: { type: Array, value: [] },
      app: {
        type: Object,
        observer: '_updateApp'
      }
    };
  }

  _updateApp() {
    this.titleChunks = !['', undefined].includes(this.app) ? this.app.title.split('|') : [];
  }

  ready() {
    super.ready();
    this.addEventListener('iron-form-response', this._handleLoginSuccess);
    this.addEventListener('iron-form-error', this._handleLoginError);
  }

  _handleLoginSuccess(evt) {
    this.token = evt.detail.xhr.getResponseHeader('x-auth-token');
    this.feedback = 'Authentication successful!';
    this.feedbackLevel = 'info';

    setCookie('token', this.token);

    let decodedUrl = this.queryParams.redirect ? decodeURIComponent(this.queryParams.redirect) : '/';

    let redirectUrl = !decodedUrl.indexOf('http') ? '/' : decodedUrl;

    window.location.href = redirectUrl;
  }

  _handleLoginError(evt) {
    if(evt.detail.request.xhr.response.status === 401) {
      this.feedback = 'You have entered incorrect username or password.';
    } else if(evt.detail.request.xhr.response.status === 403) {
      this.feedback = 'This user is not authorized to access this application.';
    } else {
      this.feedback = 'Sorry. We cannot authenticate you right now. Please come back later.';
    }

    this.feedbackLevel = 'error';
  }

  _logIn() {
    this.$.form.submit();
  }

  static get template() {
    return html`
      <style include="shared-styles">
        :host {
          display: block;
          height:100%;
          padding: 0;

          background: var(--login-background);
        }

        div.container {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        div.container h1 {
          color: var(--egeria-primary-color) !important;
          font-family: var(--custom-font-family) !important;
          font-size: 30px !important;
          margin-bottom: 0 !important;
        }

        .login {
          padding: 16px;
          color: #757575;
          border-radius: 5px;
          background-color: #fff;
          box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
          max-width: 600px;
          width: 100%;
        }

        .container.logo {
          margin-bottom:25px;
        }

        .container.logo img {
          height:50px;
          margin-left:25px;
        }

        .no-margins {
          margin:0;
        }

        .full-width {
          width:100%;
        }

        .max-width {
          max-width: 600px;
        }

        .centered {
          justify-content: space-around;
        }
      </style>

      <iron-localstorage name="my-app-storage" value="{{ token }}"></iron-localstorage>
      <iron-ajax id="ajax" url="[[ getApiUrl() ]]/api/public/app/info" auto last-response="{{app}}"></iron-ajax>

      <div class="container">
        <h1>
          <template is="dom-repeat" items="[[ titleChunks ]]">
            [[ item ]] <br/>
          </template>
        </h1>
      </div>

      <div class="container logo">
        <p>Powered by</p>

        <img src="images/Logo_transparent.png"/>
      </div>

      <div class="container">
        <div class="login">
          <iron-form id="form">
            <form method="post" action="[[ getApiUrl() ]]/api/auth/login">
              <paper-input value="{{ username }}"
                           label="Username"
                           name="username"
                           required
                           error-message="Username is required"
                           autofocus></paper-input>

              <paper-input value="{{ password }}"
                           label="Password"
                           name="password"
                           required
                           error-message="Password is required"
                          type="password"></paper-input>

              <form-feedback message="{{feedback}}" level="{{feedbackLevel}}"></form-feedback>

              <paper-button id="login-button" on-tap="_logIn" class="full-width no-margins" raised>
                Login
              </paper-button>

              <iron-a11y-keys keys="enter" on-keys-pressed="_logIn"></iron-a11y-keys>
            </form>
          </iron-form>
        </div>
      </div>
    `;
  }
}

window.customElements.define('egeria-login', EgeriaLogin);
