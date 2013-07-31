(function ($, doc) {
  'user strict';
  if (typeof Object.create !== 'function') {
    Object.create = function (o) {
      function F() {}
      F.prototype = o;
      return new F();
    };
  }
  ShapeMap = function (el, options) {
    var that = this,
      wHCursor = 10;
    this.el = $(el);
    this.pointStart = {};
    this.pressed = false;
    this.tmpArea = null;
    this.options = $.extend({
      maxWith: this.el.width(),
      maxHeight: this.el.height(),
      minHeight: 1,
      minWidth: 1,
      shape: 'rect' // rect/circle/poly
    }, options);
    this.el
      .css('position', 'relative')
      .on('mousedown', function (e) {
        that.pressed = true;
        that.tmpArea = that.createArea(that.options.shape, {
          x: e.pageX - wHCursor,
          y: e.pageY - wHCursor
        });
      })
      .on('mouseup', function (e) {
        that.pressed = false;
      })
      .on('mouseleave', function () {
        that.pressed = false;
        that.el.trigger('mouseup');
      })
      .on('mousemove', function (e) {
        if (that.pressed) {
          that.tmpArea.resize({
            width: Math.abs(that.pointStart.x - e.pageX) - wHCursor,
            height: Math.abs(that.pointStart.y - e.pageY) - wHCursor,
            x: that.pointStart.x,
            y: that.pointStart.y
          });
        }
      }).attr('unselectable', 'on')
      .css('user-select', 'none')
      .on('selectstart', false);
  };
  ShapeMap.prototype = {
    constructor: ShapeMap,
    createArea: function (shape, point) {
      var area;
      $.extend(this.pointStart, point);
      switch (shape) {
      case 'rect':
      default:
        area = new Rect(this.pointStart);
        break;
      case 'circle':
        area = new Circle(this.pointStart);
        break;
      }
      area.el.appendTo(this.el);
      return area;
    }
  };
  Area = function (point) {
    this.x = point.x;
    this.y = point.y;
    this.width = point.width;
    this.height = point.height;
  };
  Area.prototype = {
    constructor: Area,
    destroy: function () {
      this.el.remove();
      this.el.off();
      this.el = null;
    },
    _tdc: function (coords) {
      var out = $.extend({}, coords);
      out.left = out.x;
      out.top = out.y;
      delete out.y;
      delete out.x;
      return out;
    },
    resize: function (point) {
      this.el.css(this._tdc(point));
    }
  };
  Rect = function (point) {
    Area.apply(this, arguments);
    this.el = $('<div class="ui-area" />')
      .css('position', 'absolute')
      .css(point);
  };
  Rect.prototype = Object.create(Area.prototype, {
    constructor: Rect
  });
  $.fn.ShapeMap = function (options) {
    return this.each(function () {
      var el = $(this),
        api = el.data('api');
      if (api)
        return api;
      el.data('api', new ShapeMap(this, options));
    });
  };
}(window.jQuery, window.doc));