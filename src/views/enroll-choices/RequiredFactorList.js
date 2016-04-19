/*!
 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

define(['okta', './FactorList'], function (Okta, FactorList) {

  return FactorList.extend({

    listTitle: Okta.loc('enroll.choices.list.setup', 'login'),

    className: function () {
      return FactorList.prototype.className + ' enroll-required-factor-list';
    },

    initialize: function () {
      var numRequired = this.collection.length,
          numCompleted = this.collection.where({ enrolled: true }).length,
          currentStep = numCompleted + 1;
      this.listSubtitle = Okta.loc('enroll.choices.step', 'login', [currentStep, numRequired]);
    },
    postRender: function () {
      var currentModel, currentRow;
      FactorList.prototype.postRender.apply(this, arguments);
      currentModel = this.options.appState.get('factors').getFirstUnenrolledRequiredFactor();
      currentRow = this.find(function (view) {
        return view.model === currentModel;
      });
      currentRow.maximize();
    }

  });

});
