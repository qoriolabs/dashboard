describe('Controller: DockerSummaryController', function() {

    var $scope,
        resolvedContainers = [{Status: 'id'}],
        resolvedImages = {1: 2},
        DockerViewModel;

    beforeEach(function(){
        module('qorDash.docker.domain.dockers.menu.summary');
        module(function($provide) {
            $provide.service("DockerViewModel", function(){
                this.container = jasmine.createSpy('container').and.callFake(function(item){return item});
            });
        });
    });

    beforeEach(function () {
        inject(function(_$rootScope_, _$controller_, _DockerViewModel_)  {
            DockerViewModel = _DockerViewModel_;
            $scope = _$rootScope_.$new();
            _$controller_('DockerSummaryController as vm', {$scope: $scope, resolvedContainers: resolvedContainers, resolvedImages: resolvedImages, DockerViewModel: DockerViewModel});

        })
    });

    describe('after loading', function(){
        it('should define variables', function () {
            expect($scope.vm.predicate).toBe('-Created');
            expect($scope.vm.totalContainers).toBe(resolvedContainers);
            expect($scope.vm.totalImages).toBe(resolvedImages);
            expect($scope.vm.colours).toEqual(["#5bb75b", "#C7604C", "#E2EAE9"]);
            expect($scope.vm.labels).toEqual(["Running", "Stopped", "Ghost"]);
            expect($scope.vm.series).toEqual(["Running", "Stopped", "Ghost"]);
            expect($scope.vm.dataset).toEqual([1,0,0]);
            expect($scope.vm.containers).toEqual(resolvedContainers);
        });
    });
});
