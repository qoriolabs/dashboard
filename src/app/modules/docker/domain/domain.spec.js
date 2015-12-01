describe('Controller: DockerDomainController', function() {

    var $scope,
        resolvedDomain = [{id:1}];

    beforeEach(function(){
        module('qorDash.docker.domain');
    });

    beforeEach(function () {
        inject(function(_$rootScope_, _$controller_)  {
            $scope = _$rootScope_.$new();
            _$controller_('DockerDomainController as vm', {$scope: $scope, resolvedDomain: resolvedDomain});

        })
    });

    describe('after loading', function(){
        it('should define variables', function () {
            expect($scope.vm.domain).toBe(resolvedDomain);
        })
    });
});
