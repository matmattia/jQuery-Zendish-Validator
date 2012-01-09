/**
 * jQuery Zendish Validator
 * @name jzvalidaotr.js
 * @author Mattia - http://www.matriz.it
 * @version 1.0
 * @date January 9, 2012
 * @category jQuery plugin
 * @copyright (c) 2012 Mattia at Matriz.it (info@matriz.it)
 * @license MIT - http://opensource.org/licenses/mit-license.php
 * @example Visit http://www.matriz.it/projects/jquery-zendish-validator/ for more informations about this jQuery plugin
 */

(function($) {
	var options = {
		'onFieldError': null,
		'onFieldSuccess': null,
		'onSubmit': null,
		'onSubmitError': null
	};
	
	var methods = {
		'emailaddress': function(val, el) {
			return val.search(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i) != -1;
		},
		'greaterthan': function(val, el) {
			var min = 0;
			var n = getParam(el, 'greaterthan', 'min');
			if (!isNaN(n)) {
				min = parseInt(n);
			}
			return val > min;
		},
		'lessthan': function(val, el) {
			var max = false;
			var n = getParam(el, 'lessthan', 'max');
			if (!isNaN(n)) {
				max = parseInt(n);
			}
			return max === false || val < max;
		},
		'int': function(val, el) {
			return !isNaN(val) && parseInt(val) == val;
		},
		'float': function(val, el) {
			return !isNaN(val);
		},
		'stringlength': function(val, el) {
			var min = 0;
			var n = getParam(el, 'stringlength', 'min');
			if (!isNaN(n)) {
				min = parseInt(n);
			}
			var max = getParam(el, 'stringlength', 'max');
			if (max !== false) {
				max = isNaN(max) ? false : parseInt(max);
			}
			var l = val.length;
			return l >= min && (max === false || l <= max);
		}
	};
	
	var checkElement = function(el) {
		var check = true;
		el = $(el);
		var val = el.val();
		if ($.trim(val) == '') {
			check = false;
		} else if (el.get(0).tagName.toLowerCase() == 'input' && el.attr('type') == 'checkbox' && !el.attr('checked')) {
			check = false;
		} else {
			var classes = el.attr('class').split(' ');
			var classes_length = classes.length;
			for (var i = 0; i < classes_length; i++) {
				var class_length = classes[i].length;
				if (class_length > 9 && classes[i].substring(0, 9) == 'required_') {
					var method = classes[i].substring(9, class_length);
					if (methods[method] && !methods[method].call(null, val, el)) {
						check = false;
						break;
					}
				}
			}
		}
		if (check && $.isFunction(options.onFieldSuccess)) {
			options.onFieldSuccess.call(null, el);
		} else if (!check && $.isFunction(options.onFieldError)) {
			options.onFieldError.call(null, el);
		}
		return check;
	};
	
	var getParams = function(el, validator) {
		var params = {};
		var rel = $(el).attr('rel');
		if (rel) {
			rel = rel.split(' ');
			var rel_length = rel.length;
			for (var i = 0; i < rel_length; i++) {
				var l = rel[i].length;
				var pre = 'param_'+validator+'_';
				var pre_length = pre.length;
				if (l > pre_length && rel[i].substring(0, pre_length) == pre) {
					var param = rel[i].substring(pre_length, l);
					var p = param.indexOf('_');
					if (p > -1) {
						params[param.substring(0, p)] = param.substring(p + 1, param.length);
					}
				}
			}
		}
		return params;
	};
	
	var getParam = function(el, validator, param) {
		var params = getParams(el, validator);
		return params[param] ? params[param] : false;
	};
	
	$.fn.validate = function(opt) {
		$.extend(options, opt);
		var fields = this.find('.required');
		this.bind('submit', function() {
			var send = true;
			var fields_length = fields.length;
			for (var i = 0; i < fields_length; i++) {
				if (!checkElement(fields[i])) {
					send = false;
				}
			}
			if (send && $.isFunction(options.onSubmit)) {
				options.onSubmit.call(this);
			} else if (!send && $.isFunction(options.onSubmitError)) {
				options.onSubmitError.call(this);
			}
			return send;
		});
		fields.each(function(i, el) {
			el = $(el);
			var tn = el.get(0).tagName.toLowerCase();
			if (tn == 'select' || (tn == 'input' && el.attr('type') == 'checkbox')) {
				el.change(function() {
					checkElement(this);
				});
			}
			el.blur(function() {
				checkElement(this);
			});
		});
		return this;
	};
})(jQuery);