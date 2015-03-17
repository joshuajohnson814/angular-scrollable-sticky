(function() {
  'use strict';

  var module = angular.module('angular-scrollable-sticky', []);

  module.directive('dbSticky', dbSticky);

  function dbSticky($rootScope, $timeout, $window, $document, eventsConstants) {
    var directive = {
      link: link,
      restrict: 'A'
    };

    return directive;

    function link($scope, $element, $attrs) {
      var stickyClass, elem, initialCSS, initialStyle, isSticking,
          stickyLine, scrollContainer, scrollContainerOffset, prevOffset;

      isSticking = false;
      elem = $element[0];

      stickyClass = $attrs.stickyClass || '';

      initialStyle = $element.attr('style');

      scrollContainer = getScrollContainer();
      scrollContainerOffset = scrollContainer.getBoundingClientRect().top;

      initialCSS = {
        top:       $element.css('top'),
        width:     $element.css('width'),
        position:  $element.css('position'),
        marginTop: $element.css('margin-top'),
        cssLeft:   $element.css('left')
      };

      prevOffset = getTopOffset(elem);

      $scope.$on(eventsConstants.SCROLL_EVENT, onScroll);
      $scope.$on(eventsConstants.RESIZE_EVENT, onResize);

      function onResize() {
        initialCSS.offsetWidth = elem.offsetWidth;
        if (isSticking && elem.parentElement) {
          $element.css('width', elem.parentElement.offsetWidth + 'px');
        }

        onChangeEvent();
      }

      function onScroll() {
        onChangeEvent();
      }

      function onChangeEvent() {
        if (!isSticking) {
          prevOffset = getTopOffset(elem);
          stickyLine = prevOffset - scrollContainerOffset;
        }

        checkIfShouldStick();
      }

      function checkIfShouldStick() {
        var scrollDistance, shouldStick;

        scrollDistance = scrollContainer.scrollTop;
        shouldStick = scrollDistance >=  stickyLine;

        if (shouldStick && !isSticking) {
          stickElement();
        } else if (!shouldStick && isSticking) {
          unstickElement();
        }
      }

      function stickElement() {
        var rect, absoluteLeft;

        rect = elem.getBoundingClientRect();
        absoluteLeft = rect.left;

        initialCSS.offsetWidth = elem.offsetWidth;

        isSticking = true;

        if (stickyClass) {
          $element.addClass(stickyClass);
        }

        $element
          .css('width',      elem.offsetWidth + 'px')
          .css('position',   'fixed')
          .css('top',        scrollContainerOffset + 'px')
          .css('left',       absoluteLeft)
          .css('margin-top', 0);
      }

      function unstickElement() {
        $element.attr('style', $element.initialStyle);
        isSticking = false;

        if (stickyClass) {
          $element.removeClass(stickyClass);
        }

        $element
          .css('width',      '')
          .css('top',        initialCSS.top)
          .css('position',   initialCSS.position)
          .css('left',       initialCSS.cssLeft)
          .css('margin-top', initialCSS.marginTop);
      }

      function getScrollContainer() {
        var checkElement = elem;

        do {
          if (checkElement.hasAttribute('db-scrollable')) {
            return checkElement;
          }

          checkElement = checkElement.parentElement;

        } while (checkElement);

        return $document[0].body;
      }

      function getTopOffset(element) {
        var pixels = 0;

        if (element.offsetParent) {
          do {
            pixels += element.offsetTop;
            element = element.offsetParent;
          } while (element);
        }

        return pixels;
      }
    }
  }
})();
