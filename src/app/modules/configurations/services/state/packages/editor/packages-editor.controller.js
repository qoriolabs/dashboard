(function () {
    'use strict';

    angular
        .module('qorDash.configurations.services.state.packages.editor')
        .controller('PackagesEditorController', packagesEditorController);


   function packagesEditorController($state, configurationService, Notification, $modal, resolvedDomains, resolvedPackage) {
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
                return false;
            }
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
                vm.requestsCounter++;
                configurationService.pkg.getVersions($state.params.domain, instance, vm.editorService.service).then(
                    function(response) {
                        vm.requestsCounter--;
                        for (var i in response) {
                            if (!vm.versions[instance]) {
                                vm.versions[instance] = [];
                            }
                            vm.versions[instance].push(i);
                            if (response[i] || i == Object.keys(response)[Object.keys(response).length - 1]) {
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

                    vm.requestsCounter++;
                    configurationService.pkg.getVariables($state.params.domain, instance, vm.editorService.service, version).then(
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
                        }
                    )
                        .catch(function (response) {
                            vm.requestsCounter--;

                            vm.loaded = true;
                        });
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
            configurationService.pkg.makeLive($state.params.domain, instance, vm.editorService, version).then(
                function() {
                    Notification.success('Live version for ' + instance + ' has been changed.');
                    vm.editorService.live[instance] = version;
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
                controller: function($modalInstance, version, instance, instances) {
                    var vm = this;

                    vm.newVersionName = '';

                    vm.version = version;
                    vm.instance = instance;
                    vm.instances = instances;

                    vm.targetInstance = '';

                    vm.ok = function () {
                        if (!vm.newVersionName || !vm.targetInstance) {
                            return;
                        }
                        save(vm.newVersionName, vm.targetInstance, $modalInstance);
                    };

                    vm.cancel = function () {
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
                        return vm.service.instances;
                    }
                }
            });

            var save = function(newVersionName, targetInstance, $modalInstance) {
                if (!newVersionName || !targetInstance) {
                    return;
                }

                var data = {};

                for (var i in vm.values) {
                    if (!vm.values[i][instance] || !vm.values[i][instance][version]) {
                        continue;
                    }
                    data[i] = vm.values[i][instance][version];
                }

                configurationService.pkg.saveCopy($state.params.domain, targetInstance, vm.editorService.service, newVersionName, data).then(
                    function() {
                        vm.editorService.versions.push(newVersionName);
                        for (var i in vm.deletedVersions) {
                            if (i != targetInstance) {
                                vm.deletedVersions[i].push(newVersionName);
                            }
                        }

                        for (i in data) {
                            vm.values[i][targetInstance][newVersionName] = vm.values[i][instance][version];
                        }

                        vm.changeSelectedVersion(targetInstance, newVersionName);

                        Notification.success('Copy created');

                        $modalInstance.close();
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
                var versions = vm.itemsForSave[instance];
                for (var version in versions) {
                    var data = vm.itemsForSave[instance][version];
                    configurationService.pkg.save(vm.domain.id, instance, vm.editorService.service, version, data)
                        .then(function (response) {
                            Notification.success('Saved successfully');
                        })
                        .catch(function (responce) {
                            Notification.error('Saving error: ' + error.error);
                        });
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
