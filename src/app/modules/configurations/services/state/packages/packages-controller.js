(function () {
    'use strict';

    angular
        .module('qorDash.configurations.services.state.packages')
        .controller('PackagesController', packagesController);

    function packagesController($scope, $state, resolvedPackage) {
        var vm = this;

        vm.checked = {};
        vm.service = resolvedPackage[$state.params.service];
        vm.instances = vm.service.instances;

        vm.show = show;

        vm.instances.forEach(function(instance) {
            vm.checked[instance] = true;
        });

        if ($state.params.instances) {
            for (var i in vm.checked) {
                vm.checked[i] = false;
            }
            $state.params.instances.split(',').forEach(function(instance){
                if (vm.checked[instance] != 'undefined') {
                    vm.checked[instance] = true;
                }
            });
        }

        function show() {
            var selectedInstances = [];
            for (var i in vm.checked) {
                if (vm.checked[i]) {
                    selectedInstances.push(i);
                }
            }
            if (selectedInstances.length > 0) {
                $state.go('.editor', {instances: selectedInstances});
            }
        }
    }
})();
