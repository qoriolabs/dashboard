describe('Controller: DockerInfoEventsController', function() {

    var $scope,
        resolvedDockerInfo = [{1:2}],
        resolvedSystemInfo = [{1:2}],
        Settings = {url: 'url'},
        Messages,
        $timeout,
        q,
        deferred,
        Oboe,
        node = {node: 'node'};

    beforeEach(function(){
        module('qorDash.docker.domain.dockers.menu.info.events');
        module(function($provide) {
            $provide.service("Messages", function(){
                this.error = jasmine.createSpy('error').and.callFake(function(){});
            });
        });
        Oboe = jasmine.createSpy().and.callFake(function () {
            deferred = q.defer();
            return deferred.promise;
        })
    });

    beforeEach(function () {
        inject(function(_$rootScope_, _$controller_, _Messages_, $q, _$timeout_)  {
            q = $q;
            $timeout = _$timeout_;
            Messages = _Messages_;
            $scope = _$rootScope_.$new();
            _$controller_('DockerInfoEventsController as vm', {$scope: $scope, $timeout: $timeout, Settings: Settings, Oboe: Oboe});

        })
    });

    describe('updateEvents()', function(){
        it('should define dockerEvents', function () {
            expect($scope.vm.dockerEvents).toBeDefined();
        });

        it('should call Oboe()', function () {
            expect(Oboe).toHaveBeenCalledWith({
                url: 'url/events?since=' + Math.floor($scope.vm.model.since.getTime() / 1000) + '&'+ 'until=' + Math.floor($scope.vm.model.until.getTime() / 1000),
                pattern: '{id status time}'
            });
        });

        describe('after successfull calling', function () {
            beforeEach(function () {
                deferred.resolve({});
                $scope.$root.$digest();
            });

            it('should call $scope.$apply after finishing loading', function () {
                spyOn($scope, '$apply').and.callThrough();
                $timeout.flush();
                expect($scope.$apply).toHaveBeenCalled();
            })
        });

        describe('after fail calling', function () {
            beforeEach(function () {
                deferred.reject({data: 'error'});
                $scope.$root.$digest();
            });

            it('should call Messages.error', function () {
                expect(Messages.error).toHaveBeenCalledWith("Failure", 'error');
            })
        });

        describe('after receiving node', function () {
            beforeEach(function () {
                deferred.notify(node);
                $scope.$root.$digest();
            });

            it('should push node to $scope.vm.dockerEvents', function () {
                expect($scope.vm.dockerEvents).toEqual([node]);
            });
        });

    });
});
