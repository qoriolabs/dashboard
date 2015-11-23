(function () {
    'use strict';

    angular
        .module('qorDash.configurations.services.state.packages.editor', [
            'ui.bootstrap',
            'mwl.confirm'
        ])
        .config(config);

    function config($stateProvider, NotificationProvider) {
        $stateProvider
            .state('app.configurations.services.state.packages.editor', {
                url: '/:instances',
                templateUrl: 'app/modules/configurations/services/state/packages/editor/editor.html',
                controller: 'PackagesEditorController',
                controllerAs: 'vm'
            });
    }
})();
