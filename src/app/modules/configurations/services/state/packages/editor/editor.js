(function () {
    'use strict';

    angular
        .module('qorDash.configurations.services.state.packages.editor')
        .controller('PackagesEditorController', packagesEditorController)
        .config(function(NotificationProvider) {
            NotificationProvider.setOptions({
                delay: 5000,
                positionX: 'right',
                positionY: 'bottom'
            });
        });


   function packagesEditorController($scope, $state, API_HOST, $http, Notification, $modal, resolvedDomains, resolvedPackage) {
        var vm = this;

        vm.selectedVersion = {};
        vm.itemsForSave = {};
        vm.newItemsCount = 0;
        vm.values = {};
        vm.requestsCounter = 0;
        vm.versions = {};
        vm.liveVersion = {};

        vm.domain = resolvedDomains.filter(function (domain) {
            return domain.id == $state.params.domain;
        })[0];

        vm.editorService = resolvedPackage[$state.params.service];

        vm.editorService.instances = $state.params.instances.split(',');

        vm.editorService.instances.forEach(function (instance) {
            vm.selectedVersion[instance] = vm.editorService.versions[0];
        });

        // Versions that doesn't exist
        vm.deletedVersions = {};

        vm.isVersionDeleted = isVersionDeleted;
        vm.changeSelected = changeSelected;
        vm.loadData = loadData;
        vm.changeSelectedVersion = changeSelectedVersion;
        vm.isLive = isLive;
        vm.makeLive = makeLive;
        vm.isSavable = isSavable;
        vm.makeCopy = makeCopy;
        vm.save = save;
        vm.updateValues = updateValues;

        vm.loadData();

        function isVersionDeleted(instance, version) {
            if (!vm.deletedVersions[instance]) {
                return false;
            } else {
                for (var i in vm.deletedVersions[instance]) {
                    if (vm.deletedVersions[instance][i] == version) {
                        return true;
                    }
                }
            }
            return false;
        }

        function changeSelected(instance, version) {
            if (vm.isVersionDeleted(instance, vm.selectedVersion[instance])) {
                for (var i in vm.editorService.versions) {
                    if (!vm.isVersionDeleted(instance, vm.editorService.versions[i])) {
                        vm.selectedVersion[instance] = vm.editorService.versions[i];
                    }
                }
            }
            return true;
        }


        /**
         * Download and write all version variables
         */
        function loadData() {
            vm.values = {};
            vm.val1 = {};
            vm.versions = {};
            vm.liveVersion = {};

            vm.editorService.instances.forEach(function (instance) {
                var loadVersionsRequest = {
                    method: 'GET',
                    url: API_HOST + '/v1/pkg/' + $state.params.domain + '/' + instance + '/' + vm.editorService.service + '/',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                vm.requestsCounter++;
                $http(loadVersionsRequest).then(
                    function(response) {
                        vm.requestsCounter--;
                        for (var i in response.data) {
                            if (!vm.versions[instance]) {
                                vm.versions[instance] = [];
                            }

                            vm.versions[instance].push(i);
                            if (response[i]) {
                                vm.liveVersion[instance] = i;
                                vm.selectedVersion[instance] = i;
                            }
                        }

                        _loadVariables(instance);
                    });
            });

            function _loadVariables(instance) {
                for (var i in vm.versions[instance]) {
                    var version = vm.versions[instance][i];
                    var request = {
                        method: 'GET',
                        url: API_HOST + '/v1/pkg/' + $state.params.domain + '/' + instance + '/' + vm.editorService.service + '/' + version,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    };

                    vm.requestsCounter++;
                    $http(request).then(
                        function (response) {
                            vm.requestsCounter--;
                            vm.loaded = true;

                            var splitedUrl = response.config.url.split('/');

                            var version = splitedUrl[splitedUrl.length - 1],
                                instance = splitedUrl[splitedUrl.length - 3];

                            vm.selectedVersion[instance] = version;

                            for (var varName in response.data) {
                                if (!vm.values[varName]) {
                                    vm.values[varName] = {};
                                }

                                if (!vm.values[varName][instance]) {
                                    vm.values[varName][instance] = {};
                                }

                                vm.values[varName][instance][version] = response.data[varName];
                            }
                        },
                        function (response) {
                            vm.requestsCounter--;

                            vm.loaded = true;
                        }
                    );
                }
            }
        }

        /**
        * Change selected version in the table header
        * @param instance Instance name for version change
        * @param newVersion version to change
        */
        function changeSelectedVersion(instance, newVersion) {
           vm.selectedVersion[instance] = newVersion;
        }

        /**
        * Checks that version in instance has live status
        */
        function isLive(instance, version) {
           return vm.liveVersion[instance] == version;
        }

        function makeLive(instance, version) {
            $('span[instance='+instance+'].set-live-button').addClass('loading').text('Loading...');

            var postRequest = {
                method: 'POST',
                url: API_HOST + '/v1/pkg/' + $state.params.domain + '/' + instance + '/' + vm.editorService.service + '/' + version + '/live',
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            $http(postRequest).then(
                function(response) {
                    Notification.success('Live version for ' + instance + ' has been changed.');
                    $('span[instance='+instance+'].set-live-button').removeClass('loading').text('Set live');
                    vm.editorService.live[instance] = version;
                },
                function(response) {
                    $('span[instance='+instance+'].set-live-button').removeClass('loading').text('Set live');
                }
            );
        }

        /**
         * Checks that we have something to save (using for displaying save button)
         * @returns {boolean}
         */
        function isSavable() {
            return !isEmpty(vm.itemsForSave) || !isEmpty(vm.itemsForDelete);
        }

        function makeCopy(instance, version) {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'newVersionModal.html',
                controller: function($scope, $modalInstance, version, instance, instances) {
                    $scope.newVersionName = '';

                    $scope.version = version;
                    $scope.instance = instance;
                    $scope.instances = instances;

                    $scope.targetInstance = '';

                    $scope.ok = function () {
                        if (!$scope.newVersionName || !$scope.targetInstance) {
                            return;
                        }
                        save($scope.newVersionName, $scope.targetInstance, $modalInstance);
                    };

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                },
                resolve: {
                    version: function() {
                        return version;
                    },
                    instance: function() {
                        return instance;
                    },
                    instances: function() {
                        return $scope.service.instances;
                    }
                }
            });

            var save = function(newVersionName, targetInstance, $modalInstance) {
                if (!newVersionName || !targetInstance) {
                    return;
                }

                var data = {};

                for (var i in $scope.values) {
                    if (!$scope.values[i][instance] || !$scope.values[i][instance][version]) {
                        continue;
                    }
                    data[i] = $scope.values[i][instance][version];
                }

                $('#config-modal-ok-button').button('loading');

                var postRequest = {
                    method: 'POST',
                    url: API_HOST + '/v1/pkg/' + $state.params.domain + '/' + targetInstance + '/' + $scope.editorService.service + '/' + newVersionName,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: data
                };

                $http(postRequest).then(
                    function(response) {
                        $scope.editorService.versions.push(newVersionName);
                        for (var i in $scope.deletedVersions) {
                            if (i != targetInstance) {
                                $scope.deletedVersions[i].push(newVersionName);
                            }
                        }

                        for (i in data) {
                            $scope.values[i][targetInstance][newVersionName] = $scope.values[i][instance][version];
                        }

                        $scope.changeSelectedVersion(targetInstance, newVersionName);

                        Notification.success('Copy created');

                        $modalInstance.close();
                    },
                    function(response) {
                        $('#config-modal-ok-button').button('reset');
                    }
                );
            };
        }

        /**
         * Listener for save button
         */
        function save() {
            $('#env-save-button').button('loading');
            for (var instance in vm.itemsForSave) {
                var versions = $scope.itemsForSave[instance];
                for (var version in versions) {
                    var data = $scope.itemsForSave[instance][version];
                    var request = {
                        method: 'PUT',
                        url: API_HOST + '/v1/pkg/' + $scope.domain.id + '/' + instance + '/' + $scope.editorService.service + '/' + version,
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        data: data
                    };

                    $http(request).then(
                        function (response) {
                            Notification.success('Saved successfully');
                            $('#env-save-button').button('reset');
                        },
                        function (responce) {
                            Notification.error('Saving error: ' + error.error);
                            $('#env-save-button').button('reset');
                        }
                    );
                }
            }

            vm.itemsForSave = {};
        }


        /**
         * Calling after editing of some variable
         * @param name name of the edited variable
         * @param newValue
         * @param instance
         * @param version
         */
        function updateValues(name, newValue, instance, version) {
            if (!vm.itemsForSave[instance]) {
                vm.itemsForSave[instance] = [];
            }

            if (!vm.itemsForSave[instance][version]) {
                vm.itemsForSave[instance][version] = {};
            }

            vm.itemsForSave[instance][version][name] = newValue;
        }

        /**
        * Checks that candidate is exist in instance array of current selected service
        * @param candidate Value to check
        * @returns {boolean}
        */
        function isInstance(candidate) {
           for (var i in vm.editorService.instances) {
               if (vm.editorService.instances[i] == candidate) {
                   return true;
               }
           }
           return false
        }

        var hasOwnProperty = Object.prototype.hasOwnProperty;

        function isEmpty(obj) {

           if (obj == null) return true;

           if (obj.length > 0)    return false;
           if (obj.length === 0)  return true;

           for (var key in obj) {
               if (hasOwnProperty.call(obj, key)) return false;
           }

           return true;
        }

        Object.filter = function( obj, predicate) {
           var key;

           for (key in obj) {
               if (obj.hasOwnProperty(key) && predicate(key)) {
                   return obj[key];
               }
           }
        };
    }
})();
