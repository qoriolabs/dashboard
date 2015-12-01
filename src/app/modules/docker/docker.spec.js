describe('Controller: DockerController', function() {

    var $scope,
        $state,
        resolvedDomains = [{id:1}];

    beforeEach(function(){
        module('qorDash.docker');
        module(function ($provide) {
            $provide.value("DOCKER_ENDPOINT", '');
            $provide.service('$state', function() {
                this.go = jasmine.createSpy('go').and.callFake(function(smth) {
                    return smth;
                });
                this.current = {
                    name: 'app.docker.domains'
                }
            });
        });
    });

    beforeEach(function () {
        inject(function(_$rootScope_, _$controller_, _$state_)  {
            $state = _$state_;
            $scope = _$rootScope_.$new();
            _$controller_('DockerController as vm', {$scope: $scope, $state: $state, resolvedDomains: resolvedDomains});

        })
    });

    describe('after loading', function(){
        it('should populate variable with resolvedDomains', function () {
            expect($scope.vm.domains).toBe(resolvedDomains);
        });

        describe('when vm.domains.length === 1 && $state.current.name == "app.docker.domains"', function () {
            it('should go domain path', function () {
                expect($state.go).toHaveBeenCalledWith('.domain', {domain:$scope.vm.domains[0].id});
            })
        });
    });
});
