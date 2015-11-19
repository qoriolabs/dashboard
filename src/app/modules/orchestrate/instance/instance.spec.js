describe('Controller: OrchestrateInstanceController', function() {

    var $scope;
    var $stateParams,
        resolvedInstances = {1: 2};
        workflows = {1: 2};

    beforeEach(function(){
        module('ui.router');
        module('qorDash.config');
        module('qorDash.core');
        module('qorDash.loaders');
        module('qorDash.orchestrate');
    });

    beforeEach(function () {
        inject(function(_$rootScope_, _$controller_)  {
            $scope = _$rootScope_.$new();
            $stateParams = {
                id: 'id',
                inst: 'inst'
            };
            _$controller_('OrchestrateInstanceController as vm', {$scope: $scope, $stateParams: $stateParams, resolvedInstances: resolvedInstances});
        })
    });

    describe('after loading', function(){
        it ('should set $scope.title to $stateParams.inst', function() {
            expect($scope.vm.title).toBe($stateParams.inst);
        });

        it ('should populate $scope.previousCalls with response.data', function() {
            expect($scope.vm.workflows).toEqual(workflows);
        });
    });
});
