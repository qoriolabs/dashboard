(function () {
    'use strict';

    angular
        .module('qorDash.orchestrate')
        .controller('OrchestrateInstanceController', orchestrateInstanceController);

    function orchestrateInstanceController($stateParams, resolvedInstances) {
        var vm = this;

        vm.title = $stateParams.inst;
        vm.workflows = resolvedInstances;
    }
})();
