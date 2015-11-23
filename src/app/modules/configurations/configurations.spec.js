describe('Controller: ConfigurationsController', function() {

    var $scope;
    var $stateParams = {domain: 1},
        $state,
        resolvedDomains = [{id: 1}],
        domain = {};

    beforeEach(function(){
        module('qorDash.configurations');
        module(function($provide) {
            $provide.service('$state', function() {
                this.go = jasmine.createSpy('go').and.callThrough();
                this.current = {
                    name: 'app.configurations'
                };
            });
        });
    });


    beforeEach(function () {
        inject(function(_$rootScope_, _$controller_, _$state_)  {
            $scope = _$rootScope_.$new();
            $state = _$state_;
            _$controller_('ConfigurationsController as vm', {$scope: $scope, $state: $state, $stateParams: $stateParams, resolvedDomains: resolvedDomains});
        })
    });


    describe('after loading', function(){
        it ('should populate $scope.domains with response.data', function() {
            expect($scope.vm.domains).toBe(resolvedDomains);
        });

        it ('should redirect to app.configurations.services', function() {
            expect($state.go).toHaveBeenCalledWith('.services', {domain:$scope.vm.domains[0].id});
        });

        it('should populate $scope.domain if domain.id == stateParams.id', function(){
            domain.id = $stateParams.domain;
            expect($scope.vm.domain).toEqual(domain);
        });
    });
});
