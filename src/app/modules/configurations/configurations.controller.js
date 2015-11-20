(function () {
    'use strict';

    angular
        .module('qorDash.configurations')
        .controller('ConfigurationsController', configurationsController);

    function configurationsController($state, $stateParams, resolvedDomains) {
        var vm = this;

        vm.domains = resolvedDomains;

        if(vm.domains.length === 1 && $state.current.name === 'app.configurations'){
            $state.go('.services', {domain:vm.domains[0].id});
        }

        vm.domain = vm.domains.filter(function (domain) {
            return domain.id == $stateParams.domain;
        })[0];
    }
})();
