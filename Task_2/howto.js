'use strict';

var app = angular.module('task-2', []);

app.directive('lastName', function () {
    var USERNAME_REGEXP = /[A-Z][a-z]{2,10}/;

    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$validators.lastName = function (modelValue, viewValue) {
                return USERNAME_REGEXP.test(viewValue);
            };
        }
    }
}).directive('age', function () {
    var AGE_REGEXP = /(1[89])|(2[0-9])|(3[0-9])|(4[0-9])|(5[0-9])|(6[0-5])/;

    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$validators.age = function (modelValue, viewValue) {
                return AGE_REGEXP.test(viewValue);
            };
        }
    }
}).directive('birthday', function () {
    // Date format: MM/DD/YYYY. All months are validated for the correct number of days for that particular month except for February which can be set to 29 days.
    var DATE_REGEXP = /^((((0[13578])|([13578])|(1[02]))[\/](([1-9])|([0-2][0-9])|(3[01])))|(((0[469])|([469])|(11))[\/](([1-9])|([0-2][0-9])|(30)))|((2|02)[\/](([1-9])|([0-2][0-9]))))[\/]\d{4}$/;

    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {
            ctrl.$validators.birthday = function (modelValue, viewValue) {
                var date = viewValue.split('/');
                var year = date[2];

                return !!(DATE_REGEXP.test(viewValue) && _.inRange(year, 1900, 2010));

            };
        }
    }
});