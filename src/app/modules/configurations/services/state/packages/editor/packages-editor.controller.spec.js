describe('Controller: PackagesEditorController', function() {

    var $scope;
    var $state,
        deffered,
        $q,
        resolvedPackage = {
            service: {
                instances: ['one', 'two', 'three'],
                versions: ['one']
            }
        },
        resolvedDomains = [{id: 'one'}, {id: 'two'}];

    beforeEach(function(){
        module('qorDash.configurations.services.state.packages.editor');
        module(function($provide) {
            $provide.service('$state', function() {
                this.params = {
                    domain: 'one',
                    instances: 'one,two,three',
                    service: 'service'
                }
            });
            $provide.service('Notification', function() {
                this.success = jasmine.createSpy('success').and.callThrough();
            });
            $provide.service('configurationService', function() {
                this.pkg = {
                    getVersions: jasmine.createSpy('getVersions').and.callFake(function() {
                        var deferred = $q.defer();
                        return deferred.promise;
                    })
                }
            });
        })
    });

    beforeEach(function () {
        inject(function(_$rootScope_, _$state_, _$controller_, _$q_)  {
            $q = _$q_;
            $scope = _$rootScope_.$new();
            $state = _$state_;
            _$controller_('PackagesEditorController as vm', {$scope: $scope, $state: $state, resolvedPackage: resolvedPackage, resolvedDomains: resolvedDomains});

        })
    });

    describe('after loading', function() {
        it('should defile variables', function() {
            expect($scope.vm.selectedVersion).toBeDefined();
            expect($scope.vm.itemsForSave).toBeDefined();
            expect($scope.vm.newItemsCount).toBeDefined();
            expect($scope.vm.values).toBeDefined();
            expect($scope.vm.requestsCounter).toBeDefined();
            expect($scope.vm.versions).toBeDefined();
            expect($scope.vm.liveVersion).toBeDefined();
            expect($scope.vm.requestsCounter).toBeDefined();
            expect($scope.vm.deletedVersions).toBeDefined();

            expect($scope.vm.domain).toEqual({id: 'one'});
            expect($scope.vm.editorService).toEqual(resolvedPackage.service);
        });
    });

    describe('isVersionDeleted()', function() {
        it('should check is version deleted', function() {
            $scope.vm.deletedVersions = {
                'instance': ['one']
            };
            expect($scope.vm.isVersionDeleted('instance', 'one')).toBe(true);
            expect($scope.vm.isVersionDeleted('instance', 'two')).toBe(false);
            expect($scope.vm.isVersionDeleted('instance1', 'two')).toBe(false);
        });
    })

});
