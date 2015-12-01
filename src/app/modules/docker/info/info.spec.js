describe('Controller: DockerInfoController', function() {

    var $scope,
        resolvedDockerInfo = [{1:2}],
        resolvedSystemInfo = [{1:2}],
        Settings = {endpoint: 'endpoint'};

    beforeEach(function(){
        module('qorDash.docker.domain.dockers.menu.info');
    });

    beforeEach(function () {
        inject(function(_$rootScope_, _$controller_)  {
            $scope = _$rootScope_.$new();
            _$controller_('DockerInfoController as vm', {$scope: $scope, resolvedDockerInfo: resolvedDockerInfo, Settings: Settings, resolvedSystemInfo: resolvedSystemInfo});

        })
    });

    describe('after loading', function(){
        it('should define variables', function () {
            expect($scope.vm.docker).toBe(resolvedDockerInfo);
            expect($scope.vm.info).toBe(resolvedSystemInfo);
            expect($scope.vm.endpoint).toBe(Settings.endpoint);

        })
    });
});
