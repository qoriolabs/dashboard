describe('Controller: PackagesEditorController', function() {

    var $scope;
    var $state,
        $q,
        $modal,
        configurationService,
        Notification,
        error = {},
        resolvedPackage = {
            service: {
                instances: ['one', 'two', 'three'],
                versions: ['one']
            }
        },
        resolvedDomains = [{id: 'one'}, {id: 'two'}],
        responseGetVersions = {
            'one': 'data'
        },
        responseGetVariables = {
            config: {
                url: 'http://www.qoriolabs.com/instances/instance/version/three'
            },
            data: {
                'varName': 'name'
            }
        },
        deferred1,
        deferred2,
        deferred3,
        deferred4,
        deferred5;

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
                this.error = jasmine.createSpy('error').and.callThrough();
            });
            $provide.service('$modal', function() {
                this.open = jasmine.createSpy('open').and.callThrough();
            });
            $provide.service('configurationService', function() {
                this.pkg = {
                    getVersions: jasmine.createSpy('getVersions').and.callFake(function() {
                        deferred1 = $q.defer();
                        return deferred1.promise;
                    }),
                    getVariables: jasmine.createSpy('getVariables').and.callFake(function() {
                        deferred4 = $q.defer();
                        return deferred4.promise;
                    }),
                    makeLive: jasmine.createSpy('makeLive').and.callFake(function() {
                        deferred2 = $q.defer();
                        return deferred2.promise;
                    }),
                    save: jasmine.createSpy('save').and.callFake(function() {
                        deferred3 = $q.defer();
                        return deferred3.promise;
                    }),
                    saveCopy: jasmine.createSpy('saveCopy').and.callFake(function() {
                        deferred5 = $q.defer();
                        return deferred5.promise;
                    })
                }
            });
        })
    });

    beforeEach(function () {
        inject(function(_$rootScope_, _$state_, _$modal_, _$controller_, _$q_, _configurationService_, _Notification_)  {
            $q = _$q_;
            $modal = _$modal_;
            Notification = _Notification_;
            configurationService = _configurationService_;
            $scope = _$rootScope_.$new();
            $state = _$state_;
            _$controller_('PackagesEditorController as vm', {$scope: $scope, $state: $state, resolvedPackage: resolvedPackage, resolvedDomains: resolvedDomains});
        })
    });

    describe('after loading', function() {
        console.log();
        it('should define variables', function() {
            expect($scope.vm.selectedVersion).toBeDefined();
            expect($scope.vm.itemsForSave).toBeDefined();
            expect($scope.vm.newItemsCount).toBeDefined();
            expect($scope.vm.values).toBeDefined();
            expect($scope.vm.requestsCounter).toBeDefined();
            expect($scope.vm.versions).toBeDefined();
            expect($scope.vm.liveVersion).toBeDefined();
            expect($scope.vm.deletedVersions).toBeDefined();

            expect($scope.vm.domain).toEqual({id: 'one'});
            expect($scope.vm.editorService).toEqual(resolvedPackage.service);
            expect($scope.vm.editorService.instances).toEqual($state.params.instances.split(','));
            $scope.vm.editorService.instances.forEach(function (instance) {
                expect($scope.vm.selectedVersion[instance]).toEqual($scope.vm.editorService.versions[0]);
            });
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
    });

    describe('changeSelected()', function() {
        describe('when vm.isVersionDeleted(instance, vm.selectedVersion[instance]) returns true', function () {
            beforeEach(function () {
                $scope.vm.selectedVersion = {
                    'instance': 'two'
                };
                $scope.vm.deletedVersions = {
                    'instance': ['two']
                };
                $scope.vm.changeSelected('instance', 'two');
            });

            it('should  change selected version', function () {
                expect($scope.vm.selectedVersion['instance']).toBe($scope.vm.editorService.versions[0]);
            })
        });

        it('should return true', function () {
            expect($scope.vm.changeSelected()).toBe(true);
        })
    });

    describe('loadData()', function () {

        it('should define variables', function () {
            expect($scope.vm.values).toBeDefined();
            expect($scope.vm.val1).toBeDefined();
            expect($scope.vm.versions).toBeDefined();
            expect($scope.vm.liveVersion).toBeDefined();
            expect($scope.vm.requestsCounter).toBe(3);
        });

        describe('configurationService.pkg.getVersions()', function () {
            beforeEach(function () {
                $scope.vm.editorService.instances = ['instance'];
                $scope.vm.loadData();
            });
            it('should call configurationService.pkg.getVersions()', function () {
                expect(configurationService.pkg.getVersions).toHaveBeenCalledWith($state.params.domain, 'instance', $scope.vm.editorService.service);
            });

            describe('after successfull loading', function () {
                beforeEach(function () {
                    deferred1.resolve(responseGetVersions);
                    $scope.$root.$digest();
                });

                it('should get versions', function () {
                    expect($scope.vm.versions).toEqual({instance: ['one']});
                    expect($scope.vm.liveVersion['instance']).toBe('one');
                    expect($scope.vm.selectedVersion['instance']).toBe('one');
                });

                describe('_loadVariables()', function () {
                    it('should call configurationService.pkg.getVariables', function () {
                        expect(configurationService.pkg.getVariables).toHaveBeenCalledWith($state.params.domain, 'instance', $scope.vm.editorService.service, 'one');
                    });

                    describe('after successfull loading', function () {
                        beforeEach(function () {
                            deferred4.resolve(responseGetVariables);
                            $scope.$root.$digest();
                        });

                        it('should set variables', function () {
                            expect($scope.vm.loaded).toBe(true);
                            expect($scope.vm.selectedVersion['instance']).toBe('three');
                            expect($scope.vm.values['varName']['instance']['three']).toBe('name');
                        })
                    });

                    describe('after fail loading', function () {
                        beforeEach(function () {
                            $scope.vm.loaded = false;
                            deferred4.reject({});
                            $scope.$root.$digest();
                        });

                        it('should vm.loaded to be true', function () {
                            expect($scope.vm.loaded).toBe(true);
                        })
                    })
                })
            });
        })
    });

    describe('changeSelectedVersion()', function () {
        it('should change version', function () {
            $scope.vm.changeSelectedVersion('instance', 'two');
            expect($scope.vm.selectedVersion['instance']).toBe('two');
        })
    });

    describe('liveVersion()', function () {
        it('should check live version', function () {
            $scope.vm.liveVersion = {
                'instance': 'three'
            };
            expect($scope.vm.isLive('instance', 'three')).toBe(true);
            expect($scope.vm.isLive('instance', 'four')).toBe(false);
            expect($scope.vm.isLive('instance1', 'three')).toBe(false);
        })
    });

    describe('makeLive()', function () {
        beforeEach(function () {
            $scope.vm.makeLive('instance', 'three');
        });
        it('should call configurationService.pkg.makeLive', function () {
            expect(configurationService.pkg.makeLive).toHaveBeenCalledWith($state.params.domain, 'instance', $scope.vm.editorService, 'three');
        });

        describe('after successfull loading', function () {
            beforeEach(function () {
                $scope.vm.editorService.live = {};
                deferred2.resolve();
                $scope.$root.$digest();
            });

            it('should update editorService live version', function () {
                expect(Notification.success).toHaveBeenCalledWith('Live version for instance has been changed.');
                expect($scope.vm.editorService.live['instance']).toBe('three');
            });
        })
    });

    describe('isSavable()', function () {
        it('true || true equals true', function () {
            $scope.vm.itemsForSave = {id: 'id'};
            $scope.vm.itemsForDelete = {id: 'id'};
            expect($scope.vm.isSavable()).toBe(true);
        });
        it('false || false equals false', function () {
            $scope.vm.itemsForSave = {};
            $scope.vm.itemsForDelete = {};
            expect($scope.vm.isSavable()).toBe(false);
        });
        it('true || false equals true', function () {
            $scope.vm.itemsForSave = {id: 'id'};
            $scope.vm.itemsForDelete = {};
            expect($scope.vm.isSavable()).toBe(true);
        });
    });

    describe('makeCopy()', function () {
        beforeEach(function () {
            $scope.vm.makeCopy();
        });

        it('should open $modal', function () {
            expect($modal.open).toHaveBeenCalled();
        });
    });

    describe('save()', function () {
        beforeEach(function () {
            $scope.vm.itemsForSave = {
                'instance': {
                    'four': 'data'
                }
            };
            $scope.vm.save();

        });
        it('should call configurationService.pkg.save', function () {
            expect(configurationService.pkg.save).toHaveBeenCalledWith($scope.vm.domain.id, 'instance', $scope.vm.editorService.service, 'four', 'data');
        });
        describe('after successfull loading', function () {
            beforeEach(function () {
                deferred3.resolve({data:{}});
                $scope.$root.$digest();
            });

            it('should notificate success', function () {
                expect(Notification.success).toHaveBeenCalledWith('Saved successfully');
            })
        });

        describe('after fail loading', function () {
            beforeEach(function () {
                error.error = 'error';
                deferred3.reject(error);
                $scope.$root.$digest();
            });

            it('should notificate an error', function () {
                expect(Notification.error).toHaveBeenCalledWith('Saving error: ' + error.error);
            })
        })

    });

    describe('updateValues()', function () {
        beforeEach(function () {
            $scope.vm.itemsForSave = {};
            $scope.vm.updateValues('name', 'newValue', 'instance', 'three');
        });
        it('should populate name of item with newValue', function () {
            expect($scope.vm.itemsForSave['instance']).toBeDefined();
            expect($scope.vm.itemsForSave['instance']['three']).toBeDefined();
            expect($scope.vm.itemsForSave['instance']['three']['name']).toBe('newValue');
        });

    });
});
