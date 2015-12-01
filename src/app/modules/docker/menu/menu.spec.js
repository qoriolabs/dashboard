describe('Controller: DockerMenuController', function() {

    var $scope,
        $stateParams = {dockerId: 'id'};

    beforeEach(function(){
        module('qorDash.docker.domain.dockers.menu');
    });

    beforeEach(function () {
        inject(function(_$rootScope_, _$controller_)  {
            $scope = _$rootScope_.$new();
            _$controller_('DockerMenuController as vm', {$scope: $scope, $stateParams: $stateParams});

        })
    });

    describe('after loading', function(){
        it('should define variable', function () {
            expect($scope.vm.dockerId).toBe($stateParams.dockerId);
        });
    });
});
