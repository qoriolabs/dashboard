(function () {
    'use strict';

    angular
        .module('qorDash.orchestrate')
        .controller('OrchestrateDomainController', orchestrateDomainController);

    function orchestrateDomainController(resolvedDomain) {
        var vm = this;
        vm.domain = resolvedDomain;
    }

})();
