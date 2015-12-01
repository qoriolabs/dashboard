describe('Controller: DockersController', function() {

    var $scope,
        $stateParams = {instance: 'instance'},
        resolvedDockers = [{id:1}];

    beforeEach(function(){
        module('qorDash.docker');
        module(function ($provide) {
            $provide.value("DOCKER_ENDPOINT", '');
        });
    });

    beforeEach(function () {
        inject(function(_$rootScope_, _$controller_)  {
            $scope = _$rootScope_.$new();
            _$controller_('DockersController as vm', {$scope: $scope, $stateParams: $stateParams, resolvedDockers: resolvedDockers});

        })
    });

    describe('after loading', function(){
        it('should define variables', function () {
            expect($scope.vm.instance).toBe($stateParams.instance);
            expect($scope.vm.dockers).toBe(resolvedDockers);
        })
    });
});
