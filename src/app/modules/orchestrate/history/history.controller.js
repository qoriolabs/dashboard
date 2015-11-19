(function () {
    'use strict';

    angular
        .module('qorDash.orchestrate')
        .controller('OrchestrateHistoryController', orchestrateHistoryController);

    function orchestrateHistoryController(resolvedHistory) {
        var vm = this;
        vm.previousCalls = resolvedHistory;
    }
})();
