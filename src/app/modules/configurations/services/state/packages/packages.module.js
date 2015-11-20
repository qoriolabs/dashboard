(function () {
    'use strict';

    angular
        .module('qorDash.configurations.services.state.packages', [])
        .config(config);

    function config($stateProvider) {
        $stateProvider
            .state('app.configurations.services.state.packages', {
                url: '/packages',
                templateUrl: 'app/modules/configurations/services/state/packages/packages.html',
                controller: 'PackagesController',
                controllerAs: 'vm',
                resolve: {
                    resolvedPackage: function($stateParams, configurationService) {
                        return configurationService.loadPackage($stateParams.domain);
                    }
                }
            })
    }
})();
