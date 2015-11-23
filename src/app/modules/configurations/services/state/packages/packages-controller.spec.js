describe('Controller: PackagesController', function() {

    var $scope;
    var $state,
        resolvedPackage = {
            service: {
                instances: ['one', 'two', 'three']
            }
        };

    beforeEach(function(){
        module('qorDash.configurations.services.state.packages');
        module(function($provide) {
            $provide.service('$state', function() {
                this.go = jasmine.createSpy('go').and.callThrough();
                this.params = {
                    service: 'service',
                    instances: 'one,two'
                };
            })
        });
    });

    beforeEach(function () {
        inject(function(_$rootScope_, _$state_, _$controller_)  {
            $scope = _$rootScope_.$new();
            $state = _$state_;
            _$controller_('PackagesController as vm', {$scope: $scope, $state: $state, resolvedPackage: resolvedPackage});

        })
    });

    describe('after loading', function(){
        it('should load vm.service & vm.instances',function(){
            expect($scope.vm.service).toEqual(resolvedPackage[$state.params.service]);
            expect($scope.vm.instances).toEqual(resolvedPackage[$state.params.service].instances);
        });

        describe('if $state.params.instances defined', function() {
            it('should turn only state params checkboxes', function() {
                expect($scope.vm.checked).toEqual({
                    one: true,
                    two: true,
                    three: false
                })
            });
        })
    });
    describe('show', function() {
        beforeEach(function() {
            $scope.vm.checked = {
                one: true,
                two: true
            };
        });
        it('should go to `.editor` state with selectedInstances as params', function() {
            $scope.vm.show();
            expect($state.go).toHaveBeenCalledWith('.editor', {instances: ['one', 'two']});
        });
    });
});
