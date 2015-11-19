(function () {
    'use strict';

    angular
        .module('qorDash.orchestrate')
        .controller('OrchestrateController', orchestrateController);

    function orchestrateController($state, $stateParams, resolvedDomains) {
        var vm = this;

        vm.domains = resolvedDomains;

        // Go to the next state if we have only one domain
        if(vm.domains.length === 1 && $state.current.name == 'app.orchestrate'){
            $state.go('app.orchestrate.domain', {id:vm.domains[0].id})
        }

        vm.domain = vm.domains.filter(function (domain) {
            return domain.id == $stateParams.id;
        })[0];
    }
})();
